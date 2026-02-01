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

// UI click / tap
const TAP_SOUND_SRC = "assets/tap sound/tap.mp3";

// Piggybank
const DEPOSIT_SOUND_SRC = "assets/piggybank sounds/deposit.mp3";
const WITHDRAW_SOUND_SRC = "assets/piggybank sounds/withdraw.mp3";

// Win / Lose
const WIN_SOUND_SRC = "assets/winorlose/win.mp3";
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

/* --------------------
   ROLL SOUND (UI ONLY)
-------------------- */
const ROLL_SOUND_SRC = "assets/roll sound/roll.mp3";
let rollAudio = null;

function ensureRollAudio() {
  if (rollAudio) return rollAudio;
  rollAudio = new Audio(ROLL_SOUND_SRC);
  rollAudio.loop = true;      // keep playing until we explicitly stop it
  rollAudio.preload = "auto"; // try to load early
  return rollAudio;
}

function startRollSound() {
  const a = ensureRollAudio();
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



// UI-only: remember last chip image used per bet zone
const zoneLastChipSrc = {
  passLine: null,
  dontPass: null,
  passOdds: null,
  dontPassOdds: null,
  field: null
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

  // Add up totals per bet type
  const totals = new Map();
  for (const bet of gameState.bets) {
    if (bet.status !== "active") continue;
    totals.set(bet.type, (totals.get(bet.type) || 0) + bet.amountCents);
  }

  // Clear existing lines
  activeBetsListEl.innerHTML = "";

  // Stable display order (so the list doesn’t jump around)
  const order = ["passLine", "passOdds", "dontPass", "dontPassOdds", "field"];
  const labels = {
    passLine: "Pass",
    passOdds: "Pass Odds",
    dontPass: "Don't Pass",
    dontPassOdds: "Don't Pass Odds",
    field: "Field"
  };

  for (const type of order) {
    const amt = totals.get(type);
    if (!amt) continue;

    const row = document.createElement("div");
    row.innerHTML =
  `<span class="betName">${labels[type]}:</span> ` +
  `<span class="amount">${centsToDollarsString(amt)}</span>`;
    activeBetsListEl.appendChild(row);
  }
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

    const isWin = left.includes(" Won:");
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
  const zones = [zonePass, zoneDontPass, zonePassOdds, zoneDontPassOdds, zoneField];

  for (const z of zones) {
    if (!z) continue;
    const total = z.querySelector(".zoneTotal");
    if (total) {
      total.textContent = "";
      total.style.display = "none";
    }
  }
}

function renderTableBetDisplays() {
  // total cents per bet type
  const totals = new Map();
  for (const bet of gameState.bets) {
    if (bet.status !== "active") continue;
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
    if (img && chipSrc) {
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

  bets: [],

  lastOutcomeLines: [],      // UI-only: the lines shown in the outcome panel
_currentOutcomeLines: null, // UI-only: per-roll scratchpad


  // Undo stack: only "extras" chip actions are recorded here.
  // Each entry undoes exactly one chip placement (or one increment).
  // { betType: "field"|"passOdds"|"dontPassOdds", amountCents: number }
  undoStack: []
};

const UNDOABLE_EXTRA_TYPES = new Set(["field", "passOdds", "dontPassOdds"]);

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

function updateGamePhaseFromTotal(total) {
  if (gameState.phase === "comeOut") {
    const isPointNumber =
      total === 4 || total === 5 || total === 6 ||
      total === 8 || total === 9 || total === 10;

    if (isPointNumber) {
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
    playOneShot(WIN_SOUND_SRC, 0.3);
  } else if (result === "push") {
    gameState.bankrollCents += bet.amountCents;
    netForTracker = 0;
    console.log(`${bet.type.toUpperCase()} SETTLED: PUSH | profit=$0.00`);
  } else {
    netForTracker = -bet.amountCents;
    console.log(`${bet.type.toUpperCase()} SETTLED: LOSE | profit=$0.00`);
    playOneShot(LOSE_SOUND_SRC, 1.0);
  }
    // NEW: record an outcome line for Section 2 (pushes are hidden)
  if (result !== "push" && Array.isArray(gameState._currentOutcomeLines)) {
    const labels = {
      passLine: "Pass",
      passOdds: "Pass Odds",
      dontPass: "Don't Pass",
      dontPassOdds: "Don't Pass Odds",
      field: "Field"
    };

    const label = labels[bet.type] || bet.type;

    // Win shows PROFIT ONLY (not principal). Lose shows -bet amount.
    const deltaCents = (result === "win") ? profitCents : -bet.amountCents;

    const verb = (result === "win") ? "Won" : "Lost";
    const sign = (deltaCents >= 0) ? "+" : "-";
    const abs = centsToDollarsString(Math.abs(deltaCents));

    gameState._currentOutcomeLines.push(`${label} ${verb}: ${sign}${abs}`);
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
    type: "field",
    status: "inactive",
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

function createPassOddsBet(amountCents, pointNumber) {
  return {
    type: "passOdds",
    status: "inactive",
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

function createDontPassOddsBet(amountCents, pointNumber) {
  return {
    type: "dontPassOdds",
    status: "inactive",
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
    type: "passLine",
    status: "inactive",
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
    type: "dontPass",
    status: "inactive",
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

  const oddsBet = createPassOddsBet(chipCents, gameState.point);
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

  const oddsBet = createDontPassOddsBet(chipCents, gameState.point);
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

  // Start a fresh scratchpad for this roll's resolved bet lines
  gameState._currentOutcomeLines = [];

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

  // Save and display outcome lines for the roll that just resolved
  gameState.lastOutcomeLines = gameState._currentOutcomeLines || [];
  gameState._currentOutcomeLines = null;
  showOutcomeLines(gameState.lastOutcomeLines);

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
  document.addEventListener("click", () => {
    playOneShot(TAP_SOUND_SRC, 1.0);
  });
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


  loadGameFromLocal();
  renderPhase();
  renderBankroll();
  renderPiggybank();
  renderNetTracker();
  updatePuckFromGameState();
  updateChipButtonStyles();
  refreshUIState();
  clearOutcomeLines();

  console.log(`START BANKROLL: ${centsToDollarsString(gameState.bankrollCents)}`);
}

init();
