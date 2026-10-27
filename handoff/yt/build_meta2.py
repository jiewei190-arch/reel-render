import json
FOOT='\n\n🔔 Subscribe for a new explainer every day.\n'
M=[
('lightning','A lightning bolt is 5x hotter than the Sun\'s surface ⚡',
 "Lightning is about 5x hotter than the surface of the Sun, but the flash you see is only the last step. Here's how it really works: charge builds in the cloud, a stepped leader heads down, a streamer rises up to meet it, and the return stroke makes the flash. Count the seconds between flash and thunder, then divide by 5 for the distance in miles.\n\nSources: NWS, NOAA NSSL, Britannica. Speeds and temperatures are quoted as ranges because sources differ.",
 ['#lightning','#science','#howitworks','#storm','#Shorts'],'5× HOTTER\nTHAN THE SUN','2026-11-01','08:00'),
('chip','Your phone\'s chip starts as SAND (how it\'s really made) 📱',
 "Silicon is purified, grown into a giant crystal, sliced into wafers, then printed with light through masks, layer after layer. ASML says a modern chip can have up to 100 layers, and the finest ones use extreme ultraviolet light at 13.5 nanometers. Plus: the \"5 nanometer\" in chip names is a marketing name. It no longer measures any physical feature on the chip.\n\nSources: Intel, ASML, Britannica, imec, EE Journal.",
 ['#chips','#technology','#howitworks','#semiconductor','#Shorts'],'PHONE CHIPS\nSTART AS SAND','2026-11-01','13:00'),
('scene','How a Crime Scene Really Works (Locard\'s Principle Explained) 🔍',
 "Every time two things touch, something moves between them. That's Locard's principle, and it's why investigators secure a crime scene, photograph and sketch it before anything is moved, develop hidden fingerprints, and keep a signed chain of custody for every piece of evidence.\n\nFun fact: researchers say it's impossible to prove that no two fingerprints are identical. Real procedures vary by agency and case.\n\nSources: NIJ, NIST, Duke Judicature.",
 ['#forensicscience','#crimescene','#howitworks','#fingerprints','#Shorts'],'EVERY TOUCH\nLEAVES A TRACE','2026-11-01','19:00'),
('sun','The sunlight on your face took up to a MILLION years to escape the Sun ☀️',
 "The sunlight on your face was made in the Sun's core. Estimates say it took 100,000 to about a million years to escape, then only 8 minutes 20 seconds to reach you. Here is how the Sun really works: fusion at about 15 million degrees, gravity vs pressure, and a very long random walk out. (These are estimates and sources differ.)\n\nSources: NASA, NOAA SWPC, Harvard CfA, UT Austin, Smithsonian.",
 ['#sun','#space','#science','#howitworks','#Shorts'],'A MILLION YEARS\nTO ESCAPE','2026-11-02','08:00'),
('cables','Sharks DON\'T cut the internet. Here\'s what does 🌊',
 "Everyone blames sharks, but fishing gear and ship anchors cause about 65 to 75 percent of undersea cable breaks (ICPC). Here's how the internet really crosses an ocean: pulses of light in glass fibers, boosted by repeaters, powered from the shore.\n\nSources: TeleGeography, ISCPC, ICPC via Fibre Systems, Britannica, SubTel Forum.",
 ['#howitworks','#underseacables','#internet','#tech','#Shorts'],'SHARKS DON\'T\nCUT THE WEB','2026-11-02','13:00'),
('polygraph','The lie detector doesn\'t detect lies',
 "The lie detector doesn't detect lies. It records breathing, heart rate, blood pressure and sweat, and a person has to interpret what those changes mean. In 2003 the National Academies called the evidence \"scanty and scientifically weak.\"\n\nSources: National Academies (2003), Faigman et al., Psychology Today. The spy example in the video is a hypothetical.",
 ['#polygraph','#liedetector','#howitworks','#science','#Shorts'],'LIE DETECTORS\nDON\'T DETECT','2026-11-02','19:00'),
('plane','Planes DON\'T fly because of a longer top ✈️ (NASA says so)',
 "You were probably taught that air has to race over a longer top surface to meet the air underneath. NASA says that \"equal transit time\" idea is wrong: air over the top actually reaches the back edge first, and many wings, like symmetrical ones, don't even have a longer top. Here is how a plane really flies: the wing turns the air downward, the air pushes back, and lower pressure on top describes the same lift.\n\nSources: NASA Glenn, FAA Pilot's Handbook of Aeronautical Knowledge.",
 ['#aviation','#physics','#howitworks','#science','#Shorts'],'WHY PLANES\nREALLY FLY','2026-11-03','08:00'),
('dna','How a Distant Cousin\'s DNA Solved a Cold Case 🧬',
 "How does a distant cousin's DNA catch a killer? Five steps: crime-scene DNA, upload the profile to a public genealogy website (GEDmatch), the site shows how much DNA people share, genealogists build family trees from public records, and a lab confirms the match. In the 2018 Golden State Killer case that narrowed the list to six men. Privacy critics say relatives who uploaded their DNA never agreed to police searches. In 2019 the site made police searches opt-in.\n\nSources: Axios, CBS News, KTVU, ABC7, NIJ, Parabon.",
 ['#dna','#geneticgenealogy','#howitworks','#forensicscience','#Shorts'],'COLD CASE\nSOLVED BY DNA','2026-11-03','13:00'),
('elec','Electrons crawl at 23 µm/s, so why is the light instant? ⚡',
 "Electrons in a wire crawl at about 23 micrometers per second. So why does the light turn on instantly? Here's how electricity really works: the generator, the signal, where the energy actually flows, and why power lines use high voltage.\n\nSources: Georgia State HyperPhysics, University of Illinois, U.S. EIA, University of Calgary Energy Education.",
 ['#electricity','#science','#howitworks','#physics','#Shorts'],'ELECTRONS\nCRAWL','2026-11-03','19:00'),
('reactor','A nuclear power plant is basically a very fancy kettle ⚛️',
 "A nuclear plant boils water into steam that spins a turbine, just like a kettle, except the heat comes from splitting uranium atoms. Here is how the chain reaction, the control rods, the moderator and the fuel really work, and why, according to the World Nuclear Association, a power reactor cannot explode like a nuclear bomb.\n\nSources: U.S. DOE, World Nuclear Association, U.S. NRC.",
 ['#nuclear','#energy','#science','#howitworks','#Shorts'],'A FANCY\nKETTLE','2026-11-04','08:00'),
]
out=[]
for id,title,desc,tags,tt,d,t in M:
    assert len(title)<=100
    out.append(dict(id=id,file=f'up/{id}.mp4',title=title,description=desc+FOOT+' '.join(tags),tags=tags,thumb_text=tt,date=d,time=t))
json.dump(out,open('meta2.json','w'),indent=1,ensure_ascii=False)
print(len(out))
