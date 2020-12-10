import { Component, OnInit, OnDestroy } from '@angular/core';
import { ShareValuesService } from 'src/app/Services/share-values.service';
import { LoadingController, AlertController, NavController } from '@ionic/angular';
import { GroupQuizService } from 'src/app/Services/group-quiz.service';
import { IGroup, IMember } from 'src/app/Services/AllInterfaces';
import { ServerService } from 'src/app/Services/server.service';

@Component({
   selector: 'app-group-ready',
   templateUrl: './group-ready.component.html',
   styleUrls: ['./group-ready.component.scss'],
})
export class GroupReadyComponent implements OnInit, OnDestroy {
   public MyGroupIdForQuiz: any;
   public AmIinitialiser: number;
   public IntervalToCheckGroupData: any;
   public IsGettingGroupDataFor1stTime = true;
   public DoesTimerEnd = false;
   public loader: any;
   public ShouldDisplay = false;
   public Group: IGroup;
   public Group_Status = 0;
   public IsLeaving = true;
   public ChallengeAcceptenceInterval:any;
   public DisplayProgress = "Waiting to initialize or accept the challenge";
   private AlertShownForId: number[] = [];
   constructor(public shareService: ShareValuesService, public loadingCtrl: LoadingController,
      public groupService: GroupQuizService, public dbServer: ServerService, public alertCtrl: AlertController,
      public nav: NavController) { }

