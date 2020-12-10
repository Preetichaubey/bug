import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController, AlertController, NavController } from '@ionic/angular';
import { ServerService, IUser } from 'src/app/Services/server.service';
import { GroupQuizService } from 'src/app/Services/group-quiz.service';
import { ShareValuesService } from 'src/app/Services/share-values.service';
import { IGroup } from 'src/app/Services/AllInterfaces';

@Component({
   selector: 'app-update-group',
   templateUrl: './update-group.component.html',
   styleUrls: ['./update-group.component.scss'],
})
export class UpdateGroupComponent implements OnInit, OnDestroy {

   public FrndsSelected: IClasses[] = [];
   public FriendIds: number[] = [];
   public Friends: IUser[] = [];
   public ShouldCreateGroup = false;
   public UpdateGroupId: string;
   public GroupData: IGroup;

   constructor(public shareService: ShareValuesService, public dbServer: ServerService,
      public alertCtrl: AlertController, public nav: NavController) { }

   ngOnInit() {
      this.shareService.GetValueAsPromise("UpdateGroupId").then(_gi => {
         if (_gi) {
            this.shareService.GetValueAsPromise("UpdateGroupData").then(_gd => {
               this.GroupData = _gd as IGroup;
               console.log(this.GroupData);
               this.UpdateGroupId = _gi;
               this.GetAllFriends();
            }).catch((_gdE) => { console.log("Error : ", _gdE) });
         }
      }).catch((_giE) => { console.log("Error : ", _giE) });
   }
   ngOnDestroy() {

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
   SaveGroup() {
      if (!this.ShouldCreateGroup && this.UpdateGroupId !== '' && typeof this.UpdateGroupId !== undefined) {
            this.dbServer.UpdateGroup(this.UpdateGroupId, this.FriendIds).then(_r => {
               if (_r) {
                  this.ShowSuccessAlert("Request successfully sent.");
               } else {
                  this.ShowAlert("Request not sent");
               }
            });
      } else {
         this.ShowAlert("Invalid request.");
      }
   }
   SelectFriend(FriendId) {
      if (FriendId) {
         let FrndListIndex = this.Friends.findIndex((f) => f.id == FriendId);
         let Selectedindex = this.FriendIds.findIndex((element) => element == FriendId);
         console.log("index: ", Selectedindex);
         if (FrndListIndex >= 0) {
            if (Selectedindex >= 0) {
               console.log("Removed");
               this.FrndsSelected[FrndListIndex].icon = "hide";
               this.FrndsSelected[FrndListIndex].avatar = "show";
               this.FriendIds.splice(Selectedindex);
            } else if ((this.FriendIds.length + (this.GroupData.Members.length + 1)) < 5) {
               console.log("Added");
               this.FrndsSelected[FrndListIndex].icon = "show";
               this.FrndsSelected[FrndListIndex].avatar = "hide";
               this.FriendIds.push(FriendId);
            } else {
               this.ShowAlert("Maximum 4 friends can be selected.");
            }
            console.log("List : ", this.FriendIds);
         }
      }
   }

   GetAllFriends() {
      this.dbServer.GetAllFriends().then((_r: IUser[]) => {
         this.Friends = _r;
         for (let i = 0; i < this.GroupData.Members.length; i++) {
            let FrndListIndex = this.Friends.findIndex((f) => +f.id == this.GroupData.Members[i].Id);
            if (FrndListIndex >= 0) {
               this.Friends.splice(FrndListIndex,1);
            }
         }
         this.FriendIds = [];
         for (let i = 0; i < this.Friends.length; i++) {
            this.FrndsSelected[i] = {} as IClasses;
            this.FrndsSelected[i].icon = "hide";
            this.FrndsSelected[i].avatar = "show";
         }
      });
   }
}
export interface IClasses {
   icon: string,
   avatar: string
}
