<template>
  <div class="app">
    <div class="header">
      <h1>2048</h1>
    </div>
    <div class="game-screen">
      <div
        v-for="(column, colIndx) in grid"
        :key="colIndx"
        class="column"
        @click="shootBlock(colIndx)"
      ></div>
    </div>
    <div class="footer"></div>
  </div>
</template>

<script setup lang="ts">
interface Block {
  value: number;
  color: string;
  id: number;
  merging?: boolean;
  mergeTarget?: boolean;
}
interface Position {
  row: number;
  col: number;
}
interface MergeIndicator {
  id: number;
  value: number;
  x: number;
  y: number;
  color: string;
}

const columns = 5;
const maxRows = 8;
const grid = reactive<Block[][]>(Array.from({ length: columns }, () => []));

const nextBlock = ref(2);

let nextId = 0;

function shootBlock(columnIndx: number) {
  alert(`Block Shoot at ${columnIndx}`);

  const column = grid[columnIndx];

  // add a block to the bottom of the column
  column.push({ value: nextBlock.value, id: nextId++ });
}
</script>
<style>
.app {
  max-height: 100vh;
}
.header {
  height: 8vh;
  background-color: lightblue;
}
.game-screen {
  display: flex;
  height: 60vh;
  background-color: lightgreen;
}
.footer {
  height: 32vh;
  background-color: rgb(202, 144, 238);
}

.column {
  height: 95%;
  width: 20%;
  background: yellow;
  border: 1px solid black;
  margin: 5px;
}
</style>

<!-- <script setup lang="ts">
import { reactive, ref, onMounted } from "vue";
// import { IonIcon } from "@ionic/vue"; // unused - remove or use
// import { Preferences } from "@capacitor/preferences"; // unused - remove or use

import { addIcons } from "ionicons";
import { menuOutline, menuSharp } from "ionicons/icons";

// register only the icons you use
addIcons({
  "menu-outline": menuOutline,
  "menu-sharp": menuSharp,
});

interface Block {
  value: number;
  id: string; // <- UUIDs are strings
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

const columns = 5;
const maxHeight = 7;
const grid = reactive<Block[][]>(Array.from({ length: columns }, () => []));
const score = ref(0);
const bestScore = ref(376); // Starting with the value from the image
const gameOver = ref(false);
const nextBlockValue = ref(2);
const gems = ref(0);
const mergeIndicators = reactive<MergeIndicator[]>([]);
const powerUps = reactive<PowerUps>({
  hammer: 150,
  swap: 175,
  undo: 75,
});

const highestTile = ref(2);

let indicatorId = 1;
let uuidCounterFallback = 1; // fallback if crypto.randomUUID missing

function generateUUID(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  // Fallback simple ID (not as good as UUID but unique enough for session)
  return `fallback-${Date.now()}-${uuidCounterFallback++}`;
}

function createBlock(value: number): Block {
  return { value, id: generateUUID() };
}

// Load best score from localStorage
onMounted(() => {
  const saved = localStorage.getItem("numberMergeBestScore");
  if (saved) {
    bestScore.value = parseInt(saved);
  }
  generateNextBlock();

  // Update highest tile after adding initial blocks
  updateHighestTile();
});

function updateHighestTile() {
  let max = 2; // minimum possible tile

  grid.forEach((column) => {
    column.forEach((block) => {
      if (block.value > max) {
        max = block.value;
      }
    });
  });

  highestTile.value = max;
}

function generateNextBlock() {
  const rand = Math.random();

  // Calculate the maximum allowed new block (¼ of highest tile)
  const maxAllowed = Math.max(2, Math.floor(highestTile.value / 4));

  // Find the largest power of 2 that doesn't exceed maxAllowed
  let maxAllowedPowerOf2 = 2;
  while (maxAllowedPowerOf2 * 2 <= maxAllowed) {
    maxAllowedPowerOf2 *= 2;
  }

  // Create array of valid power of 2 options
  const validOptions: number[] = [];
  let current = 2;
  while (current <= maxAllowedPowerOf2) {
    validOptions.push(current);
    current *= 2;
  }

  // Define probability distribution for new blocks
  let candidate: number;

  if (validOptions.length === 1) {
    // Only option is 2
    candidate = 2;
  } else if (validOptions.length === 2) {
    // Options are 2 and 4
    candidate = rand < 0.8 ? validOptions[0] : validOptions[1];
  } else {
    // Multiple options available
    if (rand < 0.6) {
      // 60% chance of smallest (2)
      candidate = validOptions[0];
    } else if (rand < 0.85) {
      // 25% chance of second smallest or middle option
      const midIndex = Math.max(1, Math.floor(validOptions.length / 2));
      candidate = validOptions[midIndex];
    } else {
      // 15% chance of largest allowed
      candidate = validOptions[validOptions.length - 1];
    }
  }

  nextBlockValue.value = candidate;

  console.log(
    `Highest tile: ${highestTile.value}, Valid options: [${validOptions.join(
      ", "
    )}], Generated: ${candidate}`
  );
}

function isColumnFull(columnIndex: number) {
  return grid[columnIndex].length >= maxHeight;
}

function checkGameOver() {
  // If any column has space, not over
  if (grid.some((col) => col.length < maxHeight)) return false;

  // All columns are full — check if any adjacent equal tiles exist (possible merges)
  for (let c = 0; c < columns; c++) {
    for (let r = 0; r < grid[c].length; r++) {
      const v = grid[c][r].value;
      // neighbors: left, right, up, down
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
          n.row < grid[n.col].length &&
          grid[n.col][n.row].value === v
        ) {
          // there's a possible merge
          return false;
        }
      }
    }
  }
  return true; // no moves and no space = game over
}

