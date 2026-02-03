// faces for dice 1–6
const diceFaces = [
  "assets/die faces/1.webp",
  "assets/die faces/2.webp",
  "assets/die faces/3.webp",
  "assets/die faces/4.webp",
  "assets/die faces/5.webp",
  "assets/die faces/6.webp"
];

const MIDROLL_FRAME_SRC = "assets/die faces/midrollframe.webp";
const MIDROLL_FRAME_SRC_2 = "assets/die faces/midrollframe2.webp";

// PUCK IMAGE SOURCES
const PUCK_OFF_SRC = "assets/puck/off.webp";
const PUCK_ON_SRC  = "assets/puck/on.webp";

/* ====================
   GLOBAL UI SOUNDS
   (thin UI layer only)
==================== */

// Background music (low volume)
const BGM_SRC = "assets/bgm/bgm.mp3";
let bgmAudio = null;
let bgmWasPlaying = false;

// UI click / tap
const TAP_SOUND_SRC = "assets/tap sound/tap.mp3";

// Piggybank
const DEPOSIT_SOUND_SRC = "assets/piggybank sounds/deposit.mp3";
const WITHDRAW_SOUND_SRC = "assets/piggybank sounds/withdraw.mp3";

// Win / Lose
const WIN_SOUND_SOURCES = [
  "assets/winorlose/win.mp3",
  "assets/winorlose/win3.mp3",
  "assets/winorlose/win2.mp3"
];
const LOSE_SOUND_SRC = "assets/winorlose/lose.mp3";

function playOneShot(src, volume = 1.0) {
  const a = new Audio(src);
  a.volume = volume;
  a.preload = "auto";
  try {
    a.currentTime = 0;
    const p = a.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  } catch {}
}

function playOneShotOncePerRoll(src, volume = 1.0) {
  if (!gameState || !gameState._soundsThisRoll) {
    playOneShot(src, volume);
    return;
  }
  if (gameState._soundsThisRoll.has(src)) return;
  gameState._soundsThisRoll.add(src);
  playOneShot(src, volume);
}

function getRandomWinSoundSrc() {
  return WIN_SOUND_SOURCES[Math.floor(Math.random() * WIN_SOUND_SOURCES.length)];
}

function ensureBgm() {
  if (bgmAudio) return bgmAudio;
  bgmAudio = new Audio(BGM_SRC);
  bgmAudio.loop = true;
  bgmAudio.volume = 0.50; // LOWER than everything else
  bgmAudio.preload = "auto";
  return bgmAudio;
}

function startBgm() {
  const a = ensureBgm();
  try {
    const p = a.play();
    if (p && typeof p.catch === "function") p.catch(() => {});
  } catch {}
}

function handleVisibilityChange() {
  if (!bgmAudio) return;
  if (document.hidden) {
    bgmWasPlaying = !bgmAudio.paused;
    bgmAudio.pause();
  } else if (bgmWasPlaying) {
    try {
      const p = bgmAudio.play();
      if (p && typeof p.catch === "function") p.catch(() => {});
    } catch {}
  }
}

/* --------------------
   ROLL SOUND (UI ONLY)
-------------------- */
const ROLL_SOUND_SOURCES = [
  "assets/roll sound/roll.mp3",
  "assets/roll sound/roll2.mp3"
];
let rollAudio = null;
let rollAudioSrc = null;

function ensureRollAudio(src) {
  if (rollAudio && rollAudioSrc === src) return rollAudio;
  rollAudio = new Audio(src);
  rollAudioSrc = src;
  rollAudio.loop = true;      // keep playing until we explicitly stop it
  rollAudio.preload = "auto"; // try to load early
  return rollAudio;
}

function startRollSound() {
  const src = ROLL_SOUND_SOURCES[Math.floor(Math.random() * ROLL_SOUND_SOURCES.length)];
  const a = ensureRollAudio(src);
  try {
    a.currentTime = 0;
    const p = a.play(); // must be triggered by the user's click
    if (p && typeof p.catch === "function") p.catch(() => {});
  } catch {}
}

function stopRollSound() {
  if (!rollAudio) return;
  try {
    rollAudio.pause();
    rollAudio.currentTime = 0;
  } catch {}
}

// PUCK ANIMATION DIALS (ms)
const PUCK_MOVE_MS = 260;  // DIAL: slide speed
const PUCK_SWAP_MS = 120;  // DIAL: quick fade/pop during ON/OFF swap

// DICE ANIMATION DIALS (ms / px)
const DICE_ANIM_DURATION_MS = 950;   // DIAL: total travel time
const DICE_FACE_SWAP_MS = 60;        // DIAL: how fast faces cycle
const DICE_EDGE_OFFSET_PX = 90;      // DIAL: how far outside zone dice start
const DICE_INNER_PADDING_PX = 30;    // DIAL: keep dice away from zone edges

/* --------------------
   CHIP OPTIONS
-------------------- */
const CHIP_OPTIONS = [1, 5, 10, 25, "ALL"];
let selectedChipValue = 5; // number (1/5/10/25) or "ALL"

/* --------------------
   START BANKROLL
-------------------- */
const START_BANKROLL_DOLLARS = 100.0;

/* --------------------
   PAGE ELEMENTS
-------------------- */
const bankrollDisplayEl = document.getElementById("bankrollDisplay");
const phaseDisplayEl = document.getElementById("phaseDisplay");

const rollButton = document.getElementById("rollButton");
const die1El = document.getElementById("die1");
const die2El = document.getElementById("die2");
const diceEl = document.getElementById("dice");
const diceLandingZoneEl = document.getElementById("diceLandingZone");
const activeBetsListEl = document.getElementById("activeBetsList");
const outcomeLinesEl = document.getElementById("outcomeLines");

// PUCK (OFF/ON) + PUCK ZONES
const puckEl = document.getElementById("puck");

const puckZoneOff = document.getElementById("puckZoneOff");
const puckZone4 = document.getElementById("puckZone4");
const puckZone5 = document.getElementById("puckZone5");
const puckZone6 = document.getElementById("puckZone6");
const puckZone8 = document.getElementById("puckZone8");
const puckZone9 = document.getElementById("puckZone9");
const puckZone10 = document.getElementById("puckZone10");

// Chip buttons (from your updated index.html)
const chipButtons = Array.from(document.querySelectorAll(".chipBtn"));

// Bet buttons
const placePassBtn = document.getElementById("placePassBtn");
const placeDontPassBtn = document.getElementById("placeDontPassBtn");
const addPassOddsBtn = document.getElementById("addPassOddsBtn");
const addDontPassOddsBtn = document.getElementById("addDontPassOddsBtn");
const placeFieldBtn = document.getElementById("placeFieldBtn");

// Table bet zones (clickable areas over the table)
const zonePass = document.getElementById("zonePass");
const zoneDontPass = document.getElementById("zoneDontPass");
const zonePassOdds = document.getElementById("zonePassOdds");
const zoneDontPassOdds = document.getElementById("zoneDontPassOdds");
const zoneField = document.getElementById("zoneField");
const zoneCome = document.getElementById("zoneCome");
const zoneDontCome = document.getElementById("zoneDontCome");
const zoneCome4 = document.getElementById("zoneCome4");
const zoneCome5 = document.getElementById("zoneCome5");
const zoneCome6 = document.getElementById("zoneCome6");
const zoneCome8 = document.getElementById("zoneCome8");
const zoneCome9 = document.getElementById("zoneCome9");
const zoneCome10 = document.getElementById("zoneCome10");
const zoneDontCome4 = document.getElementById("zoneDontCome4");
const zoneDontCome5 = document.getElementById("zoneDontCome5");
const zoneDontCome6 = document.getElementById("zoneDontCome6");
const zoneDontCome8 = document.getElementById("zoneDontCome8");
const zoneDontCome9 = document.getElementById("zoneDontCome9");
const zoneDontCome10 = document.getElementById("zoneDontCome10");
const zoneComeOdds4 = document.getElementById("zoneComeOdds4");
const zoneComeOdds5 = document.getElementById("zoneComeOdds5");
const zoneComeOdds6 = document.getElementById("zoneComeOdds6");
const zoneComeOdds8 = document.getElementById("zoneComeOdds8");
const zoneComeOdds9 = document.getElementById("zoneComeOdds9");
const zoneComeOdds10 = document.getElementById("zoneComeOdds10");
const zoneDontComeOdds4 = document.getElementById("zoneDontComeOdds4");
const zoneDontComeOdds5 = document.getElementById("zoneDontComeOdds5");
const zoneDontComeOdds6 = document.getElementById("zoneDontComeOdds6");
const zoneDontComeOdds8 = document.getElementById("zoneDontComeOdds8");
const zoneDontComeOdds9 = document.getElementById("zoneDontComeOdds9");
const zoneDontComeOdds10 = document.getElementById("zoneDontComeOdds10");



// UI-only: remember last chip image used per bet zone
const zoneLastChipSrc = {
  passLine: null,
  dontPass: null,
  passOdds: null,
  dontPassOdds: null,
  field: null,
  come: null,
  dontCome: null,
  comePoint: null,
  dontComePoint: null
};

// UI-only: current selected chip image src (from chip selector)
let selectedChipImgSrc = null;

// UI-only: when true, hide the $total text on table until the player clicks a bet zone again
let hideZoneTotals = false;



// New buttons (from your updated index.html)
const undoLastBtn = document.getElementById("undoLastBtn");
const clearAllBetsBtn = document.getElementById("clearAllBetsBtn");

// Piggybank elements
const piggybankDisplayEl = document.getElementById("piggybankDisplay");
const piggyImageEl = document.getElementById("piggyImage");
const depositBtn = document.getElementById("depositBtn");
const withdrawBtn = document.getElementById("withdrawBtn");

//win/loss tracker
const netTrackerDisplayEl = document.getElementById("netTrackerDisplay");

// Save controls
const exportSaveBtn = document.getElementById("exportSaveBtn");
const importSaveBtn = document.getElementById("importSaveBtn");
const importFileInput = document.getElementById("importFileInput");

// ---- MOVE PIGGY + SAVE INTO DRAWER ON COMPACT SCREENS ----
const navToggleEl = document.getElementById("navToggle");
const drawerPiggySlotEl = document.getElementById("drawerPiggySlot");
const drawerSaveSlotEl  = document.getElementById("drawerSaveSlot");

const piggySectionEl = document.getElementById("piggySection");
const saveControlsEl = document.getElementById("saveControls");

// "home markers" so we can always put them back where they started
const piggyHomeMarker = document.createComment("piggyHome");
const saveHomeMarker  = document.createComment("saveHome");

const floatingChipsLayerEl = document.getElementById("floatingChipsLayer");
const oddsModalEl = document.getElementById("oddsModal");
const oddsModalTitleEl = document.getElementById("oddsModalTitle");
const oddsModalCloseEl = document.getElementById("oddsModalClose");
const oddsModalRowsEl = document.getElementById("oddsModalRows");
const oddsModalIncrementsEl = document.getElementById("oddsModalIncrements");

const comeTravelZones = {
  4: zoneCome4,
  5: zoneCome5,
  6: zoneCome6,
  8: zoneCome8,
  9: zoneCome9,
  10: zoneCome10
};

const dontComeTravelZones = {
  4: zoneDontCome4,
  5: zoneDontCome5,
  6: zoneDontCome6,
  8: zoneDontCome8,
  9: zoneDontCome9,
  10: zoneDontCome10
};

const comeOddsZones = {
  4: zoneComeOdds4,
  5: zoneComeOdds5,
  6: zoneComeOdds6,
  8: zoneComeOdds8,
  9: zoneComeOdds9,
  10: zoneComeOdds10
};

const dontComeOddsZones = {
  4: zoneDontComeOdds4,
  5: zoneDontComeOdds5,
  6: zoneDontComeOdds6,
  8: zoneDontComeOdds8,
  9: zoneDontComeOdds9,
  10: zoneDontComeOdds10
};

const suppressedZoneChipIds = new Set();

const oddsModalState = {
  open: false,
  type: null, // "come" | "dontCome"
  pointNumber: null,
  selectedInc: { mode: "fixed", cents: dollarsToCents(5) }
};

