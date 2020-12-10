import { Component, OnInit } from '@angular/core';
import { ServerService, IHistory, ISubject } from 'src/app/Services/server.service';
import { LoadingController } from '@ionic/angular';
import { CompetitionService, IPayment } from 'src/app/Services/competition.service';
declare var $: any;

@Component({
  selector: 'app-competition-payment-history',
  templateUrl: './competition-payment-history.component.html',
  styleUrls: ['./competition-payment-history.component.scss'],
})
export class CompetitionPaymentHistoryComponent implements OnInit {
  public MyRecord: IPayment[] = [];
  public loader: any;
  public SubjectId = "0";
  public historyType: string;

  constructor(
    public competitionService: CompetitionService, 
    public loadingCtrl: LoadingController) { }
  async LoadingStart() {
     this.loader = await this.loadingCtrl.create({
        message: "Please wait...",
        duration: 20000
     });
     this.loader.present();
  }
  LoadingStop() {
     if (this.loader) {
        this.loader.dismiss();
     }
  }
  ngOnInit() {
     this.GetPaymentHistory();
  }
  public RefresherEvent:any;
  doRefresh(event) {
     this.RefresherEvent = event;
     this.ngOnInit();
     setTimeout(() => {
        this.RefresherEvent.target.complete();
     }, 10000);
  }
 
  
  GetPaymentHistory() {
    let today:any = new Date();
     this.LoadingStart();
       this.competitionService.GetPaymentData().then(data => {
        if(this.RefresherEvent) {
           this.RefresherEvent.target.complete();
        }
        if (data) {
           this.LoadingStop();
           this.MyRecord = [];
           if (data.length) {
              console.log(data);
              this.MyRecord = data;
              
              this.MyRecord.forEach((element) => {
               
                let expiry_date:any = new Date(element.expiry_date);
                var diffMs = (expiry_date-today); // milliseconds between now & Christmas
                var diffDays = Math.floor(diffMs / 86400000); // days
                console.log(today+"====="+expiry_date+"=====>>"+diffDays + " days");
               
                element.days=diffDays

              })
            
            
              console.log(this.MyRecord)
           }
        }
     }).catch(() => { this.LoadingStop(); });
  }
  GetWinners() {
     
  }
}