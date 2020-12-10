import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';

@Component({
  selector: 'app-privacy-policy',
  templateUrl: './privacy-policy.component.html',
  styleUrls: ['./privacy-policy.component.scss'],
})
export class PrivacyPolicyComponent implements OnInit {

  constructor(public nav: NavController) { }

  ngOnInit() {}

  Tnc() {
    this.nav.navigateForward("tnc");
  }

}
