import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  nome: string;
  imageUrl?: string; // Propriedade opcional
}

@Component({
  selector: 'app-finalizar-compra-modal',
  templateUrl: './finalizar-compra-modal.component.html',
  styleUrls: ['./finalizar-compra-modal.component.scss'],
})
export class FinalizarCompraModalComponent {
  @Input() producerName!: string;
  @Input() items: CartItem[] = [];

  constructor(private modalController: ModalController, private http: HttpClient) {}

  dismiss() {
    this.modalController.dismiss();
  }

  async finalizePurchase() {
    try {
      const response = await this.http.post<{ url: string }>('http://localhost:4242/create-checkout-session', { items: this.items }).toPromise();
      if (response?.url) {
        window.location.href = response.url;
      } else {
        console.error('No URL returned for the session');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
    }
    this.modalController.dismiss();
  }
}
