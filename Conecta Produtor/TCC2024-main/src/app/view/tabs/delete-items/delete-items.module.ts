import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DeleteItemsPageRoutingModule } from './delete-items-routing.module';

import { DeleteItemsPage } from './delete-items.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DeleteItemsPageRoutingModule
  ],
  declarations: [DeleteItemsPage]
})
export class DeleteItemsPageModule {}
