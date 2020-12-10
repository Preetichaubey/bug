import { Component, OnInit, OnDestroy } from '@angular/core';
import { ServerService, IQuestion } from 'src/app/Services/server.service';
import { NavController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { MathContent } from '../../Services/Math/math-content';
import { MathDirective } from '../../Services/Math/math.directive';
import { from } from 'rxjs';
import { BackgroundProcessService } from 'src/app/Services/background-process.service';
import { timeInterval } from 'rxjs/operators';
import { AudioService } from 'src/app/Services/audio.service';
import { GroupQuizService } from 'src/app/Services/group-quiz.service';
import { IGroupMemberAnswers } from 'src/app/Services/AllInterfaces';
import { ShareValuesService } from 'src/app/Services/share-values.service';
import { GroupAnsComponent } from '../play-quiz/group-ans/group-ans.component';
import { CompetitionService } from 'src/app/Services/competition.service';
declare var $: any;
@Component({
  selector: 'app-competition-playquiz',
  templateUrl: './competition-playquiz.component.html',
  styleUrls: ['./competition-playquiz.component.scss'],
})
export class CompetitionPlayquizComponent implements OnInit, OnDestroy {
  constructor(
    public navCtrl: NavController,
    public groupService: GroupQuizService,
    public audioService: AudioService,
    public popoverController: PopoverController,
    public background: BackgroundProcessService,
    private db: ServerService,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public shareService: ShareValuesService,
    public competitionService: CompetitionService
    ) {
    eval('MathJax.Hub.Queue(["Typeset", MathJax.Hub])');
  }
  public Correct = 0;
  public OppCorrect = 0;
  public Wrong = 0;
  public OppWrong = 0;
  public timer = 0;
  public CorrectTimeCount = 0;
  public AnswerLoaded = false;
  public CurrQuestion: MathContent[] = [
    { mathml: '' }
  ];
  public levelId = '0';
  public btnText = 'Submit';
  public againstId = '0';
  public TickTime: any;
  public currQNum = 0;
  public PreviousAnswer = '';
  public NumOfQ = 0;
  public IsExamEnded = false;
  public FetchingNextQuestion = false;
  public cssClass = { A: 'normal', B: 'normal', C: 'normal', D: 'normal', E: 'normal' };
  public Options = { A: { mathml: '' }, B: { mathml: '' }, C: { mathml: '' }, D: { mathml: '' }, E: { mathml: '' } } as Options;
  public question: IQuestion[] = [
    {
      id: '', subTopicId: '', q: '', IsImg: false,
      options: { A: '', B: '', C: '', D: '', E: '' },
      ideal_time: -1, final_ans: '', given_ans: '', final_ans_string: '',
      time_taken: '', CssClass: '', OppAns: '', OppTime: 0
    }
  ];
  public MemberResponses: IGroupMemberAnswers[] = [];
  public MemberResponsesInterval: any;
  public loader: any;
  public OppName = '';
  public IsLikeMindedAIFriend = false;
  public AmI2ndPlayer = false;
  private tryCount = 0;
  public correct:any;
  async ShowAlert() {
    console.log("Its end")
    localStorage.setItem('CompetitioncurrQuiz', JSON.stringify(this.question));
    this.audioService.QuizEnded();
    this.navCtrl.navigateBack('home/competition-quizended');

  }
  async ShowAlertNoUserFound(msg = 'No user found to play the quiz, please try again..') {
    let alrt = await this.alertCtrl.create({
      message: msg,
      buttons: [
        {
          text: 'Okay',
          handler: data => {
            console.log('Okay clicked');
            this.audioService.QuizEnded();
            this.navCtrl.navigateRoot('home');
            this.db.SetProperty('isPlayingQuiz', '0');
          }
        }
      ]
    });
    alrt.present();
  }
  async ngOnInit() {
    const AmI2nd = await this.db.GetPropertyAsPromise('Competition_AmI2ndPlayer');
    if (AmI2nd === '1') {
      this.AmI2ndPlayer = true;
    } else {
      this.AmI2ndPlayer = false;
    }
    this.db.SetProperty('Competition_AmI2ndPlayer', '0');
    this.db.SetProperty('Competition_isPlayingQuiz', '1');
    eval('MathJax.Hub.Queue(["Typeset", MathJax.Hub])');
    localStorage.setItem('Competition_submit', '0');
    $('#MathJax_Message').wrap('<div style="display: none;"></div>');
    setTimeout(() => {
      $('.secondary-header').height($('.secondary-header ion-row').outerHeight());
      console.log('Height : ', $('.secondary-header ion-row').outerHeight());
    }, 900);

    this.db.IsAlertShown = false;
    this.currQNum = 0;
    this.currQNum = 0;
    this.Correct = 0;
    this.Wrong = 0;
    this.PreviousAnswer = '';
    this.db.GetPropertyAsPromise('CompetitionAgainstId').then(_againstId => {
      console.log('CompetitionAgainstId', _againstId);
      this.againstId = _againstId;
      this.OppName = ' ';
      this.SetTestId();
      this.OppName = 'VP';
    });
   setTimeout(() => {
      this.audioService.QuizStarted();
      setTimeout(() => {
        this.audioService.QuizStarted();
      }, 700);
    }, 4000);
 }
  async CloseCustomeLoader() {
    clearInterval(this.TickTime);
    this.audioService.QuizEnded();
    this.navCtrl.navigateRoot('home');
  }
  async ShowCustomeLoader() {
    if (this.AmI2ndPlayer) {
      this.LoadingStart();
    } else {
      $('.custome-loader').css('display', 'block');
    }
  }
  async HideCustomeLoader() {
    if (this.AmI2ndPlayer) {
      this.LoadingStop();
    } else {
      $('.custome-loader').css('display', 'none');
    }
  }
  async presentPopover() {
    const popover = await this.popoverController.create({
      component: GroupAnsComponent,
      // event: ev,
      translucent: true
    });
    return await popover.present();
  }
  ngOnDestroy() {
    this.db.SetProperty('isPlayingQuiz', '0');
    this.audioService.QuizEnded();
    clearInterval(this.TickTime);
    this.LoadingStop();
    this.ClearGroupsIntervals();
  }
  async LoadingStart(Msg = 'Please wait...', Duration = 20000) {
    this.loader = await this.loadingCtrl.create({
      message: Msg,
      duration: Duration
    });
    this.loader.present();
  }
  LoadingStop() {
    try {
      setTimeout(() => {
        if (this.loader) {
          this.loader.dismiss();
        } else {
          console.log('Loading could not be stopped');
          setTimeout(() => {
            this.loader.dismiss();
          }, 1000);
        }
      }, 200);
    } catch (e) {
      console.error(e);
    }
  }
  ResetClasses() {
    this.cssClass = { A: 'normal', B: 'normal', C: 'normal', D: 'normal', E: 'normal' };
  }

  SetTestId() {
    this.levelId = localStorage.getItem('CompetitionLevelId');
    this.competitionService.GetCompetitionTestId(this.againstId, this.levelId, '0').then(
      data => {
        console.log(data);
        this.SetQuestion();

      }
    ).catch((e) => {
      console.log('In Catch');
      this.LoadingStop();
      this.ShowAlertNoUserFound('Oops..! Something is wrong please try again latter.');
      // }
    });
  }

  SetQuestion() {
    this.tryCount++;
    this.LoadingStart('Please wait...', 35000);
    eval('MathJax.Hub.Queue(["Typeset", MathJax.Hub])');
    this.levelId = localStorage.getItem('CompetitionLevelId');
    // this.againstId =localStorage.getItem("AgainstId");
    this.competitionService.GetCompetition().then(
      data => {
        console.log(data);
        this.LoadingStop();
        if (data.length > 0 && data !== null && data !== undefined) {
          this.question = data as IQuestion[];
          console.log(this.question.length)
          this.NumOfQ = this.question.length;
          setTimeout(() => {
            this.timer = +this.question[this.currQNum].ideal_time;
            // this.CurrQuestion[this.currQNum] = {} as MathContent;
            this.Options.A = { mathml: this.question[this.currQNum].options.A };
            this.Options.B = { mathml: this.question[this.currQNum].options.B };
            this.Options.C = { mathml: this.question[this.currQNum].options.C };
            this.Options.D = { mathml: this.question[this.currQNum].options.D };
            this.Options.E = { mathml: this.question[this.currQNum].options.E };
            this.CurrQuestion[this.currQNum] = { mathml: this.question[this.currQNum].q.toString() };
            let chkcounter = 0;
            const checkAns = setInterval(() => {
              if (chkcounter > 2 && this.Options.A.mathml && this.Options.A.mathml !== undefined && this.Options.A.mathml !== 'undefined' && typeof this.Options.A.mathml !== undefined && this.Options.A.mathml !== null) {
                this.AnswerLoaded = true;
                clearInterval(checkAns);
                this.TickTime = setInterval(() => {
                  this.OnEverySecond();
                }, 1000);
              }
              chkcounter++;
              if (chkcounter === 5) {
                if (!this.AnswerLoaded) {
                  this.AnswerLoaded = true;
                  clearInterval(checkAns);
                  this.TickTime = setInterval(() => {
                    this.OnEverySecond();
                  }, 1000);
                }
              }
            }, 1000);

          }, 700);
        } else {
          /* if(this.tryCount <3){
            this.SetQuestion();
          } else { */
            this.LoadingStop();
            this.ShowAlertNoUserFound('Oops..! Something is wrong please try again latter.');
          // }
        }
      }
    ).catch((e) => {
      console.log('In Catch');
      this.db.errPop.DisplayAlert(e);
      this.LoadingStop();
      this.ShowAlertNoUserFound('Oops..! Something is wrong please try again latter');
      // }
    });
  }


  OnEverySecond() {
    if (this.IsExamEnded !== true) {
      if (this.timer === 0) {
        if (this.againstId === '1') {
          this.NextQuestion();
        }
      } else {
        if (this.timer > 0) {
          this.timer--;
        }
      }
    }
  }

  
  NextQuestion() {
   
    this.AIResponce()

    if (this.question.length == (this.currQNum + 2)) {
      this.btnText = 'Finish';
    }
    eval('MathJax.Hub.Queue(["Typeset", MathJax.Hub])');
    if (this.question.length > (this.currQNum + 1)) {
      this.PreviousAnswer = '';
      this.currQNum++;
      this.ResetClasses();
      this.Options.A = { mathml: this.question[this.currQNum].options.A };
      this.Options.B = { mathml: this.question[this.currQNum].options.B };
      this.Options.C = { mathml: this.question[this.currQNum].options.C };
      this.Options.D = { mathml: this.question[this.currQNum].options.D };
      this.Options.E = { mathml: this.question[this.currQNum].options.E };
      this.CurrQuestion[this.currQNum] = { mathml: this.question[this.currQNum].q };
      this.timer = this.question[this.currQNum].ideal_time;
    } else {
      this.IsExamEnded = true;
      const MyResult = (this.Correct / this.question.length) * 100;
      localStorage.setItem('CompetitionMyResult', MyResult.toString());
      if (this.againstId === '1') {
        const OppResult = (this.OppCorrect / this.question.length) * 100;
        var OppResult1 = OppResult.toFixed(2);
        localStorage.setItem('CompetitionOppResult', OppResult1.toString());
        localStorage.setItem('CompetitionMyCorrectTime', this.CorrectTimeCount.toString());
        localStorage.setItem('CompetitionOppCorrectTime', this.AICorrectAnsTime());
        // this.db.EndExam(this.question, this.IsLikeMindedAIFriend);
      }
      this.ShowAlert();
      console.log('end exam');
    }
    localStorage.setItem('Competition_submit', '0');
    setTimeout(() => {
      this.FetchingNextQuestion = false;
    }, 200);
  }


  AIResponce() {
    if (this.IsExamEnded === false) {
      if (this.againstId == '1') {
        if (this.levelId == '4') {
          this.question[this.currQNum].OppTime = 2;
          this.question[this.currQNum]['OppAns'] = this.AIRandomAns().toLowerCase();
          if (this.question[this.currQNum].final_ans.toUpperCase() === this.question[this.currQNum].OppAns.toUpperCase()) {
            this.OppCorrect++;
            this.correct = this.currQNum
            console.log('Number : ' + this.currQNum);
            this.updateCompetition('AI');
         
          }
          console.log(this.question[this.currQNum])
        }
       // console.log('AIResponce', this.question);
      }
    }
  }



  SaveCompetitionAnswer() {
    // this.LoadingStart();
    let count = 0;
    let given_ans = this.question[this.currQNum].given_ans
    let time_taken = this.question[this.currQNum].time_taken

    setTimeout(() => {
        this.db.GetPropertyAsPromise('userid').then(_uId => {
             let formData = new FormData();
             
             formData.append('player', _uId);
             formData.append('testid', localStorage.getItem('CompetitionTestId'));
             formData.append('question_id', this.question[this.currQNum].id);
             formData.append('player_answer', given_ans);
             formData.append('time', time_taken);

             console.log(formData);
             // formData.append('mobile', this.mobile.toString());
             this.db.PostData(this.db.CommUrl + 'api/competition/response_update.php', formData)
                .then(
                   data => {
                      this.LoadingStop();
                      console.log(data);
                      if (data == 1) {
                         setTimeout(() => {
                          this.NextQuestion();
                         }, 200);
                      } else {
                        this.ShowAlertNoUserFound('Oops..! Something is wrong please try again latter');
                      }
                   },
                   error => {
                      this.LoadingStop();
                      console.error(error);
                      this.ShowAlertNoUserFound('Oops. Something is wrong, please try again after some time.');
                   }
                );
          });

    }, 700);

 }

 updateCompetition(playerType) {
  // this.LoadingStart();
console.log(">>>>>>>>>>>>>>>>>> ", this.question[this.currQNum])

console.log('Number : ' + this.currQNum);
  let count = 0;
  let given_ans = this.question[this.currQNum].given_ans
  let time_taken:any = this.question[this.currQNum].time_taken

  
  
  setTimeout(() => {
      this.db.GetPropertyAsPromise('userid').then(_uId => {
           let formData = new FormData();
           if(playerType == 'AI'){
            let OppAns = this.question[this.correct].OppAns
            let OppTime:any = this.question[this.correct].OppTime

            formData.append('userid', 'AI');
            formData.append('testid', localStorage.getItem('CompetitionTestId'));
            formData.append('question_id', this.question[this.correct].id);
            formData.append('player_answer', OppAns);
            formData.append('time', OppTime);
          }else{
            formData.append('userid', _uId);
            formData.append('testid', localStorage.getItem('CompetitionTestId'));
            formData.append('question_id', this.question[this.currQNum].id);
            formData.append('player_answer', given_ans);
            formData.append('time', time_taken);
          }

           console.log(formData);
           // formData.append('mobile', this.mobile.toString());
           this.db.PostData(this.db.CommUrl + 'api/competition/count_update.php', formData)
              .then(
                 data => {
                    this.LoadingStop();
                    console.log(data);
                    // if (data == 1) {
                    //    setTimeout(() => {
                    //     this.AIResponce();
                    //    }, 200);
                    // } else {
                    //   this.ShowAlertNoUserFound('Oops..! Something is wrong please try again latter===>>');
                    // }
                 },
                 error => {
                    this.LoadingStop();
                    console.error(error);
                    this.ShowAlertNoUserFound('Oops. Something is wrong, please try again after some time.....');
                 }
              );
        });

  }, 700);

}

  AICorrectAnsTime(): string {
   if (this.levelId == '4') {
      return '0';
    }
    return '';
  }
  AIRandomAns(): string {
    let x = Math.floor((Math.random() * 4) + 1);
    let ans = '';
    ans = (x == 1) ? 'A' : (x == 2) ? 'B' : (x == 3) ? 'C' : (x == 4) ? 'D' : 'A';
    return ans;
  }
  clickedRow(Option: string) {
    if (this.FetchingNextQuestion == false) {
      this.audioService.AnswerSelected();
      this.question[this.currQNum].given_ans = Option.toLowerCase();
      if (this.PreviousAnswer !== '') {
        this.cssClass[this.PreviousAnswer] = 'normal';
      }
      this.PreviousAnswer = Option;
      this.cssClass[Option] = 'selected';
      this.question[this.currQNum].CssClass = 'selected';
      if (this.againstId === '4') {
        this.groupService.SendMyResponce(this.question[this.currQNum].given_ans,
        (this.question[this.currQNum].ideal_time - this.timer), +this.question[this.currQNum].id, this.currQNum);
      }
      setTimeout(() => {
      }, 1000);
     }
  }

  btnNextClicked() {
    if (this.IsExamEnded === false && this.FetchingNextQuestion === false) {
      this.FetchingNextQuestion = true;
      console.log('QuestionNumber', this.currQNum);

      if (this.question[this.currQNum].final_ans.toUpperCase() === this.question[this.currQNum].given_ans.toUpperCase()) {

        if (this.PreviousAnswer !== '') {
          this.cssClass[this.PreviousAnswer] = 'correct';
        }
        this.question[this.currQNum].CssClass = 'correct';
        this.Correct++;
        this.CorrectTimeCount = this.CorrectTimeCount + (this.question[this.currQNum].ideal_time - this.timer);
        this.updateCompetition('user');
      } else {
        if (this.PreviousAnswer !== '') {
          this.cssClass[this.PreviousAnswer] = 'invalid';
        }
        this.question[this.currQNum].CssClass = 'invalid';
        this.Wrong++;
      }
      this.question[this.currQNum].time_taken = (this.question[this.currQNum].ideal_time - this.timer).toString();

      setTimeout(() => {
        this.SaveCompetitionAnswer();
      }, 1000);
    } else {
      if (this.IsExamEnded) {
        this.ShowAlert();
      }
    }
  }

  async btnQuit() {
    // this.TickTime = null;
    let altQut = await this.alertCtrl.create({
      header: 'Do you want to quit the quiz?',
      buttons: [{
        text: 'Yes',
        handler: () => {
          clearInterval(this.TickTime);
          this.audioService.QuizEnded();
          this.navCtrl.navigateRoot('home');
        }
      }, {
        text: 'Cancel'
      }]
    });
    altQut.present();
  }


  ClearGroupsIntervals() {
    clearInterval(this.MemberResponsesInterval);
   // clearInterval(this.ChkOppResponce);
    clearInterval(this.TickTime);
  }
}
export interface Options {
  A: MathContent;
  B: MathContent;
  C: MathContent;
  D: MathContent;
  E: MathContent;
}
