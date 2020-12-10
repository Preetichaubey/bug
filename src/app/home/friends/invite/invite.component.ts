import { Component, OnInit } from '@angular/core';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { ServerService } from 'src/app/Services/server.service';
import { AlertController } from '@ionic/angular';
import { link } from 'fs';
import { InfoAlertService } from 'src/app/Services/info-alert.service';

@Component({
   selector: 'app-invite',
   templateUrl: './invite.component.html',
   styleUrls: ['./invite.component.scss'],
})
export class InviteComponent implements OnInit {
   public errMsg = "ErrMsg Here";
   public stsMsg = "Status Msg";
   public SuccessMsg = `Thank you for inviting your friends to join Quiz2Shine app. <br>

   As a token of thanks, we will give you 25 points on your cumulative leaderboard for every friend that registers on Q2S from your invite. <br>
   
   These points will be added as soon as your friend registers.`;
   public inviteEmail = "";
   public IsValid_email = false;
   public ShareLinkFacebook = "";
   public ShareLink = "";
   public ReferenceCode = "";
   public std = "";
   public options: InAppBrowserOptions = {
      location: 'no',
      clearcache: 'yes',
      clearsessioncache: 'yes'
   };
   constructor(private socialShare: SocialSharing, public iab: InAppBrowser, public dbService: ServerService, 
      public altCtrl: AlertController, private info: InfoAlertService) {

   }

   async ngOnInit() {
      this.ReferenceCode = await this.dbService.GetPropertyAsPromise("refCode");
      this.std = await this.dbService.GetPropertyAsPromise("std");
      this.dbService.GetPropertyAsPromise("userid").then(_uId => {
         //https://sarmicrosystems.in/quiztest/web/my-account/my-account.php?rg=194
         //this.ShareLink = "https://sarmicrosystems.in/quiztest/web/my-account/my-account.php?rg=" + _uId;
         this.ShareLink = "https://sarmicrosystems.in/quiztest/app/Quiz2Shine.apk";
         //this.ShareLinkFacebook = "http%3A%2F%2Fsarmicrosystems.in%2Fquiztest%2Fweb%2Fmy-account%2Fmy-account.php?rg=" + _uId;
         this.ShareLinkFacebook = "http%3A%2F%2Fsarmicrosystems.in%2Fquiztest%2Fweb%2FfbTest3.php?rg=" + this.ReferenceCode;
      });
   }
   InfoBtn(btnType) {
      let msg = "";
      if(btnType == "i"){
        msg = `Your friends can register for any class in Q2S. <br>
         <br>
        We will give you 25 points on the cumulative leaderboard for every friend that joins from your invite.
        `;
      }
      if(msg != ""){
         this.info.ShowInfo(msg);
      }
    }
   async ShowAlert(alertMsg: string) {
      const alert = await this.altCtrl.create({
         message: alertMsg,
         buttons: ["OK"]
      });
      await alert.present();
   }

   FacebookShare() {
      let newLink = "https://www.facebook.com/sharer/sharer.php?u=" + this.ShareLinkFacebook;
      const browser = this.iab.create(newLink, "_self", this.options); 

      /* this.socialShare.shareViaFacebook("Hi, I am using this Quiz2Shine app", "https://sarmicrosystems.in/quiztest/img/Quiz2shine.png", this.ShareLinkFacebook)
        .then(d => {
            this.stsMsg = "Success";
            this.EmailRequestSuccessfull();
         })
        .catch(e=> {
            this.stsMsg = "Error";
            this.errMsg = e;
         });
      this.stsMsg = "Inside  Function"; */
   }

   WhatsAppShare() {
      try{
      let whatsAppText = `Quiz2shine app is the New Fun way to check your learning in Math and Science
      
      1) Play topic level quizzes mapped to school syllabus
      2) For classes 6 to 10th
      3) Play with friends, unknown players and 4 levels of Virtual Player (i.e. against computer)
      
      I am registered as a player in class `+this.std+`th with quiz2shine app and I really love it.
      
      Download Quiz2shine app from google playstore (available for android currently) and register. 
      
      Use my reference code to register *`+ this.ReferenceCode + `*

      Let the Fun begin!`;
      this.socialShare.shareViaWhatsApp(whatsAppText, "https://sarmicrosystems.in/quiztest/img/Quiz2shineNew.jpg", this.ShareLink)
         .then(d => {
               this.stsMsg = "Success";
               console.log("success");
               this.EmailRequestSuccessfull();
            })
         .catch(e => {
            this.stsMsg = "Error";
            this.errMsg = e;
            this.ShowAlert(e);
         });
      }catch(e){
         this.ShowAlert(e);
      }
   }

   async ValidateEmailAlert() {
      const alert = await this.altCtrl.create({
         message: "Please enter valid email address",
         buttons: [{
            text: "OK",
            handler: () => {
               this.EmailAlert();
            }
         }]
      });
      await alert.present();
   }

