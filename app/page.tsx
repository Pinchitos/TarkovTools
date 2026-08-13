"use client";

/* eslint-disable react-hooks/set-state-in-effect -- hydrate browser-only saved state after mount */

import { useEffect, useMemo, useState } from "react";

type DocKey = "technical" | "medical" | "user" | "test" | "blueprints" | "project" | "pmc" | "financial";
type DocInfo = { key: DocKey; name: string; short: string; image: string; maps: string[] };

const documents: DocInfo[] = [
  { key: "technical", name: "Technical Documentation", short: "Technical", image: "/docs/technical.png", maps: ["Shoreline", "Woods", "Lighthouse"] },
  { key: "medical", name: "Medical Documents", short: "Medical", image: "/docs/medical.png", maps: ["The Lab", "Ground Zero", "The Labyrinth"] },
  { key: "user", name: "User Documentation", short: "User", image: "/docs/user.png", maps: ["Ground Zero", "Streets of Tarkov", "The Lab"] },
  { key: "test", name: "Test Documentation", short: "Test", image: "/docs/test.png", maps: ["Shoreline", "Woods", "Icebreaker"] },
  { key: "blueprints", name: "Blueprints & Technical", short: "Blueprints", image: "/docs/blueprints.png", maps: ["Interchange", "Factory", "The Labyrinth"] },
  { key: "project", name: "Project Documentation", short: "Project", image: "/docs/project.png", maps: ["Factory", "Reserve", "Customs"] },
  { key: "pmc", name: "PMC Personnel Files", short: "PMC Files", image: "/docs/pmc.png", maps: ["Reserve", "Lighthouse", "Icebreaker"] },
  { key: "financial", name: "Financial Documents", short: "Financial", image: "/docs/financial.png", maps: ["Customs", "Streets of Tarkov", "Interchange"] },
];

const sample: Record<DocKey, number> = { technical: 8, medical: 3, user: 5, test: 4, blueprints: 7, project: 2, pmc: 4, financial: 6 };
const blank = (): Record<DocKey, number> => Object.fromEntries(documents.map((doc) => [doc.key, 0])) as Record<DocKey, number>;
const mapNames = Array.from(new Set(documents.flatMap((doc) => doc.maps)));
const mapIds: Record<string, string> = {
  "Customs": "customs",
  "Ground Zero": "ground_zero",
  "Factory": "factory",
  "Icebreaker": "icebreaker",
  "Interchange": "interchange",
  "The Lab": "lab",
  "The Labyrinth": "labyrinth",
  "Lighthouse": "lighthouse",
  "Reserve": "reserve",
  "Shoreline": "shoreline",
  "Streets of Tarkov": "streets_of_tarkov",
  "Woods": "woods",
};
const mapHref = (name: string) => `https://perofunyang.github.io/battlepass_interactive_map/en.html?map=${mapIds[name]}`;

