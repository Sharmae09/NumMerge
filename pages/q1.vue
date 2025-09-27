<template>
  <div class="overflow-hidden">
    <ion-content class="game-content">
      <!-- Game Over Modal -->
      <ion-modal :isOpen="gameOver" @didDismiss="gameOver = false">
        <div class="game-over-modal">
          <h2>Game Over!</h2>
          <p>Final Score: {{ score }}</p>
          <p>Best Score: {{ bestScore }}</p>
          <ion-button @click="resetGame" expand="block">Play Again</ion-button>
        </div>
      </ion-modal>

      <!-- Top Status Bar -->
      <div class="status-bar">
        <div class="flex flex-col">
          <div class="status-item">
            <div class="gem-icon">💎</div>
            <span class="text-white">{{ gems }}</span>
            <div class="add-btn">+</div>
          </div>
        </div>
        <div class="flex flex-col items-center justify-center">
          <div
            class="level-display pt-0 pb-0 leading-none bg-black text-center text-white"
          >
            {{ score }}
          </div>

          <div class="status-item-bestscore">
            <div class="crown-icon">👑</div>
            <span class="text-white"> {{ bestScore }}</span>
          </div>
        </div>

        <ion-button color="light" fill="clear">
          <ion-icon name="menu-outline" />
        </ion-button>
      </div>

      <!-- Game Grid -->
      <div class="game-area">
        <div class="grid-container">
          <div
            v-for="(column, colIndex) in grid"
            :key="colIndex"
            class="game-column"
            :class="{
              'column-full': isColumnFull(colIndex),
              'column-danger': column.length >= maxHeight - 1,
            }"
            @click="shootBlock(colIndex)"
          >
            <!-- Blocks in column (positioned from top) -->
            <div
              v-for="(block, blockIndex) in column"
              :key="block.id"
              class="number-block"
              :class="[
                `block-${block.value}`,
                { merging: block.merging },
                { 'merge-target': block.mergeTarget },
              ]"
              :style="{
                top: `${blockIndex * 52}px`,
              }"
            >
              <span class="block-number">{{ block.value }}</span>

              <!-- Merge effect particles -->
              <div v-if="block.merging" class="merge-particles">
                <div class="particle" v-for="i in 6" :key="i"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom Section -->
      <div class="bottom-section">
        <!-- Large Next Block Display -->
        <div class="flex">
          <div
            class="large-next-block number-block"
            :class="`block-${nextBlockValue}`"
          >
            <span class="block-number large-number">{{ nextBlockValue }}</span>
          </div>
        </div>

        <!-- Power-ups Section -->
        <div class="powerups-section">
          <div class="powerup-item" @click="usePowerUp('hammer')">
            <div class="powerup-icon">🔨</div>
            <div class="powerup-count">{{ powerUps.hammer }}</div>
          </div>

          <div class="powerup-item" @click="usePowerUp('swap')">
            <div class="powerup-icon">🔄</div>
            <div class="powerup-count">{{ powerUps.swap }}</div>
          </div>

          <div class="powerup-item" @click="usePowerUp('undo')">
            <div class="powerup-icon">⚡</div>
            <div class="powerup-count">{{ powerUps.undo }}</div>
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
    </ion-content>
  </div>
</template>

<style scoped>
.game-content {
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  --ion-background-color: transparent;
  height: 100vh;
  overflow: hidden;
}

/* Status Bar */
.status-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 20px 10px 20px;
  background: rgba(0, 0, 0, 0.3);
  height: 10vh;
}

.status-item {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 8px 12px;
  max-height: 30px;
  gap: 8px;
}
.status-item-bestscore {
  display: flex;
  align-items: center;
  /* background: rgba(255, 255, 255, 0.1); */
  border-radius: 20px;
  /* padding: 8px 12px; */
  gap: 8px;
}

.gem-icon,
.crown-icon {
  font-size: 18px;
}

