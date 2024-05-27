import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AuthserviceService } from 'src/app/model/service/authservice.service';
import { FirebaseService } from 'src/app/model/service/firebase-service.service';

interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  nome: string;
}

@Component({
  selector: 'app-cart',
  templateUrl: './cart.page.html',
  styleUrls: ['./cart.page.scss'],
})
export class CartPage implements OnInit {
  cartItems: CartItem[] = [];
  groupedCartItems: { [producerName: string]: CartItem[] } = {};
  totals: { [producerName: string]: number } = {};

  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthserviceService,
    private http: HttpClient
  ) { }

  async ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.authService.signOut();
      return;
    }

    const currentUser = this.authService.getUserLogged();
    if (currentUser) {
      this.firebaseService.getCartItems(currentUser.uid).subscribe(items => {
        this.cartItems = items.map(item => ({
          ...item,
          nome: item.nome || item.producerId
        })) as CartItem[];
        this.groupItemsByProducer();
      });
    } else {
      console.error('User not authenticated.');
    }
  }

  groupItemsByProducer() {
    this.groupedCartItems = this.cartItems.reduce((acc, item) => {
      const producerName = item.nome;
      if (!acc[producerName]) {
        acc[producerName] = [];
      }
      acc[producerName].push(item);
      return acc;
    }, {} as { [producerName: string]: CartItem[] });

    this.calculateTotals();
  }

  calculateTotals() {
    this.totals = Object.keys(this.groupedCartItems).reduce((acc, producerName) => {
      acc[producerName] = this.groupedCartItems[producerName].reduce((total, item) => total + (item.price * item.quantity), 0);
      return acc;
    }, {} as { [producerName: string]: number });
  }

  async removeItem(producerName: string, itemId: string) {
    try {
      const currentUser = this.authService.getUserLogged();
      if (currentUser) {
        await this.firebaseService.removeItemFromCart(currentUser.uid, itemId);
        this.cartItems = this.cartItems.filter(item => item.id !== itemId);
        this.groupItemsByProducer();
      }
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  }

  async cancelPurchase(producerName: string) {
    try {
      const currentUser = this.authService.getUserLogged();
      if (currentUser) {
        await this.firebaseService.removeItemsFromProducer(currentUser.uid, producerName);
        this.cartItems = this.cartItems.filter(item => item.nome !== producerName);
        this.groupItemsByProducer();
      }
    } catch (error) {
      console.error('Error canceling purchase:', error);
    }
  }

  async checkoutForProducer(producerName: string) {
    try {
      const currentUser = this.authService.getUserLogged();
      if (currentUser) {
        const items = this.groupedCartItems[producerName].map(item => ({
          id: item.id,
          title: item.title,
          price: item.price,
          quantity: item.quantity,
          nome: item.nome,
        }));

        this.http.post<{ url: string }>('http://localhost:4242/create-checkout-session', { items })
          .subscribe((response) => {
            if (response.url) {
              window.location.href = response.url;
            } else {
              console.error('No URL returned for the session');
            }
          }, error => {
            console.error('Error creating checkout session:', error);
          });
      } else {
        console.error('User not authenticated.');
      }
    } catch (error) {
      console.error('Error during checkout:', error);
    }
  }

  getProducerNames(): string[] {
    return Object.keys(this.groupedCartItems);
  }
}
