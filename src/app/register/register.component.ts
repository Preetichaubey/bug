import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, Events, AlertController, Platform, MenuController, LoadingController } from '@ionic/angular';
import { ServerService } from '../Services/server.service';
declare var $: any;

@Component({
   selector: 'app-register',
   templateUrl: './register.component.html',
   styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {

   public fname: string;
   public lname: string;
   public email: string;
   public mobile: number;
   /* public username: string; */
   public schoolname: string;
   public password: string;
   public confPassword: string;
   public refCode: string;
   public std: number;
   public IsValid_fname = true;
   public IsValid_lname = true;
   public IsValid_email = true;
   public IsValid_mobile = true;
   /* public IsValid_username = true; */
   public IsValid_password = true;
   public IsValid_confPass = true;
   public IsValid_std = true;
   public IsAccepted = false;
   public alert: any;
   public loader: any;

   public imagePath;
   imgURL: any;
   public message: string;

   constructor(public loadingCtrl: LoadingController, public navCtrl: NavController, public dbServer: ServerService, public alertCtrl: AlertController) {

      //cordova.plugins.Keyboard.disableScroll(true);
   }
   ngOnInit() { }
   async LoadingStart() {
      this.loader = await this.loadingCtrl.create({
         message: "Please wait...",
         duration: 20000
      });
      this.loader.present();
      return 0;
   }
   LoadingStop() {
      if (this.loader) {
         this.loader.dismiss();
      }
   }
   async ShowAlert(header, subheader) {
      this.alert = await this.alertCtrl.create({
         header: header,
         subHeader: subheader,
         buttons: ['OK']
      });
      await this.alert.present();
   }
   async RegisterSuccessAlert(header, subheader) {
      this.alert = await this.alertCtrl.create({
         header: header,
         subHeader: subheader,
         buttons: [{
            text: 'OK',
            handler: () => {
               this.navCtrl.navigateRoot(['login']);
            }
         }]
      });
      await this.alert.present();
   }
   HideAlert() {
      this.alert.remove();
   }
   ionViewDidLoad() {
      console.log('ionViewDidLoad RegistrationPage');
   }
   Validate_fName() {
      if (typeof this.fname === undefined || this.fname === '' || !this.fname) {
         this.IsValid_fname = false;
      } else { this.IsValid_fname = true; }
   }
   Validate_lName() {
      if (typeof this.lname === undefined || this.lname === '' || !this.lname) {
         this.IsValid_lname = false;
      } else { this.IsValid_lname = true; }
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
               //console.log(r);
               this.IsValid_email = true;
            } else { this.IsValid_email = false; }
         } else {
            this.IsValid_email = false;
         }
      }
      //console.log(this.IsValid_email);
   }
   Validate_mobile() {
      //this.IsValid_mobile = true;
      if (typeof this.mobile === undefined || this.mobile === null || this.mobile === 0 || !this.mobile || this.mobile.toString() === '') {
         this.IsValid_mobile = false;
      } else {
         if (isNaN(this.mobile)) {
            this.IsValid_mobile = false;
         } else {
            if (this.mobile > 1000000000 && this.mobile < 9999999999) {
               this.IsValid_mobile = true;
            } else {
               this.IsValid_mobile = false;
            }
         }
      }
   }
   /* Validate_Username() {
       if (typeof this.username === undefined || this.username === '' || !this.username) {
           this.IsValid_username = false;
       } else {
           this.IsValid_username = true;
       }
   } */
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
   Validate_std() {
      if (typeof this.std === undefined || this.std === 0 || !this.std) {
         this.IsValid_std = false;
      } else {
         this.IsValid_std = true;
      }
   }
   Validate_All() {
      this.Validate_fName();
      this.Validate_lName();
      this.Validate_mobile();
      this.Validate_email();
      this.Validate_password();
      this.Validate_confPass();
      this.Validate_std();
   }
   async TryRegister() {
      await this.LoadingStart();
      this.Validate_All();
      if (this.IsAccepted) {
         setTimeout(() => {
            if (this.IsValid_fname && this.IsValid_lname && this.IsValid_email && this.IsValid_mobile && this.IsValid_password && this.IsValid_confPass && this.IsValid_std) {
               var formData2 = new FormData();
               formData2.append("sts", "1");
               formData2.append("val", this.email);
               this.dbServer.PostData('https://sarmicrosystems.in/quiztest/checkpg.php', formData2)
                  .then(
                     IsEmailValid => {
                        console.log("Email validate : ", IsEmailValid);

                        if (typeof IsEmailValid == undefined || IsEmailValid == null || IsEmailValid == '' || IsEmailValid == '0') {
                           this.Register();
                        } else {
                           this.LoadingStop();
                           this.ShowAlert('', 'Email id already exists.');
                        }
                     }
                  ).catch(() => {
                     this.LoadingStop();
                  });
            } else {
               this.LoadingStop();
               console.log("invalid");
               this.ShowAlert('', 'Data in one or more fields is invalid. Kindly correct and submit again.');
               return false;
            }
         }, 700);
      } else {
         setTimeout(() => {
            this.LoadingStop();
         }, 300);
         this.ShowAlert("", "You cannot register without accepting terms and conditions.");
      }
   }
   /* TryRegister() {
       this.Validate_All();
       if(this.IsAccepted) {
         setTimeout(() => {
             if (this.IsValid_fname && this.IsValid_lname && this.IsValid_email && this.IsValid_mobile && this.IsValid_password && this.IsValid_confPass && this.IsValid_std) {
               var formData = new FormData();
               formData.append("sts", "2");
               formData.append("val", this.username);
               this.dbServer.PostData(this.dbServer.CommUrl + 'checkpg.php', formData)
               .then(
                   IsValid => {
                     console.log("Username : ", IsValid);
                     if(typeof IsValid === undefined || IsValid === null || IsValid === '' || IsValid == '0'){
                       if (typeof this.email === undefined || this.email === '' || !this.email) {
                         this.Register();
                       } else {
                         var formData2 = new FormData();
                         formData2.append("sts", "1");
                         formData2.append("val", this.email);
                         this.dbServer.PostData('https://sarmicrosystems.in/quiztest/checkpg.php', formData2)
                           .then(
                             IsEmailValid => {
                               console.log("Emaqil validate : ", IsEmailValid);
                               
                               if(typeof IsEmailValid == undefined || IsEmailValid == null || IsEmailValid == '' || IsEmailValid == '0'){
                                 this.Register();
                               } else {
                                 this.ShowAlert('', 'Email id already exists.');
                               }
                             }
                           );
                       }
                     } else {
                       this.ShowAlert('', ' Please select another username');
                     }
                   },
                   error =>   {
                       console.error(error);
                       this.ShowAlert('', 'Oops. Something is wrong, please try again after some time.');
                       });
             } else {
                 console.log("invalid");
                 this.ShowAlert('', 'Some fields are invalid or emplty.');
                 return false;
             }
         }, 700);
       } else {
         this.ShowAlert("", "You cannot register without accepting terms and conditions.");
       }
   } */
   Register() {

      var formData = new FormData();
      formData.append("img", "");
      formData.append("name", this.fname);
      formData.append("lname", this.lname);
      formData.append('email', this.email);
      formData.append('schname', this.schoolname);
      formData.append('mobile', this.mobile.toString());
      formData.append('class1', this.std.toString());
      formData.append('refcode', this.refCode);
      //formData.append('uname', this.username);
      formData.append('password', this.password);
      //formData.append('confPass', this.confPassword);
      this.dbServer.PostData(this.dbServer.CommUrl + 'api/account/register.php', formData)
         .then(
            data => {
               this.LoadingStop();
               console.log(data);
               if (data == 1) {
                  this.RegisterSuccessAlert('Success!', 'Thank you. You have successfully registered for class '+this.std.toString()+'th on Quiz2shine, the No. 1 choice of smart students to check their learning in a fun way.');
               } else {
                  this.ShowAlert('Oops', 'Registration failed.');
               }
            },
            error => {
               console.error(error);
               this.LoadingStop();
               this.ShowAlert('', 'Oops. Something is wrong, please try again after some time.');
            }
         ).catch((error) => {
            this.LoadingStop();
            console.error(error);
            this.ShowAlert('', 'Oops. Something is wrong, please try again after some time.');
         });

   }
   preview(files) {
      if (files.length === 0)
         return;

      var mimeType = files[0].type;
      if (mimeType.match(/image\/*/) == null) {
         this.message = "Only images are supported.";
         return;
      }

      var reader = new FileReader();
      this.imagePath = files;
      reader.readAsDataURL(files[0]);
      reader.onload = (_event) => {
         this.imgURL = reader.result;
      }
   }
   SelectProfile() {
      console.log("getProfile");
      $(".profile-picture").click();
   }
   PrivacyPolicy() {
      this.navCtrl.navigateForward("privacy-policy");
   }
   Tnc() {
      this.navCtrl.navigateForward("tnc");
   }
}
