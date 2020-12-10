import { Component, OnInit } from '@angular/core';
import { NavController, Events, AlertController, Platform, MenuController, LoadingController } from '@ionic/angular';
import { ServerService } from '../../Services/server.service';
import { InfoAlertService } from '../../Services/info-alert.service';
declare var $: any;
@Component({
   selector: 'app-profile',
   templateUrl: './profile.component.html',
   styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
   public fname: string;
   public lname: string;
   public email: string;
   public mobile: number;
   public username: string;
   public schoolname: string;
   public std: number;
   public loader: any;
   public IsValid_fname = true;
   public IsValid_lname = true;
   public IsValid_email = true;
   public IsValid_mobile = true;
   public IsValid_std = true;
   public alert: any;
   public IsEdit = false;

   public imagePath;
   imgURL: any;
   public message: string;

   constructor(public navCtrl: NavController, public dbServer: ServerService, public alertCtrl: AlertController,
      public loadingCtrl: LoadingController, private info: InfoAlertService) {

      //cordova.plugins.Keyboard.disableScroll(true);
   }
   ngOnInit() {
      this.ReadMyProfile();
   }
   public InfoBtn(btnType) {
      let msg = "";
      if(btnType == "std"){
        msg = `Edit class is temporarily disabled. <br>
         <br>
        If you wish to play quiz in some other class, please register for that class using another email id.`;
      }
      this.info.ShowInfo(msg);
    }
   public RefresherEvent:any;
   doRefresh(event) {
      this.RefresherEvent = event;
      this.ngOnInit();
      setTimeout(() => {
         this.RefresherEvent.target.complete();
      }, 10000);
   }
   async LoadingStart(Msg = "Please wait...", Duration = 10000) {
      this.loader = await this.loadingCtrl.create({
         message: Msg,
         duration: Duration
      });
      this.loader.present();
   }
   LoadingStop() {
      setTimeout(() => {
         if (this.loader) {
            this.loader.dismiss();
         } else {
            console.log("Loading could not be stopped");
         }
      }, 200);
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
   Edit(){
      $(".display-profile").css("display", "none");
      $(".edit-profile").css("display", "block");
      $(".btn-edit").css("display","none");
   }
   ReadMyProfile() {
      this.LoadingStart();
      this.dbServer.GetMyProfile().then(
         data => {
            console.log("Profile : ", data);
            this.LoadingStop();
            if(this.RefresherEvent) {
               this.RefresherEvent.target.complete();
            }
            this.fname = data.fname;
            this.lname = data.lname;
            this.email = data.email;
            this.mobile = data.mobile;
            this.username = data.userName;
            this.schoolname = data.schoolName;
            this.std = data.std;
            localStorage.setItem("name", data.fname);
            localStorage.setItem("userName", data.userName);
            localStorage.setItem("std", data.std.toString());
         }
      );
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
         this.IsValid_email = true;
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
      console.log(this.IsValid_email);

   }
   Validate_mobile() {
      //this.IsValid_mobile = true;
      if (typeof this.mobile === undefined || this.mobile === null || this.mobile === 0 || !this.mobile || this.mobile.toString() === '') {
         this.IsValid_mobile = true;
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
      //this.Validate_mobile();
      //this.Validate_email();
      this.Validate_std();
   }

   SaveProfile() {
      //this.LoadingStart();
      console.log(this.IsValid_fname + " : " + this.IsValid_lname  + " : " + this.IsValid_std);
      
      this.Validate_All();
      setTimeout(() => {
         if (this.IsValid_fname && this.IsValid_lname  && this.IsValid_std) {
            $(".display-profile").css("display", "block");
            $(".edit-profile").css("display", "none");
            $(".btn-edit").css("display","block");
            this.dbServer.GetPropertyAsPromise("userid").then(_uId => {
               var formData = new FormData();
               formData.append("img", "");
               formData.append('userid', _uId);
               formData.append("fname", this.fname);
               formData.append("lname", this.lname);
               //formData.append('email', this.email);
               formData.append('school', this.schoolname);
               //formData.append('mobile', this.mobile.toString());
               formData.append('class1', this.std.toString());
               this.dbServer.PostData(this.dbServer.CommUrl+'api/profile/profile_update.php', formData)
                  .then(
                     data => {
                        this.LoadingStop();
                        console.log(data);
                        if (data == 1) {
                           this.RegisterSuccessAlert('Success!', 'Profile Updated.');
                           localStorage.setItem("std", this.std.toString());
                           setTimeout(() => {
                              this.ReadMyProfile();
                           }, 200);
                        } else {
                           this.ShowAlert('Oops', 'Profile not updated.');
                        }
                     },
                     error => {
                        this.LoadingStop();
                        console.error(error);
                        this.ShowAlert('', 'Oops. Something is wrong, please try again after some time.');
                     }
                  );
            });
         } else {
            console.log("invalid");
            this.ShowAlert('', 'Some fields are invalid or emplty.');
            return false;
         }
      }, 700);
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
   ChangePass() {
      this.navCtrl.navigateForward("home/changepassword");
   }
}
