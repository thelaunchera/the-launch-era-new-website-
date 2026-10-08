from pathlib import Path
from io import BytesIO
from urllib.request import urlopen, Request
import fitz
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import Paragraph
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

SOURCE_IDS={"en":"1LHhwtKPconTiI4U7SwCTJo73JWIPlGuj","es":"1U7P2JUNvFDWp33R8-YOZkAKORH2KOf-S"}
BASE=Path(".output/public/freebies")
BASE.mkdir(parents=True,exist_ok=True)
for label,path in [("DSerif","/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"),("DSans","/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"),("DSansBold","/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf")]:
    pdfmetrics.registerFont(TTFont(label,path))
W,H=540,675
C={a:HexColor(v) for a,v in {"ivory":"#FAF8F3","black":"#191919","muted":"#4D535A","blue":"#DFEEF7","yellow":"#F2D85B","white":"#FFFFFF","line":"#DAD8D0","mauve":"#9A6C8A"}.items()}
styles={a:ParagraphStyle(a,fontName=f,fontSize=s,leading=l,textColor=col,splitLongWords=False) for a,f,s,l,col in [
 ("body","DSans",10.3,15,C["muted"]),("small","DSans",8.6,12,C["muted"]),("title","DSerif",24,30,C["black"]),("callout","DSerif",13.6,19,C["black"])]}
def text(c,s,x,top,w,style="body"):
    obj=Paragraph(s.replace("&","&amp;"),styles[style]);_,h=obj.wrap(w,1000);obj.drawOn(c,x,top-h);return h
def box(c,x,y,w,h,color,r=12,border=None):
    c.setFillColor(color);c.setStrokeColor(border or color);c.roundRect(x,y,w,h,r,fill=1,stroke=1 if border else 0)
def footer(c,n):
    c.setStrokeColor(C["line"]);c.line(36,35,504,35)
    c.setFillColor(C["black"]);c.setFont("DSansBold",7);c.drawString(36,19,"THE LAUNCH ERA")
    c.setFont("DSans",7);c.setFillColor(C["muted"]);c.drawCentredString(272,19,"thelaunchera.com")
    c.drawRightString(504,19,str(n)+" / 12")
def header(c,kicker,title,subtitle,n):
    c.setFillColor(C["ivory"]);c.rect(0,0,W,H,fill=1,stroke=0)
    box(c,36,636,133,22,C["yellow"])
    c.setFillColor(C["black"]);c.setFont("DSansBold",8.1);c.drawCentredString(102,644,kicker[:24])
    h=text(c,title,36,620,468,"title")
    y=620-h-10;text_h=text(c,subtitle,36,y,455)
    footer(c,n);return y-text_h-22
def rows(c,items,top,lowest=160):
    gap=8;n=len(items);height=(top-lowest-gap*(n-1))/n
    assert height>=46,(height,n,top)
    for i,(label,desc) in enumerate(items):
        y=top-(i+1)*height-i*gap
        box(c,36,y,468,height,C["white"],12,C["line"])
        box(c,48,y+height/2-13,26,26,C["blue"] if i%2==0 else C["yellow"],13)
        c.setFont("DSansBold",10);c.setFillColor(C["black"]);c.drawCentredString(61,y+height/2-3.6,str(i+1))
        c.setFont("DSansBold",10);c.drawString(86,y+height-19,label)
        h=text(c,desc,86,y+height-25,404,"small")
        assert y+height-25-h>y+6,(label,h,height)
def steps(c,items,top,lowest=158):
    gap=8;n=len(items);height=(top-lowest-gap*(n-1))/n
    assert height>=46
    for i,(label,desc) in enumerate(items):
        y=top-(i+1)*height-i*gap
        box(c,36,y,468,height,C["blue"] if i%2 else C["white"],12,C["line"])
        box(c,50,y+height-26,114,17,C["yellow"] if i%2 else C["blue"],8)
        c.setFont("DSansBold",7.4);c.setFillColor(C["black"]);c.drawString(60,y+height-21.6,label[:23])
        h=text(c,desc,50,y+height-35,435,"small")
        assert y+height-35-h>y+4,(label,h,height)
