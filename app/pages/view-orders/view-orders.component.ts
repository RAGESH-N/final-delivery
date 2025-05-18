import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-view-orders',
  templateUrl: './view-orders.component.html',
  styleUrls: ['./view-orders.component.css']
})
export class ViewOrdersComponent implements OnInit {
  orders: any[] = [];
  loading = true;
  restaurantName: string = '';

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const nav = window.history.state;
    this.restaurantName = nav.restaurantName || '';
    if (this.restaurantName) {
      this.fetchOrders();
    } else {
      this.loading = false;
    }
  }

  fetchOrders() {
    this.http.get<any[]>(`http://localhost:3000/api/restaurant-orders/${encodeURIComponent(this.restaurantName)}`)
      .subscribe({
        next: (orders) => {
          this.orders = orders;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          alert('Failed to load orders');
        }
      });
  }

  updateStatus(order: any, newStatus: string) {
    this.http.patch(
      `http://localhost:3000/api/restaurant-orders/${order._id}/status`,
      { status: newStatus }
    ).subscribe({
      next: () => {
        order.status = newStatus; // Update UI instantly
      },
      error: () => {
        alert('Failed to update order status!');
      }
    });
  }
}