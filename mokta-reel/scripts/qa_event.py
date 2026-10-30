import sys, subprocess, numpy as np
# Uso: qa_event.py video offset_frames event_frame_global
vid, off, ev = sys.argv[1], int(sys.argv[2]), int(sys.argv[3])
W,H=270,480
raw=subprocess.run(["ffmpeg","-v","error","-i",vid,"-vf",f"scale={W}:{H}","-f","rawvideo","-pix_fmt","gray","-"],capture_output=True).stdout
fr=np.frombuffer(raw,np.uint8).reshape(-1,H,W).astype(float)
s=lambda g: g-off
# zona de la barrera (centro, alrededor del horizonte) vs resto
by0,by1,bx0,bx1=int(H*0.40),int(H*0.52),int(W*0.15),int(W*0.85)
print("frame  lum_global  lum_zona_barrera  diff_vs_anterior(zona)  diff_global")
for g in range(ev-8, ev+3):
    i=s(g)
    if i<1 or i>=len(fr): continue
    a,b=fr[i],fr[i-1]
    z=a[by0:by1,bx0:bx1]; zb=b[by0:by1,bx0:bx1]
    print(f"{g:5d}  {a.mean():8.2f}  {z.mean():10.2f}  {np.abs(z-zb).mean():12.2f}  {np.abs(a-b).mean():10.2f}{'   <- BARRERA' if g==ev else ''}")
