import { Component, OnInit } from '@angular/core';
import { FirebaseService } from 'src/app/model/service/firebase-service.service';
import { AuthserviceService } from 'src/app/model/service/authservice.service';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-catalog',
  templateUrl: './catalog.page.html',
  styleUrls: ['./catalog.page.scss'],
})
export class CatalogPage implements OnInit {
  banners: any[] = [];
  products: any[] = [];
  filteredProducts: any[] = [];
  isLoading: boolean = true;
  currentUserUID: string | null = null;
  searchActive: boolean = false;
  searchTerm: string = '';
  selectedType: string = 'all';

  constructor(
    private firebaseService: FirebaseService,
    private authService: AuthserviceService,
    private navCtrl: NavController
  ) { }

  async ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.authService.signOut();
      return;
    }

    const currentUser = this.authService.getUserLogged();
    if (currentUser) {
      this.currentUserUID = currentUser.uid;
      this.loadProducts();
    } else {
      this.isLoading = false;
    }
  }

  private loadProducts() {
    this.firebaseService.getAllProducts().subscribe(
      (products: any[]) => {
        this.products = products;
        this.filterByType('all');
        this.isLoading = false;
      },
      error => {
        console.error('Error loading products:', error);
        this.isLoading = false;
      }
    );
  }

  verDetalhes(product: any) {
    this.navCtrl.navigateForward('/tabs/catalog/product/' + product.postId);
  }

  toggleSearch() {
    this.searchActive = !this.searchActive;
    this.searchTerm = '';
    this.filterProducts();
  }

  searchProducts() {
    this.filterProducts();
  }

  filterByType(type: string) {
    this.selectedType = type;
    const typeLowerCase = type.toLowerCase();
    if (typeLowerCase === 'all') {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(post => {
        const postTypeLowerCase = post.type ? post.type.toLowerCase() : '';
        const matchesType = postTypeLowerCase === typeLowerCase;
        const matchesSearchTerm = !this.searchActive || this.searchTerm.trim() === '' ||
          post.title.toLowerCase().includes(this.searchTerm.toLowerCase());
        return matchesType && matchesSearchTerm;
      });
    }
  }
  

  isFilterPressed(type: string): boolean {
    return this.selectedType === type;
  }

  private filterProducts() {
    if (this.searchActive && this.searchTerm.trim() !== '') {
      this.filteredProducts = this.products.filter(product =>
        product.title.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filterByType(this.selectedType);
    }
  }
}