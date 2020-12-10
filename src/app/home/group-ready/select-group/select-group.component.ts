import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { ModalController, AlertController, NavController, LoadingController } from '@ionic/angular';
import { ServerService, IUser } from 'src/app/Services/server.service';
import { GroupQuizService } from 'src/app/Services/group-quiz.service';
import { ShareValuesService } from 'src/app/Services/share-values.service';
import { IGroup } from 'src/app/Services/AllInterfaces';

@Component({
  selector: 'app-select-group',
  templateUrl: './select-group.component.html',
  styleUrls: ['./select-group.component.scss'],
})
export class SelectGroupComponent implements OnInit {
  @Input() MyGroupId: number;

  public GroupName: string = '';
  public GroupNameIcon: string = "alert";
  public ShowGroupNameLoader = false;
  public Groups: IGroup[] = [];
  public GroupSelected: IClasses[] = [];
  public GroupId: number = 0;
  public SelectedGroupName: string = '';
  public SelectedIndex = -1;
  constructor(public dbServer: ServerService, public groupService: GroupQuizService, public modalCtrl: ModalController, public alertCtrl: AlertController, public nav: NavController) { 
    //this.MyGroupId = 71;
  }

  ngOnInit() {
    console.log("MyGroupId : ", this.MyGroupId);
  }
  ngOnDestroy() {

  }
  
  dismiss(RequestType:number) {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    if(RequestType == 0) {
      this.GroupId = 0;
    }
    this.modalCtrl.dismiss({
      'returnType': RequestType,
      'groupid': this.GroupId,
      'groupname': this.GroupId > 0 ? this.SelectedGroupName : "Open Challenge"
    });
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
  GetGroups() {
    this.ShowGroupNameLoader = true;
    this.Groups = [];
    if(this.GroupName.length >= 2) {
      if(this.GroupName !== '' && this.GroupName !== null && typeof this.GroupName !== undefined) {
        this.dbServer.SearchGroups(this.GroupName, this.MyGroupId).then(
          (_r:any) => {
            this.ShowGroupNameLoader = false;
            this.Groups[0] = {} as IGroup;
            this.Groups[0].Id = 0;
            this.Groups[0].GroupName = "Open Challenge";
            this.Groups[0].Members = [];

            this.GroupSelected[0] = {} as IClasses;
            this.GroupSelected[0].icon = "hide";
            this.GroupSelected[0].avatar = "show";
            if(_r && _r !== null && typeof _r !== undefined) {
              for(let i=0;i<_r.length; i++){
                let g = _r[i];
                this.Groups[i+1] = {} as IGroup;
                this.Groups[i+1].Id = g["oppgroup_id"];
                this.Groups[i+1].GroupName = g["oppgroup_name"];
                this.Groups[i+1].Members = [];

                this.GroupSelected[i+1] = {} as IClasses;
                this.GroupSelected[i+1].icon = "hide";
                this.GroupSelected[i+1].avatar = "show";
                
              }
              setTimeout(() => {
                console.log(this.Groups);
              }, 1000);
            }
          }
        ).catch(()=>{
          this.ShowGroupNameLoader = false;
        });
      }
    } else {
      this.ShowGroupNameLoader = false;
      this.GroupNameIcon = "close";
    }
  }
  
  SelectGroup(GroupId) {
    if(GroupId) {
        let GroupListIndex = this.Groups.findIndex((f) => f.Id == GroupId);
        if(GroupListIndex >= 0){
          console.log("this.SelectedIndex:", this.SelectedIndex);
          if(this.SelectedIndex >=0) {
            this.GroupSelected[this.SelectedIndex].icon = "hide";
            this.GroupSelected[this.SelectedIndex].avatar = "show";
          }
          if(this.SelectedIndex !== GroupListIndex){
            this.SelectedIndex = GroupListIndex;
            this.GroupSelected[GroupListIndex].icon = "show";
            this.GroupSelected[GroupListIndex].avatar = "hide";
            this.SelectedGroupName = this.Groups[GroupListIndex].GroupName;
            this.GroupId = GroupId;
          } else {
            this.SelectedGroupName = this.Groups[0].GroupName;
            this.GroupId = 0;
            this.SelectedIndex = -1;
          }
        }
    }
  }
  PLay() {
      this.dismiss(1);
    
    /* this.groupService.SendQuizRequest(this.MyGroupId, this.GroupId).then(_r => {
      if(_r && _r > 0) {
        localStorage.setItem("testId", _r.toString());
        console.log("testId", _r);
      }
    }); */
  }
}
export interface IClasses {
  icon: string,
  avatar: string
}