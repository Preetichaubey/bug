import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController, AlertController, NavController, LoadingController } from '@ionic/angular';
import { ServerService, IUser } from 'src/app/Services/server.service';
import { GroupQuizService } from 'src/app/Services/group-quiz.service';

@Component({
   selector: 'app-search',
   templateUrl: './search.component.html',
   styleUrls: ['./search.component.scss'],
})
export class SearchComponent implements OnInit, OnDestroy {

   MyGroupId: number;
   public SearchText: string = '';
   public GroupNameIcon: string = "alert";
   public ShowGroupNameLoader = false;
   public FrndsSelected: IClasses[] = [];
   public FriendIds: number[] = [];
   public Friends: IUser[] = [];
   public loader: any;
   constructor(public dbServer: ServerService, public loadingCtrl: LoadingController, public groupService: GroupQuizService, public modalCtrl: ModalController, public alertCtrl: AlertController, public nav: NavController) { }

   ngOnInit() {
   }
   ngOnDestroy() {

   }
   async LoadingStart() {
      this.loader = await this.loadingCtrl.create({
         message: "Sending request...",
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
   private IsProcessingDone = true;
   SelectFriend(FriendId) {
      /* if (FriendId && this.IsProcessingDone) {
         this.IsProcessingDone = false;
         const isFound = (element) => element == FriendId;
         let FrndListIndex = this.Friends.findIndex((f) => f.id == FriendId);
         let Selectedindex = this.FriendIds.findIndex(isFound);
         console.log("index: ", Selectedindex);
         if (FrndListIndex >= 0) {
            if (Selectedindex >= 0) {
               console.log("Removed");
               this.FrndsSelected[FrndListIndex].icon = "hide";
               this.FrndsSelected[FrndListIndex].avatar = "show";
               this.FriendIds.splice(Selectedindex);
               setTimeout(() => {
                  this.IsProcessingDone = true;
               }, 200);
            } else {
               console.log("Added");
               this.FrndsSelected[FrndListIndex].icon = "show";
               this.FrndsSelected[FrndListIndex].avatar = "hide";
               this.FriendIds.push(FriendId);
               setTimeout(() => {
                  this.IsProcessingDone = true;
               }, 200);
            }
         } else {
            setTimeout(() => {
               this.IsProcessingDone = true;
            }, 200);
         }
      } */
   }
   async SendFriendRequest(FriendId, FrndStd) {
      let myStd = await this.dbServer.GetPropertyAsPromise("std");
      console.log("myStd: ", myStd);
      console.log("FrndStd: ", FrndStd);
      if(myStd !== FrndStd) {
         this.ShowAlert("You can not send request to friend from another class");
         return;
      }
      this.LoadingStart();
      let userid = await this.dbServer.GetPropertyAsPromise("userid");
      let fd = new FormData();
      fd.append("p1_id", userid);
      fd.append("p2_id", FriendId);
      console.log("userid: ", userid);
      console.log("FriendId: ", FriendId);
      this.dbServer.PostData(this.dbServer.CommUrl+"api/friend/send_friend_request.php", fd).then(
         data=>{
            this.LoadingStop();
            if(data === '1'){
               this.ShowAlert("Friend request sent successfully.");
            } else if(data === '2') {
               this.ShowAlert("Cann't send friend request to those who are already in your friend list");
            } else if(data === '3') {
               this.ShowAlert("You have already sent a request, please wait for your friend to accept the request");
            } else if(data === '4') {
               this.ShowAlert("Your friend already have sent you the friend request, please accept the request from Menu > Friends > Friend Requests");
            } else if(data === '5') {
               this.ShowAlert("You can not send request to friend from another class");
            }
         }
      ).catch(e => {
         this.LoadingStop();
         console.log(e);
      });
   }
   SearchFriend() {
      this.LoadingStart();
      if (this.SearchText.length > 0) {
         this.FrndsSelected = [];
         this.dbServer.SearchPlayer(this.SearchText).then((_r: IUser[]) => {
            this.Friends = _r;
            this.FriendIds = [];
            for (let i = 0; i < _r.length; i++) {
               this.FrndsSelected[i] = {} as IClasses;
               this.FrndsSelected[i].icon = "hide";
               this.FrndsSelected[i].avatar = "show";
            }
            this.LoadingStop();
         }).then((e)=>{
            this.LoadingStop();
         });
      }
   }
}
export interface IClasses {
   icon: string,
   avatar: string
}