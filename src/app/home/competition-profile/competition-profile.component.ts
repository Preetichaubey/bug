import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, Events, AlertController, Platform, MenuController, LoadingController } from '@ionic/angular';
import { CompetitionService } from 'src/app/Services/competition.service';
import { ISubject, ServerService, IDuration } from '../../Services/server.service';

@Component({
  selector: 'app-competition-profile',
  templateUrl: './competition-profile.component.html',
  styleUrls: ['./competition-profile.component.scss'],
})
export class CompetitionProfileComponent implements OnInit {

  public DurationList: IDuration[] = [];
  public SubjectId = 0;
  public SubscriptionId = 0;
  public SubscriptionAmount : number = 0;
  public IsValid_subscription = true;
  public IsAccepted = false;
  public alert: any;
  public loader: any;

  public imagePath;
  imgURL: any;
  public message: string;
  public competetion_data: any;
  days: number;
  submitTouched: boolean = false;

  constructor(
    public loadingCtrl: LoadingController,
    public navCtrl: NavController, 
    public dbServer: ServerService,
    public competitionService: CompetitionService, 
    public alertCtrl: AlertController) {

     //cordova.plugins.Keyboard.disableScroll(true);
  }
  ngOnInit() {
    this.LoadProfileDetail()
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
  
  
  Validate_subscription() {
    if (this.SubscriptionId === 0 ) {
       this.IsValid_subscription = false;
    } else {
       this.IsValid_subscription = true;
    }
 }
  Validate_All() {
     this.Validate_subscription()
  }
 
  public RefresherEvent:any;
   doRefresh(event) {
      this.RefresherEvent = event;
      this.ngOnInit();
      setTimeout(() => {
         this.RefresherEvent.target.complete();
      }, 10000);
   }

 LoadProfileDetail() {
  let today:any = new Date();
  this.LoadingStart();
  this.competitionService.GeProfileDetail().then(
     data => {
        this.LoadingStop();
        if(this.RefresherEvent) {
           this.RefresherEvent.target.complete();
        }
        this.competetion_data = data

        let licenceExpireDate:any = new Date(this.competetion_data.competetion_expiry_date);
        var diffMs = (licenceExpireDate-today); // milliseconds between now & Christmas
        var diffDays = Math.floor(diffMs / 86400000); // days
        console.log(today+"====="+licenceExpireDate+"=====>>"+diffDays + " days");
        this.days=diffDays

        if(diffDays >0){
           this.submitTouched=true
        }else{
         this.submitTouched=false
         }
     }
  );
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
 let result = this.DurationList.filter((entry)=> { return (entry.id == this.SubscriptionId) });
 this.SubscriptionAmount = result[0].amount; 
}

async TryRegisterCompetition() {
    await this.LoadingStart();
    this.Validate_All();
    setTimeout(() => {
              if (this.IsValid_subscription) {
                  this.UpdatePlanCompetition();
               } else {
                   this.LoadingStop();
                   this.ShowAlert('', 'Data in one or more fields is invalid. Kindly correct and submit again.');
               }

              }, 700);
 
}

 UpdatePlanCompetition() {
   this.submitTouched=true;
     var formData = new FormData();
     formData.append('plan', this.SubscriptionId.toString());
     formData.append('userid', localStorage.getItem('userid'));
     this.dbServer.PostData(this.dbServer.CommUrl + 'api/competition/upgrade.php', formData)
        .then(
           data => {
              this.LoadingStop();
              console.log(data);
              if (data == 1) {
                this.RegisterSuccessAlert('Success!', 'Thank you. Your plan has been successfully updated.');
              } else {
                 this.ShowAlert('Oops', 'Update failed.');
              }
              this.submitTouched = false;
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
