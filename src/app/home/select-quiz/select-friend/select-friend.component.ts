import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController, AlertController, NavController, LoadingController } from '@ionic/angular';
import { ServerService, IUser } from 'src/app/Services/server.service';
import { GroupQuizService } from 'src/app/Services/group-quiz.service';
import { ShareValuesService } from 'src/app/Services/share-values.service';
import { IGroup } from 'src/app/Services/AllInterfaces';

@Component({
   selector: 'app-select-friend',
   templateUrl: './select-friend.component.html',
   styleUrls: ['./select-friend.component.scss'],
})
export class SelectFriendComponent implements OnInit {
   public FrndsSelected: IClasses = {} as IClasses;
   public FriendId: number = -1;
   public Friends: IUser[] = [];
   public IsFrndSelectionProcessing = false;
   public ShowUsers = false;
   public ShouldCreateGroup = false;
   public UpdateGroupId: string;
   public GroupData: IGroup;
   public loader: any;

   constructor(public shareService: ShareValuesService, public dbServer: ServerService,
      public alertCtrl: AlertController, public nav: NavController, public modalCtrl: ModalController,
      public loadingCtrl: LoadingController) { }

   ngOnInit() {
      this.GetAllFriends();
      this.FriendId = -1;
      //this.SelectFriend(0);
   }
   ngOnDestroy() {
      this.LoadingStop();
   }
   async LoadingStart() {
      this.loader = await this.loadingCtrl.create({
         message: "Please wait...",
         duration: 20000
      });
      this.loader.present();
   }
   LoadingStop() {
      //console.log("stopping Loader");
      setTimeout(() => {
         if (this.loader) {
            //console.log("Loader Stop");
            this.loader.dismiss();
         } else {
            console.log("Loading could not be stopped");
         }
      }, 700);
   }
   dismiss() {
      // using the injected ModalController this page
      // can "dismiss" itself and optionally pass back data
      this.modalCtrl.dismiss();
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
               this.nav.navigateRoot("home/groupsall");
            }
         }
         ]
      });
      alrt.present();
   }
   Play() {
      this.dbServer.SetProperty("MatchType", "0");
      this.dbServer.SetProperty("AmI2ndPlayer", "0");
      this.LoadingStart();
         localStorage.setItem("AgainstId", '2');
         console.log("FriendId : ", this.FriendId);
         this.dbServer.SendQuizRequestToFriends(+this.FriendId).then(
            data => {
               this.LoadingStop();
               console.log("Request Sent : ", data);
               if (data !== 0 && data && data !== undefined && data !== null && typeof data !== undefined) {
                  this.dbServer.SetProperty("testId", data);
                  this.nav.navigateForward('home/playquiz');
               }
               else {
                  this.dbServer.SetProperty("testId", 0);
               }
               this.dismiss();
            }
         ).catch(() => { this.LoadingStop(); });
         //this.navCtrl.push(OnlineFriendsPage);
   }
   SelectFriend(FriendId) {
      if (!this.IsFrndSelectionProcessing) {
         this.IsFrndSelectionProcessing = true;
         let PreviousFrndListIndex = this.Friends.findIndex((f) => f.id == this.FriendId.toString());
         let FrndListIndex = this.Friends.findIndex((f) => f.id == FriendId);
         if (FrndListIndex >= 0) {

            if (+FriendId != this.FriendId) {
               this.FrndsSelected[FrndListIndex].icon = "show";
               this.FrndsSelected[FrndListIndex].avatar = "hide";
               this.FriendId = FriendId;
            } else {
               this.FriendId = -1;
            }
            
            if (PreviousFrndListIndex >= 0) {
               this.FrndsSelected[PreviousFrndListIndex].icon = "hide";
               this.FrndsSelected[PreviousFrndListIndex].avatar = "show";
            }
         }
         this.IsFrndSelectionProcessing = false;
      }
   }

   async GetAllFriends() {
      let IsResolved = false;
      this.dbServer.GetAllFriends().then(async (_r: IUser[]) => {
         console.log("_r : ", _r);
         let u: IUser = {} as IUser;
         u = {id: "0", userName: "Random Friend", fname: "Random Friend", lname: "", email: "", mobile: 0, picture: "", schoolName: ""} as IUser;
         let std = await this.dbServer.GetPropertyAsPromise("std");
         await new Promise((resolve)=>{
            if(_r.length === 0){
               resolve();
            }
            for(let i=0; i<_r.length; i++){
               if(std == _r[i].std){
                  this.Friends.push(_r[i]);
               }
               if(i == (_r.length - 1)){
                  resolve();
               }
            }
         });
         //this.Friends = _r;
         
         this.Friends.unshift(u);
         this.FriendId = 0;

         let p2 = new Promise((resolve) => {
            for (let i = 0; i < this.Friends.length; i++) {
               this.FrndsSelected[i] = {} as IClasses;
               this.FrndsSelected[i].icon = "hide";
               this.FrndsSelected[i].avatar = "show";
               if (i == (this.Friends.length - 1)) {
                  console.log("Resolved first");
                  setTimeout(() => {
                     this.SelectFriend(0);   
                  }, 200);
                  IsResolved = true;
                  resolve();
               }
            }
            setTimeout(() => {
               if(!IsResolved) {
                  console.log("Resolved Latter");
                  this.SelectFriend(0);
                  resolve();
               }
            }, 2000);
         });

         Promise.all([p2]).then(() => { this.ShowUsers = true; })
            .catch(() => { this.ShowUsers = true });

      });
   }

}
export interface IClasses {
   icon: string,
   avatar: string
}
