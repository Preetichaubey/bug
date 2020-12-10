import { Injectable } from '@angular/core';
import { NativeAudio } from '@ionic-native/native-audio/ngx';
import { Platform } from '@ionic/angular';

@Injectable({
   providedIn: 'root'
})
export class AudioService {
   public backgroun_au: HTMLAudioElement;
   public click_au;
   public backgrounAudio = new Audio();
   public buttonClick = new Audio();
   public PlayRepeatTimer: any;
   public PlatformType = "html";

   constructor(public nativeAudio: NativeAudio, public platform: Platform) {
      this.platform.ready().then(()=>{
         if(this.platform.is("cordova")) {
            //this.PlatformType = "cordova";
         }
      });
   }
   public LoadAudios() {
      this.backgroun_au = <HTMLAudioElement> document.getElementById("background-music");
      this.backgroun_au.volume = 0.3;
      this.click_au = <HTMLAudioElement> document.getElementById("btn-click");
         //this.backgroun_au.oncanplay = () => {this.QuizStarted()}
      this.backgroun_au.load();
      this.click_au.load();
      /*if(this.PlatformType === "cordova"){
         this.nativeAudio.preloadComplex("background", "../../assets/audio/QuizStarted.mp3",1,1,0)
         .then(()=>{this.QuizStarted();});
         this.nativeAudio.preloadComplex("buttonClick", "../../assets/audio/Button_Push.mp3", 1,1,0);
      } else {
         this.backgrounAudio.src = "../../assets/audio/QuizStarted.mp3";
         this.backgrounAudio.load();
         this.buttonClick.src = "../../assets/audio/Button_Push.mp3";
         this.buttonClick.load();
      }*/
   }
   public QuizStarted() {
      this.backgroun_au.play();
      setTimeout(() => {
         this.LoopAudio();
      }, 5000);
      
      /*if(this.PlatformType === "cordova"){
         this.nativeAudio.play("background");
      } else {
         this.backgrounAudio.play();
      }*/
   }
   public QuizEnded() {
      clearInterval(this.PlayRepeatTimer);
      setTimeout(() => {
         this.backgroun_au.pause();
      }, 1100);
      /*if(this.PlatformType === "cordova"){
         this.nativeAudio.stop("background");
         this.nativeAudio.stop("buttonClick");
      } else {
         if(this.PlayRepeatTimer){
            clearInterval(this.PlayRepeatTimer);
         }
         this.backgrounAudio.pause();
      }*/
   }
   public AnswerSelected() {
      this.click_au.load();
      this.click_au.play();
      /*if(this.PlatformType === "cordova"){
         this.nativeAudio.play("buttonClick");
      } else {
         this.buttonClick.play();
      }*/
   }
   public LoopAudio(){
      this.PlayRepeatTimer = setInterval(() => {
         if(this.backgroun_au.ended){
            //this.backgroun_au.load();
            this.backgroun_au.play();
         }
      },1000);
   }
}