.add-btn {
  background: #4caf50;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: white;
  font-weight: bold;
}

/* Game Area */
.game-area {
  flex: 1;
  padding: 20px;
  position: relative;
  overflow: hidden;
  height: 60vh;
}

.grid-container {
  display: flex;
  justify-content: center;
  gap: 10px;
  height: 100%;
}

.game-column {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  padding: 4px;
  width: 100%;
}

.column-full {
  border-color: #ff4444;
  background: rgba(255, 68, 68, 0.1);
  cursor: not-allowed;
}

.column-danger {
  border-color: #ff8800;
  background: rgba(255, 136, 0, 0.1);
  animation: warningPulse 1s infinite;
}

/* Number Blocks */
.number-block {
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  animation: dropIn 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.block-number {
  font-size: 16px;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.large-number {
  font-size: 32px !important;
}

/* Block Colors - Matching the mobile game aesthetic */
.block-2 {
  background: linear-gradient(135deg, #3498db, #2980b9);
  color: white;
}
.block-4 {
  background: linear-gradient(135deg, #e67e22, #d35400);
  color: white;
}
.block-8 {
  background: linear-gradient(135deg, #e91e63, #c2185b);
  color: white;
}
.block-16 {
  background: linear-gradient(135deg, #9c27b0, #7b1fa2);
  color: white;
}
.block-32 {
  background: linear-gradient(135deg, #673ab7, #512da8);
  color: white;
}
.block-64 {
  background: linear-gradient(135deg, #3f51b5, #303f9f);
  color: white;
}
.block-128 {
  background: linear-gradient(135deg, #2196f3, #1976d2);
  color: white;
}
.block-256 {
  background: linear-gradient(135deg, #00bcd4, #0097a7);
  color: white;
}
.block-512 {
  background: linear-gradient(135deg, #4caf50, #388e3c);
  color: white;
}
.block-1024 {
  background: linear-gradient(135deg, #ff9800, #f57c00);
  color: white;
}
.block-2048 {
  background: linear-gradient(135deg, #f44336, #d32f2f);
  color: white;
}

/* Bottom Section */
.bottom-section {
  background: rgba(0, 0, 0, 0.4);
  padding: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  height: 30vh;
  margin: 0;
}

.next-block-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.large-next-block {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 16px;
  border: 3px solid rgba(255, 255, 255, 0.3);
  animation: glow 2s ease-in-out infinite alternate;
}

/* Power-ups Section */
.powerups-section {
  display: flex;
  justify-content: space-around;
  gap: 0px;
  margin-top: 20px;
}

.powerup-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 60px;
  min-height: 60px;
  width: 30%;
}

.powerup-icon {
  font-size: 18px;
  margin-bottom: 4px;
}

.powerup-count {
  font-size: 14px;
  font-weight: bold;
  color: #4caf50;
  background: rgba(76, 175, 80, 0.2);
  padding: 2px 8px;
  border-radius: 8px;
}

/* Merge Effects */
.number-block.merging {
  animation: mergeGlow 0.6s ease-in-out;
  z-index: 100;
}

.particle {
  position: absolute;
  width: 3px;
  height: 3px;
  background: #ffd700;
  border-radius: 50%;
  animation: particleExplosion 0.6s ease-out forwards;
}

.merge-indicator {
  position: fixed;
  font-size: 20px;
  font-weight: bold;
  pointer-events: none;
  z-index: 2000;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
  animation: floatUp 1.5s ease-out forwards;
}

/* Game Over Modal */
.game-over-modal {
  padding: 40px;
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: linear-gradient(135deg, #20263f 0%, #490c86 100%);
  color: white;
}

.game-over-modal h2 {
  font-size: 32px;
  margin-bottom: 20px;
  color: #ff6b6b;
}

.game-over-modal p {
  font-size: 18px;
  margin: 10px 0;
}

/* Animations */
@keyframes dropIn {
  from {
    transform: translateX(-50%) translateY(100px);
    opacity: 0;
  }
  to {
    transform: translateX(-50%) translateY(0);
    opacity: 1;
  }
}

@keyframes glow {
  from {
    box-shadow: 0 0 20px rgba(52, 152, 219, 0.5);
  }
  to {
    box-shadow: 0 0 30px rgba(52, 152, 219, 0.8);
  }
}

@keyframes mergeGlow {
  0% {
    transform: translateX(-50%) scale(1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
  50% {
    transform: translateX(-50%) scale(1.1);
    box-shadow: 0 0 30px rgba(255, 215, 0, 0.8);
  }
  100% {
    transform: translateX(-50%) scale(0.8);
    opacity: 0;
  }
}

@keyframes particleExplosion {
  0% {
    transform: translate(50%, 50%) scale(0);
    opacity: 1;
  }
  100% {
    transform: translate(
        calc(50% + var(--random-x, 0) * 40px),
        calc(50% + var(--random-y, 0) * 40px)
      )
      scale(1);
    opacity: 0;
  }
}

@keyframes floatUp {
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(-60px);
    opacity: 0;
  }
}

@keyframes warningPulse {
  0%,
  100% {
    border-color: #ff8800;
    box-shadow: 0 0 10px rgba(255, 136, 0, 0.3);
  }
  50% {
    border-color: #ffaa44;
    box-shadow: 0 0 20px rgba(255, 136, 0, 0.6);
  }
}

/* Particle directions */
.particle:nth-child(1) {
  --random-x: 1;
  --random-y: -1;
}
.particle:nth-child(2) {
  --random-x: -1;
  --random-y: -1;
}
.particle:nth-child(3) {
  --random-x: 1;
  --random-y: 1;
}
.particle:nth-child(4) {
  --random-x: -1;
  --random-y: 1;
}
.particle:nth-child(5) {
  --random-x: 0;
  --random-y: -1.5;
}
.particle:nth-child(6) {
  --random-x: 0;
  --random-y: 1.5;
}

/* Responsive Design */
@media (max-width: 480px) {
  .status-bar {
    padding: 15px;
  }

  .level-display {
    font-size: 36px;
  }

  .game-column {
    width: 56px;
  }

  .number-block {
    width: 3rem;
    height: 3rem;
  }

  .block-number {
    font-size: 14px;
  }

  .large-next-block {
    width: 70px;
    height: 70px;
  }

  .large-number {
    font-size: 28px !important;
  }
}
</style>

<script setup lang="ts">
import { reactive, ref, onMounted, nextTick } from "vue";
import { IonIcon, IonButton } from "@ionic/vue";
import { addIcons } from "ionicons";
import { menuOutline } from "ionicons/icons";
addIcons({
  "menu-outline": menuOutline,
});
interface Block {
  value: number;
  id: string;
  merging?: boolean;
  mergeTarget?: boolean;
}

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

const columns = 5;
const maxHeight = 7;
const grid = reactive<Block[][]>(Array.from({ length: columns }, () => []));
const score = ref(0);
const bestScore = ref(0);
const gameOver = ref(false);
const nextBlockValue = ref(2);
const gems = ref(0);
const mergeIndicators = reactive<MergeIndicator[]>([]);
const powerUps = reactive<PowerUps>({ hammer: 150, swap: 175, undo: 75 });
const highestTile = ref(2);

let indicatorId = 1;
let uuidCounterFallback = 1;

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
  tryUpdateHighestTile(value);
  return { value, id: generateUUID() };
}

function tryUpdateHighestTile(val: number) {
  if (val > highestTile.value) highestTile.value = val;
}

// --- Lifecycle ---
onMounted(() => {
  const saved = localStorage.getItem("numberMergeBestScore");
  if (saved) bestScore.value = parseInt(saved, 10);
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

  nextBlockValue.value = chosen;
}

// --- Game Logic ---
function isColumnFull(columnIndex: number) {
  return grid[columnIndex].length >= maxHeight;
}

function checkGameOver() {
  if (grid.some((c) => c.length < maxHeight)) return false;
  for (let c = 0; c < columns; c++) {
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
  return true;
}

function resetGame() {
  grid.forEach((c) => c.splice(0, c.length));
  score.value = 0;
  gameOver.value = false;
  mergeIndicators.splice(0, mergeIndicators.length);
  highestTile.value = 2;
  generateNextBlock();
}

function updateBestScore() {
  if (score.value > bestScore.value) {
    bestScore.value = score.value;
    localStorage.setItem("numberMergeBestScore", bestScore.value.toString());
  }
}

function usePowerUp(type: keyof PowerUps) {
  if (powerUps[type] <= 0) return;
  powerUps[type]--;
  console.log(`Used ${type}`);
}

// --- Merge Helpers ---
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

async function addMergeIndicator(col: number, row: number, value: number) {
  await nextTick();
  const colEls = Array.from(
    document.querySelectorAll(".game-column")
  ) as HTMLElement[];
  const colEl = colEls[col];
  if (!colEl) return;

  const blockEls = Array.from(
    colEl.querySelectorAll(".number-block")
  ) as HTMLElement[];
  let x = 0,
    y = 0;
  if (blockEls[row]) {
    const rect = blockEls[row].getBoundingClientRect();
    x = rect.left + rect.width / 2;
    y = rect.top + rect.height / 2;
  } else {
    const crect = colEl.getBoundingClientRect();
    x = crect.left + crect.width / 2;
    y = crect.bottom - 30;
  }
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

// --- Merge Algorithm (Queue-based) ---
async function mergeConnectedBlocks(targetColumn: number, done?: () => void) {
  const visited = new Set<string>();
  const toMerge: { positions: Position[]; base: number }[] = [];

  for (let c = 0; c < columns; c++) {
    for (let r = 0; r < grid[c].length; r++) {
      const key = `${c},${r}`;
      if (visited.has(key)) continue;
      const connected = findConnectedBlocks(c, r);
      connected.forEach((p) => visited.add(`${p.col},${p.row}`));
      if (connected.length >= 2) {
        toMerge.push({ positions: connected, base: grid[c][r].value });
      }
    }
  }

  if (toMerge.length === 0) {
    if (done) done();
    return;
  }

  for (const group of toMerge) {
    const k = group.positions.length;
    const newValue = group.base * Math.pow(2, k - 1);
    score.value += newValue;

    await addMergeIndicator(targetColumn, grid[targetColumn].length, newValue);

    // Remove merged blocks
    group.positions
      .slice()
      .sort((a, b) => b.row - a.row)
      .forEach((p) => {
        if (grid[p.col] && grid[p.col][p.row]) grid[p.col].splice(p.row, 1);
      });

    // Add new block
    grid[targetColumn].push(createBlock(newValue));
  }

  // Recurse until no more merges
  await nextTick();
  mergeConnectedBlocks(targetColumn, done);
}

async function shootBlock(columnIndex: number) {
  if (isColumnFull(columnIndex) || gameOver.value) {
    if (gameOver.value) return;
    if (grid[columnIndex][6].value != nextBlockValue.value) return;
  }
  grid[columnIndex].push(createBlock(nextBlockValue.value));

  await nextTick();
  mergeConnectedBlocks(columnIndex, async () => {
    generateNextBlock();
    await nextTick();
    if (checkGameOver()) {
      gameOver.value = true;
      updateBestScore();
    }
  });
}
</script>

<!-- async function mergeConnectedBlocks() {
    // Clear any existing animation states first
    clearAllAnimationStates();
  
    const visited = new Set<string>();
    const toMerge: { positions: Position[]; base: number }[] = [];
  
    for (let c = 0; c < columns; c++) {
      for (let r = 0; r < grid[c].length; r++) {
        const key = `${c},${r}`;
        if (visited.has(key)) continue;
        const connected = findConnectedBlocks(c, r);
        connected.forEach((p) => visited.add(`${p.col},${p.row}`));
        if (connected.length >= 2) {
          toMerge.push({ positions: connected, base: grid[c][r].value });
        }
      }
    }
  
    if (toMerge.length === 0) {
      return;
    }
  
    // Process each merge group
    for (const group of toMerge) {
      // Create liquid connections between merging blocks
      for (let i = 0; i < group.positions.length - 1; i++) {
        await createLiquidConnection(group.positions[i], group.positions[i + 1]);
      }
  
      // Apply liquid animations
      group.positions.forEach((pos, index) => {
        const block = grid[pos.col][pos.row];
        if (block) {
          if (index === 0) {
            block.liquidMerging = true;
          } else {
            block.liquidAbsorbing = true;
          }
        }
      });
  
      const k = group.positions.length;
      const newValue = group.base * Math.pow(2, k - 1);
      score.value += newValue;
  
      // FIXED: Find the position where the merged block should stay
      // Use the position with the highest row number (lowest in the column)
      const keepPosition = group.positions.reduce((lowest, current) => {
        return current.row > lowest.row ? current : lowest;
      });
  
      await addMergeIndicator(keepPosition.col, keepPosition.row, newValue);
  
      // Wait for liquid animation to play
      await new Promise((resolve) => setTimeout(resolve, 400));
  
      // FIXED: Instead of removing all blocks and adding to bottom,
      // replace the "keep" position with the new block and remove others
  
      // First, create the new merged block
      const newBlock = createBlock(newValue);
  
      // Replace the block at the keep position
      grid[keepPosition.col][keepPosition.row] = newBlock;
  
      // Remove all other blocks in the merge group (except the keep position)
      // Sort positions by row descending to avoid index shifting issues
      const positionsToRemove = group.positions
        .filter(
          (pos) => !(pos.col === keepPosition.col && pos.row === keepPosition.row)
        )
        .sort((a, b) => b.row - a.row);
  
      for (const pos of positionsToRemove) {
        if (grid[pos.col] && grid[pos.col][pos.row]) {
          // Clear animation states before removing
          const block = grid[pos.col][pos.row];
          block.liquidMerging = false;
          block.liquidAbsorbing = false;
          block.liquidStretching = false;
          grid[pos.col].splice(pos.row, 1);
        }
      }
  
      // FIXED: After removing blocks, we need to let blocks above fall down
      // This will maintain the correct positions while allowing gravity
      await nextTick();
      applyGravity();
    }
  
    // Wait for animations to complete before checking for more merges
    await new Promise((resolve) => setTimeout(resolve, 600));
  
    // Recurse until no more merges
    await nextTick();
    await mergeConnectedBlocks();
  }
  
  // Add this helper function to handle gravity after merges
  function applyGravity() {
    for (let c = 0; c < columns; c++) {
      // Remove any undefined/null blocks that might have been created
      grid[c] = grid[c].filter((block) => block != null);
  
      // Blocks naturally fall down due to array structure - no additional work needed
      // The array index represents the row, so removing elements automatically
      // makes blocks above "fall down" to fill the gaps
    }
  }
  
  // Update shootBlock to handle the initial placement better
  async function shootBlock(columnIndex: number) {
    if (isColumnFull(columnIndex) || gameOver.value) {
      if (gameOver.value) return;
      if (grid[columnIndex][6].value != nextBlockValue.value) return;
    }
  
    // Add the new block to the column (it will be at the "top" of the stack)
    grid[columnIndex].push(createBlock(nextBlockValue.value));
  
    generateNextBlock();
    await nextTick();
  
    // Start the merge process
    await mergeConnectedBlocks();
  
    await nextTick();
    if (checkGameOver()) {
      gameOver.value = true;
      updateBestScore();
    }
  } -->
