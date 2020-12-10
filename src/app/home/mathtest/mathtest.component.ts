import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-mathtest',
  templateUrl: './mathtest.component.html',
  styleUrls: ['./mathtest.component.scss'],
})
export class MathtestComponent implements OnInit {
  
  @ViewChild('equation', {static:false}) equation: ElementRef;
  
  public t = `<math xmlns="http://www.w3.org/1998/Math/MathML">
  <mstyle displaystyle="true" scriptlevel="0">
    <mrow class="MJX-TeXAtom-ORD">
      <msup>
        <mn>11</mn>
        <mn>3</mn>
      </msup>
      <mo>&#x2212;<!-- ? --></mo>
      <msup>
        <mn>8</mn>
        <mn>3</mn>
      </msup>
      <mo>&#x2212;<!-- ? --></mo>
      <msup>
        <mn>2</mn>
        <mn>3</mn>
      </msup>
    </mrow>
  </mstyle>
</math>`;
  constructor() { 
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
    eval('MathJax.Hub.Queue(["Typeset", MathJax.Hub])');
  }

  ngOnInit() {
    this.loadScript().then(() => {
      
      eval('MathJax.Hub.Queue(["Typeset", MathJax.Hub])');
    });
    /*setTimeout(() => {
      MathJax.Hub.Queue(["Typeset", MathJax.Hub, this.equation.nativeElement]);
      MathJax.Hub.Queue(["Typeset", MathJax.Hub, document.getElementsByClassName("answers")]);
    },200);*/
  }
  loadScript() {
    const scripts = "https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.5/MathJax.js?config=TeX-MML-AM_CHTML";
    return new Promise((resolve, reject) => {
        //resolve if already loaded
            //load script
            let script = document.createElement('script');
            script.type = 'text/javascript';
            script.src = scripts;
            resolve({script: name, loaded: true, status: 'Loaded'});
            
            script.onerror = (error: any) => resolve({script: name, loaded: false, status: 'Loaded'});
            document.getElementsByTagName('head')[0].appendChild(script);
        
    });
}
}
