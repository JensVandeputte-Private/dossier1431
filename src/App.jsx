import { useState, useEffect, useRef } from "react";
import { db, ref, set, get, onValue } from "./firebase";

const WOORD = { rood:"VRIENDEN", blauw:"VIJANDEN" };
const SEQ   = { rood:[1,2,3,4,5,6,7,8], blauw:[8,7,6,5,4,3,2,1] };
const PTS   = { correct:150, foto:50, fout:-50, woord:100 };
const PIN   = "1431";

const STOPS = {
  1:{ naam:"Aître Saint-Maclou", intro:"Lang voor jullie hier stonden, was dit geen plaats voor leven… maar voor levende doden. De pest liet geen onderscheid toe—rijk of arm, gelovig of niet.\n\nAngst heerste. En waar angst groeit… verdwijnt nuance. Onthoud dat!\n\nWant ook het proces van Jeanne begon… niet met feiten… maar met angst.", heeftFoto:true, fototype:"foto", cryptisch:"Ik ben klein tussen de doden\nAan de muur ben ik geboden.\nGeen bot, geen steen, geen teken fijn,\nMaar toch moet ik er ergens zijn.\nEen stille wachter zonder stem —\nWaar ben ik? Wie houdt mij klem?", type:"tekst", vraag:"Wat ben ik?", antw:"KAT", opties:null, cIdx:null, codes:null, letter:{rood:"E",blauw:"E"}, bonus:null, volg:{rood:2,blauw:"finale"} },
  2:{ naam:"Rue Eau de Robec", intro:"Ik heb jullie het leven gegeven en ben ouder dan de stenen rondom mij. Ik heb nog nooit stilgestaan en toch ben ik nooit moe.\n\nIk heb meer gehoord dan eender welke getuige. Zo ging het ook met Jeanne. Wat begon als bewondering, werd gefluister en eindigde als een beschuldiging.", heeftFoto:false, fototype:null, cryptisch:null, type:"tekst", vraag:"Rarara wa benne kik?\nTip: het is niet repelsteeltje", antw:"WATER", opties:null, cIdx:null, codes:null, letter:{rood:"V",blauw:"A"}, bonus:null, volg:{rood:3,blauw:1} },
  3:{ naam:"Tour Jeanne d'Arc", intro:"Ooit stond er een groot kasteel in het centrum van Rouen waar nu slechts een klein deel van overblijft. Het deel waar Jeanne gevangen werd gehouden tot aan haar proces.\n\nWie hier binnenkwam met trots en overtuiging, verliet deze plek met twijfel en onuitwisbare wonden.", heeftFoto:true, fototype:"foto", cryptisch:"Zoek de plek waar steen de geschiedenis prijsgeeft.", type:"mc", vraag:"Ontcijfer het jaar onder de woorden 'Ville de Rouen'.", antw:null, opties:["1205","1525","1995","1914"], cIdx:3, codes:null, letter:{rood:"I",blauw:"J"}, bonus:{ tekst:"Spreek een voorbijganger aan in een taal naar keuze en vraag of ze leuke restaurantjes kennen in Rouen.\n\nStuur de video door via WhatsApp.", hint:"\"Zij heeft mannenkleding gedragen… tegen de wet van God.\"" }, volg:{rood:4,blauw:2} },
  4:{ naam:"Église Saint-Maclou", intro:"Geloof kan een kracht zijn… maar ook een gevaar.\nVoor Jeanne was het geen keuze—maar een zekerheid.\nZe volgde wat ze hoorde, zonder twijfel.\n\nMaar wat gebeurt er wanneer jouw waarheid botst met die van een machtig instituut?", heeftFoto:true, fototype:"foto", cryptisch:"Waar mensen fluisteren,\nmaar geloven dat ze gehoord worden.\nWaar steen omhoog reikt,\nalsof het iets probeert te bereiken dat nooit zichtbaar is.\nZoek het gezicht dat waakt over de ingang.", type:"tekst", vraag:"Wat houd ik vast?", antw:"JEZUS", opties:null, cIdx:null, codes:null, letter:{rood:"R",blauw:"N"}, bonus:{ tekst:"Maak een filmpje waarbij je met je team de autoriteit van de Kerk weigert. Wees creatief! Houd het een beetje respectvol.\n\nStuur de video door via WhatsApp.", hint:"\"Jeanne zei: Ik onderwerp mij aan God… Ik zal mij niet onderwerpen aan de Kerk op aarde.\"" }, volg:{rood:5,blauw:3} },
  5:{ naam:"Palais de Justice", intro:"Hier wordt recht gesproken.\nOf toch… dat hoopt men.\nMaar recht zonder verdediging…\nis geen rechtvaardigheid.\n\nJeanne stond hier alleen. Geen stem naast haar. Geen bescherming. Alleen overtuiging… tegenover een machtig systeem.", heeftFoto:true, fototype:"video", cryptisch:"De Rechtbank.\n\nIemand van jullie team heeft de laatste croissant van de ontbijttafel gestolen en zich opgesloten in de wc om die smakelijk op te eten. Sloebere!\n\nOpdracht: Speel een miniproces na waarbij er één croissantdief is, één rechter, één getuige en één aanklager. Iedereen moet even aan het woord komen.\n\nStuur de video door via WhatsApp en wacht op de geheime code van Jens of Sean.", type:"code", vraag:null, antw:null, opties:null, cIdx:null, codes:{rood:"8426",blauw:"5584"}, letter:{rood:"N",blauw:"D"}, bonus:null, volg:{rood:6,blauw:4} },
  6:{ naam:"Jardin de l'Hôtel de Ville", intro:"Weten jullie waar het woord Normandië vandaan komt? Neen?\n\nVan de Noormannen natuurlijk! Ze kwamen hier aan te boot en wilden Parijs overnemen. De toenmalige Koning van Frankrijk maakte een deal met Rollo en gaf hem Normandië en de hand van zijn dochter Pippa.\n\nNormandië = Noormanland. Capiche?", heeftFoto:true, fototype:"foto", cryptisch:"Ik kom uit het Noorden, van zee en van strijd,\nMet schepen van hout voer ik wijd en zijd.\nMijn verhaal staat gegraveerd, maar waar ging ik heen?\nIn Jelling lieten ze mij niet alleen.\nMen kent mij om reizen, handel en kracht —\nZoek mij maar wees bedacht!", type:"tekst", vraag:"Blijkbaar ben ik de geschiedenisboeken ingegaan als de Koning met de blauwe tanden. Blauwtand of Bluetooth. Ik was Koning van Denemarken en Noorwegen. Kan je mijn naam vinden?", antw:"HARALD", opties:null, cIdx:null, codes:null, letter:{rood:"E",blauw:"V"}, bonus:null, volg:{rood:7,blauw:5} },
  7:{ naam:"Promenade Commandant Charcot", intro:"Vuur nam haar lichaam. Water nam de rest.\nGeen graf. Geen plaats om te herinneren.\n\nMen wilde haar herinnering wissen, zelfs na haar dood. Daarom werden haar assen in de Seine rivier gestrooid.\n\nMaar sommige verhalen laten zich niet verdrinken.", heeftFoto:true, fototype:"foto", cryptisch:"Het was Commandant Jean-Baptiste Charcot en zijn bemanning die in 1910 terugkwamen van de tweede expeditie naar Antarctica. Een herinnering in hun naam werd hier in 2010 opgehangen. Zoek de gedenksteen en neem er een foto van.", type:"tekst", vraag:"Wat was de naam van de boot waarmee ze naar Antarctica voeren? Vertaal de naam naar het Nederlands.", antw:"WAAROM NIET", opties:null, cIdx:null, codes:null, letter:{rood:"D",blauw:"I"}, bonus:null, volg:{rood:8,blauw:6} },
  8:{ naam:"Le Gros-Horloge", intro:"Ik oordeel niet. Ik kijk toe. Maar alles gebeurt voor mij tergend langzaam.\nEn ik wacht. Wat ooit zeker leek… wordt later in vraag gesteld. Wat ooit waarheid was… wordt herschreven.\n\nMisschien zijn jullie hier vandaag om dat opnieuw te doen?", heeftFoto:true, fototype:"foto", cryptisch:"Ik zie alles…\nmaar kies geen kant.\nIk beweeg, zonder oordeel en enkel met mijn armen.\nEn toch beslis ik meer dan wie dan ook.\nZoek mij… en lees wat ik nu zeg.", type:"mc", vraag:"Een vrouw heeft maandstonden. Dat weten de meesten onder jullie wel. De vrouw beweegt mee met de maancyclus. Zoek de maanstonde van vandaag.", antw:null, opties:["Volle maan (100%)","Wassende maan (0–50%)","Afnemende maan (50–100%)","Eerste kwartier (50%)"], cIdx:2, codes:null, letter:{rood:"N",blauw:"N"}, bonus:null, volg:{rood:"finale",blauw:7} },
};