   async EmailRequestSuccessfull() {
      const alert = await this.altCtrl.create({
         message: this.SuccessMsg,
         buttons: ["OK"]
      });
      await alert.present();
   }
   async EmailRequestConfirmation(Name, email) {
      const alert = await this.altCtrl.create({
         message: "Do you want to send friend request to "+Name+" on email "+ email,
         buttons: [{
            text: "Cancel",
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
               this.inviteEmail = '';
            }
         },{
            text: "Ok",
            handler: ()=>{
               this.InviteFriendViaEmail();
            }
         }
      ]
      });
      await alert.present();
   }
   async EmailAlert() {
      console.log("Email : ", this.inviteEmail);

      const alert = await this.altCtrl.create({
         header: 'Enter friend\'s email',
         inputs: [
            {
               name: 'email',
               type: 'text',
               id: 'email-id',
               value: this.inviteEmail,
               placeholder: 'Enter Email Id'
            }
         ],
         buttons: [
            {
               text: 'Cancel',
               role: 'cancel',
               cssClass: 'secondary',
               handler: () => {
                  this.inviteEmail = '';
               }
            }, {
               text: 'Ok',
               handler: (value) => {
                  this.inviteEmail = value.email;
                  console.log(value.email);
                  this.ValidateEmail().then(_isV => {
                     console.log("_isV: ", _isV);
                     if (_isV === true) {
                        //this.CheckEmailRecord();
                        this.InviteFriendViaEmail();
                     } else {
                        this.ValidateEmailAlert();
                     }
                  });
               }
            }
         ]
      });

      await alert.present();
   }

   ValidateEmail(): Promise<boolean> {
      return new Promise((resolve, reject) => {
         if (typeof this.inviteEmail === undefined || this.inviteEmail === '' || !this.inviteEmail) {
            this.inviteEmail = '';
            this.IsValid_email = false;
            resolve(false);
         } else {
            var v: RegExp = new RegExp(/^[0-9a-zA-Z]{1,50}([._]{1}[0-9a-zA-Z]{1,50}){0,10}[@]{1}[a-zA-Z0-9-]{1,30}([.]{1}[a-zA-Z0-9-]{1,20}){1,5}$/);
            var r = this.inviteEmail.match(v);
            if (r !== null) {
               if (r.length > 0) {
                  console.log(r);
                  this.IsValid_email = true;
                  resolve(true);
               } else {
                  this.IsValid_email = false;
                  resolve(false);
               }
            } else {
               this.IsValid_email = false;
               resolve(false);
            }
         }
      });
   }

   //api/friend/send_email_invite.php
   EmailShare() {
      this.EmailAlert();
   }

   CheckEmailRecord(): Promise<boolean> {
      return new Promise((resolve, reject) => {
         this.dbService.GetPropertyAsPromise("userid").then(_uId => {
            let fd = new FormData();
            fd.append("userid", _uId);
            fd.append("email", this.inviteEmail);
            console.log("sending Mail");
            this.dbService.PostData(this.dbService.CommUrl + "api/friend/check_record.php", fd).then(_data => {
               console.log("data: ", _data);
               if (_data && (_data === 3 || _data === "3")) {
                  this.ShowAlert("User is already in your friend list.");
                  resolve(true);
               } else if (_data && (_data === 2 || _data === "2")) {
                  this.InviteFriendViaEmail();
                  //this.ShowAlert("User is already in your friend list.");
               } else if(_data === 0 || _data === "0") {
                  this.ShowAlert("You cann't send friend request to user from another class.");
               } else {
                  this.EmailRequestConfirmation(_data["name"], this.inviteEmail);
               }
            }).catch((e) => {
               console.log(e);
               this.ShowAlert("Invitation not sent.");
               reject(false);
            }); 
         });
      });
   }

   InviteFriendViaEmail(): Promise<boolean> {
      return new Promise((resolve, reject) => {
         this.dbService.GetPropertyAsPromise("userid").then(_uId => {
            let fd = new FormData();
            fd.append("userid", _uId);
            fd.append("friendemail", this.inviteEmail);
            console.log("sending Mail");
            
            this.dbService.PostData(this.dbService.CommUrl + "api/friend/send_email_invite.php", fd).then(_data => {
               console.log("data: ", _data);
               if (_data && (_data === 1 || _data === "1")) {
                  this.inviteEmail = '';
                  this.EmailRequestSuccessfull();
                  resolve(true);
               } else if (_data && (_data === 2 || _data === "2")) {
                  this.inviteEmail = '';
                  this.ShowAlert("User is already in your friend list.");
               } else {
                  this.ShowAlert("Invitation not sent.");
               }
            }).catch(() => {
               this.ShowAlert("Invitation not sent.");
               reject(false);
            });
         });
      });
   }

}
