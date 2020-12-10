import { Injectable } from '@angular/core';
import { IQuestion, ServerService, IAnswers, INotification } from './server.service';
import { ShareValuesService } from './share-values.service';
import { IGroupMemberAnswers, IGroupQuizSummary } from './AllInterfaces';
import { promise } from 'protractor';

@Injectable({
   providedIn: 'root'
})
export class GroupQuizService {
   public MemberResponceInterval: any;

   constructor(private dbServer: ServerService, public shareService: ShareValuesService) { }
   public SendGroupReadyRequest(GroupId: any): Promise<number> {
      return new Promise((resolve, reject) => {
         this.dbServer.GetPropertyAsPromise("userid").then(_uId => {
            let fd = new FormData();
            fd.append("userid", _uId);
            fd.append("groupid", GroupId);
            this.dbServer.PostData(this.dbServer.CommUrl + "api/group/group_quiz/notification.php", fd).then(_r => {
               if (_r) {
                  resolve(1);
               } else {
                  resolve(0);
               }
            }).catch(() => { reject(0) });
         });
      });
   }
   public IsGroupReadyData(GroupId: any): Promise<any> {
      return new Promise((resolve, reject) => {
         this.dbServer.GetPropertyAsPromise("userid").then(_uId => {
            let fd = new FormData();
            fd.append("userid", _uId);
            fd.append("groupid", GroupId);
            this.dbServer.PostData(this.dbServer.CommUrl + "api/group/group_quiz/group_info.php", fd).then(_r => {

               if (_r && _r !== 0 && _r !== "0") {
                  resolve(_r);
               } else {
                  resolve(0);
               }
            }).catch(() => { reject(0) });
         });
      });
   }
   public AcceptGroupQuizRequest(MyGroupId): Promise<number> {
      return new Promise((resolve, reject) => {
         this.dbServer.GetPropertyAsPromise("userid").then(_uid => {
            let fd = new FormData();
            fd.append("userid", _uid);
            fd.append("groupid", MyGroupId);
            this.dbServer.PostData(this.dbServer.CommUrl + "api/group/group_quiz/accept_self_notification.php", fd).then(_r => {
               if (_r === "1") {
                  resolve(1);
               } else {
                  resolve(0);
               }
            }).catch(() => { reject(0) });
         });
      });
   }
   public AcceptChallenge(TestId, MyGroupId, SubjectId, TopicId): Promise<number> {
      console.log("MyGroupId: ", MyGroupId);
      return new Promise((resolve, reject) => {
         this.dbServer.GetPropertyAsPromise("std").then(_std => {
            this.dbServer.GetPropertyAsPromise("userId").then(_uId => {
               let fd = new FormData();
               fd.append("userid", _uId);
               fd.append("testid", TestId);
               fd.append("groupid", MyGroupId);
               fd.append("topicid", TopicId);
               fd.append("subid", SubjectId);
               fd.append("std", _std);
               this.dbServer.PostData(this.dbServer.CommUrl + "api/group/group_quiz/accept_group_challenge.php", fd)
                  .then(_r => {
                     console.log("Server Responce: ", _r);
                     if (_r && (_r === 1 || _r === "1")) {
                        resolve(1);
                     } else {
                        resolve(0);
                     }
                  })
                  .catch(() => { reject(); })
            })
               .catch(() => { reject(); });
         });
      })
   }
   public UnDoGroupQuizRequest(MyGroupId): Promise<number> {
      return new Promise((resolve, reject) => {
         this.dbServer.GetPropertyAsPromise("userid").then(_uid => {
            let fd = new FormData();
            fd.append("userid", _uid);
            fd.append("groupid", MyGroupId);
            this.dbServer.PostData(this.dbServer.CommUrl + "api/group/group_quiz/return.php", fd).then(_r => {
               console.log("return: ", _r);
               if (_r === "1") {
                  resolve(1);
               } else {
                  resolve(0);
               }
            }).catch(() => { reject(0) });
         });
      });
   }
   public StartNewChallenge(GroupId, OppGroupId: number): Promise<number> {
      return new Promise((resolve, reject) => {
         this.PrepareDataToGetQuiz(GroupId, OppGroupId).then(fd => {
            this.dbServer.PostData(this.dbServer.CommUrl + "api/group/group_quiz/group_set_notification.php", fd).then(
               _r => {
                  if (_r && !isNaN(_r["testid"]) && _r["testid"] && +_r["testid"] > 0 && _r["testid"] !== "0") {
                     resolve(_r["testid"]);
                  } else {
                     resolve(0);
                  }
               }
            ).catch(() => { reject() });
         });
      })
   }
   private PrepareDataToGetQuiz(GroupId, OppGroupId: number): Promise<FormData> {
      let f = new FormData();
      return new Promise((resolve) => {
         this.dbServer.GetPropertyAsPromise("subid").then(_SubId => {
            let myFd = new FormData();
            myFd.append('userid', localStorage.getItem('userid'));
            myFd.append('std', localStorage.getItem('std'));
            myFd.append('subid', _SubId);
            myFd.append('topicid', localStorage.getItem('topics'));
            myFd.append('groupid', GroupId);
            if(OppGroupId > 0) {
               myFd.append('oppgroupid', OppGroupId.toString());
            }
            setTimeout(() => {
               resolve(myFd);
            }, 500);
         });
      });
   }
   public IsChallengeAccepted(GroupId): Promise<{
      TestId: number, Status: number,
      TopicId: number, Topic: string, SubjectId: number, Subject: string
   }> {
      let resp = { TestId: 0, Status: 0, TopicId: 0, Topic: '', SubjectId: 0, Subject: '' };
      return new Promise((resolve, reject) => {
         let fd = new FormData();
         fd.append("groupid", GroupId);
         this.dbServer.PostData(this.dbServer.CommUrl + "api/group/group_quiz/group_wait.php", fd).then(_r => {
            console.log("_r server: ", _r);

            if (_r && _r !== undefined && _r !== null) {
               resp.TestId = _r["testid"];
               resp.Status = _r["oppstatus"];
               resp.Subject = _r["sub_name"];
               resp.Topic = _r["topic_name"];
               resp.SubjectId = _r["subject"];
               resp.TopicId = _r["topic"];
               resolve(resp);
            } else {
               resolve(resp);
            }
         }).catch(() => { reject(resp) });
      });
   }
   public CheckNotificationsForGroupQuiz(GroupId): Promise<INotification[]> {
      let notifications: INotification[] = [];
      return new Promise((resolve) => {
         let fd = new FormData();
         fd.append("groupid", GroupId);
         this.dbServer.PostData(this.dbServer.CommUrl + "api/group/group_quiz/get_group_challenge.php", fd).then(_r => {
            if (_r && _r !== null && typeof _r !== undefined && _r !== 0 && _r !== '0') {
               var SetNotfn = new Promise((resolve2) => {
                  let newData = _r;
                  let ntfnCounter = 0;
                  for (let i = 0; i < newData.length; i++) {
                     let n = newData[i];

                     if (n["testid"] && n["testid"] !== null && typeof n["testid"] !== undefined && +n["testid"] > 0) {
                        notifications[ntfnCounter] = {} as INotification;
                        notifications[ntfnCounter].Heading = n["group_name"];//Initiated by Group Name
                        notifications[ntfnCounter].SubHeading = n["subject"];//For Your Group
                        notifications[ntfnCounter].Id1 = n["testid"]; //Initiated GroupId
                        notifications[ntfnCounter].Id2 = n["subid"]; //For group id
                        notifications[ntfnCounter].Id3 = n["topicid"]; //For Test Id
                        notifications[ntfnCounter].Message1 = n["topic"];//Subject
                        notifications[ntfnCounter].Message2 = '';//Topic
                        notifications[ntfnCounter].NotificationType = 'groupQuiz';
                        notifications[ntfnCounter].status = 0;
                        notifications[ntfnCounter].MainId = notifications[ntfnCounter].Id1;
                        ntfnCounter++;
                     }
                     if (i === (newData.length - 1)) {
                        resolve2(notifications);
                     }
                  }
               });
               SetNotfn.then(() => {
                  resolve(notifications);
               }).catch(() => { resolve(notifications) });
            } else {
               resolve(notifications);
            }
         },
            error => {
               console.error(error);
               resolve([]);
            });
      });
   }
   //------------------------Quiz intitialized ------------------------
   public GetQuestions(TestId): Promise<IQuestion[]> {
      let question: IQuestion[] = [];
      return new Promise((resolve, reject) => {
         let fd = new FormData();
         fd.append("testid", TestId);
         this.dbServer.PostData(this.dbServer.CommUrl + "api/group/group_quiz/group_set_questions.php", fd).then(data => {
            console.log("Questions", data);
            if (typeof data === undefined || data == 0 || data == '0') {
               resolve(question);
            } else {
               let NewData: any;
               for (let i = 0; i < (data.length); i++) {
                  NewData = data[i].data;
                  question[i] = {} as IQuestion;
                  question[i].id = NewData.question_id;
                  question[i].q = NewData.mcq;
                  question[i].IsImg = NewData.is_image === '1' ? true : false;
                  question[i].subTopicId = NewData.sub_topic;
                  question[i].final_ans = NewData.final_ans;
                  question[i].ideal_time = isNaN(NewData.ideal_time) ? -1 : NewData.ideal_time;
                  let Ans: IAnswers = { A: '', B: '', C: '', D: '', E: '' };
                  Ans.A = typeof NewData.options.a !== undefined && NewData.options.a ? NewData.options.a : '';
                  Ans.B = typeof NewData.options.b !== undefined && NewData.options.b ? NewData.options.b : '';
                  Ans.C = typeof NewData.options.c !== undefined && NewData.options.c ? NewData.options.c : '';
                  Ans.D = typeof NewData.options.d !== undefined && NewData.options.d ? NewData.options.d : '';
                  Ans.E = typeof NewData.options.e !== undefined && NewData.options.e ? NewData.options.e : '';

                  question[i].options = Ans;
                  question[i].given_ans = '1';
                  question[i].time_taken = '';
                  question[i].CssClass = 'normal';
                  question[i].OppAns = '';
                  question[i].OppTime = 0;
               }
               resolve(question);
               return;
            }
         }).catch(() => {
            reject();
         })
      });
   }
   public SendMyResponce(Option: string, TimeTaken: number, qId: number, qIndex: number) {
      this.dbServer.GetPropertyAsPromise("userid").then(_uId => {
         this.dbServer.GetPropertyAsPromise("testId").then(_tId => {
            this.dbServer.GetPropertyAsPromise("std").then(_std => {
               this.shareService.GetValueAsPromise("MyGroupIdForQuiz").then(_GroupId => {
                  let fd = new FormData();
                  fd.append("userid", _uId);
                  fd.append("testid", _tId);
                  fd.append("groupid", _GroupId);
                  fd.append("ans", Option);
                  fd.append("timetaken", TimeTaken.toString());
                  fd.append("std", _std);
                  fd.append("qid", qId.toString());
                  fd.append("qindex", qIndex.toString());
                  console.log("Sending Responce");
                  this.dbServer.PostData(this.dbServer.CommUrl + "api/group/group_quiz/group_get_response.php", fd)
                     .then(d => console.log("Responce Sent: ", d))
                     .catch(e => console.error(e));
               });
            })
         });
      });
   }
   public SubmitAnswer(TimeTaken: string, qId: number, qIndex: number, IsTimeEnd: boolean): Promise<number> {
      return new Promise((resolve, reject) => {
         this.dbServer.GetPropertyAsPromise("userid").then(_uId => {
            this.dbServer.GetPropertyAsPromise("testId").then(_tId => {
               this.shareService.GetValueAsPromise("MyGroupIdForQuiz").then(_GroupId => {
                  let fd = new FormData();
                  fd.append("userid", _uId);
                  fd.append("testid", _tId);
                  fd.append("groupid", _GroupId);
                  //fd.append("option", Option);
                  fd.append("time", TimeTaken);
                  fd.append("qid", qId.toString());
                  fd.append("qindex", qIndex.toString());
                  fd.append("issubmit", IsTimeEnd ? "0" : "1");
                  console.log("Is Ended: ", IsTimeEnd ? "0" : "1");
                  this.dbServer.PostData(this.dbServer.CommUrl + "api/group/group_quiz/group_submit.php", fd)
                     .then(_r => {
                        console.log("Answer Submitted: ", _r);
                        if (_r && (_r === 1 || _r === '1')) {
                           resolve(1);
                        } else {
                           resolve(0);
                        }
                     }).catch((e) => { reject(0); console.log("Answer Submitted Error: ", e); });
               });
            });
         });
      });
   }
   public ShouldShowNexQuestion(QuestionId: number, questionIndex: number): Promise<{ IsResponce: boolean, OppCorrectCount: string, MyCorrectCount: string }> {
      var res = {
         IsResponce: false,
         OppCorrectCount: '',
         MyCorrectCount: ''
      };
      return new Promise((resolve) => {
         this.dbServer.GetPropertyAsPromise("userid").then(_uId => {
            this.shareService.GetValueAsPromise("MyGroupIdForQuiz").then(_GroupId => {
               this.dbServer.GetPropertyAsPromise("testId").then(_tId => {
                  var fd = new FormData();
                  fd.append("userid", _uId);
                  fd.append("testid", _tId);
                  fd.append("groupid", _GroupId);
                  fd.append("qid", QuestionId.toString());
                  fd.append("qindex", questionIndex.toString());
                  this.dbServer.PostData(this.dbServer.CommUrl + "api/group/group_quiz/group_opp_response.php", fd).then(
                     data => {
                        console.log("opp count : ", data);

                        if (data !== null && typeof data !== undefined && +data !== -1) {
                           console.log("data length: ", data.length);
                           res = {
                              IsResponce: true,
                              OppCorrectCount: data["oppcount"],
                              MyCorrectCount: data["mycount"]
                           }
                           resolve(res);
                        } else {
                           resolve(res);
                        }
                     }
                  ).catch(err => { resolve(res); });
               });
            });
         });
      });
   }
   public StopGettingMemberResponce() {
      clearInterval(this.MemberResponceInterval);
   }
   public StartGettingMembersResponces() {
      return new Promise((resolve, reject) => {
         this.dbServer.GetPropertyAsPromise("userid").then(_uId => {
            this.dbServer.GetPropertyAsPromise("testId").then(_tId => {
               this.shareService.GetValueAsPromise("MyGroupIdForQuiz").then(_GroupId => {
                  this.MemberResponceInterval = setInterval(() => {
                     this.GetMembersResponces(_uId, _tId, _GroupId);
                  }, 1000);
               });
            });
         });
      });
   }
   public GetMembersResponces(userId, testId, groupId) {
      return new Promise((resolve, reject) => {
         let mr: IGroupMemberAnswers[] = [];
         this.shareService.GetValueAsPromise("CurrQId").then(_CurrQId => {
            let fd = new FormData();
            fd.append("userid", userId);
            fd.append("testid", testId);
            fd.append("groupid", groupId);
            fd.append("qid", _CurrQId);
            //fd.append("qindex", "0");
            this.dbServer.PostData(this.dbServer.CommUrl + "api/group/group_quiz/members_choosen_ans.php", fd).then(data => {

               if (data && data !== null && data !== undefined && typeof data !== undefined) {
                  let newData = data;
                  localStorage.setItem("is_submit", newData[0]["is_submit"]);
                  let pr = new Promise((ir, ij) => {
                     for (let i = 1; i < newData.length; i++) {
                        let t = newData[i]["data"];
                        let gma: IGroupMemberAnswers = {} as IGroupMemberAnswers;
                        if (t["id"] !== userId) {
                           gma.Id = t["id"];
                           gma.Name = t["name"];
                           gma.PlayerIndex = i;
                           if (t["ans"] && t["ans"] !== null && t["ans"] !== undefined && typeof t["ans"] !== undefined) {
                              gma.Ans = t["ans"].toUpperCase();
                           } else {
                              gma.Ans = "-";
                           }
                           mr.push(gma);
                        }
                        if (i === (newData.length - 1)) {
                           ir();
                        }
                     }
                  });
                  pr.then(() => {
                     this.shareService.SetValue("MemberResponses", mr);
                     resolve();
                  });
               } else {
                  resolve();
               }
            });
         });
      });
   }
   public GetGroupWinner(): Promise<{ MyGroupName: string, MyGroupCount: string, OppGroupName: string, OppGroupCount: string, winner: string }> {
      return new Promise((resolve, reject) => {
         let res = { MyGroupName: '', MyGroupCount: '', OppGroupName: '', OppGroupCount: '', winner: '0' };
         this.dbServer.GetPropertyAsPromise("userid").then(_uId => {
            this.dbServer.GetPropertyAsPromise("testId").then(_tId => {
               this.shareService.GetValueAsPromise("MyGroupIdForQuiz").then(_GroupId => {
                  let fd = new FormData();
                  fd.append("testid", _tId);
                  fd.append("groupid", _GroupId);
                  this.dbServer.PostData(this.dbServer.CommUrl + "api/group/group_quiz/group_report.php", fd).then(() => {
                     this.dbServer.PostData(this.dbServer.CommUrl + "api/group/group_quiz/group_result.php", fd).then(data => {
                        if (data && data !== null && typeof data !== undefined && data !== undefined) {
                           res.MyGroupCount = data["self_count"];
                           res.MyGroupName = data["self_groupName"];
                           res.OppGroupCount = data["opp_count"];
                           res.OppGroupName = data["opp_groupName"];
                           res.winner = data["winner"];
                        }
                        resolve(res);
                     }).catch(() => {reject()});
                  }).catch(() => {reject()});
               });
            });
         });
      });
   }
   public GetQuizSummary() : Promise<any>{
      return new Promise((resolve, reject) => {
         let res: any;
         this.dbServer.GetPropertyAsPromise("userid").then(_uId => {
            this.dbServer.GetPropertyAsPromise("testId").then(_tId => {
               this.dbServer.GetPropertyAsPromise("topics").then(_tpc => {
                  this.dbServer.GetPropertyAsPromise("std").then(_std => {
                     this.shareService.GetValueAsPromise("MyGroupIdForQuiz").then(_GroupId => {
                        let fd = new FormData();
                        fd.append("testid", _tId);
                        fd.append("groupid", _GroupId);
                        fd.append("topic", _tpc);
                        fd.append("std", _std);
                        this.dbServer.PostData(this.dbServer.CommUrl + "api/group/group_quiz/group_scoreboard.php", fd).then(data => {
                           console.log("GroupSummaryData : ", data)
                           if (data && data !== null && typeof data !== undefined && data !== undefined) {
                              res = data;
                           }
                           resolve(res);
                        }).catch(() => {reject()});
                     });
                  });
               });
            });
         });
      });
   }
}
