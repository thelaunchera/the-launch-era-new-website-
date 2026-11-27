/* Create a small, watermarked preview from an 8-bit RGBA PNG.
 * Original artwork never enters the public catalog. No third-party packages. */
function makeHDPreview(b64){
 const A='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/', map=new Int16Array(128);map.fill(-1);for(let i=0;i<64;i++)map[A.charCodeAt(i)]=i;
 function un64(s){let a=new Uint8Array(Math.ceil(s.length*3/4)),v=0,n=0,j=0;for(let i=0;i<s.length;i++){let k=map[s.charCodeAt(i)];if(k===undefined||k<0)continue;v=(v<<6)|k;n+=6;if(n>=8){n-=8;a[j++]=(v>>n)&255}}return a.subarray(0,j)}
 function to64(b){let r=[];for(let i=0;i<b.length;i+=3){let x=(b[i]<<16)|((b[i+1]||0)<<8)|(b[i+2]||0);r.push(A[x>>18],A[(x>>12)&63],i+1<b.length?A[(x>>6)&63]:'=',i+2<b.length?A[x&63]:'=')}return r.join('')}
 const a=un64(b64),u=(p)=>((a[p]<<24)|(a[p+1]<<16)|(a[p+2]<<8)|a[p+3])>>>0;
 if(a[0]!==137||a[1]!==80||a[2]!==78||a[3]!==71)throw Error('Not a PNG');
 const w=u(16),h=u(20),depth=a[24],type=a[25],channels=type===6?4:type===4?2:type===3?1:0;
 if(depth!==8||!channels||a[28]!==0||w*h>16000000)throw Error('Unsupported or non-transparent PNG '+depth+'/'+type);
 let idat=[],size=0,plte=null,trns=null;for(let p=8;p+12<=a.length;){let n=u(p),name=String.fromCharCode(...a.subarray(p+4,p+8));if(name==='IDAT'){let s=a.subarray(p+8,p+8+n);idat.push(s);size+=n}else if(name==='PLTE')plte=a.subarray(p+8,p+8+n);else if(name==='tRNS')trns=a.subarray(p+8,p+8+n);p+=12+n}
 let z=new Uint8Array(size),off=0;for(const s of idat){z.set(s,off);off+=s.length}
 const stride=w*channels,raw=new Uint8Array((stride+1)*h);let pos=16,out=0;
 function bits(n){let v=0;for(let i=0;i<n;i++){if(pos>=z.length*8)throw Error('truncated deflate');v|=((z[pos>>3]>>(pos&7))&1)<<i;pos++}return v}
 function huff(lens){let counts=new Uint32Array(16),next=new Uint32Array(16),dict=[];for(const l of lens)if(l)counts[l]++;let code=0;for(let l=1;l<=15;l++){code=(code+counts[l-1])<<1;next[l]=code;dict[l]=new Map()}for(let i=0;i<lens.length;i++){let l=lens[i];if(l)dict[l].set(next[l]++,i)}return dict}
 function symbol(d){let v=0;for(let l=1;l<=15;l++){v=(v<<1)|bits(1);if(d[l].has(v))return d[l].get(v)}throw Error('bad huffman code')}
 const lb=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258],le=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],db=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577],de=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13];
 let last=0;while(!last){last=bits(1);let kind=bits(2);if(kind===0){pos=(pos+7)&~7;let n=bits(16),inv=bits(16);if((n^inv)!==65535)throw Error('bad block');for(let i=0;i<n;i++)raw[out++]=bits(8);continue}let lit,dist;if(kind===1){lit=huff(Array.from({length:288},(_,i)=>i<144?8:i<256?9:i<280?7:8));dist=huff(Array(32).fill(5))}else if(kind===2){let nl=bits(5)+257,nd=bits(5)+1,nc=bits(4)+4,order=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],cl=Array(19).fill(0);for(let i=0;i<nc;i++)cl[order[i]]=bits(3);let cd=huff(cl),lens=[];while(lens.length<nl+nd){let s=symbol(cd);if(s<16)lens.push(s);else{let n=s===16?bits(2)+3:s===17?bits(3)+3:bits(7)+11,v=s===16?lens[lens.length-1]:0;while(n--)lens.push(v)}}lit=huff(lens.slice(0,nl));dist=huff(lens.slice(nl))}else throw Error('bad deflate block');while(true){let s=symbol(lit);if(s===256)break;if(s<256){raw[out++]=s;continue}let k=s-257,len=lb[k]+bits(le[k]),ds=symbol(dist),d=db[ds]+bits(de[ds]);if(d>out||out+len>raw.length)throw Error('bad distance');for(let i=0;i<len;i++){raw[out]=raw[out-d];out++}}}
 if(out!==raw.length)throw Error('PNG decode length mismatch');
 const pixels=new Uint8Array(stride*h);let minX=w,minY=h,maxX=-1,maxY=-1,transparent=0;
 function paeth(a,b,c){let p=a+b-c,pa=Math.abs(p-a),pb=Math.abs(p-b),pc=Math.abs(p-c);return pa<=pb&&pa<=pc?a:pb<=pc?b:c}
 for(let y=0;y<h;y++){let p=y*(stride+1),f=raw[p],q=y*stride;for(let x=0;x<stride;x++){let left=x>=channels?pixels[q+x-channels]:0,up=y?pixels[q+x-stride]:0,ul=y&&x>=channels?pixels[q+x-stride-channels]:0;pixels[q+x]=(raw[p+x+1]+(f===0?0:f===1?left:f===2?up:f===3?(left+up)>>1:paeth(left,up,ul)))&255}for(let x=0;x<w;x++){let alpha=type===3?(trns?.[pixels[q+x]]??255):pixels[q+x*channels+channels-1];if(alpha===0)transparent++;if(alpha>=24){minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y)}}}
 if(transparent/(w*h)<.10||maxX<minX)throw Error('No meaningful transparency');
 const N=1080,bg=[255,250,244],rgb=new Uint8Array(N*N*3);for(let i=0;i<rgb.length;i++)rgb[i]=bg[i%3];
 const bw=maxX-minX+1,bh=maxY-minY+1,scale=Math.min(960/bw,920/bh),dw=Math.max(1,Math.round(bw*scale)),dh=Math.max(1,Math.round(bh*scale)),dx=Math.floor((N-dw)/2),dy=22+Math.floor((940-dh)/2);
 for(let y=0;y<dh;y++)for(let x=0;x<dw;x++){let sx=Math.min(maxX,minX+Math.floor((x+.5)*bw/dw)),sy=Math.min(maxY,minY+Math.floor((y+.5)*bh/dh)),p=(sy*w+sx)*channels,alpha=(type===3?(trns?.[pixels[p]]??255):pixels[p+channels-1])/255,q=((dy+y)*N+dx+x)*3;for(let k=0;k<3;k++)rgb[q+k]=Math.round((type===3?plte[pixels[p]*3+k]:channels===4?pixels[p+k]:pixels[p])*alpha+bg[k]*(1-alpha))}
 // Quiet but baked-in watermark, away from the artwork.
 const letters={P:['11110','10001','10001','11110','10000','10000','10000'],O:['01110','10001','10001','10001','10001','10001','01110'],E:['11111','10000','10000','11110','10000','10000','11111'],L:['10000','10000','10000','10000','10000','10000','11111'],R:['11110','10001','10001','11110','10100','10010','10001'],V:['10001','10001','10001','10001','10001','01010','00100'],I:['11111','00100','00100','00100','00100','00100','11111'],W:['10001','10001','10001','10101','10101','10101','01010'],'&':['01100','10010','10100','01000','10101','10010','01101']};
 let label='POP & PEEL PREVIEW',ox=N-label.length*18-27;for(let i=0;i<label.length;i++){let g=letters[label[i]];if(!g)continue;for(let y=0;y<7;y++)for(let x=0;x<5;x++)if(g[y][x]==='1'){for(let yy=0;yy<3;yy++)for(let xx=0;xx<3;xx++){let q=((1023+y*3+yy)*N+ox+i*18+x*3+xx)*3;rgb[q]=95;rgb[q+1]=77;rgb[q+2]=70}}}

 // Adaptive PNG filters and fixed-Huffman DEFLATE with a bounded LZ77 search.
 const row=N*3,scan=new Uint8Array((row+1)*N);
 for(let y=0;y<N;y++){let start=y*row,p=y*(row+1),best=Infinity,choice=0;for(let f=0;f<5;f++){let cost=0;for(let x=0;x<row;x++){const a=x>=3?rgb[start+x-3]:0,b=y?rgb[start-row+x]:0,c=y&&x>=3?rgb[start-row+x-3]:0;const v=(rgb[start+x]-(f===0?0:f===1?a:f===2?b:f===3?(a+b)>>1:paeth(a,b,c)))&255;cost+=Math.min(v,256-v)}if(cost<best){best=cost;choice=f}}scan[p]=choice;for(let x=0;x<row;x++){let a=x>=3?rgb[start+x-3]:0,b=y?rgb[start-row+x]:0,c=y&&x>=3?rgb[start-row+x-3]:0;scan[p+1+x]=(rgb[start+x]-(choice===0?0:choice===1?a:choice===2?b:choice===3?(a+b)>>1:paeth(a,b,c)))&255}}
 function be(v){return [(v>>>24)&255,(v>>>16)&255,(v>>>8)&255,v&255]}
 function cat(arr){let n=arr.reduce((s,a)=>s+a.length,0),o=new Uint8Array(n),p=0;for(const a of arr){o.set(a,p);p+=a.length}return o}
 const crcTable=new Uint32Array(256);for(let i=0;i<256;i++){let c=i;for(let j=0;j<8;j++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;crcTable[i]=c}
 function chunk(name,data){let t=Uint8Array.from(Array.from(name).map(x=>x.charCodeAt(0))),c=0xffffffff;for(const v of t)c=crcTable[(c^v)&255]^(c>>>8);for(const v of data)c=crcTable[(c^v)&255]^(c>>>8);return cat([be(data.length),t,data,be((c^0xffffffff)>>>0)])}
 let outBytes=[0x78,0x01],bitbuf=0,bitcount=0;
 function put(v,n){bitbuf|=v<<bitcount;bitcount+=n;while(bitcount>=8){outBytes.push(bitbuf&255);bitbuf>>>=8;bitcount-=8}}
 function rev(v,n){let r=0;while(n--){r=(r<<1)|(v&1);v>>>=1}return r}
 function litcode(v){if(v<144)put(rev(48+v,8),8);else if(v<256)put(rev(400+v-144,9),9);else if(v<280)put(rev(v-256,7),7);else put(rev(192+v-280,8),8)}
 put(1,1);put(1,2);
 let lastPos=new Int32Array(65536);lastPos.fill(-1);function hash(p){return ((scan[p]*251+scan[p+1])*251+scan[p+2])&65535}
 for(let p=0;p<scan.length;){let len=0,dist=0;if(p+2<scan.length){let h=hash(p),q=lastPos[h];lastPos[h]=p;if(q>=0&&p-q<=32768&&scan[q]===scan[p]&&scan[q+1]===scan[p+1]&&scan[q+2]===scan[p+2]){len=3;dist=p-q;let max=Math.min(258,scan.length-p);while(len<max&&scan[q+len]===scan[p+len])len++}}
 if(len>=3){let k=lb.length-1;while(lb[k]>len)k--;litcode(257+k);put(len-lb[k],le[k]);let j=db.length-1;while(db[j]>dist)j--;put(rev(j,5),5);put(dist-db[j],de[j]);for(let t=1;t<len&&p+t+2<scan.length;t++)lastPos[hash(p+t)]=p+t;p+=len}else{litcode(scan[p]);p++}}
 litcode(256);if(bitcount)outBytes.push(bitbuf&255);let s1=1,s2=0;for(const v of scan){s1=(s1+v)%65521;s2=(s2+s1)%65521}outBytes.push(...be((s2<<16)|s1));
 const png=cat([[137,80,78,71,13,10,26,10],chunk('IHDR',Uint8Array.from([...be(N),...be(N),8,2,0,0,0])),chunk('IDAT',Uint8Array.from(outBytes)),chunk('IEND',new Uint8Array())]);
 return {preview:'data:image/png;base64,'+to64(png),originalSize:[w,h],previewSize:[N,N],transparentRatio:transparent/(w*h)};
}