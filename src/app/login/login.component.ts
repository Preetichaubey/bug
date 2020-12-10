import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavController, Events, AlertController, Platform, MenuController, LoadingController} from '@ionic/angular';
//import { WelcomePage} from '../welcome/welcome';
import { ServerService } from '../Services/server.service';
import { async } from '@angular/core/testing';
import { from } from 'rxjs';
//import { RegistrationPage } from '../registration/registration';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  private fb: any;
  public rootPage: any;
  public email: string;
  public password: string;
  public name: string;
  public picture: any;
  public IsValid_email = true;
  public alert: any;
  public IsLoggedIn = false;
 // public storage: Storage;
  public title: string;
  public source: any;
  public buttonText: string;
  public loader:any;
  public buttonTextSig: string;

  constructor(public loadingCtrl: LoadingController, public events: Events, private dbServer: ServerService, public nav: NavController, public alertCtrl: AlertController, public plt: Platform, public menu:MenuController, public router: Router) {
        this.nav = nav;
        //this.storage = storage;
        this.email = '';
        this.password = '';
        this.name = '';
        this.plt.ready().then((readySource) => {
          this.source = readySource;
        });
      }

  ngOnInit() {
    this.menu.enable(false);
    this.dbServer.GetPropertyAsPromise('logout').then(param =>{
    if (typeof param !== "undefined"){
      this.IsLoggedIn = false;
      this.title="Login";
      this.buttonText="Signup";
      this.buttonTextSig="Login";
      this.dbServer.GetPropertyAsPromise('userName').then(data=>{
        console.log("login-data: ", data);
        if (data != null && data !='null' && data !='' && data) {
          //console.log("still login");
          localStorage.setItem('login','1');
          this.nav.navigateRoot('home');
          //this.nav.setRoot(WelcomePage);
        }
      });
    } else {
      this.IsLoggedIn = true;
      this.title="Logout";
      this.buttonText="";
      this.buttonTextSig="Click here for Logout";
    }});
  }
  async LoadingStart() {
    this.loader = await this.loadingCtrl.create({
      message: "Please wait...",
      duration: 20000
    });
    this.loader.present();
  }
  LoadingStop() {
    if(this.loader){
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
  HideAlert() {
    this.alert.remove();
  }
  ConnectionTest() {
    var d = new FormData();
        d.append('email', "kundan.patil13@gmail.com");
        d.append('pwd', "123456");
        return this.dbServer.PostDataForSingleTry(this.dbServer.CommUrl+'process_login.php', d)
        .then(async (d) => {
          const alt = await this.alertCtrl.create({
            message: JSON.stringify(d),
            buttons: ['OK']
          });
          alt.present();
        }).catch(async(e) => {
          const alt = await this.alertCtrl.create({
            message: JSON.stringify(e),
            buttons: ['OK']
          });
          alt.present();
        });
  }
  login() {
    //this.Validate();
    if(this.email === "test@con.c"){
      this.ConnectionTest();
      return;
    }
    this.LoadingStart();
    if(this.IsValid_email && this.password !== '' && this.password){
      let Credentials = {email: this.email, password: this.password};
      this.dbServer.login(this.email, this.password).then(async (user)=>{
       
        console.log(user);
        if(user && typeof user !== undefined && user !== '' && user !== null) {
          if(user == 0){
            this.LoadingStop();
            this.ShowAlert('Invalid', 'Invalid email or password');
          } else if(typeof user['userid'] !== undefined && user['userid'] && +user['userid'] > 0) {
          
            localStorage.setItem('name',user['name']);
            localStorage.setItem('userName',user['email']);
            localStorage.setItem('email',user['email']);
            localStorage.setItem('userid',user['userid']);
            localStorage.setItem('std',user['std']);
            localStorage.setItem('std', user['std']);
            localStorage.setItem('school', user['school']);
            //localStorage.setItem("refCode", user["refCode"]);
            localStorage.setItem('picture','http://www.studiomob.ca/StudioMobCA.hyperesources/surface2.png');
            localStorage.setItem('login','1');
            //this.ShowAlert('', 'Valid');
            this.checkCompetitionRegistration(user['userid'])
           
            //this.nav.setRoot(WelcomePage);


          } else {
            this.ShowAlert('Invalid', 'Invalid email or password 2');
          }
        } else {
          this.ShowAlert('Invalid', 'Invalid email or password');
        }
      }).catch(()=>{this.LoadingStop();
      });
    } else {
      this.LoadingStop();
      this.ShowAlert('Invalid', 'Please enter valid credentials.');
    }
  }


  checkCompetitionRegistration(userid) {

      this.dbServer.checkCompetitionRegistration(userid).then(async (data)=>{
        console.log(data,"====",data.subject);

        if(data == 0){
          localStorage.setItem('CompetitionSubjectId','0');
          localStorage.setItem('Competition','false');
          
          } else{

            localStorage.setItem('CompetitionSubjectId',data.subject);
            localStorage.setItem('Competition','true');
            


          }
          this.LoadingStop();
          this.nav.navigateRoot('home');

      }).catch(()=>{this.LoadingStop();});

  }

 ionViewDidLeave(){
   //this.menu.enable(true);
 }

 ionViewDidLoad() {

 }
 Validate(){
  if(typeof this.email === undefined || this.email === '' || !this.email){
    this.IsValid_email = false;
  } else {
      if(this.email.length===10 && isNaN(Number(this.email))){
        this.IsValid_email = true;
      } else {
        var v: RegExp = new RegExp(/^[0-9a-zA-Z]{1,50}([._]{1}[0-9a-zA-Z]{1,50}){0,10}[@]{1}[a-zA-Z0-9-]{1,30}([.]{1}[a-zA-Z0-9-]{1,20}){1,5}$/);
        var r = this.email.match(v);
        if(r !== null){
          if(r.length > 0) {
            this.IsValid_email = true;
          } else { this.IsValid_email = false; }
        } else { this.IsValid_email = false; }
      }
  }

 }
 logOut(){
  localStorage.setItem('userName',null);
  localStorage.setItem('email',null);
  localStorage.setItem('picture',null);
  localStorage.setItem('id',null);
     this.fb.logout().then(() => {
      this.events.publish('loggedIn',0);
      this.router.navigate(['login']);
    });
 }

 Register(){
   this.router.navigate(['register']);
 }
 ForgotPassworsd(){
  this.router.navigate(['forgotpassworsd']);
 }
}

