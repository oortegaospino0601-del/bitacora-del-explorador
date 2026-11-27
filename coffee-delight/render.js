const {chromium}=require('playwright');const {spawn}=require('child_process');
(async()=>{const fps=30,T=39.5,N=Math.round(T*fps),out=process.argv[2]||'anim.mp4',audio=process.argv[3]||'mix_noVO.wav';
const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
const errs=[];p.on('pageerror',e=>errs.push(e.message));
await p.goto('file://'+__dirname+'/anim.html');if(process.env.SC)await p.evaluate(s=>window.SC=JSON.parse(s),process.env.SC);await p.evaluate(()=>window.ready);
const ff=spawn('ffmpeg',['-y','-loglevel','error','-f','image2pipe','-framerate',''+fps,'-c:v','mjpeg','-i','-','-i',audio,'-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-profile:v','high','-c:a','aac','-b:a','192k','-ar','44100','-shortest','-movflags','+faststart',out],{stdio:['pipe','inherit','inherit']});
for(let f=0;f<N;f++){const d=await p.evaluate(t=>{render(t);return document.getElementById('c').toDataURL('image/jpeg',.93)},f/fps);
 if(!ff.stdin.write(Buffer.from(d.split(',')[1],'base64')))await new Promise(r=>ff.stdin.once('drain',r));}
ff.stdin.end();await new Promise(r=>ff.on('close',r));if(errs.length)console.log(errs);await b.close();console.log('done',out);})();
