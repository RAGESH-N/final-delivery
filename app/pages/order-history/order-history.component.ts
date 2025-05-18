import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-order-history',
  templateUrl: './order-history.component.html',
  styleUrls: ['./order-history.component.css']
})
export class OrderHistoryComponent implements OnInit, OnDestroy {
  orders: any[] = [];
  loading = true;
  userId: string = '';
  private intervalId: any;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    const nav = window.history.state;
    this.userId = nav.userId || '';
    this.fetchOrders();
    // Poll every 10 seconds for updates
    this.intervalId = setInterval(() => this.fetchOrders(), 10000);
  }

  ngOnDestroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }

  fetchOrders() {
    this.http.get<any[]>(`http://localhost:3000/api/restaurant-orders/user/${this.userId}`)
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
}