import { Component, OnInit, OnDestroy } from '@angular/core';
import { ServerService, IUser } from 'src/app/Services/server.service';
import { AlertController, NavController } from '@ionic/angular';

@Component({
   selector: 'app-group-create',
   templateUrl: './group-create.component.html',
   styleUrls: ['./group-create.component.scss'],
})
export class GroupCreateComponent implements OnInit, OnDestroy {
   public GroupName: string = '';
   public GroupNameIcon: string = "alert";
   public ShowGroupNameLoader = false;
   public FrndsSelected: IClasses[] = [];
   public FriendIds: number[] = [];
   public Friends: IUser[] = [];
   public JoiningType = 0;
   public ShouldCreateGroup = false;
   constructor(public dbServer: ServerService, public alertCtrl: AlertController, public nav: NavController) { }

   ngOnInit() { 
      this.GetAllFriends();
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
   CheckIfGroupExists() {
      this.ShowGroupNameLoader = true;
      if (this.GroupName.length >= 3) {
         if (this.GroupName !== '' && this.GroupName !== null && typeof this.GroupName !== undefined) {
            this.dbServer.DoesGroupExists(this.GroupName).then(
               _r => {
                  if (_r === 1) {
                     this.ShowGroupNameLoader = false;
                     this.ShouldCreateGroup = false;
                     this.GroupNameIcon = "close";
                  } else {
                     this.ShowGroupNameLoader = false;
                     this.ShouldCreateGroup = true;
                     this.GroupNameIcon = "checkmark-circle";
                  }
               }
            ).catch(() => {
               this.ShowGroupNameLoader = false;
            });
         }
      } else {
         this.ShowGroupNameLoader = false;
         this.ShouldCreateGroup = false;
         this.GroupNameIcon = "close";
      }
   }
   SaveGroup() {
      if (this.ShouldCreateGroup && this.GroupName !== '' && typeof this.GroupName !== undefined) {
         if (this.JoiningType > 0 && ((this.JoiningType === 1 && this.FriendIds.length > 0) || this.JoiningType === 2)) {
            console.log("Create");
            this.dbServer.CreateGroup(this.GroupName, this.FriendIds, this.JoiningType).then(_r => {
               if (_r) {
                  console.log("created");
                  this.ShowSuccessAlert("Group successfully created.");
               } else {
                  this.ShowAlert("Group not created. Please check group name.");
                  console.log("Rejected");
               }
            });
         } else {
            this.ShowAlert('Please select Friends or send to all button.');
         }
      } else {
         this.ShowAlert("Invalid group name.");
      }
   }
   segmentChanged(ev) {
      console.log(ev.detail.value);

   }
   SelectFriend(FriendId) {
      if (FriendId) {
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
            } else if (this.FriendIds.length < 4) {
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
      this.JoiningType = 1;
      this.dbServer.GetAllFriends().then((_r: IUser[]) => {
         this.Friends = _r;
         this.FriendIds = [];
         for (let i = 0; i < _r.length; i++) {
            this.FrndsSelected[i] = {} as IClasses;
            this.FrndsSelected[i].icon = "hide";
            this.FrndsSelected[i].avatar = "show";
         }
      });
   }
   SendRequestToAll() {
      this.JoiningType = 2;
   }
}
export interface IClasses {
   icon: string,
   avatar: string
}