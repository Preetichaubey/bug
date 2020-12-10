import { Component, OnInit, Input } from '@angular/core';
import { ModalController, AlertController, NavController } from '@ionic/angular';
import { ServerService, IUser } from 'src/app/Services/server.service';
import { IGroup } from '../../../Services/AllInterfaces';
import { from } from 'rxjs';
import { GroupQuizService } from 'src/app/Services/group-quiz.service';

@Component({
  selector: 'app-search-group',
  templateUrl: './search-group.page.html',
  styleUrls: ['./search-group.page.scss'],
})
export class SearchGroupPage implements OnInit {

  @Input() MyGroupId: number;

  public GroupName: string = '';
  public GroupNameIcon: string = "alert";
  public ShowGroupNameLoader = false;
  public Groups: IGroup[] = [];
  public GroupSelected: IClasses[] = [];
  public GroupId: number = 0;
  public SelectedIndex = -1;
  constructor(public dbServer: ServerService, public groupService: GroupQuizService, public modalCtrl: ModalController, public alertCtrl: AlertController, public nav: NavController) { }

  ngOnInit() {
    console.log("MyGroupId : ", this.MyGroupId);
  }
  ngOnDestroy() {

  }
  dismiss() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalCtrl.dismiss({
      'groupid': this.GroupId
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
            if(_r && _r !== null && typeof _r !== undefined) {
              for(let i=0;i<_r.length; i++){
                let g = _r[i]["data"];
                this.Groups[i] = {} as IGroup;
                this.Groups[i].Id = g["id"];
                this.Groups[i].GroupName = g["group_name"];
                this.Groups[i].Members = [];

                this.GroupSelected[i] = {} as IClasses;
                this.GroupSelected[i].icon = "hide";
                this.GroupSelected[i].avatar = "show";
                
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
      this.GroupId = GroupId;
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
          } else {
            this.SelectedIndex = -1;
          }
        }
    }
  }
  PLay() {
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
  

