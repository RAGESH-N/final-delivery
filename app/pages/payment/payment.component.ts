import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment',
  templateUrl: './payment.component.html',
  styleUrls: ['./payment.component.css']
})
export class PaymentComponent implements OnInit {
  total: number = 0;
  cardNumber: string = '';
  expiry: string = '';
  cvv: string = '';
  name: string = '';
  paymentStatus: string = '';

  cartItems: any[] = [];
  userId: string = '';
  restaurantName: string = '';

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() {
    const nav = window.history.state;
    this.total = nav.total || 0;
    this.cartItems = nav.cartItems || [];
    this.userId = nav.userId || '';
    this.restaurantName = nav.restaurantName || '';
  }

  pay() {
    const orderData = {
      userId: this.userId,
      total: this.total,
      cartItems: this.cartItems,
      restaurantName: this.restaurantName,
      orderTime: new Date(),
      status: 'Pending'
    };

    // Store only in restaurant-orders
    this.http.post('http://localhost:3000/api/restaurant-orders', orderData).subscribe({
      next: () => {
        this.paymentStatus = 'Payment Successful! Thank you for your order.';
        setTimeout(() => {
          this.router.navigate(['/order-history'], { state: { userId: this.userId } });
        }, 1200);
      },
      error: () => {
        this.paymentStatus = 'Could not save order. Please try again.';
      }
    });
  }
}