# procedural campfire crackle + pop (project-local SFX)
import numpy as np, soundfile as sf, sys
from scipy.signal import butter, lfilter
out=sys.argv[1]; SR=48000; r=np.random.default_rng(3)
D=float(sys.argv[2]) if len(sys.argv)>2 else 25.9; n=int(SR*D)
b,a=butter(2,[300/(SR/2),2500/(SR/2)],'band'); hiss=lfilter(b,a,r.normal(0,1,n))*0.035
b2,a2=butter(2,180/(SR/2)); rumble=lfilter(b2,a2,r.normal(0,1,n))*0.25
x=hiss+rumble; t=0.0
while True:
    t+=r.exponential(0.06); i=int(t*SR); L=int(SR*r.uniform(0.002,0.012))
    if i+L>=n: break
    x[i:i+L]+=r.normal(0,1,L)*np.exp(-np.linspace(0,6,L))*r.uniform(0.05,0.45)
f=int(SR*0.4); x[:f]*=np.linspace(0,1,f)
i0=int((D-0.72)*SR); i1=int((D-0.45)*SR); x[i0:i1]*=np.linspace(1,0,i1-i0); x[i1:]=0   # the fire dies 0.45 s before the end of the clip
x=x/np.abs(x).max()*0.7
sf.write(out+'/fire_crackle.wav',np.stack([x,x*0.97],1).astype(np.float32),SR)
L=int(SR*0.5); p=np.zeros(L); k=int(SR*0.004); p[:k]=r.normal(0,1,k)*np.linspace(1,0,k)
tt=np.arange(L)/SR; p+=np.sin(2*np.pi*90*tt)*np.exp(-tt*28)*0.6
for j in range(6):
    s=int(SR*r.uniform(0.02,0.3)); m=int(SR*0.005); p[s:s+m]+=r.normal(0,1,m)*np.exp(-np.linspace(0,5,m))*0.3
p=p/np.abs(p).max()*0.9
sf.write(out+'/fire_pop.wav',np.stack([p,p],1).astype(np.float32),SR)
print('ok')
