import { Component, OnInit, OnDestroy } from '@angular/core';
import { IGroupMemberAnswers } from 'src/app/Services/AllInterfaces';
import { ShareValuesService } from 'src/app/Services/share-values.service';

@Component({
  selector: 'app-group-ans',
  templateUrl: './group-ans.component.html',
  styleUrls: ['./group-ans.component.scss'],
})
export class GroupAnsComponent implements OnInit, OnDestroy {
  public MemberResponses: IGroupMemberAnswers[] = [];
  public MemberResponsesInterval: any;
  constructor(public shareService: ShareValuesService) { }

  ngOnInit() {
    this.shareService.GetValueAsPromise("MemberResponses").then(_r => {
      this.MemberResponses = _r;
      console.log("MemberResponses: ", this.MemberResponses);
    })
    this.GetMemberResponses();
  }
  ngOnDestroy() {
    if(this.MemberResponsesInterval) {
      clearInterval(this.MemberResponsesInterval);
    }
  }
  GetMemberResponses() {
    this.MemberResponsesInterval = setInterval(() => {
      this.shareService.GetValueAsPromise("MemberResponses").then(_r => {
        this.MemberResponses = _r;
        console.log("MemberResponses: ", this.MemberResponses);
      })
    }, 1000);
  }
}
