import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { PasswordForgotComponent } from './password-forgot/password-forgot.component';
import { PasswordResetComponent } from './password-reset/password-reset.component';
import { VerifyOtpComponent } from './password-reset/verify-otp/verify-otp.component';
import { PrivacyPolicyComponent } from './privacy-policy/privacy-policy.component';
import { TncComponent } from './tnc/tnc.component';

const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'home', loadChildren: () => import('./home/home.module').then(m => m.HomePageModule) },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgotpassworsd', component: PasswordForgotComponent },
  { path: 'resetpassworsd', component: PasswordResetComponent },
  { path: 'verifyotp', component: VerifyOtpComponent },
  { path: 'privacy-policy', component: PrivacyPolicyComponent },
  { path: 'tnc', component: TncComponent },
  { path: 'list', loadChildren: () => import('./list/list.module').then(m => m.ListPageModule) },
  {
    path: 'search-group',
    loadChildren: () => import('./home/select-quiz/search-group/search-group.module').then( m => m.SearchGroupPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}
