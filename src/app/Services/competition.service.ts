import { Injectable } from '@angular/core';
import { IQuestion, ServerService, IAnswers, INotification, IDuration, ISubject, IDashboard, IHistory } from './server.service';
import { ShareValuesService } from './share-values.service';
import { IGroupMemberAnswers, IGroupQuizSummary } from './AllInterfaces';
import { promise } from 'protractor';

@Injectable({
   providedIn: 'root'
})
export class CompetitionService {
   public MemberResponceInterval: any;
   public IsAlertShown = false;
   public CommUrl: string = 'https://sarmicrosystems.in/quiztest/';
   public RequestAlert: any;

   constructor(private dbServer: ServerService, public shareService: ShareValuesService) { }

   public GetCompetitionSubjects() {
      const d = new FormData();
      console.log("std = ", localStorage.getItem('std'));
      d.append("std", localStorage.getItem('std'));
      return new Promise((resolve, reject) => {
          this.dbServer.PostData(this.CommUrl + "api/competition/get_subject.php", d).then( //get_subject
              data => {
                  var sub: ISubject[] = new Array();
                  if (data && typeof data !== undefined && data != null) {
                      for (let i = 0; i < data.length; i++) {
                          sub[i] = {} as ISubject;
                          sub[i].id = data[i]['id'];
                          sub[i].name = data[i]['subject'];
                      }
                  }
                  console.log("Subjects : ", data);
                  resolve(sub);
              },
              error => {
                  console.error(error);
              }
          );
      });
  }
 

   public GetDuration() {
      const d = new FormData();
      return new Promise((resolve, reject) => {
          this.dbServer.GetData(this.CommUrl + "api/competition/get_duration.php").then( //get_subject
              data => {
                  var duration: IDuration[] = new Array();
                  if (data && typeof data !== undefined && data != null) {
                      for (let i = 0; i < data.length; i++) {
                          duration[i] = {} as IDuration;
                          duration[i].id = data[i]['id'];
                          duration[i].duration = data[i]['duration'];
                          duration[i].amount = data[i]['amount'];
                          duration[i].order = data[i]['type'];
                      }
                  }
                  console.log("Duration : ", data);
                  resolve(duration);
              },
              error => {
                  console.error(error);
              }
          );
      });
  }
 
  public GetCompetitionTestId(againstId, levelId, friendId): Promise<IQuestion[]> {
   console.log("a = ", againstId);
   console.log("l = ", levelId);
   console.log("friendId = ", friendId);
   let link = 'initiate.php';
   var question: IQuestion[] = [];
   return new Promise((resolve, reject) => {
       this.PrepareDataToGetCompetition(againstId, levelId, friendId).then(fd => {
           console.log("fd : ", fd);
           this.dbServer.PostData(this.CommUrl + 'api/competition/' + link, fd).then(
               data => {
                   console.log("Data", data);
                   if (typeof data == undefined && !data && data == 0) {
                       console.log("INVALID");
                       resolve(question);
                   } else {
                      
                       localStorage.setItem("CompetitionTestId", data);
                       console.log("Competition Test Id: ", data);
                       resolve(question);
                   }
               },
               error => { console.error(error); reject(error);}
           ).catch((e) => {console.error(e); reject(e);});
       });
   });
}

