"""Generate original, generic engineering SVG assets for STAR Technologies.

The drawings are category illustrations, not photographs or replicas of specific models.
Run: python scripts/generate-assets.py
"""
from pathlib import Path
import math

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public' / 'images'
OUT.mkdir(parents=True, exist_ok=True)

DEFS = '''<defs>
 <linearGradient id="front" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#344553"/><stop offset=".3" stop-color="#172736"/><stop offset="1" stop-color="#111d29"/></linearGradient>
 <linearGradient id="side" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#152533"/><stop offset="1" stop-color="#08141f"/></linearGradient>
 <linearGradient id="top" x1="0" y1="1" x2="1" y2="0"><stop stop-color="#293e4f"/><stop offset=".55" stop-color="#637989"/><stop offset="1" stop-color="#2e4353"/></linearGradient>
 <linearGradient id="metal" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#f5f8fa"/><stop offset=".2" stop-color="#cbd5dd"/><stop offset="1" stop-color="#7f93a3"/></linearGradient>
 <linearGradient id="unit" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#435461"/><stop offset=".15" stop-color="#283b4a"/><stop offset="1" stop-color="#1a2936"/></linearGradient>
 <linearGradient id="cyan" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#b3eaff"/><stop offset="1" stop-color="#4b98d4"/></linearGradient>
 <radialGradient id="ambient"><stop stop-color="#50bcff" stop-opacity=".25"/><stop offset="1" stop-color="#50bcff" stop-opacity="0"/></radialGradient>
 <filter id="shadow" x="-35%" y="-35%" width="180%" height="190%"><feGaussianBlur in="SourceAlpha" stdDeviation="8"/><feOffset dy="10" result="offset"/><feColorMatrix in="offset" type="matrix" values="0 0 0 0 0.04 0 0 0 0 0.12 0 0 0 0 0.19 0 0 0 .2 0" result="shade"/><feMerge><feMergeNode in="shade"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
 <filter id="glow" x="-150%" y="-150%" width="400%" height="400%"><feGaussianBlur stdDeviation="3"/></filter>
 <pattern id="mesh" width="6" height="6" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#6b879a" opacity=".27"/></pattern>
</defs>'''

def svg(body, view='0 0 480 320'):
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{view}" fill="none">{DEFS}{body}</svg>\n'

def rect(x,y,w,h,fill,rx=0,extra=''):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{rx}" fill="{fill}" {extra}/>'

def line(x1,y1,x2,y2,color,width=1,extra=''):
    return f'<path d="M{x1} {y1}L{x2} {y2}" stroke="{color}" stroke-width="{width}" {extra}/>'

def circle(x,y,r,fill,extra=''):
    return f'<circle cx="{x}" cy="{y}" r="{r}" fill="{fill}" {extra}/>'

def iso_box(x,y,w,h,d=35,slant=.15,front='url(#front)',side='url(#side)',top='url(#top)'):
    s = w*slant
    return (f'<path d="M{x} {y}l{d} {-d*.58} {w} {s} {-d} {d*.58}Z" fill="{top}" stroke="#91a8b9" stroke-opacity=".24"/>'
        f'<path d="M{x+w} {y+s}l{d} {-d*.58}v{h}l{-d} {d*.58}Z" fill="{side}" stroke="#506778" stroke-opacity=".4"/>'
        f'<g transform="matrix(1 {slant} 0 1 {x} {y})">'
        +rect(0,0,w,h,front,2,'stroke="#657b8e" stroke-opacity=".6"'))

def screw(x,y,color='#8094a3'):
    return circle(x,y,1.65,color)+line(x-.8,y,x+.8,y,'#233646',.65)

