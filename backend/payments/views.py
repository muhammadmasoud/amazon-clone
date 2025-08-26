from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.http import HttpResponse
from django.conf import settings
import stripe
import json
import logging

from .models import Payment
from .serializers import (
    PaymentSerializer, 
    CreatePaymentIntentSerializer, 
    ConfirmPaymentSerializer
)
from .services import StripeService
from orders.models import Order

logger = logging.getLogger(__name__)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def create_payment_intent(request):
    """
    Create a Stripe Payment Intent for an order
    """
    try:
        serializer = CreatePaymentIntentSerializer(
            data=request.data,
            context={'request': request}
        )
        
        if not serializer.is_valid():
            return Response(
                {'error': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order_id = serializer.validated_data['order_id']
        
        # Handle cart checkout vs existing order
        if order_id == 'cart-checkout':
            # Create order from cart items
            from cart.models import CartItem, Cart
            
            # Get or create cart for user
            try:
                cart = Cart.objects.get(user=request.user)
                cart_items = CartItem.objects.filter(cart=cart)
            except Cart.DoesNotExist:
                return Response(
                    {'error': 'No cart found for user'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            if not cart_items.exists():
                return Response(
                    {'error': 'No items in cart'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Calculate total from cart
            total_amount = sum(item.quantity * item.product.unit_price for item in cart_items)
            
            # Create order from cart
            try:
                order = Order.objects.create(
                    user=request.user,
                    total_amount=total_amount,
                    status='pending',
                    shipping_address=''  # Will be updated when order is confirmed
                )
                logger.info(f"Order created: {order.id} for user: {request.user.id}")
            except Exception as e:
                logger.error(f"Error creating order: {e}")
                return Response(
                    {'error': f'Failed to create order: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            # Add order items
            from orders.models import OrderItem
            try:
                for cart_item in cart_items:
                    OrderItem.objects.create(
                        order=order,
                        product=cart_item.product,
                        quantity=cart_item.quantity,
                        price=cart_item.product.unit_price
                    )
                logger.info(f"Created {cart_items.count()} order items for order: {order.id}")
            except Exception as e:
                logger.error(f"Error creating order items: {e}")
                # Clean up order if item creation fails
                order.delete()
                return Response(
                    {'error': f'Failed to create order items: {str(e)}'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
        else:
            # Get existing order
            try:
                order = Order.objects.get(id=order_id, user=request.user)
            except Order.DoesNotExist:
                return Response(
                    {'error': 'Order not found'},
                    status=status.HTTP_404_NOT_FOUND
                )
        
        # Create payment intent
        try:
            logger.info(f"Creating payment intent for order: {order.id}, amount: {order.total_amount}")
            payment, intent = StripeService.create_payment_intent(order, request.user)
            logger.info(f"Payment intent created successfully: {payment.payment_id}")
        except Exception as e:
            logger.error(f"Error creating payment intent: {e}")
            return Response(
                {'error': f'Payment processing error: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        
        return Response({
            'payment_id': payment.payment_id,
            'client_secret': payment.stripe_client_secret,
            'amount': float(payment.amount),
            'currency': payment.currency,
            'order_number': order.order_number,
            'order_id': order.id,
        }, status=status.HTTP_201_CREATED)
        
    except Exception as e:
        logger.error(f"Error creating payment intent: {e}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def confirm_payment(request):
    """
    Confirm a payment after successful Stripe processing
    """
    try:
        serializer = ConfirmPaymentSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(
                {'error': serializer.errors},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        payment_intent_id = serializer.validated_data['payment_intent_id']
        payment_id = serializer.validated_data['payment_id']
        
        # Verify payment belongs to current user
        payment = Payment.objects.get(
            payment_id=payment_id,
            user=request.user
        )
        
        # Confirm payment
        payment, success = StripeService.confirm_payment(payment_intent_id)
        
        if success:
            return Response({
                'message': 'Payment confirmed successfully',
                'payment': PaymentSerializer(payment).data,
                'order_status': payment.order.status,
            }, status=status.HTTP_200_OK)
        else:
            return Response({
                'error': 'Payment confirmation failed',
                'payment': PaymentSerializer(payment).data,
            }, status=status.HTTP_400_BAD_REQUEST)
            
    except Payment.DoesNotExist:
        return Response(
            {'error': 'Payment not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except Exception as e:
        logger.error(f"Error confirming payment: {e}")
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def payment_status(request, payment_id):
    """
    Get payment status
    """
    try:
        payment = Payment.objects.get(
            payment_id=payment_id,
            user=request.user
        )
        
        return Response({
            'payment': PaymentSerializer(payment).data,
            'order': {
                'order_number': payment.order.order_number,
                'status': payment.order.status,
                'total_amount': float(payment.order.total_amount),
            }
        }, status=status.HTTP_200_OK)
        
    except Payment.DoesNotExist:
        return Response(
            {'error': 'Payment not found'},
            status=status.HTTP_404_NOT_FOUND
        )

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_payments(request):
    """
    Get all payments for the current user
    """
    payments = Payment.objects.filter(user=request.user)
    serializer = PaymentSerializer(payments, many=True)
    
    return Response({
        'payments': serializer.data
    }, status=status.HTTP_200_OK)

@csrf_exempt
@require_http_methods(["POST"])
def stripe_webhook(request):
    """
    Handle Stripe webhook events
    """
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    endpoint_secret = settings.STRIPE_WEBHOOK_SECRET
    
    try:
        if endpoint_secret:
            # Verify webhook signature
            event = stripe.Webhook.construct_event(
                payload, sig_header, endpoint_secret
            )
        else:
            # For development - parse without verification
            event = json.loads(payload)
        
        # Handle the event
        StripeService.handle_webhook_event(event)
        
        return HttpResponse(status=200)
        
    except ValueError:
        logger.error("Invalid payload in webhook")
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError:
        logger.error("Invalid signature in webhook")
        return HttpResponse(status=400)
    except Exception as e:
        logger.error(f"Error processing webhook: {e}")
        return HttpResponse(status=500)

@api_view(['GET'])
@permission_classes([])  # Allow unauthenticated access
def stripe_config(request):
    """
    Return Stripe publishable key for frontend
    """
    return Response({
        'publishable_key': settings.STRIPE_PUBLISHABLE_KEY
    }, status=status.HTTP_200_OK)
