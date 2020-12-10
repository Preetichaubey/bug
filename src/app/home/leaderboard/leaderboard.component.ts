import { Component, OnInit } from '@angular/core';
import { ServerService, IDashboard, ISubject } from 'src/app/Services/server.service';
import { LoadingController, AlertController } from '@ionic/angular';
import { ShareValuesService } from '../../Services/share-values.service';
declare var $: any;

@Component({
   selector: 'app-leaderboard',
   templateUrl: './leaderboard.component.html',
   styleUrls: ['./leaderboard.component.scss'],
})
export class LeaderboardComponent implements OnInit {
   public loader: any;
   public leaderBoardData: IDashboard[] = [];
   public SubjectList: ISubject[] = [];
   public SubjectId = "0";
   public DurationId: number = 2;
   public leaderBoardType: string;
   constructor(public dbServer: ServerService, public shareService: ShareValuesService, public loadingCtrl: LoadingController, public alrtCtrl: AlertController) { }

   ngOnInit() {
      this.LoadSubject();
      if (this.shareService.GetValue("leaderboardType")) {
         this.leaderBoardType = this.shareService.GetValue("leaderboardType");
      }
      this.ApplyFilter();
      /*this.dbServer.GetLeaderboard().then(
        data => {
          this.LoadingStop();
          if(data && data.length > 0) {
            this.leaderBoardData = data;
          }
        }
      ).catch(()=>{this.LoadingStop();});*/
      $('.modal-background').on("click", function () {
         $('.modal-container').css("display", "none");
         $('.modal-background').css("display", "none");
      });
   }
   public RefresherEvent:any;
   doRefresh(event) {
      this.RefresherEvent = event;
      this.ngOnInit();
      setTimeout(() => {
         this.RefresherEvent.target.complete();
      }, 10000);
   }
   CancelFilter() {
      $('.modal-container').css("display", "none");
      $('.modal-background').css("display", "none");
   }
   ShowFilter() {
      $('.modal-container').css("display", "block");
      $('.modal-background').css("display", "block");
   }
   LoadSubject() {
      this.dbServer.GetSubjects().then((data: ISubject[]) => {
         this.SubjectList = data;
      }).catch(error => this.LoadingStop());
   }
   SetDuration(value: number) {
      this.DurationId = value;
      this.ApplyFilter();
   }
   SubjectChanged() {
      console.log(this.SubjectId);
      this.ApplyFilter();
   }
   ApplyFilter() {
      console.log("this.leaderBoardType : ", this.leaderBoardType);

      this.LoadingStart();
      if (this.leaderBoardType !== "friends" && this.leaderBoardType !== "groups") {
         this.leaderBoardType = "overall";
      }
      this.dbServer.LeaderBoardFilter(this.DurationId, this.SubjectId, this.leaderBoardType).then(
         data => {
            if(this.RefresherEvent) {
               this.RefresherEvent.target.complete();
            }
            this.LoadingStop();
            this.leaderBoardData = [];
            console.log("Data: ", data)
            if (data && data.length > 0) {
               this.leaderBoardData = data;
               setTimeout(() => {
                  this.AnimateIn();
               }, 500);
            }
            this.CancelFilter();
         }
      ).catch(() => { this.LoadingStop(); this.CancelFilter(); });

   }
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
   async AnimateIn() {
      if (this.leaderBoardData.length > 0) {
         var itemsCount = $(".list .item").length;
         for (let i = 0; i < itemsCount; i++) {
            const fn = new Promise((resolve) => {
               if (i == 0) {
                  $(".list .item").eq(i).animate({ "margin-top": "0px" }, "fast", "swing", () => {
                     $(".list .item").eq(i).css("position", "relative");
                     resolve();
                  });
               } else {
                     $(".list .item").eq(i).animate({ "margin-top": "0px" }, "fast", "swing", () => {
                        $(".list .item").eq(i).css("position", "relative");
                        resolve();
                     });
               }
            });
            await Promise.all([fn]);
         }
      }
   }
}