const travelCycleState = new Map();
const TRAVEL_CYCLE_MS = 3000;
const TRAVEL_FADE_MS = 220;

if (piggySectionEl && piggySectionEl.parentNode) {
  piggySectionEl.parentNode.insertBefore(piggyHomeMarker, piggySectionEl);
}
if (saveControlsEl && saveControlsEl.parentNode) {
  saveControlsEl.parentNode.insertBefore(saveHomeMarker, saveControlsEl);
}

function isCompactLayout() {
  return window.matchMedia("(max-width: 1300px), (max-height: 820px)").matches;
}

function updateDrawerPlacements() {
  if (!drawerPiggySlotEl || !drawerSaveSlotEl || !piggySectionEl || !saveControlsEl) return;

  if (isCompactLayout()) {
    drawerPiggySlotEl.appendChild(piggySectionEl);
    drawerSaveSlotEl.appendChild(saveControlsEl);
  } else {
    // close drawer if you leave compact mode
    if (navToggleEl) navToggleEl.checked = false;

    // restore to original spot
    if (piggyHomeMarker.parentNode) {
      piggyHomeMarker.parentNode.insertBefore(piggySectionEl, piggyHomeMarker.nextSibling);
    }
    if (saveHomeMarker.parentNode) {
      saveHomeMarker.parentNode.insertBefore(saveControlsEl, saveHomeMarker.nextSibling);
    }
  }
}

window.addEventListener("resize", updateDrawerPlacements);
window.addEventListener("orientationchange", updateDrawerPlacements);
updateDrawerPlacements();


// ---- TABLE AUTO-FIT (keeps the whole tableStage on-screen) ----
const tableStageEl = document.getElementById("tableStage");

// These must match your native table/overlay size
const TABLE_W = 2061;
const TABLE_H = 1472;

// Optional padding so it doesn't touch edges
const SAFE_MARGIN = 20;

// We'll store the current scale (useful later for puck math if needed)
let tableScale = 1;

function fitTableToViewport() {
  if (!tableStageEl) return;

  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Only affects 1280×800 and below (and smaller)
  const isCompact = (vw <= 1280) || (vh <= 800);

  // Smaller margin = table can use more of the screen on compact sizes
  const margin = isCompact ? 1 : SAFE_MARGIN;

  // Move table down a bit on compact sizes so it uses space better
  const translateY = isCompact ? -52 : -60;

  const scaleX = (vw - margin * 2) / TABLE_W;
  const scaleY = (vh - margin * 2) / TABLE_H;

  tableScale = Math.min(scaleX, scaleY);
  // slight boost on phone-landscape sizes
if (isCompact) tableScale *= 1.47;

  // Don’t upscale above 1 unless you want that behavior
  tableScale = Math.min(tableScale, 1);

  // Apply transform
  tableStageEl.style.transform = `translate(-50%, ${translateY}%) scale(${tableScale})`;

  // Scale puck + dice to match the table scale (based on their original CSS sizes)
  const DICE_BASE_PX = 76;
  const PUCK_BASE_PX = 59;

  const dicePx = Math.max(1, Math.round(DICE_BASE_PX * tableScale));
  const puckPx = Math.max(1, Math.round(PUCK_BASE_PX * tableScale));

  if (die1El) die1El.style.width = `${dicePx}px`;
  if (die2El) die2El.style.width = `${dicePx}px`;
  if (puckEl) puckEl.style.width = `${puckPx}px`;
}

window.addEventListener("resize", fitTableToViewport);
fitTableToViewport();
window.addEventListener("load", fitTableToViewport);
setTimeout(fitTableToViewport, 0);


/* --------------------
   HELPERS (money in cents)
-------------------- */
function dollarsToCents(dollars) {
  return Math.round(dollars * 100);
}

function centsToDollarsString(cents) {
  const sign = cents < 0 ? "-" : "";
  const abs = Math.abs(cents);
  const d = Math.floor(abs / 100);
  const c = String(abs % 100).padStart(2, "0");
  return `${sign}$${d}.${c}`;
}

function dollarsToDollarsString(dollars) {
  return `$${dollars}`;
}

function renderBankroll() {
  if (!bankrollDisplayEl) return;
  bankrollDisplayEl.textContent = `Bankroll: ${centsToDollarsString(gameState.bankrollCents)}`;
}

function renderPiggybank() {
  if (!piggybankDisplayEl) return;
  piggybankDisplayEl.textContent = `Piggybank: ${centsToDollarsString(gameState.piggybankCents)}`;
}

/* --------------------
   PIGGY UI FX (UI ONLY)
-------------------- */

function triggerClassOnce(el, className, durationMs) {
  if (!el) return;
  el.classList.remove(className); // reset so it can retrigger
  // force a reflow so the browser "notices" the class removal
  void el.offsetWidth;
  el.classList.add(className);
  window.setTimeout(() => {
    el.classList.remove(className);
  }, durationMs);
}

function piggyHop() {
  // matches CSS duration ~260ms (give it a little buffer)
  triggerClassOnce(piggyImageEl, "piggyHop", 320);
}

function piggyShake() {
  // matches CSS duration ~320ms (give it a little buffer)
  triggerClassOnce(piggyImageEl, "piggyShake", 380);
}

function piggyTextGain() {
  // matches CSS duration ~240ms (give it a little buffer)
  triggerClassOnce(piggybankDisplayEl, "piggyGain", 320);
}

function piggyTextLoss() {
  // matches CSS duration ~240ms (give it a little buffer)
  triggerClassOnce(piggybankDisplayEl, "piggyLoss", 320);
}

function renderPhase() {
  if (!phaseDisplayEl) return;
  if (gameState.phase === "comeOut") {
    phaseDisplayEl.textContent = "Phase: Come-Out";
  } else {
    phaseDisplayEl.textContent = `Phase: Point (${gameState.point})`;
  }
}

function renderNetTracker() {
  if (!netTrackerDisplayEl) return;

  const v = gameState.netTrackerCents;

  if (v === 0) {
    netTrackerDisplayEl.textContent = "";
    netTrackerDisplayEl.style.display = "none";
    return;
  }

  netTrackerDisplayEl.style.display = "block";

  if (v > 0) {
    netTrackerDisplayEl.textContent = `Up: ${centsToDollarsString(v)}`;
    netTrackerDisplayEl.style.color = "green";
  } else {
    netTrackerDisplayEl.textContent = `In the hole: ${centsToDollarsString(Math.abs(v))}`;
    netTrackerDisplayEl.style.color = "red";
  }
}

/* --------------------
   STATUS UI (NEW)
   Section 1: Active bets list (only shows active bets)
-------------------- */
function renderActiveBetsList() {
  if (!activeBetsListEl) return;

  let totalAtRisk = 0;
  for (const bet of gameState.bets) {
    if (bet.status !== "active") continue;
    totalAtRisk += bet.amountCents;
  }

  activeBetsListEl.innerHTML = "";
  if (totalAtRisk <= 0) return;

  const row = document.createElement("div");
  row.innerHTML =
    `<span class="betName">At Risk:</span> ` +
    `<span class="amount">${centsToDollarsString(totalAtRisk)}</span>`;
  activeBetsListEl.appendChild(row);
}

/* --------------------
   STATUS UI (NEW)
   Section 2: Outcome lines (show after roll, clear on next roll click)
-------------------- */
function clearOutcomeLines() {
  if (!outcomeLinesEl) return;
  outcomeLinesEl.innerHTML = "";
  // optional: hide the panel if you want later via CSS; for now just clear text
}

function showOutcomeLines(lines) {
  if (!outcomeLinesEl) return;

  outcomeLinesEl.innerHTML = "";
  if (!lines || lines.length === 0) return;

  for (const s of lines) {
    const row = document.createElement("div");
    const lastSpace = s.lastIndexOf(" ");
    const left = (lastSpace >= 0) ? s.slice(0, lastSpace) : s;
    const right = (lastSpace >= 0) ? s.slice(lastSpace + 1) : "";

    const isWin = left.trim().startsWith("Won:");
    const outcomeClass = isWin ? "outcomeWin" : "outcomeLoss";

    row.innerHTML =
      `<span class="${outcomeClass}">` +
        `<span class="betName">${left}</span> ` +
        `<span class="amount">${right}</span>` +
      `</span>`;
    outcomeLinesEl.appendChild(row);
  }
}


function clearTableBetTotalsOnly() {
  const zones = [
    zonePass, zoneDontPass, zonePassOdds, zoneDontPassOdds, zoneField, zoneCome, zoneDontCome,
    zoneCome4, zoneCome5, zoneCome6, zoneCome8, zoneCome9, zoneCome10,
    zoneDontCome4, zoneDontCome5, zoneDontCome6, zoneDontCome8, zoneDontCome9, zoneDontCome10,
    zoneComeOdds4, zoneComeOdds5, zoneComeOdds6, zoneComeOdds8, zoneComeOdds9, zoneComeOdds10,
    zoneDontComeOdds4, zoneDontComeOdds5, zoneDontComeOdds6, zoneDontComeOdds8, zoneDontComeOdds9, zoneDontComeOdds10
  ];

  for (const z of zones) {
    if (!z) continue;
    const total = z.querySelector(".zoneTotal");
    if (total) {
      total.textContent = "";
      total.style.display = "none";
    }
  }
}

function setZoneDisplayForAmount(zoneEl, chipSrc, amt) {
  if (!zoneEl) return;
  const img = zoneEl.querySelector(".zoneChip");
  const total = zoneEl.querySelector(".zoneTotal");

  if (amt <= 0) {
    if (img) { img.removeAttribute("src"); img.style.display = "none"; }
    if (total) { total.textContent = ""; total.style.display = "none"; }
    return;
  }

  if (img && chipSrc && !suppressedZoneChipIds.has(zoneEl.id)) {
    img.setAttribute("src", chipSrc);
    img.style.display = "block";
  } else if (img) {
    img.style.display = "none";
  }

  if (total) {
    if (hideZoneTotals) {
      total.textContent = "";
      total.style.display = "none";
    } else {
      total.textContent = centsToDollarsString(amt);
      total.style.display = "block";
    }
  }
}

function renderTableBetDisplays() {
  // total cents per bet type
  const totals = new Map();
  const comePointTotals = new Map();
  const dontComePointTotals = new Map();
  const comeOddsTotals = new Map();
  const dontComeOddsTotals = new Map();
  const comePointBetsByNum = new Map();
  const dontComePointBetsByNum = new Map();
  const comeOddsByParentId = new Map();
  const dontComeOddsByParentId = new Map();

  for (const bet of gameState.bets) {
    if (bet.status !== "active") continue;
    if (bet.type === "comePoint" && bet.number) {
      comePointTotals.set(bet.number, (comePointTotals.get(bet.number) || 0) + bet.amountCents);
      if (!comePointBetsByNum.has(bet.number)) comePointBetsByNum.set(bet.number, []);
      comePointBetsByNum.get(bet.number).push(bet);
      continue;
    }
    if (bet.type === "dontComePoint" && bet.number) {
      dontComePointTotals.set(bet.number, (dontComePointTotals.get(bet.number) || 0) + bet.amountCents);
      if (!dontComePointBetsByNum.has(bet.number)) dontComePointBetsByNum.set(bet.number, []);
      dontComePointBetsByNum.get(bet.number).push(bet);
      continue;
    }
    if (bet.type === "comeOdds" && bet.number) {
      comeOddsTotals.set(bet.number, (comeOddsTotals.get(bet.number) || 0) + bet.amountCents);
      if (bet.parentBetId) {
        comeOddsByParentId.set(bet.parentBetId, (comeOddsByParentId.get(bet.parentBetId) || 0) + bet.amountCents);
      }
      continue;
    }
    if (bet.type === "dontComeOdds" && bet.number) {
      dontComeOddsTotals.set(bet.number, (dontComeOddsTotals.get(bet.number) || 0) + bet.amountCents);
      if (bet.parentBetId) {
        dontComeOddsByParentId.set(bet.parentBetId, (dontComeOddsByParentId.get(bet.parentBetId) || 0) + bet.amountCents);
      }
      continue;
    }
    totals.set(bet.type, (totals.get(bet.type) || 0) + bet.amountCents);
  }

  // helper to update one zone
  function setZoneDisplay(zoneEl, betTypeKey) {
    if (!zoneEl) return;

    const amt = totals.get(betTypeKey) || 0;
    const img = zoneEl.querySelector(".zoneChip");
    const total = zoneEl.querySelector(".zoneTotal");

    if (amt <= 0) {
      if (img) { img.removeAttribute("src"); img.style.display = "none"; }
      if (total) { total.textContent = ""; total.style.display = "none"; }
      return;
    }

    // chip shown = last chip clicked for this zone (if we have one)
    const chipSrc = zoneLastChipSrc[betTypeKey];
    if (img && chipSrc && !suppressedZoneChipIds.has(zoneEl.id)) {
      img.setAttribute("src", chipSrc);
      img.style.display = "block";
    } else if (img) {
      img.style.display = "none";
    }

    if (total) {
      if (hideZoneTotals) {
        total.textContent = "";
        total.style.display = "none";
      } else {
        total.textContent = centsToDollarsString(amt);
        total.style.display = "block";
      }
    }
  }

  setZoneDisplay(zonePass, "passLine");
  setZoneDisplay(zoneDontPass, "dontPass");
  setZoneDisplay(zonePassOdds, "passOdds");
  setZoneDisplay(zoneDontPassOdds, "dontPassOdds");
  setZoneDisplay(zoneField, "field");
  setZoneDisplay(zoneCome, "come");
  setZoneDisplay(zoneDontCome, "dontCome");

  const numbers = [4, 5, 6, 8, 9, 10];
  for (const n of numbers) {
    const comeBets = (comePointBetsByNum.get(n) || []).sort((a, b) => a.id - b.id);
    const dontComeBets = (dontComePointBetsByNum.get(n) || []).sort((a, b) => a.id - b.id);

    if (comeBets.length > 1) {
      const items = getCycleLabelItems(comeBets, new Map(comeBets.map(b => [b.id, b.amountCents])));
      renderCyclingZone(comeTravelZones[n], items, zoneLastChipSrc.comePoint, comePointTotals.get(n) || 0);
    } else {
      renderCyclingZone(comeTravelZones[n], [], zoneLastChipSrc.comePoint, comePointTotals.get(n) || 0);
    }

    if (dontComeBets.length > 1) {
      const items = getCycleLabelItems(dontComeBets, new Map(dontComeBets.map(b => [b.id, b.amountCents])));
      renderCyclingZone(dontComeTravelZones[n], items, zoneLastChipSrc.dontComePoint, dontComePointTotals.get(n) || 0);
    } else {
      renderCyclingZone(dontComeTravelZones[n], [], zoneLastChipSrc.dontComePoint, dontComePointTotals.get(n) || 0);
    }

    if (comeBets.length > 1) {
      const items = getCycleLabelItems(comeBets, comeOddsByParentId);
      renderCyclingZone(comeOddsZones[n], items, zoneLastChipSrc.comePoint, comeOddsTotals.get(n) || 0);
    } else {
      renderCyclingZone(comeOddsZones[n], [], zoneLastChipSrc.comePoint, comeOddsTotals.get(n) || 0);
    }

    if (dontComeBets.length > 1) {
      const items = getCycleLabelItems(dontComeBets, dontComeOddsByParentId);
      renderCyclingZone(dontComeOddsZones[n], items, zoneLastChipSrc.dontComePoint, dontComeOddsTotals.get(n) || 0);
    } else {
      renderCyclingZone(dontComeOddsZones[n], [], zoneLastChipSrc.dontComePoint, dontComeOddsTotals.get(n) || 0);
    }
  }
}


/* --------------------
   PUCK (UI ONLY)
-------------------- */

// Map point number -> puck zone element
function getPuckZoneForPoint(point) {
  switch (point) {
    case 4: return puckZone4;
    case 5: return puckZone5;
    case 6: return puckZone6;
    case 8: return puckZone8;
    case 9: return puckZone9;
    case 10: return puckZone10;
    default: return null;
  }
}

// Center of an element in PAGE coordinates (px)
function getElementCenterPx(el) {
  const r = el.getBoundingClientRect();
  return {
    x: Math.round(r.left + r.width / 2),
    y: Math.round(r.top + r.height / 2)
  };
}

// Move puck to a zone center, then swap ON/OFF image at the end (Option 1)
function movePuckToZone(zoneEl, shouldBeOn) {
  if (!puckEl || !zoneEl) return;

  // Screen-based positioning (same idea as dice)
  puckEl.style.position = "fixed";
  puckEl.style.left = "0px";
  puckEl.style.top = "0px";
  puckEl.style.transform = "translate(-50%, -50%)";
  puckEl.style.zIndex = "5";
  puckEl.style.pointerEvents = "none";

  // Slide settings
  puckEl.style.transition = `left ${PUCK_MOVE_MS}ms ease-out, top ${PUCK_MOVE_MS}ms ease-out`;

  // Get center of target zone in SCREEN coordinates
  const target = getElementCenterPx(zoneEl);

  // Move puck using SCREEN coordinates (NO tableStage subtraction)
  puckEl.style.left = `${target.x}px`;
  puckEl.style.top = `${target.y}px`;

  // After travel finishes, do a quick swap effect (fade)
  const finalSrc = shouldBeOn ? PUCK_ON_SRC : PUCK_OFF_SRC;

  // If it's already the correct image, skip swap animation
  if (puckEl.getAttribute("src") === finalSrc) return;

  // Swap after the move completes
  window.setTimeout(() => {
    puckEl.style.transition = `opacity ${PUCK_SWAP_MS}ms ease-out`;
    puckEl.style.opacity = "0.25";

    window.setTimeout(() => {
      puckEl.setAttribute("src", finalSrc);
      puckEl.style.opacity = "1";
      // restore slide transition for next time
      puckEl.style.transition = `left ${PUCK_MOVE_MS}ms ease-out, top ${PUCK_MOVE_MS}ms ease-out`;
    }, PUCK_SWAP_MS);
  }, PUCK_MOVE_MS);
}

// Decide where puck should be based on current game state
function updatePuckFromGameState() {
  if (!puckEl) return;

  // Come-out = OFF
  if (gameState.phase === "comeOut" || !gameState.point) {
    if (puckZoneOff) movePuckToZone(puckZoneOff, false);
    return;
  }

  // Point phase = move to that number and show ON after landing
  const z = getPuckZoneForPoint(gameState.point);
  if (z) movePuckToZone(z, true);
}



/* --------------------
   GAME STATE
-------------------- */
const gameState = {
  lastRoll: null,
  lastOutcome: null,

  phase: "comeOut",
  point: null,

  bankrollCents: dollarsToCents(START_BANKROLL_DOLLARS),
  piggybankCents: 0,

  netTrackerCents: 0, // + means Up, - means In the hole
  _currentRollNetCents: 0,
  _soundsThisRoll: null,
  _rollSoundFlags: null,
  _rollWinCents: 0,
  _rollLoseCents: 0,

  bets: [],

  lastOutcomeLines: [],      // UI-only: the lines shown in the outcome panel
_currentOutcomeLines: null, // UI-only: per-roll scratchpad


  // Undo stack: only "extras" chip actions are recorded here.
  // Each entry undoes exactly one chip placement (or one increment).
  // { betType: "field"|"passOdds"|"dontPassOdds", amountCents: number }
  undoStack: []
};

const UNDOABLE_EXTRA_TYPES = new Set(["field", "passOdds", "dontPassOdds", "come", "dontCome", "comeOdds", "dontComeOdds"]);

/* --------------------
   DICE ANIMATION (UI ONLY)
-------------------- */

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getRandomFaceSrc() {
  const n = randInt(1, 6);
  return diceFaces[n - 1];
}

function pickStartAndEndPoints(zoneRect, diceRect) {
  // diceRect is the #dice container (both dice together)
  const halfW = diceRect.width / 2;
  const halfH = diceRect.height / 2;

  // End point must be fully inside the zone with padding
  const minX = zoneRect.left + DICE_INNER_PADDING_PX + halfW;
  const maxX = zoneRect.right - DICE_INNER_PADDING_PX - halfW;
  const minY = zoneRect.top + DICE_INNER_PADDING_PX + halfH;
  const maxY = zoneRect.bottom - DICE_INNER_PADDING_PX - halfH;

  const endX = randInt(Math.round(minX), Math.round(maxX));
  const endY = randInt(Math.round(minY), Math.round(maxY));

  // Start point comes from a random edge, slightly outside the zone
  const edge = randInt(1, 4); // 1=top 2=right 3=bottom 4=left
  let startX = endX;
  let startY = endY;

  if (edge === 1) { // top
    startX = randInt(Math.round(zoneRect.left), Math.round(zoneRect.right));
    startY = Math.round(zoneRect.top - DICE_EDGE_OFFSET_PX);
  } else if (edge === 2) { // right
    startX = Math.round(zoneRect.right + DICE_EDGE_OFFSET_PX);
    startY = randInt(Math.round(zoneRect.top), Math.round(zoneRect.bottom));
  } else if (edge === 3) { // bottom
    startX = randInt(Math.round(zoneRect.left), Math.round(zoneRect.right));
    startY = Math.round(zoneRect.bottom + DICE_EDGE_OFFSET_PX);
  } else { // left
    startX = Math.round(zoneRect.left - DICE_EDGE_OFFSET_PX);
    startY = randInt(Math.round(zoneRect.top), Math.round(zoneRect.bottom));
  }

  return { startX, startY, endX, endY };
}

function setDicePositionAndRotation(centerX, centerY, rotDeg) {
  if (!diceEl) return;
  diceEl.style.left = `${centerX}px`;
  diceEl.style.top = `${centerY}px`;
  diceEl.style.transform = `translate(-50%, -50%) rotate(${rotDeg}deg)`;
}

function playDiceAnimation(finalDie1, finalDie2) {
  // Safety checks
  if (!die1El || !die2El || !diceLandingZoneEl) {
    if (die1El) die1El.src = diceFaces[finalDie1 - 1];
    if (die2El) die2El.src = diceFaces[finalDie2 - 1];
    return Promise.resolve();
  }

  const zoneRect = diceLandingZoneEl.getBoundingClientRect();

  // Ensure dice are positioned in viewport coordinates (no "rod" container motion)
  if (diceEl) {
    diceEl.style.position = "fixed";
    diceEl.style.left = "0px";
    diceEl.style.top = "0px";
    diceEl.style.transform = "none";
    diceEl.style.width = "0";
    diceEl.style.height = "0";
    diceEl.style.pointerEvents = "none";
  }

  // Make each die independently animatable
  for (const d of [die1El, die2El]) {
    d.style.position = "fixed";
    d.style.transform = "translate(-50%, -50%) rotate(0deg)";
    d.style.left = "0px";
    d.style.top = "0px";
    d.style.willChange = "left, top, transform";
  }

  // Measure each die (if not loaded yet, fall back to a reasonable size)
  const r1 = die1El.getBoundingClientRect();
  const r2 = die2El.getBoundingClientRect();
  const dieW = Math.max(r1.width || 96, r2.width || 96);
  const dieH = Math.max(r1.height || 96, r2.height || 96);

  const halfW = dieW / 2;
  const halfH = dieH / 2;

  // Pick ONE shared entry edge, so they come from same direction
  const edge = randInt(1, 4); // 1=top 2=right 3=bottom 4=left

  // End points must be inside zone with padding
  const minX = zoneRect.left + DICE_INNER_PADDING_PX + halfW;
  const maxX = zoneRect.right - DICE_INNER_PADDING_PX - halfW;
  const minY = zoneRect.top + DICE_INNER_PADDING_PX + halfH;
  const maxY = zoneRect.bottom - DICE_INNER_PADDING_PX - halfH;

  // Helper: random end point inside zone
  function pickEnd() {
    return {
      x: randInt(Math.round(minX), Math.round(maxX)),
      y: randInt(Math.round(minY), Math.round(maxY))
    };
  }

  // Pick two end points that are not too close (prevents overlap)
  const MIN_SEPARATION = Math.round(Math.max(70, dieW * 0.9)); // DIAL if needed
  let end1 = pickEnd();
  let end2 = pickEnd();
  let tries = 0;
  while (tries < 30) {
    const dx = end1.x - end2.x;
    const dy = end1.y - end2.y;
    if (Math.hypot(dx, dy) >= MIN_SEPARATION) break;
    end2 = pickEnd();
    tries++;
  }

// Shared start point: both dice enter from the same exact location
let startX, startY;

if (edge === 1) { // top
  startX = randInt(Math.round(zoneRect.left), Math.round(zoneRect.right));
  startY = Math.round(zoneRect.top - DICE_EDGE_OFFSET_PX);
} else if (edge === 2) { // right
  startX = Math.round(zoneRect.right + DICE_EDGE_OFFSET_PX);
  startY = randInt(Math.round(zoneRect.top), Math.round(zoneRect.bottom));
} else if (edge === 3) { // bottom
  startX = randInt(Math.round(zoneRect.left), Math.round(zoneRect.right));
  startY = Math.round(zoneRect.bottom + DICE_EDGE_OFFSET_PX);
} else { // left
  startX = Math.round(zoneRect.left - DICE_EDGE_OFFSET_PX);
  startY = randInt(Math.round(zoneRect.top), Math.round(zoneRect.bottom));
}

  // Rotations: independent spins so they feel unlinked
  const spin1 = randInt(720, 1440);
  const spin2 = randInt(720, 1440);

  // Random stop times per die (ms)
  const MIN_ROLL_TIME_MS = Math.round(DICE_ANIM_DURATION_MS * 0.55);
  const die1StopTime = randInt(MIN_ROLL_TIME_MS, DICE_ANIM_DURATION_MS);
  const die2StopTime = randInt(MIN_ROLL_TIME_MS, DICE_ANIM_DURATION_MS);

    // Stop roll sound when the LAST die stops (not when the travel animation ends)
  const lastDieStopTime = Math.max(die1StopTime, die2StopTime);
  window.setTimeout(() => {
    stopRollSound();
  }, lastDieStopTime);

  // 1) Jump to start instantly (no transition)
  die1El.style.transition = "none";
  die2El.style.transition = "none";

  die1El.style.left = `${startX}px`;
  die1El.style.top = `${startY}px`;
  die1El.style.transform = `translate(-50%, -50%) rotate(0deg)`;

  die2El.style.left = `${startX}px`;
  die2El.style.top = `${startY}px`;
  die2El.style.transform = `translate(-50%, -50%) rotate(0deg)`;

  // Force layout so the next change transitions
  void die1El.offsetWidth;

  // 2) Start face cycling (face <-> midroll frame)
  let die1Rolling = true;
  let die2Rolling = true;

  const startTime = performance.now();

  let useAltMid = false;

  const intervalId = setInterval(() => {
    const elapsed = performance.now() - startTime;

    if (die1Rolling) {
      if (elapsed >= die1StopTime) {
        die1Rolling = false;
        die1El.src = diceFaces[finalDie1 - 1];
        } else {
          // Midroll only during animation
          useAltMid = !useAltMid;
          die1El.src = useAltMid ? MIDROLL_FRAME_SRC_2 : MIDROLL_FRAME_SRC;
        }
    }

    if (die2Rolling) {
      if (elapsed >= die2StopTime) {
        die2Rolling = false;
        die2El.src = diceFaces[finalDie2 - 1];
        } else {
          // Midroll only during animation
          die2El.src = useAltMid ? MIDROLL_FRAME_SRC_2 : MIDROLL_FRAME_SRC;
        }
    }

    if (!die1Rolling && !die2Rolling) {
      clearInterval(intervalId);
    }
  }, DICE_FACE_SWAP_MS);

  // 3) Animate each die to its own end point
  const t = `${DICE_ANIM_DURATION_MS}ms ease-out`;
  die1El.style.transition = `left ${t}, top ${t}, transform ${t}`;
  die2El.style.transition = `left ${t}, top ${t}, transform ${t}`;

  die1El.style.left = `${end1.x}px`;
  die1El.style.top = `${end1.y}px`;
  die1El.style.transform = `translate(-50%, -50%) rotate(${spin1}deg)`;

  die2El.style.left = `${end2.x}px`;
  die2El.style.top = `${end2.y}px`;
  die2El.style.transform = `translate(-50%, -50%) rotate(${spin2}deg)`;

  // 4) End: stop cycling, snap to true result
  return new Promise((resolve) => {
    setTimeout(() => {
      clearInterval(intervalId);

      // FINAL AUTHORITATIVE SNAP (prevents midroll frame locking in)
      die1El.src = diceFaces[finalDie1 - 1];
      die2El.src = diceFaces[finalDie2 - 1];

      die1El.style.willChange = "auto";
      die2El.style.willChange = "auto";
      resolve();
    }, DICE_ANIM_DURATION_MS);
  });
}

/* --------------------
   CORE DICE + PHASE
-------------------- */
function rollOneDie() {
  return Math.floor(Math.random() * 6) + 1;
}

let nextBetId = 1;
function getNextBetId() {
  return nextBetId++;
}

function isPointNumber(total) {
  return total === 4 || total === 5 || total === 6 ||
         total === 8 || total === 9 || total === 10;
}

function getZoneChipRect(zoneEl) {
  if (!zoneEl) return null;
  const chip = zoneEl.querySelector(".zoneChip");
  if (chip) {
    const r = chip.getBoundingClientRect();
    if (r.width >= 4 && r.height >= 4) {
      return { x: r.left, y: r.top, width: r.width, height: r.height };
    }
  }

  const zr = zoneEl.getBoundingClientRect();
  if (!zr) return null;
  const size = Math.min(zr.width, zr.height, 64);
  const x = zr.left + (zr.width - size) / 2;
  const y = zr.top + (zr.height - size) / 2;
  return { x, y, width: size, height: size };
}

function animateChipTravel({ srcZone, destZone, chipSrc, durationMs = 450 }) {
  if (!floatingChipsLayerEl || !srcZone || !destZone || !chipSrc) return;

  const from = getZoneChipRect(srcZone);
  const to = getZoneChipRect(destZone);
  if (!from || !to) return;

  suppressedZoneChipIds.add(destZone.id);
  renderTableBetDisplays();

  const chip = document.createElement("img");
  chip.className = "floatingChip";
  chip.src = chipSrc;
  chip.style.left = `${from.x}px`;
  chip.style.top = `${from.y}px`;
  chip.style.width = `${from.width}px`;
  chip.style.height = `${from.height}px`;
  chip.style.transition = `left ${durationMs}ms ease-out, top ${durationMs}ms ease-out, width ${durationMs}ms ease-out, height ${durationMs}ms ease-out`;

  floatingChipsLayerEl.appendChild(chip);

  requestAnimationFrame(() => {
    chip.style.left = `${to.x}px`;
    chip.style.top = `${to.y}px`;
    chip.style.width = `${to.width}px`;
    chip.style.height = `${to.height}px`;
  });

  window.setTimeout(() => {
    chip.remove();
    suppressedZoneChipIds.delete(destZone.id);
    renderTableBetDisplays();
  }, durationMs);
}

function getCycleLabelItems(bets, amountsByParentId) {
  const baseLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const items = [];
  for (let i = 0; i < bets.length; i++) {
    const bet = bets[i];
    const letter = baseLetters[i] || `#${i + 1}`;
    const amt = amountsByParentId.get(bet.id) || 0;
    items.push(`Bet ${letter} ${centsToDollarsString(amt)}`);
  }
  return items;
}

function renderCyclingZone(zoneEl, items, chipSrc, totalFallbackCents) {
  if (!zoneEl) return;

  if (!items || items.length <= 1) {
    travelCycleState.delete(zoneEl.id);
    zoneEl.classList.remove("travelCycle");
    if (typeof totalFallbackCents === "number") {
      setZoneDisplayForAmount(zoneEl, chipSrc, totalFallbackCents);
    }
    return;
  }

  zoneEl.classList.add("travelCycle");
  if (!travelCycleState.has(zoneEl.id)) {
    travelCycleState.set(zoneEl.id, { index: 0, lastSwitch: performance.now(), items });
  } else {
    travelCycleState.get(zoneEl.id).items = items;
  }

  const state = travelCycleState.get(zoneEl.id);
  const img = zoneEl.querySelector(".zoneChip");
  const total = zoneEl.querySelector(".zoneTotal");

  if (img && chipSrc && !suppressedZoneChipIds.has(zoneEl.id)) {
    img.setAttribute("src", chipSrc);
    img.style.display = "block";
  } else if (img) {
    img.style.display = "none";
  }

  if (total) {
    if (hideZoneTotals) {
      total.textContent = "";
      total.style.display = "none";
    } else {
      total.textContent = state.items[state.index] || "";
      total.style.display = "block";
    }
  }
}

function startTravelCycler() {
  setInterval(() => {
    if (travelCycleState.size === 0) return;
    const now = performance.now();
    for (const [zoneId, state] of travelCycleState.entries()) {
      if (now - state.lastSwitch < TRAVEL_CYCLE_MS) continue;
      state.lastSwitch = now;
      state.index = (state.index + 1) % state.items.length;

      const zoneEl = document.getElementById(zoneId);
      if (!zoneEl) continue;
      const total = zoneEl.querySelector(".zoneTotal");
      if (!total || hideZoneTotals) continue;

      total.classList.add("cycleFade");
      window.setTimeout(() => {
        total.textContent = state.items[state.index] || "";
        total.classList.remove("cycleFade");
      }, TRAVEL_FADE_MS);
    }
  }, 120);
}

function openOddsModal(titleText) {
  if (!oddsModalEl) return;
  if (oddsModalTitleEl) oddsModalTitleEl.textContent = titleText || "Bet Info";
  if (oddsModalRowsEl) oddsModalRowsEl.innerHTML = "";
  oddsModalEl.classList.remove("hidden");
  oddsModalEl.setAttribute("aria-hidden", "false");
  oddsModalState.open = true;
}

function closeOddsModal() {
  if (!oddsModalEl) return;
  oddsModalEl.classList.add("hidden");
  oddsModalEl.setAttribute("aria-hidden", "true");
  oddsModalState.open = false;
}

function renderOddsModalRows({ labelPrefix, bets, oddsByParentId }) {
  if (!oddsModalRowsEl) return;
  oddsModalRowsEl.innerHTML = "";

  const sorted = [...bets].sort((a, b) => a.id - b.id);
  const baseLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

  for (let i = 0; i < sorted.length; i++) {
    const bet = sorted[i];
    const letter = baseLetters[i] || `#${i + 1}`;
    const oddsCents = oddsByParentId.get(bet.id) || 0;

    const row = document.createElement("div");
    row.className = "oddsRow";
    row.innerHTML =
      `<span class="oddsRowLabel">${labelPrefix} ${letter}:</span> ` +
      `<span class="oddsRowAmounts">` +
        `<span class="oddsBase">${centsToDollarsString(bet.amountCents)} Base</span>` +
        ` / ` +
        `<span class="oddsOdds">${centsToDollarsString(oddsCents)} Odds</span>` +
      `</span> ` +
      `<span class="oddsRowButtons">` +
        `<button class="oddsPlus" data-bet-id="${bet.id}">+</button>` +
        `<button class="oddsMinus" data-bet-id="${bet.id}">-</button>` +
      `</span>`;

    oddsModalRowsEl.appendChild(row);
  }
}

function openOddsSelectionModal({ type, pointNumber }) {
  const isCome = type === "come";
  const title = `${isCome ? "Come" : "Don't Come"} ${pointNumber}`;
  const bets = isCome
    ? getComePointBetsForNumber(pointNumber)
    : getDontComePointBetsForNumber(pointNumber);

  const oddsByParentId = new Map();
  for (const b of gameState.bets) {
    if (b.status !== "active") continue;
    if (isCome && b.type === "comeOdds" && b.parentBetId) {
      oddsByParentId.set(b.parentBetId, (oddsByParentId.get(b.parentBetId) || 0) + b.amountCents);
    }
    if (!isCome && b.type === "dontComeOdds" && b.parentBetId) {
      oddsByParentId.set(b.parentBetId, (oddsByParentId.get(b.parentBetId) || 0) + b.amountCents);
    }
  }

  openOddsModal(title);
  const nextType = isCome ? "come" : "dontCome";
  const sameContext = oddsModalState.open &&
    oddsModalState.type === nextType &&
    oddsModalState.pointNumber === pointNumber;

  oddsModalState.type = nextType;
  oddsModalState.pointNumber = pointNumber;

  if (!sameContext) {
    oddsModalState.selectedInc = { mode: "fixed", cents: dollarsToCents(5) };
  }

  if (oddsModalIncrementsEl) {
    const btns = oddsModalIncrementsEl.querySelectorAll(".incBtn");
    btns.forEach(b => {
      const raw = b.dataset.inc;
      let selected = false;
      if (oddsModalState.selectedInc.mode === "ALL") {
        selected = raw === "ALL";
      } else {
        const dollars = Number(raw);
        if (Number.isFinite(dollars)) {
          selected = oddsModalState.selectedInc.cents === dollarsToCents(dollars);
        }
      }
      b.classList.toggle("selected", selected);
    });
  }
  renderOddsModalRows({
    labelPrefix: "Bet",
    bets,
    oddsByParentId
  });
}

