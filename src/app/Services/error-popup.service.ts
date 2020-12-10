import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ErrorPopupService {
  private ShouldDisplay = false;
  constructor(private alrt: AlertController) { }

  public DisplayAlert(err) {
    if(this.ShouldDisplay) {
      const alt = this.alrt.create({
        header: "Error",
        message: err,
        buttons: ["Okay"]
      });
    }
  }
}