export default function Home() {
  const [remaining, setRemaining] = useState<Record<DocKey, number>>(sample);
  const [dailyLimit, setDailyLimit] = useState(30);
  const [cap, setCap] = useState(30);
  const [history, setHistory] = useState<{ key?: DocKey; wasted?: boolean }[]>([]);
  const [enabledMaps, setEnabledMaps] = useState<string[]>(mapNames);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem("kord-breach-planner");
    if (saved) {
      try {
        const state = JSON.parse(saved);
        setRemaining({ ...blank(), ...state.remaining });
        setDailyLimit(state.dailyLimit ?? 30);
        setCap(state.cap ?? 30);
        setEnabledMaps(Array.isArray(state.enabledMaps) ? state.enabledMaps.filter((map: string) => mapNames.includes(map)) : mapNames);
      } catch { /* Keep the demo state if storage is malformed. */ }
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) window.localStorage.setItem("kord-breach-planner", JSON.stringify({ remaining, dailyLimit, cap, enabledMaps }));
  }, [remaining, dailyLimit, cap, enabledMaps, ready]);

  const ranking = useMemo(() => mapNames.filter((name) => enabledMaps.includes(name)).map((name) => {
    const useful = documents.filter((doc) => doc.maps.includes(name) && remaining[doc.key] > 0).map((doc) => ({ doc, amount: Math.min(remaining[doc.key], 5) }));
    const rawScore = useful.reduce((sum, item) => sum + item.amount, 0);
    return { name, useful, score: Math.min(cap, rawScore) };
  }).filter((map) => map.score > 0).sort((a, b) => b.score - a.score || a.name.localeCompare(b.name)), [remaining, cap, enabledMaps]);

  const bestScore = ranking[0]?.score ?? 0;
  const best = ranking.filter((map) => map.score === bestScore);
  const totalRemaining = Object.values(remaining).reduce((sum, value) => sum + value, 0);

  function updateNeed(key: DocKey, value: number) { setRemaining((current) => ({ ...current, [key]: Math.max(0, Math.floor(value || 0)) })); }
  function collect(key: DocKey) {
    if (cap <= 0 || remaining[key] <= 0) return;
    setRemaining((current) => ({ ...current, [key]: current[key] - 1 }));
    setCap((current) => current - 1);
    setHistory((current) => [...current, { key }]);
  }
  function waste() { if (cap > 0) { setCap((current) => current - 1); setHistory((current) => [...current, { wasted: true }]); } }
  function undo() {
    const last = history.at(-1); if (!last) return;
    if (last.key) setRemaining((current) => ({ ...current, [last.key!]: current[last.key!] + 1 }));
    setCap((current) => Math.min(dailyLimit, current + 1)); setHistory((current) => current.slice(0, -1));
  }
  function toggleMap(name: string) {
    setEnabledMaps((current) => current.includes(name) ? current.filter((map) => map !== name) : [...current, name]);
  }

  return <main>
    <div className="noise" />
    <header className="topbar">
      <div className="brand-mark"><span>KB</span><i /></div>
      <div className="brand-copy"><p>KORD BREACH // FIELD UTILITY</p><h1>DOCUMENT ROUTE PLANNER</h1></div>
      <div className="status"><span className="status-dot" />LOCAL DATA <b>ONLINE</b></div>
    </header>

    <section className="command-strip">
      <div className="cap-control"><span className="eyebrow">DAILY EXTRACTION CAP</span><div className="cap-number"><strong>{cap}</strong><span>/</span><input aria-label="Daily document limit" type="number" min="1" value={dailyLimit} onChange={(e) => { const next = Math.max(1, Number(e.target.value) || 1); setDailyLimit(next); setCap((current) => Math.min(current, next)); }} /></div><div className="cap-bar"><i style={{ width: `${Math.min(100, (cap / dailyLimit) * 100)}%` }} /></div><small>{cap === 0 ? "LIMIT REACHED — EXTRACT" : `${cap} DOCUMENT SLOTS REMAINING`}</small></div>
      <div className="strip-actions"><button className="ghost" onClick={undo} disabled={!history.length}>↶ UNDO LAST</button><button className="ghost danger" onClick={waste} disabled={cap === 0}>+1 WASTED</button><button className="primary" onClick={() => { setCap(dailyLimit); setHistory([]); }}>NEW DAY <span>↗</span></button></div>
    </section>

    <div className="layout">
      <section className="panel inventory-panel">
        <div className="section-heading"><div><span className="section-no">01</span><h2>REQUIRED DOCUMENTS</h2><p>Enter any target: one reward, one page, or the full pass.</p></div><button className="text-button" onClick={() => { setRemaining(blank()); setHistory([]); }}>CLEAR ALL</button></div>
        <div className="doc-grid">{documents.map((doc) => {
          const done = remaining[doc.key] === 0;
          return <article className={`doc-card ${done ? "done" : ""}`} key={doc.key}>
            <div className="doc-image"><img src={doc.image} alt={doc.name} /></div>
            <div className="doc-body"><h3>{doc.name}</h3><div className="need-control"><button aria-label={`Decrease ${doc.short}`} onClick={() => updateNeed(doc.key, remaining[doc.key] - 1)}>−</button><input aria-label={`${doc.short} remaining`} type="number" min="0" value={remaining[doc.key]} onChange={(e) => updateNeed(doc.key, Number(e.target.value))} /><button aria-label={`Increase ${doc.short}`} onClick={() => updateNeed(doc.key, remaining[doc.key] + 1)}>+</button></div><button className="collect" disabled={done || cap === 0} onClick={() => collect(doc.key)}>{done ? "✓ DO NOT PICK UP" : "+ COLLECT ONE"}</button></div>
          </article>;
        })}</div>
        <div className="classified-card"><img src="/docs/classified.png" alt="Classified Documents" /><div><span>09 // UNIVERSAL SUBSTITUTE</span><h3>CLASSIFIED DOCUMENTS</h3><p>Use these in-game against whichever requirement you choose, then reduce that document above.</p></div><b>ANY TYPE</b></div>
      </section>

      <aside className="panel route-panel">
        <div className="section-heading compact"><div><span className="section-no">02</span><h2>LIVE ROUTE</h2><p>Recalculates after every pickup.</p></div></div>
        <div className="map-filter">
          <div className="filter-heading"><div><span>MAP ACCESS FILTER</span><small>{enabledMaps.length}/{mapNames.length} AVAILABLE</small></div><button onClick={() => setEnabledMaps(mapNames)}>ENABLE ALL</button></div>
          <div className="map-toggles">{mapNames.map((name) => {
            const enabled = enabledMaps.includes(name);
            return <button key={name} aria-pressed={enabled} aria-label={`${enabled ? "Disable" : "Enable"} ${name}`} className={enabled ? "enabled" : "disabled"} onClick={() => toggleMap(name)}><i />{name}<b>{enabled ? "ON" : "LOCKED"}</b></button>;
          })}</div>
        </div>
        {cap === 0 ? <div className="halt"><span>DAILY LIMIT</span><strong>EXTRACT.</strong><p>Your remaining targets are saved. Hit “New day” when the limit resets.</p></div>
        : totalRemaining === 0 ? <div className="halt complete"><span>OBJECTIVE COMPLETE</span><strong>ALL CLEAR.</strong><p>Add a new reward, page, or full-pass target to generate another route.</p></div>
        : ranking.length === 0 ? <div className="halt locked"><span>NO ACCESSIBLE ROUTE</span><strong>NO MAPS.</strong><p>None of your available maps contain the documents you still need. Enable another map above.</p></div>
        : <><div className="best-label"><span>BEST OPTIONS NOW</span><b>{bestScore}/{cap} USEFUL</b></div><div className="best-list">{best.map((map, index) => <a className="map-card best-map" href={mapHref(map.name)} target="_blank" rel="noreferrer" aria-label={`Open ${map.name} interactive document map`} key={map.name}><div className="rank">0{index + 1}</div><div className="map-main"><span>RECOMMENDED · OPEN MAP ↗</span><h3>{map.name}</h3><div className="yield-list">{map.useful.map(({ doc, amount }) => <i key={doc.key}>{doc.short} <b>≤ {amount}</b></i>)}</div></div><div className="score"><strong>{map.score}</strong><small>USEFUL</small></div></a>)}</div>
          <div className="warning"><b>⚠ PICKUP DISCIPLINE</b><p>Never collect more than the remaining number shown. Every extra document still burns one daily slot.</p></div>
          <div className="next-label">ALTERNATE INSERTIONS</div><div className="alternates">{ranking.filter((map) => map.score < bestScore).slice(0, 5).map((map) => <a className="alt-row" href={mapHref(map.name)} target="_blank" rel="noreferrer" aria-label={`Open ${map.name} interactive document map`} key={map.name}><span>{map.name} ↗</span><i>{map.useful.map((item) => item.doc.short).join(" + ")}</i><b>{map.score}</b></a>)}</div></>}
        <div className="logic-note"><span>ROUTE LOGIC</span><code>Σ min(needed, 5) → capped by daily slots</code><p>Equal scores stay equal. Choose by quests, survival rate, or pure spite.</p></div>
      </aside>
    </div>
    <footer><span>UNOFFICIAL COMMUNITY TOOL</span><i />KORD BREACH DOCUMENT INTELLIGENCE <b>v0.1 PROPOSAL</b></footer>
    <section className="legal-strip" aria-label="Credits and legal disclaimer">
      <div>
        <span>{"// CREDITS & DISCLAIMER"}</span>
        <p>
          Unofficial, non-commercial fan tool. Not affiliated with or endorsed by Battlestate Games.
          Escape from Tarkov, its trademarks, and the game assets shown here belong to their respective owners.
        </p>
      </div>
      <nav aria-label="Third-party links">
        <a href="https://www.escapefromtarkov.com/" target="_blank" rel="noopener noreferrer">ESCAPE FROM TARKOV ↗</a>
        <a href="https://github.com/Perofunyang/battlepass_interactive_map" target="_blank" rel="noopener noreferrer">MAPS BY PEROFUNYANG ↗</a>
      </nav>
    </section>
    <a className="footer-wink" href="https://www.pachangasapp.com/" target="_blank" rel="noreferrer">
      <span>If Labs has sent you back to the stash four times in a row, maybe it&apos;s time to touch some grass with friends (Spain only):</span>
      <strong>PACHANGASAPP.COM ↗</strong>
    </a>
  </main>;
}