   ngOnInit() {
      this.shareService.GetValueAsPromise("MyGroupIdForQuiz").then(_gi => {
         if (_gi) {
            this.MyGroupIdForQuiz = _gi;

            this.shareService.GetValueAsPromise("AmIinitialiserForGroupQuiz").then(_v => {
               this.AmIinitialiser = +_v;
               if (this.AmIinitialiser === 1) {
                  this.SendGroupReadyRequest();
               } else {
                  this.StartGettingGroupData();
                  this.StartGettingIsChallengeAccepted();
               }

            }).catch((_v) => { console.log("Error : ", _v) });
         }
      }).catch((_giE) => { console.log("Error : ", _giE) });

   }
   ngOnDestroy() {
      if(this.IsLeaving){
         this.groupService.UnDoGroupQuizRequest(this.MyGroupIdForQuiz);
      }
      clearInterval(this.IntervalToCheckGroupData);
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
   async ShowExitAlert(alrtMsg: string) {
      var alrt = await this.alertCtrl.create({
         message: alrtMsg,
         buttons: [{
            text: "Okay",
            handler: () => {
               this.nav.navigateForward("home");
            }
         }
         ]
      });
      alrt.present();
   }
   async LoadingStart(LoadingMsg: string = "Please wait...", Duration = 10000) {
      this.loader = await this.loadingCtrl.create({
         message: LoadingMsg,
         duration: Duration
      });
      this.loader.present();
   }
   LoadingStop() {
      setTimeout(() => {
         if (this.loader) {
            this.loader.dismiss();
         }
      }, 100);
   }
   SendGroupReadyRequest(): Promise<number> {
      return new Promise((resolve, reject) => {
         this.groupService.SendGroupReadyRequest(this.MyGroupIdForQuiz).then(_r => {
            if (_r == 1) {
               this.StartGettingGroupData();
            }
            resolve(_r);
         }).catch(() => { reject(0) });
      });
   }
   StartGettingGroupData() {
      let Counter = 0;
      this.IsGettingGroupDataFor1stTime = true;
      this.IntervalToCheckGroupData = setInterval(() => {
         this.GetGroupData();
         if (Counter > 60) {
            this.DoesTimerEnd = true;
            if (this.IntervalToCheckGroupData) {
               clearInterval(this.IntervalToCheckGroupData);
            }
         }
         Counter++;
      }, 1000);
   }
   GetGroupData() {
      this.groupService.IsGroupReadyData(this.MyGroupIdForQuiz).then(
         (data) => {
            if (data !== 0) {
               this.dbServer.GetPropertyAsPromise("userid").then(_uId => {
                  if (data && data !== null && typeof data !== undefined) {
                     let g = data["data"];
                     this.Group = {} as IGroup;
                     this.Group.Id = g["group_id"];
                     this.Group.GroupName = g["group_name"];
                     this.Group_Status = +g["group_status"];
                     let _m = g["info"];
                     this.Group.Members = [];
                     let index = 0;
                     if (_m !== null && typeof _m !== undefined) {
                        for (let m of _m) {
                           //let m = _m[j];
                           this.Group.Members[index] = {} as IMember;
                           this.Group.Members[index].Id = m["id"];
                           this.Group.Members[index].Name = m["name"];
                           this.Group.Members[index].Status = m["is_accepted"] == "1" ? true : false;
                           this.Group.Members[index].ExtraInfo = m["is_accepted"] == "1" || m["is_accepted"] == "0" ? "1" : "0";
                           if (m["is_accepted"] == "3") {
                              if (this.AlertShownForId.findIndex(fi => fi === m["id"]) === -1) {
                                 this.AlertShownForId.push(m["id"]);
                                 this.ShowAlert(m["name"] + " exit group quiz.");
                              }
                           }
                           index++;

                        }

                     }
                     setTimeout(() => {
                        this.ShouldDisplay = true;
                     }, 1000);
                  }
               });
            } else {
               this.ShowExitAlert("Initiator left the challenge.");
               clearInterval(this.IntervalToCheckGroupData);
            }
         }
      );
   }
   NextBtn() {
      this.IsLeaving = false;
      this.nav.navigateForward("home/selectchallenge");
   }
   StartGettingIsChallengeAccepted() {
      let sendRequest = true;
      let counter = 0;
      this.ChallengeAcceptenceInterval = setInterval(() => {
         console.log("trying to send request");
         
        if(sendRequest == true) {
          sendRequest = false;
          this.WaitingToAcceptChallenge().then( _r => {
            sendRequest = true;
            counter = 0;
            console.log("Resolved");
            
          }).catch(() => {
            sendRequest = true;
            counter = 0;
          });
        }
        counter++;
        if(counter>7){
          sendRequest = true;
          counter = 0;
        }
      }, 1000);
    }
    async ShowQuisInfo(Subject:string, Topic:string){
       let a = await this.alertCtrl.create({
          message: "Challenge will be on<br>subject: "+Subject+",<br>Topic: "+Topic,
          buttons: ["Okay"]
       });
       a.present();
       setTimeout(()=>{
          a.dismiss();
       },5000);
    }
    WaitingToAcceptChallenge(): Promise<any> {
      return new Promise((resolve, reject) => {
        //this.LoadingStart("Waiting others to accept your challenge.", 60000);
        this.groupService.IsChallengeAccepted(this.MyGroupIdForQuiz)
        .then((_r: {TestId: number, Status: number, TopicId: number, Topic: string, SubjectId: number, Subject: string}) => {
           console.log("_r: ", _r);
          if(_r.TestId>0) {
             if(_r.Status>0) {
                clearInterval(this.ChallengeAcceptenceInterval);
                this.IsLeaving = false;
                this.DisplayProgress = "Preparing questions...";
                localStorage.setItem("testId", _r.TestId.toString());
                localStorage.setItem("topics", _r.TopicId.toString());
                localStorage.setItem("subid", _r.SubjectId.toString());
                localStorage.setItem("AgainstId", "4");
                this.ShowQuisInfo(_r.Subject, _r.Topic);
                setTimeout(()=>{
                  this.nav.navigateRoot("home/playquiz");
                }, 5000);
             } else {
               this.DisplayProgress = "Waiting for other groups to accept challenge.";
               resolve();
             }
          } else {
            resolve();
          }
        }).catch(() => {
          reject();
        });
      });
      
    }
}
