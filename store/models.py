from django.db import models


class Product(models.Model):
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    image = models.CharField(max_length=500, blank=True)

    def __str__(self):
        return self.name


class Order(models.Model):
    name = models.CharField(max_length=200)
    email = models.EmailField()
    address = models.TextField()
    total = models.DecimalField(max_digits=10, decimal_places=2)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name