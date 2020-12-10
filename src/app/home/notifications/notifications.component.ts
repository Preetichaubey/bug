import { Component, OnInit, OnDestroy } from '@angular/core';
import { ServerService, INotification } from 'src/app/Services/server.service';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { GroupQuizService } from 'src/app/Services/group-quiz.service';
import { ShareValuesService } from 'src/app/Services/share-values.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html',
  styleUrls: ['./notifications.component.scss'],
})
export class NotificationsComponent implements OnInit, OnDestroy {
  public NotificationData: INotification[] = [];
  public loader: any;
  public NotifnCount = 0;
  public CounterInterval: any;
  constructor(public dbServer: ServerService, public alertCtrl: AlertController, public navCtrl: NavController, 
    public loadingCtrl: LoadingController, public grpQuiz: GroupQuizService, public shareService: ShareValuesService) { }

  ngOnInit() {
    localStorage.setItem("NewNotifications", '0');
    this.dbServer.IsAlertShown = false;
    this.NotificationsCount();
    this.dbServer.GetPropertyAsPromise("notifications").then(
      data => {
        this.NotificationData = JSON.parse(data) as INotification[];
      }
    );
  }
  ngOnDestroy() {
    clearInterval(this.CounterInterval);
  }
  RemoveAllNtfns() {
    console.log("clear data");
    
    this.dbServer.GetPropertyAsPromise("userid").then(_uid => {
      let fd = new FormData();
      fd.append("userid", _uid);
      this.dbServer.PostData(this.dbServer.CommUrl + "api/notification/clear_notification.php", fd).then(() => {
        let n: INotification[] = [];
        localStorage.setItem("notifications", JSON.stringify(n));
        setTimeout(() => {
          this.Refresh();
        }, 1000);
      }).catch((e)=> {
        console.error(e);
        let n: INotification[] = [];
        localStorage.setItem("notifications", JSON.stringify(n));
        setTimeout(() => {
          this.Refresh();
        }, 1000);
      });
    })
  }
  async ShowAlert(alrtMsg:string = 'Sorry, this request is expired.') {
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
  NotificationsCount() {
    this.CounterInterval = setInterval(()=> {
      this.dbServer.GetPropertyAsPromise("NewNotifications").then(
        _nc => {
          if(_nc && _nc !== null && typeof _nc !== undefined && _nc >= 0){
            this.NotifnCount = _nc;
          }
        }
      );
    }, 1000);
  }
  Refresh() {
    localStorage.setItem("NewNotifications", '0');
    this.dbServer.IsAlertShown = false;
    this.dbServer.GetPropertyAsPromise("notifications").then(
      data => {
        this.NotificationData = JSON.parse(data) as INotification[];
      }
    );
  }
  AcceptRequest(testId: number, against: number) {
    this.LoadingStart();
    console.log("Checking Request Status: ", testId);
    this.dbServer.AcceptQuizRequest(testId, against).then(
      data => {
        this.LoadingStop();
        console.log("data : ", data);
        
        if(data == 1) {
          this.SetNotificationStatus(testId, 1);
          localStorage.setItem("AmI2ndPlayer", "1");
          localStorage.setItem("testId", testId.toString());
          console.log("Request Accepted");
          localStorage.setItem("AgainstId", against.toString());
          setTimeout(() => {
            this.navCtrl.navigateForward('home/playquiz');
          }, 100);
        } else {
          this.SetNotificationStatus(testId, 3);
          this.ShowAlert();
        }
      }
    );
  }
  RejectGroupJoinRequest (GroupId) {
    this.LoadingStart();
    
    this.dbServer.RejectGroupJoinRequest(GroupId).then(_r => {
      this.LoadingStop();
      if(_r) {
        this.SetNotificationStatus(GroupId, 2);
      } else {
        this.SetNotificationStatus(GroupId, 2);
      }
    }).catch(() => {
      this.LoadingStop();
      this.Refresh();
      this.ShowAlert("Oops! Something is wrong, please try again.");
    });
  }
  AcceptGroupJoinRequest(GroupId: number, against: number) {
    this.LoadingStart();
    console.log("Checking Request Status");
    this.dbServer.AcceptGroupJoinRequest(GroupId).then(
      data => {
        this.LoadingStop();
        if(data == 1) {
          this.SetNotificationStatus(GroupId, 1);
          console.log("Request Accepted");
          setTimeout(() => {
            this.ShowAlert("You have successfully joined the group.");
          }, 100);
        } else {
          this.Refresh();
          this.ShowAlert();
        }
      }
    );
  }
  // 0= Active, 1= Accepted, 2 = rejected, 3 = Expired
   SetNotificationStatus(MainId: number, StsId: number) {
    this.Refresh();
    this.dbServer.GetPropertyAsPromise("notifications").then(
      data => {
        let JData: INotification[] = JSON.parse(data) as INotification[];
        var fp = new Promise((resolve) => {
          for(let i=0; i< JData.length; i++) {
            if(JData[i].MainId == MainId) {
              JData[i].status = StsId;
              resolve();
              break;
            }
          }
        });
        fp.then(()=>{
          console.log("Updating Rejected");
          this.NotificationData = JData;
          localStorage.setItem("notifications", JSON.stringify(JData));
        })
      }
    );
  }
  RejectRequest(testId: number, RequestType: number) {
    this.Refresh();
    if(RequestType == 2){
      this.dbServer.RejectNotificationForFriend(testId).then(() => {
        this.SetNotificationStatus(testId, 2);
      });
    } else if(RequestType == 3){
      this.dbServer.RejectNotification(testId).then(() => {
        this.SetNotificationStatus(testId, 2);
      });
    }
  }
  RejectGroupQuizRequest(GroupId: number) {
    this.Refresh();
      this.dbServer.RejectNotificationForGroupQuiz(GroupId).then(() => {
        this.SetNotificationStatus(GroupId, 2);
      });
  }
  AcceptGroupQuizRequest(MyGroupId: number) {
    this.LoadingStart();
    this.Refresh();
    console.log("Checking Request Status");
    this.grpQuiz.AcceptGroupQuizRequest(MyGroupId).then(
      data => {
        this.LoadingStop();
        if(data == 1) {
          this.shareService.SetValue("MyGroupIdForQuiz", MyGroupId);
          this.shareService.SetValue("AmIinitialiserForGroupQuiz", 2);
          this.SetNotificationStatus(MyGroupId, 1);
          console.log("Request Accepted");
          setTimeout(() => {
            this.navCtrl.navigateForward('home/groupready');
          }, 100);
          console.log("Request Accepted");
        } else {
          this.ShowAlert();
        }
      }
    );
  }
  //1: Accepted, 2: Reject
  //MatchType ->  0: NewMatch, 1: Rematch, 2: Comming from Notification,
  AI_LikeMindedRequest(IsAccepted, NotificationId) {
    console.log("accepted");
    
    this.dbServer.GetPropertyAsPromise("userid").then(_uId => {
      this.dbServer.SetProperty("MatchType", "2");
      let fd = new FormData();
      fd.append("userid", _uId);
      fd.append("response", IsAccepted);
      fd.append("id", NotificationId);
      if(IsAccepted === "2") {
        this.SetNotificationStatus(NotificationId, 2);
      }
      this.dbServer.PostData(this.dbServer.CommUrl + "api/ai_player/respond_notification.php", fd).then(_d => {
        if(_d && _d !== null && typeof _d !== undefined && _d !== undefined) {
          if(_d == "1" && IsAccepted === "1") {
            this.dbServer.SetProperty("MatchType", "2");
            this.dbServer.SetProperty("testId", NotificationId);
            localStorage.setItem("AmI2ndPlayer", "1");
            localStorage.setItem("AgainstId", "5");
            this.navCtrl.navigateForward('home/playquiz');
          } else {
            this.SetNotificationStatus(NotificationId, 3);
            this.ShowAlert();
          }
        }
      });
    })
  }
}