def rack_row(y,w=150,i=0):
    b=rect(17,y,w-34,36,'url(#unit)',1,'stroke="#526b7e" stroke-width=".6"')
    b+=rect(23,y+6,6,23,'#6c8292',1)+rect(w-30,y+6,6,23,'#6c8292',1)
    for j in range(4):
        bx=35+j*(w-79)/4
        b+=rect(round(bx,2),y+5,round((w-87)/4,2),25,'#111f2b',1,'stroke="#4e6170" stroke-width=".5"')
        b+=rect(round(bx+2,2),y+8,round((w-103)/4,2),2,'#7b8c96')
        for k in range(4):
            b+=line(round(bx+3,2),y+13+k*3,round(bx+(w-95)/4,2),y+13+k*3,'#50616f',.65)
        b+=circle(round(bx+4,2),y+26,1,'#9ce3ff' if (j+i)%3 else '#61a486')
    b+=screw(20,y+3)+screw(w-20,y+32)
    return b

def cabinet(x,y,w=180,h=490,detail=1):
    b=iso_box(x,y,w,h,56,.18)
    b+=rect(7,7,w-14,h-15,'#0c1b28',1,'stroke="#496276" stroke-width="1"')
    b+=rect(9,9,w-18,h-19,'url(#mesh)')
    b+=rect(13,17,7,h-35,'#344c5e')+rect(w-20,17,7,h-35,'#344c5e')
    for yy in range(24,h-20,15):
        b+=rect(15,yy,3,5,'#071722')+rect(w-18,yy,3,5,'#071722')
    b+=rect(25,19,w-50,20,'#192e3e',2,'stroke="#486679" stroke-width=".7"')
    b+=rect(33,26,34,4,'#b4d2e4',1)
    b+=rect(w-68,25,26,5,'url(#cyan)',1)
    for n,yy in enumerate(range(48,h-88,42)):
        b+=rack_row(yy,w,n)
    b+=rect(27,h-51,w-54,26,'#152a39',1)
    for j in range(16):
        b+=line(33+j*(w-68)/16,h-46,33+j*(w-68)/16,h-32,'#536b7e',1.2)
    b+=line(5,9,5,h-8,'#7b9eb5',1.5)+line(w-5,9,w-5,h-8,'#577b93',1.1)
    b+=rect(w-10,h*.42,4,49,'#849ead',1)
    b+=circle(w-8,h*.42+39,1.1,'#142b3d')
    b+='</g>'
    # Side ventilation and horizontal panel seams.
    for yy in (65,170,280,390):
        if yy>h-40:continue
        for k in range(9):
            b+=f'<path d="M{x+w+10} {y+w*.18+yy+k*4}l33 -19" stroke="#476070" stroke-opacity=".3" stroke-width="1.3"/>'
    b+=f'<path d="M{x+w+47} {y+w*.18-23}v{h-15}" stroke="#7595ad" stroke-opacity=".3"/>'
    return b

# Hero: three original isometric cabinets and disciplined infrastructure lines.
hero='<ellipse cx="473" cy="648" rx="360" ry="122" fill="url(#ambient)"/>'
hero+='<g stroke="#4390c4" stroke-width="1" opacity=".15">'
for n in range(5):
    hero+=f'<path d="M{40+n*80} {688+n*18}l420 -240 350 78"/>'
hero+='</g>'
hero+='<path d="M153 749l416 -238 251 56" stroke="#78c8f2" stroke-opacity=".35" stroke-width="1.2"/>'
hero+='<path d="M223 784l416 -238 133 30" stroke="#427499" stroke-opacity=".3"/>'
for x,y,r in [(153,749,4),(569,511,3),(820,567,4),(223,784,3),(639,546,3)]:
    hero+=circle(x,y,r,'#6fb3d9', 'opacity=".65"')+circle(x,y,r+8,'#65c6ff','opacity=".13"')
hero+='<g filter="url(#shadow)">'
hero+=cabinet(549,143,177,456)
hero+=cabinet(325,188,177,456)
hero+=cabinet(101,233,177,456)
hero+='</g>'
# Thin status ribbon and cable runs disappear behind the cabinets.
hero+='<g stroke-linecap="round"><path d="M783 214v357q0 18 -14 28l-51 30" stroke="#4585b2" stroke-width="3" opacity=".55"/><path d="M792 208v374q0 18 -14 28l-47 26" stroke="#72c6ed" stroke-width="1.5" opacity=".5"/></g>'
hero+='<path d="M118 720l166 31 56 -32" stroke="#81c4ef" stroke-opacity=".5"/>'
(OUT/'infrastructure.svg').write_text(svg(hero,'0 0 900 820'))

