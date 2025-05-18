import { Component, OnInit, AfterViewInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import * as L from 'leaflet';
import { Router } from '@angular/router';
@Component({
  selector: 'app-view-cart',
  templateUrl: './view-cart.component.html',
  styleUrls: ['./view-cart.component.css']
})
export class ViewCartComponent implements OnInit, AfterViewInit {
  cartItems: any[] = [];
  totalPrice: number = 0;
deliveryCharge: number = 0;
showDeliveryChargeMsg: boolean = false;
showTooFarError: boolean = false;
//=====================
  latitude: number = 0;
  longitude: number = 0;
  city: string = 'Unknown';
  area: string = 'Unknown';
  street: string = 'Unknown';
  pincode: string = 'Unknown';
  map: any;
  userMarker: any;

  // For manual restaurant coordinate input
  selectedRestaurantName: string = '';
  restaurantGeoLocation: string = '';
  manualDistance: number | null = null;
  manualError: string = '';
  manualUserLat: number = 0;
  manualUserLon: number = 0;

  constructor(private http: HttpClient,private router: Router) {}

  ngOnInit() {
    this.fetchCart();
  }

  ngAfterViewInit(): void {
    this.map = L.map('map', {
      center: [20, 78],
      zoom: 5,
      zoomControl: false
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 18
    }).addTo(this.map);

    L.control.zoom({ position: 'topright' }).addTo(this.map);

    setTimeout(() => {
      this.map.invalidateSize();
    }, 500);
  }

  fetchCart() {
    const userId = localStorage.getItem('userId');
    this.http.get<any[]>(`http://localhost:3000/api/cart/user/${userId}`).subscribe({
      next: (data) => {
        this.cartItems = data;
        this.calculateTotal();
        if (this.cartItems.length > 0) {
          this.selectedRestaurantName = this.cartItems[0].restaurantName;
          this.fetchGeoLocationForRestaurant();
        }
      },
      error: (err) => console.error('Error fetching cart:', err)
    });
  }

  calculateTotal() {
  let sum = this.cartItems.reduce(
    (acc, item) => acc + (item.price * (item.quantity || 1)),
    0
  );
  this.totalPrice = sum + (this.deliveryCharge || 0);
}

  updateQuantity(cartItem: any, newQuantity: number) {
    if (newQuantity < 1) return;
    cartItem.quantity = newQuantity;
    this.calculateTotal();
    this.http.patch(`http://localhost:3000/api/cart/${cartItem._id}`, { quantity: newQuantity }).subscribe({
      next: () => {},
      error: (err) => {
        alert('Error updating quantity');
        console.error(err);
      }
    });
  }

  removeItem(item: any) {
    if (!item._id) {
      alert('Invalid cart item ID');
      return;
    }
    this.http.delete(`http://localhost:3000/api/cart/${item._id}`).subscribe({
      next: () => {
        this.cartItems = this.cartItems.filter(i => i._id !== item._id);
        this.calculateTotal();
      },
      error: (err) => {
        alert('Error removing cart item');
        console.error(err);
      }
    });
  }

  clearCart() {
    const userId = localStorage.getItem('userId');
    this.http.delete(`http://localhost:3000/api/cart/user/${userId}`).subscribe({
      next: () => {
        this.cartItems = [];
        this.calculateTotal();
      }
    });
  }

proceedToPayment() {
  const userId = localStorage.getItem('userId');
  this.router.navigate(['/payment'], { 
    state: { 
      total: this.totalPrice, 
      cartItems: this.cartItems, 
      userId: userId,
      restaurantName: this.selectedRestaurantName // pass as a separate value
    } 
  });
}

  getLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(position => {
        this.latitude = position.coords.latitude ?? 0;
        this.longitude = position.coords.longitude ?? 0;

        // Reverse geocode to get address info
        this.http.get<any>(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${this.latitude}&lon=${this.longitude}`
        ).subscribe(response => {
          this.city = response.address.city || response.address.town || response.address.village || 'Unknown';
          this.area = response.address.suburb || response.address.neighbourhood || 'Unknown';
          this.street = response.address.road || 'Unknown';
          this.pincode = response.address.postcode || 'Unknown';
        });

        this.map.setView([this.latitude, this.longitude], 14);

        if (this.userMarker) {
          this.map.removeLayer(this.userMarker);
        }

        this.userMarker = L.marker([this.latitude, this.longitude], {
          icon: L.icon({ iconUrl: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png' })
        })
        .addTo(this.map)
        .bindPopup(`You are here: ${this.city}, ${this.area}, ${this.street}, ${this.pincode}`)
        .openPopup();

        // Auto-calculate distance
        this.manualUserLat = this.latitude;
        this.manualUserLon = this.longitude;
        this.autoCalculateDistance();
      });
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  }

  // For auto-calculating distance after getting location
autoCalculateDistance() {
  this.manualError = '';
  this.manualDistance = null;
  this.deliveryCharge = 0;
  this.showDeliveryChargeMsg = false;
  this.showTooFarError = false;

  if (!this.restaurantGeoLocation || !this.restaurantGeoLocation.includes(',')) {
    this.manualError = 'Enter valid coordinates (lat,lon)';
    return;
  }
  const [latStr, lonStr] = this.restaurantGeoLocation.split(',');
  const resLat = parseFloat(latStr.trim());
  const resLon = parseFloat(lonStr.trim());
  if (isNaN(resLat) || isNaN(resLon)) {
    this.manualError = 'Invalid restaurant coordinates';
    return;
  }
  this.manualDistance = this.getDistanceFromLatLonInKm(this.manualUserLat, this.manualUserLon, resLat, resLon);

  // If distance > 15, show error and do not proceed
  // if (this.manualDistance > 15) {
  //   this.showTooFarError = true;
  //   this.deliveryCharge = 0;
  //   this.showDeliveryChargeMsg = false;
  //   this.calculateTotal();
  //   return;
  // }

  // If distance > 3, charge 30 per km over 3km
  if (this.manualDistance > 3) {
    const extraKm = this.manualDistance - 3;
    this.deliveryCharge = Math.ceil(extraKm * 30); // round up to next rupee
    this.showDeliveryChargeMsg = true;
  } else {
    this.deliveryCharge = 0;
    this.showDeliveryChargeMsg = false;
  }
  this.calculateTotal();
}


  getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  // Fetch geoLocation for selected restaurant from backend API
  fetchGeoLocationForRestaurant() {
    if (!this.selectedRestaurantName) {
      this.restaurantGeoLocation = '';
      return;
    }
    this.http.get<{ geoLocation: string }>(`http://localhost:3000/api/restaurants/geolocation/${encodeURIComponent(this.selectedRestaurantName)}`)
      .subscribe({
        next: data => {
          this.restaurantGeoLocation = data.geoLocation || '';
          // Optionally auto-calculate distance again if user already allowed location
          if (this.latitude && this.longitude) {
            this.manualUserLat = this.latitude;
            this.manualUserLon = this.longitude;
            this.autoCalculateDistance();
          }
        },
        error: () => this.restaurantGeoLocation = ''
      });
  }
}