import { Component, OnInit } from '@angular/core';
import { ServerService } from 'src/app/Services/server.service';
import { AlertController, LoadingController, NavController } from '@ionic/angular';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent implements OnInit {
  public loader: any;
  public CurrPassword="";
  public password ="";
  public confPassword ="";
  public IsValid_currPass = true;
  public IsValid_password = true;
  public IsValid_confPass = true;
  constructor(private dbService: ServerService, public alertCtrl: AlertController,
    public loadingCtrl: LoadingController, public nav: NavController) { }

  ngOnInit() { }
  async ShowSuccessAlert(alrtMsg: string) {
    var alrt = await this.alertCtrl.create({
      message: alrtMsg,
      buttons: [{
        text: "Okay",
        handler: () => {
          this.nav.navigateRoot("home");
        }
      }]
    });
    alrt.present();
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
  Validate_currPassword() {
    if (typeof this.CurrPassword === undefined || this.CurrPassword === '' || !this.CurrPassword) {
      this.IsValid_currPass = false;
    } else {
      if (this.CurrPassword.length >= 1) {
        this.IsValid_currPass = true;
      } else {
        this.IsValid_currPass = false;
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
    this.Validate_currPassword();
    this.Validate_password();
    this.Validate_confPass();
    if(this.IsValid_currPass && this.IsValid_password && this.IsValid_confPass) {
      this.dbService.ChangePassword(this.CurrPassword, this.password, this.confPassword).then(_r => {
        this.LoadingStop();
        if(_r === 0 || _r === 3) {
          this.ShowAlert("Password not changed, please try again.");
        } else if(_r === 1) {
          this.ShowSuccessAlert("Password successfully changed.");
        } else if(_r === 2) {
          this.ShowAlert("Password and confirm password does not match.");
        }
      }).catch(() => {
        this.LoadingStop();
        this.ShowAlert("Password not changed, please try again.");
      })
    } else {
      this.LoadingStop();
    }
  }
}
