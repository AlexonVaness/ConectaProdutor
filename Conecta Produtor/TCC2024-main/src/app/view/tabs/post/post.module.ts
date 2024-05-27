import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PostPage } from './post.page';
import { RouterModule } from '@angular/router';

@NgModule({
  declarations: [PostPage],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild([
      {
        path: '',
        component: PostPage
      }
    ])
  ],
  providers: []
})
export class PostPageModule {}
