import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private USER_PATH: string = 'users';
  private PRODUCT_PATH: string = 'posts';
  private CART_PATH: string = 'cart';

  constructor(
    private firestore: AngularFirestore,
    private fireAuth: AngularFireAuth,
    private router: Router
  ) { }

  public async getCurrentUserData(): Promise<any> {
    const user = await this.fireAuth.currentUser;
    if (user) {
      const uid = user.uid;
      const docRef = this.firestore.collection(this.USER_PATH).doc(uid);
  
      try {
        const doc = await docRef.get().toPromise();
        if (doc && doc.exists) {
          const userData = doc.data() as { [key: string]: any }; // Ensure userData is typed as an object
          return { ...userData, uid }; // Add the userId (uid) to the user data
        } else {
          console.error("User document does not exist.");
          return null;
        }
      } catch (error) {
        console.error("Error getting user document:", error);
        return null;
      }
    } else {
      console.error("User not authenticated.");
      return null;
    }
  }
  public getItemById(postId: string): Observable<any> {
    return this.firestore.collection(this.PRODUCT_PATH).doc(postId).valueChanges();
  }
  
  public async checkUserDocumentExistence(): Promise<void> {
    const user = await this.fireAuth.currentUser;
    if (user) {
      const uid = user.uid;
      const docRef = this.firestore.collection(this.USER_PATH).doc(uid);
  
      try {
        const doc = await docRef.get().toPromise();
        if (doc && doc.exists) { // Check if doc is not undefined and exists
          // User already has a document in the database
          this.router.navigate(['/tabs']);
        } else {
          // User doesn't have a document in the database yet
          this.router.navigate(['/login-sem-cadastro']);
        }
      } catch (error) {
        console.error("Error checking user document existence:", error);
      }
    } else {
      console.error("User not authenticated.");
    }
  }

  public getAllProducts(): Observable<any[]> {
    return this.firestore.collection(this.PRODUCT_PATH).valueChanges();
  }

  public async saveUserData(uid: string, userData: any): Promise<void> {
    try {
      await this.firestore.collection(this.USER_PATH).doc(uid).set(userData);
      console.log('Dados do usuário salvos com sucesso.');
    } catch (error) {
      console.error('Erro ao salvar dados do usuário:', error);
      throw error;
    }
  }
  
  public async addToCart(item: any, quantity: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      this.fireAuth.currentUser.then(user => {
        if (user) {
          const userId = user.uid;
          const cartItemRef = this.firestore.collection(`cart/${userId}/items`).doc(item.postId);

          cartItemRef.get().toPromise().then(doc => {
            if (doc && doc.exists) { // Corrigindo TS18048
              const existingItem = doc.data() as { quantity: number }; // Corrigindo TS18046
              const newQuantity = existingItem.quantity + quantity;

              if (newQuantity > item.quantity) {
                reject('Quantidade solicitada excede a quantidade disponível.');
              } else {
                cartItemRef.update({ quantity: newQuantity })
                  .then(() => resolve())
                  .catch(error => reject(error));
              }
            } else {
              const cartItem = {
                userId: userId,
                postId: item.postId,
                title: item.title,
                price: item.price,
                quantity: quantity,
                nome: item.nome
              };

              cartItemRef.set(cartItem)
                .then(() => resolve())
                .catch(error => reject(error));
            }
          }).catch(error => reject(error));
        } else {
          reject('Usuário não autenticado.');
        }
      });
    });
  }

  public async removeItemFromCart(userId: string, itemId: string): Promise<void> { // Removendo o parâmetro de quantidade
    try {
      const itemRef = this.firestore.collection(`cart/${userId}/items`).doc(itemId);
      const doc = await itemRef.get().toPromise();
      if (doc && doc.exists) {
        const item = doc.data() as { quantity: number }; // Corrigindo TS18046
        const newQuantity = item.quantity - 1; // Reduzindo a quantidade em 1
        if (newQuantity > 0) {
          await itemRef.update({ quantity: newQuantity });
        } else {
          await itemRef.delete();
        }
        console.log('Item removido ou atualizado com sucesso.');
      } else {
        console.error('Item não encontrado no carrinho.');
      }
    } catch (error) {
      console.error('Erro ao remover item do carrinho:', error);
      throw error;
    }
  }


public getCartItems(uid: string): Observable<any[]> {
  return this.firestore.collection(`cart/${uid}/items`).snapshotChanges().pipe(
    map((actions: any[]) => actions.map(a => {
      const data = a.payload.doc.data() as any;
      const id = a.payload.doc.id;
      return { id, ...data };
    }))
  );
}


public async removeItemsFromProducer(userId: string, producerName: string): Promise<void> {
  try {
    const snapshot = await this.firestore.collection(`cart/${userId}/items`, ref => ref.where('nome', '==', producerName)).get().toPromise();
    if (snapshot && !snapshot.empty) {
      const batch = this.firestore.firestore.batch();
      snapshot.forEach((doc: any) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      console.log('Itens do produtor removidos com sucesso.');
    } else {
      console.log('Nenhum item encontrado para o produtor.');
    }
  } catch (error) {
    console.error('Erro ao remover itens do carrinho:', error);
    throw error;
  }
}

public async createCheckoutSession(userId: string): Promise<string> {
  try {
    const currentUser = await this.fireAuth.currentUser;
    if (currentUser) {
      // 1. Obter os itens do carrinho do usuário atual
      const cartItems = await this.getCartItems(userId).toPromise();

      // 2. Preparar os dados do pedido para enviar ao backend
      const lineItems = cartItems ? cartItems.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.title
            // Outros detalhes do produto, se necessário
          },
          unit_amount: item.price * 100, // Converter para centavos
        },
        quantity: item.quantity
      })) : [];

      // 3. Criar uma sessão de checkout no Stripe
      const response = await fetch('URL_DO_SEU_BACKEND/criar-sessao-de-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          lineItems,
          customerId: currentUser.uid
          // Outros dados do cliente, se necessário
        })
      });

      if (response.ok) {
        const { sessionId } = await response.json();
        return sessionId;
      } else {
        throw new Error('Erro ao criar sessão de checkout');
      }
    } else {
      throw new Error('Usuário não autenticado.');
    }
  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error);
    throw error;
  }
}

}
