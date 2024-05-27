import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CatalogPage } from './catalog.page';

const routes: Routes = [
  {
    path: '',
    component: CatalogPage
  },
  {
    path: 'product/:postId',
    loadChildren: () => import('./details-product/details-product.module').then(m => m.DetailsProductPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CatalogPageRoutingModule {}
