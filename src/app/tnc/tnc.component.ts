import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-tnc',
  templateUrl: './tnc.component.html',
  styleUrls: ['./tnc.component.scss'],
})
export class TncComponent implements OnInit {

  constructor(public nav: NavController) { }

  ngOnInit() {}

  PrivacyPolicy() {
    this.nav.navigateForward("privacy-policy");
  }
}
