import { Component, OnInit } from '@angular/core';
import { ServerService, IHistory, ISubject } from 'src/app/Services/server.service';
import { LoadingController } from '@ionic/angular';
import { CompetitionService } from 'src/app/Services/competition.service';
declare var $: any;
@Component({
  selector: 'app-competition-history',
  templateUrl: './competition-history.component.html',
  styleUrls: ['./competition-history.component.scss'],
})
export class CompetitionHistoryComponent implements OnInit {
  public MyRecord: IHistory[] = [];
  public loader: any;
  public SubjectList: ISubject[] = [];
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
     this.SubjectId = localStorage.getItem('CompetitionSubjectId')
     this.GetHistory();
  }
  public RefresherEvent:any;
  doRefresh(event) {
     this.RefresherEvent = event;
     this.ngOnInit();
     setTimeout(() => {
        this.RefresherEvent.target.complete();
     }, 10000);
  }
 
  
  GetHistory() {
     this.LoadingStart();
        this.historyType = "overall";
     this.competitionService.GetDashboardData().then(data => {
        if(this.RefresherEvent) {
           this.RefresherEvent.target.complete();
        }
        if (data) {
           this.LoadingStop();
           this.MyRecord = [];
           if (data.length) {
              console.log(data);
              this.MyRecord = data;
              console.log(this.MyRecord)
           }
        }
     }).catch(() => { this.LoadingStop(); });
  }
}