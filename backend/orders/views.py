from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from .models import Order, OrderItem
from products.models import Product
from .serializers import OrderSerializer

class PlaceOrderView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        data = request.data
        cart_items = data.get('cart', [])
        shipping_address = data.get('shipping_address')

        if not cart_items or not shipping_address:
            return Response({'detail': 'Cart or shipping info missing'}, status=400)

        order = Order.objects.create(user=user, shipping_address=shipping_address)

        for item in cart_items:
            product = Product.objects.get(id=item['product_id'])
            quantity = item['quantity']
            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                price=product.price
            )

        return Response(OrderSerializer(order).data, status=status.HTTP_201_CREATED)
