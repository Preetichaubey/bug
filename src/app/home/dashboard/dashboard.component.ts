import { Component, OnInit } from '@angular/core';
import { ServerService, IDashboard, ISubject } from 'src/app/Services/server.service';
import { LoadingController } from '@ionic/angular';
import { ShareValuesService } from 'src/app/Services/share-values.service';
declare var $: any;
@Component({
   selector: 'app-dashboard',
   templateUrl: './dashboard.component.html',
   styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
   public MyRecord: IDashboard[] = [];
   public loader: any;
   public SubjectList: ISubject[] = [];
   public SubjectId = "0";
   public historyType: string;
   public history: IDashboard[] = [];

   constructor(public dbServer: ServerService, public loadingCtrl: LoadingController,
      public shareService: ShareValuesService) { }
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
      this.LoadSubject();
      if (this.shareService.GetValue("historyType")) {
         this.historyType = this.shareService.GetValue("historyType");
      }
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
   LoadSubject() {
      this.dbServer.GetSubjects().then((data: ISubject[]) => {
         this.SubjectList = data;
         $(".data-container").css("margin-top", (+$(".subject-select").outerHeight() + 10) + "px");
      }).catch(error => {
         this.LoadingStop()
         $(".data-container").css("margin-top", (+$(".subject-select").outerHeight() + 10) + "px");
      });
   }
   SubjectChanged() {
      console.log(this.SubjectId);
      this.GetHistory();
   }
   GetHistory() {
      this.LoadingStart();
      if (this.historyType !== "friends" && this.historyType !== "groups" && this.historyType !== "AI") {
         this.historyType = "overall";
      }
      this.dbServer.GetDashboardData(this.SubjectId, this.historyType).then(data => {
         if(this.RefresherEvent) {
            this.RefresherEvent.target.complete();
         }
         if (data) {
            this.LoadingStop();
            this.MyRecord = [];
            if (data.length) {
               console.log(data);
               this.MyRecord = data;

               this.MyRecord.forEach((number,index)=> {

                  if(number.p1_correct_count == 0 && number.p2_correct_count == 0){
                  }else{
                     this.history.push(number)
                  }
                });

                console.log(this.history)
            }
         }
      }).catch(() => { this.LoadingStop(); });
   }
   GetWinners() {
      
   }
}
