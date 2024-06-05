import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FinalizarCompraModalComponent } from './finalizar-compra-modal/finalizar-compra-modal.component';

@NgModule({
  declarations: [FinalizarCompraModalComponent],
  imports: [
    CommonModule,
    FormsModule,
    IonicModule
  ],
  exports: [FinalizarCompraModalComponent]
})
export class ComponentsModule { }
