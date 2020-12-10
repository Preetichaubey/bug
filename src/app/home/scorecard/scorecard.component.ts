import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { ServerService, IQuestion } from 'src/app/Services/server.service';
import { MathContent } from 'src/app/Services/Math/math-content';
import { GroupQuizService } from 'src/app/Services/group-quiz.service';
import { ShareValuesService } from 'src/app/Services/share-values.service';
import { IGroupMemberAnswers, IGroupQuizSummary, IGroupQuizQuestions } from 'src/app/Services/AllInterfaces';
declare var $: any;

@Component({
   selector: 'app-scorecard',
   templateUrl: './scorecard.component.html',
   styleUrls: ['./scorecard.component.scss'],
})
export class ScorecardComponent implements OnInit {

   public answerTextArray: MathContent[] = [{ mathml: '' }];
   public answerCharArray: any[] = [];
   public answerGivenArray: any[] = [];
   public answerGivenTextArray: MathContent[] = [{ mathml: '' }];
   public classArray: any[] = [];
   public OppclassArray: any[] = [];
   public MyColor = "danger";
   public QNum = 0;
   public MyIcon = "";
   public OppIcon = "";
   public ShowData = false;
   public TwoPlayerShowData = false;
   public Questions: MathContent[] = [{ mathml: '' }];
   public quiz: any = [
      {
         id: '',
         q: '',
         options: { A: '', B: '', C: '', D: '', E: '' },
         ideal_time: -1,
         final_ans: '',
         given_ans: '',
         time_taken: '',
         CssClass: '',
         ansText: ''
      }
   ];
   public OppScore = 0;
   public MyScore = 0;
   public Winner = '';
   public myClass = '';
   public OppClass = '';
   public myText = '';
   public OppText = '';
   public res = {
      winnerid: '',
      oppid: '', oppname: '', oppPercentage: 0, MyPercentage: 0,
      Questions: [] as IQuestion[]
   };
   public GroupShowData = false;
   public GroupData = {} as IGroupQuizSummary;

