import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ShareValuesService {
  private Data: any[]=[];
  constructor() { }
  
  public SetValue(key: string, value: any) {
    this.Data[key] = value;
  }
  public GetValue(key: string) {
    return this.Data[key];
  }
  public GetValueAsPromise(key: string): Promise<any> {
    return new Promise((resolve, reject) => {
      if(this.Data[key]) {
        resolve(this.Data[key])
      } else {
        console.log("Key '"+ key +"' Not Found");
        reject("Key '"+ key +"' not found");
      }
    });
  }
}
