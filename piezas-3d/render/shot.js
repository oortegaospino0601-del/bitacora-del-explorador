const {chromium}=require('playwright');
(async()=>{
  const jobs=JSON.parse(process.argv[2]);
  const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  for(const j of jobs){
    const p=await b.newPage({viewport:{width:j.w,height:j.h}});
    p.on('console',m=>{if(m.type()==='error')console.log('ERR',m.text())});
    const qs=new URLSearchParams({...j.q,w:j.w,h:j.h,items:JSON.stringify(j.items)});
    await p.goto('http://localhost:8765/index.html?'+qs);
    await p.waitForFunction(()=>document.title==='done',null,{timeout:120000});
    await p.locator('canvas').screenshot({path:j.out}); await p.close(); console.log('ok',j.out);
  }
  await b.close();
})();
