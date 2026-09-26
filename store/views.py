from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json
from .models import Product, Order


def products(request):
    products = Product.objects.all()

    data = []

    for product in products:
        data.append({
            'id': product.id,
            'name': product.name,
            'price': str(product.price),
            'category': product.category,
            'description': product.description,
            'image': product.image
        })

    return JsonResponse(data, safe=False)


def product_detail(request, product_id):
    try:
        product = Product.objects.get(id=product_id)

        return JsonResponse({
            "id": product.id,
            "name": product.name,
            "price": product.price,
            "category": product.category,
            "image": product.image
        })

    except Product.DoesNotExist:
        return JsonResponse({
            "message": "Product not found"
        }, status=404)


@csrf_exempt
def register(request):
    if request.method == 'POST':
        name = request.POST.get('name')
        email = request.POST.get('email')
        password = request.POST.get('password')

        if User.objects.filter(username=email).exists():
            return JsonResponse({
                'success': False,
                'message': 'Email already registered'
            })

        user = User.objects.create_user(
            username=email,
            email=email,
            password=password,
            first_name=name
        )

        return JsonResponse({
            'success': True,
            'message': 'Account created successfully'
        })

    return JsonResponse({
        'success': False,
        'message': 'Invalid request'
    })


@csrf_exempt
def user_login(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        email = data.get('username')
        password = data.get('password')

        user = authenticate(
            username=email,
            password=password
        )

        if user is not None:
            login(request, user)

            return JsonResponse({
                'success': True,
                'message': 'Signed in successfully'
            })

        return JsonResponse({
            'success': False,
            'message': 'Invalid email or password'
        })

    return JsonResponse({
        'success': False,
        'message': 'Invalid request'
    })


@csrf_exempt
def create_order(request):
    if request.method == 'POST':
        data = json.loads(request.body)

        order = Order.objects.create(
            name=data.get('name'),
            email=data.get('email'),
            address=data.get('address'),
            total=data.get('total')
        )

        return JsonResponse({
            'success': True,
            'message': 'Order placed successfully',
            'order_id': order.id
        })

    return JsonResponse({
        'success': False,
        'message': 'Invalid request'
    })