def card(body):
    return svg('<ellipse cx="249" cy="275" rx="158" ry="20" fill="#16364e" opacity=".055"/><g filter="url(#shadow)">'+body+'</g>')

# Rack: compact category version of the same drawing system.
racks='<g transform="translate(150 14) scale(.48)">'+cabinet(0,65,220,470)+'</g>'
(OUT/'racks.svg').write_text(card(racks))

# Pair of zero-U distribution strips.
pdu=''
for x,y in [(260,44),(170,63)]:
    pdu+=iso_box(x,y,46,215,18,.13)
    pdu+=rect(7,7,32,23,'#071823',2)+rect(11,11,24,9,'#88bbd8',1)
    for i in range(8):
        yy=37+i*21
        pdu+=rect(7,yy,32,17,'#111e28',2,'stroke="#718692" stroke-width=".6"')
        pdu+=rect(13,yy+5,3,6,'#85949b',.5)+rect(29,yy+5,3,6,'#85949b',.5)+rect(22,yy+10,3,4,'#85949b',.5)
    pdu+=screw(4,5)+screw(42,208)+'</g>'
    pdu+=f'<path d="M{x+17} {y+219}q-2 35 41 24" stroke="#526879" stroke-width="5" stroke-linecap="round"/>'
(OUT/'pdu.svg').write_text(card(pdu))

# Tower UPS with status LCD and perforated intake.
ups=iso_box(158,54,131,210,52,.12)
ups+=rect(9,11,113,183,'#132636',3,'stroke="#50697c" stroke-width=".8"')
ups+=rect(34,28,63,40,'#071b2b',3,'stroke="#648697" stroke-width="1"')
ups+=rect(39,33,53,24,'#73b2d3',1)
ups+=rect(44,39,28,3,'#163d55',1)+rect(44,45,39,2,'#326078',1)+rect(44,50,22,2,'#326078',1)
for j in range(3):ups+=circle(46+j*19,63,2,'#6d8391')
ups+=circle(66,82,4,'#71c6ea')
ups+=rect(22,100,87,81,'#0b1d2a',2)
for yy in range(105,177,5):ups+=line(28,yy,103,yy,'#567284',1.1)
ups+=screw(16,17)+screw(116,17)+screw(16,187)+screw(116,187)+'</g>'
(OUT/'ups.svg').write_text(card(ups))

# Three generic sealed energy modules with recessed handles and terminals.
batteries=''
for x,y in [(231,97),(148,115),(65,136)]:
    batteries+=iso_box(x,y,99,116,36,.1,front='url(#front)')
    batteries+=rect(8,14,83,84,'#223746',3,'stroke="#587184" stroke-width=".7"')
    batteries+=rect(27,18,45,11,'#102432',2,'stroke="#627f94" stroke-width=".6"')
    batteries+=rect(27,51,44,26,'#8ba0af',2)+rect(32,57,34,2,'#536e81',1)+rect(32,63,24,2,'#536e81',1)
    for i in range(4):batteries+=line(18+i*21,34,18+i*21,96,'#527086',.7,'opacity=".5"')
    batteries+='</g>'
    batteries+=rect(x+18,y-10,11,12,'#81a8ba',1)+rect(x+73,y-4,11,12,'#8296a2',1)
    batteries+=rect(x+18,y-10,11,3,'#88c9e8',1)+rect(x+73,y-4,11,3,'#2a4150',1)
(OUT/'batteries.svg').write_text(card(batteries))

# In-row cooling with visible fan geometry.
cooling=iso_box(157,48,128,217,49,.11,front='url(#metal)',side='#405666',top='url(#metal)')
cooling+=rect(10,11,108,190,'#172c3d',2,'stroke="#5c7180" stroke-width="1"')
cooling+=rect(20,20,88,24,'#293f50',2)+rect(29,25,37,12,'#76badd',1)
for cy in (85,153):
    cooling+=circle(64,cy,29,'#0d1e2c','stroke="#7290a4" stroke-width="1.4"')
    for k in range(7):
        a=k*360/7
        cooling+=f'<path d="M64 {cy}q-17 -20 1 -25q15 12 -1 25" fill="#435e72" transform="rotate({a} 64 {cy})"/>'
    cooling+=circle(64,cy,8,'url(#metal)')
    for rr in (16,23):cooling+=circle(64,cy,rr,'none','stroke="#90afc2" stroke-opacity=".25" stroke-width=".6"')
