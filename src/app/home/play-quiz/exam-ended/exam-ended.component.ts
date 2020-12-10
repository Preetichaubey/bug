import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { ServerService, IQuestion } from 'src/app/Services/server.service';
import { GroupQuizService } from 'src/app/Services/group-quiz.service';
import { ShareValuesService } from 'src/app/Services/share-values.service';
declare var $: any;
@Component({
   selector: 'app-exam-ended',
   templateUrl: './exam-ended.component.html',
   styleUrls: ['./exam-ended.component.scss'],
})
export class ExamEndedComponent implements OnInit, OnDestroy {
   public RematchInterval: any;
   public ShouldCheckAgain = true;
   public intervalCounter = 0;
   public loader: any;
   public WinnerImg = "../../../../assets/img/thumbs-up.gif";
   public LoserImg = "../../../../assets/img/thumbs-down.gif";

   public res = {
      winnerid: '',
      oppid: '', oppname: '', oppPercentage: 0, MyPercentage: 0,
      Questions: [] as IQuestion[]
   };
   public OppScore = 0;
   public MyScore = 0;
   public MatchTie = false;
   public winnerScore = "";
   public LooserScore = "";
   public Lost = "";
   public Won = "";
   public AgainstId = '0';
   public ScoreTieMsg = "";
   public ShowTrophy = false;
   public DisplayTestId = "";
   constructor(public navCtrl: NavController, public alertCtrl: AlertController,
      public dbServer: ServerService, public loadingCtrl: LoadingController,
      public groupService: GroupQuizService, public shareService: ShareValuesService) { }

