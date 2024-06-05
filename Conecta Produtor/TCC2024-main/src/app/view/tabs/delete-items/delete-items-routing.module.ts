import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DeleteItemsPage } from './delete-items.page';

const routes: Routes = [
  {
    path: '',
    component: DeleteItemsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeleteItemsPageRoutingModule {}
