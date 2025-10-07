<template>
  <div class="overflow-hidden">
    <ion-content class="game-content">
      <!-- Game Over Modal -->
      <ion-modal :isOpen="isMenu" @didDismiss="isMenu = false">
        <ion-card class="menu-over-modal">
          <h2>PAUSED</h2>
          <ion-list>
            <ion-item>
              <ion-toggle
                :checked="isVibration"
                @ionChange="onToggleVibration"
                :enable-on-off-labels="true"
                >SOUND</ion-toggle
              >
            </ion-item>
            <ion-item>
              <ion-toggle :enable-on-off-labels="true">VIBRATION</ion-toggle>
            </ion-item>
          </ion-list>
          <!-- <ion-button @click="resetGame" expand="block">Play Again</ion-button> -->
          <ion-button
            @click="isMenu = false"
            class="play-button"
            shape="round"
            size="large"
            expand="block"
          >
            CONTINUE
          </ion-button>
          <ion-button
            @click="resetGame"
            class="play-button"
            shape="round"
            size="large"
            expand="block"
          >
            RESTART
          </ion-button>
          <ion-button
            @click="router.push('/')"
            class="play-button"
            shape="round"
            size="large"
            expand="block"
          >
            HOME
          </ion-button>
        </ion-card>
      </ion-modal>
      <!-- Menu Over Modal -->
      <ion-modal :isOpen="gameOver" @didDismiss="gameOver = false">
        <div class="game-over-modal">
          <h2>Game Over!</h2>
          <p>Final Score: {{ score }}</p>
          <p>Best Score: {{ bestScore }}</p>
          <!-- <ion-button @click="resetGame" expand="block">Play Again</ion-button> -->
          <ion-button
            @click="resetGame"
            class="play-button"
            shape="round"
            size="large"
            expand="block"
          >
            <ion-icon color="light" slot="end" :icon="play"></ion-icon>
            PLAY AGAIN
          </ion-button>
        </div>
      </ion-modal>

      <!-- Top Status Bar -->
      <div class="status-bar">
        <div class="flex flex-col">
          <div class="status-item">
            <div class="gem-icon">💎</div>
            <span class="text-white">{{ displayNum(gems) }}</span>
            <div class="add-btn">+</div>
          </div>
        </div>
        <div class="flex flex-col items-center justify-center">
          <div class="level-display text-center text-white">
            {{ displayNum(score) }}
          </div>
        </div>
        <div class="flex flex-col">
          <div class="status-item">
            <div class="crown-icon">👑</div>
            <span class="text-white"> {{ displayNum(bestScore) }}</span>
          </div>
        </div>
      </div>

      <!-- Game Grid -->
      <ion-grid class="game-area">
        <ion-row class="grid-container">
          <ion-col
            v-for="(column, colIndex) in grid"
            :key="colIndex"
            class="game-column"
            :class="{
              'column-full': isColumnFull(colIndex),
              'column-danger': column.length >= maxHeight - 1,
            }"
            @click="onColumnClick(colIndex)"
          >
            <!-- Blocks in column (positioned from top) -->
            <ion-row
              v-for="(block, blockIndex) in column"
              :key="block.id"
              class="number-block"
              :class="[
                `block-${block.value}`,
                {
                  'liquid-merging': block.liquidMerging,
                  'liquid-absorbing': block.liquidAbsorbing,
                  'liquid-stretching': block.liquidStretching,
                  'block-selectable': activePowerUp !== null,
                  'block-selected': isBlockSelected(colIndex, blockIndex),
                },
              ]"
              :style="{
                top: `${blockIndex * 60 + 12}px`,
              }"
              @click="onColumnClick(colIndex)"
              @click.stop="onBlockClick(colIndex, blockIndex)"
            >
              <span class="block-number">{{ displayNum(block.value) }}</span>

              <!-- Selection indicator -->
              <div
                v-if="isBlockSelected(colIndex, blockIndex)"
                class="selection-indicator"
              >
                1
              </div>

              <!-- Liquid merge effect blobs -->
              <div v-if="block.liquidMerging" class="liquid-blobs">
                <div class="liquid-blob liquid-blob-1"></div>
                <div class="liquid-blob liquid-blob-2"></div>
                <div class="liquid-blob liquid-blob-3"></div>
              </div>

              <!-- Connection streams for liquid effect -->
              <div v-if="block.liquidStretching" class="liquid-streams">
                <div class="liquid-stream stream-1"></div>
                <div class="liquid-stream stream-2"></div>
              </div>
            </ion-row>
          </ion-col>
        </ion-row>
      </ion-grid>

      <!-- Bottom Section -->
      <div class="bottom-section">
        <!-- Active Power-up Indicator -->
        <div v-if="activePowerUp" class="active-powerup-banner">
          <span v-if="activePowerUp === 'hammer'"
            >🔨 Hammer Mode - Click a block to destroy it</span
          >

          <span v-if="activePowerUp === 'swap'">
            <h1>Swap Mode!</h1>
            Swap any two blocks. <br />
            {{
              swapSelection.first ? "Select second block" : "Select first block"
            }}
          </span>
          <button @click="cancelPowerUp" class="cancel-btn">✕</button>
        </div>
        <div v-else class="default-bottom-bar">
          <!-- Large Next Block Display -->

          <div class="large-next-block-container">
            <div class="large-next-block" :class="`block-${nextBlock}`">
              <span class="large-block-number large-number">{{
                displayNum(nextBlock)
              }}</span>
            </div>
            <ion-button
              @click="isMenu = true"
              class="bottom-btn"
              size="large"
              color="dark"
            >
              <ion-icon
                slot="icon-only"
                size="large"
                :icon="settings"
              ></ion-icon>
            </ion-button>
          </div>

          <!-- Power-ups Section -->
          <div class="powerups-section">
            <div
              class="powerup-item"
              :class="{ 'powerup-disabled': gems < powerUpCosts.undo }"
              @click="activateUndo"
            >
              <div class="powerup-icon">⚡</div>
              <div class="powerup-count">{{ powerUpCosts.undo }}</div>
            </div>
            <div
              class="powerup-item"
              :class="{
                'powerup-active': activePowerUp === 'hammer',
                'powerup-disabled': gems < powerUpCosts.hammer,
              }"
              @click="activatePowerUpMode('hammer')"
            >
              <div class="powerup-icon">🔨</div>
              <div class="powerup-count">{{ powerUpCosts.hammer }}</div>
            </div>

            <div
              class="powerup-item"
              :class="{
                'powerup-active': activePowerUp === 'swap',
                'powerup-disabled': gems < powerUpCosts.swap,
              }"
              @click="activatePowerUpMode('swap')"
            >
              <div class="powerup-icon">🔄</div>
              <div class="powerup-count">{{ powerUpCosts.swap }}</div>
            </div>
          </div>
        </div>

        <!-- Floating merge indicators -->
        <div
          v-for="indicator in mergeIndicators"
          :key="indicator.id"
          class="merge-indicator"
          :style="{
            left: `${indicator.x}px`,
            top: `${indicator.y}px`,
            color: indicator.color,
          }"
        >
          +{{ indicator.value }}
        </div>
      </div>
    </ion-content>
  </div>
</template>

<style scoped>
.play-button {
  /* margin-top: 4rem; */
  font-weight: 700;
  font-size: 1.5rem;
  --background: linear-gradient(
    135deg,
    #4caf50,
    #2e7d32
  ); /* light → dark green */
  --color: white;

  /* background: rgb(0, 181, 82); */
}
.active-powerup-banner {
  position: relative; /* allow absolute children */
  background: linear-gradient(135deg, #1b37b533 0%, #480d8241 100%);
  color: white;
  padding: 10px;
  font-weight: 600;
  font-size: 1rem;
  z-index: 1000;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 60px; /* so text doesn’t overlap button */
  height: 100%;
}

.cancel-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 4px 12px;
  border-radius: 15px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

/* Active Power-up Banner */
.active-powerup-banners {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 10px;
  /* border-radius: 25px; */
  font-weight: 600;
  font-size: 1rem;
  z-index: 1000;
  display: flex;
  align-items: center;
  width: 100%;
  height: 100%;
}

/* @keyframes slideDown {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
} */

.cancel-btns {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  padding: 4px 12px;
  border-radius: 15px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s;
}

.cancel-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

/* Power-up Active State */
.powerup-active {
  transform: scale(1.1);
  box-shadow: 0 0 20px rgba(102, 126, 234, 0.8),
    0 0 40px rgba(102, 126, 234, 0.4);
  animation: pulse 1.5s infinite;
  border: 3px solid #667eea !important;
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 0 20px rgba(102, 126, 234, 0.8),
      0 0 40px rgba(102, 126, 234, 0.4);
  }
  50% {
    box-shadow: 0 0 30px rgba(102, 126, 234, 1),
      0 0 60px rgba(102, 126, 234, 0.6);
  }
}

/* Power-up Disabled State */
.powerup-disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

/* Block Selection Styles */
.block-selectable {
  cursor: pointer;
  transition: all 0.2s;
}

.block-selectable:hover {
  /* transform: scale(1.05); */
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
}

.block-selected {
  border: 3px solid #fff;
  box-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
  animation: selectedPulse 0.8s infinite;
}

@keyframes selectedPulse {
  0%,
  100% {
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
  }
  50% {
    box-shadow: 0 0 30px rgba(255, 255, 255, 1);
  }
}

.selection-indicator {
  position: absolute;
  top: -8px;
  right: -8px;
  background: #667eea;
  color: white;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 12px;
  border: 2px solid white;
  z-index: 10;
}
</style>

<script setup lang="ts">
import { reactive, ref, onMounted, nextTick } from "vue";
import { addIcons } from "ionicons";
import { menuOutline } from "ionicons/icons";
import { play, settings } from "ionicons/icons";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

addIcons({
  "menu-outline": menuOutline,
});
interface Block {
  value: number;
  id: string;
  liquidMerging?: boolean;
  liquidAbsorbing?: boolean;
  liquidStretching?: boolean;
}
// the numbers that flies up when merging
interface MergeIndicator {
  id: number;
  value: number;
  x: number;
  y: number;
  color: string;
}

interface PowerUps {
  hammer: number;
  swap: number;
  undo: number;
}

interface Position {
  col: number;
  row: number;
}
// connects the blocks that need to be merged with a liquid effect
interface LiquidConnection {
  id: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const columns = 5;
const maxHeight = 7;
const grid = reactive<Block[][]>(Array.from({ length: columns }, () => []));
const score = ref(0);
const gameOver = ref(false);
const isMenu = ref(false);
const nextBlock = ref(2);

import { IonToggle } from "@ionic/vue";

import { usePreferences } from "@/composables/usePreferences";
const router = useRouter(); // to push/replace routes
const route = useRoute(); // to access current route info

const {
  bestScore,
  gems,
  setBestScore,
  setBestBlock,
  bestBlock,
  isVibration,
  setIsVibration,
} = usePreferences();
function onToggleVibration(event: CustomEvent) {
  setIsVibration(event.detail.checked);
}
const mergeIndicators = reactive<MergeIndicator[]>([]);
const liquidConnections = reactive<LiquidConnection[]>([]);
const powerUps = reactive<PowerUps>({ hammer: 35, swap: 45, undo: 30 });
const highestTile = ref(2);

// IDs for indicators and connections
let indicatorId = 1;
let connectionId = 1;
// Fallback counter for UUID generation
let uuidCounterFallback = 1;

// Power-up state
const activePowerUp = ref<keyof PowerUps | null>(null);
const swapSelection = reactive<{ first?: Position; second?: Position }>({});

// --- State for Undo ---
const history = reactive<
  { grid: Block[][]; score: number; nextBlock: number }[]
>([]);

// --- Power-up Costs ---
const powerUpCosts: Record<keyof PowerUps, number> = {
  hammer: 35,
  swap: 45,
  undo: 30,
};

// --- Utility ---
function generateUUID(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof (crypto as any).randomUUID === "function"
  ) {
    return (crypto as any).randomUUID();
  }
  return `fallback-${Date.now()}-${uuidCounterFallback++}`;
}

function createBlock(value: number): Block {
  return { value, id: generateUUID() };
}

function tryUpdateHighestTile(value: number) {
  if (value > highestTile.value) highestTile.value = value;
}

// --- Lifecycle ---
onMounted(() => {
  if (process.client) {
    const saved = localStorage.getItem("numberMergeBestScore");
    if (saved) bestScore.value = parseInt(saved, 10);
  }
  generateNextBlock();
});

// --- Weighted Random ---
function weightedChoice<T>(items: T[], weights: number[]): T {
  const sum = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * sum;
  for (let i = 0; i < items.length; i++) {
    if ((r -= weights[i]) <= 0) return items[i];
  }
  return items[items.length - 1];
}

