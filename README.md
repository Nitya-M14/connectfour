<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Connect Four — Ultimate Edition</title>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Mono:wght@300;400;500&family=Inter:wght@300;400;500&display=swap" rel="stylesheet"/>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:       #0d0d0f;
    --surface:  #15151a;
    --surface2: #1e1e26;
    --border:   #2a2a36;
    --red:      #e8392a;
    --red-glow: rgba(232,57,42,0.35);
    --yellow:   #f5c842;
    --yellow-glow: rgba(245,200,66,0.35);
    --wild:     #b06ef3;
    --wild-glow: rgba(176,110,243,0.4);
    --accent:   #4f8ef7;
    --text:     #e8e4dc;
    --text-dim: #6b6878;
    --cell:     #0a0a0e;
    --board-bg: #111118;
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'Inter', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }

  body::before {
    content: '';
    position: fixed; inset: 0;
    pointer-events: none; z-index: 9999;
    opacity: 0.025;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    background-size: 150px;
  }

  .screen { display: none; min-height: 100vh; }
  .screen.active { display: flex; flex-direction: column; }

  /* ── INTRO ── */
  #screen-intro {
    align-items: center; justify-content: center;
    text-align: center; padding: 2rem;
    background: radial-gradient(ellipse at 50% 0%, rgba(79,142,247,0.07) 0%, transparent 60%);
  }

  .intro-eyebrow {
    font-family: 'DM Mono', monospace;
    font-size: 0.65rem; letter-spacing: 0.35em;
    text-transform: uppercase; color: var(--accent);
    margin-bottom: 1.5rem; opacity: 0;
    animation: fadeUp 0.6s 0.1s forwards;
  }

  .intro-title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: clamp(4.5rem, 13vw, 10rem);
    line-height: 0.88; letter-spacing: 0.04em;
    margin-bottom: 0.6rem; opacity: 0;
    animation: fadeUp 0.6s 0.25s forwards;
  }
  .intro-title .r { color: var(--red); }
  .intro-title .y { color: var(--yellow); }

  .intro-sub {
    font-family: 'DM Mono', monospace;
    font-size: 0.72rem; letter-spacing: 0.22em;
    color: var(--text-dim); margin-bottom: 3rem;
    opacity: 0; animation: fadeUp 0.6s 0.4s forwards;
  }

  .setup-card {
    background: var(--surface); border: 1px solid var(--border);
    padding: 2.5rem 3rem; max-width: 460px; width: 100%;
    opacity: 0; animation: fadeUp 0.6s 0.55s forwards;
  }

  .field { margin-bottom: 1.5rem; text-align: left; }
  .field label {
    display: block; font-family: 'DM Mono', monospace;
    font-size: 0.58rem; letter-spacing: 0.28em;
    text-transform: uppercase; color: var(--text-dim); margin-bottom: 0.5rem;
  }
  .field input[type="text"] {
    width: 100%; background: var(--surface2);
    border: 1px solid var(--border); color: var(--text);
    font-family: 'DM Mono', monospace; font-size: 0.9rem;
    padding: 0.65rem 0.9rem; outline: none; transition: border-color 0.2s;
  }
  .field input[type="text"]:focus { border-color: var(--accent); }

  .btn-group { display: flex; gap: 0.5rem; }
  .btn-option {
    flex: 1; padding: 0.6rem 0.5rem;
    background: var(--surface2); border: 1px solid var(--border);
    color: var(--text-dim); font-family: 'DM Mono', monospace;
    font-size: 0.65rem; letter-spacing: 0.08em;
    cursor: pointer; transition: all 0.2s; text-align: center;
  }
  .btn-option:hover { border-color: var(--accent); color: var(--text); }
  .btn-option.active { border-color: var(--accent); color: var(--accent); background: rgba(79,142,247,0.07); }

  .toggle-row { display: flex; align-items: center; gap: 1rem; }
  .toggle {
    width: 44px; height: 24px; background: var(--surface2);
    border: 1px solid var(--border); border-radius: 12px;
    cursor: pointer; position: relative; transition: all 0.25s; flex-shrink: 0;
  }
  .toggle::after {
    content: ''; position: absolute; width: 16px; height: 16px;
    background: var(--text-dim); border-radius: 50%;
    top: 3px; left: 3px; transition: all 0.25s;
  }
  .toggle.on { background: rgba(79,142,247,0.18); border-color: var(--accent); }
  .toggle.on::after { transform: translateX(20px); background: var(--accent); }
  .toggle-label { font-size: 0.82rem; color: var(--text-dim); }

  .btn-start {
    width: 100%; padding: 0.9rem;
    background: var(--red); border: none; color: #fff;
    font-family: 'Bebas Neue', sans-serif; font-size: 1.5rem;
    letter-spacing: 0.12em; cursor: pointer; transition: all 0.2s; margin-top: 0.5rem;
  }
  .btn-start:hover { background: #ff4535; transform: translateY(-2px); box-shadow: 0 6px 20px var(--red-glow); }

  /* ── GAME SCREEN ── */
  #screen-game { flex-direction: row; min-height: 100vh; }

  .sidebar {
    width: 255px; flex-shrink: 0;
    background: var(--surface); border-right: 1px solid var(--border);
    padding: 1.4rem; display: flex; flex-direction: column; gap: 1.2rem;
    overflow-y: auto;
  }

  .sidebar-logo {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 1.6rem; letter-spacing: 0.06em; line-height: 1;
  }
  .sidebar-logo .r { color: var(--red); }
  .sidebar-logo .y { color: var(--yellow); }

  .sidebar-label {
    font-family: 'DM Mono', monospace; font-size: 0.54rem;
    letter-spacing: 0.3em; text-transform: uppercase; color: var(--text-dim);
    margin-bottom: 0.55rem; padding-bottom: 0.4rem; border-bottom: 1px solid var(--border);
  }

  .player-row {
    display: flex; align-items: center; gap: 0.7rem;
    padding: 0.55rem 0.7rem; border: 1px solid transparent;
    transition: all 0.3s; margin-bottom: 0.35rem;
  }
  .player-row.active-turn { border-color: var(--border); background: var(--surface2); }
  .player-dot { width: 15px; height: 15px; border-radius: 50%; flex-shrink: 0; }
  .player-dot.red { background: var(--red); box-shadow: 0 0 8px var(--red-glow); }
  .player-dot.yellow { background: var(--yellow); box-shadow: 0 0 8px var(--yellow-glow); }
  .player-info { flex: 1; min-width: 0; }
  .player-name { font-size: 0.82rem; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .player-type { font-family: 'DM Mono', monospace; font-size: 0.53rem; color: var(--text-dim); letter-spacing: 0.08em; }
  .turn-arrow { font-size: 0.7rem; color: var(--accent); opacity: 0; transition: opacity 0.3s; }
  .player-row.active-turn .turn-arrow { opacity: 1; }

  .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.45rem; }
  .stat-box { background: var(--surface2); border: 1px solid var(--border); padding: 0.55rem; text-align: center; }
  .stat-val { font-family: 'Bebas Neue', sans-serif; font-size: 1.6rem; line-height: 1; }
  .stat-val.red { color: var(--red); }
  .stat-val.yellow { color: var(--yellow); }
  .stat-val.dim { color: var(--text-dim); }
  .stat-lbl { font-family: 'DM Mono', monospace; font-size: 0.48rem; letter-spacing: 0.14em; color: var(--text-dim); text-transform: uppercase; margin-top: 0.18rem; }

  .powerup-list { display: flex; flex-direction: column; gap: 0.38rem; }
  .pu-item {
    display: flex; align-items: center; gap: 0.55rem;
    padding: 0.48rem 0.6rem; background: var(--surface2);
    border: 1px solid var(--border); cursor: pointer; transition: all 0.2s;
  }
  .pu-item:hover { border-color: var(--wild); background: rgba(176,110,243,0.07); }
  .pu-icon { font-size: 1rem; flex-shrink: 0; }
  .pu-info .pu-name { font-family: 'DM Mono', monospace; font-size: 0.62rem; letter-spacing: 0.05em; color: var(--text); }
  .pu-info .pu-desc { font-size: 0.54rem; color: var(--text-dim); margin-top: 0.1rem; }
  .no-pu { font-family: 'DM Mono', monospace; font-size: 0.62rem; color: var(--text-dim); padding: 0.3rem 0; }

  .sidebar-btns { display: flex; flex-direction: column; gap: 0.38rem; margin-top: auto; }
  .btn-side {
    padding: 0.5rem 0.7rem; background: var(--surface2); border: 1px solid var(--border);
    color: var(--text-dim); font-family: 'DM Mono', monospace; font-size: 0.6rem;
    letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: all 0.2s; text-align: left;
  }
  .btn-side:hover { border-color: var(--accent); color: var(--text); }
  .btn-side:disabled { opacity: 0.3; cursor: not-allowed; }
  .btn-side.red-hover:hover { border-color: var(--red); color: var(--red); }

  /* ── BOARD AREA ── */
  .game-main {
    flex: 1; display: flex; flex-direction: column;
    align-items: center; justify-content: center; padding: 2rem; gap: 1.2rem;
    background: radial-gradient(ellipse at 50% 100%, rgba(232,57,42,0.04) 0%, transparent 60%);
  }

  .status-bar {
    font-family: 'DM Mono', monospace; font-size: 0.75rem;
    letter-spacing: 0.15em; color: var(--text-dim); text-align: center;
    min-height: 1.4rem; transition: color 0.3s;
  }
  .status-bar .r { color: var(--red); font-weight: 500; }
  .status-bar .y { color: var(--yellow); font-weight: 500; }
  .status-bar .w { color: var(--wild); }

  .col-targets { display: flex; gap: 6px; }
  .col-btn {
    width: 64px; height: 30px; background: none; border: none;
    cursor: pointer; display: flex; align-items: center; justify-content: center;
    position: relative;
  }
  .col-preview {
    width: 22px; height: 22px; border-radius: 50%; opacity: 0;
    transition: opacity 0.15s; pointer-events: none;
    background: var(--red);
  }
  .col-btn:hover .col-preview { opacity: 0.55; }

  .board-wrap {
    background: var(--board-bg); border: 1px solid var(--border);
    padding: 10px; position: relative;
    box-shadow: 0 0 60px rgba(0,0,0,0.7), inset 0 0 24px rgba(0,0,0,0.5);
  }

  .board-grid {
    display: grid;
    grid-template-columns: repeat(7, 64px);
    grid-template-rows: repeat(6, 64px);
    gap: 6px;
  }

  .cell {
    width: 64px; height: 64px; border-radius: 50%;
    background: var(--cell); box-shadow: inset 0 4px 10px rgba(0,0,0,0.8);
    position: relative; overflow: hidden; cursor: pointer; transition: background 0.08s;
  }
  .cell::after {
    content: ''; position: absolute; inset: 0; border-radius: 50%;
    background: radial-gradient(circle at 35% 28%, rgba(255,255,255,0.09), transparent 55%);
    pointer-events: none;
  }
  .cell.p1 { background: var(--red); box-shadow: 0 0 18px var(--red-glow), inset 0 3px 8px rgba(0,0,0,0.25); cursor: default; }
  .cell.p2 { background: var(--yellow); box-shadow: 0 0 18px var(--yellow-glow), inset 0 3px 8px rgba(0,0,0,0.25); cursor: default; }
  .cell.wild { background: var(--wild); box-shadow: 0 0 22px var(--wild-glow), inset 0 3px 8px rgba(0,0,0,0.25); cursor: default; }
  .cell.drop { animation: dropIn 0.24s cubic-bezier(0.22,0.61,0.36,1) forwards; }
  .cell.win-pulse { animation: winPulse 0.45s ease infinite alternate; }
  .cell.bomb-anim { animation: bombOut 0.28s ease forwards; }

  .board-wrap.bomb-mode .cell:not(.p1):not(.p2):not(.wild) { cursor: crosshair; }
  .board-wrap.bomb-mode .cell.p1,
  .board-wrap.bomb-mode .cell.p2,
  .board-wrap.bomb-mode .cell.wild { cursor: crosshair; outline: 2px solid rgba(255,120,0,0.25); }
  .board-wrap.bomb-mode .cell:hover { outline: 2px solid rgba(255,120,0,0.7) !important; }

  @keyframes dropIn {
    from { transform: translateY(-420px); opacity: 0.4; }
    to   { transform: translateY(0); opacity: 1; }
  }
  @keyframes winPulse {
    from { filter: brightness(1); }
    to   { filter: brightness(1.6) saturate(1.4); }
  }
  @keyframes bombOut {
    0%   { transform: scale(1); background: #ff8800; }
    100% { transform: scale(0); opacity: 0; }
  }

  .freeze-overlay {
    position: absolute; inset: 0; pointer-events: none;
    background: rgba(100,210,255,0.04); display: none;
    border: 1px solid rgba(100,210,255,0.2);
  }
  .freeze-overlay.show { display: block; animation: freezeFlash 0.7s ease; }
  @keyframes freezeFlash {
    0%,100% { background: rgba(100,210,255,0.04); }
    40%     { background: rgba(100,210,255,0.18); }
  }

  .board-legend {
    display: flex; gap: 1.8rem;
    font-family: 'DM Mono', monospace; font-size: 0.6rem; color: var(--text-dim);
  }

  /* ── WIN OVERLAY ── */
  .win-overlay {
    display: none; position: fixed; inset: 0;
    background: rgba(0,0,0,0.78); backdrop-filter: blur(10px);
    z-index: 1000; align-items: center; justify-content: center;
  }
  .win-overlay.show { display: flex; }
  .win-card {
    background: var(--surface); border: 1px solid var(--border);
    padding: 2.8rem 3.5rem; text-align: center;
    animation: fadeUp 0.35s ease; max-width: 460px; width: 90%;
  }
  .win-emoji { font-size: 3.2rem; margin-bottom: 0.8rem; display: block; }
  .win-title { font-family: 'Bebas Neue', sans-serif; font-size: 3rem; letter-spacing: 0.08em; margin-bottom: 0.4rem; }
  .win-sub { font-family: 'DM Mono', monospace; font-size: 0.68rem; color: var(--text-dim); letter-spacing: 0.14em; margin-bottom: 2rem; }
  .win-stats { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 0.8rem; margin-bottom: 2rem; }
  .wsb { background: var(--surface2); border: 1px solid var(--border); padding: 0.7rem; }
  .wsb-val { font-family: 'Bebas Neue', sans-serif; font-size: 1.8rem; line-height: 1; }
  .wsb-lbl { font-family: 'DM Mono', monospace; font-size: 0.48rem; letter-spacing: 0.12em; color: var(--text-dim); text-transform: uppercase; margin-top: 0.2rem; }
  .win-btns { display: flex; gap: 0.7rem; }
  .btn-again {
    flex: 1; padding: 0.75rem;
    background: var(--red); border: none; color: #fff;
    font-family: 'Bebas Neue', sans-serif; font-size: 1.2rem;
    letter-spacing: 0.08em; cursor: pointer; transition: all 0.2s;
  }
  .btn-again:hover { background: #ff4535; }
  .btn-wmenu {
    flex: 1; padding: 0.75rem;
    background: none; border: 1px solid var(--border); color: var(--text-dim);
    font-family: 'DM Mono', monospace; font-size: 0.62rem;
    letter-spacing: 0.1em; cursor: pointer; transition: all 0.2s;
  }
  .btn-wmenu:hover { border-color: var(--accent); color: var(--text); }

  /* ── TOAST ── */
  .toast-wrap {
    position: fixed; top: 1.4rem; left: 50%; transform: translateX(-50%);
    z-index: 2000; display: flex; flex-direction: column; gap: 0.45rem;
    pointer-events: none; align-items: center;
  }
  .toast {
    background: var(--surface2); border: 1px solid var(--border);
    padding: 0.55rem 1.1rem; font-family: 'DM Mono', monospace;
    font-size: 0.68rem; letter-spacing: 0.08em; white-space: nowrap;
    animation: toastIn 0.28s ease, toastOut 0.28s 2.3s ease forwards;
  }
  @keyframes toastIn  { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
  @keyframes toastOut { to   { opacity:0; transform:translateY(-8px); } }

  /* ── RESPONSIVE ── */
  @media (max-width: 860px) {
    #screen-game { flex-direction: column; }
    .sidebar {
      width: 100%; flex-direction: row; flex-wrap: wrap;
      gap: 0.8rem; border-right: none; border-bottom: 1px solid var(--border);
      padding: 0.9rem; max-height: none;
    }
    .sidebar-section { min-width: 130px; }
    .sidebar-btns { flex-direction: row; margin-top: 0; align-self: flex-end; }
    .board-grid { grid-template-columns: repeat(7, 48px); grid-template-rows: repeat(6, 48px); gap: 5px; }
    .cell, .col-btn { width: 48px; }
    .cell { height: 48px; }
    .col-targets { gap: 5px; }
  }
  @media (max-width: 480px) {
    .board-grid { grid-template-columns: repeat(7, 40px); grid-template-rows: repeat(6, 40px); gap: 4px; }
    .cell, .col-btn { width: 40px; }
    .cell { height: 40px; }
    .col-targets { gap: 4px; }
    .sidebar { display: none; }
    .game-main { padding: 0.8rem; }
  }

  @keyframes fadeUp {
    from { opacity:0; transform:translateY(14px); }
    to   { opacity:1; transform:translateY(0); }
  }
</style>
</head>
<body>

<!-- ══ INTRO ══ -->
<div id="screen-intro" class="screen active">
  <p class="intro-eyebrow">Minimax AI · Power-Ups · Undo · Streaks · Ultimate Edition</p>
  <h1 class="intro-title"><span class="r">CON</span><span class="y">NECT</span><br><span class="r">FO</span><span class="y">UR</span></h1>
  <p class="intro-sub">DEFEAT THE AI · COLLECT POWER-UPS · DOMINATE</p>

  <div class="setup-card">
    <div class="field">
      <label>Your Name</label>
      <input type="text" id="input-name" placeholder="Enter name..." maxlength="16" value="Player"/>
    </div>
    <div class="field">
      <label>AI Difficulty</label>
      <div class="btn-group">
        <button class="btn-option" data-diff="2">Easy</button>
        <button class="btn-option active" data-diff="4">Medium</button>
        <button class="btn-option" data-diff="6">Hard</button>
      </div>
    </div>
    <div class="field">
      <label>Power-Ups</label>
      <div class="toggle-row">
        <div class="toggle on" id="toggle-pu"></div>
        <span class="toggle-label" id="toggle-pu-lbl">Enabled — earn them every 3 moves</span>
      </div>
    </div>
    <button class="btn-start" id="btn-start">PLAY →</button>
  </div>
</div>

<!-- ══ GAME ══ -->
<div id="screen-game" class="screen">
  <aside class="sidebar">
    <div class="sidebar-logo"><span class="r">CONNECT</span> <span class="y">FOUR</span></div>

    <div class="sidebar-section">
      <div class="sidebar-label">Players</div>
      <div class="player-row active-turn" id="row-p1">
        <div class="player-dot red"></div>
        <div class="player-info">
          <div class="player-name" id="p1-name">Player</div>
          <div class="player-type">Human · Red</div>
        </div>
        <div class="turn-arrow">▶</div>
      </div>
      <div class="player-row" id="row-p2">
        <div class="player-dot yellow"></div>
        <div class="player-info">
          <div class="player-name">AI</div>
          <div class="player-type" id="diff-lbl">Medium</div>
        </div>
        <div class="turn-arrow">▶</div>
      </div>
    </div>

    <div class="sidebar-section">
      <div class="sidebar-label">Score</div>
      <div class="stat-grid">
        <div class="stat-box"><div class="stat-val red" id="s-wins">0</div><div class="stat-lbl">Wins</div></div>
        <div class="stat-box"><div class="stat-val yellow" id="s-losses">0</div><div class="stat-lbl">Losses</div></div>
        <div class="stat-box"><div class="stat-val dim" id="s-draws">0</div><div class="stat-lbl">Draws</div></div>
        <div class="stat-box"><div class="stat-val dim" id="s-streak">0</div><div class="stat-lbl">Streak 🔥</div></div>
      </div>
    </div>

    <div class="sidebar-section" id="pu-section">
      <div class="sidebar-label">Power-Ups <span id="pu-cnt" style="color:var(--wild)"></span></div>
      <div class="powerup-list" id="pu-list">
        <div class="no-pu">None yet — play to earn!</div>
      </div>
    </div>

    <div class="sidebar-btns">
      <button class="btn-side" id="btn-undo">↩ Undo (2 left)</button>
      <button class="btn-side red-hover" id="btn-menu">← Menu</button>
    </div>
  </aside>

  <main class="game-main">
    <div class="status-bar" id="status"></div>

    <div class="col-targets" id="col-targets"></div>

    <div class="board-wrap" id="board-wrap">
      <div class="board-grid" id="board"></div>
      <div class="freeze-overlay" id="freeze-overlay"></div>
    </div>

    <div class="board-legend">
      <span><span style="color:var(--red)">●</span> You (Red)</span>
      <span><span style="color:var(--yellow)">●</span> AI (Yellow)</span>
      <span><span style="color:var(--wild)">●</span> Wildcard</span>
    </div>
  </main>
</div>

<!-- ══ WIN OVERLAY ══ -->
<div class="win-overlay" id="win-overlay">
  <div class="win-card">
    <span class="win-emoji" id="w-emoji">🏆</span>
    <div class="win-title" id="w-title">YOU WIN!</div>
    <div class="win-sub" id="w-sub">Well played</div>
    <div class="win-stats">
      <div class="wsb"><div class="wsb-val" id="w-moves">—</div><div class="wsb-lbl">Moves</div></div>
      <div class="wsb"><div class="wsb-val" id="w-pu">—</div><div class="wsb-lbl">Power-Ups</div></div>
      <div class="wsb"><div class="wsb-val" id="w-streak">—</div><div class="wsb-lbl">Streak</div></div>
    </div>
    <div class="win-btns">
      <button class="btn-again" id="btn-again">PLAY AGAIN</button>
      <button class="btn-wmenu" id="btn-wmenu">MENU</button>
    </div>
  </div>
</div>

<div class="toast-wrap" id="toasts"></div>

<script>
// ════════════════════════════════════════════════════════
//  CONNECT FOUR — ULTIMATE EDITION
//  Minimax AI with alpha-beta pruning
//  Power-Ups: Bomb, Wildcard, Freeze, Double
//  Undo, Streaks, Session Stats
// ════════════════════════════════════════════════════════

const ROWS=6, COLS=7, EMPTY=0, P1=1, P2=2;

const PU_DEFS = {
  bomb:   { icon:'💣', name:'Bomb',     desc:'Blast a 3×3 area — gravity applies' },
  wild:   { icon:'⭐', name:'Wildcard', desc:'Counts as BOTH colors — blocks AI wins' },
  freeze: { icon:'❄️', name:'Freeze',   desc:'AI skips its next turn' },
  double: { icon:'⚡', name:'Double',   desc:'You drop TWO pieces this turn' },
};

let G = {};   // game state

function initG(keepScore=false) {
  G = {
    board:      Array.from({length:ROWS}, ()=>Array(COLS).fill(EMPTY)),
    wilds:      Array.from({length:ROWS}, ()=>Array(COLS).fill(false)),
    turn:       P1,
    over:       false,
    name:       document.getElementById('input-name').value.trim()||'Player',
    diff:       selDiff,
    puOn:       puEnabled,
    puInv:      [],
    freeze:     false,
    doubleTurn: false,
    pendWild:   false,
    bombMode:   false,
    undos:      2,
    history:    [],
    moves:      0,
    puUsed:     0,
    wins:   keepScore ? G.wins   : 0,
    losses: keepScore ? G.losses : 0,
    draws:  keepScore ? G.draws  : 0,
    streak: keepScore ? G.streak : 0,
  };
}

// ── SETUP SCREEN ─────────────────────────────────────────
let selDiff = 4, puEnabled = true;

document.querySelectorAll('.btn-option').forEach(b => {
  b.addEventListener('click', () => {
    document.querySelectorAll('.btn-option').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    selDiff = +b.dataset.diff;
  });
});

const togPU = document.getElementById('toggle-pu');
const togLbl = document.getElementById('toggle-pu-lbl');
togPU.addEventListener('click', () => {
  puEnabled = !puEnabled;
  togPU.classList.toggle('on', puEnabled);
  togLbl.textContent = puEnabled ? 'Enabled — earn them every 3 moves' : 'Disabled';
});

document.getElementById('btn-start').addEventListener('click', () => startGame(false));
document.getElementById('btn-again').addEventListener('click', () => {
  document.getElementById('win-overlay').classList.remove('show');
  startGame(true);
});
document.getElementById('btn-wmenu').addEventListener('click', () => {
  document.getElementById('win-overlay').classList.remove('show');
  showScreen('intro');
});
document.getElementById('btn-menu').addEventListener('click', () => showScreen('intro'));
document.getElementById('btn-undo').addEventListener('click', doUndo);

function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  document.getElementById('screen-'+id).classList.add('active');
}

function startGame(keep=false) {
  initG(keep);
  document.getElementById('p1-name').textContent = G.name;
  const dn = {2:'Easy · Depth 2', 4:'Medium · Depth 4', 6:'Hard · Depth 6'};
  document.getElementById('diff-lbl').textContent = dn[G.diff]||'Medium';
  document.getElementById('pu-section').style.display = G.puOn ? '' : 'none';
  buildBoard();
  buildColBtns();
  renderBoard();
  renderPU();
  updateScore();
  setTurn();
  setStatus('Your turn — click a column', false);
  showScreen('game');
}

// ── DOM BUILD ────────────────────────────────────────────
function buildBoard() {
  const grid = document.getElementById('board');
  grid.innerHTML = '';
  for (let r=0;r<ROWS;r++) for (let c=0;c<COLS;c++) {
    const el = document.createElement('div');
    el.className = 'cell';
    el.dataset.r = r; el.dataset.c = c;
    el.addEventListener('click', ()=>onCellClick(+el.dataset.r, +el.dataset.c));
    grid.appendChild(el);
  }
}

function buildColBtns() {
  const wrap = document.getElementById('col-targets');
  wrap.innerHTML = '';
  for (let c=0;c<COLS;c++) {
    const btn = document.createElement('button');
    btn.className = 'col-btn';
    const dot = document.createElement('div');
    dot.className = 'col-preview';
    btn.appendChild(dot);
    btn.addEventListener('click', ()=>onColClick(c));
    wrap.appendChild(btn);
  }
}

// ── RENDER ───────────────────────────────────────────────
function cellEl(r,c) { return document.querySelector(`.cell[data-r="${r}"][data-c="${c}"]`); }

function renderBoard(anim=null) {
  for (let r=0;r<ROWS;r++) for (let c=0;c<COLS;c++) {
    const el = cellEl(r,c);
    el.className = 'cell';
    if (G.wilds[r][c]) el.classList.add('wild');
    else if (G.board[r][c]===P1) el.classList.add('p1');
    else if (G.board[r][c]===P2) el.classList.add('p2');
    if (anim && anim.r===r && anim.c===c) {
      el.classList.add('drop');
      el.addEventListener('animationend',()=>el.classList.remove('drop'),{once:true});
    }
  }
  document.getElementById('board-wrap').classList.toggle('bomb-mode', G.bombMode);
}

function flashWin(cells) {
  cells.forEach(({r,c})=>{
    const el=cellEl(r,c);
    if(el) el.classList.add('win-pulse');
  });
}

function setTurn() {
  document.getElementById('row-p1').classList.toggle('active-turn', G.turn===P1);
  document.getElementById('row-p2').classList.toggle('active-turn', G.turn===P2);
}

function setStatus(msg, bright=false) {
  const el = document.getElementById('status');
  el.innerHTML = msg;
  el.style.color = bright ? 'var(--text)' : 'var(--text-dim)';
}

function updateScore() {
  document.getElementById('s-wins').textContent   = G.wins;
  document.getElementById('s-losses').textContent = G.losses;
  document.getElementById('s-draws').textContent  = G.draws;
  document.getElementById('s-streak').textContent = G.streak;
  const btn = document.getElementById('btn-undo');
  btn.textContent = `↩ Undo (${G.undos} left)`;
  btn.disabled = G.undos<=0 || G.history.length<2 || G.over;
}

function renderPU() {
  const list = document.getElementById('pu-list');
  const cnt  = document.getElementById('pu-cnt');
  list.innerHTML = '';
  if (!G.puInv.length) {
    list.innerHTML = '<div class="no-pu">None yet — play to earn!</div>';
    cnt.textContent = '';
    return;
  }
  cnt.textContent = `(${G.puInv.length})`;
  G.puInv.forEach((pu,i) => {
    const d = PU_DEFS[pu];
    const el = document.createElement('div');
    el.className = 'pu-item';
    el.innerHTML = `<span class="pu-icon">${d.icon}</span><div class="pu-info"><div class="pu-name">${d.name}</div><div class="pu-desc">${d.desc}</div></div>`;
    el.addEventListener('click', ()=>usePU(i));
    list.appendChild(el);
  });
}

// ── GAME LOGIC ───────────────────────────────────────────
function validCol(c) { return c>=0&&c<COLS&&G.board[0][c]===EMPTY; }

function drop(col, player, isWild=false) {
  for (let r=ROWS-1;r>=0;r--) {
    if (G.board[r][col]===EMPTY) {
      G.board[r][col] = player;
      if (isWild) G.wilds[r][col] = true;
      G.history.push({r,col,player,wild:isWild});
      return r;
    }
  }
  return -1;
}

function boardFull() { return G.board[0].every(v=>v!==EMPTY); }

function checkWin(player) {
  const ok = (r,c) => G.board[r][c]===player || G.wilds[r][c];
  const hasP = (r,c) => G.board[r][c]===player;
  const test = cells => {
    if (cells.every(([r,c])=>ok(r,c)) && cells.some(([r,c])=>hasP(r,c)))
      return cells.map(([r,c])=>({r,c}));
    return null;
  };
  for(let r=0;r<ROWS;r++) for(let c=0;c<=COLS-4;c++) { const w=test([[r,c],[r,c+1],[r,c+2],[r,c+3]]); if(w)return w; }
  for(let c=0;c<COLS;c++) for(let r=0;r<=ROWS-4;r++) { const w=test([[r,c],[r+1,c],[r+2,c],[r+3,c]]); if(w)return w; }
  for(let r=0;r<=ROWS-4;r++) for(let c=0;c<=COLS-4;c++) { const w=test([[r,c],[r+1,c+1],[r+2,c+2],[r+3,c+3]]); if(w)return w; }
  for(let r=0;r<=ROWS-4;r++) for(let c=3;c<COLS;c++) { const w=test([[r,c],[r+1,c-1],[r+2,c-2],[r+3,c-3]]); if(w)return w; }
  return null;
}

function applyGravity() {
  for (let c=0;c<COLS;c++) {
    const ps=[],ws=[];
    for(let r=ROWS-1;r>=0;r--) if(G.board[r][c]!==EMPTY){ps.push(G.board[r][c]);ws.push(G.wilds[r][c]);}
    for(let r=0;r<ROWS;r++){G.board[r][c]=EMPTY;G.wilds[r][c]=false;}
    ps.forEach((p,i)=>{G.board[ROWS-1-i][c]=p;G.wilds[ROWS-1-i][c]=ws[i];});
  }
}

// ── MINIMAX ──────────────────────────────────────────────
function scoreWin(win, p) {
  const o = p===P2?P1:P2;
  const pc=win.filter(v=>v===p).length, ec=win.filter(v=>v===EMPTY).length, oc=win.filter(v=>v===o).length;
  if(pc===4)return 1000; if(pc===3&&ec===1)return 10; if(pc===2&&ec===2)return 3; if(oc===3&&ec===1)return -80;
  return 0;
}

function heuristic(b) {
  let s=0;
  for(let r=0;r<ROWS;r++) if(b[r][3]===P2) s+=4;
  const w=(cells)=>cells.map(([r,c])=>b[r][c]);
  for(let r=0;r<ROWS;r++) for(let c=0;c<=COLS-4;c++) s+=scoreWin(w([[r,c],[r,c+1],[r,c+2],[r,c+3]]),P2);
  for(let c=0;c<COLS;c++) for(let r=0;r<=ROWS-4;r++) s+=scoreWin(w([[r,c],[r+1,c],[r+2,c],[r+3,c]]),P2);
  for(let r=0;r<=ROWS-4;r++) for(let c=0;c<=COLS-4;c++) s+=scoreWin(w([[r,c],[r+1,c+1],[r+2,c+2],[r+3,c+3]]),P2);
  for(let r=0;r<=ROWS-4;r++) for(let c=3;c<COLS;c++) s+=scoreWin(w([[r,c],[r+1,c-1],[r+2,c-2],[r+3,c-3]]),P2);
  return s;
}

function simWin(b, p) {
  const c=(r,col)=>b[r][col]===p;
  for(let r=0;r<ROWS;r++) for(let col=0;col<=COLS-4;col++) if(c(r,col)&&c(r,col+1)&&c(r,col+2)&&c(r,col+3))return true;
  for(let col=0;col<COLS;col++) for(let r=0;r<=ROWS-4;r++) if(c(r,col)&&c(r+1,col)&&c(r+2,col)&&c(r+3,col))return true;
  for(let r=0;r<=ROWS-4;r++) for(let col=0;col<=COLS-4;col++) if(c(r,col)&&c(r+1,col+1)&&c(r+2,col+2)&&c(r+3,col+3))return true;
  for(let r=0;r<=ROWS-4;r++) for(let col=3;col<COLS;col++) if(c(r,col)&&c(r+1,col-1)&&c(r+2,col-2)&&c(r+3,col-3))return true;
  return false;
}

function simDrop(b,col,p){const nb=b.map(r=>[...r]);for(let r=ROWS-1;r>=0;r--)if(nb[r][col]===EMPTY){nb[r][col]=p;return nb;}return null;}
function simFull(b){return b[0].every(v=>v!==EMPTY);}

function minimax(b,depth,alpha,beta,max){
  if(simWin(b,P2)) return  100000+depth;
  if(simWin(b,P1)) return -100000-depth;
  if(simFull(b)||depth===0) return heuristic(b);
  const cols=[3,2,4,1,5,0,6];
  if(max){
    let best=-Infinity;
    for(const c of cols){if(b[0][c]!==EMPTY)continue;const nb=simDrop(b,c,P2);best=Math.max(best,minimax(nb,depth-1,alpha,beta,false));alpha=Math.max(alpha,best);if(alpha>=beta)break;}
    return best;
  } else {
    let best=Infinity;
    for(const c of cols){if(b[0][c]!==EMPTY)continue;const nb=simDrop(b,c,P1);best=Math.min(best,minimax(nb,depth-1,alpha,beta,true));beta=Math.min(beta,best);if(alpha>=beta)break;}
    return best;
  }
}

function aiMove() {
  const cols=[3,2,4,1,5,0,6];
  let best=-Infinity, col=3;
  for(const c of cols){
    if(!validCol(c))continue;
    const nb=simDrop(G.board,c,P2);
    const s=minimax(nb,G.diff-1,-Infinity,Infinity,false);
    if(s>best){best=s;col=c;}
  }
  return col;
}

// ── POWER-UPS ────────────────────────────────────────────
function tryAwardPU() {
  if(!G.puOn||G.puInv.length>=3) return;
  if(Math.random()>0.32) return;
  const types = Object.keys(PU_DEFS);
  const pu = types[Math.floor(Math.random()*types.length)];
  G.puInv.push(pu);
  renderPU();
  toast(`🎁 Power-up: ${PU_DEFS[pu].icon} ${PU_DEFS[pu].name} earned!`);
}

function usePU(idx) {
  if(G.over||G.turn!==P1) return;
  const pu = G.puInv[idx];
  if(!pu) return;
  G.puInv.splice(idx,1);
  G.puUsed++;
  renderPU();

  if(pu==='freeze') {
    G.freeze=true;
    toast('❄️  AI is FROZEN — skips next turn!');
    const fo=document.getElementById('freeze-overlay');
    fo.classList.add('show'); setTimeout(()=>fo.classList.remove('show'),800);
  } else if(pu==='double') {
    G.doubleTurn=true;
    toast('⚡ DOUBLE MOVE — drop two pieces!');
    setStatus('<span class="w">⚡ DOUBLE:</span> Drop another piece!', true);
  } else if(pu==='wild') {
    G.pendWild=true;
    setStatus('<span class="w">⭐ WILDCARD:</span> Click a column to place it', true);
  } else if(pu==='bomb') {
    G.bombMode=true;
    document.getElementById('board-wrap').classList.add('bomb-mode');
    setStatus('<span style="color:orange">💣 BOMB:</span> Click any cell to blast a 3×3 area', true);
  }
}

function doBomb(row,col) {
  const toRemove=[];
  for(let r=Math.max(0,row-1);r<=Math.min(ROWS-1,row+1);r++)
    for(let c=Math.max(0,col-1);c<=Math.min(COLS-1,col+1);c++)
      toRemove.push({r,c});

  toRemove.forEach(({r,c})=>{
    const el=cellEl(r,c); if(el) el.classList.add('bomb-anim');
  });

  setTimeout(()=>{
    toRemove.forEach(({r,c})=>{G.board[r][c]=EMPTY;G.wilds[r][c]=false;});
    applyGravity();
    G.bombMode=false;
    document.getElementById('board-wrap').classList.remove('bomb-mode');
    renderBoard();
    setStatus('Your turn — drop a piece', false);
    toast('💣 BOOM! Area cleared!');
  }, 320);
}

// ── UNDO ─────────────────────────────────────────────────
function doUndo() {
  if(G.undos<=0||G.history.length<2||G.over) return;
  for(let i=0;i<2;i++){
    const m=G.history.pop(); if(!m)break;
    G.board[m.r][m.col]=EMPTY; G.wilds[m.r][m.col]=false;
  }
  G.undos--;
  G.turn=P1; G.doubleTurn=false; G.bombMode=false; G.pendWild=false;
  document.getElementById('board-wrap').classList.remove('bomb-mode');
  renderBoard(); setTurn(); updateScore();
  setStatus('Move undone — your turn!', false);
  toast('↩ Move undone!');
}

// ── INPUT ────────────────────────────────────────────────
function onColClick(col) {
  if(G.over||G.turn!==P1||G.bombMode) return;
  if(!validCol(col)){toast('Column is full!');return;}
  placeP1(col, G.pendWild);
  G.pendWild=false;
}

function onCellClick(row,col) {
  if(G.bombMode) { doBomb(row,col); return; }
  onColClick(col);
}

function placeP1(col, isWild=false) {
  const row = drop(col, P1, isWild);
  if(row===-1) return;
  G.moves++;
  renderBoard({r:row,c:col});
  if(G.moves%3===0) tryAwardPU();

  const wc = checkWin(P1);
  if(wc){flashWin(wc);endGame('p1');return;}
  if(boardFull()){endGame('draw');return;}

  if(G.doubleTurn){
    G.doubleTurn=false;
    setStatus('<span class="r">⚡ BONUS MOVE!</span> Drop another piece', true);
    return;
  }

  G.turn=P2; setTurn();
  setStatus('<span class="y">AI</span> is thinking...', false);
  setTimeout(doAI, 480);
}

function doAI() {
  if(G.freeze){
    G.freeze=false;
    toast('❄️  AI skips its turn!');
    G.turn=P1; setTurn();
    setStatus('Your turn — drop a piece', false);
    return;
  }
  const col=aiMove();
  const row=drop(col,P2);
  G.moves++;
  renderBoard({r:row,c:col});

  const wc=checkWin(P2);
  if(wc){flashWin(wc);endGame('p2');return;}
  if(boardFull()){endGame('draw');return;}

  G.turn=P1; setTurn();
  setStatus('Your turn — drop a piece', false);
}

// ── END GAME ─────────────────────────────────────────────
function endGame(result) {
  G.over=true;
  const ov=document.getElementById('win-overlay');
  document.getElementById('w-moves').textContent  = G.moves;
  document.getElementById('w-pu').textContent     = G.puUsed;

  if(result==='p1'){
    G.wins++; G.streak++;
    document.getElementById('w-emoji').textContent = '🏆';
    document.getElementById('w-title').textContent = 'YOU WIN!';
    document.getElementById('w-title').style.color = 'var(--red)';
    document.getElementById('w-sub').textContent   = G.streak>1?`🔥 ${G.streak} win streak!`:'Well played!';
    setStatus(`<span class="r">🏆 ${G.name} wins!</span>`, true);
  } else if(result==='p2'){
    G.losses++; G.streak=0;
    document.getElementById('w-emoji').textContent = '🤖';
    document.getElementById('w-title').textContent = 'AI WINS!';
    document.getElementById('w-title').style.color = 'var(--yellow)';
    document.getElementById('w-sub').textContent   = 'Better luck next time!';
    setStatus(`<span class="y">🤖 AI wins!</span>`, true);
  } else {
    G.draws++; G.streak=0;
    document.getElementById('w-emoji').textContent = '🤝';
    document.getElementById('w-title').textContent = "IT'S A DRAW";
    document.getElementById('w-title').style.color = 'var(--accent)';
    document.getElementById('w-sub').textContent   = 'So close!';
    setStatus("🤝 Draw!", true);
  }

  document.getElementById('w-streak').textContent = G.streak;
  updateScore();
  setTimeout(()=>ov.classList.add('show'), 900);
}

// ── TOAST ────────────────────────────────────────────────
function toast(msg) {
  const wrap=document.getElementById('toasts');
  const el=document.createElement('div');
  el.className='toast'; el.textContent=msg;
  wrap.appendChild(el);
  setTimeout(()=>el.remove(), 2700);
}

// ── KEYBOARD ─────────────────────────────────────────────
document.addEventListener('keydown', e=>{
  if(!document.getElementById('screen-game').classList.contains('active')) return;
  if(e.key>='1'&&e.key<='7') onColClick(+e.key-1);
  if(e.key==='z'||e.key==='Z') doUndo();
});
</script>
</body>
</html>