def callout(c,label,title,sub,y,h):
    box(c,36,y,468,h,C["blue"],15)
    box(c,48,y+h-26,106,16,C["yellow"],8)
    c.setFont("DSansBold",7.5);c.setFillColor(C["black"]);c.drawString(58,y+h-21.5,label[:20])
    th=text(c,title,51,y+h-35,438,"callout")
    nh=text(c,sub,51,y+h-38-th,438,"small")
    assert y+h-38-th-nh>=y+4,(title,th,nh,h)
def page(c,n,lang,tracker):
    es=lang=="es"
    if n==2:
        top=header(c,"EMPIEZA AQUÍ" if es else "START HERE","Antes de arreglar el follow-up, encuentra la fuga." if es else "Before you fix follow-up, find the leak.","La mayoría de los problemas con leads no son falta de interés. Son un próximo paso que falta entre la consulta y el trabajo reservado." if es else "Most lead problems are not a lack of interest. They are a missing next step somewhere between inquiry and booked job.",2)
        items=([("Respuesta lenta","Una buena consulta espera demasiado antes de recibir respuesta."),("Datos regados","Los detalles viven entre DMs, textos, email, notas o screenshots."),("Cotización sin seguimiento","La cotización se envía, pero nadie define la próxima fecha."),("Fricción al reservar","El cliente está listo, pero el siguiente paso no está claro o requiere demasiados mensajes."),("Handoff roto","El lead reserva, pero vuelves a escribir la misma información en otro lugar.")] if es else [("Slow reply","A good inquiry sits too long before anyone responds."),("Scattered details","The client details live across DMs, texts, email, notes or screenshots."),("Quote dead-end","The quote goes out, but no follow-up date is attached to it."),("Booking friction","The client is ready, but the next step is unclear or takes too many messages."),("Handoff gap","The lead books, but the client/job details are rebuilt again somewhere else.")])
        rows(c,items,top,166)
        callout(c,"CHEQUEO RÁPIDO" if es else "QUICK CHECK","¿En qué punto se traba tu último buen lead?" if es else "Where does your last good lead get stuck?","Ese es el primer pedazo del sistema que debes arreglar." if es else "That is the first part of the system to fix.",59,87)
    elif n==6:
        top=header(c,"DESPUÉS DEL SÍ" if es else "AFTER THE YES","Una reserva debería quitar incertidumbre." if es else "A booking should remove uncertainty.","Cuando dicen que sí, el cliente debe saber exactamente qué pasa después." if es else "Once they say yes, the client should know exactly what happens next.",6)
        items=([("CONFIRMA","Quedaste reservado para [servicio] el [fecha] a las [hora]. Dirección: [ubicación]. Responde aquí si algo cambia."),("ACCESO","Confirma gate, lockbox, llaves, persona de contacto, parking o notas de entrada antes del servicio."),("RECUERDA","Envía un recordatorio con fecha, ventana de llegada y cualquier instrucción de preparación."),("CAMBIO","Si reprograma o cancela, actualiza el trabajo y el registro del cliente en el mismo lugar."),("DESPUÉS","Envía un thank-you corto, resuelve cualquier issue rápido y pide review cuando corresponda.")] if es else [("CONFIRM","You are booked for [service] on [date] at [time]. Address: [location]. Reply here if anything changes."),("ACCESS","Confirm gate, lockbox, keys, contact person, parking or entry notes before the service."),("REMIND","Send a clear reminder with date, arrival window and any preparation instructions."),("CHANGE","If they reschedule or cancel, update the job and the client record in the same place."),("AFTER","Send a short thank-you, handle any issue quickly and ask for a review when appropriate.")])
        steps(c,items,top,158)
        callout(c,"PRUEBA DEL HANDOFF" if es else "HANDOFF TEST","¿Se puede mover este cliente al calendario sin volver a escribirlo todo?" if es else "Can you move this booked client forward without retyping?","Si no, es una brecha del sistema, no de tu memoria." if es else "If not, that is a system gap — not a memory problem.",55,97)
    elif n==8:
        top=header(c,"TU TRACKER" if es else "YOUR TRACKER","Úsalo como command center, no como almacén de datos." if es else "Use it like a command center, not a storage sheet.","El tracker debe mostrar quién necesita atención hoy, sin releer cada conversación." if es else "Your tracker should show you who needs attention today, without reading every old conversation.",8)
        fields=([("Lead / Negocio","¿Quién es?"),("Servicio","¿Qué necesita?"),("Estado","¿Dónde está ahora?"),("Último Contacto","¿Qué pasó por última vez?"),("Próximo Follow-Up","¿Cuándo actúo?"),("Próxima Acción","¿Qué hago exactamente?"),("Resultado","¿Cómo terminó?")] if es else [("Lead / Business","Who is this?"),("Service","What do they need?"),("Status","Where are they now?"),("Last Contact","What happened last?"),("Next Follow-Up","When do I act?"),("Next Action","What exactly do I do?"),("Outcome","How did it end?")])
        gap=9;height=min(64,(top-196-3*gap)/4)
        for i,(label,desc) in enumerate(fields):
            col=i%2;row=i//2;x=36+238*col;y=top-(row+1)*height-row*gap
            box(c,x,y,230,height,C["white"],12,C["line"])
            c.setFont("DSansBold",9.5);c.setFillColor(C["black"]);c.drawString(x+13,y+height-21,label)
            text(c,desc,x+13,y+height-28,204,"small")
        bottom=top-4*height-3*gap;ch=min(97,bottom-56-13);assert ch>65
        box(c,36,57,468,ch,C["blue"],15)
        c.setFont("DSansBold",9.2);c.setFillColor(C["black"]);c.drawString(50,57+ch-23,"ABRE EL TRACKER EDITABLE" if es else "OPEN THE EDITABLE LEAD TRACKER")
        text(c,"Usa Próximo Follow-Up como tu lista de trabajo diaria." if es else "Use the Next Follow-Up column as your daily work list.",50,57+ch-28,278,"small")
        box(c,375,57+ch-56,116,34,C["yellow"],17)
        c.setFont("DSansBold",8.2);c.drawCentredString(433,57+ch-42,"ABRIR TRACKER →" if es else "OPEN TRACKER →")
        c.linkURL(tracker,(375,57+ch-56,491,57+ch-22),relative=0)
    elif n==10:
        top=header(c,"NÚMEROS SEMANALES" if es else "WEEKLY NUMBERS","Mide cinco cosas, no veinte." if es else "Track five numbers, not twenty.","Solo necesitas suficiente visibilidad para ver dónde se están frenando los leads." if es else "You only need enough visibility to see where leads are slowing down.",10)
        items=([("NUEVAS CONSULTAS","¿Cuántas oportunidades reales entraron?"),("COTIZACIONES ENVIADAS","¿Cuántos leads llegaron a precio?"),("RESERVADOS","¿Cuántos se convirtieron en trabajos?"),("FOLLOW-UPS PENDIENTES","¿Cuánta atención está esperando?"),("PERDIDOS / CERRADOS","¿Dónde se están cayendo los leads?")] if es else [("NEW INQUIRIES","How many real opportunities came in?"),("QUOTES SENT","How many leads reached pricing?"),("BOOKED","How many became jobs?"),("FOLLOW-UPS DUE","How much attention is waiting?"),("LOST / CLOSED","Where are leads dropping off?")])
        rows(c,items,top,158)
        callout(c,"PREGUNTA ÚTIL" if es else "USEFUL QUESTION","¿En qué etapa se frenan tus leads?" if es else "At which stage are your leads slowing down?","Antes de cotizar, después de cotizar o justo antes de reservar: eso te dice qué debes mejorar." if es else "Before quoting, after quoting or right before booking: that tells you what to improve.",54,93)
    elif n==11:
        top=header(c,"LA BRECHA DEL SISTEMA" if es else "THE SYSTEM GAP","Si esto se siente como demasiado trabajo manual, también es información." if es else "If this feels like too much manual work, that is useful information.","Tal vez tu negocio ya creció más que tu memoria y las herramientas desconectadas." if es else "The business may have outgrown memory, scattered messages and disconnected tools.",11)
        top=min(top,442);bottom=200;height=top-bottom
        box(c,36,bottom,228,height,C["white"],16,C["line"]);box(c,276,bottom,228,height,C["blue"],16)
        old=["Revisar DMs, textos y email","Copiar datos del cliente","Acordarte del follow-up","Reabrir conversaciones viejas","Mover trabajos manualmente"] if es else ["Check DMs, texts and email","Copy client details","Remember to follow up","Re-open old conversations","Move booked jobs manually"]
        new=["Solicitud capturada una vez","Datos juntos","Follow-up activado","Estado siempre visible","Booking como próximo paso"] if es else ["Request captured once","Client details stay together","Follow-up is triggered","Status is always visible","Booking becomes the next step"]
        for x,label,title,items in [(36,"MANUAL","Cómo se siente" if es else "What it feels like",old),(276,"CONECTADO" if es else "CONNECTED","Cómo podría sentirse" if es else "What it could feel like",new)]:
            c.setFillColor(C["black"]);c.setFont("DSansBold",9.2);c.drawString(x+15,top-25,label)
            c.setFont("DSerif",11.7);c.drawString(x+15,top-48,title)
            for i,item in enumerate(items):
                yy=top-78-i*30;c.setFillColor(C["mauve"] if x==36 else C["black"]);c.circle(x+17,yy+4,3,fill=1,stroke=0);text(c,item,x+29,yy+11,186,"small")
        box(c,36,86,468,91,C["white"],16,C["line"])
        c.setFillColor(C["black"]);c.setFont("DSansBold",8.8);c.drawString(51,153,"EL FLUJO" if es else "THE FLOW")
        flow=["REQUEST","CONFIRMA","COTIZA","FOLLOW-UP","BOOK","JOB"] if es else ["REQUEST","CONFIRM","QUOTE","FOLLOW-UP","BOOK","JOB"]
        x=50
        for i,label in enumerate(flow):
            width=65 if len(label)>7 else 61;box(c,x,109,width,28,C["blue"] if i%2==0 else C["yellow"],12)
            c.setFont("DSansBold",7.2);c.setFillColor(C["black"]);c.drawCentredString(x+width/2,119,label)
            x+=width+(4 if i<5 else 0)
            if i<5:
                c.setFont("DSansBold",7);c.drawCentredString(x-2,121,"›");x+=8
        assert x<=510
