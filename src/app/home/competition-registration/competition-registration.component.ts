import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, Events, AlertController, Platform, MenuController, LoadingController } from '@ionic/angular';
import { CompetitionService } from 'src/app/Services/competition.service';
import { ISubject, ServerService, IDuration } from '../../Services/server.service';
declare var $: any;
@Component({
  selector: 'app-competition-registration',
  templateUrl: './competition-registration.component.html',
  styleUrls: ['./competition-registration.component.scss'],
})
export class CompetitionRegistrationComponent implements OnInit {

  public SubjectList: ISubject[] = [];
  public DurationList: IDuration[] = [];
  public SubjectId = 0;
  public SubscriptionId = 0;
  public SubscriptionAmount : number = 0;
  public IsValid_subject = true
  public IsValid_subscription = true;
  public IsAccepted = false;
  public alert: any;
  public loader: any;

  public imagePath;
  imgURL: any;
  public message: string;

  constructor(
    public loadingCtrl: LoadingController,
    public navCtrl: NavController, 
    public dbServer: ServerService,
    public competitionService: CompetitionService, 
    public alertCtrl: AlertController) {

     //cordova.plugins.Keyboard.disableScroll(true);
  }
  ngOnInit() {
    this.LoadSubject()
    this.LoadDuration()
   }
  async LoadingStart() {
     this.loader = await this.loadingCtrl.create({
        message: "Please wait...",
        duration: 20000
     });
     this.loader.present();
     return 0;
  }
  LoadingStop() {
     if (this.loader) {
        this.loader.dismiss();
     }
  }
  async ShowAlert(header, subheader) {
     this.alert = await this.alertCtrl.create({
        header: header,
        subHeader: subheader,
        buttons: ['OK']
     });
     await this.alert.present();
  }
  async RegisterSuccessAlert(header, subheader) {
     this.alert = await this.alertCtrl.create({
        header: header,
        subHeader: subheader,
        buttons: [{
           text: 'OK',
           handler: () => {
              this.navCtrl.navigateRoot(['login']);
           }
        }]
     });
     await this.alert.present();
  }
  HideAlert() {
     this.alert.remove();
  }
  ionViewDidLoad() {
     console.log('ionViewDidLoad RegistrationPage');
  }
  
  Validate_subject() {
     if (typeof this.SubjectId === undefined || this.SubjectId === 0 || !this.SubjectId) {
        this.IsValid_subject = false;
     } else {
        this.IsValid_subject = true;
     }
  }
  Validate_subscription() {
    if (this.SubscriptionId === 0 ) {
       this.IsValid_subscription = false;
    } else {
       this.IsValid_subscription = true;
    }
 }
  Validate_All() {
     this.Validate_subject();
     this.Validate_subscription()
  }
  LoadSubject() {
    let tryCount = 0;
    let ShouldTryAgain = true;
    let intervalSubject = setInterval(() => {
       if (ShouldTryAgain && tryCount < 3) {
          tryCount++;
          ShouldTryAgain = false;
          this.LoadingStart();
          this.competitionService.GetCompetitionSubjects().then((data: ISubject[]) => {
            // this.LoadingStop();
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

 LoadDuration() {
  let tryCount = 0;
  let ShouldTryAgain = true;
  let intervalDuration = setInterval(() => {
     if (ShouldTryAgain && tryCount < 3) {
        tryCount++;
        ShouldTryAgain = false;
        //this.LoadingStart();
        this.competitionService.GetDuration().then((data: IDuration[]) => {
           this.LoadingStop();
           if (data.length > 0) {
              clearInterval(intervalDuration);
              this.DurationList = data;
              console.log(this.DurationList )
           } else {
              ShouldTryAgain = true;
           }
        }).catch(error => {this.LoadingStop(); ShouldTryAgain = true;});
     }
     if (tryCount > 3) {
        clearInterval(intervalDuration);
     }
  }, 1000);
}
 
getSubscription(){
 console.log(this.SubscriptionId,"====",this.SubjectId)
 let result = this.DurationList.filter((entry)=> { return (entry.id == this.SubscriptionId) });
 this.SubscriptionAmount = result[0].amount; 
}

async TryRegisterCompetition() {
    await this.LoadingStart();
    this.Validate_All();
    setTimeout(() => {
              if (this.IsValid_subject || this.IsValid_subscription) {
                  this.RegisterCompetition();
               } else {
                   this.LoadingStop();
                   this.ShowAlert('', 'Data in one or more fields is invalid. Kindly correct and submit again.');
               }

              }, 700);
 
}

  RegisterCompetition() {

     var formData = new FormData();
     formData.append('subject', this.SubjectId.toString());
     formData.append('subscription', this.SubscriptionId.toString());
     formData.append('userid', localStorage.getItem('userid'));
     this.dbServer.PostData(this.dbServer.CommUrl + 'api/competition/register.php', formData)
        .then(
           data => {
              this.LoadingStop();
              console.log(data);
              if (data == 1) {
                localStorage.setItem('CompetitionSubjectId',this.SubjectId.toString());
                localStorage.setItem('Competition','true');
                this.RegisterSuccessAlert('Success!', 'Thank you. You have successfully registered for Competition.');
              } else {
                 this.ShowAlert('Oops', 'Registration failed.');
              }
           },
           error => {
              console.error(error);
              this.LoadingStop();
              this.ShowAlert('', 'Oops. Something is wrong, please try again after some time.');
           }
        ).catch((error) => {
           this.LoadingStop();
           console.error(error);
           this.ShowAlert('', 'Oops. Something is wrong, please try again after some time.');
        });

  }

  
 
}

