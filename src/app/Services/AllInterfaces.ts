export interface IGroup {
  Id: number,
  AmIAdmin: boolean,
  GroupName: string,
  AdminId: number,
  AdminName: string,
  AdminStatus: boolean,
  Members: IMember[]
}
export interface IMember {
  Id: number,
  Name: string,
  Status: boolean,
  ExtraInfo: string
}
export interface IGroupMemberAnswers {
  Id: number,
  PlayerIndex: number,
  QNum: number,
  QId: number,
  Name: string,
  Ans: string,
  TimeTaken: string,
  AnsString: any
}
export interface IGroupQuizSummary {
  MyGroupName: string,
  MyGroupId: string,
  OppGroupName: string,
  OppGroupId: string,
  MyGroupCount: string,
  OppGroupCount: string,
  winner: string,
  AllQ: IGroupQuizQuestions[]
}
export interface IGroupQuizQuestions {
  id: string;
  question: any;
  isImg: boolean;
  correctOption: string;
  correctAnsString: any;
  OppGroupAns: IGroupMemberAnswers;
  MyGroupAns: IGroupMemberAnswers;
  GroupMembersAns: IGroupMemberAnswers[];
}