function generateNextBlock() {
  const maxAllowed = Math.max(2, Math.floor(highestTile.value / 2));
  const options: number[] = [];
  for (let p = 2; p <= maxAllowed; p *= 2) options.push(p);
  if (options.length === 0) options.push(2);

  let chosen: number;
  if (options.length === 1) chosen = options[0];
  else if (options.length === 2) chosen = weightedChoice(options, [0.75, 0.25]);
  else {
    const restWeight = 0.15;
    chosen = weightedChoice(options, [
      0.6,
      0.25,
      ...Array(options.length - 2).fill(restWeight / (options.length - 2)),
    ]);
  }

  nextBlock.value = chosen;
}

// --- Game Logic ---
function isColumnFull(columnIndex: number) {
  return grid[columnIndex].length >= maxHeight;
}

function checkGameOver() {
  if (grid.some((c) => c.length < maxHeight)) return false;
  for (let c = 0; c < columns; c++) {
    if (grid[c][maxHeight - 1].value === nextBlock.value) return false;
    for (let r = 0; r < grid[c].length; r++) {
      const v = grid[c][r].value;
      const neighbors = [
        { col: c - 1, row: r },
        { col: c + 1, row: r },
        { col: c, row: r - 1 },
        { col: c, row: r + 1 },
      ];
      for (const n of neighbors) {
        if (
          n.col >= 0 &&
          n.col < columns &&
          n.row >= 0 &&
          n.row < grid[n.col].length
        ) {
          if (grid[n.col][n.row].value === v) return false;
        }
      }
    }
  }
  if (score.value > bestScore.value) {
    setBestScore(score.value);
    setBestBlock(highestTile.value);
  }
  return true;
}

function resetGame() {
  grid.forEach((c) => c.splice(0, c.length));
  score.value = 0;
  mergeIndicators.splice(0, mergeIndicators.length);
  liquidConnections.splice(0, liquidConnections.length);
  highestTile.value = 2;
  activePowerUp.value = null;
  swapSelection.first = undefined;
  swapSelection.second = undefined;
  generateNextBlock();
  gameOver.value = false;
  isMenu.value = false;
}

function updateBestScore() {
  if (score.value > bestScore.value) {
    bestScore.value = score.value;
    if (process.client) {
      localStorage.setItem("numberMergeBestScore", bestScore.value.toString());
    }
  }
}

// --- Power-up Functions ---

// Activate power-up mode (doesn't deduct gems yet)
function activatePowerUpMode(type: "hammer" | "swap") {
  if (gems.value < powerUpCosts[type]) {
    alert("Not enough gems!");
    return;
  }

  activePowerUp.value = type;

  // Reset swap selection when activating swap mode
  if (type === "swap") {
    swapSelection.first = undefined;
    swapSelection.second = undefined;
  }
}

// Undo is instant, not a mode
function activateUndo() {
  if (gems.value < powerUpCosts.undo) {
    alert("Not enough gems!");
    return;
  }

  if (history.length === 0) {
    alert("No moves to undo!");
    return;
  }

  gems.value -= powerUpCosts.undo;
  undoMove();
}

function cancelPowerUp() {
  activePowerUp.value = null;
  swapSelection.first = undefined;
  swapSelection.second = undefined;
}

function isBlockSelected(col: number, row: number): boolean {
  if (!swapSelection.first) return false;
  return swapSelection.first.col === col && swapSelection.first.row === row;
}

// Save snapshot before each move
function saveHistory() {
  const snapshot = {
    grid: grid.map((col) => col.map((b) => ({ ...b }))),
    score: score.value,
    nextBlock: nextBlock.value,
  };
  history.splice(3, history.length, snapshot);
}

function undoMove() {
  if (history.length === 0) return;
  const last = history.pop()!;
  grid.forEach((col, i) => {
    col.splice(0, col.length, ...last.grid[i]);
  });
  score.value = last.score;
  nextBlock.value = last.nextBlock;
}

// --- Hammer: remove a block ---
async function useHammer(col: number, row: number) {
  if (!grid[col] || !grid[col][row]) return;

  saveHistory();
  gems.value -= powerUpCosts.hammer;

  grid[col].splice(row, 1);
  await nextTick();

  await mergeConnectedBlocks();

  activePowerUp.value = null;
}

