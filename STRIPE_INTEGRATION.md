# Stripe Payment Integration for Amazon Clone

## Overview

This project now includes a complete Stripe payment integration that allows customers to make secure payments using credit/debit cards alongside the existing cash-on-delivery option.

## Features

### Backend (Django)
- ✅ Stripe Payment Intent API integration
- ✅ Payment model to track all transactions
- ✅ Webhook handling for payment confirmations
- ✅ Admin interface for payment management
- ✅ Order status updates based on payment status
- ✅ Refund capability through Stripe API

### Frontend (React)
- ✅ Stripe React Elements integration
- ✅ Secure card input form with real-time validation
- ✅ Payment flow with loading states and error handling
- ✅ Payment confirmation and success pages
- ✅ Multiple payment method selection (Stripe + Cash on Delivery)

## Configuration

### Environment Variables

Add these to your Django settings:

```python
# Stripe Configuration
STRIPE_PUBLISHABLE_KEY = 'pk_test_51S0V4yKX6jTnh1HUq5GKWEbvQJCiDzmRdABguQc3DphlpwkSj395xoJZtBFLMdjN2jvQpvNqULJcpT64ex3A9ad700749gltol'
STRIPE_SECRET_KEY = 'sk_test_51S0V4yKX6jTnh1HUAvC7ECIqk0d77HXHtTIvAW4Fo9zvrjxiOOLOctg2Jk9euFxbf5LahWetmtBZUjK30YPuo9V2007kcBarfe'
STRIPE_WEBHOOK_SECRET = ''  # Add when you set up webhooks
```

## API Endpoints

### Payment Endpoints

- `POST /api/payments/create-payment-intent/` - Create payment intent for an order
- `POST /api/payments/confirm-payment/` - Confirm successful payment
- `GET /api/payments/payment-status/{payment_id}/` - Get payment status
- `GET /api/payments/user-payments/` - Get all user payments
- `POST /api/payments/stripe-webhook/` - Handle Stripe webhooks
- `GET /api/payments/stripe-config/` - Get Stripe publishable key

### Example API Usage

#### Create Payment Intent
```javascript
const response = await fetch('/api/payments/create-payment-intent/', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your-jwt-token',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    order_id: 123
  })
});

const data = await response.json();
// Returns: { payment_id, client_secret, amount, currency, order_number }
```

#### Confirm Payment
```javascript
const response = await fetch('/api/payments/confirm-payment/', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your-jwt-token',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    payment_intent_id: 'pi_1234567890',
    payment_id: 'PAY-ABCD1234'
  })
});
```

## Frontend Usage

### Basic Checkout Component

```jsx
import StripeCheckout from '../components/payment/StripeCheckout';

function CheckoutPage() {
  const order = {
    id: 1,
    order_number: 'ORD-12345',
    total_amount: '99.99',
    user: { username: 'customer', email: 'customer@example.com' }
  };

  const handleSuccess = (paymentIntent, paymentId) => {
    // Payment successful, redirect to success page
    navigate(`/payment-success/${paymentId}`);
  };

  const handleError = (error) => {
    // Handle payment error
    console.error('Payment failed:', error);
  };

  return (
    <StripeCheckout
      order={order}
      onSuccess={handleSuccess}
      onError={handleError}
    />
  );
}
```

## Test Cards

Use these test card numbers in development:

| Card Type | Number | CVC | Date |
|-----------|---------|-----|------|
| Visa | 4242 4242 4242 4242 | Any 3 digits | Any future date |
| Visa (debit) | 4000 0566 5566 5556 | Any 3 digits | Any future date |
| Mastercard | 5555 5555 5555 4444 | Any 3 digits | Any future date |
| American Express | 3782 822463 10005 | Any 4 digits | Any future date |
| Declined | 4000 0000 0000 0002 | Any 3 digits | Any future date |

## Payment Flow

1. **Create Order**: Customer creates an order through your existing order system
2. **Choose Payment**: Customer selects Stripe as payment method
3. **Payment Intent**: Frontend calls `/api/payments/create-payment-intent/`
4. **Enter Card**: Customer enters card details in Stripe Elements form
5. **Process Payment**: Stripe processes the payment securely
6. **Confirm**: Frontend calls `/api/payments/confirm-payment/`
7. **Update Order**: Order status updated to "confirmed" and "paid"
8. **Success Page**: Customer sees payment confirmation

## Security

- 🔒 **PCI Compliance**: Stripe handles all card data, so you don't need PCI compliance
- 🔒 **Tokenization**: Card details never touch your servers
- 🔒 **3D Secure**: Automatic 3D Secure authentication when required
- 🔒 **Fraud Prevention**: Stripe's built-in fraud detection
- 🔒 **Webhooks**: Secure webhook verification (when configured)

## Webhook Setup (Optional but Recommended)

1. Go to your [Stripe Dashboard](https://dashboard.stripe.com/test/webhooks)
2. Add endpoint: `https://yourdomain.com/api/payments/stripe-webhook/`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Add the webhook secret to your settings: `STRIPE_WEBHOOK_SECRET`

## Database Models

### Payment Model
```python
class Payment(models.Model):
    payment_id = models.CharField(max_length=50, unique=True)
    stripe_payment_intent_id = models.CharField(max_length=200)
    order = models.OneToOneField(Order, on_delete=models.CASCADE)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=3, default='USD')
    status = models.CharField(max_length=20, default='pending')
    # ... other fields
```

## Deployment Considerations

### Production Setup
1. Replace test keys with live Stripe keys
2. Set up webhook endpoints with proper SSL
3. Enable webhook signature verification
4. Configure proper error logging
5. Set up monitoring for failed payments

### Environment Variables for Production
```python
STRIPE_PUBLISHABLE_KEY = 'pk_live_...'  # Live publishable key
STRIPE_SECRET_KEY = 'sk_live_...'       # Live secret key
STRIPE_WEBHOOK_SECRET = 'whsec_...'     # Webhook signing secret
```

## Troubleshooting

### Common Issues

1. **"No such payment_intent"**
   - Check that payment intent ID is correct
   - Ensure you're using the right Stripe account (test vs live)

2. **"Authentication required"**
   - Verify JWT token is included in request headers
   - Check user permissions

3. **"Payment confirmation failed"**
   - Check order exists and belongs to user
   - Verify payment intent status in Stripe dashboard

4. **Frontend won't load Stripe**
   - Check publishable key is correct
   - Ensure network connectivity to Stripe

### Debug Mode

Enable debug logging in Django settings:
```python
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'loggers': {
        'payments': {
            'handlers': ['console'],
            'level': 'DEBUG',
        },
    },
}
```

## Testing

### Run Tests
```bash
# Backend tests
python manage.py test payments

# Frontend tests
npm test
```

### Manual Testing Checklist
- [ ] Create payment intent successfully
- [ ] Enter valid card details
- [ ] Complete payment flow
- [ ] Handle payment failures gracefully
- [ ] Cash on delivery still works
- [ ] Order status updates correctly
- [ ] Payment history displays correctly

## Support

For issues with this integration:
1. Check Stripe documentation: https://stripe.com/docs
2. Review Django logs for backend issues
3. Use browser dev tools for frontend debugging
4. Check Stripe dashboard for payment details

## License

This payment integration follows the same license as the main project.
