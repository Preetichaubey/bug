import { Component, OnInit, OnDestroy } from '@angular/core';
import { ModalController, AlertController, NavController, LoadingController } from '@ionic/angular';
import { ServerService, IUser } from 'src/app/Services/server.service';
import { GroupQuizService } from 'src/app/Services/group-quiz.service';
declare var $: any;
@Component({
  selector: 'app-friend-requests',
  templateUrl: './friend-requests.component.html',
  styleUrls: ['./friend-requests.component.scss'],
})
export class FriendRequestsComponent implements OnInit {

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
   this.GetRequests();
  }
  ngOnDestroy() {

  }
  async LoadingStart(Message = "Please Wait...") {
     this.loader = await this.loadingCtrl.create({
        message: Message,
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
  async AcceptFriendRequest(FriendId, IsAccept) {
     this.LoadingStart();
     let userid = await this.dbServer.GetPropertyAsPromise("userid");
     let fd = new FormData();
     fd.append("p1_id", userid);
     fd.append("p2_id", FriendId);
     fd.append("IsAccept", IsAccept);
     this.dbServer.PostData(this.dbServer.CommUrl+"api/friend/accept_request.php", fd).then(
        data=>{
           this.LoadingStop();
           if(data === '1'){
              $("#"+FriendId).css("display","none");
              this.ShowAlert("Successfully added to friends list.");
           } else if(data === '2') {
              this.ShowAlert("Friend not added to friends list");
           } else if(data === '3') {
               $("#"+FriendId).css("display","none");
            }
        }
     ).catch(e => {
        this.LoadingStop();
        console.log(e);
     });
  }
  GetRequests() {
     this.LoadingStart("Getting requests...");
        this.FrndsSelected = [];
        this.FindRequests().then((_r: IUser[]) => {
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
           console.error(e);
        });
  }
  FindRequests(){
   let frnds: IUser[] = [];
   return new Promise(async (resolve) => {
       this.dbServer.GetPropertyAsPromise("userid").then(_uId => {
           let fd = new FormData();
           fd.append("userid", _uId);
           this.dbServer.PostData(this.dbServer.CommUrl + "api/friend/get_friend_requests.php", fd).then(data => {
               console.log("Data", data);
               var pr = new Promise((resolve2, reject) => {
                   if (data != null && typeof data != undefined) {
                       if (data.length > 0) {
                           for (let i = 0; i < data.length; i++) {
                               let d = data[i]["data"];
                               frnds[i] = {} as IUser;
                               frnds[i].id = d["id"];
                               frnds[i].fname = d["name"];
                               frnds[i].std = d["class"];
                               frnds[i].schoolName = d["school"];
                               frnds[i].picture = d["avatar"];
                               if (i === (data.length - 1)) {
                                   resolve2();
                               }
                           }
                       } else { resolve2() }
                   } else { resolve2() }
               });
               pr.then(() => { console.log("frnds : ", frnds); resolve(frnds); })
           }).catch((e)=>{ console.log(e);});
               this.LoadingStop();
            });
   });
  }
}
export interface IClasses {
  icon: string,
  avatar: string
}