cooling+=rect(18,188,94,5,'#426176',1)+screw(15,16)+screw(113,16)+'</g>'
cooling+='<path d="M132 102q-28 8 -21 25m-5 19q-28 8 -21 25" stroke="#68b4dc" stroke-opacity=".6" stroke-width="2" stroke-linecap="round"/>'
(OUT/'cooling.svg').write_text(card(cooling))

def horizontal_unit(x,y,w,h,kind):
    b=iso_box(x,y,w,h,46,.09,front='url(#metal)')
    b+=rect(9,7,w-18,h-14,'#243b4c',2,'stroke="#a8bdcb" stroke-width=".7"')
    b+=rect(-3,12,12,h-24,'#617d92',2)+rect(w-9,12,12,h-24,'#617d92',2)
    if kind=='server':
        for j in range(8):
            xx=22+j*30
            b+=rect(xx,12,27,h-24,'#0e2536',1,'stroke="#647e90" stroke-width=".7"')
            for k in range(4):b+=line(xx+4,17+k*4,xx+22,17+k*4,'#758b99',.8)
            b+=circle(xx+22,h-16,1.25,'#86d3ed')
        b+=rect(w-39,13,20,9,'#8fb7ca',1)+circle(w-29,h-16,2.5,'#89d8ec')
    elif kind=='storage':
        for row in range(2):
            for col in range(12):
                xx=18+col*23.5; yy=13+row*38
                b+=rect(xx,yy,21,33,'#122b3d',1,'stroke="#7694a7" stroke-width=".7"')
                b+=rect(xx+3,yy+4,15,2,'#879ead',.5)
                for k in range(4):b+=line(xx+4,yy+10+k*3,xx+16,yy+10+k*3,'#58748a',.8)
                b+=circle(xx+5,yy+28,1.2,'#6ac4e2')+circle(xx+11,yy+28,.9,'#85ab98')
    elif kind=='network':
        for row in range(2):
            for col in range(12):
                xx=20+col*19; yy=12+row*18
                b+=rect(xx,yy,16,13,'#0a1e2d',1,'stroke="#91a9b8" stroke-width=".6"')
                b+=rect(xx+4,yy+1,8,3,'#718898',.5)
                for k in range(4):b+=line(xx+4+k*2.5,yy+8,xx+4+k*2.5,yy+11,'#afbac1',.8)
                b+=circle(xx+13,yy+3,.9,'#7acdeb')
        for col in range(4):b+=rect(255+col*13,18,10,18,'#a2b5c2',1)+rect(257+col*13,21,6,12,'#153147',.5)
    b+=screw(5,7)+screw(w-5,7)+screw(5,h-7)+screw(w-5,h-7)
    return b+'</g>'

servers=horizontal_unit(62,150,320,53,'server')+horizontal_unit(62,95,320,53,'server')
(OUT/'servers.svg').write_text(card(servers))
storage=horizontal_unit(63,108,320,96,'storage')
(OUT/'storage.svg').write_text(card(storage))
network=horizontal_unit(62,139,320,54,'network')
network+='<path d="M109 197q-5 26 30 33h89" stroke="#579ac1" stroke-width="3" stroke-linecap="round" opacity=".8"/>'
(OUT/'network.svg').write_text(card(network))

(ROOT/'public'/'favicon.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="15" fill="#091725"/><path d="M32 7l6.8 18.2L57 32l-18.2 6.8L32 57l-6.8-18.2L7 32l18.2-6.8Z" fill="#79bded"/><path d="M32 17v30M17 32h30" stroke="#d5f0ff" stroke-width="1.2"/></svg>\n')
print(f'Generated 9 illustrations in {OUT} and public/favicon.svg')
