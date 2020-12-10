import { Component, OnInit } from '@angular/core';
import { ServerService } from '../Services/server.service';
import { AlertController, LoadingController, NavController } from '@ionic/angular';
import { ShareValuesService } from '../Services/share-values.service';

@Component({
  selector: 'app-password-forgot',
  templateUrl: './password-forgot.component.html',
  styleUrls: ['./password-forgot.component.scss'],
})
export class PasswordForgotComponent implements OnInit {
  public email = "";
  public IsValid_email = true;
  public loader: any;
  constructor(private dbService: ServerService, public alertCtrl: AlertController,
    public loadingCtrl: LoadingController, public nav: NavController, public shareService: ShareValuesService) { }

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
  async ShowSuccessAlert(alrtMsg: string) {
    var alrt = await this.alertCtrl.create({
      message: alrtMsg,
      buttons: [{
        text: "Ok",
        handler: () => {
          this.nav.navigateRoot("resetpassworsd");
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
  Validate_email() {
    if (typeof this.email === undefined || this.email === '' || !this.email) {
      this.email = '';
      this.IsValid_email = false;
    } else {
      var v: RegExp = new RegExp(/^[0-9a-zA-Z]{1,50}([._]{1}[0-9a-zA-Z]{1,50}){0,10}[@]{1}[a-zA-Z0-9-]{1,30}([.]{1}[a-zA-Z0-9-]{1,20}){1,5}$/);
      var r = this.email.match(v);
      if (r !== null) {
        if (r.length > 0) {
          this.IsValid_email = true;
        } else { this.IsValid_email = false; }
      } else {
        this.IsValid_email = false;
      }
    }
  }
  ForgotPass() {
    this.LoadingStart();
    if(this.IsValid_email) {
      let fd = new FormData();
      fd.append("email", this.email);
      this.dbService.PostDataForSingleTry(this.dbService.CommUrl + "api/profile/forget_password.php", fd).then(_r => {
        this.LoadingStop();
        console.log("_r : ", _r);
        if(_r === 1 || _r === "1") {
          this.shareService.SetValue("ResetPassEmail", this.email);
          this.ShowSuccessAlert(`OTP has been sent to your registered email address. Use the OTP to reset your password. (Also check SPAM folder). <br>
          <br><br>
          Please note: OTP is valild for 30 minutes only. 
          <br><br>
          In case you do not receive OTP, please email us at: Contactus@quiz2shine.com`);
        } else if(_r === 0 || _r === "0") {
          this.ShowAlert("No account found with this email.");
        } else {
          this.nav.navigateRoot("resetpassworsd");
        }
      }).catch(() => {
        this.LoadingStop();
        this.ShowAlert("Oops..! Something went wrong, please try again.")
      })
    } else {
      this.LoadingStop();
    }
  }
}