   ngOnInit() {
      this.MatchTie = false;
      this.ResetVariables();
      this.dbServer.GetPropertyAsPromise("AgainstId").then(_aId => {
         this.AgainstId = _aId;
         if (_aId == '1') {
            this.AIWinner();
         } else if (_aId == '4') {
            this.GroupWinner();
         } else {
            this.TwoPlayerWinner();
         }
         this.dbServer.GetPropertyAsPromise("testId").then(tid => { this.DisplayTestId = tid });
      });
      $(document).ready(() => {
         setTimeout(() => {
            let roundWidth = $(".result-bolock").outerWidth();
            //$(".result-bolock").css("height", roundWidth+"px");  
         }, 1000);

      });
   }
   ngOnDestroy() {
      this.ResetVariables();
      clearInterval(this.RematchInterval);
   }
   ResetVariables() {
      this.winnerScore = "";
      this.LooserScore = "";
      this.Lost = "";
      this.Won = "";
      this.res.MyPercentage = undefined;
      this.res.oppPercentage = undefined;
      this.res.winnerid = undefined;
      this.OppScore = undefined;
      this.MyScore = undefined;
   }
   async LoadingStart(msg="Please wait...") {
      this.loader = await this.loadingCtrl.create({
         message: msg,
         duration: 40000
      });
      this.loader.present();
   }
   async ShowAlert(msg: string) {
      var alrt = await this.alertCtrl.create({
         message: msg,
         buttons: [
            {
               text: 'Okay',
               handler: data => {
                  console.log('Okay clicked');
                  //this.navCtrl.navigateRoot('home');
               }
            }
         ]
      });
      alrt.present();
   }
   LoadingStop() {
      setTimeout(() => {
         if (this.loader) {
            this.loader.dismiss();
            setTimeout(() => {
            }, 200);
         } else {
            console.log("Loading could not be stopped");
         }
      }, 700);
   }
   GoToHome() {
      this.navCtrl.navigateRoot("home");
   }
   ScoreCard() {
      this.navCtrl.navigateRoot('home/scorecard');
   }
   TakeAnotherQuiz() {
      if (this.AgainstId == '4') {
         this.navCtrl.navigateBack('home/groupsall');
      } else {
         this.navCtrl.navigateBack('home/selectquiz');
      }
   }
   Rematch() {
      this.dbServer.GetPropertyAsPromise("AgainstId").then(_againstId => {
         if (_againstId == '1') {
            this.navCtrl.navigateBack('home/playquiz');
         } else if (_againstId == '2' || _againstId == '3') {
            this.LoadingStart();
            this.dbServer.SendRematchRequest().then(_r => {
               console.log("Request Sent:", _r);
               if (_r === 1) {
                  console.log("insideif");
                  this.RematchInterval = setInterval(() => {
                     this.IsRematchRequestAccepted();
                     this.intervalCounter++;
                     if (this.intervalCounter > 20) {
                        this.intervalCounter = 0;
                        this.ShowAlert("Rematch request not accepted.");
                        this.LoadingStop()
                        clearInterval(this.RematchInterval);
                     }
                  }, 1000);
               }

            }).catch(() => { this.LoadingStop() });
         } else if (_againstId == '5') {
            this.LoadingStart();
            let fd = new FormData();
            fd.append("response", "5");
            fd.append("ai_id", this.res.oppid);
            console.log("this.res.oppid: ", this.res.oppid);
            this.dbServer.PostData(this.dbServer.CommUrl + "api/ai_player/send_ai_rematch.php", fd).then(_r => {
               this.LoadingStop();
               console.log("_r", _r);
               if (_r === '1') {
                  this.dbServer.SetProperty("MatchType", "1");
                  this.navCtrl.navigateForward('home/playquiz');
               } else {
                  this.ShowAlert("Rematch request not accepted.");
               }
            });

         }
      });
   }
   IsRematchRequestAccepted() {
      if (this.ShouldCheckAgain === true) {
         this.ShouldCheckAgain = false;
         this.dbServer.IsRematchRequestAccepted().then(
            _r => {
               this.ShouldCheckAgain = true;

               if (_r === 1) {
                  this.LoadingStop();
                  clearInterval(this.RematchInterval);
                  this.navCtrl.navigateBack("home/playquiz");
                  this.intervalCounter = 0;
               } else if (_r === 2) {
                  this.LoadingStop();
                  this.ShowAlert("Opponent rejected the rematch request.");
                  clearInterval(this.RematchInterval);
                  this.intervalCounter = 0;
               }
            }
         );
      }
   }
   ShowScore() {
      let R_height = $(".result").outerHeight();
      $(".result").css("margin-top", "-" + (R_height + 10) + "px");
      $(".result").css("display", "block");
      setTimeout(() => {
         $(".result").animate({ "margin-top": "15px" });
      }, 300);
      console.log("Result Height : ", $(".result").outerHeight());
   }
   GroupWinner() {
      this.LoadingStart();
      let ShouldShowScore = true;
      eval('MathJax.Hub.Queue(["Typeset", MathJax.Hub])');
      this.groupService.GetGroupWinner().then(_res => {
         console.log("_res : ", _res);
         this.LoadingStop();
         this.shareService.GetValueAsPromise("MyGroupIdForQuiz").then(_gId => {
            this.res.MyPercentage = +_res.MyGroupCount;
            this.res.oppPercentage = +_res.OppGroupCount;
            this.res.oppname = _res.OppGroupName;
            this.res.winnerid = _res.winner;
            this.OppScore = +_res.OppGroupCount;
            this.MyScore = +_res.MyGroupCount;
            if (this.res.winnerid == _gId) {
               this.winnerScore = this.MyScore.toString();
               this.LooserScore = this.OppScore.toString();
               this.Won = _res.MyGroupName;
               this.Lost = _res.OppGroupName;
               this.ShowTrophy = true;
            } else {
               this.winnerScore = this.OppScore.toString();
               this.LooserScore = this.MyScore.toString();
               this.Won = _res.OppGroupName;
               this.Lost = _res.MyGroupName;
               this.ShowTrophy = false;
            }
            if (this.OppScore == this.MyScore && this.winnerScore !== "00%" && this.winnerScore !== "0%" && this.winnerScore !== "0") {
               this.ScoreTieMsg = this.Won + " was faster than " + this.Lost;
            } else {
               ShouldShowScore = false;
               this.MatchTie = true;
               this.ScoreTieMsg = "No one won";
            }
            //if(ShouldShowScore === true) {
            this.ShowScore();
            //}
         });
      });
   }
   TwoPlayerWinner() {
      this.LoadingStart("Waiting for opponent to finish the quiz.");
      let ShouldShowScore = true;
      this.MatchTie = false;
      eval('MathJax.Hub.Queue(["Typeset", MathJax.Hub])');
      this.IsTowPlayerWinnerReady().then(_If => {
         this.dbServer.Get2PlayerWinner().then(_res => {
            console.log("_res : ", _res);
            this.LoadingStop();
            this.dbServer.GetPropertyAsPromise("userid").then(_uId => {
               if (_res && _res.Questions.length > 0) {
                  this.res.MyPercentage = _res.MyPercentage;
                  this.res.oppPercentage = _res.oppPercentage;
                  this.res.oppid = _res.oppid;
                  this.res.oppname = _res.oppname;
                  this.res.winnerid = _res.winnerid;
                  this.OppScore = _res.oppPercentage;
                  this.MyScore = _res.MyPercentage;
                  if (this.res.winnerid == _uId) {
                     this.winnerScore = this.MyScore.toString();
                     this.LooserScore = this.OppScore.toString();
                     this.Won = "You";
                     this.Lost = _res.oppname;
                     this.ShowTrophy = true;
                  } else {
                     this.winnerScore = this.OppScore.toString();
                     this.LooserScore = this.MyScore.toString();
                     this.Won = _res.oppname;
                     this.Lost = "You";
                     this.ShowTrophy = false;
                  }
                  if ((this.OppScore == this.MyScore) && this.Won == 'You' && this.winnerScore !== "00%" && this.winnerScore !== "0%") {
                     this.ScoreTieMsg = this.Won + " are faster than " + this.Lost;
                  } else if ((this.OppScore == this.MyScore) && this.Lost == 'You' && this.winnerScore !== "00%" && this.winnerScore !== "0%") {
                     this.ScoreTieMsg = this.Won + " is faster than " + this.Lost;
                  } else if ((this.OppScore == this.MyScore) && (this.winnerScore == "00%" || this.winnerScore !== "0%")) {
                     ShouldShowScore = false;
                     this.MatchTie = true;
                     this.ScoreTieMsg = "No one won";
                  }
                  //if(ShouldShowScore === true) {
                  this.ShowScore();
                  //}
               }
               
            }).catch(() => { this.LoadingStop();});
         }).catch(() => { this.LoadingStop();});
      }).catch(() => { this.LoadingStop();});
   }
   async IsTowPlayerWinnerReady(): Promise<any> {
      return new Promise(async (resolve, reject) => {
         try {
            var _testId = await this.dbServer.GetPropertyAsPromise("testId");
            var _userId = await this.dbServer.GetPropertyAsPromise("userid");
            var IsFinished = await this.IsOpponentQuizFinished();
            await this.dbServer.Generate2PlayerResult();
            if (IsFinished === 1) {
               resolve(1);
            } else {
               resolve(0);
            }
         } catch (e) {
            console.log(e);
            reject(0);
         }
      });
   }
   async IsOpponentQuizFinished(): Promise<number> {
      let SecondsCount = 0;
      let RequestValid = true;
      var _testId = await this.dbServer.GetPropertyAsPromise("testId");
      var _userId = await this.dbServer.GetPropertyAsPromise("userid");
      var _against = await this.dbServer.GetPropertyAsPromise("AgainstId");
      let link1 = "player/should_get_report.php";
      if (_against == '2') {
         link1 = "player/should_get_report.php";
      } else if (_against == '3') {
         link1 = "player/should_get_report.php";
      } else if (_against == '5') {
         link1 = "player/should_get_report.php";
      }

      return new Promise((resolve, reject) => {
         let qT = setInterval(() => {
            let fd = new FormData();
            fd.append("userid", _userId);
            fd.append("testid", _testId);
            this.dbServer.PostData(this.dbServer.CommUrl + "api/" + link1, fd).then(data => {
               if (RequestValid) {
                  console.log("IsOpponentQuizFinished data ", data);
                  if ((data === 1 || data === '1') && data !== 0 && data !== null && typeof data !== undefined && data) {
                     clearInterval(qT);
                     RequestValid = false;
                     resolve(1);
                  } else {
                     console.log("getting IsOpponentQuizFinished");
                  }
               }
            }).catch((e) => { });
            if (SecondsCount > 20) {
               RequestValid = false;
               clearInterval(qT);
               reject(0); // returning empty array
            }
            SecondsCount++;
         }, 2000);
      });
   }
   AIWinner() {
      this.MatchTie = false;
      eval('MathJax.Hub.Queue(["Typeset", MathJax.Hub])');
      let ShouldShowScore = true;
      console.log('ionViewDidLoad QuizSummeryPage');
      this.dbServer.GetPropertyAsPromise("OppResult").then(_OppScore => {
         this.OppScore = +_OppScore;
         this.dbServer.GetPropertyAsPromise("MyResult").then(_myScore => {
            this.MyScore = +_myScore;
            setTimeout(() => {
               if (this.OppScore > this.MyScore) {
                  console.log("You lost");
                  this.winnerScore = this.OppScore + "%";
                  this.LooserScore = this.MyScore + "%";
                  this.Won = "VP";
                  this.Lost = "You";
                  this.ShowTrophy = false;
               } else if (this.OppScore < this.MyScore) {
                  console.log("You Won");
                  this.winnerScore = this.MyScore + "%";
                  this.LooserScore = this.OppScore + "%";
                  this.Won = "You";
                  this.Lost = "VP";
                  this.ShowTrophy = true;
               } else {
                  this.dbServer.GetPropertyAsPromise("MyCorrectTime").then(_myTime => {
                     this.dbServer.GetPropertyAsPromise("OppCorrectTime").then(_OppTime => {
                        if (_OppTime == "max") {
                           this.winnerScore = this.MyScore + "%";
                           this.LooserScore = this.OppScore + "%";
                           this.Won = "You";
                           this.Lost = "VP";
                           this.ShowTrophy = true;
                        } else if (+_OppTime < +_myTime) {
                           this.winnerScore = this.OppScore + "%";
                           this.LooserScore = this.MyScore + "%";
                           this.Won = "VP";
                           this.Lost = "You";
                           this.ShowTrophy = false;
                        } else {
                           this.winnerScore = this.MyScore + "%";
                           this.LooserScore = this.OppScore + "%";
                           this.Won = "You";
                           this.Lost = "VP";
                           this.ShowTrophy = true;
                        }
                        if ((this.OppScore == this.MyScore) && this.Won == 'You' && this.winnerScore !== "0%") {
                           this.ScoreTieMsg = this.Won + " are faster than " + this.Lost;
                        } else if ((this.OppScore == this.MyScore) && this.Lost == 'You' && this.winnerScore !== "0%") {
                           this.ScoreTieMsg = this.Won + " is faster than " + this.Lost;
                        } else if ((this.OppScore == this.MyScore) && this.winnerScore == "0%") {
                           ShouldShowScore = false;
                           this.MatchTie = true;
                           this.ScoreTieMsg = "No one won";
                           this.ShowTrophy = false;
                        }
                     });
                  });
               }
               //if(ShouldShowScore === true) {
               this.ShowScore();
               //}
            }, 400);
         });
      });
   }
}
