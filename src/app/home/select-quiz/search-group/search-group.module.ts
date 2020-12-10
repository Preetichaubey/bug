import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SearchGroupPageRoutingModule } from './search-group-routing.module';

import { SearchGroupPage } from './search-group.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SearchGroupPageRoutingModule
  ],
  declarations: [SearchGroupPage]
})
export class SearchGroupPageModule {}
