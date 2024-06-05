import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FirebaseService } from 'src/app/model/service/firebase-service.service';

@Component({
  selector: 'app-details',
  templateUrl: './details-product.page.html',
  styleUrls: ['./details-product.page.scss'],
})
export class DetailsPage implements OnInit {
  postId: string | null = null;
  item: any = null;
  quantity: number = 1; // Quantidade inicial
  quantityError: boolean = false; // Estado para rastrear erros de quantidade
  total: number = 0; // Valor total

  constructor(
    private route: ActivatedRoute,
    private firebaseService: FirebaseService
  ) { }

  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('postId');
      if (id) {
        this.postId = id;
        this.loadItemDetails(this.postId);
      } else {
        console.error('Post ID not found in route parameters.');
      }
    });
  }

  loadItemDetails(postId: string) {
    this.firebaseService.getItemById(postId).subscribe(
      (item: any) => {
        this.item = item;
        if (!this.item.nome) {
          console.error('Campo nome não está presente no item.');
        }
        this.updateTotal(); // Atualiza o total quando os detalhes do item são carregados
      },
      (error: any) => {
        console.error('Error loading item details:', error);
      }
    );
  }

  updateTotal() {
    if (this.quantity > this.item.quantity || this.quantity <= 0) {
      this.quantityError = true;
      this.total = 0; // Se a quantidade for inválida, o total deve ser 0
    } else {
      this.quantityError = false;
      this.total = this.quantity * this.item.price; // Calcula o valor total
    }
  }

  addToCart() {
    if (this.item && this.quantity && this.quantity > 0 && this.quantity <= this.item.quantity) {
      console.log('Item selecionado:', this.item);
      console.log('Quantidade selecionada:', this.quantity);
  
      const requiredFields = ['postId', 'title', 'price', 'nome', 'telefone'];
      const missingFields = requiredFields.filter(field => !this.item[field]);
      
      if (missingFields.length > 0) {
        console.error(`Campos obrigatórios do item estão faltando: ${missingFields.join(', ')}`);
        return;
      }

      this.firebaseService.addToCart(this.item, this.quantity)
        .then(() => console.log(`Item ${this.item.title} adicionado ao carrinho com sucesso.`))
        .catch(error => console.error('Erro ao adicionar item ao carrinho:', error));
    } else {
      console.error('Quantidade inválida ou item não selecionado.');
    }
  }
}
