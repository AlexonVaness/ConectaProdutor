import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { AuthserviceService } from 'src/app/model/service/authservice.service';
import { FirebaseService } from 'src/app/model/service/firebase-service.service';
import { FinalizarCompraModalComponent } from 'src/app/components/finalizar-compra-modal/finalizar-compra-modal.component';
import { ModalController } from '@ionic/angular';


export interface CartItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  nome: string;
  imageUrl?: string; // Propriedade opcional
  whatsappNumber: string; // Número de WhatsApp do produtor
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
    private modalController: ModalController,
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
      this.firebaseService.getCartItems(currentUser.uid).subscribe(async items => {
        // Filtrar os itens para garantir que apenas os que ainda existem na coleção posts sejam exibidos
        const existingItems = await Promise.all(
          items.map(async item => ({
            ...item,
            exists: await this.firebaseService.checkIfItemExists(item.postId)
          }))
        );
  
        // Remover os itens que não existem mais
        this.cartItems = existingItems.filter(item => item.exists);
  
        // Agrupar os itens novamente
        this.groupItemsByProducer();
      });
    } else {
      console.error('User not authenticated.');
    }
  }
   

  async openFinalizarCompraModal(producerName: string) {
    const modal = await this.modalController.create({
      component: FinalizarCompraModalComponent,
      componentProps: {
        producerName,
        items: this.groupedCartItems[producerName]
      }
    });
    return await modal.present();
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
        await this.firebaseService.removeItemFromCart(currentUser.uid, itemId, this.cartItems); // passe cartItems como argumento
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


  getProducerNames(): string[] {
    return Object.keys(this.groupedCartItems);
  }

  contactViaWhatsApp(producerName: string) {
    const producerItems = this.groupedCartItems[producerName];
    if (producerItems && producerItems.length > 0) {
      const phoneNumber = producerItems[0].whatsappNumber;
      if (phoneNumber) {
        const message = encodeURIComponent('Olá, preciso de ajuda com meu pedido.');
        window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
      } else {
        console.error('Número de WhatsApp do produtor não disponível.');
      }
    } else {
      console.error('Itens do produtor não encontrados.');
    }
  }
  
  
}
