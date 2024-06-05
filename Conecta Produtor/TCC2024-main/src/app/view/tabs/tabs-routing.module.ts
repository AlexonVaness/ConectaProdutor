import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TabsPage } from './tabs.page';

const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'catalog',
        loadChildren: () => import('../tabs/catalog/catalog.module').then(m => m.CatalogPageModule)
      },
      {
        path: 'post',
        loadChildren: () => import('../tabs/post/post.module').then(m => m.PostPageModule)
      },
      {
        path: '',
        redirectTo: 'catalog',
        pathMatch: 'full'
      },
      {
        path: 'profile',
        loadChildren: () => import('./profile/profile.module').then(m => m.ProfilePageModule)
      },
      {
        path: 'delete-items',
        loadChildren: () => import('./delete-items/delete-items.module').then( m => m.DeleteItemsPageModule)
      },
      {
        path: 'cart',
        loadChildren: () => import('./cart/cart.module').then( m => m.CartPageModule)
      }
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TabsPageRoutingModule {}
