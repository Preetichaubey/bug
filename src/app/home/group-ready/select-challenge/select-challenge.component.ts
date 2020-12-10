import { Component, OnInit, OnDestroy } from '@angular/core';
import { LoadingController, AlertController, NavController, ModalController } from '@ionic/angular';
import { ServerService, ISubject, INotification } from 'src/app/Services/server.service';
import { ShareValuesService } from 'src/app/Services/share-values.service';
import { GroupQuizService } from 'src/app/Services/group-quiz.service';
import { SelectGroupComponent } from '../select-group/select-group.component';

@Component({
  selector: 'app-select-challenge',
  templateUrl: './select-challenge.component.html',
  styleUrls: ['./select-challenge.component.scss'],
})
export class SelectChallengeComponent implements OnInit, OnDestroy {
  public ChallengeType = 1;
  public loader: any;
  public SubjectList: ISubject[] = [];
  public SubjectId = 0;
  public IsSubjectSelected = false;
  public IsTopicSelected = false;
  public DisplayPlayBtn = false;
  public TopicId: number;
  public TopicList: any;
  public MyGroupIdForQuiz: any;
  public OppGroupIdForQuiz = 0;
  public OppGroupNameForQuiz = 'Open Challenge';
  public NotificationInterval: any;
  public ChallengeAcceptenceInterval: any;
  public NotificationData: INotification[]=[];
  constructor(public loadingCtrl: LoadingController, public dbServer: ServerService, 
    public shareService: ShareValuesService, public groupService: GroupQuizService, 
    public alertCtrl: AlertController, public nav: NavController, public modalCtrl: ModalController) { }

