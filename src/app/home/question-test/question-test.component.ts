import { Component, OnInit, OnDestroy } from '@angular/core';
import { ServerService, IQuestion, IAnswers } from 'src/app/Services/server.service';
import { NavController, AlertController, LoadingController, PopoverController } from '@ionic/angular';
import { MathContent } from '../../Services/Math/math-content';
import { MathDirective } from '../../Services/Math/math.directive';
import { BackgroundProcessService } from 'src/app/Services/background-process.service';
import { AudioService } from 'src/app/Services/audio.service';
import { GroupQuizService } from 'src/app/Services/group-quiz.service';
import { IGroupMemberAnswers } from 'src/app/Services/AllInterfaces';
import { ShareValuesService } from 'src/app/Services/share-values.service';
declare var $: any;

@Component({
   selector: 'app-question-test',
   templateUrl: './question-test.component.html',
   styleUrls: ['./question-test.component.scss'],
})
export class QuestionTestComponent implements OnInit {
   public AnswerLoaded = false;
   public QuestionID = "";
   public CurrQuestion: MathContent[] = [
      { mathml: '' }
   ];
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
   public loader: any;
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
   ngOnInit() {
      eval('MathJax.Hub.Queue(["Typeset", MathJax.Hub])');
      localStorage.setItem("is_submit", '0');
      $("#MathJax_Message").wrap("<div style=\"display: none;\"></div>");
      setTimeout(() => {
         $(".secondary-header").height($(".secondary-header ion-row").outerHeight());
         console.log("Height : ", $(".secondary-header ion-row").outerHeight());
      }, 900);
   }
   ngOnDestroy() {
      this.LoadingStop();
   }
   async LoadingStart(Msg = "Please wait...", Duration = 10000) {
      this.loader = await this.loadingCtrl.create({
         message: Msg,
         duration: Duration
      });
      this.loader.present();
   }
   LoadingStop() {
      setTimeout(() => {
         if (this.loader) {
            this.loader.dismiss();
         } else {
            console.log("Loading could not be stopped");
         }
      }, 200);
   }
   ResetClasses() {
      this.cssClass = { A: 'normal', B: 'normal', C: 'normal', D: 'normal', E: 'normal' };
   }
   SetQuestion() {
      this.LoadingStart();
      eval('MathJax.Hub.Queue(["Typeset", MathJax.Hub])');
      let fd = new FormData();
      fd.append("qid", this.QuestionID);
      this.GetExams().then(
         data => {
            //this.LoadingStop();
            if (data.length > 0 && data !== null && data !== undefined) {
               this.question = data as IQuestion[];
               setTimeout(() => {
                  this.Options.A = { mathml: this.question[0].options.A };
                  this.Options.B = { mathml: this.question[0].options.B };
                  this.Options.C = { mathml: this.question[0].options.C };
                  this.Options.D = { mathml: this.question[0].options.D };
                  this.Options.E = { mathml: this.question[0].options.E };
                  this.CurrQuestion[0] = { mathml: this.question[0].q.toString() };
                  let chkcounter = 0;
                  let checkAns = setInterval(() => {
                     if (chkcounter > 2 && this.Options.A.mathml && this.Options.A.mathml !== undefined && this.Options.A.mathml !== 'undefined' && typeof this.Options.A.mathml !== undefined && this.Options.A.mathml !== null) {
                        this.AnswerLoaded = true;
                        clearInterval(checkAns);
                        this.LoadingStop();
                     }
                     chkcounter++;
                     if (chkcounter === 5) {
                        this.LoadingStop();
                        this.AnswerLoaded = true;
                        clearInterval(checkAns);
                     }
                  }, 1000);
               }, 700);
            } else {
               this.LoadingStop();
            }
         }
      ).catch(() => {
         this.LoadingStop();
      });
   }
   public GetExams(): Promise<IQuestion[]> {
      let link = 'get_questions.php';
      var question: IQuestion[] = [];
      return new Promise((resolve) => {
         let fd = new FormData();
         console.log("this.QuestionID: ", this.QuestionID);
         fd.append("qid", this.QuestionID);
         this.db.PostData(this.db.CommUrl + 'test_api/check_question.php', fd).then(
            data => {
               console.log("Data", data);
               if (typeof data == undefined && !data && data == 0) {
                  console.log("INVALID");
                  resolve(question);
               } else {
                  let i = 0;
                  let NewData: any;
                  NewData = data[0]["data"];
                  question[i] = {} as IQuestion;
                  question[i].id = NewData.id;
                  question[i].q = NewData.mcq;
                  question[i].IsImg = NewData.is_image === '1' ? true : false;
                  question[i].final_ans = NewData.final_ans;
                  let Ans: IAnswers = { A: '', B: '', C: '', D: '', E: '' };
                  Ans.A = typeof NewData.options.a !== undefined && NewData.options.a ? NewData.options.a : '';
                  Ans.B = typeof NewData.options.b !== undefined && NewData.options.b ? NewData.options.b : '';
                  Ans.C = typeof NewData.options.c !== undefined && NewData.options.c ? NewData.options.c : '';
                  Ans.D = typeof NewData.options.d !== undefined && NewData.options.d ? NewData.options.d : '';
                  Ans.E = typeof NewData.options.e !== undefined && NewData.options.e ? NewData.options.e : '';
                  //if(NewData.)
                  //question[i].OppAns = NewData.
                  question[i].options = Ans;
                  question[i].given_ans = '';
                  question[i].time_taken = '';
                  question[i].CssClass = 'normal';


                  resolve(question);
               }
            },
            error => console.error(error)
         ).catch(e => console.error(e));
      });
   }
   async btnQuit() {
      //this.TickTime = null;
      var altQut = await this.alertCtrl.create({
         header: "Do you want to quit the quiz?",
         buttons: [{
            text: "Yes",
            handler: () => {
               this.audioService.QuizEnded();
               this.navCtrl.navigateRoot("home");
            }
         }, {
            text: "Cancel"
         }]
      });
      altQut.present();
   }
}
export interface Options {
   A: MathContent;
   B: MathContent;
   C: MathContent;
   D: MathContent;
   E: MathContent;
}