function updateGamePhaseFromTotal(total) {
  if (gameState.phase === "comeOut") {
    if (isPointNumber(total)) {
      gameState.phase = "point";
      gameState.point = total;
    }
    return;
  }

  if (total === gameState.point || total === 7) {
    gameState.phase = "comeOut";
    gameState.point = null;
  }
}

function resolveOutcome(total, prevPhase, prevPoint) {
  const outcome = {
    total,
    passLine: "none",       // "win" | "lose" | "none"
    dontPassLine: "none",   // "win" | "lose" | "push" | "none"
    pointAction: "none"     // "set" | "clear" | "none"
  };

  if (prevPhase === "comeOut") {
    if (total === 7 || total === 11) {
      outcome.passLine = "win";
      outcome.dontPassLine = "lose";
      return outcome;
    }

    if (total === 2 || total === 3) {
      outcome.passLine = "lose";
      outcome.dontPassLine = "win";
      return outcome;
    }

    if (total === 12) {
      outcome.passLine = "lose";
      outcome.dontPassLine = "push";
      return outcome;
    }

    outcome.pointAction = "set";
    return outcome;
  }

  if (total === prevPoint) {
    outcome.passLine = "win";
    outcome.dontPassLine = "lose";
    outcome.pointAction = "clear";
    return outcome;
  }

  if (total === 7) {
    outcome.passLine = "lose";
    outcome.dontPassLine = "win";
    outcome.pointAction = "clear";
    return outcome;
  }

  return outcome;
}

/* --------------------
   BANKROLL + SETTLEMENT
-------------------- */
function canAfford(amountCents) {
  return amountCents > 0 && gameState.bankrollCents >= amountCents;
}

function getSelectedChipCents() {
  // If ALL is selected, we use whatever bankroll is available right now.
  // If bankroll is 0, this returns 0 (and buttons should be disabled).
  if (selectedChipValue === "ALL") return gameState.bankrollCents;

  // Otherwise it's a normal numeric chip
  return dollarsToCents(selectedChipValue);
}


// Record exactly one undo action (extras only)
function recordUndoIfExtra(betType, amountCents) {
  if (!UNDOABLE_EXTRA_TYPES.has(betType)) return;
  gameState.undoStack.push({ betType, amountCents });
}

function placeBet(bet, { recordUndo = false } = {}) {
  // Never allow $0 or negative bets
  if (bet.amountCents <= 0) {
    console.log(`CANNOT PLACE ${bet.type.toUpperCase()}: amount must be > $0.00`);
    return false;
  }

  // Never allow placing a bet you can't afford
  if (!canAfford(bet.amountCents)) {
    console.log(
      `CANNOT PLACE ${bet.type.toUpperCase()}: not enough bankroll (${centsToDollarsString(bet.amountCents)})`
    );
    return false;
  }

  gameState.bankrollCents -= bet.amountCents;
  bet.status = "active";
  gameState.bets.push(bet);

  if (recordUndo) recordUndoIfExtra(bet.type, bet.amountCents);

  console.log(`PLACED ${bet.type.toUpperCase()} for ${centsToDollarsString(bet.amountCents)}`);
  renderBankroll();
  refreshUIState();
  return true;
}

function settleBet(bet, result, profitCents) {
  // Tracker B: only reflects resolved outcomes
  // win  -> +profit
  // lose -> -bet amount
  // push -> 0
  let netForTracker = 0;

  if (result === "win") {
    gameState.bankrollCents += bet.amountCents + profitCents;
    netForTracker = profitCents;
    console.log(`${bet.type.toUpperCase()} SETTLED: WIN | profit=${centsToDollarsString(profitCents)}`);
    if (gameState._rollSoundFlags) gameState._rollSoundFlags.win = true;
    if (typeof gameState._rollWinCents === "number") gameState._rollWinCents += profitCents;
  } else if (result === "push") {
    gameState.bankrollCents += bet.amountCents;
    netForTracker = 0;
    console.log(`${bet.type.toUpperCase()} SETTLED: PUSH | profit=$0.00`);
  } else {
    netForTracker = -bet.amountCents;
    console.log(`${bet.type.toUpperCase()} SETTLED: LOSE | profit=$0.00`);
    if (gameState._rollSoundFlags) gameState._rollSoundFlags.lose = true;
    if (typeof gameState._rollLoseCents === "number") gameState._rollLoseCents += bet.amountCents;
  }


    // Per-roll net (for the simplified "Win/Loss per roll" status line)
  if (typeof gameState._currentRollNetCents === "number") {
    gameState._currentRollNetCents += netForTracker;
  }
  gameState.netTrackerCents += netForTracker;

  renderBankroll();
  renderNetTracker();
  refreshUIState();
}

/* --------------------
   PAYOUT MATH
-------------------- */
function passOddsProfit(amountCents, point) {
  if (point === 4 || point === 10) return amountCents * 2;
  if (point === 5 || point === 9)  return Math.round(amountCents * 3 / 2);
  if (point === 6 || point === 8)  return Math.round(amountCents * 6 / 5);
  return 0;
}

function dontPassOddsProfit(amountCents, point) {
  if (point === 4 || point === 10) return Math.round(amountCents / 2);
  if (point === 5 || point === 9)  return Math.round(amountCents * 2 / 3);
  if (point === 6 || point === 8)  return Math.round(amountCents * 5 / 6);
  return 0;
}

function comeOddsProfit(amountCents, point) {
  if (point === 4 || point === 10) return amountCents * 2;
  if (point === 5 || point === 9)  return Math.round(amountCents * 3 / 2);
  if (point === 6 || point === 8)  return Math.round(amountCents * 6 / 5);
  return 0;
}

function dontComeOddsProfit(amountCents, point) {
  if (point === 4 || point === 10) return Math.round(amountCents / 2);
  if (point === 5 || point === 9)  return Math.round(amountCents * 2 / 3);
  if (point === 6 || point === 8)  return Math.round(amountCents * 5 / 6);
  return 0;
}

function fieldProfit(amountCents, total) {
  if (total === 2 || total === 12) return amountCents * 2;
  return amountCents;
}

function isFieldWin(total) {
  return total === 2 || total === 3 || total === 4 ||
         total === 9 || total === 10 || total === 11 || total === 12;
}

/* --------------------
   BET OBJECTS
-------------------- */
function createFieldBet(amountCents) {
  return {
    id: getNextBetId(),
    parentBetId: null,
    type: "field",
    status: "inactive",
    state: "active",
    number: null,
    amountCents,

    resolve(outcome) {
      if (this.status !== "active") return false;

      const total = outcome.total;
      if (isFieldWin(total)) {
        settleBet(this, "win", fieldProfit(this.amountCents, total));
      } else {
        settleBet(this, "lose", 0);
      }

      return true; // field resolves every roll
    }
  };
}

function createPassOddsBet(amountCents, pointNumber, parentBetId) {
  return {
    id: getNextBetId(),
    parentBetId: parentBetId ?? null,
    type: "passOdds",
    status: "inactive",
    state: "active",
    number: pointNumber,
    amountCents,
    pointNumber,

    resolve(outcome) {
      if (this.status !== "active") return false;
      if (outcome.pointAction !== "clear") return false;

      if (outcome.passLine === "win") {
        settleBet(this, "win", passOddsProfit(this.amountCents, this.pointNumber));
        return true;
      }

      if (outcome.passLine === "lose") {
        settleBet(this, "lose", 0);
        return true;
      }

      return false;
    }
  };
}

function createDontPassOddsBet(amountCents, pointNumber, parentBetId) {
  return {
    id: getNextBetId(),
    parentBetId: parentBetId ?? null,
    type: "dontPassOdds",
    status: "inactive",
    state: "active",
    number: pointNumber,
    amountCents,
    pointNumber,

    resolve(outcome) {
      if (this.status !== "active") return false;
      if (outcome.pointAction !== "clear") return false;

      if (outcome.dontPassLine === "win") {
        settleBet(this, "win", dontPassOddsProfit(this.amountCents, this.pointNumber));
        return true;
      }

      if (outcome.dontPassLine === "lose") {
        settleBet(this, "lose", 0);
        return true;
      }

      return false;
    }
  };
}

function createPassLineBet(amountCents) {
  return {
    id: getNextBetId(),
    parentBetId: null,
    type: "passLine",
    status: "inactive",
    state: "active",
    number: null,
    amountCents,
    odds: null,

    resolve(outcome) {
      if (this.status !== "active") return false;

      if (outcome.passLine === "win") {
        settleBet(this, "win", this.amountCents);
        return true;
      }

      if (outcome.passLine === "lose") {
        settleBet(this, "lose", 0);
        return true;
      }

      return false;
    }
  };
}

function createDontPassBet(amountCents) {
  return {
    id: getNextBetId(),
    parentBetId: null,
    type: "dontPass",
    status: "inactive",
    state: "active",
    number: null,
    amountCents,
    odds: null,

    resolve(outcome) {
      if (this.status !== "active") return false;

      if (outcome.dontPassLine === "win") {
        settleBet(this, "win", this.amountCents);
        return true;
      }

      if (outcome.dontPassLine === "lose") {
        settleBet(this, "lose", 0);
        return true;
      }

      if (outcome.dontPassLine === "push") {
        settleBet(this, "push", 0);
        return true;
      }

      return false;
    }
  };
}

function createComeOddsBet(amountCents, pointNumber, parentBetId) {
  return {
    id: getNextBetId(),
    parentBetId: parentBetId ?? null,
    type: "comeOdds",
    status: "inactive",
    state: "active",
    number: pointNumber,
    amountCents,
    pointNumber,

    resolve(outcome) {
      if (this.status !== "active") return false;
      const total = outcome.total;

      if (total === this.pointNumber) {
        settleBet(this, "win", comeOddsProfit(this.amountCents, this.pointNumber));
        return true;
      }

      if (total === 7) {
        settleBet(this, "lose", 0);
        return true;
      }

      return false;
    }
  };
}

function createDontComeOddsBet(amountCents, pointNumber, parentBetId) {
  return {
    id: getNextBetId(),
    parentBetId: parentBetId ?? null,
    type: "dontComeOdds",
    status: "inactive",
    state: "active",
    number: pointNumber,
    amountCents,
    pointNumber,

    resolve(outcome) {
      if (this.status !== "active") return false;
      const total = outcome.total;

      if (total === 7) {
        settleBet(this, "win", dontComeOddsProfit(this.amountCents, this.pointNumber));
        return true;
      }

      if (total === this.pointNumber) {
        settleBet(this, "lose", 0);
        return true;
      }

      return false;
    }
  };
}

function createComePointBet(amountCents, pointNumber, parentBetId) {
  return {
    id: getNextBetId(),
    parentBetId: parentBetId ?? null,
    type: "comePoint",
    status: "active",
    state: "active",
    number: pointNumber,
    amountCents,

    resolve(outcome) {
      if (this.status !== "active") return false;
      const total = outcome.total;

      if (total === this.number) {
        console.log(`COME POINT HIT: id=${this.id} number=${this.number}`);
        settleBet(this, "win", this.amountCents);
        return true;
      }

      if (total === 7) {
        console.log(`COME POINT SEVEN-OUT: id=${this.id} number=${this.number}`);
        settleBet(this, "lose", 0);
        return true;
      }

      return false;
    }
  };
}

