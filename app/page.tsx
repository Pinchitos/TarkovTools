const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const documentImages = ["financial", "pmc", "project", "blueprints", "test", "user"];

const plannedTools = [
  { code: "02", name: "AMMO ANALYSIS", copy: "Compare penetration, damage and armor performance without opening twelve wiki tabs." },
  { code: "03", name: "HIDEOUT LEDGER", copy: "Track upgrade materials, flea costs and the items still buried somewhere in your stash." },
  { code: "04", name: "QUEST OPERATIONS", copy: "Turn active objectives into a raid plan instead of discovering the route after deployment." },
];

export default function TarkovToolsHub() {
  return (
    <main className="hub-page">
      <div className="noise" />

      <header className="hub-nav">
        <a className="hub-logo" href={`${basePath}/`} aria-label="TarkovTools home">
          <span className="hub-logo-mark">TT</span>
          <span><b>TARKOV</b>TOOLS<small>COMMUNITY FIELD SYSTEMS</small></span>
        </a>
        <div className="hub-nav-status"><i /> SYSTEM ONLINE <b>01 MODULE ACTIVE</b></div>
      </header>

      <section className="hub-hero">
        <div className="hub-hero-copy">
          <div className="hub-kicker"><span>FIELD TERMINAL</span><i />UNOFFICIAL COMMUNITY TOOLKIT</div>
          <h1>PLAN THE RAID.<br /><em>KEEP THE RUBLES.</em></h1>
          <p>A growing collection of practical Escape from Tarkov utilities. Built for fewer spreadsheets, cleaner routes and slightly less suffering.</p>
          <div className="hub-actions">
            <a className="hub-primary" href={`${basePath}/kord-breach-planner/`}>OPEN KORD BREACH PLANNER <span>↗</span></a>
            <a className="hub-secondary" href="https://github.com/Pinchitos/TarkovTools" target="_blank" rel="noopener noreferrer">VIEW SOURCE ↗</a>
          </div>
          <dl className="hub-readout">
            <div><dt>01</dt><dd>LIVE TOOL</dd></div>
            <div><dt>LOCAL</dt><dd>DATA STORAGE</dd></div>
            <div><dt>FREE</dt><dd>COMMUNITY USE</dd></div>
          </dl>
        </div>

        <a className="hub-featured-visual" href={`${basePath}/kord-breach-planner/`} aria-label="Open Kord Breach Document Route Planner">
          <div className="hub-visual-head"><span>UTILITY // 01</span><b>DEPLOYED</b></div>
          <div className="hub-doc-stack">
            {documentImages.map((name) => (
              <div className="hub-doc-tile" key={name}>
                <img src={`${basePath}/docs/${name}.png`} alt="" />
              </div>
            ))}
          </div>
          <div className="hub-visual-foot">
            <div><small>KORD BREACH</small><strong>DOCUMENT ROUTE<br />PLANNER</strong></div>
            <span>ENTER<br />UTILITY ↗</span>
          </div>
        </a>
      </section>

      <section className="hub-registry" aria-labelledby="registry-title">
        <div className="hub-section-head">
          <div><span>01 // TOOL REGISTRY</span><h2 id="registry-title">FIELD UTILITIES</h2></div>
          <p>One repo. Multiple tools. No account, no tracking and no stash value lost on deployment.</p>
        </div>

        <div className="hub-tool-grid">
          <a className="hub-tool-card active" href={`${basePath}/kord-breach-planner/`}>
            <div className="hub-tool-code">01</div>
            <div className="hub-tool-copy"><span>AVAILABLE NOW</span><h3>KORD BREACH<br />ROUTE PLANNER</h3><p>Enter the documents you need, lock maps you cannot access and get the strongest farming routes for your daily limit.</p></div>
            <div className="hub-tool-meta"><span>ROUTE OPTIMIZATION</span><span>LOCAL SAVE</span><b>LAUNCH ↗</b></div>
          </a>

          {plannedTools.map((tool) => (
            <article className="hub-tool-card locked" key={tool.code}>
              <div className="hub-tool-code">{tool.code}</div>
              <div className="hub-tool-copy"><span>RESERVED SLOT</span><h3>{tool.name}</h3><p>{tool.copy}</p></div>
              <div className="hub-tool-meta"><span>CONCEPT</span><b>COMING SOON</b></div>
            </article>
          ))}
        </div>
      </section>

      <footer className="hub-footer">
        <span>UNOFFICIAL // NON-COMMERCIAL // COMMUNITY BUILT</span>
        <p>Not affiliated with or endorsed by Battlestate Games. Escape from Tarkov and its assets belong to their respective owners.</p>
        <a href="https://github.com/Pinchitos/TarkovTools" target="_blank" rel="noopener noreferrer">PINCHITOS / TARKOVTOOLS ↗</a>
      </footer>
    </main>
  );
}
