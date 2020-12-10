import { Component, OnInit } from '@angular/core';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { InAppBrowser, InAppBrowserOptions } from '@ionic-native/in-app-browser/ngx';
import { ServerService } from 'src/app/Services/server.service';
//import { Facebook, FacebookLoginResponse } from '@ionic-native/facebook/ngx';

@Component({
  selector: 'app-facebook',
  templateUrl: './facebook.component.html',
  styleUrls: ['./facebook.component.scss'],
})
export class FacebookComponent implements OnInit {
  public errMsg = "ErrMsg Here";
  public stsMsg = "Status Msg";
  public options : InAppBrowserOptions = {
    location : 'no',
    clearcache : 'yes',
    clearsessioncache : 'yes',
};
  constructor(private socialShare: SocialSharing, public iab: InAppBrowser, public serverService: ServerService) { 
    
  }

  ngOnInit() {
    /*setTimeout(() => {
      this.fb.login(['public_profile', 'user_friends', 'email'])
      .then((res: FacebookLoginResponse) => console.log('Logged into Facebook!', res))
      .catch(e => console.log('Error logging into Facebook', e));
      this.fb.logEvent(this.fb.EVENTS.EVENT_NAME_ADDED_TO_CART);  
    }, 5000);
    */
  }
  FacebookShare() {
    this.serverService.GetPropertyAsPromise("userid").then(_uId => {
      
    let link = "https://www.facebook.com/sharer/sharer.php?u=http%3A%2F%2Fsarmicrosystems.in%2Fquiztest%2Fregister.php?rg="+_uId;
      const browser = this.iab.create(link,"_self", this.options);

      browser.on('loadstop').subscribe(event => {
        browser.insertCSS({ code: "body{color: red;" });
      });
    });
    this.stsMsg = "Inside  Function";
    setTimeout(() => {
      


      /*this.socialShare.shareViaFacebook("Hello, This is testing")
        .then(d => this.stsMsg = "Success")
        .catch(e=> {
          this.stsMsg = "Error";
          this.errMsg = e;
        });*/
    }, 1000);
    
  }
}