function createDontComePointBet(amountCents, pointNumber, parentBetId) {
  return {
    id: getNextBetId(),
    parentBetId: parentBetId ?? null,
    type: "dontComePoint",
    status: "active",
    state: "active",
    number: pointNumber,
    amountCents,

    resolve(outcome) {
      if (this.status !== "active") return false;
      const total = outcome.total;

      if (total === 7) {
        console.log(`DON'T COME POINT SEVEN-OUT: id=${this.id} number=${this.number}`);
        settleBet(this, "win", this.amountCents);
        return true;
      }

      if (total === this.number) {
        console.log(`DON'T COME POINT HIT: id=${this.id} number=${this.number}`);
        settleBet(this, "lose", 0);
        return true;
      }

      return false;
    }
  };
}

function createComeBet(amountCents) {
  return {
    id: getNextBetId(),
    parentBetId: null,
    type: "come",
    status: "inactive",
    state: "pending",
    number: null,
    amountCents,

    resolve(outcome) {
      if (this.status !== "active") return false;
      const total = outcome.total;

      if (total === 7 || total === 11) {
        console.log(`COME RESOLVE: id=${this.id} immediate WIN on ${total}`);
        settleBet(this, "win", this.amountCents);
        return true;
      }

      if (total === 2 || total === 3 || total === 12) {
        console.log(`COME RESOLVE: id=${this.id} immediate LOSE on ${total}`);
        settleBet(this, "lose", 0);
        return true;
      }

      if (isPointNumber(total)) {
        const traveled = createComePointBet(this.amountCents, total, this.id);
        gameState.bets.push(traveled);
        const chipSrc = zoneLastChipSrc.come || selectedChipImgSrc;
        if (chipSrc) zoneLastChipSrc.comePoint = chipSrc;
        animateChipTravel({
          srcZone: zoneCome,
          destZone: comeTravelZones[total],
          chipSrc
        });
        console.log(`COME TRAVELS: id=${this.id} -> number=${total} (new id=${traveled.id})`);
        return true;
      }

      return false;
    }
  };
}

function createDontComeBet(amountCents) {
  return {
    id: getNextBetId(),
    parentBetId: null,
    type: "dontCome",
    status: "inactive",
    state: "pending",
    number: null,
    amountCents,

    resolve(outcome) {
      if (this.status !== "active") return false;
      const total = outcome.total;

      if (total === 2 || total === 3) {
        console.log(`DON'T COME RESOLVE: id=${this.id} immediate WIN on ${total}`);
        settleBet(this, "win", this.amountCents);
        return true;
      }

      if (total === 7 || total === 11) {
        console.log(`DON'T COME RESOLVE: id=${this.id} immediate LOSE on ${total}`);
        settleBet(this, "lose", 0);
        return true;
      }

      if (total === 12) {
        console.log(`DON'T COME RESOLVE: id=${this.id} PUSH on ${total}`);
        settleBet(this, "push", 0);
        return true;
      }

      if (isPointNumber(total)) {
        const traveled = createDontComePointBet(this.amountCents, total, this.id);
        gameState.bets.push(traveled);
        const chipSrc = zoneLastChipSrc.dontCome || selectedChipImgSrc;
        if (chipSrc) zoneLastChipSrc.dontComePoint = chipSrc;
        animateChipTravel({
          srcZone: zoneDontCome,
          destZone: dontComeTravelZones[total],
          chipSrc
        });
        console.log(`DON'T COME TRAVELS: id=${this.id} -> number=${total} (new id=${traveled.id})`);
        return true;
      }

      return false;
    }
  };
}

/* --------------------
   BET LOOKUPS
-------------------- */
function getActiveBet(type) {
  return gameState.bets.find(b => b.type === type && b.status === "active") || null;
}
function hasActiveBet(type) {
  return !!getActiveBet(type);
}

// Increments an existing bet by chipCents (deducts bankroll, increases bet amount)
// If recordUndo === true, we add an undo action (extras only).
function tryIncrementBetAmount(existingBet, chipCents, { recordUndo = false } = {}) {
  if (!existingBet) return false;

  if (chipCents <= 0) {
    console.log("Nothing to add (chip amount must be > $0.00).");
    return false;
  }

  if (!canAfford(chipCents)) {
    console.log(`Not enough bankroll to add ${centsToDollarsString(chipCents)}.`);
    return false;
  }

  gameState.bankrollCents -= chipCents;
  existingBet.amountCents += chipCents;

  if (recordUndo) recordUndoIfExtra(existingBet.type, chipCents);

  console.log(
    `INCREASED ${existingBet.type.toUpperCase()} by ${centsToDollarsString(chipCents)} ` +
    `(new total=${centsToDollarsString(existingBet.amountCents)})`
  );

  renderBankroll();
  refreshUIState();
  return true;
}

/* --------------------
   CHIP SELECTOR (UI)
-------------------- */
function setSelectedChip(value) {
  selectedChipValue = value;
  updateChipButtonStyles();
  refreshUIState();
}

function updateChipButtonStyles() {
  for (const btn of chipButtons) {
    const raw = btn.dataset.value;
    const v = (raw === "ALL") ? "ALL" : Number(raw);

    if (v === selectedChipValue) {
      btn.classList.add("selected");
      const img = btn.querySelector("img");
      if (img) selectedChipImgSrc = img.getAttribute("src");
    } else {
      btn.classList.remove("selected");
    }
  }
}

/* --------------------
   SAVE SYSTEM (localStorage + export/import)
-------------------- */
const SAVE_KEY = "crapsMobile_save_v1";
const SAVE_VERSION = 1;

function buildSaveObject() {
  return {
    version: SAVE_VERSION,
    savedAt: new Date().toISOString(),
    bankrollCents: gameState.bankrollCents,
    piggybankCents: gameState.piggybankCents,
    netTrackerCents: gameState.netTrackerCents
  };
}

function isValidNumber(n) {
  return typeof n === "number" && Number.isFinite(n);
}

function isValidSaveObject(obj) {
  if (!obj || typeof obj !== "object") return false;
  if (obj.version !== SAVE_VERSION) return false;

  return (
    isValidNumber(obj.bankrollCents) &&
    isValidNumber(obj.piggybankCents) &&
    isValidNumber(obj.netTrackerCents)
  );
}

function saveGameToLocal() {
  const data = buildSaveObject();
  localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}

function ensureAutoRefill() {
  // Only refill when you're truly busted AND the table is empty.
  // If bets are active, your money is "on the table" and should not trigger a refill.
  if (gameState.bets.length !== 0) return;

  if (gameState.bankrollCents === 0 && gameState.piggybankCents === 0) {
    gameState.bankrollCents = dollarsToCents(START_BANKROLL_DOLLARS);
    console.log(`AUTO-REFILL: bankroll reset to ${centsToDollarsString(gameState.bankrollCents)}`);
    saveGameToLocal();
    renderBankroll();
    refreshUIState();
  }
}

function loadGameFromLocal() {
  const raw = localStorage.getItem(SAVE_KEY);
  if (!raw) return false;

  try {
    const data = JSON.parse(raw);
    if (!isValidSaveObject(data)) return false;

    gameState.bankrollCents = Math.round(data.bankrollCents);
    gameState.piggybankCents = Math.round(data.piggybankCents);
    gameState.netTrackerCents = Math.round(data.netTrackerCents);

    // We do NOT restore table state
    gameState.bets = [];
    gameState.undoStack = [];
    gameState.phase = "comeOut";
    gameState.point = null;

    return true;
  } catch {
    return false;
  }
}

/* --------------------
   BUTTON TEXT + ENABLE/DISABLE
-------------------- */
function setButtonEnabled(btn, enabled) {
  if (!btn) return;
  btn.disabled = !enabled;
}

function setZoneEnabled(zone, enabled) {
  if (!zone) return;

  // Make the zone behave like a disabled button
  zone.style.pointerEvents = enabled ? "auto" : "none";
  zone.style.opacity = "1"; // keep chips fully visible even when zone is disabled
}


function refreshButtonLabels() {
  const chipText = dollarsToDollarsString(selectedChipValue);

  const hasPass = hasActiveBet("passLine");
  const hasDP = hasActiveBet("dontPass");
  const hasPassOdds = hasActiveBet("passOdds");
  const hasDPOdds = hasActiveBet("dontPassOdds");
  const hasField = hasActiveBet("field");

  const isComeOut = gameState.phase === "comeOut";
  const isPoint = gameState.phase === "point";

  if (placePassBtn) {
    const verb = (isComeOut && hasPass) ? "Add to Pass" : "Place Pass";
    placePassBtn.textContent = `${verb} (${chipText})`;
  }

  if (placeDontPassBtn) {
    const verb = (isComeOut && hasDP) ? "Add to Don’t Pass" : "Place Don’t Pass";
    placeDontPassBtn.textContent = `${verb} (${chipText})`;
  }

  if (addPassOddsBtn) {
    const verb = (isPoint && hasPassOdds) ? "Add to Pass Odds" : "Add Pass Odds";
    addPassOddsBtn.textContent = `${verb} (${chipText})`;
  }

  if (addDontPassOddsBtn) {
    const verb = (isPoint && hasDPOdds) ? "Add to Don’t Pass Odds" : "Add Don’t Pass Odds";
    addDontPassOddsBtn.textContent = `${verb} (${chipText})`;
  }

  if (placeFieldBtn) {
    const verb = hasField ? "Add to Field" : "Place Field";
    placeFieldBtn.textContent = `${verb} (${chipText})`;
  }

    // Piggybank buttons use the selected chip amount
  if (depositBtn) depositBtn.textContent = `Deposit (${chipText})`;
  if (withdrawBtn) withdrawBtn.textContent = `Withdraw (${chipText})`;
}

function refreshUIState() {
  refreshButtonLabels();

  const chipCents = getSelectedChipCents();
  const affordChip = canAfford(chipCents);

  const hasPass = hasActiveBet("passLine");
  const hasDP = hasActiveBet("dontPass");
  const hasField = hasActiveBet("field");

  const isComeOut = gameState.phase === "comeOut";
  const isPoint = gameState.phase === "point";

  // Pass / Don't Pass: come-out only, mutually exclusive, allow increments
  setButtonEnabled(placePassBtn, isComeOut && !hasDP && affordChip);
  setButtonEnabled(placeDontPassBtn, isComeOut && !hasPass && affordChip);

  // Odds: point only, must have parent line bet, allow increments
  setButtonEnabled(addPassOddsBtn, isPoint && hasPass && affordChip);
  setButtonEnabled(addDontPassOddsBtn, isPoint && hasDP && affordChip);

  // Field: allow increments before roll
  setButtonEnabled(placeFieldBtn, affordChip);

  // Table zones follow the exact same enable/disable rules as the old buttons
  setZoneEnabled(zonePass, isComeOut && !hasDP && affordChip);
  setZoneEnabled(zoneDontPass, isComeOut && !hasPass && affordChip);

  setZoneEnabled(zonePassOdds, isPoint && hasPass && affordChip);
  setZoneEnabled(zoneDontPassOdds, isPoint && hasDP && affordChip);

  setZoneEnabled(zoneField, affordChip);
  setZoneEnabled(zoneCome, isPoint && affordChip);
  setZoneEnabled(zoneDontCome, isPoint && affordChip);

  const numbers = [4, 5, 6, 8, 9, 10];
  for (const n of numbers) {
    const hasComePoint = gameState.bets.some(b => b.status === "active" && b.type === "comePoint" && b.number === n);
    const hasDontComePoint = gameState.bets.some(b => b.status === "active" && b.type === "dontComePoint" && b.number === n);
    setZoneEnabled(comeOddsZones[n], affordChip && hasComePoint);
    setZoneEnabled(dontComeOddsZones[n], affordChip && hasDontComePoint);
  }

  // Undo: only usable if we have at least one undo action AND the related bet still exists
  const undoableNow = hasUndoableActionNow();
  setButtonEnabled(undoLastBtn, undoableNow);

  // Clear ALL: only if any bets exist
  setButtonEnabled(clearAllBetsBtn, gameState.bets.length > 0);

    // Piggybank: disabled while any bets are active
  const betsActive = gameState.bets.length > 0;

  const canDeposit = !betsActive && affordChip;
    const canWithdraw = !betsActive && (
    (selectedChipValue === "ALL" && gameState.piggybankCents > 0) ||
    (selectedChipValue !== "ALL" && gameState.piggybankCents >= dollarsToCents(selectedChipValue))
  );

  setButtonEnabled(depositBtn, canDeposit);
  setButtonEnabled(withdrawBtn, canWithdraw);

  renderActiveBetsList();
  renderTableBetDisplays();

}

