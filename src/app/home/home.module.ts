import { ModuleWithProviders, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { HomePage } from './home.page';
import { SelectQuizComponent } from './select-quiz/select-quiz.component';
import { PlayQuizComponent } from './play-quiz/play-quiz.component';
/* import { SelectFriendComponent } from './select-friend/select-friend.component'; */
import { ScorecardComponent } from './scorecard/scorecard.component';
import { LogoutComponent } from './logout/logout.component';
import { NotificationsComponent } from './notifications/notifications.component';
//import { KatexModule } from 'ng-katex';
import { MathModule } from '../Services/Math/math.module';
import { MathServiceImpl } from '../Services/Math/math.service';
import { MathtestComponent } from './mathtest/mathtest.component';
import { MathDirective } from '../Services/Math/math.directive';
import { HttpClientModule } from '@angular/common/http';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { ProfileComponent } from './profile/profile.component';
import { GroupCreateComponent } from './group-create/group-create.component';
import { GroupsAllComponent } from './groups-all/groups-all.component';
import { GroupAnsComponent } from './play-quiz/group-ans/group-ans.component';
import { ExamEndedComponent } from './play-quiz/exam-ended/exam-ended.component';
import { GroupReadyComponent } from './group-ready/group-ready.component';
import { SelectChallengeComponent } from './group-ready/select-challenge/select-challenge.component';
import { FacebookComponent } from './social/facebook/facebook.component';
import { InviteComponent } from './friends/invite/invite.component';
import { SearchComponent } from './friends/search/search.component';
import { MyFriendsComponent } from './friends/my-friends/my-friends.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { ChangePasswordComponent } from './profile/change-password/change-password.component';
import { QuestionTestComponent } from './question-test/question-test.component';
import { UpdateGroupComponent } from './groups-all/update-group/update-group.component';
import { QuizRulesComponent } from './quiz-rules/quiz-rules.component';
import { SelectFriendComponent } from './select-quiz/select-friend/select-friend.component';
import { SelectGroupComponent } from './group-ready/select-group/select-group.component';
import { AboutUsComponent } from '../about-us/about-us.component';
import { FriendRequestsComponent } from './friends/friend-requests/friend-requests.component';
import { CompetitionComponent } from './competition/competition.component';
import { CompetitionRegistrationComponent } from './competition-registration/competition-registration.component';
import { CompetitionHistoryComponent } from './competition-history/competition-history.component';
import { CompetitionLeaderboardComponent } from './competition-leaderboard/competition-leaderboard.component';
import { CompetitionPlayquizComponent } from './competition-playquiz/competition-playquiz.component';
import { CompetitionEndedComponent } from './competition-playquiz/competition-ended/competition-ended.component';
import { CompetitionScorecardComponent } from './competition-scorecard/competition-scorecard.component';
import { CompetitionProfileComponent } from './competition-profile/competition-profile.component';
import { CompetitionPaymentHistoryComponent } from './competition-payment-history/competition-payment-history.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HttpClientModule,
    //MathModule.forRoot(),
    RouterModule.forChild([
      { path: '', component: HomePage },
      { path: 'selectquiz', component: SelectQuizComponent},
      { path: 'playquiz', component: PlayQuizComponent},
      { path: 'scorecard', component: ScorecardComponent},
      { path: 'dashboard', component: DashboardComponent},
      { path: 'leaserboard', component: LeaderboardComponent},
      { path: 'notification', component: NotificationsComponent },
      { path: 'friendsforquiz', component: SelectFriendComponent},
      { path: 'myprofile', component: ProfileComponent},
      { path: 'newgroup', component: GroupCreateComponent},
      { path: 'groupsall', component: GroupsAllComponent},
      { path: 'updategroup', component: UpdateGroupComponent},
      { path: 'quizended', component: ExamEndedComponent},
      { path: 'mathtest', component: MathtestComponent},
      { path: 'groupready', component: GroupReadyComponent},
      { path: 'invite', component: InviteComponent},
      { path: 'searchfriends', component: SearchComponent},
      { path: 'myfriends', component: MyFriendsComponent},
      { path: 'facebook', component: FacebookComponent},
      { path: 'contactus', component: ContactUsComponent},
      { path: 'changepassword', component: ChangePasswordComponent},
      { path: 'selectchallenge', component: SelectChallengeComponent},
      { path: 'quizrules', component: QuizRulesComponent},
      { path: 'selectgroup', component: SelectGroupComponent},
      { path: 'about-us', component: AboutUsComponent},
      { path: 'frnd-rqsts', component: FriendRequestsComponent},
      { path: 'testquestion', component: QuestionTestComponent},
      { path: 'competition', component: CompetitionComponent},
      { path: 'competition-Registration', component: CompetitionRegistrationComponent},
      { path: 'competition-History', component: CompetitionHistoryComponent},
      { path: 'competition-Leaderboard', component: CompetitionLeaderboardComponent},
      { path: 'competition-Playquiz', component: CompetitionPlayquizComponent},
      { path: 'competition-quizended', component: CompetitionEndedComponent},
      { path: 'competition-scorecard', component: CompetitionScorecardComponent},
      { path: 'upgradePlan', component: CompetitionProfileComponent},
      { path: 'competition-paymentHistory', component: CompetitionPaymentHistoryComponent}
    ])
  ],
  declarations: [
    HomePage, 
    SelectQuizComponent, 
    PlayQuizComponent, 
    ProfileComponent,
    SelectFriendComponent,
    ScorecardComponent,
    LogoutComponent,
    LeaderboardComponent,
    NotificationsComponent,
    MathtestComponent,
    DashboardComponent,
    GroupCreateComponent,
    GroupsAllComponent,
    ExamEndedComponent,
    GroupReadyComponent,
    SelectChallengeComponent,
    InviteComponent,
    FacebookComponent,
    SearchComponent,
    MyFriendsComponent,
    ContactUsComponent,
    ChangePasswordComponent,
    MathDirective,
    UpdateGroupComponent,
    QuizRulesComponent,
    SelectGroupComponent,
    QuestionTestComponent,
    AboutUsComponent,
    FriendRequestsComponent,
    CompetitionComponent,
    CompetitionRegistrationComponent,
    CompetitionHistoryComponent,
    CompetitionLeaderboardComponent,
    CompetitionPlayquizComponent,
    CompetitionEndedComponent,
    CompetitionScorecardComponent,
    CompetitionProfileComponent,
    CompetitionPaymentHistoryComponent
  ],
  exports: [MathDirective],
  providers: [MathServiceImpl]
})
export class HomePageModule {
  constructor(mathService: MathServiceImpl) {
    console.log(`constructor module`);
    // see https://docs.mathjax.org/en/latest/advanced/dynamic.html
    const script = document.createElement('script') as HTMLScriptElement;
    script.type = 'text/javascript';
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-MML-AM_CHTML';
    script.async = true;

    document.getElementsByTagName('head')[0].appendChild(script);

    const config = document.createElement('script') as HTMLScriptElement;
    config.type = 'text/x-mathjax-config';
    config.text = `
    MathJax.Hub.Config({
        skipStartupTypeset: true,
        tex2jax: { inlineMath: [["$", "$"]],displayMath:[["$$", "$$"]] }
      });
      MathJax.Hub.Register.StartupHook('End', () => {
        window.hubReady.next();
        window.hubReady.complete();
      });
    `;

    document.getElementsByTagName('head')[0].appendChild(config);
  }
}
