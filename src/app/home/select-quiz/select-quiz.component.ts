import { Component, OnInit, OnDestroy } from '@angular/core';
import { ISubject, ServerService } from '../../Services/server.service';
import { NavController, LoadingController, ModalController, Platform } from '@ionic/angular';
import { IGroup, IMember } from 'src/app/Services/AllInterfaces';
import { SearchGroupPage } from './search-group/search-group.page';
import { SelectFriendComponent } from './select-friend/select-friend.component';
import { AudioService } from 'src/app/Services/audio.service';
import { type } from 'os';
import { InfoAlertService } from 'src/app/Services/info-alert.service';
declare var $: any;

@Component({
   selector: 'app-select-quiz',
   templateUrl: './select-quiz.component.html',
   styleUrls: ['./select-quiz.component.scss'],
})
export class SelectQuizComponent implements OnInit, OnDestroy {
   public HeaderTitle = "";
   public SelectedSubjectIndex = 0;
   public SelectedTopicIndex = '';
   public SelectedAgainstIndex = '';
   public SelectedAiIndex = '';
   public SubjectId = 0;
   public SubjectList: ISubject[] = [];
   public IsSubjectSelected = false;
   public TopicId: number;
   public TopicList: any;
   public GroupId: number;
   public IsTopicSelected = false;
   public PlayAgainstId = 0;
   public IsPlayAgainstSelected = false;
   public ArtificialType = 1;
   public DisplayArtificialType = false;
   public DisplayPlayBtn = false;
   public DisplayProceedBtn = false;
   public DisplayGroups = false;
   public Groups: IGroup[] = [];
   public loader: any;

   public DisplayingPageNumber = 1;
   constructor(public navCtrl: NavController, public dbServer: ServerService,
      public loadingCtrl: LoadingController, public modalCtrl: ModalController,
      public audioService: AudioService, private platform: Platform,
      public info: InfoAlertService) {
   }
   ngOnInit() {
      this.dbServer.SetProperty("testId", 0);
      this.HeaderTitle = "Choose a Topic";
      //this.LoadSubject();
      this.LoadTopics();
      this.audioService.LoadAudios();
      this.dbServer.IsAlertShown = false;
      this.SubjectOptionSelected();
      this.TopicOptionSelected();
      this.AgainstOptionsSelected();
      this.AILevelSelected();
      this.platform.backButton.subscribe(async () => {
         this.BackBtn();
       });
   }
   ngOnDestroy() {
      this.LoadingStop();
      //this.platform.backButton.unsubscribe();
   }
   InfoBtn(btnType) {
      let msg = "";
      if(btnType == "ai"){
        msg = `VP stands for Virtual Player. In simple words, it means playing quiz against the computer.
        Play with VP for practise. Leaderboard is not updated when you play with VP. 
        <br><br>
        You can play against 4 levels of Virtual Player. (Click on Virtual Player tab to know more.)
        `;
      } else if(btnType == "frnd"){
         msg = `You can play with friends who are registered in the same class as you.`;
      } else if(btnType == "unknown"){
         msg = `The system links you up with the first unknown player interested in playing with you.`;
      } else if(btnType == "ai-level"){
         msg = `<u><b>Genius:</b></u> Virtual Player is 100% accurate but can be beaten if you are faster<br><br>
         <u><b>Emerging Genius:</b></u> Virtual Player is correct most of the time<br><br>
         <u><b>Potential Genius:</b></u> Virtual Player is quick but may make mistakes in a hurry<br><br>
         <u><b>Hidden Genius:</b></u> Virtual Player is unpredictable but has the ability to beat anyone<br><br>`;
      }
      if(msg !== ""){
         this.info.ShowInfo(msg);
      }
    }
   BackBtn() {
      console.log(this.DisplayingPageNumber)
      if(this.DisplayingPageNumber == 1) {
         this.SubjectOptionSelected();
         setTimeout(() => {
            this.navCtrl.navigateRoot("home");
         }, 500);
      } else if(this.DisplayingPageNumber == 2) {
         this.TopicOptionSelected();
         //setTimeout(() => {this.SubjectOptionsLoaded();}, 500);
         setTimeout(() => {
            this.navCtrl.navigateRoot("home");
         }, 500);
      } else if(this.DisplayingPageNumber == 3) {
         this.AgainstOptionsSelected();
         setTimeout(() => {this.TopicOptionsLoaded();}, 500);
      } else if(this.DisplayingPageNumber == 4) {
         this.HidePlay();
         this.AILevelSelected();
         setTimeout(() => {this.AgainstOptionsDisplay();}, 500);
      } else if(this.DisplayingPageNumber == 5) {
         this.HidePlay();
         setTimeout(() => {this.AILevelDisplay();}, 500);
      }
   }

