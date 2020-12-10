import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Network } from '@ionic-native/network/ngx';
// import { Observable } from 'rxjs';
// import { resolve } from 'url';
// import { promise } from 'protractor';
import { AlertController } from '@ionic/angular';
import { ErrorPopupService } from './error-popup.service';
import { CurrencyPipe } from '@angular/common';
// import { link } from 'fs';
// import { type, userInfo } from 'os';

@Injectable({
    providedIn: 'root'
})


export class ServerService {
    constructor(private http: HttpClient, public alertCtrl: AlertController, public errPop: ErrorPopupService) {
    }
    public IsAlertShown = false;
    public CommUrl = 'https://sarmicrosystems.in/quiztest/';
    public RequestAlert: any;
    private l: any;
    public async ShowAlert(alrtMsg: string) {
        this.RequestAlert = await this.alertCtrl.create(
            {
                header: alrtMsg,
                buttons: [{
                    text: 'Okay',
                    handler: () => {
                        // this.IsAlertShown = false;
                    }
                }
                ]
            }
        );
        this.RequestAlert.present();
    }
    public SetMeOnline() {
        let fd = new FormData();
        this.GetPropertyAsPromise('userid').then(_uid => {
            fd.append('userid', _uid);
            fd.append('status', '1');
            this.PostData(this.CommUrl + 'api/online.php', fd);
        });
    }
    public SetMeOffline() {
        let fd = new FormData();
        this.GetPropertyAsPromise('userid').then(_uid => {
            fd.append('userid', _uid);
            fd.append('status', '2');
            this.PostData(this.CommUrl + 'api/online.php', fd);
        });
    }
    public LeaderBoardFilter(DurationId, SubjectId, FilterType: string): Promise<IDashboard[]> {

        let link = 'filter/filter.php';
        if (FilterType === 'friends') {
            link = 'filter/filter_friend.php';
        }
        console.log('Link : ', link);

        return new Promise((resolve) => {
            this.GetPropertyAsPromise('std').then(_std => {
                this.GetPropertyAsPromise('userid').then(_uid => {
                    console.log('DurationId : ' + DurationId + ' SubjectId : ' + SubjectId + ' User Id: '+ _uid +' std: '+ +_std);
                    const fd = new FormData();
                    fd.append('userid', _uid);
                    fd.append('std', _std);
                    fd.append('durationid', DurationId);
                    fd.append('subjectid', SubjectId);
                    const NewData: IDashboard[] = [];
                    this.PostData(this.CommUrl + 'api/' + link, fd).then(
                        data => {
                            console.log(data);
                            if (data !== 'No Records !') {
                                if (data && Object.keys(data).length > 0) {
                                    let index = 0;
                                    for (let i = 0; i < Object.keys(data).length; i++) {
                                        const d = data[i];
                                        if (d) {
                                            NewData[index] = {} as IDashboard;
                                            NewData[index].p2 = d['name'];
                                            NewData[index].p2_correct_count = d['points'];
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
    public GetLeaderboard(): Promise<IDashboard[]> {
        return new Promise((resolve) => {
            this.GetPropertyAsPromise('userid').then(_uid => {
                const fd = new FormData();
                fd.append('userid', _uid);
                this.PostData(this.CommUrl + 'api/ai/leader.php', fd).then(
                    data => {
                        console.log(data);
                        if (data && data.length > 0) {
                            const NewData: IDashboard[] = [];
                            for (let i = 0; i < data.length; i++) {
                                NewData[i] = {} as IDashboard;
                                const d = data[i];
                                // d["id"];
                                NewData[i].p2 = d['name'];
                                NewData[i].p2_correct_count = d['points'];
                            }
                            setTimeout(() => {
                                resolve(NewData);
                            }, 1000);
                        }
                    },
                    error => {
                        console.error(error);
                        resolve(null);
                    }
                );
            });
        });
    }
    public GetSubjects() {
        const d = new FormData();
        console.log('std = ', localStorage.getItem('std'));
        d.append('std', localStorage.getItem('std'));
        return new Promise((resolve, reject) => {
            this.PostData(this.CommUrl + 'api/get_subject.php', d).then( // get_subject
                data => {
                    let sub: ISubject[] = new Array();
                    if (data && typeof data !== undefined && data != null) {
                        for (let i = 0; i < data.length; i++) {
                            sub[i] = {} as ISubject;
                            sub[i].id = data[i].id;
                            sub[i].name = data[i].sub;
                        }
                    }
                    console.log('Subjects : ', data);
                    resolve(sub);
                },
                error => {
                    console.error(error);
                }
            );
        });
    }


    public GetTopics(SubjectId: number) {
        const d = new FormData();
        console.log('Subject ID: ', SubjectId);
        d.append('sub', SubjectId.toString());
        return new Promise((resolve, reject) => {
            this.PostData(this.CommUrl + 'api/get_topics.php', d).then( // get_subject
                data => {
                    console.log('Topics : ', data);
                    let sub: ISubject[] = new Array();
                    for (let i = 0; i < data.length; i++) {
                        sub[i] = {} as ISubject;
                        sub[i].id = data[i].id;
                        sub[i].name = data[i].name;
                    }
                    // console.log("After : ", sub);
                    resolve(sub);
                },
                error => {
                    console.error(error);
                }
            );
        });
    }
    public test() {
        const fd = new FormData();
        fd.append('test_id', '111');
        this.PostData(this.CommUrl + 'api/get_response.php', fd).then(data => {
            console.log(data);
        });
    }
    PrepareDataToGetQuiz(againstId, levelId, friendId): Promise<FormData> {
        const f = new FormData();
        f.append('test', 'Mytest');
        console.log(f);
        return new Promise((resolve) => {
            this.GetPropertyAsPromise('subid').then(_SubId => {
                console.log('subId : ', _SubId);
                const myFd = new FormData();
                myFd.append('userid', localStorage.getItem('userid'));
                myFd.append('stdid', localStorage.getItem('std'));
                myFd.append('topicid', localStorage.getItem('topics'));
                myFd.append('against', againstId);
                myFd.append('level', levelId);
                myFd.append('friendid', friendId);
                myFd.append('sub', _SubId);
                console.log(localStorage.getItem('topics'));
                setTimeout(() => {
                    resolve(myFd);
                }, 500);
            });
        });
    }
    public GetExams(againstId, levelId, friendId): Promise<IQuestion[]> {
        console.log('a = ', againstId);
        console.log('l = ', levelId);
        console.log('friendId = ', friendId);
        const link = 'get_questions.php';
        let question: IQuestion[] = [];
        return new Promise((resolve, reject) => {
            this.PrepareDataToGetQuiz(againstId, levelId, friendId).then(fd => {
                console.log('fd : ', fd);
                this.PostData(this.CommUrl + 'api/ai/' + link, fd).then(
                    data => {
                        console.log('Data', data);
                        if (typeof data == undefined && !data && data == 0) {
                            console.log('INVALID');
                            resolve(question);
                        } else {
                            let NewData: any;
                            for (let i = 0; i < (data.length - 1); i++) {
                                NewData = data[i].data;
                                question[i] = {} as IQuestion;
                                question[i].id = NewData.id;
                                question[i].q = NewData.mcq;
                                question[i].IsImg = NewData.is_image === '1' ? true : false;
                                question[i].subTopicId = NewData.sub_topic;
                                question[i].final_ans = NewData.final_ans;
                                question[i].ideal_time = isNaN(NewData.ideal_time) ? -1 : NewData.ideal_time;
                                const Ans: IAnswers = { A: '', B: '', C: '', D: '', E: '' };
                                Ans.A = typeof NewData.options.a !== undefined && NewData.options.a ? NewData.options.a : '';
                                Ans.B = typeof NewData.options.b !== undefined && NewData.options.b ? NewData.options.b : '';
                                Ans.C = typeof NewData.options.c !== undefined && NewData.options.c ? NewData.options.c : '';
                                Ans.D = typeof NewData.options.d !== undefined && NewData.options.d ? NewData.options.d : '';
                                Ans.E = typeof NewData.options.e !== undefined && NewData.options.e ? NewData.options.e : '';
                                // if(NewData.)
                                // question[i].OppAns = NewData.
                                question[i].options = Ans;
                                question[i].given_ans = '';
                                question[i].time_taken = '';
                                question[i].CssClass = 'normal';
                            }
                            localStorage.setItem('testId', data[(data.length - 1)].testid);
                            console.log('test Id: ', data[(data.length - 1)].testid);

                            resolve(question);
                        }
                    },
                    error => { console.error(error); reject(error); }
                ).catch((e) => {console.error(e); reject(e); });
            });
        });
    }
    public GetTwoPlayerExam(againstId, friendId, testId): Promise<IQuestion[]> {
        console.log('a = ', againstId);
        let link = 'like_minded/get_questions.php';
        if (againstId == 2) {
            link = 'player/get_questions.php';
        } else if (againstId == 3) {
            link = 'like_minded/get_questions.php';
        }
        let question: IQuestion[] = [];
        return new Promise((resolve, reject) => {
            this.PrepareDataToGetQuiz(againstId, 0, friendId).then(fd => {
                fd.append('friendId', friendId);
                fd.append('testid', testId);
                console.log('friendId', friendId);
                this.LogFormData(fd);
                this.PostData(this.CommUrl + 'api/' + link, fd).then(
                    data => {
                        console.log('Data', data);
                        if (typeof data === undefined || data == 0 || data == '0') {
                            console.log('INVALID');
                            resolve(question);
                        } else {
                            let NewData: any;
                            this.SetProperty('OppName', data[0]['oppname']);
                            for (let i = 0; i < (data.length - 1); i++) {
                                NewData = data[i + 1].data;
                                question[i] = {} as IQuestion;
                                question[i].id = NewData.question_id;
                                question[i].q = NewData.mcq;
                                question[i].IsImg = NewData.is_image === '1' ? true : false;
                                question[i].subTopicId = NewData.sub_topic;
                                question[i].final_ans = NewData.final_ans;
                                question[i].ideal_time = isNaN(NewData.ideal_time) ? -1 : NewData.ideal_time;
                                const Ans: IAnswers = { A: '', B: '', C: '', D: '', E: '' };
                                Ans.A = typeof NewData.options.a !== undefined && NewData.options.a ? NewData.options.a : '';
                                Ans.B = typeof NewData.options.b !== undefined && NewData.options.b ? NewData.options.b : '';
                                Ans.C = typeof NewData.options.c !== undefined && NewData.options.c ? NewData.options.c : '';
                                Ans.D = typeof NewData.options.d !== undefined && NewData.options.d ? NewData.options.d : '';
                                Ans.E = typeof NewData.options.e !== undefined && NewData.options.e ? NewData.options.e : '';
                                // if(NewData.)
                                // question[i].OppAns = NewData.
                                question[i].options = Ans;
                                question[i].given_ans = '1';
                                question[i].time_taken = '';
                                question[i].CssClass = 'normal';
                                question[i].OppAns = '';
                                question[i].OppTime = 0;
                            }
                            // localStorage.setItem("testId", data[(data.length-1)].testid);
                            // console.log("test Id: ", data[(data.length-1)].testid);

                            resolve(question);
                        }
                    }
                );
            }).catch((e) => reject(e));
        });
    }
    public GetLikemindedAIExams(TestIdForRematch, MatchType): Promise<IQuestion[]> {
        let question: IQuestion[] = [];
        let ServerLink = 'ai_player/send_ai.php';
        return new Promise((resolve) => {
            const pr = new Promise((resolve) => {
                this.GetPropertyAsPromise('subid').then(_SubId => {
                    const myFd = new FormData();
                    myFd.append('userid', localStorage.getItem('userid'));
                    myFd.append('stdid', localStorage.getItem('std'));
                    myFd.append('topicid', localStorage.getItem('topics'));
                    myFd.append('sub', _SubId);
                    if (MatchType === '2') {
                        console.log('TestIdForRematch : ', TestIdForRematch);
                        myFd.append('id', TestIdForRematch);
                        ServerLink = 'ai_player/receive_ai.php';
                    } else {
                        myFd.append('testid', TestIdForRematch);
                    }
                    setTimeout(() => {
                        resolve(myFd);
                    }, 500);
                });
            });
            pr.then(fd => {
                this.PostData(this.CommUrl + 'api/' + ServerLink, fd).then(
                    data => {
                        console.log('Data', data);
                        if (typeof data == undefined && !data && data == 0) {
                            console.log('INVALID');
                            resolve(question);
                        } else {
                            let NewData: any;
                            this.SetProperty('OppName', data[0]['oppname']);
                            for (let i = 0; i < (data.length - 2); i++) {
                                console.log(data[i + 1]);

                                NewData = data[i + 1].data;
                                question[i] = {} as IQuestion;
                                question[i].id = NewData.id;
                                question[i].q = NewData.mcq;
                                question[i].IsImg = NewData.is_image === '1' ? true : false;
                                question[i].subTopicId = NewData.sub_topic;
                                question[i].final_ans = NewData.final_ans;
                                question[i].ideal_time = isNaN(NewData.ideal_time) ? -1 : NewData.ideal_time;
                                const Ans: IAnswers = { A: '', B: '', C: '', D: '', E: '' };
                                Ans.A = typeof NewData.options.a !== undefined && NewData.options.a ? NewData.options.a : '';
                                Ans.B = typeof NewData.options.b !== undefined && NewData.options.b ? NewData.options.b : '';
                                Ans.C = typeof NewData.options.c !== undefined && NewData.options.c ? NewData.options.c : '';
                                Ans.D = typeof NewData.options.d !== undefined && NewData.options.d ? NewData.options.d : '';
                                Ans.E = typeof NewData.options.e !== undefined && NewData.options.e ? NewData.options.e : '';

                                question[i].options = Ans;
                                question[i].given_ans = '';
                                question[i].time_taken = '';
                                question[i].CssClass = 'normal';
                            }
                            localStorage.setItem('testId', data[(data.length - 1)].testid);
                            console.log('test Id: ', data[(data.length - 1)].testid);

                            resolve(question);
                        }
                    },
                    error => console.error(error)
                ).catch((e) => {console.error(e);});
            });
        });
    }
    private CreateEndExamObject(AllQuestionsData: IQuestion[]): Promise<any> {
        return new Promise((resolve) => {
            let allData: any[] = [];
            for (let i = 0; i < AllQuestionsData.length; i++) {
                allData.push({
                    qid: AllQuestionsData[i].id,
                    sub_topic: AllQuestionsData[i].subTopicId,
                    final_ans: AllQuestionsData[i].final_ans,
                    ans: AllQuestionsData[i].given_ans,
                    time: AllQuestionsData[i].time_taken,
                    opp_ans: AllQuestionsData[i].OppAns,
                    OppTime: AllQuestionsData[i].OppTime
                });
            }
            resolve(allData);
        });
    }
    public EndExam(All: IQuestion[], IsAIForLikeMinded: boolean) {
        let ServerLink = 'api/ai/100.php';
        if (IsAIForLikeMinded) {
            ServerLink = 'api/ai_player/send_ai_result.php';
        }
        const fd = new FormData();
        const topicId = localStorage.getItem('topics');
        this.CreateEndExamObject(All).then(res => {
            console.log('Sending response : ', res);
            this.GetPropertyAsPromise('userid').then(ui => {
                this.GetPropertyAsPromise('testId').then(tId => {
                    console.log('UserId', ui);
                    console.log('testId : ', tId);

                    // fd.append("userid", ui);
                    fd.append('topic', topicId);
                    fd.append('testid', tId);
                    fd.append('response', JSON.stringify(res));

                    setTimeout(() => {
                        this.PostData(this.CommUrl + ServerLink, fd).then(
                            data => {
                                console.log(data);
                                this.ProvideEndExamLoop(tId);
                            },
                            error => {
                                console.error(error);
                                this.ProvideEndExamLoop(tId);
                            }
                        );
                    }, 1000);
                });
            });
        });
    }
    private ProvideEndExamLoop(testId: any) {
        const fd = new FormData();
        fd.append('testid', testId);
        this.PostData(this.CommUrl + 'api/ai/ai_result.php', fd).then(() => {
            this.PostData(this.CommUrl + 'api/ai/ai_result.php', fd).then(data => {
                console.log('end result:', data);
            });
        });
    }
    public GetWinner(): Promise<any> {
        let isSuccess = false;
        return new Promise((resolve) => {
            for (let i = 0; i < 3; i++) {
                this.GetPropertyAsPromise('testId').then(tId => {
                    const fd = new FormData();
                    fd.append('testid', tId);
                    this.PostData(this.CommUrl + 'api/ai/100.php', fd).then(
                        data => {
                            console.log(data);
                            if (data.winner && data.winner !== null && typeof data.winner !== undefined) {
                                isSuccess = true;
                                resolve(data);

                            }
                        },
                        error => console.error(error)
                    );
                });
                if (isSuccess) { break; }
            }
        });
    }
    public SendRematchRequest(): Promise<number> {
        const fd = new FormData();
        return new Promise((resolve, reject) => {
            this.GetPropertyAsPromise('userid').then(_uId => {
                this.GetPropertyAsPromise('std').then(_std => {
                    this.GetPropertyAsPromise('testId').then(_tId => {
                        this.GetPropertyAsPromise('topics').then(_Topic => {
                            this.GetPropertyAsPromise('subid').then(_sub => {
                                this.GetPropertyAsPromise('AgainstId').then(_againstId => {
                                    fd.append('userid', _uId);
                                    fd.append('previous_testid', _tId);
                                    fd.append('topic', _Topic);
                                    fd.append('std', _std);
                                    fd.append('sub', _sub);
                                    fd.append('quiz_type', _againstId);
                                    this.PostData(this.CommUrl + 'api/rematch/rematch.php', fd).then(
                                        _data => {
                                            console.log('Rematch: ', _data);
                                            console.log('NewTestId: ', _data['data']['testid']);
                                            if (_data && _data['data']['testid'] && _data['data']['testid'] > 0) {
                                                console.log('inside Server if');
                                                localStorage.setItem('testId', _data['data']['testid']);
                                                resolve(1);
                                            } else {
                                                resolve(0);
                                            }
                                        }
                                    ).catch(() => {reject();});
                                });
                            });
                        });
                    });
                });
            });
        });
    }
    public IsRematchRequestAccepted(): Promise<any> {
        return new Promise((resolve, reject) => {
            this.GetPropertyAsPromise('testId').then(_tId => {
                const fd = new FormData();
                fd.append('testid', _tId);
                this.PostData(this.CommUrl + 'api/rematch/rematch_isaccept.php', fd).then(
                    _r => {
                        console.log('IsAccepted:', _r);

                        if (_r && _r === '1') {
                            resolve(1);
                        } else if (_r === '2') {
                            resolve(2);
                        } else {
                            resolve(0);
                        }
                    }
                );
            });
        });
    }
    public ResponceToRematchRequest(TestId: number, responce: number): Promise<any> {
        return new Promise((resolve, reject) => {
            this.GetPropertyAsPromise('userid').then(_uId => {
                const fd = new FormData();
                fd.append('userid', _uId);
                fd.append('testid', TestId.toString());
                fd.append('isaccept', responce.toString());
                console.log('isaccept', responce.toString());

                this.PostData(this.CommUrl + 'api/rematch/rematch_response.php', fd).then(
                    _r => {
                        console.log(_r);

                        if (_r && _r > 0) {
                            console.log('inside if');
                            resolve(1);
                        } else {
                            resolve(0);
                        }
                    }
                ).catch(() => {reject();});
            });
        });
    }
    /*public SendQuizRequestToFriends(): Promise<number> {
        console.log("Sending request");
        return new Promise((resolve) => {
            let myFd = new FormData();
            myFd.append('player1', localStorage.getItem('userid'));
            myFd.append('stdid', localStorage.getItem('std'));
            myFd.append('topicid', localStorage.getItem('topics'));
            myFd.append('subid', localStorage.getItem('subid'));
            setTimeout(() => {
                this.PostData(this.CommUrl + "api/player/player.php", myFd).then(
                    data => {
                        console.log("Request sent : ", data);
                        if (data && typeof data !== undefined && data !== null) {
                            myFd.append("testid", data.testid);
                            setTimeout(() => {
                                this.PostData(this.CommUrl + 'api/player/set_questions.php', myFd)
                                    .then(data => console.log("echo: ", data),
                                        error => console.error("echo : ", error)

                                    );
                            }, 500);
                            setTimeout(() => {
                                this.PostData(this.CommUrl + 'api/player/set_questions.php', myFd);
                            }, 2500);
                            resolve(data.testid);
                        } else {
                            resolve(0);
                        }
                        //resolve(data);
                        //localStorage.setItem("testId", data);
                    },
                    error => {
                        console.error(error);
                        resolve(0);
                    }
                );
            }, 2000);
        });
    }*/
    public SendQuizRequestToFriends(FriendId): Promise<number> {
        console.log('Sending request');
        let link = 'player.php';
        if (+FriendId > 0) {
            link = 'specific_friend.php';
        }
        return new Promise((resolve) => {
            const myFd = new FormData();

            myFd.append('player1', localStorage.getItem('userid'));
            myFd.append('friend_id', FriendId);
            myFd.append('stdid', localStorage.getItem('std'));
            myFd.append('topicid', localStorage.getItem('topics'));
            myFd.append('subid', localStorage.getItem('subid'));
            setTimeout(() => {
                this.PostDataForSingleTry(this.CommUrl + 'api/player/'+ link, myFd).then(
                    data => {
                        console.log('Request sent : ', data);
                        if (data && typeof data !== undefined && data !== null) {
                            myFd.append('testid', data.testid);
                            setTimeout(() => {
                                this.PostData(this.CommUrl + 'api/player/set_questions.php', myFd)
                                    .then(data => console.log('echo: ', data),
                                        error => console.error('echo : ', error)
                                    );
                            }, 500);
                            resolve(data.testid);
                        } else {
                            resolve(0);
                        }
                        // resolve(data);
                        // localStorage.setItem("testId", data);
                    },
                    error => {
                        console.error(error);
                        resolve(0);
                    }
                );
            }, 2000);
        });
    }
    public SendQuizRequestToLikeMinded(): Promise<number> {
        console.log('Sending request');
        return new Promise((resolve) => {
            const myFd = new FormData();
            myFd.append('player1', localStorage.getItem('userid'));
            myFd.append('stdid', localStorage.getItem('std'));
            myFd.append('topicid', localStorage.getItem('topics'));
            myFd.append('subid', localStorage.getItem('subid'));
            setTimeout(() => {
                this.PostData(this.CommUrl + 'api/like_minded/like_minded.php', myFd).then(
                    data => {
                        console.log('Request sent : ', data);
                        if (data && typeof data !== undefined && data !== null) {
                            myFd.append('testid', data.testid);
                            setTimeout(() => {
                                this.PostData(this.CommUrl + 'api/like_minded/set_questions.php', myFd)
                                    .then(data => console.log('echo: ', data),
                                        error => console.error('echo : ', error)

                                    );
                            }, 500);
                            setTimeout(() => {
                                this.PostData(this.CommUrl + 'api/like_minded/set_questions.php', myFd);
                            }, 2500);
                            resolve(data.testid);
                        } else {
                            resolve(0);
                        }
                        // resolve(data);
                        // localStorage.setItem("testId", data);
                    },
                    error => {
                        console.error(error);
                        resolve(0);
                    }
                );
            }, 2000);
        });
    }
    public RejectNotification(_tId: any) {
        return new Promise((resolve) => {
            this.GetPropertyAsPromise('userid').then(
                _uId => {
                    const fd = new FormData();
                    fd.append('userid', _uId);
                    fd.append('testid', _tId);
                    this.PostData(this.CommUrl + 'api/like_minded/reject.php', fd).then(() => {
                        resolve();
                    });
                }
            );
        });
    }
    public RejectNotificationForFriend(_tId: any) {
        return new Promise((resolve) => {
            this.GetPropertyAsPromise('userid').then(
                _uId => {
                    const fd = new FormData();
                    fd.append('userid', _uId);
                    fd.append('testid', _tId);
                    this.PostData(this.CommUrl + 'api/player/reject.php', fd).then(() => {
                        resolve();
                    });
                }
            );
        });
    }
    public RejectNotificationForGroupQuiz(GroupId: any) {
        return new Promise((resolve) => {
            this.GetPropertyAsPromise('userid').then(
                _uId => {
                    const fd = new FormData();
                    fd.append('userid', _uId);
                    fd.append('groupid', GroupId);
                    this.PostData(this.CommUrl + 'api/group/group_quiz/reject_self_notification.php', fd).then(() => {
                        resolve();
                    });
                }
            );
        });
    }
    public AcceptGroupJoinRequest(GroupId: number): Promise<number> {
        const link = 'group/group_accept.php';
        return new Promise((resolve) => {
            const fd = new FormData();
            this.GetPropertyAsPromise('userid').then(_uid => {
                fd.append('userid', _uid);
                fd.append('groupid', GroupId.toString());
                this.PostData(this.CommUrl + 'api/' + link, fd).then(
                    data => {
                        console.log('responce group : ', data);
                        if (data && typeof data !== undefined && data !== null && (data === 1 || data === '1')) {
                            resolve(1);
                        } else {
                            resolve(0);
                        }
                    },
                    error => {
                        console.error(error);
                        resolve(0);
                    }
                );
            });
        });
    }
    public AcceptQuizRequest(testId: number, against: number): Promise<number> {
        let link = 'like_minded/incoming_request.php';
        if (against == 2) {
            link = 'player/incoming_request.php';
        } else if (against == 3) {
            link = 'like_minded/incoming_request.php';
        }
        return new Promise((resolve) => {
            const fd = new FormData();
            this.GetPropertyAsPromise('userid').then(_uid => {
                fd.append('userid', _uid);
                fd.append('testid', testId.toString());
                console.log('Sending... TestId: ' + testId + ', UserId: ' + _uid);
                this.PostData(this.CommUrl + 'api/' + link, fd).then(
                    data => {
                        console.log('responce : ', data);

                        if (data && typeof data !== undefined && data !== null && (data === 11 || data === '11')) {
                            resolve(1);
                        } else {
                            resolve(0);
                        }
                    },
                    error => {
                        console.error(error);
                        resolve(0);
                    }
                );
            });
        });
    }
    public AssignNotification(data: any, type): Promise<INotification[]> {
        const notifications: INotification[] = [];
        return new Promise((resolve) => {
            if (data && data !== null && data !== 0 && data !== '0' && typeof data !== undefined) {
                const newData = data;
                let ntfnCounter = 0;
                for (let i = 0; i < newData.length; i++) {
                    const n = newData[i]['data'];

                    if (n['groupid'] && n['groupid'] !== null && typeof n['groupid'] !== undefined && +n['groupid'] > 0) {
                        notifications[ntfnCounter] = {} as INotification;
                        notifications[ntfnCounter].Heading = n['player1_name'];
                        notifications[ntfnCounter].Id1 = n['groupid'];
                        notifications[ntfnCounter].SubHeading = n['group_name'];
                        notifications[ntfnCounter].NotificationType = 'joingroup';
                        notifications[ntfnCounter].status = 0;
                        notifications[ntfnCounter].MainId = notifications[ntfnCounter].Id1;
                        ntfnCounter++;
                    }
                    if (i === (newData.length - 1)) {
                        resolve(notifications);
                    }
                }
            }
        });
    }
    public notificationsAll(): Promise<INotification[]> {
        let NotificationsMix: INotification[] = [];
        let index = 0;
        return new Promise((resolve) => {
            const Is1Complete = new Promise((resolve1) => this.CheckForNewNotificationsLikeMinded().then((Not1: INotification[]) => { resolve1(Not1); }));
            const Is2Complete = new Promise((resolve2) => this.CheckForNewNotificationsForFriends().then((Not2: INotification[]) => { resolve2(Not2); }));
            const Is3Complete = new Promise((resolve3) => this.CheckNotificationsForJoinGroup().then((Not3: INotification[]) => { resolve3(Not3); }));
            const Is4Complete = new Promise((resolve4) => this.CheckNotificationsForGroupQuiz().then((Not4: INotification[]) => { resolve4(Not4); }));
            const Is5Complete = new Promise((resolve5) => this.CheckNotificationsForRematch().then((Not5: INotification[]) => { resolve5(Not5); }));
            const Is6Complete = new Promise((resolve6) => this.CheckForNewNotificationsLikeMindedAI().then((Not6: INotification[]) => { resolve6(Not6); }));
            Is1Complete.then((_n1: INotification[]) => {
                Is2Complete.then((_n2: INotification[]) => {
                    Is3Complete.then((_n3: INotification[]) => {
                        Is4Complete.then((_n4: INotification[]) => {
                            Is5Complete.then((_n5: INotification[]) => {
                                Is6Complete.then((_n6: INotification[]) => {
                                    const fp1 = new Promise((fpr1) => {
                                        if (_n1.length === 0) {
                                            fpr1();
                                        }
                                        for (let i = 0; i < _n1.length; i++) {
                                            NotificationsMix[index] = _n1[i];
                                            index++;
                                            if (i == (_n1.length - 1)) {
                                                fpr1();
                                            }
                                        }
                                    });

                                    fp1.then(() => {
                                        const fp2 = new Promise((fpr2) => {
                                            if (_n2.length === 0) {
                                                fpr2();
                                            }
                                            for (let i = 0; i < _n2.length; i++) {
                                                NotificationsMix[index] = _n2[i];
                                                index++;
                                                if (i == (_n2.length - 1)) {
                                                    fpr2();
                                                }
                                            }
                                        });
                                        fp2.then(() => {
                                            const fp3 = new Promise((fpr3) => {
                                                if (_n3.length === 0) {
                                                    fpr3();
                                                }
                                                for (let i = 0; i < _n3.length; i++) {
                                                    NotificationsMix[index] = _n3[i];
                                                    index++;
                                                    if (i == (_n3.length - 1)) {
                                                        fpr3();
                                                    }
                                                }
                                            });
                                            fp3.then(() => {
                                                const fp4 = new Promise((fpr4) => {
                                                    if (_n4.length === 0) {
                                                        fpr4();
                                                    }
                                                    for (let i = 0; i < _n4.length; i++) {
                                                        NotificationsMix[index] = _n4[i];
                                                        index++;
                                                        if (i == (_n4.length - 1)) {
                                                            fpr4();
                                                        }
                                                    }
                                                });
                                                fp4.then(() => {
                                                    const fp5 = new Promise((fpr5) => {
                                                        if (_n5.length === 0) {
                                                            fpr5();
                                                        }
                                                        for (let i = 0; i < _n5.length; i++) {
                                                            NotificationsMix[index] = _n5[i];
                                                            index++;
                                                            if (i == (_n5.length - 1)) {
                                                                fpr5();
                                                            }
                                                        }
                                                    });
                                                    fp5.then(() => {
                                                        const fp6 = new Promise((fpr6) => {
                                                            if (_n6.length === 0) {
                                                                fpr6();
                                                            }
                                                            for (let i = 0; i < _n6.length; i++) {
                                                                NotificationsMix[index] = _n6[i];
                                                                index++;
                                                                if (i == (_n6.length - 1)) {
                                                                    fpr6();
                                                                }
                                                            }
                                                        });
                                                        fp6.then(() => {
                                                            resolve(NotificationsMix);
                                                        });
                                                    });
                                                });
                                            });
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });
    }
    public CheckForNewNotificationsLikeMinded(): Promise<INotification[]> {
        const notifications: INotification[] = [];
        return new Promise((resolve) => {
            this.GetPropertyAsPromise('userid').then(_uid => {
                const fd = new FormData();
                fd.append('player2', _uid);
                this.PostDataForSingleTry(this.CommUrl + 'api/like_minded/notification.php', fd).then(
                    data => {
                        if (data && data !== null && data !== 0 && data !== '0' && typeof data !== undefined) {
                            const newData = data;
                            let ntfnCounter = 0;
                            for (let i = 0; i < newData.length; i++) {
                                const n = newData[i];
                                if (n['testid'] && n['testid'] !== null && typeof n['testid'] !== undefined) {
                                    notifications[ntfnCounter] = {} as INotification;
                                    notifications[ntfnCounter].Id1 = n['player1'];
                                    notifications[ntfnCounter].Heading = n['player1_name'];
                                    notifications[ntfnCounter].Id2 = n['testid'];
                                    notifications[ntfnCounter].Message1 = n['subject'];
                                    notifications[ntfnCounter].Message2 = n['topic'];
                                    notifications[ntfnCounter].NotificationType = n['notification'] == 'Like Minded' ? '3' : '2';
                                    notifications[ntfnCounter].status = 0;
                                    notifications[ntfnCounter].MainId = notifications[ntfnCounter].Id2;
                                    ntfnCounter++;
                                }
                            }
                        }
                        setTimeout(() => {
                            resolve(notifications);
                        }, 1000);
                    },
                    error => {
                        // console.error(error);
                        resolve(notifications);
                    }

                );
            });
        });
    }
    public CheckForNewNotificationsLikeMindedAI(): Promise<INotification[]> {
        const notifications: INotification[] = [];
        return new Promise((resolve) => {
            this.GetPropertyAsPromise('userid').then(_uid => {
                const fd = new FormData();
                fd.append('player2', _uid);
                this.PostDataForSingleTry(this.CommUrl + 'api/ai_player/get_notification.php', fd).then(
                    data => {
                        if (data && data !== null && data !== 0 && data !== '0' && typeof data !== undefined) {
                            const newData = data;
                            let ntfnCounter = 0;
                            const n = newData;
                            notifications[ntfnCounter] = {} as INotification;
                            notifications[ntfnCounter].Id1 = n['player1'];
                            notifications[ntfnCounter].Heading = n['player1_name'];
                            notifications[ntfnCounter].Id2 = n['id'];
                            notifications[ntfnCounter].Message1 = n['subject'];
                            notifications[ntfnCounter].Message2 = n['topic'];
                            notifications[ntfnCounter].NotificationType = n['notification'] == 'AI Notification' ? '5' : '2';
                            notifications[ntfnCounter].status = 0;
                            notifications[ntfnCounter].MainId = notifications[ntfnCounter].Id2;
                            ntfnCounter++;

                        }
                        setTimeout(() => {
                            resolve(notifications);
                        }, 1000);
                    },
                    error => {
                        // console.error(error);
                        resolve(notifications);
                    }

                );
            });
        });
    }
    public CheckForNewNotificationsForFriends(): Promise<INotification[]> {
        const notifications: INotification[] = [];
        return new Promise((resolve) => {
            this.GetPropertyAsPromise('userid').then(_uid => {
                const fd = new FormData();
                fd.append('player2', _uid);
                this.PostDataForSingleTry(this.CommUrl + 'api/player/notification.php', fd).then(
                    data => {
                        // console.log("Notifications Friends : ", data);

                        if (data && data !== null && data !== 0 && data !== '0' && typeof data !== undefined) {
                            const newData = data;
                            let ntfnCounter = 0;
                            for (let i = 0; i < newData.length; i++) {
                                const n = newData[i];
                                if (n['testid'] && n['testid'] !== null && typeof n['testid'] !== undefined && +n['testid'] > 0) {
                                    notifications[ntfnCounter] = {} as INotification;

                                    notifications[ntfnCounter].Id1 = n['player1'];
                                    notifications[ntfnCounter].Heading = n['player1_name'];
                                    notifications[ntfnCounter].Id2 = n['testid'];
                                    notifications[ntfnCounter].Message1 = n['subject'];
                                    notifications[ntfnCounter].Message2 = n['topic'];
                                    notifications[ntfnCounter].NotificationType = n['notification'] == 'friend' ? '2' : '3';
                                    notifications[ntfnCounter].status = 0;
                                    notifications[ntfnCounter].MainId = notifications[ntfnCounter].Id2;
                                    ntfnCounter++;
                                }
                            }
                        }
                        setTimeout(() => {
                            resolve(notifications);
                        }, 1000);
                    },
                    error => {
                        // console.error(error);
                        resolve(notifications);
                    }

                );
            });
        });
    }
    public CheckNotificationsForJoinGroup(): Promise<INotification[]> {
        let n: INotification[] = [];
        return new Promise((resolve) => {
            this.GetPropertyAsPromise('userid').then(_uId => {
                const fd = new FormData();
                fd.append('userid', _uId);
                this.PostDataForSingleTry(this.CommUrl + 'api/group/group_notification.php', fd).then(_r => {
                    // console.log("Group join ntfn", _r);
                    if (_r && _r !== null && typeof _r !== undefined) {
                        this.AssignNotification(_r, 3).then(
                            ntfn => {
                                n = ntfn;
                            }
                        ).catch(() => { resolve(n); });
                    }
                    setTimeout(() => {
                        resolve(n);
                    }, 1000);
                },
                error => {
                    // console.error(error);
                    resolve(n);
                });
            });
        });
    }
    public CheckNotificationsForGroupQuiz(): Promise<INotification[]> {
        const notifications: INotification[] = [];
        return new Promise((resolve) => {
            this.GetPropertyAsPromise('userid').then(_uId => {
                const fd = new FormData();
                fd.append('userid', _uId);
                this.PostDataForSingleTry(this.CommUrl + 'api/group/group_quiz/get_self_notification.php', fd).then(_r => {
                    // console.log(_r);
                    if (_r && _r !== null && typeof _r !== undefined && _r !== 0 && _r !== '0') {
                        let SetNotfn = new Promise((resolve2) => {
                                const newData = _r;
                                let ntfnCounter = 0;
                                for (let i = 0; i < newData.length; i++) {
                                    const n = newData[i];

                                    if (n['groupid'] && n['groupid'] !== null && typeof n['groupid'] !== undefined && +n['groupid'] > 0) {
                                        notifications[ntfnCounter] = {} as INotification;
                                        notifications[ntfnCounter].Heading = n['created_by']; // Initiated by Group Name
                                        notifications[ntfnCounter].SubHeading = n['group_name']; // For Your Group
                                        notifications[ntfnCounter].Id1 = n['groupid']; // Initiated GroupId
                                        notifications[ntfnCounter].Id2 = 0; // For group id
                                        notifications[ntfnCounter].Id3 = 0; // For Test Id
                                        notifications[ntfnCounter].Message1 = ''; // Subject
                                        notifications[ntfnCounter].Message2 = ''; // Topic
                                        notifications[ntfnCounter].NotificationType = 'groupReady';
                                        notifications[ntfnCounter].status = 0;
                                        notifications[ntfnCounter].MainId = notifications[ntfnCounter].Id1;
                                        ntfnCounter++;
                                    }
                                    if (i === (newData.length - 1)) {
                                        resolve2(notifications);
                                    }
                                }

                        });
                        SetNotfn.then(() => {resolve;}).catch(() => { resolve(notifications); });
                    }
                    setTimeout(() => {
                        resolve(notifications);
                    }, 1000);
                },
                error => {
                    // console.error(error);
                    resolve([]);
                });
            });
        });
    }
    public CheckNotificationsForRematch(): Promise<INotification[]> {
        const notifications: INotification[] = [];
        return new Promise((resolve) => {
            this.GetPropertyAsPromise('userid').then(_uId => {
                const fd = new FormData();
                fd.append('userid', _uId);
                this.PostDataForSingleTry(this.CommUrl + 'api/rematch/rematch_notification.php', fd).then(_r => {
                    if (_r && _r !== null && typeof _r !== undefined && _r !== 0 && _r !== '0') {
                        // console.log("rematch ntfn: ", _r);

                        let SetNotfn = new Promise((resolve2) => {
                                const newData = _r;
                                let ntfnCounter = 0;
                                // for (let i = 0; i < newData.length; i++) {
                                let n = newData['data'];

                                if (n['testid'] && n['testid'] !== null && typeof n['testid'] !== undefined && +n['testid'] > 0) {
                                        notifications[ntfnCounter] = {} as INotification;
                                        notifications[ntfnCounter].Heading = ''; // Initiated by Group Name
                                        notifications[ntfnCounter].SubHeading = ''; // For Your Group
                                        notifications[ntfnCounter].Id1 = n['testid'] ; // Initiated GroupId
                                        notifications[ntfnCounter].Id2 = n['quiz_type']; // For group id
                                        notifications[ntfnCounter].Id3 =  n['oppid']; // For Test Id
                                        notifications[ntfnCounter].Message1 = ''; // Subject
                                        notifications[ntfnCounter].Message2 = ''; // Topic
                                        notifications[ntfnCounter].NotificationType = 'rematch';
                                        notifications[ntfnCounter].status = 0;
                                        notifications[ntfnCounter].MainId = notifications[ntfnCounter].Id3;
                                        ntfnCounter++;
                                    // }
                                        setTimeout(() => {
                                        resolve2(notifications);
                                    }, 200);
                                }

                        });
                        SetNotfn.then(() => {resolve(notifications);}).catch(() => { resolve(notifications); });
                    }
                    setTimeout(() => {
                        resolve(notifications);
                    }, 1000);
                },
                error => {
                    // console.error(error);
                    resolve([]);
                });
            });
        });
    }
    public GetOnlineFriends() {
        setTimeout(() => {
            let u = [
                { id: '2', name: 'abc', pictude: '' },
                { id: '3', name: 'pqrs', pictude: '' },
                { id: '4', name: 'pqrs xyz sdfj jsbd', pictude: '' }
            ];
            return u;
        }, 2000);
    }
    IsUsernameAvailable(email: string, UserName: string) {
        let formData = new FormData();
        formData.append('emailid', email);
        formData.append('username', UserName);
        // return this.PostData(this.CommUrl+'https://sarmicrosystems.in/quiztest/checkpg.php', formData);
    }
    public GetDashboardData(SubjectId, HistoryType): Promise<IDashboard[]> {
        let link = 'api/ai/history.php';
        if (HistoryType === 'AI') {
            link = 'api/ai/history.php';
        } else if (HistoryType === 'overall') {
            link = 'api/history/overall.php';
        } else if (HistoryType === 'friends') {
            link = 'api/history/friends.php';
        } else if (HistoryType === 'groups') {
            link = 'api/history/group.php';
        }
        return new Promise((resolve) => {
            this.GetPropertyAsPromise('userid').then(_uid => {
                const fd = new FormData();
                fd.append('userid', _uid);
                fd.append('subid', SubjectId);
                this.PostData(this.CommUrl + link, fd).then(
                    data => {
                        console.log(data);
                    
                    const newData: IDashboard[] = [];
                       if(data != 0){
                        if (data && data !== '2' && data !== 2 && data.length) {
                            for (let i = 0; i < data.length; i++) {
                                newData[i] = {} as IDashboard;
                                let d: any;

                                if (HistoryType === 'groups') {
                                    d = data[i];
                                    newData[i].OppGroupId = d['oppgroup'];
                                    newData[i]['p2'] = d['oppGroupName'];
                                    newData[i].MyGroupId = d['mygroup'];
                                    newData[i].Mygroupname = d['myGroupName'];
                                } else {
                                    d = data[i]; // data[i]["data"];
                                    if (d['p2'] === 'AI') {
                                        newData[i]['p2'] = 'VP';
                                    } else {
                                        newData[i]['p2'] = d['name'];
                                    }
                                }
                                newData[i]['p1_correct_count'] = d['p1_correct_count'];
                                newData[i]['p2_correct_count'] = d['p2_correct_count'];
                                if ((d['p1_correct_count'] === d['p2_correct_count']) && (d['p2_correct_count'] === 0 || d['p2_correct_count'] === '0')) {
                                    newData[i]['player_won'] = ''
                                } else {
                                    newData[i]['player_won'] = d['player_won'];
                                }
                                newData[i]['created_at'] = d['date'];
                                newData[i]['sub_name'] = d['subject'];
                                newData[i]['Topic_name'] = d['topic'];
                                
                            }
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
    public Register(data: FormData) {
        // return this.PostData('https://sarmicrosystems.in/quiztest/signup_process.php', data);
    }
    login(userid, pwd) {
        // var l={name: '', email: '', picture: '', loggedIn: 0};
        let d = new FormData();
        d.append('email', userid);
        d.append('pwd', pwd);
        return this.PostData(this.CommUrl + 'process_login.php', d);
        /*return new Promise((resolve, reject)=>{
            if(data.email === "example@email.com" && data.password === "123456"){
                l={name: 'Example', email: 'example@email.com', picture: 'http://www.studiomob.ca/StudioMobCA.hyperesources/surface2.png', loggedIn: 1};
                resolve(l);
            } else{
                resolve(l);
            }
        });*/
    }
    checkCompetitionRegistration(userid) {
        // var l={name: '', email: '', picture: '', loggedIn: 0};
        let d = new FormData();
        d.append('userid', userid);
        return this.PostData(this.CommUrl + 'api/competition/check_user.php', d);
        /*return new Promise((resolve, reject)=>{
            if(data.email === "example@email.com" && data.password === "123456"){
                l={name: 'Example', email: 'example@email.com', picture: 'http://www.studiomob.ca/StudioMobCA.hyperesources/surface2.png', loggedIn: 1};
                resolve(l);
            } else{
                resolve(l);
            }
        });*/
    }
    public SendTwoPlayerAnswer(against: number, QId: number, Option: string, TimeTaken: string): Promise<number> {
        let Link = 'like_minded/get_answer.php';
        if (against == 2) {
            Link = 'player/get_answer.php';
        } else if (against == 3) {
            Link = 'like_minded/get_answer.php';
        }
        return new Promise((resolve, reject) => {
            this.GetPropertyAsPromise('userid').then(
                _uid => {
                    this.GetPropertyAsPromise('testId').then(
                        _tId => {
                            this.GetPropertyAsPromise('std').then(_std => {
                                console.log('time taken: ', TimeTaken);
                                let fd = new FormData();
                                fd.append('userid', _uid);
                                fd.append('testid', _tId);
                                fd.append('qid', QId.toString());
                                fd.append('ans', Option);
                                fd.append('timetaken', TimeTaken);
                                fd.append('std', _std);
                                this.PostData(this.CommUrl + 'api/' + Link, fd).then(
                                    data => {
                                        if (data && data !== null && typeof data !== undefined) {
                                            resolve(1);
                                        } else {
                                            resolve(0);
                                        }
                                    }
                                ).catch(error => { reject(error); });

                            });
                        }
                    );
                }
            );
        });
    }
    public ShouldShowNexQuestion(QuestionId: number): Promise<{ IsResponce: boolean, OppCorrectCount: string }> {
        let res = {
            IsResponce: false,
            OppCorrectCount: ''
        };
        return new Promise((resolve) => {
            this.GetPropertyAsPromise('userid').then(_uId => {
                this.GetPropertyAsPromise('testId').then(_tId => {
                    let fd = new FormData();
                    fd.append('userid', _uId);
                    fd.append('testid', _tId);
                    fd.append('qid', QuestionId.toString());
                    this.PostData(this.CommUrl + 'api/like_minded/get_opposition_response.php', fd).then(
                        data => {
                            console.log('opp count : ', data);

                            if (data !== null && typeof data !== undefined && +data > -1) {
                                res = {
                                    IsResponce: true,
                                    OppCorrectCount: data
                                };
                                resolve(res);
                            } else {
                                resolve(res);
                            }
                        }
                    ).catch(err => { resolve(res); });
                });
            });
        });
    }
    public Get2PlayerWinner(): Promise<{
        winnerid: string,
        oppid: string, oppname: string, oppPercentage: number, MyPercentage: number,
        Questions: IQuestion[]
    }> {
        let res = {
            winnerid: '',
            oppid: '', oppname: '', oppPercentage: 0, MyPercentage: 0,
            Questions: [] as IQuestion[]
        };
        return new Promise((resolve) => {
            this.GetPropertyAsPromise('AgainstId').then(_against => {
                let link1 = 'like_minded/result.php';
                let link2 = 'like_minded/report.php';

                if (_against == '2') {
                    link1 = 'player/result.php';
                    link2 = 'player/report.php';
                } else if (_against == '3') {
                    link1 = 'like_minded/result.php';
                    link2 = 'like_minded/report.php';
                } else if (_against == '5') {
                    link1 = 'ai_player/send_ai_result.php';
                    link2 = 'ai_player/send_ai_report.php';
                }
                this.GetPropertyAsPromise('userid').then(_uid => {
                    this.GetPropertyAsPromise('testId').then(_tid => {

                        const fd = new FormData();
                        fd.append('userid', _uid);
                        fd.append('testid', _tid);
                        // this.PostData(this.CommUrl + "api/" + link1, fd).then(_e => {
                        console.log('getting result, _tid : ', _tid, ', Uid: ', _uid);
                            // setTimeout(() => {
                        this.PostData(this.CommUrl + 'api/' + link2, fd).then(data => {
                                    console.log(data);

                                    if (data !== null && typeof data !== undefined && data) {
                                        const NewData = data[0];
                                        console.log('NewData : ', NewData);

                                        res.winnerid = NewData['winnerid'];
                                        res.oppname = NewData['oppname'];
                                        res.oppid = NewData['oppid'];
                                        res.oppPercentage = NewData['opp_percentage'];
                                        res.MyPercentage = NewData['my_percentage'];
                                        let fp = new Promise((resolve2) => {
                                            for (let i = 1; i < data.length; i++) {
                                                let _Questions = data[i]['data'];
                                                res.Questions[i - 1] = {} as IQuestion;
                                                res.Questions[i - 1].q = _Questions['mcq'];
                                                res.Questions[i - 1].IsImg = _Questions['is_img'];
                                                res.Questions[i - 1].final_ans_string = _Questions['ans_string'];
                                                res.Questions[i - 1].final_ans = _Questions['ans'];
                                                res.Questions[i - 1].given_ans = _Questions['my_ans'];
                                                res.Questions[i - 1].OppAns = _Questions['opp_ans'];
                                                if (i == (data.length - 1)) {
                                                    resolve2(1);
                                                }
                                            }
                                        });
                                        fp.then(() => {
                                            resolve(res);
                                        });
                                    }
                                });
                            // }, 2000);
                        /* }).catch(() => {
                            console.log("error");
                        }); */
                    });
                });
            });
        });
    }
    public async Generate2PlayerResult(): Promise<any> {
        return new Promise((resolve, reject) => {
            console.log('generateResult');
            this.GetPropertyAsPromise('AgainstId').then(_against => {
                console.log('Generate2PlayerResult()');
                let link1 = 'like_minded/result.php';

                if (_against == '2') {
                    link1 = 'player/result.php';
                } else if (_against == '3') {
                    link1 = 'like_minded/result.php';
                } else if (_against == '5') {
                    link1 = 'ai_player/send_ai_result.php';
                }
                this.GetPropertyAsPromise('userid').then(_uid => {
                    this.GetPropertyAsPromise('testId').then(_tid => {
                        const fd = new FormData();
                        fd.append('userid', _uid);
                        fd.append('testid', _tid);
                        this.PostData(this.CommUrl + 'api/' + link1, fd).then(_e => {
                            console.log('Generate2PlayerResult() Resolved');
                            resolve();
                        }).catch(() => {
                            console.log('error');
                            reject();
                        });
                    });
                });
            });
        });
    }
    public GetMyProfile(): Promise<IUser> {
        return new Promise((resolve) => {
            const user: IUser = {} as IUser;
            /*user.userName = "kdnptl";//data[""];
            user.fname = "Kundan";//data[""];
            user.lname = "Patil";//data[""];
            user.email = "kdnptl@gmail.com";// data[""];
            user.mobile = 9321021211;//data[""];
            user.picture = "";//data[""];
            user.schoolName = "";//data[""];
            user.std = 8;//data[""];
            resolve(user);*/
            this.GetPropertyAsPromise('userid').then(_uid => {
                const fd = new FormData();
                fd.append('userid', _uid);
                console.log('userid', _uid);
                this.PostData(this.CommUrl + 'api/account/show_account.php', fd).then(
                    data => {
                        let NewData = data['data'];
                        console.log(NewData['fname']);
                        if (NewData !== null && typeof NewData !== undefined && NewData) {
                            user.userName = NewData['email'];
                            user.fname = NewData['fname'];
                            user.lname = NewData['lname'];
                            user.email = NewData['email'];
                            user.mobile = 0; // data[""];
                            user.picture = NewData['avatar'];
                            user.schoolName = NewData['school'];
                            user.std = NewData['class'];
                            localStorage.setItem('refCode', NewData['refCode']);
                        }
                        setTimeout(() => {
                            resolve(user);
                        }, 100);
                    }
                ).catch(() => {});
            });
        });
    }
    public DoesGroupExists(GroupName: string): Promise<number> {
        const fd = new FormData();
        fd.append('group_name', GroupName);
        console.log(GroupName);

        return new Promise((resolve, reject) => {
            this.PostData(this.CommUrl + 'api/group/group_is_exist.php', fd).then(_r => {
                console.log('Status : ', _r);

                if (_r != null && typeof _r != undefined) {
                    if (_r === 'exists') {
                        resolve(1);
                    } else {
                        resolve(0);
                    }
                }
            }).catch(() => reject(0));
        });
    }
    public SendJoinRequestToAllFrnds(GroupName: string) {
        return new Promise((resolve) => {
            this.GetPropertyAsPromise('userid').then(_uId => {
                const fd = new FormData();
                fd.append('userid', _uId);
                fd.append('groupname', GroupName);
                this.PostData(this.CommUrl + '', fd).then(_r => {
                    if (_r != null && typeof _r != undefined) {
                        if (_r == 'success') {
                            resolve(1);
                        } else if (_r == 'exists') {
                            resolve(2);
                        } else {
                            resolve(0);
                        }
                    }
                });
            });
        });
    }
    public GetAllFriends(): Promise<IUser[]> {
        const frnds: IUser[] = [];
        return new Promise((resolve) => {
            this.GetPropertyAsPromise('userid').then(_uId => {
                const fd = new FormData();
                fd.append('userid', _uId);
                this.PostData(this.CommUrl + 'api/group/group_get_all_friend.php', fd).then(data => {
                    console.log('Data', data);
                    let pr = new Promise((resolve2, reject) => {
                        if (data != null && typeof data != undefined) {
                            if (data.length > 0) {
                                for (let i = 0; i < data.length; i++) {
                                    const d = data[i]['data'];
                                    frnds[i] = {} as IUser;
                                    frnds[i].id = d['friend_id'];
                                    frnds[i].fname = d['name'];
                                    frnds[i].std = d['class'];
                                    frnds[i].schoolName = d['school'];
                                    frnds[i].picture = d['avatar'];
                                    if (i === (data.length - 1)) {
                                        resolve2();
                                    }
                                }
                            } else { resolve2(); }
                        } else { resolve2(); }
                    });
                    pr.then(() => { console.log('frnds : ', frnds); resolve(frnds); });
                });
            });
        });
    }
    public async SearchPlayer(SearchText: string): Promise<IUser[]> {
        const frnds: IUser[] = [];
        return new Promise(async (resolve) => {
            const std = await this.GetPropertyAsPromise('std');
            this.GetPropertyAsPromise('userid').then(_uId => {
                const fd = new FormData();
                fd.append('userid', _uId);
                fd.append('class', std);
                fd.append('name', SearchText);
                this.PostData(this.CommUrl + 'api/friend/search_friend.php', fd).then(data => {
                    console.log('Data', data);
                    let pr = new Promise((resolve2, reject) => {
                        if (data != null && typeof data != undefined) {
                            if (data.length > 0) {
                                for (let i = 0; i < data.length; i++) {
                                    const d = data[i]['data'];
                                    frnds[i] = {} as IUser;
                                    frnds[i].id = d['id'];
                                    frnds[i].fname = d['name'];
                                    frnds[i].std = d['class'];
                                    frnds[i].schoolName = d['school'];
                                    frnds[i].picture = d['avatar'];
                                    if (i === (data.length - 1)) {
                                        resolve2();
                                    }
                                }
                            } else { resolve2(); }
                        } else { resolve2(); }
                    });
                    pr.then(() => { console.log('frnds : ', frnds); resolve(frnds); });
                }).catch(() => {});
            });
        });
    }
    public SendFriendRequest(PLayerId): Promise<number> {
        return new Promise((resolve, reject) => {

        });
    }
    public Unfriend(PlayerId): Promise<number> {
        return new Promise((resolve, reject) => {
            this.GetPropertyAsPromise('userid').then(_uId => {
                const fd = new FormData();
                fd.append('userid', _uId);
                fd.append('friendid', PlayerId);
                this.PostData(this.CommUrl +'api/friend/unfriend.php', fd).then(_d => {
                    if (_d === 1 || _d ==='1') {
                        resolve(1);
                    } else {
                        resolve(0);
                    }
                }).catch(() => {reject(0);});
            });
        });
    }
    public CreateGroup(GroupName: string, FriendsId: number[], JoiningType: number): Promise<number> {
        return new Promise((resolve, reject) => {
            this.GetPropertyAsPromise('userid').then(
                _uId => {
                    console.log(JSON.stringify(FriendsId));

                    let link = 'group_create.php';
                    const fd = new FormData();
                    fd.append('userid', _uId);
                    fd.append('group_name', GroupName);
                    if (JoiningType === 1) {
                        fd.append('group_members', JSON.stringify(FriendsId));
                        link = 'group_create.php';
                    } else {
                        link = 'group_create_join_req.php';
                    }
                    this.PostData(this.CommUrl + 'api/group/' + link, fd).then(
                        _r => {
                            console.log('Responce : ', _r);
                            if (_r && _r !== null && typeof _r !== undefined && _r === 'success') {
                                resolve(1);
                            } else {
                                resolve(0);
                            }

                        }
                    );
                }
            ).catch(() => { reject(); });
        });
    }
    public UpdateGroup(GroupId: string, FriendsId: number[]): Promise<number> {
        return new Promise((resolve, reject) => {
            this.GetPropertyAsPromise('userid').then(
                _uId => {
                    const link = '';
                    const fd = new FormData();
                    fd.append('userid', _uId);
                    fd.append('groupid', GroupId);
                    fd.append('group_members', JSON.stringify(FriendsId));
                    this.PostData(this.CommUrl + 'api/group/group_create.php' + link, fd).then(
                        _r => {
                            console.log('Responce : ', _r);
                            if (_r && _r !== null && typeof _r !== undefined && _r === 'success') {
                                resolve(1);
                            } else {
                                resolve(0);
                            }

                        }
                    );
                }
            ).catch(() => { reject(); });
        });
    }
    public RejectGroupJoinRequest(GroupId: number): Promise<number> {
        return new Promise((resolve, reject) => {
            this.GetPropertyAsPromise('userid').then(_uId => {

                const fd = new FormData();
                fd.append('groupid', GroupId.toString());
                fd.append('userid', _uId);
                this.PostData(this.CommUrl + 'api/group/group_reject.php', fd).then(_r => {
                    if (_r && _r !== null && typeof _r !== undefined && _r === 'success') {
                        resolve(1);
                    } else {
                        resolve(0);
                    }
                }).catch(() => {reject(0);});
            });
        });
    }
    public GetAllGroups() {
        return new Promise((resolve, reject) => {
            this.GetPropertyAsPromise('userid').then(_uId => {
                const fd = new FormData();
                fd.append('userid', _uId);
                this.PostData(this.CommUrl + 'api/group/group_info.php', fd).then(
                    data => {
                        console.log('Groups: ', data);
                        resolve(data);
                    }
                );
            }).catch(() => {reject(); });
        });
    }
    public SearchGroups(SearchText: string, MyGroupId: number) {
        return new Promise((resolve, reject) => {
            const fd = new FormData();
            fd.append('groupid', MyGroupId.toString());
            fd.append('group_name', SearchText);
            this.PostData(this.CommUrl + 'api/group/group_quiz/specific_group.php', fd).then(
                data => {
                    console.log('Groups Search: ', data);
                    resolve(data);
                }
            ).catch(() => {reject();});
        });
    }
    public DeleteGroup(GroupId): Promise<number> {
        console.log(GroupId);

        return new Promise((resolve, reject) => {
            this.GetPropertyAsPromise('userid').then(_uId => {
                const fd = new FormData();
                fd.append('userid', _uId);
                fd.append('groupid', GroupId);
                this.PostData(this.CommUrl + 'api/group/group_delete.php', fd).then(_r => {
                    console.log('_r', _r);

                    if (_r && _r !== null && typeof _r !== undefined) {
                        resolve(1);
                    } else {
                        resolve(0);
                    }
                }).catch(() => {reject();});
            });
        });
    }
    public GroupRemoveMember(GroupId, MemberId): Promise<number> {
        return new Promise((resolve, reject) => {
            this.GetPropertyAsPromise('userid').then(_uId => {
                const fd = new FormData();
                fd.append('userid', _uId);
                fd.append('groupid', GroupId);
                fd.append('memberid', MemberId);
                this.PostData(this.CommUrl + 'api/group/group_remove.php', fd).then(_r => {
                    if (_r && _r !== null && typeof _r !== undefined) {
                        resolve(1);
                    } else {
                        resolve(0);
                    }
                }).catch(() => {reject();});
            });
        });
    }
    public LeftGroup(GroupId): Promise<number> {
        return new Promise((resolve, reject) => {
            this.GetPropertyAsPromise('userid').then(_uId => {
                const fd = new FormData();
                fd.append('userid', _uId);
                fd.append('groupid', GroupId);
                this.PostData(this.CommUrl + 'api/group/group_left.php', fd).then(_r => {
                    console.log(_r);

                    if (_r && _r !== null && typeof _r !== undefined && _r === 'success') {
                        resolve(1);
                    } else {
                        resolve(0);
                    }
                }).catch(() => {reject();});
            });
        });
    }
    public ChangePassword(CurrPassword, NewPassword, ConfPass): Promise<number> {
        return new Promise((resolve, reject) => {
            this.GetPropertyAsPromise('userid').then(_uId => {
                console.log('UserId: '+ _uId + ', pPass: ' + CurrPassword + ', NewPass: ' + NewPassword + ', ConfPass: ' + ConfPass);
                const fd = new FormData();
                fd.append('userid', _uId);
                fd.append('ppassword', CurrPassword);
                fd.append('password', NewPassword);
                fd.append('cpassword', ConfPass);
                this.PostData(this.CommUrl + 'api/profile/change_password.php', fd).then(_d => {
                    if (_d === 1 || _d === '1') {
                        resolve(1);
                    } else if (_d === 2 || _d === '2') {
                        resolve(1);
                    } else if (_d === 3 || _d === '3') {
                        resolve(1);
                    } else {
                        resolve(0);
                    }
                }).catch(() => {
                    reject(1);
                });
            });
        });
    }
    public ResetPassword(Email, OTP, NewPassword, ConfPass): Promise<number> {
        return new Promise((resolve, reject) => {
            const fd = new FormData();
            fd.append('emailid', Email);
            fd.append('ppassword', OTP);
            fd.append('password', NewPassword);
            fd.append('cpassword', ConfPass);
            this.PostData(this.CommUrl + 'api/profile/reset_password.php', fd).then(_d => {
                console.log('reset_password: ', _d);
                if (_d === 1 || _d === '1') {
                    resolve(1);
                } else if (_d === 2 || _d === '2') {
                    resolve(1);
                } else if (_d === 3 || _d === '3') {
                    resolve(1);
                } else {
                    resolve(0);
                }
            }).catch(() => {
                reject(1);
            });
        });
    }
    LogFormData(formData) {
        console.log('Printing FormData: ');
        for (const pair of formData.entries()) {
           console.log(pair[0] +' : ', pair[1]);
        }
     }

     public GetCompetitionTopics(UserId: number) {
        const d = new FormData();
        console.log('Subject ID: ', UserId);
        d.append('userid', UserId.toString());
        return new Promise((resolve, reject) => {
            this.PostData(this.CommUrl + 'api/competition/get_topics.php', d).then( // get_subject
                data => {
                    console.log('Topics : ', data);
                    let sub: ISubject[] = new Array();
                    for (let i = 0; i < data.length; i++) {
                        sub[i] = {} as ISubject;
                        sub[i].id = data[i].id;
                        sub[i].name = data[i].sub;
                    }
                    // console.log("After : ", sub);
                    resolve(sub);
                },
                error => {
                    console.error(error);
                }
            );
        });
    }

    PostDataForSingleTry(url: string, data: any): Promise<any> {
        return new Promise((resolve, reject) => {
            this.http.post<any>(url, data)
                .subscribe(
                    _res => {
                            resolve(_res);
                    },
                    error => {
                        if (!this.IsAlertShown && error) {
                            this.GetPropertyAsPromise('NoInternateCount').then(_c => {
                                let _count: number = +_c;
                                if (_count == 7) {
                                    if (error.status == 0) {
                                        this.IsAlertShown = true;
                                        this.ShowAlert('Please check your internet connection');
                                    }
                                }
                                this.SetProperty('NoInternateCount', (_count + 1));
                            });
                        }
                        reject(error);
                    }
                );
        });
    }
    PostData(url: string, data: any): Promise<any> {
        let tryCount = 15;
        let err: any;
        let GotResponse = false;
        let GotErrorResponse = true;
        let IsRejected = false;
        return new Promise((resolve, reject) => {
            const tryGetResponse = setInterval(() => {
                if (!GotResponse) {
                 // console.log('Got Response: ', url);
                  this.http.post<any>(url, data)
                        .subscribe(
                            _res => {
                                
                                if (GotResponse === false && IsRejected === false) {
                                    GotResponse = true;
                                    resolve(_res);
                                    clearInterval(tryGetResponse);
                                }
                            },
                            error => {
                                err = error;
                                GotErrorResponse = true;
                                if (GotResponse === false && tryCount <= 1) {
                                    console.error(error);
                                    if (!this.IsAlertShown && error) {
                                        this.GetPropertyAsPromise('NoInternateCount').then(_c => {
                                            let _count: number = +_c;
                                            if (_count == 7) {
                                                if (error.status == 0) {
                                                    this.IsAlertShown = true;
                                                    this.ShowAlert('Please check your internet connection');
                                                }
                                            }
                                            this.SetProperty('NoInternateCount', (_count + 1));
                                        });
                                    }
                                    // reject(error);
                                    // clearInterval(tryGetResponse);
                                }

                                console.log('2. error status :', error);
                            }
                        );
                    }
                if (tryCount <= 0 && GotResponse === false) {
                        IsRejected = true;
                        console.log('terminating: ', url);
                        if ((err == undefined || err == null || typeof err == undefined) && !GotErrorResponse) {
                            reject('Server response failed.');
                        } else {
                            reject(err);
                        }
                        clearInterval(tryGetResponse);
                    }
                if (GotResponse === false) {
                        // console.log("retrying");
                    }
                tryCount--;
            }, 2000);
        });
    }
    /*PostData(url: string, data: any): Observable<any> {
        return this.http.post<any>(url, data);
    }*/
    GetData(url: string): Promise<any> {
        let tryCount = 15;
        let err: any;
        let GotResponse = false;
        let GotErrorResponse = true;
        let IsRejected = false;
        return new Promise((resolve, reject) => {
            const tryGetResponse = setInterval(() => {
                if (!GotResponse) {
                    this.http.get<any>(url)
                        .subscribe(
                            _res => {
                                // console.log("Got Response: ", url);
                                if (GotResponse === false && IsRejected === false) {
                                    GotResponse = true;
                                    resolve(_res);
                                    clearInterval(tryGetResponse);
                                }
                            },
                            error => {
                                err = error;
                                GotErrorResponse = true;
                                if (GotResponse === false && tryCount <= 1) {
                                    console.error(error);
                                    if (!this.IsAlertShown && error) {
                                        this.GetPropertyAsPromise('NoInternateCount').then(_c => {
                                            let _count: number = +_c;
                                            if (_count == 7) {
                                                if (error.status == 0) {
                                                    this.IsAlertShown = true;
                                                    this.ShowAlert('Please check your internet connection');
                                                }
                                            }
                                            this.SetProperty('NoInternateCount', (_count + 1));
                                        });
                                    }
                                    // reject(error);
                                    // clearInterval(tryGetResponse);
                                }

                                console.log('error status :', error.status);
                            }
                        );
                    }
                if (tryCount <= 0 && GotResponse === false) {
                        IsRejected = true;
                        console.log('terminating: ', url);
                        if ((err == undefined || err == null || typeof err == undefined) && !GotErrorResponse) {
                            reject('Server response failed.');
                        } else {
                            reject(err);
                        }
                        clearInterval(tryGetResponse);
                    }
                if (GotResponse === false) {
                        // console.log("retrying");
                    }
                tryCount--;
            }, 2000);
        });
    }

    FetchError(error: any) {

    }
    SetProperty(Key: string, Value: any) {
        localStorage.setItem(Key, Value);
    }
    GetPropertyAsPromise(Key: string): Promise<any> {
        return new Promise((resolve, reject) => resolve(localStorage.getItem(Key)));
    }
    GetProperty(Key: string) {
        return localStorage.getItem(Key);
    }
}
export interface ISubject {
    id: number;
    name: string;
}
export interface IDuration {
    id: number;
    duration: string;
    amount: number;
    order: number;
}
export interface ITopics {
    id: number;
    name: string;
}
export interface IQuestion {
    id: string;
    subTopicId: string;
    q: string;
    IsImg: boolean;
    options: IAnswers;
    ideal_time: number;
    final_ans: string;
    final_ans_string: string;
    given_ans: string;
    time_taken: string;
    CssClass: string;
    OppAns: string;
    OppTime: number;
}
export interface IDashboard {
    p2: string; // Oppgroupname
    p1_correct_count: number;
    p2_correct_count: number;
    player_won: string;
    created_at: string;
    sub_name: string;
    Topic_name: string;
    OppGroupId: string;
    MyGroupId: string;
    Mygroupname: string;
    Rank: string;
}
export interface IHistory {
    p2: string; // Oppgroupname
    p1_correct_count: number;
    p2_correct_count: number;
    created_at: string;
    Topic_name: string;
    TestId: number
    player_won: string
}
export interface IAnswers {
    A: string; B: string; C: string; D: string; E: string;
}
export interface IExams {
    id: string;
    Icon: string;
    ExamTitle: string;
    Qty: number;
    Duration: string;
    minScore: string;
    examType: string;
    std: string;
}
export interface IUser {
    id: string;
    userName: string;
    fname: string;
    lname: string;
    email: string;
    mobile: number;
    picture: string;
    schoolName: string;
    password: string;
    confPass: string;
    std: number;
}
/*export interface INotification {
    playerName: string;
    playerId: number;
    testId: number;
    topic: string;
    subject: string;
    status: number;
    NotificationType: string;
}*/
export interface INotification {
    MainId: number; // Id used for comparison
    Id1: number;
    Id2: number;
    Id3: number;
    Heading: string;
    SubHeading: string;
    Message1: string;
    Message2: string;
    status: number;
    NotificationType: string;
}