function resetGame() {
  grid.forEach((col) => col.splice(0, col.length));
  score.value = 0;
  gameOver.value = false;
  mergeIndicators.splice(0, mergeIndicators.length);
  highestTile.value = 2; // Reset highest tile
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

  // Add power-up logic here
  console.log(`Used ${type} power-up`);
  if (type === "hammer") {
    // select a block to remove
    // check if any blocks should merge after the removal
  } else if (type === "swap") {
    // select 2 blocks to swap
    // check if any blocks should merge after the swap
  } else if (type === "undo") {
    // unshoot last block
  }
}

interface Position {
  col: number;
  row: number;
}

function findConnectedBlocks(col: number, row: number): Position[] {
  const startBlock = grid[col][row];
  if (!startBlock) return [];

  const visited = new Set<string>();
  const connected: Position[] = [];
  const stack: Position[] = [{ col, row }];

  while (stack.length > 0) {
    const { col: c, row: r } = stack.pop()!;
    const key = `${c},${r}`;
    if (visited.has(key)) continue;
    visited.add(key);

    const block = grid[c][r];
    if (!block || block.value !== startBlock.value) continue;

    connected.push({ col: c, row: r });

    const neighbors: Position[] = [
      { col: c + 1, row: r },
      { col: c - 1, row: r },
      { col: c, row: r + 1 },
      { col: c, row: r - 1 },
    ];

    neighbors.forEach((n) => {
      if (
        n.col >= 0 &&
        n.col < columns &&
        n.row >= 0 &&
        n.row < grid[n.col].length
      ) {
        stack.push(n);
      }
    });
  }

  return connected;
}
// function addMergeIndicator(col: number, row: number, value: number) {
//   const gameArea = document.querySelector(".game-area");
//   const rect = gameArea?.getBoundingClientRect();

//   if (rect) {
//     const x = rect.left + col * 68 + 34;
//     const y = rect.top + 50 + row * 52; // Adjusted for top positioning

//     const indicator: MergeIndicator = {
//       id: indicatorId++,
//       value,
//       x,
//       y,
//       color: value >= 100 ? "#ffd700" : value >= 50 ? "#ff6b6b" : "#4ecdc4",
//     };

//     mergeIndicators.push(indicator);

