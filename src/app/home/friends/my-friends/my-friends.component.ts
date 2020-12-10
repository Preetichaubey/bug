import { Component, OnInit } from '@angular/core';
import { ServerService, IUser } from 'src/app/Services/server.service';
import { IClasses } from '../../select-quiz/search-group/search-group.page';
import { LoadingController, AlertController } from '@ionic/angular';

@Component({
   selector: 'app-my-friends',
   templateUrl: './my-friends.component.html',
   styleUrls: ['./my-friends.component.scss'],
})
export class MyFriendsComponent implements OnInit {
   public FrndsSelected: IClasses[] = [];
   public FriendIds: number[] = [];
   public Friends: IUser[] = [];
   public loader: any;
   constructor(public dbServer: ServerService, public loadingCtrl: LoadingController,
      public alertCtrl: AlertController) { }

   ngOnInit() {
      this.GetAllFriends();
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
      if(this.loader){
        this.loader.dismiss();
      }
    }
   GetAllFriends() {
      console.log("getting");
      
      this.LoadingStart();
      this.dbServer.GetAllFriends().then((_r: IUser[]) => {
         console.log("got");
         this.LoadingStop();
         this.Friends = _r;
         this.FriendIds = [];
         for (let i = 0; i < _r.length; i++) {
            this.FrndsSelected[i] = {} as IClasses;
            this.FrndsSelected[i].icon = "hide";
            this.FrndsSelected[i].avatar = "show";
         }
      }).catch((e)=>{this.LoadingStop();console.log("error")});
   }
   Unfriend(FriendId) {
      if(FriendId && FriendId > 0){
         this.LoadingStart();
         this.dbServer.Unfriend(FriendId).then(_s => {
            this.LoadingStop();
            if(_s === 1) {
               this.GetAllFriends();
               this.ShowAlert("Success..");
            } else{
               this.ShowAlert("User not removed from your friends list, please try again");
            }
         }).catch(() => {
            this.LoadingStop();
            this.ShowAlert("Oops..! Something is wrong, please try again later");
         });
      }
   }
}