def fetch(id):
    import urllib.request
    urls=[f"https://drive.google.com/uc?export=download&id={id}",f"https://drive.usercontent.google.com/download?id={id}&export=download&confirm=t"]
    errors=[]
    for url in urls:
        try:
            r=urllib.request.urlopen(urllib.request.Request(url,headers={"User-Agent":"Mozilla/5.0"}),timeout=35)
            data=r.read()
            if data.startswith(b"%PDF"):return data
            errors.append(f"unexpected payload from {url}: {data[:60]!r}")
        except Exception as ex:errors.append(str(ex))
    raise RuntimeError("Cannot fetch original Starter Kit PDF: "+"; ".join(errors))
for lang,id in SOURCE_IDS.items():
    doc=fitz.open(stream=fetch(id),filetype="pdf")
    assert len(doc)==12,(lang,len(doc))
    link=doc[7].get_links()[0]["uri"]
    for n in (2,6,8,10,11):
        bio=BytesIO();c=canvas.Canvas(bio,pagesize=(W,H),pageCompression=1);page(c,n,lang,link);c.save()
        patch=fitz.open(stream=bio.getvalue(),filetype="pdf")
        doc.delete_page(n-1);doc.insert_pdf(patch,from_page=0,to_page=0,start_at=n-1,links=True)
    doc.set_metadata({"title":"The Launch Era — Cleaning Lead-to-Booking Starter Kit","author":"The Launch Era"})
    output=BASE/f"cleaning-lead-tracker-{lang}.pdf"
    doc.save(output,garbage=3,deflate=True)
    check=fitz.open(output)
    assert len(check)==12 and any(item.get("uri")==link for item in check[7].get_links())
    print(f"Built {output}: {output.stat().st_size} bytes, 12 pages")
