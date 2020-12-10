import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController, AlertController, LoadingController, PopoverController, ActionSheetController } from '@ionic/angular';
import { ServerService } from 'src/app/Services/server.service';
import { IGroup, IMember } from 'src/app/Services/AllInterfaces';
import { ShareValuesService } from 'src/app/Services/share-values.service';
declare var $:any;
@Component({
  selector: 'app-groups-all',
  templateUrl: './groups-all.component.html',
  styleUrls: ['./groups-all.component.scss'],
})
export class GroupsAllComponent implements OnInit, OnDestroy {
  private touchcounter = 0;
  private touchTimer:any;
  private PreviousOpenId = 0;
  public Groups: IGroup[] =[];
  public SelfUserId = 0;
  constructor(public nav: NavController, public popoverController: PopoverController, 
    public dbServer: ServerService, public alertCtrl: AlertController, 
    public loadingctrl: LoadingController, public actionSheetController: ActionSheetController,
    public shareService: ShareValuesService) { }

  ngOnInit() {
    this.LoadAllGroups();
    $(document).ready(()=> {
      
      $('.group-list').on("click", ".group-title", (e)=> {
        if(e["target"]["attributes"][2] !== undefined) {
          if(this.PreviousOpenId !== 0) {
            $('.gid-'+this.PreviousOpenId).animate({height: "0px"});
          }
          let vId = e["target"]["attributes"][2]["value"];
          if(vId !== this.PreviousOpenId) {
            this.PreviousOpenId = vId;
            let mHeight = $('.gid-'+vId+' .member').outerHeight();
            let mCount = $('.gid-'+vId+' .member').length;
            $('.gid-'+vId).animate({height: ((mHeight * mCount) + (mCount * 8)) +"px"});
          } else {
            this.PreviousOpenId = 0;
          }
        }
      });
      $('.group-list').on("touchstart", ".long-press", (e)=>{
        this.touchTimer = setInterval(()=> {
          this.touchcounter++;
          if(this.touchcounter > 5) {
            clearInterval(this.touchTimer);
            console.log("popup : ", e.target.id);
            $(".btn-id-"+e.target.id).click();
            //this.presentActionSheet(e.target.id);
            setTimeout(() => {
              console.log("ready for new touch");
              this.touchcounter = 0;
            }, 500);
          }
        },100);
      });
      $('.group-list').on("touchend", ".long-press", ()=>{
        clearInterval(this.touchTimer);
        this.touchcounter = 0;
      });
    });
  }
  public RefresherEvent:any;
   doRefresh(event) {
      this.RefresherEvent = event;
      this.LoadAllGroups();
      setTimeout(() => {
         this.RefresherEvent.target.complete();
      }, 10000);
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
  ngOnDestroy() {

  }
  async DeleteGroup(GroupId) {
    console.log(GroupId);
    
    var d = await this.alertCtrl.create({
      message: "Do you want to detele the group?",
      buttons: [{
        text: "Cancel"
      }, {
        text: "Delete",
        handler: () => {
          this.dbServer.DeleteGroup(GroupId).then(_r=> {
            if(_r == 1) {
              this.ShowAlert("Group Successfully deleted.");
              this.LoadAllGroups();
            } else {
              this.ShowAlert("Group not deleted");
            }
          }).catch(() => {this.ShowAlert("Oops something is wrong. please try again latter")});
        }
      }]
    });
    await d.present();
  }
  async RemoveFromGroup(GroupId, MemberId) {
    var d = await this.alertCtrl.create({
      message: "Do you want to remove this member?",
      buttons: [{
        text: "Cancel"
      }, {
        text: "Remove",
        handler: () => {
          this.dbServer.GroupRemoveMember(GroupId, MemberId).then(_r=> {
            if(_r == 1) {
              this.ShowAlert("Member Successfully removed.");
              this.LoadAllGroups();
            } else {
              this.ShowAlert("Member not removed");
            }
          }).catch(() => {this.ShowAlert("Oops something is wrong. please try again latter")});
        }
      }]
    });
    await d.present();
  }
  async LeftFromGroup(GroupId) {
    var d = await this.alertCtrl.create({
      message: "Do you want to leave the group?",
      buttons: [{
        text: "Cancel"
      }, {
        text: "Yes",
        handler: () => {
          this.dbServer.LeftGroup(GroupId).then(_r=> {
            if(_r == 1) {
              this.ShowAlert("You have successfully left the group.");
              this.LoadAllGroups();
            } else {
              this.ShowAlert("You can not leave this group now, please try again.");
            }
          }).catch(() => {this.ShowAlert("Oops something is wrong. please try again latter")});
        }
      }]
    });
    await d.present();
  }
  LoadAllGroups() {
    this.Groups = [];
    this.dbServer.GetPropertyAsPromise("userid").then(_uId => {
      this.SelfUserId = _uId;
      this.dbServer.GetAllGroups().then((data: any) => {
        if(this.RefresherEvent) {
          this.RefresherEvent.target.complete();
       }
        if(data && data !== null && typeof data !== undefined) {
          for(let i=0;i<data.length; i++){
            let g = data[i]["data"];
            this.Groups[i] = {} as IGroup;
            this.Groups[i].Id = g["group_id"];
            this.Groups[i].GroupName = g["group_name"];
            this.Groups[i].AdminId = g["admin_id"];
            this.Groups[i].AdminStatus = g["status"]=="1"?true:false;
            if(g["admin_id"] === _uId) {
              this.Groups[i].AmIAdmin = true;
            } else {
              this.Groups[i].AmIAdmin = false;
            }
            this.Groups[i].AdminName = g["admin_name"];
            let _m = g["group_members_name"];
            console.log(_m);
            this.Groups[i].Members = [];
            let index = 0;
            if(g["group_members_name"] !== null && typeof g["group_members_name"] !== undefined) {
              for(let j =0; j< g["group_members_name"].length; j++) {
                let m = g["group_members_name"][j];
                if(m["id"] !== _uId){
                  this.Groups[i].Members[index] = {} as IMember;
                  this.Groups[i].Members[index].Id = m["id"];
                  this.Groups[i].Members[index].Name = m["name"];
                  this.Groups[i].Members[index].Status = m["status"]=="1"?true:false;
                  index++;
                }
              }
            }
          }
          setTimeout(() => {
            console.log(this.Groups);
          }, 1000);
        }
      });
    });
  }
  CreateNewGroup() {
    this.nav.navigateForward("home/newgroup");
  }
  async presentActionSheet(GroupId: any, IsAdminForTheGroup, GroupData) {
    //IsAdminForTheGroup = false;
    let cssClass = IsAdminForTheGroup? "show": "hide";
    console.log(GroupData);
    const actionSheet = await this.actionSheetController.create({
      buttons: [{
        text: 'Send request for group quiz',
        icon: 'list',
        handler: () => {
          this.shareService.SetValue("MyGroupIdForQuiz", GroupId);
          this.shareService.SetValue("AmIinitialiserForGroupQuiz", 1);
          this.nav.navigateForward("home/groupready");
        }
      }, {
        text: 'Add new members',
        icon: 'list',
        cssClass: cssClass,
        handler: () => {
          this.shareService.SetValue("UpdateGroupId", GroupId);
          this.shareService.SetValue("UpdateGroupData", GroupData);
          this.nav.navigateForward("home/updategroup");
        }
      }]
    });
    await actionSheet.present();
  }

}