   SubjectOptionsLoaded() {
      /* $(".subjects").css("display", "none");
      $(".topics").css("display", "none");
      $(".against").css("display", "none");
      $(".level").css("display","none"); */
      this.HeaderTitle = "Chose a Subject";
      this.DisplayingPageNumber = 1;
      $(".subjects").css("display", "block");
      $(".subjects .options-container").animate({"bottom": "0%"});
   }
   SubjectOptionSelected() {
      const fn = function() {
         $(".subjects .options-container .selected-option").removeClass("selected-option");
         $(".subjects .options-container").animate({"bottom": "-100%"},()=>{
            $(".subjects").css("display", "none");
         });
      }
      $(".subjects .options-container").on("click", ".option", function (e) {
         $(this).addClass("selected-option");
         fn();
      });
      fn();
   }

   TopicOptionsLoaded() {
      this.HeaderTitle = "Chosoe a Topic";
      this.DisplayingPageNumber = 2;
      $(".topics").css("display", "block"); 
      $(".topics .options-container").animate({"bottom": "15%"});
   }
   TopicOptionSelected() {
      let t = this;
      const fn = function() {
         $(".topics .options-container .selected-option").removeClass("selected-option");
         $(".topics .options-container").animate({"bottom": "-100%"}, ()=>{
            $(".topics").css("display", "none");
         });
      }
      $(".topics .options-container").on("click", ".option", function (e) {
         $(this).addClass("selected-option");
         fn();
      });
      fn();
   }

   AgainstOptionsDisplay() {
      this.HeaderTitle = "Quiz Against";
      this.DisplayingPageNumber = 3;
      $(".against").css("display","block");
      $(".against .option").animate({"width": "90%", "margin-left": "5%", "height":"138px"});
   }
   AgainstOptionsSelected() {
      const fn = function() {
         $(".against .option").animate({"width": "0%", "margin-left": "50%", "height":"0px"},
         () => {$(".against").css("display", "none")});
      }
      $(".against .against-container").on("click", ".option-content", function (e) {
         fn();
      });
      fn();
   }
   
   AILevelDisplay() {
      this.HeaderTitle = "Chose Your Level";
      this.DisplayingPageNumber = 4;
      $(".level").css("display","block");
      $(".level .option").animate({"margin-left": "3%"});
   }
   AILevelSelected() {
      const fn = function() {
         $(".level .option:even").animate({"margin-left": "110%"});
         $(".level .option:odd").animate({"margin-left": "-110%"},
         () => {
            $(".level").css("display","none");
         });
      }
      $(".level .level-container").on("click", ".option", function (e) {
         fn();
      });
      fn();
   }

   PlayDisplay() {
      this.HeaderTitle = "";
      if (this.PlayAgainstId == 1){
         this.DisplayingPageNumber = 5;
      } else {
         this.DisplayingPageNumber = 4;
      }
      $(".play").css("display","block");
   }
   HidePlay() {
      $(".play").css("display","none");
   }

