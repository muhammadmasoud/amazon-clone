from rest_framework.response import Response
from rest_framework.decorators import api_view,permission_classes
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from ..models import Product
from .serializers import ProductSerializer
#from rest_framework.permissions import AllowAny


@api_view(['GET', 'POST'])
#@permission_classes([AllowAny]) TESTING PURPOSES
def view_add_product(request):
    if request.method == 'GET':
        products = Product.objects.all()
        paginator = PageNumberPagination()
        paginated_products = paginator.paginate_queryset(products, request)
        serialized_products = ProductSerializer(instance=paginated_products, many=True)
        return paginator.get_paginated_response(serialized_products.data)
    if request.method == 'POST':
        created_product = ProductSerializer(data=request.data)
        # Automatically returns bad request if the product is invalid
        created_product.is_valid(raise_exception=True)
        created_product.save()
        return Response(created_product.data, status=status.HTTP_201_CREATED)


@api_view(['GET', 'PUT', 'PATCH', 'DELETE'])
#@permission_classes([AllowAny]) TESTING PURPOSES
def product_by_id(request, id):
    try:
        product = Product.objects.get(pk=id)
    except Product.DoesNotExist as e:
        return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
    
    if request.method == 'GET':
        serialized_product = ProductSerializer(instance=product)
        return Response(serialized_product.data, status=status.HTTP_200_OK)
    elif request.method == 'DELETE':
        product.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    else:
        if request.method == 'PUT':
            edited_product = ProductSerializer(instance=product, data=request.data)
        elif request.method == 'PATCH':
            edited_product = ProductSerializer(instance=product, data=request.data, partial=True)

        edited_product.is_valid(raise_exception=True)
        edited_product.save()
        return Response(data=edited_product.data, status=status.HTTP_200_OK)