  public GetCompetition(): Promise<IQuestion[]> {
   console.log("CompetitionTestId = ", localStorage.getItem("CompetitionTestId"));

   let link = 'set_questions.php?testid='+localStorage.getItem("CompetitionTestId");
   var question: IQuestion[] = [];
   return new Promise((resolve, reject) => {
           this.dbServer.GetData(this.CommUrl + 'api/competition/' + link).then(
               data => {
                   console.log("Data", data);
                   if (typeof data == undefined && !data && data == 0) {
                       console.log("INVALID");
                       resolve(question);
                   } else {
                       let NewData: any;
                       console.log(data.length)
                       for (let i = 0; i < (data.length); i++) {
                           NewData = data[i].data;
                           question[i] = {} as IQuestion;
                           question[i].id = NewData.question_id;
                           question[i].q = NewData.mcq;
                           question[i].IsImg = NewData.is_image==='1'?true:false;
                           question[i].subTopicId = NewData.sub_topic;
                           question[i].final_ans = NewData.final_ans;
                           question[i].ideal_time = isNaN(NewData.ideal_time) ? -1 : NewData.ideal_time;
                           let Ans: IAnswers = { A: '', B: '', C: '', D: '', E: '' };
                           Ans.A = typeof NewData.options.a !== undefined && NewData.options.a ? NewData.options.a : '';
                           Ans.B = typeof NewData.options.b !== undefined && NewData.options.b ? NewData.options.b : '';
                           Ans.C = typeof NewData.options.c !== undefined && NewData.options.c ? NewData.options.c : '';
                           Ans.D = typeof NewData.options.d !== undefined && NewData.options.d ? NewData.options.d : '';
                           Ans.E = typeof NewData.options.e !== undefined && NewData.options.e ? NewData.options.e : '';
                           //if(NewData.)
                           //question[i].OppAns = NewData.
                           question[i].options = Ans;
                           question[i].given_ans = '';
                           question[i].time_taken = '';
                           question[i].CssClass = 'normal';
                       }
                       
                       resolve(question);
                   }
               },
               error => { console.error(error); reject(error);}
           ).catch((e) => {console.error(e); reject(e);});
      
   });
}

PrepareDataToGetCompetition(againstId, levelId, friendId): Promise<FormData> {
   let f = new FormData();
   f.append("test", "Mytest");
   console.log(f);
   return new Promise((resolve) => {
       this.dbServer.GetPropertyAsPromise("subid").then(_SubId => {
           console.log("subId : ", _SubId);
           let myFd = new FormData();
           myFd.append('p1', localStorage.getItem('userid'));
           myFd.append('p2', 'AI');
           myFd.append('topicid', localStorage.getItem('CompetitionTopics'));
           console.log(localStorage.getItem('CompetitionTopics'));
           setTimeout(() => {
               resolve(myFd);
           }, 500);
       });
   });
}


public GetDashboardData(): Promise<IHistory[]> {
    let link = '/api/competition/history.php';
    return new Promise((resolve) => {
        this.dbServer.GetPropertyAsPromise('userid').then(_uid => {
            const fd = new FormData();
            fd.append('userid', _uid);
            this.dbServer.PostData(this.CommUrl + link, fd).then(
                data => {
                    console.log(data);
                    const newData: IHistory[] = [];
                    if (data && data !== '2' && data !== 2 && data.length) {
                        for (let i = 0; i < data.length; i++) {
                            newData[i] = {} as IHistory;
                            let d: any;

                                d = data[i]; // data[i]["data"];
                                  newData[i]['p2'] = 'VP';
                                 
                            
                            newData[i]['p1_correct_count'] = d['p1'];
                            newData[i]['p2_correct_count'] = d['p2'];
                            if ((d['p1'] === d['p2']) && (d['p2'] === 0 || d['p2'] === '0')) {
                                newData[i]['player_won'] = ''
                            } else {
                                if (d['p1'] <d['p2']) {
                                newData[i]['player_won'] = 'player2';
                                    }else{
                                        newData[i]['player_won'] = 'player1'; 
                                    }
                            }
                            newData[i]['created_at'] = d['created_at'];
                            newData[i]['Topic_name'] = d['name'];
                        }
                    }
                    setTimeout(() => {
                        resolve(newData);
                    }, 1000);
                },
                error => {
                    console.error(error);
                    resolve(null);
                }
            );
        });
    });
}


public LeaderBoardFilter(): Promise<IDashboard[]> {

 
    return new Promise((resolve) => {
        this.dbServer.GetPropertyAsPromise('std').then(_std => {
            this.dbServer.GetPropertyAsPromise('userid').then(_uid => {
                console.log(' User Id: '+ _uid );
                const fd = new FormData();
                fd.append('userid', _uid);
              
                let link = 'competition/leaderboard.php?userid='+_uid;
   
                             console.log('Link : ', link);

                const NewData: IDashboard[] = [];
                this.dbServer.PostData(this.CommUrl + 'api/' + link, fd).then(
                    data => {
                        console.log(data);
                        if (data !== 0) {
                            if (data && Object.keys(data).length > 0) {
                                let index = 0;
                                for (let i = 0; i < Object.keys(data).length; i++) {
                                    const d = data[i];
                                    if (d) {
                                        NewData[index] = {} as IDashboard;
                                        NewData[index].p2 = d['name'];
                                        NewData[index].p2_correct_count = d['total'];
                                        index++;
                                    }
                                }
                                setTimeout(() => {
                                    resolve(NewData);
                                }, 1000);
                            }
                        } else {
                            resolve(NewData);
                        }
                    },
                    error => {
                        console.error(error);
                        resolve(null);
                    }
                );
            });
        });
    });
}

public GeProfileDetail() {
    const user: ICompetitionUser = {} as ICompetitionUser;
    console.log("userid = ", localStorage.getItem('userid'));
    var d = "userid="+localStorage.getItem('userid')
    return new Promise((resolve, reject) => {
        this.dbServer.GetData(this.CommUrl + "api/competition/get_user_profile.php?"+ d).then( //get_subject
            data => {
                let NewData = data['data'];
                        console.log(NewData);
                        if (NewData !== null) {
                            user.id = NewData['competetion_id'];
                            user.subjects_name = NewData['subjects_name'];
                            user.subscription_id = NewData['subscription_id'];
                            user.duration = NewData['duration'];
                            user.amount = NewData['amount'];
                            user.duration_type = NewData['duration_type'];
                            user.competetion_updated_at = NewData['competetion_updated_at'];
                            user.competetion_created_at = NewData['competetion_created_at'];
                            user.competetion_expiry_date =NewData['competetion_expiry_date']
                            localStorage.setItem('refCode', NewData['refCode']);
                        }
                        setTimeout(() => {
                            resolve(user);
                        }, 100);
            },
            error => {
                console.error(error);
            }
        );
    });
}


public GetPaymentData(): Promise<IPayment[]> {
    let link = '/api/competition/get_payment_detail.php';
    return new Promise((resolve) => {
        this.dbServer.GetPropertyAsPromise('userid').then(_uid => {
            const fd = new FormData();
            fd.append('userid', _uid);
            this.dbServer.PostData(this.CommUrl + link, fd).then(
                data => {
                    console.log(data);
                    const newData: IPayment[] = [];
                    if (data && data !== '2' && data !== 2 && data.length) {
                        for (let i = 0; i < data.length; i++) {
                            newData[i] = {} as IPayment;
                            let d: any;
                            d = data[i];
                            newData[i]['duration'] = d['duration'];
                            newData[i]['amount'] = d['amount'];
                            newData[i]['mode'] = d['mode'];
                            newData[i]['old_plan_name'] = d['old_plan_name'];
                            newData[i]['created_at'] = d['created_at'];
                            newData[i]['expiry_date'] = d['expiry_date'];
                            newData[i]['status'] = d['status'];
                            newData[i]['days'] = 0;
                        }
                    }
                    setTimeout(() => {
                        resolve(newData);
                    }, 1000);
                },
                error => {
                    console.error(error);
                    resolve(null);
                }
            );
        });
    });
}



public checkQuizValidation(){
    let link = 'api/competition/new_quiz_count.php';
    return new Promise((resolve) => {
        this.dbServer.GetPropertyAsPromise('userid').then(_uid => {
            const fd = new FormData();
            fd.append('userid', _uid);
            this.dbServer.PostData(this.CommUrl + link, fd).then(
                data => {
                    console.log(data);
                   
                    setTimeout(() => {
                        resolve(data);
                    }, 1000);
                },
                error => {
                    console.error(error);
                    resolve(null);
                }
            );
        });
    });

}

}
export interface ICompetitionUser {
    id: string;
    competetion_created_at: string;
    competetion_updated_at: string;
    competetion_expiry_date:string;
    subjects_name: string;
    subscription_id: string;
    duration: string;
    amount: number;
    duration_type: number;
}

export interface IPayment {
    duration: string; // Oppgroupname
    amount: number;
    mode: number;
    created_at: string;
    expiry_date: string;
    old_plan_name: number
    status: string
    days: number
}