function hasUndoableActionNow() {
  if (gameState.undoStack.length === 0) return false;

  // If the top of the stack points to a bet type that doesn't exist right now,
  // we *could* still allow it (because clicking will skip invalid entries).
  // But for clear UX, we only enable if there's at least one valid action.
  for (let i = gameState.undoStack.length - 1; i >= 0; i--) {
    const a = gameState.undoStack[i];
    if (getActiveBet(a.betType)) return true;
  }
  return false;
}

/* --------------------
   UNDO (Extras only)
-------------------- */
function uiUndoLastExtras() {
  // Pop until we find an action that still matches an existing bet
  while (gameState.undoStack.length > 0) {
    const action = gameState.undoStack.pop(); // { betType, amountCents }
    const bet = getActiveBet(action.betType);

    // If the bet no longer exists, skip this undo record
    if (!bet) continue;

    // Undo means: refund the chip and subtract from bet amount
    gameState.bankrollCents += action.amountCents;
    bet.amountCents -= action.amountCents;

    console.log(
      `UNDO: removed ${centsToDollarsString(action.amountCents)} from ${bet.type.toUpperCase()} ` +
      `(new total=${centsToDollarsString(Math.max(0, bet.amountCents))})`
    );

    // If bet hits 0, remove it entirely
    if (bet.amountCents <= 0) {
      // Detach odds from parent if needed
      if (bet.type === "passOdds") {
        const pass = getActiveBet("passLine");
        if (pass) pass.odds = null;
      }
      if (bet.type === "dontPassOdds") {
        const dp = getActiveBet("dontPass");
        if (dp) dp.odds = null;
      }

      gameState.bets = gameState.bets.filter(b => b !== bet);
      console.log(`UNDO: ${bet.type.toUpperCase()} removed completely.`);
    }

    renderBankroll();
    refreshUIState();
    return; // undo exactly one action per click
  }

  // Nothing left to undo
  refreshUIState();
}

/* --------------------
   BUTTON ACTIONS (use selected chip)
-------------------- */
function uiPlacePass() {
  if (gameState.phase !== "comeOut") return;
  if (hasActiveBet("dontPass")) return;

  const chipCents = getSelectedChipCents();
  const existingPass = getActiveBet("passLine");

  if (existingPass) {
    // line bets: increment allowed on come-out, but NOT undoable
    tryIncrementBetAmount(existingPass, chipCents, { recordUndo: false });
    return;
  }

  placeBet(createPassLineBet(chipCents), { recordUndo: false });
}

function uiPlaceDontPass() {
  if (gameState.phase !== "comeOut") return;
  if (hasActiveBet("passLine")) return;

  const chipCents = getSelectedChipCents();
  const existingDP = getActiveBet("dontPass");

  if (existingDP) {
    tryIncrementBetAmount(existingDP, chipCents, { recordUndo: false });
    return;
  }

  placeBet(createDontPassBet(chipCents), { recordUndo: false });
}

function uiAddPassOdds() {
  if (gameState.phase !== "point") return;
  const pass = getActiveBet("passLine");
  if (!pass) return;

  const chipCents = getSelectedChipCents();
  const existingOdds = getActiveBet("passOdds");

  if (existingOdds) {
    // odds increments ARE undoable
    tryIncrementBetAmount(existingOdds, chipCents, { recordUndo: true });
    return;
  }

  const oddsBet = createPassOddsBet(chipCents, gameState.point, pass.id);
  if (placeBet(oddsBet, { recordUndo: true })) {
    pass.odds = oddsBet;
    console.log(`PASS ODDS ATTACHED at point=${gameState.point}`);
  }
}

function uiAddDontPassOdds() {
  if (gameState.phase !== "point") return;
  const dp = getActiveBet("dontPass");
  if (!dp) return;

  const chipCents = getSelectedChipCents();
  const existingOdds = getActiveBet("dontPassOdds");

  if (existingOdds) {
    tryIncrementBetAmount(existingOdds, chipCents, { recordUndo: true });
    return;
  }

  const oddsBet = createDontPassOddsBet(chipCents, gameState.point, dp.id);
  if (placeBet(oddsBet, { recordUndo: true })) {
    dp.odds = oddsBet;
    console.log(`DON'T PASS ODDS ATTACHED at point=${gameState.point}`);
  }
}

function uiPlaceField() {
  const chipCents = getSelectedChipCents();
  const existingField = getActiveBet("field");

  if (existingField) {
    // field increments ARE undoable
    tryIncrementBetAmount(existingField, chipCents, { recordUndo: true });
    return;
  }

  placeBet(createFieldBet(chipCents), { recordUndo: true });
}

function uiPlaceCome() {
  if (gameState.phase !== "point") return;

  const chipCents = getSelectedChipCents();
  const existingCome = getActiveBet("come");

  if (existingCome) {
    tryIncrementBetAmount(existingCome, chipCents, { recordUndo: true });
    return;
  }

  const bet = createComeBet(chipCents);
  if (placeBet(bet, { recordUndo: true })) {
    console.log(`COME PLACED: id=${bet.id} amount=${centsToDollarsString(bet.amountCents)}`);
  }
}

function uiPlaceDontCome() {
  if (gameState.phase !== "point") return;

  const chipCents = getSelectedChipCents();
  const existingDC = getActiveBet("dontCome");

  if (existingDC) {
    tryIncrementBetAmount(existingDC, chipCents, { recordUndo: true });
    return;
  }

  const bet = createDontComeBet(chipCents);
  if (placeBet(bet, { recordUndo: true })) {
    console.log(`DON'T COME PLACED: id=${bet.id} amount=${centsToDollarsString(bet.amountCents)}`);
  }
}

function getComePointBetsForNumber(pointNumber) {
  return gameState.bets.filter(
    b => b.status === "active" && b.type === "comePoint" && b.number === pointNumber
  );
}

function getDontComePointBetsForNumber(pointNumber) {
  return gameState.bets.filter(
    b => b.status === "active" && b.type === "dontComePoint" && b.number === pointNumber
  );
}

function uiAddComeOdds(pointNumber) {
  const parents = getComePointBetsForNumber(pointNumber);
  if (parents.length === 0) return;
  if (parents.length > 1) {
    openOddsSelectionModal({ type: "come", pointNumber });
    return;
  }
  const parent = parents[0];

  const chipCents = getSelectedChipCents();
  const existingOdds = gameState.bets.find(
    b => b.status === "active" && b.type === "comeOdds" && b.parentBetId === parent.id
  );

  if (existingOdds) {
    tryIncrementBetAmount(existingOdds, chipCents, { recordUndo: true });
    return;
  }

  const oddsBet = createComeOddsBet(chipCents, pointNumber, parent.id);
  if (placeBet(oddsBet, { recordUndo: true })) {
    console.log(`COME ODDS ATTACHED: number=${pointNumber} parent=${parent.id}`);
  }
}

function uiAddDontComeOdds(pointNumber) {
  const parents = getDontComePointBetsForNumber(pointNumber);
  if (parents.length === 0) return;
  if (parents.length > 1) {
    openOddsSelectionModal({ type: "dontCome", pointNumber });
    return;
  }
  const parent = parents[0];

  const chipCents = getSelectedChipCents();
  const existingOdds = gameState.bets.find(
    b => b.status === "active" && b.type === "dontComeOdds" && b.parentBetId === parent.id
  );

  if (existingOdds) {
    tryIncrementBetAmount(existingOdds, chipCents, { recordUndo: true });
    return;
  }

  const oddsBet = createDontComeOddsBet(chipCents, pointNumber, parent.id);
  if (placeBet(oddsBet, { recordUndo: true })) {
    console.log(`DON'T COME ODDS ATTACHED: number=${pointNumber} parent=${parent.id}`);
  }
}

function getOddsBetForParent(type, parentBetId) {
  return gameState.bets.find(
    b =>
      b.status === "active" &&
      ((type === "come" && b.type === "comeOdds") ||
       (type === "dontCome" && b.type === "dontComeOdds")) &&
      b.parentBetId === parentBetId
  ) || null;
}

function applyOddsDelta(type, parentBet, deltaCents) {
  if (!parentBet || deltaCents === 0) return;
  const existingOdds = getOddsBetForParent(type, parentBet.id);

  if (deltaCents > 0) {
    if (!canAfford(deltaCents)) {
      console.log("Not enough bankroll for odds.");
      return;
    }
    if (existingOdds) {
      tryIncrementBetAmount(existingOdds, deltaCents, { recordUndo: true });
    } else {
      const oddsBet = type === "come"
        ? createComeOddsBet(deltaCents, parentBet.number, parentBet.id)
        : createDontComeOddsBet(deltaCents, parentBet.number, parentBet.id);
      placeBet(oddsBet, { recordUndo: true });
    }
  } else {
    if (!existingOdds) return;
    const dec = Math.min(existingOdds.amountCents, Math.abs(deltaCents));
    existingOdds.amountCents -= dec;
    gameState.bankrollCents += dec;
    if (existingOdds.amountCents <= 0) {
      gameState.bets = gameState.bets.filter(b => b !== existingOdds);
    }
    renderBankroll();
    refreshUIState();
  }
}

function uiClearAllBets() {
  let refunded = 0;

  for (const bet of gameState.bets) {
    if (bet.status === "active") {
      gameState.bankrollCents += bet.amountCents;
      refunded += bet.amountCents;
    }
  }

  gameState.bets = [];
  gameState.undoStack = []; // clear undo history too

  console.log(`CLEARED ALL BETS: refunded ${centsToDollarsString(refunded)}`);
  renderBankroll();
  refreshUIState();
}

function uiDepositToPiggy() {
  const chipCents = getSelectedChipCents();

  // disabled while bets are active, but double-check anyway
  if (gameState.bets.length > 0) return;

  if (!canAfford(chipCents)) return;

  gameState.bankrollCents -= chipCents;
  gameState.piggybankCents += chipCents;

  console.log(`DEPOSIT: moved ${centsToDollarsString(chipCents)} to piggybank`);
  playOneShot(DEPOSIT_SOUND_SRC, 1.0);
    // UI-only animations
  piggyHop();
  piggyTextGain();
  renderBankroll();
  renderPiggybank();
  refreshUIState();
  saveGameToLocal();
  ensureAutoRefill();
}

function uiWithdrawFromPiggy() {
  const chipCents = (selectedChipValue === "ALL")
  ? gameState.piggybankCents
  : dollarsToCents(selectedChipValue);

  if (gameState.bets.length > 0) return;

  if (gameState.piggybankCents < chipCents) return;

  gameState.piggybankCents -= chipCents;
  gameState.bankrollCents += chipCents;

  console.log(`WITHDRAW: moved ${centsToDollarsString(chipCents)} to bankroll`);
  playOneShot(WITHDRAW_SOUND_SRC, 1.0);
    // UI-only animations
  piggyShake();
  piggyTextLoss();
  renderBankroll();
  renderPiggybank();
  refreshUIState();
  saveGameToLocal();
  ensureAutoRefill();
}

function uiExportSave() {
  const data = buildSaveObject();
  const json = JSON.stringify(data, null, 2);

  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "craps-mobile-save.json";
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

function uiStartImport() {
  if (!importFileInput) return;
  importFileInput.value = ""; // allow importing same file twice
  importFileInput.click();
}

function uiHandleImportFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(String(reader.result));
      if (!isValidSaveObject(data)) {
        console.log("IMPORT FAILED: invalid or unsupported save file.");
        return;
      }

      gameState.bankrollCents = Math.round(data.bankrollCents);
      gameState.piggybankCents = Math.round(data.piggybankCents);
      gameState.netTrackerCents = Math.round(data.netTrackerCents);

      // Reset table state on import (keeps it safe/simple)
      gameState.bets = [];
      gameState.undoStack = [];
      gameState.phase = "comeOut";
      gameState.point = null;

      renderPhase();
      renderBankroll();
      renderPiggybank();
      renderNetTracker();
      refreshUIState();

      // Save immediately so refresh keeps the imported values
      saveGameToLocal();

      ensureAutoRefill();

      console.log("IMPORT SUCCESS:", data.savedAt);
    } catch {
      console.log("IMPORT FAILED: could not parse file.");
    }
  };

  reader.readAsText(file);
}

