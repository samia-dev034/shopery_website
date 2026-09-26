from django.contrib import admin
from django.urls import path
from store.views import products, product_detail, register, user_login, create_order

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/products/', products),
    path('api/register/', register),
    path('api/login/', user_login),
    path('api/orders/', create_order),
    path('api/products/<int:product_id>/', product_detail),
]