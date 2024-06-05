import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/model/service/firebase-service.service';
import { AuthserviceService } from 'src/app/model/service/authservice.service';

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
    private authService: AuthserviceService
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

  public async deletePost(postId: string): Promise<void> {
    try {
      console.log('ID do post a ser excluído:', postId);
  
      const user = await this.authService.getCurrentUser();
      if (user) {
        console.log('Usuário autenticado:', user);
        // Verifica se o usuário tem permissão para excluir o post
        const post = await this.firebaseService.getItemById(postId).toPromise();
        console.log('Post encontrado:', post);
        if (post && post.userId === user.uid) {
          console.log('Usuário tem permissão para excluir o post.');
          // Remove o post
          await this.firebaseService.deletePost(postId);
          console.log('Post deletado com sucesso.');
        } else {
          console.error('Usuário não tem permissão para excluir este post.');
        }
      } else {
        console.error('Usuário não autenticado.');
      }
    } catch (error) {
      console.error('Erro ao deletar post:', error);
      throw error;
    }
  }
  
  
  
}