// --- Swap: swap two blocks ---
async function useSwap(c1: number, r1: number, c2: number, r2: number) {
  if (!grid[c1]?.[r1] || !grid[c2]?.[r2]) return;

  saveHistory();
  gems.value -= powerUpCosts.swap;

  const temp = grid[c1][r1];
  grid[c1][r1] = grid[c2][r2];
  grid[c2][r2] = temp;

  await nextTick();
  await mergeConnectedBlocks();

  activePowerUp.value = null;
  swapSelection.first = undefined;
  swapSelection.second = undefined;
}

// Handle clicks on blocks
async function onBlockClick(col: number, row: number) {
  if (activePowerUp.value === "hammer") {
    await useHammer(col, row);
    return;
  }

  if (activePowerUp.value === "swap") {
    if (!swapSelection.first) {
      swapSelection.first = { col, row };
    } else {
      swapSelection.second = { col, row };
      await useSwap(
        swapSelection.first.col,
        swapSelection.first.row,
        swapSelection.second.col,
        swapSelection.second.row
      );
    }
    return;
  }
}

// Handle clicks on columns (normal shooting)
function onColumnClick(col: number) {
  // Only shoot if no power-up is active
  if (activePowerUp.value === null) {
    shootBlock(col);
  }
}

async function addMergeIndicator(col: number, row: number, value: number) {
  await nextTick();
  const colEl = document.querySelectorAll<HTMLElement>(".game-column")[col];
  if (!colEl) return;

  const blockEls = Array.from(
    colEl.querySelectorAll(".number-block")
  ) as HTMLElement[];

  function getElementCenter(el: HTMLElement) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
  }

  function getBottomCenter(el: HTMLElement, offset = 0) {
    const r = el.getBoundingClientRect();
    return { x: r.left + r.width / 2, y: r.bottom - offset };
  }

  let { x, y } = blockEls[row]
    ? getElementCenter(blockEls[row])
    : getBottomCenter(colEl, 30);

  const indicator: MergeIndicator = {
    id: indicatorId++,
    value,
    x,
    y,
    color: value >= 100 ? "#ffd700" : value >= 50 ? "#ff6b6b" : "#4ecdc4",
  };

  mergeIndicators.push(indicator);

  setTimeout(() => {
    const idx = mergeIndicators.findIndex((i) => i.id === indicator.id);
    if (idx > -1) mergeIndicators.splice(idx, 1);
  }, 1600);
}

// --- Enhanced Liquid Merge Algorithm ---
function clearAllAnimationStates() {
  for (let c = 0; c < columns; c++) {
    for (let r = 0; r < grid[c].length; r++) {
      if (grid[c][r]) {
        grid[c][r].liquidMerging = false;
        grid[c][r].liquidAbsorbing = false;
        grid[c][r].liquidStretching = false;
      }
    }
  }
}

function findConnectedBlocks(col: number, row: number): Position[] {
  const start = grid[col][row];
  if (!start) return [];
  const visited = new Set<string>();
  const out: Position[] = [];
  const stack: Position[] = [{ col, row }];

  while (stack.length) {
    const p = stack.pop()!;
    const key = `${p.col},${p.row}`;
    if (visited.has(key)) continue;
    visited.add(key);

    const b = grid[p.col][p.row];
    if (!b || b.value !== start.value) continue;
    out.push(p);

    const nbs = [
      { col: p.col + 1, row: p.row },
      { col: p.col - 1, row: p.row },
      { col: p.col, row: p.row + 1 },
      { col: p.col, row: p.row - 1 },
    ];
    for (const n of nbs) {
      if (
        n.col >= 0 &&
        n.col < columns &&
        n.row >= 0 &&
        n.row < grid[n.col].length
      ) {
        stack.push(n);
      }
    }
  }
  return out;
}

let isOnCooldown = false;

async function shootBlock(columnIndex: number) {
  saveHistory();

  if (isOnCooldown) return; // ignore extra taps

  isOnCooldown = true;

  if (isColumnFull(columnIndex) || gameOver.value) {
    const lastBlock = grid[columnIndex][maxHeight - 1].value;
    if (gameOver.value) return;
    // if (lastBlock == nextBlock.value) {
    //   // directly merge instead of pushing a duplicate first
    //   // grid[columnIndex].push(createBlock(nextBlock.value));
    //   generateNextBlock();
    //   await mergeConnectedBlocks(columnIndex);
    //   await nextTick();
    //   if (checkGameOver()) {
    //     gameOver.value = true;
    //     updateBestScore();
    //   }
    //   return;
    // }
    else if (lastBlock != nextBlock.value) {
      return;
    }
  }

  grid[columnIndex].push(createBlock(nextBlock.value));

  generateNextBlock();
  if (isVibration.value) {
    await Haptics.impact({ style: ImpactStyle.Medium });
  }
  await mergeConnectedBlocks(columnIndex);

  await nextTick();
  if (checkGameOver()) {
    gameOver.value = true;
    updateBestScore();
  }
  setTimeout(() => {
    isOnCooldown = false;
  }, 300);
}

