import { Component, OnInit, OnDestroy } from '@angular/core';
import { Network } from '@ionic-native/network/ngx';
import { ServerService } from '../../Services/server.service';
import { AlertController } from '@ionic/angular';
import { ok } from 'assert';

@Component({
  selector: 'app-quiz-rules',
  templateUrl: './quiz-rules.component.html',
  styleUrls: ['./quiz-rules.component.scss'],
})
export class QuizRulesComponent implements OnInit, OnDestroy {
  public connectSubscription: any;
  public IsAlertActive = false;
  public NetwordInterval: any;
  constructor(public network: Network, public dbService: ServerService, public alertCtrl: AlertController) { }

  ngOnInit() {
    /* this.dbService.PostData(this.dbService.CommUrl+"api/kdnptl.php", "").then(()=>{
      console.log("success");
    }).catch(()=>{
      console.log("error");
    }); */
      /* console.log("Network Type: ", this.network.type);
    this.NetwordInterval = setInterval(()=>{
      if(this.IsAlertActive === false) {
        this.network.onConnect().subscribe(() => {
          console.log('network connected!');
          this.ShowAlert("Network Connected: "+this.network.type);
        }, (e)=>{
          console.log("Error: ",(e));
          this.ShowAlert("Error");
        });
      }
    },5000); */
  }
  ngOnDestroy() {
    //clearInterval(this.NetwordInterval);
  }
  /* async ShowAlert(alrtMsg:string = 'Sorry, this request is expired.') {
    this.IsAlertActive = true;
    var alrt = await this.alertCtrl.create({
       message: alrtMsg,
       buttons: [{
        text: "OK",
        handler: () => {
          this.IsAlertActive = false;
        }
       },{
        text: "Interval",
        handler: () => {
          clearInterval(this.NetwordInterval);
        }
       }
       ]
    });
    alrt.present();
  } */
}
