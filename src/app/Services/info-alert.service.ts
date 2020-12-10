import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class InfoAlertService {
  constructor(private altCtrl: AlertController) { }

  async ShowInfo(alertMsg: string) {
    const alert = await this.altCtrl.create({
       message: alertMsg,
       buttons: ["OK"]
    });
    await alert.present();
 }
}