async function mergeConnectedBlocks(targetColumn?: number) {
  clearAllAnimationStates();

  let isFirstMerge = targetColumn !== undefined;
  const shotPos = isFirstMerge
    ? { col: targetColumn!, row: grid[targetColumn!].length - 1 }
    : undefined;

  while (true) {
    const visited = new Set<string>();
    const groups: {
      positions: Position[];
      base: number;
      maxRow: number;
    }[] = [];

    for (let c = 0; c < columns; c++) {
      for (let r = 0; r < grid[c].length; r++) {
        const key = `${c},${r}`;
        if (visited.has(key)) continue;
        const connected = findConnectedBlocks(c, r);
        connected.forEach((p) => visited.add(`${p.col},${p.row}`));
        if (connected.length >= 2) {
          const base = grid[c][r].value;
          const maxRow = Math.max(...connected.map((p) => p.row));
          groups.push({ positions: connected, base, maxRow });
        }
      }
    }

    if (groups.length === 0) break;

    let groupToProcess = null as (typeof groups)[number] | null;

    if (isFirstMerge && shotPos) {
      groupToProcess =
        groups.find((g) =>
          g.positions.some(
            (p) => p.col === shotPos.col && p.row === shotPos.row
          )
        ) ?? null;
    }

    if (!groupToProcess) {
      groups.sort((a, b) => {
        if (b.maxRow !== a.maxRow) return b.maxRow - a.maxRow;
        const leftA = Math.min(...a.positions.map((p) => p.col));
        const leftB = Math.min(...b.positions.map((p) => p.col));
        return leftA - leftB;
      });
      groupToProcess = groups[0];
    }

    if (!groupToProcess) break;

    groupToProcess.positions.forEach((pos, index) => {
      const block = grid[pos.col][pos.row];
      if (!block) return;
      block.liquidMerging = index === 0;
      block.liquidAbsorbing = index !== 0;
    });

    const k = groupToProcess.positions.length;
    const newValue = groupToProcess.base * Math.pow(2, k - 1);
    score.value += newValue;

    let primaryCol: number;
    let mergeRow: number;

    const shotColInMerge =
      targetColumn !== undefined &&
      groupToProcess.positions.some((p) => p.col === targetColumn);

    if (shotColInMerge) {
      primaryCol = targetColumn!;
      const shotColBlocks = groupToProcess.positions.filter(
        (p) => p.col === targetColumn
      );
      mergeRow = Math.min(...shotColBlocks.map((p) => p.row));
    } else {
      const fallingBlock = groupToProcess.positions.reduce((top, cur) =>
        cur.row < top.row ? cur : top
      );
      primaryCol = fallingBlock.col;
      mergeRow = fallingBlock.row;
    }

    await addMergeIndicator(primaryCol, mergeRow, newValue);

    await new Promise((resolve) => setTimeout(resolve, 400));

    const sortedPositions = groupToProcess.positions.slice().sort((a, b) => {
      if (a.col !== b.col) return b.col - a.col;
      return b.row - a.row;
    });

    let removedBelowMerge = 0;
    for (const p of sortedPositions) {
      if (grid[p.col] && grid[p.col][p.row]) {
        const blk = grid[p.col][p.row];
        blk.liquidMerging = false;
        blk.liquidAbsorbing = false;
        blk.liquidStretching = false;

        if (p.col === primaryCol && p.row < mergeRow) {
          removedBelowMerge++;
        }

        grid[p.col].splice(p.row, 1);
      }
    }

    const adjustedMergeRow = mergeRow - removedBelowMerge;

    const newBlock = createBlock(newValue);
    tryUpdateHighestTile(newBlock.value);
    grid[primaryCol].splice(adjustedMergeRow, 0, newBlock);

    isFirstMerge = false;

    await new Promise((resolve) => setTimeout(resolve, 250));
    await nextTick();
  }
}
</script>