  ngOnInit() {
    this.shareService.GetValueAsPromise("MyGroupIdForQuiz").then(_gi =>{
      if(_gi) {
        this.MyGroupIdForQuiz = _gi;
        this.StartGettingAvailableChallenges();
      }
    }).catch((_giE)=>{console.log("Error : ", _giE)});
  }
  ngOnDestroy() {
    clearInterval(this.NotificationInterval);
    clearInterval(this.ChallengeAcceptenceInterval);
  }
  SelectChallenge(type: number) {
    if(type == 1) {
      this.ChallengeType = 1;
      this.SubjectId = 0;
      this.StartGettingAvailableChallenges();
    } else if(type == 2) {
      this.ChallengeType = 2;
      this.IsTopicSelected = false;
      this.LoadSubject();
      clearInterval(this.NotificationInterval);
    }
  }
  async LoadingStart(msg = "Please wait...", Duration = 10000) {
    this.loader = await this.loadingCtrl.create({
      message: msg,
      duration: Duration
    });
    this.loader.present();
  }
  LoadingStop() {
    //console.log("stopping Loader");
    setTimeout(() => {
      if(this.loader){
        //console.log("Loader Stop");
        this.loader.dismiss();
      } else {
        console.log("Loading could not be stopped");
      }
    }, 700);
  }
  LoadSubject(){
    this.LoadingStart();
    this.dbServer.GetSubjects().then((data: ISubject[]) => {
      this.LoadingStop();
      //console.log(data);
      this.SubjectList = data;
      this.IsSubjectSelected = false;
    }).catch(error => this.LoadingStop());
  }
  SubjectSelected(_SubjectId: any){
    if(typeof _SubjectId !== undefined && _SubjectId != '' && _SubjectId != null && _SubjectId) {
      if(typeof _SubjectId.detail.value !== undefined && _SubjectId.detail.value != '' && _SubjectId.detail.value != null && _SubjectId.detail.value != '0' && _SubjectId.detail.value){
        this.LoadingStart();
        this.IsSubjectSelected = true;
        this.IsTopicSelected = false;
        this.DisplayPlayBtn = false;
        this.TopicId = 0;
        localStorage.setItem("subid", _SubjectId.detail.value);
        if(typeof _SubjectId != undefined && _SubjectId != '' && _SubjectId != null && _SubjectId)
        this.dbServer.GetTopics(_SubjectId.detail.value).then((data: ISubject[]) => {
          this.TopicList = data;
          this.LoadingStop();
        }).catch(error => this.LoadingStop());
      }
    }
    
  }
  TopicSelected(_TopicId: any){
    console.log("Topic Selected : ", _TopicId);
    if(typeof _TopicId != undefined && _TopicId != '' && _TopicId != null && _TopicId) {
      if(typeof _TopicId.detail.value !== undefined && _TopicId.detail.value != '' && _TopicId.detail.value != null && _TopicId.detail.value != '0' && _TopicId.detail.value){
        this.IsTopicSelected = true;
        this.TopicId = _TopicId.detail.value;
        localStorage.setItem("topics", _TopicId.detail.value);
        setTimeout(() => {
          this.SelectGroup();
        }, 200);
        this.DisplayPlayBtn = false;
      }
    }
  }
  async SelectGroup() {
    //if(this.GroupId && this.GroupId > 0) {
    const modal = await this.modalCtrl.create({
       component: SelectGroupComponent,
       componentProps: {
          'MyGroupId': this.MyGroupIdForQuiz
       }
    });
    await modal.present();
    const { data } = await modal.onWillDismiss();
    
    if (+data["groupid"] >= 0) {
      if(+data['returnType'] == 1) {
        this.OppGroupIdForQuiz = data["groupid"];
        this.OppGroupNameForQuiz = data["groupname"];
      }
       console.log(data["groupid"] + " : " + data["groupname"]);
    }
    //}
 }
  StartChallenge() {
    this.LoadingStart();
    console.log("this.MyGroupIdForQuiz: ", this.MyGroupIdForQuiz);
    this.groupService.StartNewChallenge(this.MyGroupIdForQuiz, this.OppGroupIdForQuiz).then(_r => {
      if(_r > 0 && _r) {
        localStorage.setItem("testId", _r.toString());
        this.StartGettingIsChallengeAccepted();
      } else {
        this.LoadingStop();
      }
    }).catch(() => {this.LoadingStop()});
  }
  StartGettingIsChallengeAccepted() {
    this.LoadingStart("Waiting others to accept your challenge.", 60000);
    let sendRequest = true;
    let counter = 0;
    let timerCount =0;
    this.ChallengeAcceptenceInterval = setInterval(() => {
      if(sendRequest == true) {
        sendRequest = false;
        this.WaitingToAcceptChallenge().then( _r => {
          sendRequest = true;
          counter = 0;
        }).catch(() => {
          sendRequest = true;
          counter = 0;
        });
      }
      counter++;
      if(counter>7){
        sendRequest = true;
        counter = 0;
      }
      if(timerCount>60){
        clearInterval(this.ChallengeAcceptenceInterval);
      }
      timerCount++;
    }, 1000);
  }
  WaitingToAcceptChallenge(): Promise<any> {
    return new Promise((resolve, reject) => {
      
      this.groupService.IsChallengeAccepted(this.MyGroupIdForQuiz)
      .then((_r: {TestId: number, Status: number, 
        TopicId: number, Topic: string, SubjectId: number, Subject: string}) => {
        if(_r.TestId>0 && _r.Status > 0) {
          this.LoadingStop();
          clearInterval(this.ChallengeAcceptenceInterval);
          localStorage.setItem("testId", _r.TestId.toString());
          localStorage.setItem("subid", _r.SubjectId.toString());
          localStorage.setItem("topics", _r.TopicId.toString());
          localStorage.setItem("AgainstId", "4");
          this.ShowQuisInfo(_r.Subject, _r.Topic);
          setTimeout(()=>{
            this.nav.navigateRoot("home/playquiz");
          }, 5000);
        }
          resolve();
      }).catch(() => {
        reject();
      });
    });
    
  }
  StartGettingAvailableChallenges() {
    let sendRequest = true;
    let counter = 0;
    this.NotificationInterval = setInterval(() => {
      if(sendRequest == true) {
        sendRequest = false;
        this.GetAvailableChallenges().then( _r => {
          sendRequest = true;
          counter = 0;
        }).catch(() => {
          sendRequest = true;
          counter = 0;
        });
      }
      counter++;
      if(counter>7){
        sendRequest = true;
        counter = 0;
      }
    }, 1000);
  }
  GetAvailableChallenges(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.groupService.CheckNotificationsForGroupQuiz(this.MyGroupIdForQuiz).then(
        (_r: INotification[]) => {
          this.NotificationData = _r;
          resolve();
        }
      )
      .catch(() => {reject();});
    });
  }
  async ShowAlert(msg: string) {
    let ac = await this.alertCtrl.create({
      message: msg,
      buttons: ["Okay"]
    });
    ac.prepend();
  }
  async ShowQuisInfo(Subject:string, Topic:string){
    let a = await this.alertCtrl.create({
       message: "Challenge will be on<br>subject: "+Subject+",<br>Topic: "+Topic,
       backdropDismiss: false
       //buttons: ["Okay"]
    });
    a.present();
    setTimeout(()=>{
       a.dismiss();
    },5000);
 }
  AcceptGroupQuizRequest(TestId, SubjectId, TopicId, SubName, TopicName) {
    this.groupService.AcceptChallenge(TestId, this.MyGroupIdForQuiz, SubjectId, TopicId)
    .then(_r => {
      if(_r === 1) {
        localStorage.setItem("testId", TestId);
        localStorage.setItem("subid", SubjectId);
        localStorage.setItem("topics", TopicId);
        localStorage.setItem("AgainstId", "4");
        this.ShowQuisInfo(SubName, TopicName);
        setTimeout(()=>{
          this.nav.navigateRoot("home/playquiz");
        }, 5000);
        console.log("Challenge Accepted");
      } else {
        this.ShowAlert("This challenge is expired.");
      }
    });
  }
  RejectGroupQuizRequest(TestId) {
    
  }
}
