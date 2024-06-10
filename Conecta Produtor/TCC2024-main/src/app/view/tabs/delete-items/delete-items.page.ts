import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/model/service/firebase-service.service';
import { AuthserviceService } from 'src/app/model/service/authservice.service';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-delete-items',
  templateUrl: './delete-items.page.html',
  styleUrls: ['./delete-items.page.scss'],
})
export class DeleteItemsPage implements OnInit {
  currentUserUID: string | null = null;
  userProducts: any[] = [];

  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthserviceService,
    private alertController: AlertController,
  ) { }

  ngOnInit() {
    const currentUser = this.authService.getUserLogged();
    if (currentUser) {
      this.currentUserUID = currentUser.uid;
      if (this.currentUserUID) { // Adicione esta verificação
        this.loadUserProducts();
      }
    }
  }
  

  private loadUserProducts() {
    if (this.currentUserUID) { // Adicione esta verificação
      this.firebaseService.getUserProducts(this.currentUserUID).subscribe(
        (products: any[]) => {
          this.userProducts = products;
        },
        error => {
          console.error('Error loading user products:', error);
        }
      );
    }
  }  
  public async confirmDeletePost(postId: string): Promise<void> {
    const alert = await this.alertController.create({
      header: 'Confirmar Exclusão',
      message: 'Você tem certeza que deseja excluir este post?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Exclusão cancelada');
          }
        },
        {
          text: 'Excluir',
          handler: async () => {
            await this.deletePost(postId);
            await alert.dismiss(); // Garantir que o popup seja fechado
          }
        }
      ]
    });

    await alert.present();
  }


  public async deletePost(postId: string): Promise<void> {
    try {
      await this.firebaseService.deleteItem(postId);
      console.log('Post deletado com sucesso.');
      this.loadUserProducts();
    } catch (error) {
      console.error('Erro ao deletar post:', error);
    }
  }
  
  
}
