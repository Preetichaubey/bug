import { Component, OnInit } from '@angular/core';
import { ServerService } from '../Services/server.service';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { ShareValuesService } from '../Services/share-values.service';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss'],
})
export class PasswordResetComponent implements OnInit {
  public loader: any;
  public otp="";
  public email = "";
  public password ="";
  public confPassword ="";
  public IsValid_otp = true;
  public IsValid_password = true;
  public IsValid_confPass = true;
  constructor(private dbService: ServerService, public alertCtrl: AlertController,
    public loadingCtrl: LoadingController, public shareService: ShareValuesService,
    public nav: NavController) { }

  ngOnInit() { 
    if(this.shareService.GetValue("ResetPassEmail")) {
      this.email = this.shareService.GetValue("ResetPassEmail");
    }
  }

  async ShowAlert(alrtMsg: string) {
    var alrt = await this.alertCtrl.create({
      message: alrtMsg,
      buttons: [
        "Okay"
      ]
    });
    alrt.present();
  }
  async ShowSuccessAlert(alrtMsg: string) {
    var alrt = await this.alertCtrl.create({
      message: alrtMsg,
      buttons: [{
        text: "Okay",
        handler: () => {
          this.nav.navigateRoot("login");
        }
      }]
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
  Validate_password() {
    if (typeof this.password === undefined || this.password === '' || !this.password) {
      this.IsValid_password = false;
    } else {
      if (this.password.length >= 6) {
        this.IsValid_password = true;
      } else {
        this.IsValid_password = false;
      }
    }
  }
  Validate_confPass() {
    if (typeof this.confPassword === undefined || this.confPassword === '' || !this.confPassword) {
      this.IsValid_confPass = false;
    } else {
      if (this.confPassword === this.password) {
        this.IsValid_confPass = true;
      } else {
        this.IsValid_confPass = false;
      }
    }
  }
  ChangePass() {
    this.LoadingStart();
    this.Validate_OTP();
    this.Validate_password();
    this.Validate_confPass();
    if(this.IsValid_otp && this.IsValid_password && this.IsValid_confPass) {
      this.dbService.ResetPassword(this.email, this.otp, this.password, this.confPassword).then(_r => {
        this.LoadingStop();
        if(_r === 0 || _r === 3) {
          this.ShowAlert("Entered OTP is invalid or expired");
        } else if(_r === 1) {
          this.ShowSuccessAlert("Password successfully changed.");
        } else if(_r === 2) {
          this.ShowAlert("Password and confirm password does not match.");
        }
      }).catch(() => {
        this.LoadingStop();
        this.ShowAlert("Password not changed, please try again.");
      });
    } else {
      this.LoadingStop();
    }
  }
}
