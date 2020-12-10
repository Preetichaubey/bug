import { Injectable } from '@angular/core';
import { ServerService, INotification, IQuestion } from './server.service';
import { AlertController, NavController, LoadingController } from '@ionic/angular';
import { timeInterval } from 'rxjs/operators';
import { IGroupMemberAnswers } from './AllInterfaces';

@Injectable({
   providedIn: 'root'
})
export class BackgroundProcessService {
   public CommUrl: string = 'https://sarmicrosystems.in/quiztest/';
   public RequestAlert: any;
   public frndNtfnAlert: any;
   public ShouldSend = 0;
   public counter = 0;
   public chkNotifications: any;
   public RematchTestId =0;
   private FrndAnsInterval: any;
   private FrndNotificationShown: number[] = [];
   public loader: any;
   public isShowingFrndNtfn = false;
   //public ti = setInterval(1000);
   public IntervalTocheckAcceptedRequest = () => setInterval(this.CheckIfQuestionGot, 1000);
   constructor(public dbServer: ServerService, public alertCtrl: AlertController, public navCtrl: NavController,
      public loadingCtrl: LoadingController) { }
   
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
   public async ShowRematchNtfn(N: INotification){
      this.RequestAlert = await this.alertCtrl.create(
         {
            header: 'Do you want to rematch?',
            buttons: [{
                  text: "No",
                  handler: () => {
                     this.dbServer.ResponceToRematchRequest(N.Id1, 2);
                  }
               }, {
                  text: "Play",
                  handler: () => {
                     localStorage.setItem("testId", N.Id1.toString());
                     console.log("Request Accepted");
                     localStorage.setItem("AgainstId", N.Id2.toString());
                     localStorage.setItem("AmI2ndPlayer", "1");
                     localStorage.setItem("friendId", N.Id3.toString());
                     this.dbServer.ResponceToRematchRequest(N.Id1, 1).then(
                        _r => {
                           if(_r === 1) {
                              this.navCtrl.navigateRoot('home/playquiz');
                           }
                        }
                     );
                  }
               }
            ]
         }
      );
      this.RequestAlert.present();
   }
   public async FriendNotificationPopup(ntfn: INotification) {
      let IsResponded = false;
      let isFound = this.FrndNotificationShown.findIndex(i => i == ntfn.Id2);
      this.dbServer.GetPropertyAsPromise("isPlayingQuiz").then(async (_ipq) => {
         if(isFound < 0 && !this.isShowingFrndNtfn && _ipq == '0') {
            this.FrndNotificationShown.push(ntfn.Id2);
            this.isShowingFrndNtfn = true;
            this.frndNtfnAlert = await this.alertCtrl.create(
               {
                  header: ntfn.Heading+' sent you a quiz request',
                  message: 'Subject: ' + ntfn.Message1 + '<br>Topic: ' + ntfn.Message2,
                  buttons: [{
                        text: "Reject",
                        handler: () => {
                           IsResponded = true;
                           this.dbServer.RejectNotificationForFriend(ntfn.Id2);
                           this.isShowingFrndNtfn = false;
                        }
                     }, {
                        text: "Accept",
                        handler: () => {
                           IsResponded = true;
                           localStorage.setItem("AmI2ndPlayer", "1");
                           this.AcceptFriendQuizRequest(ntfn.Id2);
                           this.isShowingFrndNtfn = false;
                        }
                     }
                  ]
               }
            );
            this.frndNtfnAlert.present();
            setTimeout(() => {
               if(!IsResponded){
                  this.frndNtfnAlert.dismiss();
               }
            }, 30000);
         }
      });
   }
   AcceptFriendQuizRequest(testId: number) {
      this.LoadingStart();
      console.log("Checking Request Status: ", testId);
      this.dbServer.AcceptQuizRequest(testId, 2).then(
        data => {
          this.LoadingStop();
          console.log("data : ", data);
          
          if(data == 1) {
            localStorage.setItem("testId", testId.toString());
            console.log("Request Accepted");
            localStorage.setItem("AgainstId", "2");
            setTimeout(() => {
              this.navCtrl.navigateForward('home/playquiz');
            }, 100);
          } else {
            this.ShowAlert();
          }
        }
      );
    }
   public IsNotificationExists(JData: INotification[], crrData: INotification): Promise<boolean>{
      return new Promise((resolve) => {
         var l = JData.length;
         if(l === 0){
            resolve(false);
         }
         for(let j =0; j< JData.length; j++){
            if(crrData.MainId && crrData.MainId != null && typeof crrData.MainId != undefined) {
               if(JData[j].MainId == crrData.MainId){
                  resolve(true);
               }
            }
            if(j === (l-1)) {
               resolve(false);
            }
         }
      })
   }
   public CheckNotifications() {
      let ShouldSendRequest = true;
      let waitCounter = 0;
      this.CheckingNotification();
      this.chkNotifications = setInterval(() => {
         if(ShouldSendRequest) {
            ShouldSendRequest = false;
            this.CheckingNotification().then(()=>{ShouldSendRequest = true;});
         }
         if(waitCounter === 5) {
            waitCounter = 0;
            ShouldSendRequest = true;
            //this.ShowAlert();
         }
         waitCounter++;
      }, 10000);
   }
   private CheckingNotification(): Promise<boolean> {
      //console.log("interval ended");
      return new Promise((resolve) => {
         this.dbServer.notificationsAll().then((myNot: INotification[]) => {
            //console.log(myNot);
            this.dbServer.GetPropertyAsPromise("notifications").then(
               data => {
                  if(data && data !== null && typeof data !== undefined){
                     let NewNotifications = 0;
                     let JData: INotification[] = JSON.parse(data) as INotification[];
                        let l = myNot.length;
                        
                        NewNotifications = 0;
                        var fr = ():Promise<any> => {
                           return new Promise((ForResolve) => {
                              
                           if(l === 0) {ForResolve()}
                           for(let i =0; i<myNot.length; i++) {
                              if(myNot[i].MainId != null && typeof myNot[i].MainId != undefined && myNot[i].MainId != 0){
                                 if(myNot[i].NotificationType === "rematch"){
                                    if(myNot[i].Id1 !== this.RematchTestId){
                                       this.RematchTestId = myNot[i].Id1;
                                       this.ShowRematchNtfn(myNot[i]);
                                    }
                                 } else {
                                    if(myNot[i].NotificationType === "2"){
                                       this.FriendNotificationPopup(myNot[i]);
                                    }
                                    this.IsNotificationExists(JData, myNot[i]).then(
                                       isPresent => {
                                          if(!isPresent) {
                                             JData.push(myNot[i]);
                                             NewNotifications++;
                                          }
                                    });
                                 }
                              }
                              if(i === (l-1)){ForResolve()}
                           }
                        });}
                        fr().then(_e => {
                           resolve(true);
                           this.dbServer.GetPropertyAsPromise("NewNotifications").then(_n => {
                              let n = NewNotifications + (+_n);
                              if(n > myNot.length) {
                                 n = myNot.length;
                              }
                              localStorage.setItem("NewNotifications", (n).toString());
                              });
                              localStorage.setItem("notifications", JSON.stringify(myNot));
                        });
                  }
               }
            ).catch(()=>{resolve(true)});
         });
      });
   }
   public CheckIfQuestionGot(againstId, friendId, testId): Promise<IQuestion[]> {
     let SecondsCount = 0;
     let RequestValid = true;
     let IsErrPopup
     let q: IQuestion[]=[]; 
      //this.IntervalTocheckAcceptedRequest;
      return new Promise((resolve) => {
         let qT = setInterval(() => {
               this.dbServer.GetTwoPlayerExam(againstId, friendId, testId).then(data => {
                  if(RequestValid){
                     console.log("questions ", data);
                     if(data.length !== 0 && data !== null && typeof data !== undefined && data){
                           clearInterval(qT);
                           resolve(data);
                     } else {
                        console.log("getting Questions");
                     }
                  }
               }).catch((e) => {});
               console.log(SecondsCount,"======================================>>")
               if(SecondsCount > 4){
                  RequestValid = false;
                  clearInterval(qT);
                  resolve(q); // returning empty array
               }
               SecondsCount++;
         }, 2000);
      });
      
   }
   /*public FetchNotifications() {
      this.dbServer.CheckForNewNotifications();
   }*/
   //public Check
   public StopCheckingFriendAnswer() {
      setTimeout(() => {
         if(this.FrndAnsInterval){
            clearInterval(this.FrndAnsInterval);
         }
      }, 200);
   }
   public CheckFriendAnswer() {
      let ShouldSendRequest = false;
      this.dbServer.GetPropertyAsPromise("testId").then(_tId => {
         this.dbServer.GetPropertyAsPromise("userid").then(_uId => {
            this.dbServer.GetPropertyAsPromise("groupid").then(_gId => {
               let fd = new FormData();
               fd.append("userid", _uId);
               fd.append("testid", _uId);
               fd.append("groupid", _gId);
               this.FrndAnsInterval = setInterval(() => {

               }, 1000);
            });
         });
      });
   }
   private CheckingFrndsAnswers(fd: FormData): Promise<any> {
      return new Promise((resolve, reject) => {
         this.dbServer.PostData(this.dbServer.CommUrl + "", fd).then(
            data => {
               let fa: IGroupMemberAnswers[] = [];
               if(data.length > 0) {
                  for(let i = 0; i<data.length ; i++) {
                     fa[i] = {} as IGroupMemberAnswers;
                     let gma = data[i];
                     
                  }
               }
            }
         )
      });
   }
}