/* --------------------
   ROLL HANDLER
-------------------- */
async function rollDice() {
    // NEW TIMING RULE:
  // Clear outcome lines when Roll Dice is clicked (before new roll happens)
  gameState.lastOutcomeLines = [];
  clearOutcomeLines();

    // NEW: clear table chip displays on roll click (visual-only)
  hideZoneTotals = true;
  clearTableBetTotalsOnly();
    if (rollButton) rollButton.disabled = true;
      // Start roll sound immediately on click (important for browser autoplay rules)
  startRollSound();

 // Start a fresh scratchpad for this roll's NET win/loss
 gameState._currentRollNetCents = 0;
 gameState._soundsThisRoll = new Set();
 gameState._rollSoundFlags = { win: false, lose: false };
 gameState._rollWinCents = 0;
 gameState._rollLoseCents = 0;

  const prevPhase = gameState.phase;
  const prevPoint = gameState.point;

  const die1 = rollOneDie();
  const die2 = rollOneDie();
  const total = die1 + die2;

  gameState.lastRoll = { die1, die2, total };
  gameState.lastOutcome = resolveOutcome(total, prevPhase, prevPoint);
    // Play the visual roll first, then resolve bets (thin UI layer)
  await playDiceAnimation(die1, die2);

    // Safety: if anything weird happens, make sure the sound is not left playing
  stopRollSound();

  const betsSnapshot = [...gameState.bets];
  const resolved = new Set();

  for (const bet of betsSnapshot) {
    const didResolve = bet.resolve(gameState.lastOutcome);
    if (didResolve) resolved.add(bet);
  }

  gameState.bets = gameState.bets.filter(bet => !resolved.has(bet));

  // After a roll, we clear undo history. It keeps things predictable and avoids stale undos.
  gameState.undoStack = [];

  updateGamePhaseFromTotal(total);

  updatePuckFromGameState();

  renderPhase();
  renderBankroll();
  renderPiggybank();
  refreshUIState();
  saveGameToLocal();
  ensureAutoRefill();

// Save and display ONE net line for the roll that just resolved
const net = Number(gameState._currentRollNetCents || 0);

if (net > 0) {
  const abs = centsToDollarsString(net);
  gameState.lastOutcomeLines = [`Won: +${abs}`];
} else if (net < 0) {
  const abs = centsToDollarsString(Math.abs(net));
  gameState.lastOutcomeLines = [`Lost: -${abs}`];
} else {
  gameState.lastOutcomeLines = [];
}

showOutcomeLines(gameState.lastOutcomeLines);

  // Play at most one win/lose sound based on aggregate win/loss totals
  if (gameState._rollWinCents > gameState._rollLoseCents) {
    playOneShotOncePerRoll(getRandomWinSoundSrc(), 0.3);
  } else if (gameState._rollLoseCents > gameState._rollWinCents) {
    playOneShotOncePerRoll(LOSE_SOUND_SRC, 1.0);
  }

  // Allow non-roll sounds after this roll resolves
  gameState._soundsThisRoll = null;
  gameState._rollSoundFlags = null;
  gameState._rollWinCents = 0;
  gameState._rollLoseCents = 0;

  console.log("--------------------------------------------------");
  console.log("Roll:", gameState.lastRoll);
  console.log("Outcome:", gameState.lastOutcome);
  console.log("Active Bets After Roll:", gameState.bets);
    refreshUIState();
  if (rollButton) rollButton.disabled = false;
}

/* --------------------
   WIRE + INIT
-------------------- */
function init() {
    // Universal tap sound for all button clicks
  document.addEventListener("click", (e) => {
    const t = e.target;
    if (!t) return;
    const el = t.closest("button, .betZone, .chipBtn, #hamburgerBtn");
    if (!el) return;
    if (el.tagName === "BUTTON" && el.disabled) return;
    playOneShot(TAP_SOUND_SRC, 1.0);
  });

  document.addEventListener("visibilitychange", handleVisibilityChange);
  if (!CHIP_OPTIONS.includes(selectedChipValue)) {
    selectedChipValue = CHIP_OPTIONS[0];
  }

  for (const btn of chipButtons) {
    btn.addEventListener("click", () => {
      const raw = btn.dataset.value;

      // "ALL" stays a string; numbers become Number
      const v = (raw === "ALL") ? "ALL" : Number(raw);

      if (CHIP_OPTIONS.includes(v)) setSelectedChip(v);
    });
  }

  if (placePassBtn) placePassBtn.addEventListener("click", uiPlacePass);
  if (placeDontPassBtn) placeDontPassBtn.addEventListener("click", uiPlaceDontPass);
  if (addPassOddsBtn) addPassOddsBtn.addEventListener("click", uiAddPassOdds);
  if (addDontPassOddsBtn) addDontPassOddsBtn.addEventListener("click", uiAddDontPassOdds);
  if (placeFieldBtn) placeFieldBtn.addEventListener("click", uiPlaceField);

  // Table zone clicks (same behavior as buttons)
// Table zone clicks (record last chip used per zone, then place bet)
if (zonePass) zonePass.addEventListener("click", () => {
  hideZoneTotals = false;
  zoneLastChipSrc.passLine = selectedChipImgSrc;
  uiPlacePass();
});

if (zoneDontPass) zoneDontPass.addEventListener("click", () => {
  hideZoneTotals = false;
  zoneLastChipSrc.dontPass = selectedChipImgSrc;
  uiPlaceDontPass();
});

if (zonePassOdds) zonePassOdds.addEventListener("click", () => {
  hideZoneTotals = false;
  zoneLastChipSrc.passOdds = selectedChipImgSrc;
  uiAddPassOdds();
});

if (zoneDontPassOdds) zoneDontPassOdds.addEventListener("click", () => {
  hideZoneTotals = false;
  zoneLastChipSrc.dontPassOdds = selectedChipImgSrc;
  uiAddDontPassOdds();
});

if (zoneField) zoneField.addEventListener("click", () => {
  hideZoneTotals = false;
  zoneLastChipSrc.field = selectedChipImgSrc;
  uiPlaceField();
});

if (zoneCome) zoneCome.addEventListener("click", () => {
  hideZoneTotals = false;
  zoneLastChipSrc.come = selectedChipImgSrc;
  uiPlaceCome();
});

if (zoneDontCome) zoneDontCome.addEventListener("click", () => {
  hideZoneTotals = false;
  zoneLastChipSrc.dontCome = selectedChipImgSrc;
  uiPlaceDontCome();
});

const oddsNumbers = [4, 5, 6, 8, 9, 10];
for (const n of oddsNumbers) {
  const cz = comeOddsZones[n];
  const dcz = dontComeOddsZones[n];

  if (cz) {
    cz.addEventListener("click", () => {
      hideZoneTotals = false;
      zoneLastChipSrc.comePoint = selectedChipImgSrc;
      uiAddComeOdds(n);
    });
  }

  if (dcz) {
    dcz.addEventListener("click", () => {
      hideZoneTotals = false;
      zoneLastChipSrc.dontComePoint = selectedChipImgSrc;
      uiAddDontComeOdds(n);
    });
  }
}


  if (undoLastBtn) undoLastBtn.addEventListener("click", uiUndoLastExtras);
  if (clearAllBetsBtn) clearAllBetsBtn.addEventListener("click", uiClearAllBets);

  if (rollButton) {
  rollButton.addEventListener("click", () => {
    startBgm();       // starts music on first interaction
    rollDice();
  });
}

  if (depositBtn) depositBtn.addEventListener("click", uiDepositToPiggy);
  if (withdrawBtn) withdrawBtn.addEventListener("click", uiWithdrawFromPiggy);

  if (exportSaveBtn) exportSaveBtn.addEventListener("click", uiExportSave);
  if (importSaveBtn) importSaveBtn.addEventListener("click", uiStartImport);
  if (importFileInput) importFileInput.addEventListener("change", uiHandleImportFile);

  if (oddsModalCloseEl) oddsModalCloseEl.addEventListener("click", closeOddsModal);
  if (oddsModalEl) {
    oddsModalEl.addEventListener("click", (e) => {
      const t = e.target;
      if (t && t.dataset && t.dataset.close === "true") closeOddsModal();
    });
  }

  if (oddsModalIncrementsEl) {
    oddsModalIncrementsEl.addEventListener("click", (e) => {
      const t = e.target;
      if (!t || !t.classList || !t.classList.contains("incBtn")) return;
      const raw = t.dataset.inc;
      if (!raw) return;
      if (raw === "ALL") {
        oddsModalState.selectedInc = { mode: "ALL", cents: 0 };
      } else {
        const dollars = Number(raw);
        if (!Number.isFinite(dollars)) return;
        oddsModalState.selectedInc = { mode: "fixed", cents: dollarsToCents(dollars) };
      }
      const btns = oddsModalIncrementsEl.querySelectorAll(".incBtn");
      btns.forEach(b => b.classList.toggle("selected", b === t));
    });
  }

  if (oddsModalRowsEl) {
    oddsModalRowsEl.addEventListener("click", (e) => {
      const t = e.target;
      if (!t || !t.dataset || !t.dataset.betId) return;
      const betId = Number(t.dataset.betId);
      if (!Number.isFinite(betId)) return;
      if (!oddsModalState.open) return;

      const type = oddsModalState.type;
      const parentBet = gameState.bets.find(b => b.id === betId);
      if (!parentBet) return;

      const sel = oddsModalState.selectedInc;
      if (!sel) return;

      const existingOdds = getOddsBetForParent(type, parentBet.id);
      let incCents = 0;

      if (sel.mode === "ALL") {
        if (t.classList.contains("oddsPlus")) {
          incCents = gameState.bankrollCents;
        } else if (t.classList.contains("oddsMinus")) {
          incCents = existingOdds ? existingOdds.amountCents : 0;
        }
      } else {
        incCents = sel.cents;
      }

      if (!incCents || incCents <= 0) return;

      if (t.classList.contains("oddsPlus")) {
        applyOddsDelta(type, parentBet, incCents);
      } else if (t.classList.contains("oddsMinus")) {
        applyOddsDelta(type, parentBet, -incCents);
      } else {
        return;
      }

      const isCome = type === "come";
      const pointNumber = oddsModalState.pointNumber;
      if (pointNumber) {
        openOddsSelectionModal({ type: isCome ? "come" : "dontCome", pointNumber });
      }
    });
  }


  loadGameFromLocal();
  renderPhase();
  renderBankroll();
  renderPiggybank();
  renderNetTracker();
  updatePuckFromGameState();
  updateChipButtonStyles();
  refreshUIState();
  clearOutcomeLines();
  startTravelCycler();

  console.log(`START BANKROLL: ${centsToDollarsString(gameState.bankrollCents)}`);
}

init();

// Debug helpers (console use only)
window.debugForceComePoints = (num, count = 2, amountCents = 500) => {
  if (!isPointNumber(num)) {
    console.log(`debugForceComePoints: invalid number ${num}`);
    return;
  }
  for (let i = 0; i < count; i++) {
    const bet = createComePointBet(amountCents, num, null);
    gameState.bets.push(bet);
  }
  renderTableBetDisplays();
  refreshUIState();
  console.log(`FORCED ${count} comePoint bets on ${num} for ${centsToDollarsString(amountCents)}`);
};

window.debugForceDontComePoints = (num, count = 2, amountCents = 500) => {
  if (!isPointNumber(num)) {
    console.log(`debugForceDontComePoints: invalid number ${num}`);
    return;
  }
  for (let i = 0; i < count; i++) {
    const bet = createDontComePointBet(amountCents, num, null);
    gameState.bets.push(bet);
  }
  renderTableBetDisplays();
  refreshUIState();
  console.log(`FORCED ${count} dontComePoint bets on ${num} for ${centsToDollarsString(amountCents)}`);
};