//     setTimeout(() => {
//       const index = mergeIndicators.findIndex((i) => i.id === indicator.id);
//       if (index > -1) mergeIndicators.splice(index, 1);
//     }, 2000);
//   }
// }
// Helper: remove a block at position and return it
function removeBlockAt(col: number, row: number) {
  const removed = grid[col].splice(row, 1)[0];
  return removed;
}

// function mergeConnectedBlocks(targetColumn?: number) {
//   const processed = new Set<string>();
//   let mergedAny = false;

//   for (let col = 0; col < columns; col++) {
//     for (let row = 0; row < grid[col].length; row++) {
//       const block = grid[col][row];
//       if (!block) continue;
//       const key = `${col},${row}`;
//       if (processed.has(key)) continue;

//       const connected = findConnectedBlocks(col, row);

//       if (connected.length >= 2) {
//         mergedAny = true;

//         connected.forEach((pos, index) => {
//           const b = grid[pos.col][pos.row];
//           if (b) {
//             b.merging = true;
//             if (index === 0) b.mergeTarget = true;
//           }
//         });

//         // use the original block value from the starting position
//         const baseValue = block.value;
//         let totalValue = baseValue * connected.length;
//         if (connected.length > 2) {
//           totalValue += baseValue;
//         }

//         score.value += totalValue;

//         const targetPos =
//           targetColumn !== undefined
//             ? { col: targetColumn, row: grid[targetColumn].length }
//             : connected[0];
//         addMergeIndicator(targetPos.col, targetPos.row, totalValue);

//         setTimeout(() => {
//           // Sort from bottom to top to avoid index shifting issues
//           connected
//             .sort((a, b) => b.row - a.row)
//             .forEach((pos) => {
//               grid[pos.col].splice(pos.row, 1);
//             });

//           const dropCol =
//             targetColumn !== undefined ? targetColumn : connected[0].col;

//           // Add new merged block at the end (will be positioned at bottom of existing blocks)
//           grid[dropCol].push(createBlock(totalValue));

//           // Update highest tile after creating merged block
//           updateHighestTile();

//           setTimeout(() => mergeConnectedBlocks(targetColumn), 100);
//         }, 600);
//       }

//       connected.forEach((pos) => processed.add(`${pos.col},${pos.row}`));
//     }
//   }

//   if (!mergedAny) {
//     grid.forEach((column) => {
//       column.forEach((b) => {
//         b.merging = false;
//         b.mergeTarget = false;
//       });
//     });
//   }
// }

// function shootBlock(columnIndex: number) {
//   if (isColumnFull(columnIndex) || gameOver.value) return;

//   const column = grid[columnIndex];
//   // Add new block at the end of the array (will appear at bottom of column)
//   column.push(createBlock(nextBlockValue.value));

//   setTimeout(() => mergeConnectedBlocks(columnIndex), 100);

//   generateNextBlock();

//   setTimeout(() => {
//     if (checkGameOver()) {
//       gameOver.value = true;
//       updateBestScore();
//     }
//   }, 1500);
// }

function addMergeIndicator(col: number, row: number, value: number) {
  // Find the column element and its block elements to compute exact coords
  const colEls = Array.from(
    document.querySelectorAll(".game-column")
  ) as HTMLElement[];
  const colEl = colEls[col];
  if (!colEl) return;

  const blockEls = Array.from(
    colEl.querySelectorAll(".number-block")
  ) as HTMLElement[];

  let x = 0;
  let y = 0;

  // Prefer the exact block element position if it exists
  if (blockEls[row]) {
    const rect = blockEls[row].getBoundingClientRect();
    x = rect.left + rect.width / 2;
    y = rect.top + rect.height / 2;
  } else {
    // fallback: center of column, near bottom (for targetColumn cases)
    const colRect = colEl.getBoundingClientRect();
    x = colRect.left + colRect.width / 2;
    // place near bottom of column (adjust offset as needed)
    y = colRect.bottom - 30;
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
    const index = mergeIndicators.findIndex((i) => i.id === indicator.id);
    if (index > -1) mergeIndicators.splice(index, 1);
  }, 2000);
}

