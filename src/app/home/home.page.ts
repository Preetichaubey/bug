import { Component, OnInit } from '@angular/core';
import { ServerService, INotification, ISubject } from '../Services/server.service';
import { NavController, MenuController, AlertController, PopoverController, LoadingController } from '@ionic/angular';
import { BackgroundProcessService } from '../Services/background-process.service';
import { ShareValuesService } from '../Services/share-values.service';
//import { from } from 'rxjs';
import { GroupAnsComponent } from './play-quiz/group-ans/group-ans.component';
import { IMember } from '../Services/AllInterfaces';
import { AudioService } from '../Services/audio.service';
import { timeInterval } from 'rxjs/operators';
import { InfoAlertService } from '../Services/info-alert.service';
import { CompetitionService } from '../Services/competition.service';

declare var $: any;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  public Name = '';
  public MenuBtnIcon = "menu";
  public menuClass = "menu-close";
  public std="";
  public school ="";
  public NotifnCount = 0;
  public loader: any;
  public SubjectList: ISubject[] = [];
  public IsComptition:any;
  alert: any;

  constructor(private dbServer: ServerService, 
    public audioService: AudioService, 
    public popoverController: PopoverController, 
    public shareValue: ShareValuesService, 
    public nav: NavController, 
    public mn: MenuController, 
    public alertCtrl: AlertController, 
    public backProcess: BackgroundProcessService, 
    public loadingCtrl: LoadingController,
    public info: InfoAlertService,
    public competitionService: CompetitionService ) {
    let n: INotification[] = [];
    localStorage.setItem("notifications", JSON.stringify(n));
    /*$('.menu-side-click').on('click', function(){
      this.triggermenu();
    });*/
  }
  async ngOnInit() {
    this.IsComptition = await this.dbServer.GetPropertyAsPromise("Competition");

   
    //this.LoadingStartTest();
    this.std = await this.dbServer.GetPropertyAsPromise("std");
    this.school = await this.dbServer.GetPropertyAsPromise("school");


    console.log(this.IsComptition,"======",this.school)
   this.backProcess.CheckNotifications();
    setInterval(() => {
      this.dbServer.GetPropertyAsPromise("isPlayingQuiz").then(_is => {
        if(_is == '0') {
          this.dbServer.GetPropertyAsPromise("userid").then(_uid => {
            this.dbServer.GetPropertyAsPromise("std").then(_std => {
              let fd = new FormData();
              fd.append("userid", _uid);
              fd.append("std", _std);
              //console.log("std", _std);
              //this.dbServer.PostData(this.dbServer.CommUrl+"api/ai_player/set_notification.php", fd);
            })
          });
        }
      })
    }, 15000);
    this.NotificationsCount();
    this.Name = localStorage.getItem("name");
    this.dbServer.SetProperty("IsRematch", "0");
    this.dbServer.SetProperty("NoInternateCount", 0);
    this.dbServer.SetProperty("isPlayingQuiz", '0');
    this.dbServer.GetMyProfile().then(
      data => {
        localStorage.setItem("name", data.fname);
        localStorage.setItem("userName", data.email);
        localStorage.setItem("email", data.email);
        localStorage.setItem('school', data.schoolName);
        localStorage.setItem("std", data.std !== null ? data.std.toString() : "");

        setTimeout(() => {
          this.dbServer.GetPropertyAsPromise('login').then(data => {
            if (data == '1') {
              //this.nativeStorage.getItem('userName').then(data => {   
              this.dbServer.GetPropertyAsPromise('userid').then(data => {
                console.log("data : ", data);
                if (typeof data === undefined || data === "undefined" || data == null  || data == 'null'  || data === '' && !data) {
                  this.nav.navigateRoot('login');
                } else {
                  localStorage.setItem('login', '1');
                }
              });
            } else {
              this.nav.navigateRoot('login');
            }
          });
        }, 2000);
        
      });
    this.LoadSubject()
    this.Animate();
  }
  InfoBtn(btnType) {
    let msg = "";
    if(btnType == "frnd"){
      msg = `Your friends who are in the same class as you are listed here. <br><br>
      <b>Please note:</b> You can only play with friends who are in the same class as yourself`;
    } else if(btnType == "frndList") {
      msg = `To add friends to your friends list: 
      <ol style="padding-left: 20px;">
        <li>Invite friends on your social media using "Invite Friends" tab.</li>
        <li>Your friends can register in any class on Quiz2shine.</li>
        <li>You can play quiz only with friends who are registered in same class as you.</li>
        <li>Friends who register in same class as you from your invite will be automatically added here.</li>
        <li>As a token of appreciation, we will give you 25 points on the cumulative leaderboard for EVERY friend that registers on Q2S app from your invite, irrespective of which class they register in.</li>
      </ol>
      <b>So for example,</b> if 4 of your friends register on Q2S app from your invite, 2 in your class and 2 in some other class, we will award you 100 points on the cumulative leaderboard. Cool Right!`;
    } else if(btnType == "hstry"){
      msg = `The histroy tab shows you at a subject level, the last 10 quizzes played with VP, Friends and unknown players.`;
    }
    if(msg != "") {
      this.info.ShowInfo(msg);
    }
  }
  async LoadingStart() {
    this.loader = await this.loadingCtrl.create({
       message: "Please wait...",
       duration: 20000
    });
    this.loader.present();
 }
 async LoadingStartTest() {
  this.loader = await this.loadingCtrl.create({
     message: "Please wait...",
     cssClass: "loader-css",
     duration: 2000000
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
  Animate() {
    let thisBtn = this;
    setInterval(() => {
      thisBtn.QuizBtnAnimate(450);
      $(".arrow-animate").stop(true, true).animate({ "margin-top": "-80px" }, 500, function () {
        $(".arrow-animate").stop(true, true).animate({ "margin-top": "-105px" }, 250, function () {
          thisBtn.QuizBtnAnimate(200);
          $(".arrow-animate").stop(true, true).animate({ "margin-top": "-80px" }, 250, function () {
            $(".arrow-animate").stop(true, true).animate({ "margin-top": "-130px" }, 900);
          })
        });
      });
    }, 3000);

  }
  QuizBtnAnimate(DelayTime: number) {
    setTimeout(() => {
      $(".btn-take-quiz").stop(true, true).addClass("btn-take-quiz-active");
      setTimeout(() => {
        $(".btn-take-quiz").stop(true, true).removeClass("btn-take-quiz-active");
      }, 150);
    }, DelayTime);
  }
  NotificationsCount() {
    setInterval(() => {
      this.dbServer.GetPropertyAsPromise("NewNotifications").then(
        _nc => {
          if (_nc && _nc !== null && typeof _nc !== undefined && _nc >= 0) {
            this.NotifnCount = _nc;
          }
        }
      );
    }, 1000);
  }
  triggermenu() {
    if ($(".my-menu-container").css("display") == "none") {
      $(".my-menu-container").css("display", "flex");
      $(".my-menu-container").animate({ "margin-left": "0%" });
      this.MenuBtnIcon = "close";
      this.menuClass = "menu-Visible";
    } else {
      this.menuClass = "menu-hidden";
      $(".my-menu-container").animate({ "margin-left": "-100%" }, () => {
        $(".my-menu-container").css("display", "none");
      });
      this.MenuBtnIcon = "menu";
    }
    //this.mn.toggle();
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
                //this.SubjectOptionsLoaded();
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
  SubjectClicked(SubjectId: number){
    localStorage.setItem("subid", SubjectId.toString());
    this.nav.navigateForward(['home/selectquiz']);
  }
  ShowSubMenu(SubMenuClass: string) {
    if ($('#' + SubMenuClass).css("display") === "none") {
      $('#' + SubMenuClass).css("display", "block");
      var SubMenuItemCount = $('#' + SubMenuClass + ' .sub-menu-list .sub-menu-item').length;
      var SubMenuItemHeight = $('#' + SubMenuClass + ' .sub-menu-list .sub-menu-item').outerHeight();
      var TotalHeight = (SubMenuItemCount * SubMenuItemHeight);
      if (TotalHeight > 17) {
        $('#' + SubMenuClass).animate({ "height": TotalHeight + "px" });
      }
    } else {
      $('#' + SubMenuClass).animate({ "height": "0px" });
      setTimeout(() => {
        $('#' + SubMenuClass).css("display", "none");
      }, 500);
    }
  }
  ViewNotification() {
    this.nav.navigateForward("home/notification");
  }
  async ConfirmLogout() {
    const alt = await this.alertCtrl.create({
      message: "Do you want to logout?",
      buttons: [{
        text: "Cancel"
      }, {
        text: "Yes",
        handler: () => {
          localStorage.clear();
          this.nav.navigateRoot('login');
        }
      }
      ]
    });
    alt.present();
  }
  async ConfirmRematch() {
    const alt = await this.alertCtrl.create({
      message: "Do you want to rematch?",
      buttons: [{
        text: "Cancel"
      }, {
        text: "Play",
        handler: () => {
          //this.nav.navigateRoot('login');
        }
      }
      ]
    });
    alt.present();
  }
  QuizRules() {
    this.triggermenu();
    this.nav.navigateForward("home/quizrules");
  }
  AboutUs() {
    this.triggermenu();
    this.nav.navigateForward("home/about-us");
  }
  Logout() {
    this.triggermenu();
    this.ConfirmLogout();
  }
  MyProfile() {
    this.triggermenu();
    this.nav.navigateForward("home/myprofile");
  }
  Dashboard(DisplayType: string) {
    this.shareValue.SetValue("historyType", DisplayType);
    this.triggermenu();
    this.nav.navigateForward("home/dashboard");
  }
  Leaderboard(DisplayType: string) {
    this.shareValue.SetValue("leaderboardType", DisplayType);
    this.triggermenu();
    this.nav.navigateForward("home/leaserboard");
  }
  Groups() {
    this.triggermenu();
    this.nav.navigateForward("home/groupsall");
  }
  ContactUs() {
    this.triggermenu();
    this.nav.navigateForward("home/contactus");
  }
  Competition(DisplayType: string) {
    console.log(DisplayType,"====",localStorage.getItem('Competition'))
    if(localStorage.getItem('Competition') == 'true'){  
        this.triggermenu();

        if (DisplayType === "play-quiz") {
          this.checkQuizValidation()
          

        } else if (DisplayType === "competition-history") {
          this.nav.navigateForward("home/competition-History");

        } else if (DisplayType === "competition-leaderboard") {
          this.nav.navigateForward("home/competition-Leaderboard");
       
        } else if(DisplayType === 'Upgrade-Plan'){
          this.nav.navigateForward("home/upgradePlan");

        } else if( DisplayType === 'competition-payment-history'){
          this.nav.navigateForward("home/competition-paymentHistory");
        }

      }else{

       
        if (DisplayType === "competition-registration") {
          this.triggermenu();
          this.nav.navigateForward("home/competition-Registration");

        } 

        console.log("Competition Sub Menu disabled")
      }
  }
  Friends(DisplayType: string) {
    this.triggermenu();
    if (DisplayType === "myFriends") {
      this.nav.navigateForward("home/myfriends");
    } else if (DisplayType === "inviteFriends") {
      this.nav.navigateForward("home/invite");
    } else if (DisplayType === "searchFriends") {
      this.nav.navigateForward("home/searchfriends");
    } else if (DisplayType === "friendsRequests") {
      this.nav.navigateForward("home/frnd-rqsts");
    }
  }
  forTest() {
    this.triggermenu();
    //this.nav.navigateForward("home/testquestion");
    this.nav.navigateForward("home/quizended");
    //this.shareValue.SetValue("MyGroupIdForQuiz", "59"); //kdn
    //this.shareValue.SetValue("MyGroupIdForQuiz", "58"); //ani
    //this.nav.navigateForward("home/selectgroup");
  }
  GoToQuiz() {
    this.nav.navigateForward(['home/selectquiz']);
  }

  checkQuizValidation() {
    this.LoadingStart();
      this.competitionService.checkQuizValidation().then(data => {
      
       if (data) {
          this.LoadingStop();
          
             console.log(data);

             if(data === 'expire'){

              this.ShowAlert('Sorry!', 'Please upgrade or register to continue playing');
             }else if(data === 'max_reach'){

              this.ShowAlert('Sorry!', 'You have played quiz for the current week, please wait for more quiz');

             }else{

              this.nav.navigateForward("home/competition");
             }
            
          
       }
    }).catch(() => { this.LoadingStop(); });
 }

 async ShowAlert(header, subheader) {
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
}
