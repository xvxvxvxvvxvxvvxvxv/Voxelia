const {JSDOM,VirtualConsole}=require('jsdom');const fs=require('fs');
const html=fs.readFileSync(process.env.VOXELIA_HTML||'voxelia.html','utf8');
const vc=new VirtualConsole();let errs=[];vc.on('jsdomError',e=>errs.push(String(e.message||e).slice(0,200)));vc.on('error',e=>errs.push('E '+String(e).slice(0,200)));
const dom=new JSDOM(html,{runScripts:'dangerously',pretendToBeVisual:true,url:'http://localhost/',virtualConsole:vc,
 beforeParse(w){
  const ctx=new Proxy({},{get(t,k){if(k in t)return t[k];if(k==='getImageData')return()=>({data:new Uint8ClampedArray(4)});if(k==='measureText')return()=>({width:10,actualBoundingBoxAscent:8,actualBoundingBoxDescent:2});if(k==='createLinearGradient'||k==='createRadialGradient'||k==='createPattern')return()=>({addColorStop(){}});if(k==='getTransform')return()=>({a:1,b:0,c:0,d:1,e:0,f:0});if(k==='canvas')return {width:100,height:100};return typeof k==='string'&&/^[a-z]/.test(k)&&!['font','fillStyle','strokeStyle','lineWidth','globalAlpha','textAlign','textBaseline','globalCompositeOperation','filter','imageSmoothingEnabled','lineCap','lineJoin','shadowBlur','shadowColor'].includes(k)?(()=>{}):t[k]},set(t,k,v){t[k]=v;return true}});
  w.HTMLCanvasElement.prototype.getContext=function(){return ctx};w.HTMLCanvasElement.prototype.toDataURL=()=>'data:,';
  w.matchMedia=()=>({matches:false,addEventListener(){},addListener(){}});w.AudioContext=undefined;w.CanvasRenderingContext2D=function(){};w.CanvasRenderingContext2D.prototype=ctx;w.Path2D=function(){};w.OffscreenCanvas=undefined;w.WebGLRenderingContext=function(){};w.WebGL2RenderingContext=function(){};w.scrollTo=()=>{};
  w.Image=class{set src(v){setTimeout(()=>this.onload&&this.onload(),0)}};
 }});
const W=dom.window;module.exports={W,errs,ev:s=>W.eval(s)};
if(require.main===module){setTimeout(()=>{console.log('errs',errs.slice(0,8));console.log(W.eval('[typeof Z,Object.keys(Z).length,Object.keys(E).length,Object.keys(NPCS).length,Object.keys(QT).length,Object.keys(DG).length,typeof load,typeof newGame]'));process.exit(0)},3000)}
