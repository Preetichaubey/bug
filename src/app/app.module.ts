import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { from } from 'rxjs';
import { MathModule } from './Services/Math/math.module';
import { SearchGroupPageModule } from './home/select-quiz/search-group/search-group.module';
import { GroupAnsComponent } from './home/play-quiz/group-ans/group-ans.component';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { SocialSharing } from '@ionic-native/social-sharing/ngx';
import { InAppBrowser } from '@ionic-native/in-app-browser/ngx';
import { PasswordForgotComponent } from './password-forgot/password-forgot.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { VerifyOtpComponent } from './password-reset/verify-otp/verify-otp.component';
import { Network } from '@ionic-native/network/ngx';
import { InfoAlertService } from './Services/info-alert.service';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { TncComponent } from './tnc/tnc.component';
//import { Facebook } from '@ionic-native/facebook/ngx';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    RegisterComponent,
    GroupAnsComponent,
    PasswordForgotComponent,
    PasswordResetComponent,
    VerifyOtpComponent,
    PrivacyPolicyComponent,
    TncComponent
  ],
  entryComponents: [GroupAnsComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    SearchGroupPageModule
  ],
  exports:[],
  providers: [
    StatusBar,
    SplashScreen,
    SocialSharing,
    InAppBrowser,
    //Facebook,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    NativeAudio, 
    Network,
    InfoAlertService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