function mergeConnectedBlocks(targetColumn: number, done?: () => void) {
  let mergedAny = false;

  do {
    mergedAny = false;
    for (let col = 0; col < columns; col++) {
      for (let row = 0; row < grid[col].length; row++) {
        const connected = findConnectedBlocks(col, row);
        if (connected.length >= 2) {
          const base = grid[col][row].value;
          const newValue = base * Math.pow(2, connected.length - 1);
          score.value += newValue;

          connected
            .sort((a, b) => b.row - a.row)
            .forEach((pos) => {
              grid[pos.col].splice(pos.row, 1);
            });

          grid[targetColumn].push(createBlock(newValue));
          updateHighestTile();
          mergedAny = true;
        }
      }
    }
  } while (mergedAny);

  if (done) done();
}

function shootBlock(columnIndex: number) {
  if (isColumnFull(columnIndex) || gameOver.value) return;

  const column = grid[columnIndex];
  column.push(createBlock(nextBlockValue.value));

  // ✅ force all merges to resolve into the shot column
  setTimeout(() => mergeConnectedBlocks(columnIndex), 100);

  generateNextBlock();

  setTimeout(() => {
    if (checkGameOver()) {
      gameOver.value = true;
      updateBestScore();
    }
  }, 1500);
}
</script> -->

<!-- <script setup lang="ts">
import { reactive, ref, onMounted, nextTick } from "vue";

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

function generateUUID(): string {
  if (typeof crypto !== "undefined" && typeof (crypto as any).randomUUID === "function") {
    return (crypto as any).randomUUID();
  }
  return `fallback-${Date.now()}-${uuidCounterFallback++}`;
}

function createBlock(value: number): Block {
  return { value, id: generateUUID() };
}

onMounted(() => {
  const saved = localStorage.getItem("numberMergeBestScore");
  if (saved) bestScore.value = parseInt(saved, 10);
  generateNextBlock();
  updateHighestTile();
});

function updateHighestTile() {
  let max = 2;
  grid.forEach((column) => column.forEach((b) => (max = Math.max(max, b.value))));
  highestTile.value = max;
}

// Generate next block with probabilities that scale with highestTile
function generateNextBlock() {
  // Determine an upper bound (allow values up to highestTile / 2, at least 2)
  const maxAllowed = Math.max(2, Math.floor(highestTile.value / 2));

  // Build list of powers of two up to maxAllowed
  const options: number[] = [];
  let p = 2;
  while (p <= maxAllowed) {
    options.push(p);
    p *= 2;
    // safety guard
    if (p > 1 << 20) break;
  }

  // Ensure at least [2]
  if (options.length === 0) options.push(2);

  // Weighted selection: favor smaller values but allow larger ones based on highestTile
  // If only 1 option, pick it
  const rand = Math.random();
  let chosen = options[0];

  if (options.length === 1) {
    chosen = options[0];
  } else if (options.length === 2) {
    // 70% small, 25% medium, 5% large (which here is the second option)
    chosen = rand < 0.75 ? options[0] : options[1];
  } else {
    // Many options. Make distribution that slightly favors the smallest but progressively allows bigger ones.
    // We'll make bins: 60% for smallest, 25% for second, remainder split among the rest.
    if (rand < 0.6) chosen = options[0];
    else if (rand < 0.85) chosen = options[1];
    else {
      // pick uniformly from options[2..end]
      const rest = options.slice(2);
      chosen = rest[Math.floor(Math.random() * rest.length)];
    }
  }

  // Safety: ensure chosen is a power of two
  if ((chosen & (chosen - 1)) !== 0) chosen = 2;

  nextBlockValue.value = chosen;
  // Debug
  // console.log(`generateNextBlock -> highest=${highestTile.value} options=${options} chosen=${chosen}`);
}

function isColumnFull(columnIndex: number) {
  return grid[columnIndex].length >= maxHeight;
}