   ionViewDidLoad() {
   }
   async LoadingStart() {
      this.loader = await this.loadingCtrl.create({
         message: "Please wait...",
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
   LoadSubject() {
      let tryCount = 0;
      let ShouldTryAgain = true;
      let intervalSubject = setInterval(() => {
         if (ShouldTryAgain && tryCount < 3) {
            tryCount++;
            ShouldTryAgain = false;
            this.LoadingStart();
            this.dbServer.GetSubjects().then((data: ISubject[]) => {
               this.LoadingStop();
               if (data.length > 0) {
                  clearInterval(intervalSubject);
                  this.SubjectOptionsLoaded();
                  this.SubjectList = data;
               } else {
                  ShouldTryAgain = true;
               }
            }).catch(error => {this.LoadingStop(); ShouldTryAgain = true;});
         }
         if (tryCount > 3) {
            clearInterval(intervalSubject);
         }
      }, 1000);
   }
   Changed(event: any) {
      //console.log("event : ",event);
   }
   SubjectSelected(_SubjectId: any) {
      if (typeof _SubjectId !== undefined && _SubjectId != '' && _SubjectId != null && _SubjectId) {
         this.LoadingStart();
         this.SubjectId = _SubjectId;
         this.IsSubjectSelected = true;
         this.IsTopicSelected = false;
         this.IsPlayAgainstSelected = false;
         this.DisplayArtificialType = false;
         this.DisplayPlayBtn = false;
         this.DisplayProceedBtn = false;
         this.TopicId = 0;
         console.log("subid", _SubjectId);

         localStorage.setItem("subid", _SubjectId);
         this.LoadTopics();
      }
   }
   LoadTopics() {
      this.LoadingStart();
      this.IsSubjectSelected = true;
      this.IsTopicSelected = false;
      this.IsPlayAgainstSelected = false;
      this.DisplayArtificialType = false;
      this.DisplayPlayBtn = false;
      this.DisplayProceedBtn = false;
      this.TopicId = 0;
      this.dbServer.GetPropertyAsPromise("subid").then(_subId => {
         this.dbServer.GetTopics(_subId).then((data: ISubject[]) => {
            this.TopicList = data;
            this.TopicOptionsLoaded();
            this.LoadingStop();
         }).catch(error => this.LoadingStop());
      });
   }
   TopicSelected(_TopicId: any) {
      console.log("Topic Selected : ", _TopicId);
      if (typeof _TopicId != undefined && _TopicId != '' && _TopicId != null && _TopicId) {
         this.IsTopicSelected = true;
         this.TopicId = _TopicId;
         localStorage.setItem("topics", _TopicId);
         this.IsPlayAgainstSelected = false;
         this.DisplayArtificialType = false;
         this.DisplayPlayBtn = false;
         this.DisplayProceedBtn = false;
         this.PlayAgainstId = 0;
         setTimeout(() => {
            this.AgainstOptionsDisplay();
         }, 500);
      }
   }
   AgainstSelected(_AgainstId: any) {
      if (_AgainstId && typeof _AgainstId != undefined && _AgainstId != null && _AgainstId != 0) {
         this.PlayAgainstId = _AgainstId;
         this.IsPlayAgainstSelected = true;
         this.DisplayGroups = false;
         this.DisplayProceedBtn = false;
         if (_AgainstId == 1) {
            this.DisplayArtificialType = true;
            setTimeout(() => {
               this.AILevelDisplay();
            }, 500);
            //this.DisplayPlayBtn = true;
         } else {
            this.DisplayArtificialType = false;
            if(_AgainstId == 2) {
               this.SelectFriend();
            } else if (_AgainstId == 3) {
               this.DisplayPlayBtn = true;
               setTimeout(() => {
                  this.PlayDisplay();
               }, 500);
            } else if (_AgainstId == 4) {
               this.DisplayPlayBtn = false;
               this.DisplayGroups = true;
               this.LoadAllGroups();
            }
         }

      }
   }
   async SelectFriend() {
      this.DisplayProceedBtn = true;
      //if(this.GroupId && this.GroupId > 0) {
      const modal = await this.modalCtrl.create({
         component: SelectFriendComponent,
         /* componentProps: {
            'MyGroupId': this.GroupId
         } */
      });
      await modal.present();
      const { data } = await modal.onWillDismiss();
      setTimeout(() => {
         this.AgainstOptionsDisplay();
      }, 500);
      /* if (data["groupid"]) {
         console.log("success");
      }
      console.log(data["groupid"]); */
      //}
   }
   ArtificialSelected(_Selected: number) {
      this.ArtificialType = _Selected;
      setTimeout(() => {
         this.PlayDisplay();
      }, 500);
   }
   LoadAllGroups() {
      this.Groups = [];
      this.LoadingStart();
      this.dbServer.GetPropertyAsPromise("userid").then(_uId => {
         this.dbServer.GetAllGroups().then((data: any) => {
            this.LoadingStop();
            if (data && data !== null && typeof data !== undefined) {
               for (let i = 0; i < data.length; i++) {
                  let g = data[i]["data"];
                  this.Groups[i] = {} as IGroup;
                  this.Groups[i].Id = g["group_id"];
                  this.Groups[i].GroupName = g["group_name"];
                  this.Groups[i].AdminId = g["admin_id"];
                  if (g["admin_id"] === _uId) {
                     this.Groups[i].AmIAdmin = true;
                  } else {
                     this.Groups[i].AmIAdmin = false;
                  }
                  this.Groups[i].AdminName = g["admin_name"];
                  let _m = g["group_members_name"];
                  console.log(_m);
                  this.Groups[i].Members = [];
                  let index = 0;
                  if (g["group_members_name"] !== null && typeof g["group_members_name"] !== undefined) {
                     for (let j = 0; j < g["group_members_name"].length; j++) {
                        let m = g["group_members_name"][j];
                        if (m["id"] !== _uId) {
                           this.Groups[i].Members[index] = {} as IMember;
                           this.Groups[i].Members[index].Id = m["id"];
                           this.Groups[i].Members[index].Name = m["name"];
                           index++;
                        }
                     }
                  }
               }
            }
         }).catch(() => { this.LoadingStop() });
      });
   }
   Play() {
      console.log("Playing Quiz: ", this.PlayAgainstId);
      this.dbServer.SetProperty("MatchType", "0");
      this.dbServer.SetProperty("AmI2ndPlayer", "0");
      if (this.PlayAgainstId == 1) {
         localStorage.setItem("LevelId", this.ArtificialType.toString());
         localStorage.setItem("AgainstId", '1');
         this.navCtrl.navigateForward('home/playquiz');
      } else if (this.PlayAgainstId == 2) {
         this.LoadingStart();
         localStorage.setItem("AgainstId", '2');
         this.dbServer.SendQuizRequestToFriends(0).then(
            data => {
               this.LoadingStop();
               console.log("Request Sent : ", data);
               if (data !== 0) {
                  this.dbServer.SetProperty("testId", data);
                  this.navCtrl.navigateForward('home/playquiz');
               }
               else {
                  this.dbServer.SetProperty("testId", 0);
               }
            }
         ).catch(() => { this.LoadingStop() });
         //this.navCtrl.push(OnlineFriendsPage);
      } else if (this.PlayAgainstId == 3) {
         this.LoadingStart();
         localStorage.setItem("AgainstId", '3');
         this.dbServer.SendQuizRequestToLikeMinded().then(
            data => {
               this.LoadingStop();
               console.log("Request Sent : ", data);
               if (data !== 0) {
                  this.dbServer.SetProperty("testId", data);
                  this.navCtrl.navigateForward('home/playquiz');
               }
               else {
                  this.dbServer.SetProperty("testId", 0);
               }
            }
         ).catch(() => { this.LoadingStop() });
         //this.navCtrl.push(OnlineFriendsPage);
      }
   }
}
