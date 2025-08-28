import stripe
import logging
from django.conf import settings
from django.utils import timezone
from .models import Payment
from orders.models import Order

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

logger = logging.getLogger(__name__)

class StripeService:
    """
    Service class to handle Stripe payment operations
    """
    
    @staticmethod
    def create_payment_intent(order, user):
        """
        Create a Stripe Payment Intent for an order
        """
        try:
            # Check if there's already a pending payment for this order
            existing_payment = Payment.objects.filter(
                order=order,
                user=user,
                status='pending'
            ).first()
            
            if existing_payment and existing_payment.stripe_payment_intent_id:
                # Try to retrieve the existing payment intent from Stripe
                try:
                    intent = stripe.PaymentIntent.retrieve(existing_payment.stripe_payment_intent_id)
                    if intent.status in ['requires_payment_method', 'requires_confirmation', 'requires_action']:
                        logger.info(f"Returning existing payment intent for order: {order.id}")
                        return existing_payment, intent
                    else:
                        # Intent is no longer usable, delete the payment record
                        existing_payment.delete()
                except stripe.error.StripeError:
                    # Intent doesn't exist in Stripe, delete the payment record
                    existing_payment.delete()
            
            # Calculate amount in cents (Stripe requirement)
            amount_cents = int(order.total_amount * 100)
            
            # Create payment intent
            intent = stripe.PaymentIntent.create(
                amount=amount_cents,
                currency='usd',
                metadata={
                    'order_id': order.id,
                    'user_id': user.id,
                    'order_number': order.order_number,
                }
            )
            
            # Create Payment record
            payment = Payment.objects.create(
                order=order,
                user=user,
                amount=order.total_amount,
                currency='USD',
                payment_method='stripe',
                stripe_payment_intent_id=intent.id,
                stripe_client_secret=intent.client_secret,
                status='pending'
            )
            
            return payment, intent
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error creating payment intent: {e}")
            raise Exception(f"Payment processing error: {str(e)}")
        except Exception as e:
            logger.error(f"Error creating payment intent: {e}")
            raise
    
    @staticmethod
    def confirm_payment(payment_intent_id):
        """
        Confirm payment and update order status
        """
        try:
            # Retrieve payment intent from Stripe
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            
            # Find payment record
            payment = Payment.objects.get(stripe_payment_intent_id=payment_intent_id)
            
            if intent.status == 'succeeded':
                payment.status = 'succeeded'
                payment.paid_at = timezone.now()
                payment.save()
                
                # Update order
                order = payment.order
                order.is_paid = True
                order.payment_date = timezone.now()
                order.status = 'confirmed'
                order.save()
                
                # Clear user's cart after successful payment
                from cart.models import Cart
                try:
                    user_cart = Cart.objects.get(user=payment.user)
                    user_cart.items.all().delete()
                    user_cart.promo_code = None
                    user_cart.discount_amount = 0
                    user_cart.save()
                    logger.info(f"Cart cleared for user {payment.user.id} after successful payment")
                except Cart.DoesNotExist:
                    logger.info(f"No cart found for user {payment.user.id}")
                
                return payment, True
            else:
                payment.status = 'failed'
                payment.failure_reason = f"Payment intent status: {intent.status}"
                payment.save()
                return payment, False
                
        except Payment.DoesNotExist:
            logger.error(f"Payment not found for intent: {payment_intent_id}")
            raise Exception("Payment record not found")
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error confirming payment: {e}")
            raise Exception(f"Payment confirmation error: {str(e)}")
        except Exception as e:
            logger.error(f"Error confirming payment: {e}")
            raise
    
    @staticmethod
    def create_refund(payment, amount=None, reason=None):
        """
        Create a refund for a payment
        """
        try:
            if payment.status != 'succeeded':
                raise Exception("Can only refund succeeded payments")
            
            refund_amount = int((amount or payment.amount) * 100)
            
            refund = stripe.Refund.create(
                payment_intent=payment.stripe_payment_intent_id,
                amount=refund_amount,
                reason=reason or 'requested_by_customer'
            )
            
            payment.status = 'refunded'
            payment.refund_reason = reason
            payment.save()
            
            # Update order status
            order = payment.order
            order.status = 'cancelled'
            order.save()
            
            return refund
            
        except stripe.error.StripeError as e:
            logger.error(f"Stripe error creating refund: {e}")
            raise Exception(f"Refund error: {str(e)}")
        except Exception as e:
            logger.error(f"Error creating refund: {e}")
            raise

    @staticmethod
    def handle_webhook_event(event):
        """
        Handle Stripe webhook events
        """
        try:
            event_type = event['type']
            logger.info(f"Processing webhook event: {event_type}")
            
            if event_type == 'payment_intent.succeeded':
                payment_intent = event['data']['object']
                payment_intent_id = payment_intent['id']
                
                # Find the payment record
                try:
                    payment = Payment.objects.get(stripe_payment_intent_id=payment_intent_id)
                    
                    # Only update if payment is still pending to avoid duplicate processing
                    if payment.status == 'pending':
                        payment.status = 'succeeded'
                        payment.paid_at = timezone.now()
                        payment.save()
                        
                        # Update order
                        order = payment.order
                        if order.status == 'pending':
                            order.is_paid = True
                            order.payment_date = timezone.now()
                            order.status = 'confirmed'
                            order.save()
                            
                            # Clear user's cart after successful payment
                            from cart.models import Cart
                            try:
                                user_cart = Cart.objects.get(user=payment.user)
                                user_cart.items.all().delete()
                                user_cart.promo_code = None
                                user_cart.discount_amount = 0
                                user_cart.save()
                                logger.info(f"Cart cleared for user {payment.user.id} via webhook")
                            except Cart.DoesNotExist:
                                logger.info(f"No cart found for user {payment.user.id}")
                        
                        logger.info(f"Payment {payment.payment_id} successfully processed via webhook")
                    else:
                        logger.info(f"Payment {payment.payment_id} already processed, skipping webhook")
                        
                except Payment.DoesNotExist:
                    logger.error(f"Payment not found for intent: {payment_intent_id}")
                    
            elif event_type == 'payment_intent.payment_failed':
                payment_intent = event['data']['object']
                payment_intent_id = payment_intent['id']
                
                try:
                    payment = Payment.objects.get(stripe_payment_intent_id=payment_intent_id)
                    payment.status = 'failed'
                    payment.failure_reason = payment_intent.get('last_payment_error', {}).get('message', 'Payment failed')
                    payment.save()
                    
                    logger.info(f"Payment {payment.payment_id} marked as failed via webhook")
                    
                except Payment.DoesNotExist:
                    logger.error(f"Payment not found for failed intent: {payment_intent_id}")
                    
            else:
                logger.info(f"Unhandled webhook event type: {event_type}")
                
        except Exception as e:
            logger.error(f"Error processing webhook event: {e}")
            raise
