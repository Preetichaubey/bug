import { Component, OnInit } from '@angular/core';
import { ServerService } from 'src/app/Services/server.service';
import { AlertController, LoadingController } from '@ionic/angular';

@Component({
   selector: 'app-verify-otp',
   templateUrl: './verify-otp.component.html',
   styleUrls: ['./verify-otp.component.scss'],
})
export class VerifyOtpComponent implements OnInit {
   public loader: any;
   public otp = "";
   public IsValid_otp = true;
   constructor(private dbService: ServerService, public alertCtrl: AlertController,
      public loadingCtrl: LoadingController) { }

   ngOnInit() { }

   async ShowAlert(alrtMsg: string) {
      var alrt = await this.alertCtrl.create({
         message: alrtMsg,
         buttons: [
            "Okay"
         ]
      });
      alrt.present();
   }
   async LoadingStart() {
      this.loader = await this.loadingCtrl.create({
         message: "Please wait...",
         duration: 20000
      });
      this.loader.present();
   }
   LoadingStop() {
      setTimeout(() => {
         if (this.loader) {
            this.loader.dismiss();
         }
      }, 200);

   }
   Validate_OTP() {
      if (typeof this.otp === undefined || this.otp === '' || !this.otp) {
         this.IsValid_otp = false;
      } else {
         if (this.otp.length >= 1) {
            this.IsValid_otp = true;
         } else {
            this.IsValid_otp = false;
         }
      }
   }
}
