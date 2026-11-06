from pathlib import Path
from io import BytesIO
from PIL import Image, ImageFilter
import hashlib,requests
URLS={"collage":"https://d2ol7oe51mr4n9.cloudfront.net/user_3FC9GcVebQE6WAxiCP5Hh9w95GF/90044689-3b99-4a50-84c6-83335077d2c5.jpg","package1":"https://media.canva.com/v2/image-resize/format:PNG/height:133/quality:100/uri:ifs%3A%2F%2FM%2Faf229c20-7c61-4a33-8aba-64a2d6f4f65a/watermark:F/width:200?csig=AAAAAAAAAAAAAAAAAAAAAKesDpPUou_oP7sqBGvc9nHGgHeZjOSrpeId9TuWgFN-&exp=1793976526&osig=AAAAAAAAAAAAAAAAAAAAAD5Ra9oIl08Sw8Gn4BxvcIqlza4e6H0aQFXFDxT6D1xL&signer=media-rpc&token=AAIAAU0AJGFmMjI5YzIwLTdjNjEtNGEzMy04YWJhLTY0YTJkNmY0ZjY1YQAAAAABobFVZLCoj6qt07WHiiby3dMbZ94acmIthxMX4_2qQlgWkOkJgg&x-canva-quality=thumbnail","package2":"https://media.canva.com/v2/image-resize/format:PNG/height:133/quality:100/uri:ifs%3A%2F%2FM%2F630488cd-069d-4e32-9c71-c7396b0c4510/watermark:F/width:200?csig=AAAAAAAAAAAAAAAAAAAAANPoZEwN_GYITLXVqUmWdrqJVxsK3kmDzJZkg_ZcW2y7&exp=1793975524&osig=AAAAAAAAAAAAAAAAAAAAAF81i8EfEwkLR_LIjyMiVvR8JnZvdV8GxNOnb3S8BOwN&signer=media-rpc&token=AAIAAU0AJDYzMDQ4OGNkLTA2OWQtNGUzMi05YzcxLWM3Mzk2YjBjNDUxMAAAAAABobFGGqA9Vpx-mXQ_9wNkOK1YmNUcvOpsJWQy3riZ47VcBZ6r5Q&x-canva-quality=thumbnail"}
BASE=Path("public/assets/website-packages-20261105")
BASE.mkdir(parents=True,exist_ok=True)
def fetch(name,url):
 r=requests.get(url,timeout=30)
 r.raise_for_status()
 assert len(r.content)>12000,(name,"unexpectedly small image")
 print(name,"source bytes",len(r.content))
 return r.content
original=fetch("four-step collage",URLS["collage"])
assert hashlib.sha256(original).hexdigest()=="b11291e456848e67c803bccafa9db85fd301bed12ee3a05f2657df5d11c7c485","Original user-supplied scene sheet changed"
img=Image.open(BytesIO(original)).convert("RGB")
assert img.size==(1536,1024),f"Unexpected source scene size {img.size}"
for i,name in enumerate(["process-choose-en.png","process-brand-en.png","process-build-en.png","process-launch-en.png"]):
 x=(i%2)*768;y=(i//2)*512
 target=BASE/name
 # Exact individual crops from the English 2x2 image provided by the user, no extra borders or collage.
 img.crop((x,y,x+768,y+512)).save(target,optimize=True)
 assert Image.open(target).size==(768,512)
 print("saved",target,target.stat().st_size,"bytes",i+1)
for key,name in [("package1","website-la-vie-in-pink-en.jpg"),("package2","automated-crm-en.jpg")]:
 raw=fetch(key,URLS[key])
 photo=Image.open(BytesIO(raw)).convert("RGB")
 assert photo.width>=190 and photo.height>=125,f"Canva source thumbnail missing: {key}"
 # High-quality Lanczos resize for the exact user-approved English version.
 # Keep source at its original dimensions if a higher-quality rendition becomes available.
 if photo.width<1000:
  photo=photo.resize((1200,round(photo.height*1200/photo.width)),Image.Resampling.LANCZOS)
  photo=photo.filter(ImageFilter.UnsharpMask(radius=1.25,percent=65,threshold=3))
 target=BASE/name
 photo.save(target,quality=93,optimize=True,subsampling=0)
 assert Image.open(target).width>=768
 print("saved",target,target.stat().st_size,"bytes",name)
