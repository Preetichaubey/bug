import { Component, OnInit, OnDestroy } from '@angular/core';
import { ServerService, IQuestion } from 'src/app/Services/server.service';
import { NavController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { MathContent } from '../../Services/Math/math-content';
import { MathDirective } from '../../Services/Math/math.directive';
import { from } from 'rxjs';
import { BackgroundProcessService } from 'src/app/Services/background-process.service';
import { timeInterval } from 'rxjs/operators';
import { GroupAnsComponent } from './group-ans/group-ans.component';
import { AudioService } from 'src/app/Services/audio.service';
import { GroupQuizService } from 'src/app/Services/group-quiz.service';
import { IGroupMemberAnswers } from 'src/app/Services/AllInterfaces';
import { ShareValuesService } from 'src/app/Services/share-values.service';
declare var $: any;
@Component({
  selector: 'app-play-quiz',
  templateUrl: './play-quiz.component.html',
  styleUrls: ['./play-quiz.component.scss'],
})
export class PlayQuizComponent implements OnInit, OnDestroy {
  public Correct = 0;
  public OppCorrect = 0;
  public Wrong = 0;
  public OppWrong = 0;
  public timer = 0;
  public CorrectTimeCount: number = 0;
  public AnswerLoaded = false;
  public CurrQuestion: MathContent[] = [
    { mathml: '' }
  ];
  public levelId = '0';
  public btnText = "Submit";
  public againstId = '0';
  public TickTime: any;
  public currQNum = 0;
  public PreviousAnswer = '';
  public NumOfQ: number = 0;
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
  public OppName = "";
  public IsLikeMindedAIFriend = false;
  public AmI2ndPlayer = false;
  async ShowAlert() {
    localStorage.setItem("currQuiz", JSON.stringify(this.question));
    this.audioService.QuizEnded();
    this.navCtrl.navigateBack("home/quizended");
    
  }
  async ShowAlertNoUserFound(msg = 'No user found to play the quiz, please try again..') {
    var alrt = await this.alertCtrl.create({
      message: msg,
      buttons: [
        {
          text: 'Okay',
          handler: data => {
            console.log('Okay clicked');
            this.audioService.QuizEnded();
            this.navCtrl.navigateRoot('home');
            this.db.SetProperty("isPlayingQuiz", "0");
          }
        }
      ]
    });
    alrt.present();
  }
  constructor(public navCtrl: NavController, public groupService: GroupQuizService, 
    public audioService: AudioService, public popoverController: PopoverController, 
    public background: BackgroundProcessService, private db: ServerService, 
    public alertCtrl: AlertController, public loadingCtrl: LoadingController,
    public shareService: ShareValuesService) {
    eval('MathJax.Hub.Queue(["Typeset", MathJax.Hub])');
  }
  async ngOnInit() {
    let AmI2nd = await this.db.GetPropertyAsPromise("AmI2ndPlayer");
    if(AmI2nd === '1'){
      this.AmI2ndPlayer = true;
    } else {
      this.AmI2ndPlayer = false;
    }
    this.db.SetProperty("AmI2ndPlayer", "0");
    this.db.SetProperty("isPlayingQuiz", "1");
    eval('MathJax.Hub.Queue(["Typeset", MathJax.Hub])');
    localStorage.setItem("is_submit", '0');
    $("#MathJax_Message").wrap("<div style=\"display: none;\"></div>");
    setTimeout(() => {
      $(".secondary-header").height($(".secondary-header ion-row").outerHeight());
      console.log("Height : ", $(".secondary-header ion-row").outerHeight());
    }, 900);

    this.db.IsAlertShown = false;
    this.currQNum = 0;
    this.currQNum = 0;
    this.Correct = 0;
    this.Wrong = 0;
    this.PreviousAnswer = '';
    this.db.GetPropertyAsPromise("AgainstId").then(_againstId => {
      this.againstId = _againstId;
      this.OppName = " ";
        if (this.againstId == '1') {
          this.SetQuestion();
          this.OppName = "VP";
        } else if (this.againstId == '2') {
          this.ShowCustomeLoader();
          this.TwoPlayerQuestions();
        } else if (this.againstId == '3') {
          this.ShowCustomeLoader();
          this.TwoPlayerQuestions();
        } else if (this.againstId == '4') {
          this.GroupQuestions();
        } else if (this.againstId == '5') {
          this.SetQuestionForUnknownAI();
        }

    });
    /* this.audioService.LoadAudios();
    setTimeout(() => {
      this.audioService.LoadAudios();
    }, 2000); */
    setTimeout(() => {
      this.audioService.QuizStarted();
      setTimeout(() => {
        this.audioService.QuizStarted();
      }, 700);
    }, 4000);

    //this.presentPopover();
  }
  async CloseCustomeLoader(){
    clearInterval(this.TickTime);
    this.audioService.QuizEnded();
    this.navCtrl.navigateRoot("home");
  }
  async ShowCustomeLoader() {
    if(this.AmI2ndPlayer) {
      this.LoadingStart();
    } else {
      $(".custome-loader").css("display", "block");
    }
  }
  async HideCustomeLoader() {
    if(this.AmI2ndPlayer) {
      this.LoadingStop();
    } else {
      $(".custome-loader").css("display", "none");
    }
  }
  async presentPopover() {
    const popover = await this.popoverController.create({
      component: GroupAnsComponent,
      //event: ev,
      translucent: true
    });
    return await popover.present();
  }
  ngOnDestroy() {
    this.db.SetProperty("isPlayingQuiz", "0");
    this.audioService.QuizEnded();
    clearInterval(this.TickTime);
    this.LoadingStop();
    this.ClearGroupsIntervals();
  }
  async LoadingStart(Msg = "Please wait...", Duration = 20000) {
    this.loader = await this.loadingCtrl.create({
      message: Msg,
      duration: Duration
    });
    this.loader.present();
  }
  LoadingStop() {
    try{
      setTimeout(() => {
        if (this.loader) {
          this.loader.dismiss();
        } else {
          console.log("Loading could not be stopped");
          setTimeout(() => {
            this.loader.dismiss();
          }, 1000);
        }
      }, 200);
    } catch(e) {
      console.error(e);
    }
  }
  ResetClasses() {
    this.cssClass = { A: 'normal', B: 'normal', C: 'normal', D: 'normal', E: 'normal' };
  }
  private tryCount = 0;
  SetQuestion() {
    this.tryCount++;
    this.LoadingStart("Please wait...", 5000); //35000
    eval('MathJax.Hub.Queue(["Typeset", MathJax.Hub])');
    this.levelId = localStorage.getItem("LevelId");
    //this.againstId =localStorage.getItem("AgainstId");
    this.db.GetExams(this.againstId, this.levelId, '0').then(
      data => {
        this.LoadingStop();
        this.HideCustomeLoader();
        if (data.length > 0 && data !== null && data !== undefined) {
          this.question = data as IQuestion[];
          this.NumOfQ = this.question.length;
          setTimeout(() => {
            this.timer = +this.question[this.currQNum].ideal_time;
            //this.CurrQuestion[this.currQNum] = {} as MathContent;
            this.Options.A = { mathml: this.question[this.currQNum].options.A };
            this.Options.B = { mathml: this.question[this.currQNum].options.B };
            this.Options.C = { mathml: this.question[this.currQNum].options.C };
            this.Options.D = { mathml: this.question[this.currQNum].options.D };
            this.Options.E = { mathml: this.question[this.currQNum].options.E };
            this.CurrQuestion[this.currQNum] = { mathml: this.question[this.currQNum].q.toString() };
            let chkcounter = 0;
            let checkAns = setInterval(() => {
              if (chkcounter > 2 && this.Options.A.mathml && this.Options.A.mathml !== undefined && this.Options.A.mathml !== 'undefined' && typeof this.Options.A.mathml !== undefined && this.Options.A.mathml !== null) {
                this.AnswerLoaded = true;
                clearInterval(checkAns);
                this.TickTime = setInterval(() => {
                  this.OnEverySecond();
                }, 1000);
              }
              chkcounter++;
              if (chkcounter === 5) {
                if(!this.AnswerLoaded){
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
            this.ShowAlertNoUserFound("Oops..! Something is wrong please try again latter.");
          //}
        }
      }
    ).catch((e) => {
      console.log("In Catch");
      /* if(this.tryCount <3){
        console.log("retrying");
        this.LoadingStop();
        this.SetQuestion();
      } else { */
        this.db.errPop.DisplayAlert(e);
        this.LoadingStop();
        this.ShowAlertNoUserFound("Oops..! Something is wrong please try again latter.");
      //}
    });
  }
  SetQuestionForUnknownAI() {
    let TestId = "0";
    let MatchType = 0; //MatchType ->  0: NewMatch, 1: Rematch, 2: Comming from Notification,
    this.tryCount++;
    //this.LoadingStart();
    this.ShowCustomeLoader();
    eval('MathJax.Hub.Queue(["Typeset", MathJax.Hub])');
    localStorage.setItem("LevelId", "4");
    localStorage.setItem("AgainstId", "5");
    this.IsLikeMindedAIFriend = true;
    this.againstId = "1";
    this.levelId = "4";
    console.log("Getting AI");
    let IsRematch = new Promise((resolve) => {
      this.db.GetPropertyAsPromise("MatchType").then(_MatchType => {
        console.log("MatchType", _MatchType);
          if(_MatchType === "1" || _MatchType === "2"){
            MatchType = _MatchType;
            this.db.GetPropertyAsPromise("testId").then(_testId => {
              TestId = _testId;
              this.db.SetProperty("MatchType", "0");
              resolve();
            }).catch(()=> {resolve();});
          } else {
            resolve();
          }
        }).catch(()=>{resolve();})
      });
      IsRematch.then(() => {
        this.db.GetLikemindedAIExams(TestId, MatchType).then(
          data => {
            //this.LoadingStop();
            this.HideCustomeLoader();
            if (data.length > 0 && data !== null && data !== undefined) {
              this.question = data as IQuestion[];
              this.NumOfQ = this.question.length;
              this.db.GetPropertyAsPromise("OppName").then(_oppName => {
                if(_oppName != undefined || _oppName != 'undefined'){
                  this.OppName = _oppName;
                } else{
                  this.OppName = " ";
                }
              });
              setTimeout(() => {
                this.timer = +this.question[this.currQNum].ideal_time;
                //this.CurrQuestion[this.currQNum] = {} as MathContent;
                this.Options.A = { mathml: this.question[this.currQNum].options.A };
                this.Options.B = { mathml: this.question[this.currQNum].options.B };
                this.Options.C = { mathml: this.question[this.currQNum].options.C };
                this.Options.D = { mathml: this.question[this.currQNum].options.D };
                this.Options.E = { mathml: this.question[this.currQNum].options.E };
                this.CurrQuestion[this.currQNum] = { mathml: this.question[this.currQNum].q.toString() };
                let chkcounter = 0;
                let checkAns = setInterval(() => {
                  if (chkcounter > 2 && this.Options.A.mathml && this.Options.A.mathml !== undefined && this.Options.A.mathml !== 'undefined' && typeof this.Options.A.mathml !== undefined && this.Options.A.mathml !== null) {
                    this.AnswerLoaded = true;
                    this.TickTime = setInterval(() => {
                      this.OnEverySecond();
                    }, 1000);
                    clearInterval(checkAns);
                  }
                  chkcounter++;
                  if (chkcounter === 5) {
                    if(this.AnswerLoaded == false) {
                      this.TickTime = setInterval(() => {
                        this.OnEverySecond();
                      }, 1000);
                    }
                    this.AnswerLoaded = true;
                    clearInterval(checkAns);
                  }
                }, 1000);
                
              }, 700);
            } else {
              if(this.tryCount <3){
                this.SetQuestionForUnknownAI();
              }
            }
          }
        ).catch((e) => {
          this.HideCustomeLoader();
          //this.LoadingStop();
          if(this.tryCount <3){
            this.db.errPop.DisplayAlert(e);
            this.SetQuestionForUnknownAI();
          }
        });
      });
  }
  TwoPlayerQuestions() {
    console.log("geting q");
    //this.LoadingStart("Finding...", 40000);
    this.db.GetPropertyAsPromise("testId").then(_tId => {
      this.db.GetPropertyAsPromise("friendId").then(_fId => {
        this.background.CheckIfQuestionGot(this.againstId, _fId, _tId).then(
          data => {
            //this.LoadingStop();
            //this.HideCustomeLoader();
            console.log(data);
            if (data.length != 0) {
              this.question = data as IQuestion[];
              this.NumOfQ = this.question.length;
              this.db.GetPropertyAsPromise("OppName").then(_oppName => {
                this.OppName = _oppName
              });
              setTimeout(() => {
                //this.LoadingStop();
                this.HideCustomeLoader();
                this.timer = +this.question[this.currQNum].ideal_time;
                //this.CurrQuestion[this.currQNum] = {} as MathContent;
                this.Options.A = { mathml: this.question[this.currQNum].options.A };
                this.Options.B = { mathml: this.question[this.currQNum].options.B };
                this.Options.C = { mathml: this.question[this.currQNum].options.C };
                this.Options.D = { mathml: this.question[this.currQNum].options.D };
                this.Options.E = { mathml: this.question[this.currQNum].options.E };
                this.CurrQuestion[this.currQNum] = { mathml: this.question[this.currQNum].q.toString() };
                let chkcounter = 0;
                let checkAns = setInterval(() => {
                  if (this.Options.A.mathml && this.Options.A.mathml !== undefined && this.Options.A.mathml !== 'undefined' && typeof this.Options.A.mathml !== undefined && this.Options.A.mathml !== null) {
                    this.AnswerLoaded = true;
                    this.TickTime = setInterval(() => {
                      this.OnEverySecond();
                    }, 1000);
                    clearInterval(checkAns);
                  }
                  chkcounter++;
                  if (chkcounter === 5) {
                    if(this.AnswerLoaded == false) {
                      this.TickTime = setInterval(() => {
                        this.OnEverySecond();
                      }, 1000);
                    }
                    this.AnswerLoaded = true;
                    clearInterval(checkAns);
                  }
                }, 1000);
              }, 500);
            } else {
              if(this.againstId === '3') {
                this.SetQuestionForUnknownAI();
              } else {
                this.ShowCustomeLoader();
                this.ShowAlertNoUserFound();
              }
            }
          }
        ).catch((e)=>{console.log(e)});
      });
    });
    //this.againstId =localStorage.getItem("AgainstId");

  }
  OnEverySecond() {
    if (this.IsExamEnded !== true) {
      if (this.timer === 0) {
        if (this.againstId === '1') {
          this.NextQuestion();
        } else if (this.againstId === '4') {
          this.GroupbtnNext(true);
        } else if ((this.againstId === '2' || this.againstId === '3') && this.FetchingNextQuestion === false) {
          this.btnNextTwoPlayer();
        }
      } else {
        if (this.timer > 0) {
          this.timer--;
        }
      }
    }
  }
  NextQuestion() {
    if (this.againstId == '1') {
      this.AIResponce();
    }

    if (this.question.length == (this.currQNum + 2)) {
      this.btnText = "Finish";
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
      let MyResult = (this.Correct / this.question.length) * 100;
      localStorage.setItem("MyResult", MyResult.toString());
      if (this.againstId === '1') {
        let OppResult = (this.OppCorrect / this.question.length) * 100;
        localStorage.setItem("OppResult", OppResult.toString());
        localStorage.setItem("MyCorrectTime", this.CorrectTimeCount.toString());
        localStorage.setItem("OppCorrectTime", this.AICorrectAnsTime());
        this.db.EndExam(this.question, this.IsLikeMindedAIFriend);
      }
      this.ShowAlert();
      console.log("end exam");
    }
    localStorage.setItem("is_submit", '0');
    setTimeout(() => {
      this.FetchingNextQuestion = false;
    }, 200);
  }
  AIResponce() {
    if (this.IsExamEnded === false) {
      if (this.againstId == '1') {
        if (this.levelId == '1') {
          this.OppCorrect++;
          this.question[this.currQNum]["OppAns"] = this.question[this.currQNum]['final_ans'];
          this.question[this.currQNum].OppTime = this.question[this.currQNum]['ideal_time'];
        } else if (this.levelId == '2') {
          this.question[this.currQNum].OppTime = 15;
          if (this.currQNum != 1 && this.currQNum != 3 && this.currQNum != 5) {
            this.OppCorrect++;
            this.question[this.currQNum]["OppAns"] = this.question[this.currQNum]['final_ans'];
          } else if (this.question[this.currQNum]['final_ans'] == 'a') {
            this.question[this.currQNum]["OppAns"] = "d";
          } else {
            this.question[this.currQNum]["OppAns"] = "a"
          }
        } else if (this.levelId == '3') {
          this.question[this.currQNum].OppTime = 10;
          if (this.currQNum != 1 && this.currQNum != 3 && this.currQNum != 5 && this.currQNum != 7 && this.currQNum != 9) {
            this.OppCorrect++;
            this.question[this.currQNum]["OppAns"] = this.question[this.currQNum]['final_ans'];
          } else if (this.question[this.currQNum]['final_ans'] == 'a') {
            this.question[this.currQNum]["OppAns"] = "d";
          } else {
            this.question[this.currQNum]["OppAns"] = "a"
          }
        } else if (this.levelId == '4') {
          this.question[this.currQNum].OppTime = 2;
          this.question[this.currQNum]["OppAns"] = this.AIRandomAns().toLowerCase();
          if (this.question[this.currQNum]['final_ans'].toUpperCase() === this.question[this.currQNum]['OppAns'].toUpperCase()) {
            this.OppCorrect++;
          }
        }
      }
    }
  }
  AICorrectAnsTime(): string {
    if (this.levelId == '1') {
      return "max";
    } else if (this.levelId == '2') {
      return "105";
    } else if (this.levelId == '3') {
      return "50";
    } else if (this.levelId == '4') {
      return "0";
    }
    return "";
  }
  AIRandomAns(): string {
    var x = Math.floor((Math.random() * 4) + 1);
    var ans = "";
    ans = (x == 1) ? "A" : (x == 2) ? "B" : (x == 3) ? "C" : (x == 4) ? "D" : "A";
    return ans;
  }
  clickedRow(Option: string) {
    if (this.FetchingNextQuestion == false) {
      this.audioService.AnswerSelected();
      this.question[this.currQNum]['given_ans'] = Option.toLowerCase();
      if (this.PreviousAnswer !== '') {
        this.cssClass[this.PreviousAnswer] = 'normal';
      }
      this.PreviousAnswer = Option;
      this.cssClass[Option] = 'selected';
      this.question[this.currQNum].CssClass = 'selected';
      if (this.againstId === '4') {
        this.groupService.SendMyResponce(this.question[this.currQNum]['given_ans'], 
        (this.question[this.currQNum].ideal_time - this.timer), +this.question[this.currQNum].id, this.currQNum);
      }
      //this.FetchingNextQuestion = true;
      setTimeout(() => {
        //this.NextQuestion();
      }, 1000);
      //this.NextQuestion();
    }
  }
  
  btnNextTwoPlayer() {
    if (this.IsExamEnded === false && this.FetchingNextQuestion === false) {
      this.FetchingNextQuestion = true;
      var ansSubmitAttempts = 0;
      var IsProceededForNextLevel = false;
      this.LoadingStart("Waiting for your opponent", 30000);
      let SubmitAnsTimer = setInterval(() => {
        ansSubmitAttempts++;
        if(ansSubmitAttempts <= 2){
          this.question[this.currQNum]['time_taken'] = (this.question[this.currQNum].ideal_time - this.timer).toString();
          this.db.SendTwoPlayerAnswer(+this.againstId, +this.question[this.currQNum]['id'], this.question[this.currQNum]['given_ans'], this.question[this.currQNum]['time_taken'])
            .then(_d => {
              if(!IsProceededForNextLevel){
                IsProceededForNextLevel = true;
                this.TwoPlayerShouldShowNextQue();
              }
              clearInterval(SubmitAnsTimer);
            }).catch((e) => {
              this.db.errPop.DisplayAlert(e);
            });
        } else {
          if(!IsProceededForNextLevel){
            IsProceededForNextLevel = true;
            this.TwoPlayerShouldShowNextQue();
          }
          clearInterval(SubmitAnsTimer);
        }
      }, 2000);
    } else {
      if (this.IsExamEnded) {
        this.ShowAlert();
      }
    }
  }
  TwoPlayerShouldShowNextQue() {
    var timerCheck = 5;
    let GotRespond = true;
    var ChkOppResponce = setInterval(() => {
      if (GotRespond) {
        GotRespond = false;
        this.db.ShouldShowNexQuestion(+this.question[this.currQNum]['id']).then(
          _res => {
            if (_res.IsResponce === true) {
              this.LoadingStop();
              this.OppCorrect = +_res.OppCorrectCount;
              this.TwoPlayerNextQue();
              clearInterval(ChkOppResponce);
            }
            GotRespond = true;
          }
        ).catch((e) => {GotRespond = true;this.db.errPop.DisplayAlert(e);});
      }
      if((timerCheck) <= 0 && !GotRespond) {
        GotRespond = true;
        this.LoadingStop();
        this.TwoPlayerNextQue();
        clearInterval(ChkOppResponce);
      }
      if(this.timer <= 0) {
        timerCheck--;
      }
    }, 1000);
  }
  TwoPlayerNextQue() {
    if (this.question[this.currQNum]['final_ans'].toUpperCase() === this.question[this.currQNum]['given_ans'].toUpperCase()) {

      if (this.PreviousAnswer !== '') {
        this.cssClass[this.PreviousAnswer] = 'correct';
      }
      this.question[this.currQNum].CssClass = 'correct';
      this.Correct++;
      this.CorrectTimeCount = this.CorrectTimeCount + (this.question[this.currQNum].ideal_time - this.timer);
    } else {
      if (this.PreviousAnswer !== '') {
        this.cssClass[this.PreviousAnswer] = 'invalid';
      }
      this.question[this.currQNum].CssClass = 'invalid';
      this.Wrong++;
    }
    //this.question[this.currQNum]['time_taken'] = (this.question[this.currQNum].ideal_time - this.timer).toString();

    setTimeout(() => {
      this.NextQuestion();
    }, 1000);

  }
  btnNextClicked() {
    if (this.IsExamEnded === false && this.FetchingNextQuestion === false) {
      this.FetchingNextQuestion = true;
      if (this.question[this.currQNum]['final_ans'].toUpperCase() === this.question[this.currQNum]['given_ans'].toUpperCase()) {

        if (this.PreviousAnswer !== '') {
          this.cssClass[this.PreviousAnswer] = 'correct';
        }
        this.question[this.currQNum].CssClass = 'correct';
        this.Correct++;
        this.CorrectTimeCount = this.CorrectTimeCount + (this.question[this.currQNum].ideal_time - this.timer);
      } else {
        if (this.PreviousAnswer !== '') {
          this.cssClass[this.PreviousAnswer] = 'invalid';
        }
        this.question[this.currQNum].CssClass = 'invalid';
        this.Wrong++;
      }
      this.question[this.currQNum]['time_taken'] = (this.question[this.currQNum].ideal_time - this.timer).toString();

      setTimeout(() => {
        this.NextQuestion();
      }, 1000);
    } else {
      if (this.IsExamEnded) {
        this.ShowAlert();
      }
    }
  }
  
  async btnQuit() {
    //this.TickTime = null;
    var altQut = await this.alertCtrl.create({
      header: "Do you want to quit the quiz?",
      buttons: [{
        text: "Yes",
        handler: () => {
          clearInterval(this.TickTime);
          this.audioService.QuizEnded();
          this.navCtrl.navigateRoot("home");
        }
      }, {
        text: "Cancel"
      }]
    });
    altQut.present();
  }

  //--------------------------For Group----------------------------
  public MyGroupCorrectCount = 0;
  GroupQuestions() {
    console.log("geting q");
    let mr: IGroupMemberAnswers[] = [];
    this.shareService.SetValue("MemberResponses", mr);
    this.shareService.SetValue("CurrQId", 0);
    this.shareService.SetValue("CurrQIndex", 0);
    this.LoadingStart("Getting questions...");
    this.db.GetPropertyAsPromise("testId").then(_tId => {
      this.groupService.GetQuestions(_tId).then(
        data => {
          this.LoadingStop();
          console.log(data);
          if (data.length != 0) {
            this.question = data as IQuestion[];
            this.NumOfQ = this.question.length;
            setTimeout(() => {
              this.groupService.StartGettingMembersResponces();
              this.GetMemberResponses();
              this.timer = +this.question[this.currQNum].ideal_time;
              //this.CurrQuestion[this.currQNum] = {} as MathContent;
              this.Options.A = { mathml: this.question[this.currQNum].options.A };
              this.Options.B = { mathml: this.question[this.currQNum].options.B };
              this.Options.C = { mathml: this.question[this.currQNum].options.C };
              this.Options.D = { mathml: this.question[this.currQNum].options.D };
              this.Options.E = { mathml: this.question[this.currQNum].options.E };
              this.CurrQuestion[this.currQNum] = { mathml: this.question[this.currQNum].q.toString() };
              let chkcounter = 0;
              let checkAns = setInterval(() => {
                if (this.Options.A.mathml && this.Options.A.mathml !== undefined && typeof this.Options.A.mathml !== undefined && this.Options.A.mathml !== null) {
                  this.AnswerLoaded = true;
                  this.LoadingStop();
                  clearInterval(checkAns);
                }
                chkcounter++;
                if (chkcounter === 5) {
                  this.AnswerLoaded = true;
                  this.LoadingStop();
                  clearInterval(checkAns);
                }
              }, 1000);
              this.TickTime = setInterval(() => {
                this.OnEverySecond();
              }, 1000);
            }, 500);
          } else {
            this.LoadingStop();
            this.ShowAlertNoUserFound("there is problem in getting question, please try again.");
          }
        }
      );
    });
    //this.againstId =localStorage.getItem("AgainstId");

  }
  GroupbtnNext(IsCallFromTimeEnd: boolean) {
    if (this.IsExamEnded === false && this.FetchingNextQuestion === false) {
      this.FetchingNextQuestion = true;
      this.LoadingStart("Waiting for your opponent", 60000);
      this.question[this.currQNum]['time_taken'] = (this.question[this.currQNum].ideal_time - this.timer).toString();
      this.groupService.SubmitAnswer(this.question[this.currQNum]['time_taken'], +this.question[this.currQNum]['id'], this.currQNum, IsCallFromTimeEnd)
        .then(_d => {
            this.GroupShouldShowNextQuestion();
        });
    } else {
      if (this.IsExamEnded) {
        this.ShowAlert();
      }
    }
  }
  public GroupGotResponce = true;
  private ChkOppResponce: any;
  GroupShouldShowNextQuestion() {
    var timerCheck = 5;
    this.db.GetPropertyAsPromise("is_submit").then(_is => {
      console.log("question Id in function: "+ this.question[this.currQNum].id + ", IsSubmitted: ", _is);
    });
    this.FetchingNextQuestion = true;
    this.ChkOppResponce = setInterval(() => {
      if (this.GroupGotResponce) {
        this.GroupGotResponce = false;
        this.groupService.ShouldShowNexQuestion(+this.question[this.currQNum]['id'], this.currQNum).then(
          _res => {
            if (_res.IsResponce === true) {
              this.LoadingStop();
              this.OppCorrect = +_res.OppCorrectCount;
              this.MyGroupCorrectCount = +_res.MyCorrectCount;
              this.GroupNextQue();
              clearInterval(this.ChkOppResponce);
            }
          }).catch((e)=>{
            this.db.errPop.DisplayAlert(e);
            clearInterval(this.ChkOppResponce);
            this.GroupGotResponce = true;
          });

          setTimeout(() => {
            this.GroupGotResponce = true;
          }, 2000);

          if((timerCheck) <= 0 && !this.GroupGotResponce) {
            this.GroupGotResponce = true;
            this.LoadingStop();
            this.GroupNextQue();
            clearInterval(this.ChkOppResponce);
          }
          if(this.timer <= 0) {
            timerCheck--;
          }
      }
    }, 500);
  }
  GroupNextQue() {
    if (this.question[this.currQNum]['final_ans'].toUpperCase() === this.question[this.currQNum]['given_ans'].toUpperCase()) {

      if (this.PreviousAnswer !== '') {
        this.cssClass[this.PreviousAnswer] = 'correct';
      }
      this.question[this.currQNum].CssClass = 'correct';
      this.Correct++;
      this.CorrectTimeCount = this.CorrectTimeCount + (this.question[this.currQNum].ideal_time - this.timer);
    } else {
      if (this.PreviousAnswer !== '') {
        this.cssClass[this.PreviousAnswer] = 'invalid';
      }
      this.question[this.currQNum].CssClass = 'invalid';
      this.Wrong++;
    }
    //this.question[this.currQNum]['time_taken'] = (this.question[this.currQNum].ideal_time - this.timer).toString();

    setTimeout(() => {
      this.NextQuestion();
    }, 1000);

  }
  GetMemberResponses() {
    let RecentlyChangedQuestionCounter = 0;
    this.MemberResponsesInterval = setInterval(() => {
      this.shareService.SetValue("CurrQId", this.question[this.currQNum].id);
      this.shareService.SetValue("CurrQIndex", this.currQNum);
      this.shareService.GetValueAsPromise("MemberResponses").then((_r:IGroupMemberAnswers[]) => {
        this.db.GetPropertyAsPromise("userid").then(_uId => {
          //_r.splice(_r.indexOf(i => i.))
        })
        this.MemberResponses = _r;
        //console.log("MemberResponses: ", this.MemberResponses);
      });
      if(RecentlyChangedQuestionCounter>2 && this.GroupGotResponce === true && this.FetchingNextQuestion === false){
        RecentlyChangedQuestionCounter=0;
        this.db.GetPropertyAsPromise("is_submit").then(_is => {
          console.log("question Id: "+ this.question[this.currQNum].id + ", IsSubmitted: ", _is);
          if((_is === 1 || _is === '1') && this.FetchingNextQuestion === false) {
            this.FetchingNextQuestion = true;
            localStorage.setItem("is_submit", '0');
            this.LoadingStart("Your friend has Submitted the answer, Waiting for your opponent", 30000);
            setTimeout(() => {
              this.GroupShouldShowNextQuestion();
            }, 500);
            RecentlyChangedQuestionCounter=0;
          }
        });
      }
      RecentlyChangedQuestionCounter++;
    }, 1000);
  }
  ClearGroupsIntervals() {
    clearInterval(this.MemberResponsesInterval);
    clearInterval(this.ChkOppResponce);
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