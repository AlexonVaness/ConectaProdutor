import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { PopoverController } from '@ionic/angular';
import { FirebaseService } from 'src/app/model/service/firebase-service.service';

@Component({
  selector: 'app-post',
  templateUrl: './post.page.html',
  styleUrls: ['./post.page.scss'],
})
export class PostPage implements OnInit {
  postForm: FormGroup;
  selectedFile: File | null = null;
  successMessage: string = '';
  errorMessage: string = '';
  minDate: string;
  maxDate: string;
  userData: any;

  constructor(
    private formBuilder: FormBuilder,
    private storage: AngularFireStorage,
    private firestore: AngularFirestore,
    private afAuth: AngularFireAuth,
    private router: Router,
    private popoverController: PopoverController,
    private firebaseService: FirebaseService
  ) {
    this.postForm = this.formBuilder.group({
      title: ['', [Validators.required, Validators.pattern(/^[A-Z].*/)]],
      productionDate: ['', Validators.required],
      price: ['', [Validators.required, Validators.pattern(/^\d+(\.\d{1,2})?$/)]],
      quantity: ['', [Validators.required, Validators.pattern(/^\d+$/)]],
      type: ['', Validators.required], // Added type field to the form
      image: [null], // Image control
    });

    this.minDate = this.getMinDate();
    this.maxDate = this.getMaxDate();
  }

  ngOnInit() {
    this.loadUserData().then(() => {
      console.log('User data loaded:', this.userData);
    }).catch(error => {
      console.error('Error loading user data:', error);
    });
  }
  
  async loadUserData() {
    try {
      this.userData = await this.firebaseService.getCurrentUserData();
      if (!this.userData) {
        throw new Error('User data is null');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      this.errorMessage = 'Erro ao carregar os dados do usuário. Por favor, tente novamente.';
    }
  }

  async openDateSelector(ev: any) {
    const productionDateControl = this.postForm.get('productionDate');
    if (productionDateControl) {
      const popover = await this.popoverController.create({
        component: 'ion-datetime',
        event: ev,
        translucent: true,
        componentProps: {
          displayFormat: 'DD/MM/YYYY',
          pickerFormat: 'DD MMM YYYY',
          value: productionDateControl.value || new Date().toISOString(),
          doneText: 'Selecionar',
          cancelText: 'Cancelar'
        }
      });
      await popover.present();
  
      const { data } = await popover.onWillDismiss();
      if (data && data.selectedDate) {
        this.postForm.patchValue({
          productionDate: data.selectedDate
        });
      }
    }
  }
  
  onFileSelected(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.files && inputElement.files.length > 0) {
      this.selectedFile = inputElement.files[0];
    }
  }

  postItem() {
    if (this.postForm.valid) {
      if (this.userData && this.userData.uid) {
        const timestamp = new Date().getTime();
        const imageName = this.selectedFile ? `post_${timestamp}_${this.selectedFile.name}` : '';
        const filePath = `product_images/${imageName}`;
        const fileRef = this.storage.ref(filePath);
        const uploadTask = this.storage.upload(filePath, this.selectedFile);
  
        uploadTask.snapshotChanges().pipe(
          finalize(() => {
            fileRef.getDownloadURL().subscribe(url => {
              const newPostId = this.firestore.createId(); // Generate a unique ID for the post
              console.log("Posting with user data:", this.userData);
  
              const postData = {
                postId: newPostId, // Include the postId in the postData
                title: this.postForm.value.title,
                productionDate: this.postForm.value.productionDate,
                price: this.postForm.value.price,
                quantity: this.postForm.value.quantity,
                type: this.postForm.value.type,
                imageUrl: url,
                userId: this.userData.uid,
                timestamp: timestamp,
                nome: this.userData.nome,
                cidade: this.userData.cidade,
                telefone: this.userData.telefone,
              };
  
              this.firestore.collection('posts').doc(newPostId).set(postData)
                .then(() => {
                  this.successMessage = 'Item postado com sucesso!';
                  this.errorMessage = '';
                  this.postForm.reset();
                  this.router.navigate(['/tabs']);
                })
                .catch(error => {
                  this.errorMessage = 'Erro ao postar item: ' + error.message;
                });
            });
          })
        ).subscribe();
      } else {
        this.errorMessage = 'Usuário não autenticado. Por favor, faça login novamente.';
        console.error('userData is undefined or missing uid');
      }
    } else {
      this.errorMessage = 'Por favor, preencha todos os campos corretamente.';
    }
  }

  getMinDate(): string {
    const today = new Date();
    return today.toISOString();
  }

  getMaxDate(): string {
    const today = new Date();
    const maxDate = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
    return maxDate.toISOString();
  }
}
