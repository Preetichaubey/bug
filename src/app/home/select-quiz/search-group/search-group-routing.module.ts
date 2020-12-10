import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SearchGroupPage } from './search-group.page';

const routes: Routes = [
  {
    path: '',
    component: SearchGroupPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchGroupPageRoutingModule {}
