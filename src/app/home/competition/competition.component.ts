import { Component, OnInit, OnDestroy } from '@angular/core';
import { ISubject, ServerService } from '../../Services/server.service';
import { NavController, LoadingController, ModalController, Platform } from '@ionic/angular';
import { IGroup, IMember } from 'src/app/Services/AllInterfaces';
import { AudioService } from 'src/app/Services/audio.service';
import { type } from 'os';
import { InfoAlertService } from 'src/app/Services/info-alert.service';
declare var $: any;


@Component({
  selector: 'app-competition',
  templateUrl: './competition.component.html',
  styleUrls: ['./competition.component.scss'],
})
export class CompetitionComponent implements OnInit,OnDestroy {

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
      this.LoadTopics();
      this.audioService.LoadAudios();
      this.dbServer.IsAlertShown = false;
      this.SubjectOptionSelected();
      this.TopicOptionSelected();
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
       setTimeout(() => {
        this.navCtrl.navigateRoot("home");
     }, 500);
      } else if(this.DisplayingPageNumber == 2) {
        this.HidePlay();
        setTimeout(() => {this.TopicOptionsLoaded();}, 500);
     }
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
      this.HeaderTitle = "Choose a Topic";
      this.DisplayingPageNumber = 1;
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

  

   PlayDisplay() {
      this.HeaderTitle = "";
     
        this.DisplayingPageNumber = 2;
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
  
   Changed(event: any) {
      //console.log("event : ",event);
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
      this.dbServer.GetPropertyAsPromise("userid").then(_userId => {
         this.dbServer.GetCompetitionTopics(_userId).then((data: ISubject[]) => {
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
         localStorage.setItem("CompetitionTopics", _TopicId);

         this.IsPlayAgainstSelected = false;
         this.DisplayArtificialType = false;
         this.DisplayPlayBtn = false;
         this.DisplayProceedBtn = false;
         this.PlayAgainstId = 1;
         setTimeout(() => {
            this.ArtificialSelected(4);
           }, 500);
      }
   }
   AgainstSelected(_AgainstId: any) {
      console.log("Select Against:",_AgainstId)
      if (_AgainstId && typeof _AgainstId != undefined && _AgainstId != null && _AgainstId != 0) {
         this.PlayAgainstId = _AgainstId;
         this.IsPlayAgainstSelected = true;
         this.DisplayGroups = false;
         this.DisplayProceedBtn = false;
         this.DisplayArtificialType = false;
         if (_AgainstId == 4) {
               this.DisplayPlayBtn = false;
               this.DisplayGroups = true;
             }
      }
   }
   
   ArtificialSelected(_Selected: number) {
      this.ArtificialType = _Selected;
      setTimeout(() => {
         this.PlayDisplay();
      }, 500);
   }
  
   Play() {
      console.log("Playing Quiz: ", this.PlayAgainstId);
      this.dbServer.SetProperty("MatchType", "0");
      this.dbServer.SetProperty("AmI2ndPlayer", "0");
      
      if (this.PlayAgainstId == 1) {
         localStorage.setItem("CompetitionLevelId", this.ArtificialType.toString());
         localStorage.setItem("CompetitionAgainstId", '1');
         this.navCtrl.navigateForward('home/competition-Playquiz');
         
      }
   }
}