function checkGameOver() {
  // if any column has space, not over
  if (grid.some((c) => c.length < maxHeight)) return false;

  // no space -> if any adjacent equal tiles exist, not over
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
        if (n.col >= 0 && n.col < columns && n.row >= 0 && n.row < grid[n.col].length) {
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

interface Position {
  col: number;
  row: number;
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
      if (n.col >= 0 && n.col < columns && n.row >= 0 && n.row < grid[n.col].length) stack.push(n);
    }
  }
  return out;
}

function addMergeIndicator(col: number, row: number, value: number) {
  // compute coordinates after nextTick so DOM is updated
  nextTick(() => {
    const colEls = Array.from(document.querySelectorAll(".game-column")) as HTMLElement[];
    const colEl = colEls[col];
    if (!colEl) return;
    const blockEls = Array.from(colEl.querySelectorAll(".number-block")) as HTMLElement[];
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
    const indicator: MergeIndicator = { id: indicatorId++, value, x, y, color: value >= 100 ? "#ffd700" : value >= 50 ? "#ff6b6b" : "#4ecdc4" };
    mergeIndicators.push(indicator);
    setTimeout(() => {
      const idx = mergeIndicators.findIndex((i) => i.id === indicator.id);
      if (idx > -1) mergeIndicators.splice(idx, 1);
    }, 1600);
  });
}

// Merge algorithm that *forces* the resulting merged block to be placed into the shot column
function mergeConnectedBlocks(targetColumn: number, done?: () => void) {
  // We'll run passes until nothing merges in a full sweep
  let anyMerged = false;
  do {
    anyMerged = false;
    const processed = new Set<string>();

    for (let c = 0; c < columns; c++) {
      for (let r = 0; r < grid[c].length; r++) {
        const key = `${c},${r}`;
        if (processed.has(key)) continue;
        const connected = findConnectedBlocks(c, r);
        connected.forEach((p) => processed.add(`${p.col},${p.row}`));
        if (connected.length >= 2) {
          anyMerged = true;

          // Visual: mark merging blocks briefly
          connected.forEach((p, i) => {
            const b = grid[p.col][p.row];
            if (b) {
              b.merging = true;
              b.mergeTarget = i === 0;
            }
          });

          // compute resulting value: treat merges as exponential (pairwise)
          const base = grid[c][r].value;
          const k = connected.length;
          const newValue = base * Math.pow(2, k - 1); // e.g., 2 tiles -> base*2, 3 tiles -> base*4, etc.

          // score update
          score.value += newValue;

          // show indicator on the target column (place near bottom)
          addMergeIndicator(targetColumn, grid[targetColumn].length, newValue);

          // remove connected blocks from grid (sort by row desc to avoid index shifting)
          connected
            .slice()
            .sort((a, b) => b.row - a.row)
            .forEach((p) => {
              if (grid[p.col] && grid[p.col][p.row]) grid[p.col].splice(p.row, 1);
            });

          // place merged block at the bottom of the target column
          grid[targetColumn].push(createBlock(newValue));

          // update highest tile now that new block exists
          updateHighestTile();

          // break early so DOM updates and we re-run sweep (keeps animation predictable)
          // but continue outer loops after DOM settle by using nextTick in calling code if needed
        }
      }
    }
  } while (anyMerged);

  if (done) done();
}

function shootBlock(columnIndex: number) {
  if (isColumnFull(columnIndex) || gameOver.value) return;

  // place the block into chosen column (bottom)
  grid[columnIndex].push(createBlock(nextBlockValue.value));

  // after placing, compute merges that are forced to end up in the shot column
  // small timeout to allow the block "drop" animation to render (feel free to adjust)
  setTimeout(() => {
    mergeConnectedBlocks(columnIndex, () => {
      // after merges, regenerate next block based on the updated highest tile
      updateHighestTile();
      generateNextBlock();

      // check game over after merges resolve
      setTimeout(() => {
        if (checkGameOver()) {
          gameOver.value = true;
          updateBestScore();
        }
      }, 200);
    });
  }, 120);
}
</script> -->

<!-- <style scoped>
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
</style> -->
