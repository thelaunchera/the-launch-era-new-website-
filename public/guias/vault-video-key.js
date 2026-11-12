/* Dailin Vault – keyed Motion portrait (progressive enhancement).
 * Video and poster stay the actual approved Dailin media. No face replacement.
 * Soft GPU blue-matte key; same-origin pixels only. On any failure the original
 * MP4 and poster remain visible, preserving iOS scrolling/autoplay behavior.
 */
(() => {
 "use strict";
 const media=document.querySelector(".hero-vault .hero-media--cutout");
 const video=media?.querySelector(".hero-video");
 const poster=media?.querySelector(".hero-poster");
 if(!media||!video||!poster)return;
 const reduced=matchMedia("(prefers-reduced-motion: reduce)");
 const canvas=document.createElement("canvas");
 canvas.className="hero-keyed-canvas";
 canvas.setAttribute("aria-hidden","true");
 media.appendChild(canvas);
 let gl;
 try{gl=canvas.getContext("webgl",{alpha:true,antialias:false,premultipliedAlpha:false,preserveDrawingBuffer:false});}
 catch(_){gl=null;}
 if(!gl){canvas.remove();return;}
 const vertexSource=`
 attribute vec2 pos;
 varying vec2 uv;
 void main(){uv=pos;gl_Position=vec4(pos*2.0-1.0,0.,1.);}
 `;
 const fragmentSource=`
 precision mediump float;
 varying vec2 uv;
 uniform sampler2D videoTex;
 uniform sampler2D posterTex;
 uniform vec2 fit;
 uniform float posterMix;
 void main(){
   vec2 q=(uv-.5)/fit+.5;
   if(q.x<0.||q.x>1.||q.y<0.||q.y>1.){gl_FragColor=vec4(0.);return;}
   vec4 v=texture2D(videoTex,q),p=texture2D(posterTex,q);
   vec4 source=mix(v,p,posterMix);
   vec3 c=source.rgb;
   float brightness=dot(c,vec3(.299,.587,.114));
   float b=c.b-c.r,g=c.g-c.r;
   // This removes the *pale blue matte*, not skin, dark hair or black clothing.
   float blue=smoothstep(.035,.13,b)*smoothstep(.006,.068,g)*smoothstep(.38,.60,brightness);
   float a=source.a*(1.0-clamp(blue,0.,1.));
   if(a<.008){gl_FragColor=vec4(0.);return;}
   // Remove blue edge spill without redrawing or shifting the person's identity.
   vec3 clean=vec3(c.r,c.g,mix(c.b,min(c.b,max(c.r,c.g)+.045),(.85-a)*.55));
   gl_FragColor=vec4(clean,a);
 }
 `;
 const shader=(type,src)=>{
   const sh=gl.createShader(type);gl.shaderSource(sh,src);gl.compileShader(sh);
   if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(sh)||"shader");
   return sh;
 };
 let program;
 try{
   program=gl.createProgram();
   gl.attachShader(program,shader(gl.VERTEX_SHADER,vertexSource));
   gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragmentSource));
   gl.linkProgram(program);
   if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error("program");
   gl.useProgram(program);
 }catch(_){canvas.remove();return;}
 const attrib=gl.getAttribLocation(program,"pos");
 const buffer=gl.createBuffer();
 gl.bindBuffer(gl.ARRAY_BUFFER,buffer);
 gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([0,0,1,0,0,1,1,1]),gl.STATIC_DRAW);
 gl.enableVertexAttribArray(attrib);gl.vertexAttribPointer(attrib,2,gl.FLOAT,false,0,0);
 gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
 const createTexture=()=>{
   const tex=gl.createTexture();
   gl.bindTexture(gl.TEXTURE_2D,tex);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
   gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
   gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0,0,0,0]));
   return tex;
 };
 const videoTexture=createTexture(),posterTexture=createTexture();
 const fit=gl.getUniformLocation(program,"fit");
 const posterMix=gl.getUniformLocation(program,"posterMix");
 gl.uniform1i(gl.getUniformLocation(program,"videoTex"),0);
 gl.uniform1i(gl.getUniformLocation(program,"posterTex"),1);
 gl.clearColor(0,0,0,0);
 let readyPoster=false,readyVideo=false,visible=true,enabled=true,lastDraw=0;
 const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
 function refreshSize(){
   const box=media.getBoundingClientRect();
   if(box.width<2||box.height<2)return;
   const dpr=Math.min(devicePixelRatio||1,1.5);
   const width=Math.max(2,Math.round(box.width*dpr)),height=Math.max(2,Math.round(box.height*dpr));
   if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;gl.viewport(0,0,width,height);}
   const aspect=(video.videoWidth&&video.videoHeight?video.videoWidth/video.videoHeight:
     poster.naturalWidth&&poster.naturalHeight?poster.naturalWidth/poster.naturalHeight:.563);
   const viewAspect=box.width/box.height;
   const sx=viewAspect>aspect?aspect/viewAspect:1;
   const sy=viewAspect<aspect?viewAspect/aspect:1;
   gl.uniform2f(fit,sx,sy);
 }
 if(typeof ResizeObserver!=="undefined"){const resize=new ResizeObserver(refreshSize);resize.observe(media);}else{window.addEventListener("resize",refreshSize,{passive:true});}
 if(typeof IntersectionObserver!=="undefined"){const visibility=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting??true;if(visible)draw();},{threshold:0});visibility.observe(media);}
 function fallback(){
   enabled=false;
   media.classList.remove("is-keyed-ready");
   canvas.style.display="none";
 }
 function blend(){
   const duration=video.duration,t=video.currentTime;
   if(!readyVideo||reduced.matches||!Number.isFinite(duration)||duration<1)return 1;
   const fadeOut=clamp((.55-(duration-t))/.43,0,1);
   const fadeIn=clamp((.34-t)/.34,0,1);
   return Math.max(fadeOut,fadeIn,media.classList.contains("is-loop-bridging")?0.88:0);
 }
 function draw(){
   if(!enabled||!visible||document.hidden||!readyPoster)return;
   try{
     gl.useProgram(program);
     refreshSize();
     gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,posterTexture);
     if(readyVideo&&!reduced.matches&&video.readyState>=2){
       gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,videoTexture);
       gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,video);
     }else{
       gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,videoTexture);
     }
     gl.uniform1f(posterMix,blend());
     gl.clear(gl.COLOR_BUFFER_BIT);
     gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
     if(gl.getError()!==gl.NO_ERROR)throw new Error("WebGL draw");
     media.classList.add("is-keyed-ready");
   }catch(_){fallback();}
 }
 const posterReady=()=>{
   if(!poster.naturalWidth)return;
   try{
     gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,posterTexture);
     gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,poster);
     readyPoster=true;draw();
   }catch(_){fallback();}
 };
 if(poster.complete)posterReady();
 else poster.addEventListener("load",posterReady,{once:true});
 video.addEventListener("loadeddata",()=>{readyVideo=video.readyState>=2;draw();},{passive:true});
 video.addEventListener("seeked",draw,{passive:true});
 // requestVideoFrameCallback avoids unnecessary per-frame CPU processing on iOS.
 if("requestVideoFrameCallback" in video){
   const frame=()=>{
     if(!enabled)return;
     readyVideo=video.readyState>=2;
     if(!reduced.matches)draw();
     video.requestVideoFrameCallback(frame);
   };
   video.requestVideoFrameCallback(frame);
 }else{
   const frame=now=>{
     if(!enabled)return;
     if(now-lastDraw>45){lastDraw=now;readyVideo=video.readyState>=2;if(!reduced.matches)draw();}
     requestAnimationFrame(frame);
   };
   requestAnimationFrame(frame);
 }
 document.addEventListener("visibilitychange",()=>{if(!document.hidden)draw();});
 reduced.addEventListener?.("change",draw);
 canvas.addEventListener("webglcontextlost",event=>{event.preventDefault();fallback();},{passive:false});
})();