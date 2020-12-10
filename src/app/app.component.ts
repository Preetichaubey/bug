import { Component } from '@angular/core';

import { Platform, NavController } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { ServerService } from './Services/server.service';
import { Router } from '@angular/router';
import { AudioService } from './Services/audio.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  public appPages = [];
  public BeforeLogin = [
    { title: 'Home', url: '/home', icon: 'home' },
    { title: 'List', url: '/list', icon: 'list' },
    { title: 'Login', url: '/login', icon: 'list' }
  ];
  public OnLogin = [
    { title: 'Home', url: '/home', icon: 'home' },
    { title: 'List', url: '/list', icon: 'list' }
  ];

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private dbServer: ServerService,
    public nav: NavController,
    public router: Router,
    public audio: AudioService
  ) {
    this.initializeApp();
    localStorage.setItem("NewNotifications", '0');
    this.dbServer.GetPropertyAsPromise('logout').then(param =>{
      if (typeof param !== "undefined"){
        
        this.dbServer.GetPropertyAsPromise('userName').then(data=>{
          if (typeof data !== undefined && data != null && data !='null') {
            localStorage.setItem('login','1');
            this.nav.navigateRoot('home');
            this.dbServer.SetMeOnline();
          } else {
            this.nav.navigateRoot('login');
          }
        });
      } else {
        this.nav.navigateRoot('login');
      }});
    this.appPages = this.OnLogin;
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.audio.LoadAudios();
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.platform.backButton.subscribe(async () => {
        if ((this.router.isActive('/home', true) && this.router.url === '/home') || this.router.isActive('/login', true) && this.router.url === '/login') {
          navigator['app'].exitApp();
        }
      });
    });
  }
}