   constructor(public navCtrl: NavController, public dbService: ServerService,
      public groupService: GroupQuizService, public shareService: ShareValuesService) {
   }
   ngOnInit() {
      this.dbService.GetPropertyAsPromise("AgainstId").then(_aId => {
         if (_aId == '1') {
            this.AIWinner();
         } else if (_aId == '4') {
            this.GroupWinner();
         } else {
            this.TwoPlayerWinner();
         }
      });
      /*$(document).ready(() => {
        setTimeout(() => {
          var ea = $(".MathJax_CHTML");
          console.log("screen : ", screen.width);
          console.log($("#MathJax-Element-1-Frame").width());
          for(let i=0; i< ea.length; i++){
            console.log(i + " : " + $("#MathJax-Element-"+ (i+1) +"-Frame").width());
            if($("#MathJax-Element-"+ (i+1) +"-Frame").width() > (screen.width-34)) {
              $("#MathJax-Element-"+ (i+1) +"-Frame").css("font-size","14px");
            }
            console.log($(ea).get(i));
          }
        }, 7000);
      });*/
   }
   TwoPlayerWinner() {
      eval('MathJax.Hub.Queue(["Typeset", MathJax.Hub])');
      this.dbService.Get2PlayerWinner().then(_res => {
         console.log("_res : ", _res);
         this.dbService.GetPropertyAsPromise("userid").then(_uId => {
            if (_res && _res.Questions.length > 0) {
               this.res.MyPercentage = _res.MyPercentage;
               this.res.oppPercentage = _res.oppPercentage;
               this.res.oppid = _res.oppid;
               this.res.oppname = _res.oppname;
               this.res.winnerid = _res.winnerid;
               this.OppScore = _res.oppPercentage;
               this.MyScore = _res.MyPercentage;
               if(_res.MyPercentage.toString() == "00%" && _res.oppPercentage.toString() == "00%") {
                  console.log("No one won, both score 0");
                  this.myClass = 'result-loose';
                  this.MyIcon = "thumbs-down";
                  this.OppIcon = "thumbs-down";
                  this.OppClass = 'result-loose';
                  this.myText = "";
                  this.OppText = "";
               } else if (this.res.winnerid == _uId) {
                  console.log("inside if");
                  this.myClass = 'result-win';
                  this.MyIcon = "thumbs-up";
                  this.OppIcon = "thumbs-down";
                  this.OppClass = 'result-loose';
                  this.myText = "Won";
                  this.OppText = "Lost";
               } else {
                  console.log("inside else");
                  this.myClass = 'result-loose';
                  this.MyIcon = "thumbs-down";
                  this.OppIcon = "thumbs-up";
                  this.OppClass = 'result-win';
                  this.myText = "Lost";
                  this.OppText = "Won";
               }
               var fp = new Promise((resolve2) => {
                  for (let i = 0; i < _res.Questions.length; i++) {
                     this.res.Questions[i] = {} as IQuestion;
                     this.res.Questions[i].q = _res.Questions[i].q;
                     this.res.Questions[i].IsImg = _res.Questions[i].IsImg;
                     this.Questions[i] = { mathml: _res.Questions[i].q }; //
                     this.res.Questions[i].final_ans_string = _res.Questions[i].final_ans_string;
                     this.answerTextArray[i] = { mathml: _res.Questions[i].final_ans_string };
                     this.res.Questions[i].final_ans = _res.Questions[i].final_ans;
                     this.answerCharArray[i] = { mathml: _res.Questions[i].final_ans }; //
                     this.res.Questions[i].given_ans = _res.Questions[i].given_ans;
                     this.answerGivenArray[i] = { mathml: _res.Questions[i].given_ans };
                     //this.answerGivenTextArray[i] = {mathml:  _res.Questions[i].given_ans_string};
                     this.res.Questions[i].OppAns = _res.Questions[i].OppAns;
                     if (_res.Questions[i].final_ans == _res.Questions[i].given_ans) {
                        this.classArray[i] = "correct";
                     } else {
                        this.classArray[i] = "wrong";
                     }
                     if (_res.Questions[i].final_ans == _res.Questions[i].OppAns) {
                        this.OppclassArray[i] = "correct";
                     } else {
                        this.OppclassArray[i] = "wrong";
                     }
                     if (i == (_res.Questions.length - 1)) {
                        resolve2(1);
                     }
                  }
               });
               fp.then(() => {
                  this.TwoPlayerShowData = true;
               });
            }
         });
      });
   }
   AIWinner() {
      eval('MathJax.Hub.Queue(["Typeset", MathJax.Hub])');
      console.log('ionViewDidLoad QuizSummeryPage');
      this.dbService.GetPropertyAsPromise("OppResult").then(_OppScore => {
         this.OppScore = +_OppScore;
         this.dbService.GetPropertyAsPromise("MyResult").then(_myScore => {
            this.MyScore = +_myScore;
            setTimeout(() => {
               if (this.OppScore > this.MyScore) {
                  console.log("You lost");
                  this.myClass = 'result-loose';
                  this.MyIcon = "thumbs-down";
                  this.OppIcon = "thumbs-up";
                  this.OppClass = 'result-win';
                  this.myText = "Lost";
                  this.OppText = "Won";
               } else if (this.OppScore < this.MyScore) {
                  console.log("You Won");
                  this.myClass = 'result-win';
                  this.MyIcon = "thumbs-up";
                  this.OppIcon = "thumbs-down";
                  this.OppClass = 'result-loose';
                  this.myText = "Won";
                  this.OppText = "Lost";
               } else if(this.MyScore === 0){
                  console.log("No one Won, Both score zero");
                  this.myClass = 'result-loose';
                  this.MyIcon = "thumbs-down";
                  this.OppIcon = "thumbs-down";
                  this.OppClass = 'result-loose';
                  this.myText = "";
                  this.OppText = "";
               } else {
                  this.dbService.GetPropertyAsPromise("MyCorrectTime").then(_myTime => {
                     this.dbService.GetPropertyAsPromise("OppCorrectTime").then(_OppTime => {
                        if (_OppTime == "max") {
                           this.myClass = 'result-win';
                           this.MyIcon = "thumbs-up";
                           this.OppIcon = "thumbs-down";
                           this.OppClass = 'result-loose';
                           this.myText = "Won";
                           this.OppText = "Lost";
                        } else if (+_OppTime < +_myTime) {
                           this.myClass = 'result-loose';
                           this.MyIcon = "thumbs-down";
                           this.OppIcon = "thumbs-up";
                           this.OppClass = 'result-win';
                           this.myText = "Lost";
                           this.OppText = "Won";
                        } else {
                           this.myClass = 'result-win';
                           this.MyIcon = "thumbs-up";
                           this.OppIcon = "thumbs-down";
                           this.OppClass = 'result-loose';
                           this.myText = "Won";
                           this.OppText = "Lost";
                        }
                     });
                  });
               }

            }, 400);
            this.loadCrrQuizSummary();
         });
      });
   }
   GroupWinner() {
      this.shareService.GetValueAsPromise("MyGroupIdForQuiz").then(_gId => {
        //let _gId = "58";
         this.groupService.GetQuizSummary().then(_r => {
            if(_r) {
               let d = _r[0];
               this.GroupData.MyGroupId = d["myGroupId"];
               this.GroupData.MyGroupName = d["myGroupName"];
               this.GroupData.MyGroupCount = d["myGroupCount"];
               this.GroupData.OppGroupId = d["oppGroupId"];
               this.GroupData.OppGroupName = d["oppGroupName"];
               this.GroupData.OppGroupCount = d["oppGroupCount"];
               this.GroupData.winner = d["winner"];
               if (this.GroupData.winner == _gId) {
                  console.log("inside if");
                  this.myClass = 'result-win';
                  this.MyIcon = "thumbs-up";
                  this.OppIcon = "thumbs-down";
                  this.OppClass = 'result-loose';
                  this.myText = "Won";
                  this.OppText = "Lost";
               } else {
                  console.log("inside else");
                  this.myClass = 'result-loose';
                  this.MyIcon = "thumbs-down";
                  this.OppIcon = "thumbs-up";
                  this.OppClass = 'result-win';
                  this.myText = "Lost";
                  this.OppText = "Won";
               }
               
               let q = d["ques"];
               if(q) {
                  let mr: any;
                  this.GroupData.AllQ = [];
                  for(let i=0; i<q.length; i++){
                     this.GroupData.AllQ[i] = {} as IGroupQuizQuestions;
                     this.GroupData.AllQ[i].MyGroupAns = {} as IGroupMemberAnswers;
                     this.GroupData.AllQ[i].OppGroupAns = {} as IGroupMemberAnswers;
                     this.GroupData.AllQ[i].id = q[i]["qid"];
                     this.GroupData.AllQ[i].isImg = q[i]["is_image"]=="0"?false:true;
                     this.GroupData.AllQ[i].question = { mathml: q[i]["qstring"] };
                     this.GroupData.AllQ[i].correctOption = q[i]["correct_option"];
                     this.GroupData.AllQ[i].correctAnsString = { mathml: q[i]["correct_string"] };
                     this.GroupData.AllQ[i].MyGroupAns.Ans = q[i]["mygroupSelectedOption"];
                     this.GroupData.AllQ[i].MyGroupAns.AnsString = { mathml: q[i]["selected_string"] };
                     console.log("Ans : ", this.GroupData.AllQ[i].MyGroupAns.AnsString);
                     this.GroupData.AllQ[i].OppGroupAns.Ans = q[i]["oppGroupSelected"];
                     this.GroupData.AllQ[i].OppGroupAns.AnsString = { mathml: q[i]["oppString"] };
                     
                     if (this.GroupData.AllQ[i].correctOption == this.GroupData.AllQ[i].MyGroupAns.Ans) {
                        this.classArray[i] = "correct";
                     } else {
                        this.classArray[i] = "wrong";
                     }
                     if (this.GroupData.AllQ[i].correctOption == this.GroupData.AllQ[i].OppGroupAns.Ans) {
                        this.OppclassArray[i] = "correct";
                     } else {
                        this.OppclassArray[i] = "wrong";
                     }
                     //this.GroupData.AllQ[i].GroupMembersAns = []
                     if(q[i]["group_response"]){
                        mr = q[i]["group_response"];
                        this.GroupData.AllQ[i].GroupMembersAns = [];
                        for(let j=0;j<mr.length;j++) {
                           this.GroupData.AllQ[i].GroupMembersAns[j] = {} as IGroupMemberAnswers;
                           this.GroupData.AllQ[i].GroupMembersAns[j].Name = mr[j]["name"];
                           this.GroupData.AllQ[i].GroupMembersAns[j].Ans = mr[j]["response"];
                           this.GroupData.AllQ[i].GroupMembersAns[j].AnsString = { mathml: mr[j]["ans_string"] };
                           if(i === (q.length - 1) && j === (mr.length - 1)) {
                              this.GroupShowData = true;
                           }
                        }
                     }
                  }
                  
               }
               setTimeout(() => {
                  console.log(this.GroupData);
                  this.GroupShowData = true;
               }, 5000);
            }this.GroupShowData = true;
         }).catch(() => {

         });
      });
   }
   loadCrrQuizSummary() {
      eval('MathJax.Hub.Queue(["Typeset", MathJax.Hub])');
      this.dbService.GetPropertyAsPromise('currQuiz').then(
         data => {
            console.log(data);

            if (data && typeof data != undefined && data != null) {
               setTimeout(() => {
                  this.quiz = JSON.parse(data);
                  let c = '';
                  for (let i = 0; i < this.quiz.length; i++) {
                     c = this.quiz[i].final_ans;
                     console.log("Answer :" + c.toUpperCase() + " : " + this.quiz[i].options[c.toUpperCase()]);
                     let givenAns = this.quiz[i].given_ans;
                     let cl = 'correct';
                     if (typeof givenAns != undefined && givenAns && givenAns != '') {
                        givenAns = (this.quiz[i].given_ans).toUpperCase();
                        console.log("ans = " + this.quiz[i].final_ans.toUpperCase() + " & given = " + givenAns);
                        if (this.quiz[i].final_ans.toUpperCase() == givenAns) {
                           cl = 'correct';
                        } else {
                           cl = 'wrong';
                        }
                     } else {
                        givenAns = '';
                        cl = 'wrong';
                     }
                     //let cl = this.quiz[i].options[c.toUpperCase()] == (this.quiz[i].given_ansc).toUpperCase()? 'correct':'wrong';


                     this.Questions[i] = { mathml: this.quiz[i].q };
                     this.answerCharArray[i] = c.toUpperCase();
                     this.answerTextArray[i] = { mathml: this.quiz[i].options[c.toUpperCase()] };
                     this.answerGivenArray[i] = givenAns;
                     this.answerGivenTextArray[i] = { mathml: this.quiz[i].options[givenAns.toUpperCase()] };
                     this.classArray[i] = cl;
                  }
                  console.log("Q", this.quiz);
                  console.log(this.answerTextArray);
                  setTimeout(() => {
                     this.ShowData = true;
                  }, 700);
               }, 100);
            }
         }
      );
   }
   goToRoot() {
      this.navCtrl.navigateRoot('home');
   }

}
