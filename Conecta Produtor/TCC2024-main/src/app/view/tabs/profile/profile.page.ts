import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthserviceService } from 'src/app/model/service/authservice.service';
import { FirebaseService } from 'src/app/model/service/firebase-service.service';
import { AngularFireStorage } from '@angular/fire/compat/storage'; // Adicione a importação para o AngularFireStorage
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage implements OnInit {
  profileForm: FormGroup;
  profileImage: string = '';
  userId: string = '';
  editMode: boolean = false;
  formErrors: any = {
    nome: '',
    idade: '',
    cidade: '',
    telefone: ''
  };

  validationMessages: any = {
    nome: {
      required: 'O nome é obrigatório.'
    },
    idade: {
      required: 'A idade é obrigatória.',
      pattern: 'A idade deve ser um número entre 1 e 3 dígitos.'
    },
    cidade: {
      required: 'A cidade é obrigatória.'
    },
    telefone: {
      required: 'O telefone é obrigatório.',
      pattern: 'O telefone deve estar no formato (xx) xxxx-xxxx.'
    }
  };

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthserviceService,
    private firebaseService: FirebaseService,
    private storage: AngularFireStorage, // Injete o AngularFireStorage no construtor´
    private router: Router
  ) {
    this.profileForm = this.formBuilder.group({
      nome: ['', Validators.required],
      idade: ['', [Validators.required, Validators.pattern('^[0-9]{1,3}$')]],
      cidade: ['', Validators.required],
      telefone: ['', [Validators.required, Validators.pattern('^\\([0-9]{2}\\)\\s[0-9]{4,5}-[0-9]{4}$')]]
    });
  }

  ngOnInit() {
    this.authService.getCurrentUser().then(user => {
      if (user) {
        this.userId = user.uid;
        this.loadUserProfile();
      } else {
        this.router.navigate(['/signin']);
      }
    });
    this.profileForm.valueChanges.subscribe(() => this.onValueChanged());
  }

  loadUserProfile() {
    this.firebaseService.getCurrentUserData().then((userProfile: any) => {
      if (userProfile) {
        this.profileForm.patchValue({
          nome: userProfile.nome,
          idade: userProfile.idade,
          cidade: userProfile.cidade,
          telefone: userProfile.telefone
        });
        this.profileImage = userProfile.profileImage || '';
      }
    });
  }

  onValueChanged() {
    if (!this.profileForm) {
      return;
    }
    for (const field in this.formErrors) {
      if (Object.prototype.hasOwnProperty.call(this.formErrors, field)) {
        this.formErrors[field] = '';
        const control = this.profileForm.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (Object.prototype.hasOwnProperty.call(control.errors, key)) {
              this.formErrors[field] += messages[key] + ' ';
            }
          }
        }
      }
    }
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.profileImage = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  onSelectImageClick() {
    const inputElement = document.createElement('input');
    inputElement.type = 'file';
    inputElement.accept = 'image/*';
    inputElement.click();

    inputElement.addEventListener('change', (event: any) => {
      const file = event.target.files[0];
      if (file) {
        this.uploadImage(file);
      }
    });
  }

  onSave() {
    if (this.profileForm.valid) {
      const userProfile = this.profileForm.value;
      userProfile.profileImage = this.profileImage;
      this.firebaseService.saveUserData(this.userId, userProfile)
        .then(() => console.log('Profile updated successfully'))
        .catch(error => console.error('Error updating profile: ', error));
    } else {
      console.log('Form is not valid');
    }
  }

  toggleEditMode() {
    this.editMode = !this.editMode;
  }

  async uploadImage(file: any) {
    const filePath = `profile_images/${this.userId}/${file.name}`;
    const fileRef = this.storage.ref(filePath);
    const task = this.storage.upload(filePath, file);
  
    task.snapshotChanges().subscribe(async snapshot => {
      if (snapshot && snapshot.state === 'success') {
        const downloadURL = await fileRef.getDownloadURL().toPromise();
        this.profileImage = downloadURL;
      }
    });
  }
}
