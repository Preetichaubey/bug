import { Component, OnInit, OnDestroy } from '@angular/core';
import { NavController, LoadingController, AlertController } from '@ionic/angular';
import { ServerService, IQuestion } from 'src/app/Services/server.service';
import { GroupQuizService } from 'src/app/Services/group-quiz.service';
import { ShareValuesService } from 'src/app/Services/share-values.service';
import { CompetitionService } from 'src/app/Services/competition.service';
declare var $: any;
@Component({
  selector: 'app-competition-ended',
  templateUrl: './competition-ended.component.html',
  styleUrls: ['./competition-ended.component.scss'],
})
export class CompetitionEndedComponent implements OnInit, OnDestroy {
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
  public alert: any;
  constructor(public navCtrl: NavController, 
     public alertCtrl: AlertController,
     public dbServer: ServerService, 
     public loadingCtrl: LoadingController,
     public groupService: GroupQuizService, 
     public shareService: ShareValuesService,
     public competitionService: CompetitionService) { }

  ngOnInit() {
     this.MatchTie = false;
     this.ResetVariables();
     this.dbServer.GetPropertyAsPromise("CompetitionAgainstId").then(_aId => {
        this.AgainstId = _aId;
        if (_aId == '1') {
           this.AIWinner();
        }
        this.dbServer.GetPropertyAsPromise("CompetitionTestId").then(tid => { this.DisplayTestId = tid });
     });
     $(document).ready(() => {
        setTimeout(() => {
           let roundWidth = $(".result-bolock").outerWidth();
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
     this.navCtrl.navigateRoot("home/competition-Leaderboard");
  }
  ScoreCard() {
     this.navCtrl.navigateRoot('home/competition-scorecard'); 
  }
  TakeAnotherQuiz() {
        this.checkQuizValidation()
   }
  
  async ShowAlertmsg(header, subheader) {
   this.alert = await this.alertCtrl.create({
     header: header,
     subHeader: subheader,
     buttons: ['OK']
   });
   await this.alert.present();
 }
 HideAlert() {
   this.alert.remove();
 }

checkQuizValidation() {
   this.LoadingStart();
     this.competitionService.checkQuizValidation().then(data => {
     
      if (data) {
         this.LoadingStop();
         
            console.log(data);

            if(data === 'expire'){

             this.ShowAlertmsg('Sorry!', 'Please upgrade or register to continue playing');
            }else if(data === 'max_reach'){

             this.ShowAlertmsg('Sorry!', 'You have played quiz for the current week, please wait for more quiz');

            }else{
               this.clearLoaclStorage()
               this.navCtrl.navigateBack('home/competition');
            }
           
         
      }
   }).catch(() => { this.LoadingStop(); });
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
 
  async IsTowPlayerWinnerReady(): Promise<any> {
     return new Promise(async (resolve, reject) => {
        try {
           var _testId = await this.dbServer.GetPropertyAsPromise("CompetitionTestId");
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
     var _testId = await this.dbServer.GetPropertyAsPromise("CompetitionTestId");
     var _userId = await this.dbServer.GetPropertyAsPromise("userid");
     var _against = await this.dbServer.GetPropertyAsPromise("CompetitionAgainstId");
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
     this.dbServer.GetPropertyAsPromise("CompetitionOppResult").then(_OppScore => {
        this.OppScore = +_OppScore;
        this.dbServer.GetPropertyAsPromise("CompetitionMyResult").then(_myScore => {
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
                 this.dbServer.GetPropertyAsPromise("CompetitionMyCorrectTime").then(_myTime => {
                    this.dbServer.GetPropertyAsPromise("CompetitionOppCorrectTime").then(_OppTime => {
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
  clearLoaclStorage(){
    localStorage.removeItem("CompetitionTopics");
    localStorage.removeItem("CompetitionLevelId");
    localStorage.removeItem("CompetitionAgainstId");
    localStorage.removeItem("Competition_submit");
    localStorage.removeItem("CompetitionTestId");
    localStorage.removeItem("CompetitionMyResult");
    localStorage.removeItem("CompetitionOppResult");
    localStorage.removeItem("CompetitionMyCorrectTime");
    localStorage.removeItem("CompetitionOppCorrectTime");
    localStorage.removeItem("CompetitioncurrQuiz");
    localStorage.removeItem("CompetitionOppCorrectTime");
    localStorage.removeItem("Competition_isPlayingQuiz");
  }
}