const fmt   = s => `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;
const fmtTs = ts => { const d=new Date(ts); return `${d.getHours().toString().padStart(2,"0")}:${d.getMinutes().toString().padStart(2,"0")}:${d.getSeconds().toString().padStart(2,"0")}`; };
const TK    = { rood:"#dc2626", blauw:"#2563eb" };

const dbPath = t => `dossier1431/log_${t}`;

async function appendLog(team, entry) {
  try {
    const r    = ref(db, dbPath(team));
    const snap = await get(r);
    const cur  = snap.exists() ? snap.val() : [];
    cur.push({ ...entry, ts: Date.now() });
    await set(r, cur);
  } catch(e) { console.error("Firebase error", e); }
}

async function clearLogs() {
  try {
    await set(ref(db, dbPath("rood")),  []);
    await set(ref(db, dbPath("blauw")), []);
  } catch(e) {}
}

export default function App() {
  const [view,setView]           = useState("home");
  const [team,setTeam]           = useState(null);
  const [si,setSi]               = useState(0);
  const [sub,setSub]             = useState("arrive");
  const [letters,setLetters]     = useState([]);
  const [score,setScore]         = useState(0);
  const [timer,setTimer]         = useState(0);
  const [running,setRunning]     = useState(false);
  const [txtIn,setTxtIn]         = useState("");
  const [codeIn,setCodeIn]       = useState("");
  const [picked,setPicked]       = useState(null);
  const [fotoOk,setFotoOk]       = useState(false);
  const [bonusHint,setBonusHint] = useState(null);
  const [woordIn,setWoordIn]     = useState("");
  const [woordOk,setWoordOk]     = useState(false);
  const [popup,setPopup]         = useState(null);
  const [misMsg,setMisMsg]       = useState(false);
  const [scores,setScores]       = useState({rood:0,blauw:0});
  const [finPts,setFinPts]       = useState({rood:"",blauw:""});
  const [codeErr,setCodeErr]     = useState(false);
  const [extraHints,setExtraHints] = useState([]);
  const [pinIn,setPinIn]         = useState("");
  const [pinErr,setPinErr]       = useState(false);
  const [slLogs,setSlLogs]       = useState({rood:[],blauw:[]});
  const iv = useRef(null);

  useEffect(()=>{
    if(running) iv.current=setInterval(()=>setTimer(t=>t+1),1000);
    else clearInterval(iv.current);
    return()=>clearInterval(iv.current);
  },[running]);

  useEffect(()=>{
    if(view!=="spelleiders") return;
    const unsubRood  = onValue(ref(db, dbPath("rood")),  snap=>setSlLogs(p=>({...p,rood: snap.exists()?snap.val():[]})));
    const unsubBlauw = onValue(ref(db, dbPath("blauw")), snap=>setSlLogs(p=>({...p,blauw:snap.exists()?snap.val():[]})));
    return()=>{ unsubRood(); unsubBlauw(); };
  },[view]);

  const addPts = v => { setScore(s=>s+v); setPopup(v); setTimeout(()=>setPopup(null),1300); };
  const stop   = team ? STOPS[SEQ[team][si]] : null;
  const tk     = team ? TK[team] : "#111";
  const woord  = team ? WOORD[team] : "";
  const isLast = stop ? stop.volg[team]==="finale" : false;

  const log = extra => { if(team&&stop) appendLog(team,{stopId:SEQ[team][si],stopNaam:stop.naam,...extra}); };

  const reset = () => {
    setSi(0); setSub("arrive"); setLetters([]); setScore(0); setTimer(0);
    setRunning(false); setTxtIn(""); setCodeIn(""); setPicked(null);
    setFotoOk(false); setBonusHint(null); setMisMsg(false);
    setWoordIn(""); setWoordOk(false); setCodeErr(false); setExtraHints([]);
  };

  const nxtStop = () => {
    const v = stop.volg[team];
    if(v==="finale"){ setRunning(false); setScores(s=>({...s,[team]:score})); setView("finale"); }
    else {
      setSi(i=>i+1); setSub("arrive");
      setTxtIn(""); setCodeIn(""); setPicked(null);
      setFotoOk(false); setBonusHint(null); setMisMsg(false); setCodeErr(false);
    }
  };

  const doAntwoord = () => {
    if(misMsg) return;
    const val = stop.type==="tekst" ? txtIn.trim().replace(/\s+/g," ").toUpperCase() : stop.opties[picked];
    const ok  = stop.type==="tekst" ? val===stop.antw : picked===stop.cIdx;
    log({type:"antwoord",waarde:val,correct:ok});
    if(ok){ setLetters(l=>[...l,stop.letter[team]]); addPts(PTS.correct); setSub("correct"); }
    else  { addPts(PTS.fout); setMisMsg(true); }
    setTxtIn(""); setPicked(null);
  };

  const doCode = () => {
    const ok = codeIn.trim()===stop.codes[team];
    log({type:"code",waarde:codeIn.trim(),correct:ok});
    if(ok){ setLetters(l=>[...l,stop.letter[team]]); addPts(PTS.correct); setSub("correct"); setCodeIn(""); setCodeErr(false); }
    else  { setCodeErr(true); setTimeout(()=>setCodeErr(false),1800); }
  };

  const doWoord = () => {
    const ok = woordIn.trim().toUpperCase()===woord;
    appendLog(team,{stopId:"finale",stopNaam:"Place du Vieux Marché",type:"woord",waarde:woordIn.trim().toUpperCase(),correct:ok});
    if(ok){ setWoordOk(true); addPts(PTS.woord); setExtraHints(["\"Je zegt dat Sint-Catharina en Sint-Margaretha tot je spreken in je visioenen, maar hoe weet je dat ze echt heiligen zijn en geen duivels?\"","\"Jeanne: Ik moet God gehoorzamen eerder dan mensen.\""]); }
  };

  // ── styles ──
  const base = { fontFamily:"system-ui,-apple-system,sans-serif", WebkitFontSmoothing:"antialiased" };
  const wrap = { ...base, minHeight:"100vh", background:"#f5f5f5", display:"flex", flexDirection:"column", alignItems:"center", paddingBottom:80 };
  const page = { width:"100%", maxWidth:480, padding:"20px 16px", display:"flex", flexDirection:"column", gap:12 };
  const card = b => ({ background:"#fff", border:`1px solid ${b||"#e5e5e5"}`, borderRadius:12, padding:"16px" });
  const lbl  = { fontSize:11, letterSpacing:2, textTransform:"uppercase", color:"#999", display:"block", marginBottom:5 };
  const h1   = { fontSize:22, fontWeight:"700", margin:0, color:"#111" };
  const h2   = { fontSize:16, fontWeight:"600", margin:0, color:"#111" };
  const body = (c,sz) => ({ margin:0, fontSize:sz||14, lineHeight:1.75, color:c||"#444" });
  const divL = { border:"none", borderTop:"1px solid #e5e5e5", margin:"4px 0" };

  const Btn = ({c="#111",fill,children,onClick,style={}}) => (
    <button onClick={onClick} style={{background:fill?c:"#fff",color:fill?"#fff":c,border:`1.5px solid ${fill?c:"#d4d4d4"}`,borderRadius:10,padding:"13px 16px",fontSize:14,fontFamily:"inherit",cursor:"pointer",width:"100%",fontWeight:"600",...style}}>{children}</button>
  );
  const BtnSm = ({c="#666",children,onClick,style={}}) => (
    <button onClick={onClick} style={{background:"transparent",color:c,border:"1px solid #d4d4d4",borderRadius:8,padding:"9px 14px",fontSize:13,fontFamily:"inherit",cursor:"pointer",fontWeight:"500",...style}}>{children}</button>
  );
  const Inp = ({value,onChange,placeholder,type,onKeyDown,style={}}) => (
    <input value={value} onChange={onChange} placeholder={placeholder} type={type} onKeyDown={onKeyDown}
      style={{border:"1.5px solid #d4d4d4",borderRadius:8,fontSize:15,padding:"12px 14px",width:"100%",outline:"none",fontFamily:"inherit",boxSizing:"border-box",letterSpacing:type==="number"||type==="password"?"0":"2px",textTransform:type==="number"||type==="password"?"none":"uppercase",background:"#fafafa",...style}}/>
  );
  const LetterRow = () => (
    <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
      {woord.split("").map((_,i)=>(
        <div key={i} style={{width:36,height:36,borderRadius:8,border:`1.5px solid ${i<letters.length?tk:"#d4d4d4"}`,background:i<letters.length?tk:"#fff",color:i<letters.length?"#fff":"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:"700"}}>
          {i<letters.length?letters[i]:""}
        </div>
      ))}
    </div>
  );
  const Popup = () => popup!==null ? (
    <div style={{position:"fixed",top:16,left:"50%",transform:"translateX(-50%)",background:popup>0?"#16a34a":"#dc2626",color:"#fff",borderRadius:8,padding:"8px 22px",fontSize:16,fontWeight:"700",zIndex:99,pointerEvents:"none"}}>
      {popup>0?"+":""}{popup} pts
    </div>
  ) : null;

  // ══════════ HOME ══════════
  if(view==="home") return (
    <div style={wrap}><div style={page}>
      <div style={{paddingTop:32,paddingBottom:8}}>
        <div style={{...lbl,marginBottom:4}}>Stadsspel · Rouen</div>
        <div style={{...h1,fontSize:36}}>Dossier 1431</div>
        <p style={{...body(),marginTop:8}}>Het vergeten verhaal van Jeanne d'Arc. Gebruik de stad als archief.</p>
      </div>
      <hr style={divL}/>
      <div style={lbl}>Kies je team</div>
      {[["rood","🔴","Team Rood","Start bij stop 1"],["blauw","🔵","Team Blauw","Start bij stop 8"]].map(([t,ico,nm,s])=>(
        <button key={t} style={{background:"#fff",border:"1.5px solid #d4d4d4",borderRadius:12,padding:"14px 16px",cursor:"pointer",textAlign:"left",display:"flex",alignItems:"center",gap:14,fontFamily:"inherit"}}
          onClick={()=>{setTeam(t);reset();setView("intro");}}>
          <span style={{fontSize:28}}>{ico}</span>
          <div><div style={{fontWeight:"700",fontSize:15,color:TK[t]}}>{nm}</div><div style={{fontSize:12,color:"#888",marginTop:2}}>{s} · Verzamel 8 letters</div></div>
        </button>
      ))}
      <hr style={divL}/>
      <div style={{display:"flex",gap:8}}>
        <BtnSm onClick={()=>setView("scorebord")} style={{flex:1}}>★ Scorebord</BtnSm>
        <BtnSm onClick={()=>setView("spelleiders_login")} c="#7c3aed" style={{flex:1}}>🎮 Spelleiders</BtnSm>
      </div>
    </div></div>
  );

  // ══════════ SPELLEIDERS LOGIN ══════════
  if(view==="spelleiders_login") return (
    <div style={wrap}><div style={page}>
      <div style={{paddingTop:40,paddingBottom:8}}>
        <div style={lbl}>Beveiligd</div>
        <div style={h1}>Spelleiders</div>
        <p style={{...body(),marginTop:8}}>Voer de spelleiderscode in om het overzicht te bekijken.</p>
      </div>
      <div style={card()}>
        <span style={lbl}>PIN-code</span>
        <Inp value={pinIn} onChange={e=>setPinIn(e.target.value)} placeholder="••••" type="password"
          onKeyDown={e=>{ if(e.key==="Enter"){ if(pinIn===PIN){setPinErr(false);setPinIn("");setView("spelleiders");}else setPinErr(true); }}}/>
        {pinErr&&<p style={{...body("#dc2626"),fontSize:13,marginTop:6}}>⚠ Foute code.</p>}
      </div>
      <Btn c="#7c3aed" fill onClick={()=>{ if(pinIn===PIN){setPinErr(false);setPinIn("");setView("spelleiders");}else setPinErr(true); }}>Inloggen →</Btn>
      <BtnSm onClick={()=>setView("home")}>← Terug</BtnSm>
    </div></div>
  );

  // ══════════ SPELLEIDERS ══════════
  if(view==="spelleiders") {
    const typeIcon = t => ({foto:"📸",video:"🎬",antwoord:"💬",code:"🔑",woord:"🏆",bonus:"🎁"}[t]||"•");
    const TeamLog = ({t}) => {
      const logs=slLogs[t]||[], k=TK[t], nm=t==="rood"?"🔴 Team Rood":"🔵 Team Blauw";
      const byStop={};
      logs.forEach(e=>{ const key=e.stopId+"|"+e.stopNaam; if(!byStop[key]) byStop[key]={stopId:e.stopId,stopNaam:e.stopNaam,events:[]}; byStop[key].events.push(e); });
      const groups=Object.values(byStop);
      return (
        <div style={card()}>
          <div style={{fontWeight:"700",fontSize:15,color:k,marginBottom:12}}>{nm}</div>
          {groups.length===0&&<p style={{...body(),fontSize:13,color:"#aaa"}}>Nog geen activiteit.</p>}
          {groups.map((g,gi)=>(
            <div key={gi} style={{marginBottom:gi<groups.length-1?14:0}}>
              <div style={{fontSize:11,fontWeight:"600",color:"#888",marginBottom:6,letterSpacing:1,textTransform:"uppercase"}}>Stop {g.stopId} · {g.stopNaam}</div>
              {g.events.map((e,ei)=>{
                const isOk=e.correct===true, isNok=e.correct===false, isFoto=e.type==="foto"||e.type==="video";
                return(
                  <div key={ei} style={{display:"flex",alignItems:"flex-start",gap:10,padding:"7px 10px",borderRadius:8,background:isOk?"#f0fdf4":isNok?"#fef2f2":isFoto?"#eff6ff":"#fafafa",marginBottom:4}}>
                    <span style={{fontSize:16,marginTop:1}}>{typeIcon(e.type)}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                        <span style={{fontSize:13,fontWeight:"600",color:"#111",wordBreak:"break-all"}}>{e.waarde||e.type}</span>
                        <span style={{fontSize:11,color:"#aaa",whiteSpace:"nowrap"}}>{fmtTs(e.ts)}</span>
                      </div>
                      <div style={{fontSize:12,marginTop:2,color:isOk?"#16a34a":isNok?"#dc2626":"#6b7280"}}>
                        {isOk?"✓ Correct":isNok?"✗ Fout":isFoto?"Verzonden":e.type==="bonus"?"Hint ontvangen":"—"}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      );
    };
    return(
      <div style={wrap}><div style={page}>
        <div style={{paddingTop:20}}><div style={lbl}>Spelleiders</div><div style={h1}>Live overzicht</div></div>
        <p style={{...body("#6b7280"),fontSize:12}}>Vernieuwt automatisch zodra een team iets doet.</p>
        <TeamLog t="rood"/>
        <TeamLog t="blauw"/>
        <hr style={divL}/>
        <div style={{display:"flex",gap:8}}>
          <BtnSm onClick={()=>setView("home")} style={{flex:1}}>← Home</BtnSm>
          <BtnSm onClick={()=>setView("scorebord")} style={{flex:1}}>★ Scorebord</BtnSm>
          <button onClick={async()=>{ if(window.confirm("Wis alle logs voor een nieuw spel?")){ await clearLogs(); }}}
            style={{flex:1,background:"transparent",color:"#dc2626",border:"1px solid #d4d4d4",borderRadius:8,padding:"9px 14px",fontSize:13,fontFamily:"inherit",cursor:"pointer"}}>
            🗑 Wis logs
          </button>
        </div>
      </div></div>
    );
  }

  // ══════════ INTRO ══════════
  if(view==="intro") return(
    <div style={wrap}><div style={page}>
      <div style={{paddingTop:24}}>
        <div style={lbl}>{team==="rood"?"🔴 Team Rood":"🔵 Team Blauw"}</div>
        <div style={h1}>Welkom, onderzoekers</div>
      </div>
      <div style={card()}>
        <p style={{...body(),lineHeight:1.9,whiteSpace:"pre-line"}}>{"Jullie zijn nu aangekomen in het jaar des Heeren 1431. De oorlog tussen Frankrijk en Engeland woedt hevig en Jeanne d'Arc staat terecht.\n\nJullie taak? Geef Jeanne een tweede kans door de waarheid te achterhalen. Verzamel letters bij elke stop. Op het einde vormen jullie een woord dat jullie kunnen indienen op Place du Vieux Marché."}</p>
      </div>
      <div style={card()}>
        <span style={lbl}>Puntensysteem</span>
        {[["✅ Correct antwoord",`+${PTS.correct}`,"#16a34a"],["📸 Foto/video verzonden",`+${PTS.foto}`,"#16a34a"],["❌ Fout antwoord",`${PTS.fout}`,"#dc2626"],["🏆 Correct woord",`+${PTS.woord}`,"#d97706"]].map(([l,v,c])=>(
          <div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"1px solid #f0f0f0"}}>
            <span style={body()}>{l}</span><span style={{fontWeight:"700",fontSize:13,color:c}}>{v} pts</span>
          </div>
        ))}
      </div>
      <div style={{...card(),borderColor:tk}}>
        <span style={lbl}>Eerste locatie</span>
        <p style={{...body(tk),fontWeight:"600"}}>{team==="rood"?"→ Stop 1: Aître Saint-Maclou":"→ Stop 8: Le Gros-Horloge"}</p>
      </div>
      <Btn c={tk} fill onClick={()=>{setRunning(true);setView("game");}}>Start de zoektocht ▶</Btn>
      <BtnSm onClick={()=>setView("home")}>← Terug</BtnSm>
    </div></div>
  );

  // ══════════ GAME ══════════
  if(view==="game"&&stop){
    const nextNaam=!isLast?STOPS[stop.volg[team]].naam:"";
    return(
      <div style={wrap}>
        <Popup/>
        <div style={page}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",paddingTop:16}}>
            <div>
              <span style={lbl}>Stop {si+1} van {SEQ[team].length}</span>
              <div style={{fontWeight:"700",fontSize:14,color:tk}}>{team==="rood"?"🔴 Team Rood":"🔵 Team Blauw"}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontWeight:"700",fontSize:20,color:"#111",fontVariantNumeric:"tabular-nums"}}>{fmt(timer)}</div>
              <div style={{fontSize:12,fontWeight:"600",color:score>=0?"#16a34a":"#dc2626"}}>{score>0?"+":""}{score} pts</div>
            </div>
          </div>
          <LetterRow/>
          <hr style={divL}/>
          <div style={card()}>
            <span style={lbl}>Stop {SEQ[team][si]}{isLast?" · Laatste stop":""}</span>
            <div style={{...h2,color:tk}}>{stop.naam}</div>
          </div>

          {sub==="arrive"&&<Btn c={tk} fill onClick={()=>setSub("intro")}>📍 Aangekomen op stop {SEQ[team][si]}</Btn>}

          {sub==="intro"&&<>
            <div style={card()}><p style={{...body(),whiteSpace:"pre-line"}}>{stop.intro}</p></div>
            <Btn c={tk} fill onClick={()=>setSub(stop.cryptisch?"opdracht":"vraag")}>{stop.cryptisch?"Verder naar de opdracht →":"Toon de vraag →"}</Btn>
          </>}

          {sub==="opdracht"&&<>
            <div style={card()}><span style={lbl}>Opdracht</span><p style={{...body(),whiteSpace:"pre-line",fontStyle:"italic"}}>{stop.cryptisch}</p></div>
            {stop.heeftFoto&&!fotoOk&&<Btn onClick={()=>{setFotoOk(true);addPts(PTS.foto);log({type:stop.fototype,waarde:stop.fototype==="video"?"video verzonden":"foto verzonden",correct:null});}}>{stop.fototype==="video"?"🎬 Video verzonden via WhatsApp":"📸 Foto verzonden via WhatsApp"}</Btn>}
            {stop.heeftFoto&&fotoOk&&<div style={{...card(),borderColor:"#86efac",background:"#f0fdf4"}}>
              <p style={{...body("#15803d"),fontWeight:"600"}}>✓ {stop.fototype==="video"?"Video":"Foto"} verzonden (+{PTS.foto} pts)</p>
              <p style={{...body(),marginTop:4,fontSize:13}}>Wacht op goedkeuring van Jens of Sean…</p>
              <Btn c={tk} fill onClick={()=>setSub("vraag")} style={{marginTop:12}}>✓ Goedkeuring ontvangen → {stop.type==="code"?"Code ingeven":"Toon de vraag"}</Btn>
            </div>}
            {!stop.heeftFoto&&<Btn c={tk} fill onClick={()=>setSub("vraag")}>Toon de vraag →</Btn>}
          </>}

          {sub==="vraag"&&stop.type==="tekst"&&<>
            <div style={card()}><span style={lbl}>Vraag</span><p style={{...body(),fontStyle:"italic",whiteSpace:"pre-line"}}>"{stop.vraag}"</p></div>
            {!misMsg&&<><Inp value={txtIn} onChange={e=>setTxtIn(e.target.value)} placeholder="Typ je antwoord…" onKeyDown={e=>e.key==="Enter"&&doAntwoord()}/><Btn c={tk} fill onClick={doAntwoord}>Bevestig →</Btn></>}
            {misMsg&&<div style={{...card(),borderColor:"#fca5a5",background:"#fef2f2"}}>
              <p style={{...body("#dc2626"),fontWeight:"700",fontSize:15}}>❌ Drie letters! MIS!</p>
              <p style={{...body(),marginTop:4,fontSize:13}}>Ga verder naar de volgende locatie. ({PTS.fout} pts)</p>
              <Btn onClick={()=>{setMisMsg(false);nxtStop();}} style={{marginTop:12}}>Ga verder →</Btn>
            </div>}
          </>}

          {sub==="vraag"&&stop.type==="mc"&&<>
            <div style={card()}><span style={lbl}>Vraag</span><p style={{...body(),fontStyle:"italic"}}>{stop.vraag}</p></div>
            {!misMsg&&<>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {stop.opties.map((o,i)=>(
                  <button key={i} onClick={()=>setPicked(i)} style={{background:picked===i?tk:"#fff",color:picked===i?"#fff":"#111",border:`1.5px solid ${picked===i?tk:"#d4d4d4"}`,borderRadius:10,padding:"12px 16px",fontSize:14,fontFamily:"inherit",cursor:"pointer",textAlign:"left",fontWeight:picked===i?"600":"400"}}>
                    <span style={{opacity:0.5,marginRight:10}}>{["A","B","C","D"][i]}.</span>{o}
                  </button>
                ))}
              </div>
              {picked!==null&&<Btn c={tk} fill onClick={doAntwoord}>Bevestig →</Btn>}
            </>}
            {misMsg&&<div style={{...card(),borderColor:"#fca5a5",background:"#fef2f2"}}>
              <p style={{...body("#dc2626"),fontWeight:"700",fontSize:15}}>❌ Drie letters! MIS!</p>
              <p style={{...body(),marginTop:4,fontSize:13}}>Ga verder naar de volgende locatie. ({PTS.fout} pts)</p>
              <Btn onClick={()=>{setMisMsg(false);nxtStop();}} style={{marginTop:12}}>Ga verder →</Btn>
            </div>}
          </>}

          {sub==="vraag"&&stop.type==="code"&&<>
            <div style={card()}>
              <span style={lbl}>Geheime code</span>
              <p style={{...body(),marginBottom:10}}>Voer de code in die jullie ontvangen van Jens of Sean:</p>
              <Inp value={codeIn} onChange={e=>setCodeIn(e.target.value)} placeholder="Code…" type="number" onKeyDown={e=>e.key==="Enter"&&doCode()}/>
              {codeErr&&<p style={{...body("#dc2626"),fontSize:12,marginTop:6}}>⚠ Foute code, probeer opnieuw.</p>}
            </div>
            <Btn c={tk} fill onClick={doCode}>Bevestig →</Btn>
          </>}

          {sub==="correct"&&<>
            <div style={{...card(),textAlign:"center",padding:"24px 16px"}}>
              <div style={{fontSize:11,letterSpacing:2,textTransform:"uppercase",color:"#999",marginBottom:8}}>Letter verzameld · +{PTS.correct} pts</div>
              <div style={{fontSize:64,fontWeight:"800",color:tk,letterSpacing:6}}>{letters[letters.length-1]}</div>
            </div>
            {stop.bonus&&!bonusHint&&<div style={card()}>
              <span style={lbl}>🎁 Bonusopdracht — vrijblijvend</span>
              <p style={{...body(),whiteSpace:"pre-line",fontSize:13}}>{stop.bonus.tekst}</p>
              <p style={{...body("#d97706"),fontSize:12,marginTop:8}}>Goed uitgevoerd? Jens of Sean sturen je een hint!</p>
              <BtnSm c="#d97706" onClick={()=>{setBonusHint(stop.bonus.hint);log({type:"bonus",waarde:"hint ontvangen",correct:null});}}>✓ Hint ontvangen</BtnSm>
            </div>}
            {bonusHint&&<div style={{...card(),borderColor:"#fcd34d",background:"#fefce8"}}>
              <span style={lbl}>🎭 Debat-hint</span>
              <p style={{...body("#92400e"),fontStyle:"italic"}}>{bonusHint}</p>
            </div>}
            <Btn c={tk} fill onClick={nxtStop}>{isLast?"Naar de finale! 🏁":`Volgende stop → ${stop.volg[team]}: ${nextNaam}`}</Btn>
          </>}
        </div>
      </div>
    );
  }

  // ══════════ FINALE ══════════
  if(view==="finale") return(
    <div style={wrap}><div style={page}>
      <Popup/>
      <div style={{paddingTop:28}}><div style={lbl}>Place du Vieux Marché</div><div style={h1}>Het Grote Debat</div></div>
      <div style={card()}><p style={{...body(),fontStyle:"italic",lineHeight:2}}>"Jullie hebben gezocht. Gekeken. Geluisterd. En nu weten jullie hoe het verdraaien van woorden, angst, hebzucht en macht een mensenleven kunnen ruïneren.{"\n\n"}Jeanne had niks meer. Enkel haar overtuiging. Jullie bevinden zich nu op het proces van Jeanne d'Arc. Was ze een heldin? Of een ketter, een heks? Leef jullie helemaal in in jullie rol als team!"</p></div>
      <div style={card()}>
        <span style={lbl}>{team==="rood"?"🔴 Team Rood":"🔵 Team Blauw"} · Eindstand</span>
        <div style={{display:"flex",gap:20,alignItems:"baseline"}}>
          <div style={{fontSize:32,fontWeight:"800",color:tk}}>{fmt(timer)}</div>
          <div style={{fontSize:14,fontWeight:"600",color:score>=0?"#16a34a":"#dc2626"}}>{score>0?"+":""}{score} pts</div>
        </div>
      </div>
      <div style={card()}>
        <span style={lbl}>Verzamelde letters ({letters.length}/{woord.length})</span>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:6}}>
          {letters.map((l,i)=><div key={i} style={{width:36,height:36,borderRadius:8,background:tk,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:"700"}}>{l}</div>)}
        </div>
      </div>
      {!woordOk&&<>
        <div style={card()}><span style={lbl}>Vormen jullie het woord?</span><p style={{...body(),fontSize:13,marginBottom:10}}>Herschik de letters en typ het woord:</p><Inp value={woordIn} onChange={e=>setWoordIn(e.target.value)} placeholder="Het woord…" onKeyDown={e=>e.key==="Enter"&&doWoord()}/></div>
        <Btn c={tk} fill onClick={doWoord}>Woord indienen →</Btn>
        <BtnSm onClick={()=>{setScores(s=>({...s,[team]:score}));setView("wacht");}}>⏱ Tijd stoppen (woord niet gevonden)</BtnSm>
      </>}
      {woordOk&&<>
        <div style={{...card(),borderColor:"#86efac",background:"#f0fdf4",textAlign:"center",padding:"24px"}}>
          <div style={{fontSize:13,fontWeight:"700",color:"#15803d",letterSpacing:2,textTransform:"uppercase"}}>🏆 Correct! +{PTS.woord} pts</div>
          <div style={{fontSize:32,fontWeight:"800",color:tk,letterSpacing:4,marginTop:8}}>{woord}</div>
        </div>
        {extraHints.length>0&&<div style={{...card(),borderColor:"#fcd34d",background:"#fefce8"}}>
          <span style={lbl}>🎁 Extra hints voor het debat</span>
          {extraHints.map((h,i)=><p key={i} style={{...body("#92400e"),fontStyle:"italic",fontSize:13,marginTop:i>0?10:4}}>{h}</p>)}
        </div>}
        <Btn c={tk} fill onClick={()=>{setScores(s=>({...s,[team]:score}));setView("wacht");}}>Score indienen →</Btn>
      </>}
    </div></div>
  );

  // ══════════ WACHT ══════════
  if(view==="wacht") return(
    <div style={wrap}><div style={{...page,alignItems:"center",textAlign:"center",paddingTop:60,gap:20}}>
      <div style={{fontSize:48}}>⌛</div>
      <div style={h1}>Wachten op het andere team…</div>
      <p style={body()}>Score ingediend. Wacht tot beide teams klaar zijn.<br/><br/>Jens & Sean berekenen daarna de finale scores.</p>
      <hr style={{...divL,width:"100%"}}/>
      <Btn fill c="#111" onClick={()=>setView("scorebord")}>Naar het scorebord →</Btn>
      <BtnSm onClick={()=>setView("home")}>← Home</BtnSm>
    </div></div>
  );

  // ══════════ SCOREBORD ══════════
  if(view==="scorebord") return(
    <div style={wrap}><div style={page}>
      <div style={{paddingTop:24}}><div style={h1}>Scorebord</div></div>
      {["rood","blauw"].map(t=>{
        const k=TK[t],sc=scores[t]||0,fin=parseInt(finPts[t])||0;
        return(<div key={t} style={card()}>
          <div style={{fontWeight:"700",fontSize:15,color:k,marginBottom:12}}>{t==="rood"?"🔴 Team Rood":"🔵 Team Blauw"}</div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
            <div style={{background:"#f5f5f5",borderRadius:8,padding:"10px 12px"}}><span style={lbl}>Spelpunten</span><div style={{fontSize:24,fontWeight:"800",color:k}}>{sc}</div></div>
            <div style={{background:"#f5f5f5",borderRadius:8,padding:"10px 12px"}}>
              <span style={lbl}>Finalepunten</span>
              <input value={finPts[t]} onChange={e=>setFinPts(s=>({...s,[t]:e.target.value}))} placeholder="0" type="number"
                style={{background:"transparent",border:"none",fontSize:24,fontFamily:"inherit",fontWeight:"800",color:k,width:"100%",outline:"none"}}/>
              <div style={{fontSize:10,color:"#aaa",letterSpacing:1,textTransform:"uppercase"}}>Jens & Sean</div>
            </div>
          </div>
          <div style={{background:k,borderRadius:8,padding:"10px 14px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{color:"rgba(255,255,255,0.8)",fontSize:12,textTransform:"uppercase",letterSpacing:2}}>Totaal</span>
            <span style={{fontSize:26,fontWeight:"800",color:"#fff"}}>{sc+fin}</span>
          </div>
        </div>);
      })}
      {(finPts.rood||finPts.blauw)&&(()=>{
        const sr=(scores.rood||0)+(parseInt(finPts.rood)||0),sb=(scores.blauw||0)+(parseInt(finPts.blauw)||0),w=sr>sb?"rood":sb>sr?"blauw":null;
        return(<div style={{...card(),textAlign:"center",padding:"24px 16px"}}>
          {!w?<><div style={{fontSize:20,fontWeight:"700"}}>Gelijkspel 🤝</div><p style={{...body(),marginTop:6}}>Iedereen trakteert! 🍺</p></>
          :<><div style={{fontSize:32}}>{w==="rood"?"🔴":"🔵"}</div>
            <div style={{fontSize:20,fontWeight:"700",color:TK[w],marginTop:8}}>{w==="rood"?"Team Rood":"Team Blauw"} wint!</div>
            <p style={{...body(),marginTop:4}}>{Math.max(sr,sb)} vs {Math.min(sr,sb)} punten</p>
            <p style={{...body(TK[w==="rood"?"blauw":"rood"]),marginTop:10,fontWeight:"600"}}>{w==="rood"?"Team Blauw":"Team Rood"} trakteert! 🍺</p>
            <p style={{...body("#aaa"),marginTop:6,fontSize:12}}>...inclusief Jens & Sean uiteraard.</p></>}
        </div>);
      })()}
      <BtnSm onClick={()=>setView("home")}>← Home</BtnSm>
    </div></div>
  );

  return null;
}