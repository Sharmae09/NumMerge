<template>
  <div class="overflow-hidden">
    <ion-content class="game-content">
      <!-- Game Over Modal -->
      <ion-modal :is-open="gameOver" @didDismiss="gameOver = false">
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
            @click="shootBlock(colIndex)"
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
                },
              ]"
              :style="{
                top: `${blockIndex * 60 + 12}px`,
              }"
            >
              <span class="block-number">{{ block.value }}</span>

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

        <!-- Liquid connection effects overlay -->
      </ion-grid>

      <!-- Bottom Section -->
      <div class="bottom-section">
        <!-- Large Next Block Display -->
        <div class="flex">
          <div
            class="large-next-block number-block"
            :class="`block-${nextBlock}`"
          >
            <span class="block-number large-number">{{ nextBlock }}</span>
          </div>
        </div>

        <!-- Power-ups Section -->
        <div class="powerups-section">
          <div class="powerup-item" @click="activatePowerUp('hammer')">
            <div class="powerup-icon">🔨</div>
            <div class="powerup-count">{{ powerUpCosts.hammer }}</div>
          </div>

          <div class="powerup-item" @click="activatePowerUp('swap')">
            <div class="powerup-icon">🔄</div>
            <div class="powerup-count">{{ powerUpCosts.swap }}</div>
          </div>

          <div class="powerup-item" @click="activatePowerUp('undo')">
            <div class="powerup-icon">⚡</div>
            <div class="powerup-count">{{ powerUpCosts.undo }}</div>
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

<style scoped></style>

<script setup lang="ts">
import { reactive, ref, onMounted, nextTick } from "vue";
import { addIcons } from "ionicons";
import { menuOutline } from "ionicons/icons";
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
/*Array of blocks in each column
    grid = [ [Block, Block], [Block], // column 0
    [], // column 1
    [Block, Block, Block],  //column 2
    [Block, Block] ] // column 3
  */
/* 
    Array.from({length: columns})
    creates an array with 'columns' number of empty arrays
  
    () = > [] - is what the array makes for each column
  
    reactive - lets vue trach the changes to the array like ref()
  
    Block - is based is the interface that defines a block
  
    [][] - means its a 2D array (array of arrays) 
  
  */
const grid = reactive<Block[][]>(Array.from({ length: columns }, () => []));
const score = ref(0);
const gameOver = ref(false);
const nextBlock = ref(2);

import { usePreferences } from "@/composables/usePreferences";

const { bestScore, gems, setBestScore, setBestBlock, bestBlock } =
  usePreferences();

/*
  mergeindicators - array of the floating +score indicators
  */
const mergeIndicators = reactive<MergeIndicator[]>([]);
// array of the liquid connections between blocks
const liquidConnections = reactive<LiquidConnection[]>([]);
const powerUps = reactive<PowerUps>({ hammer: 35, swap: 45, undo: 30 });
const highestTile = ref(2);

// IDs for indicators and connections
let indicatorId = 1;
let connectionId = 1;
// Fallback counter for UUID generation
let uuidCounterFallback = 1;

// --- Utility ---
// Gunereate UUID for blocks which helps the id to be unique
function generateUUID(): string {
  if (
    // check if crypto.randomUUID is available (modern browsers)
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
  // if the value of the generated block is higher than the current
  // highest block value then update the highest block value
  if (value > highestTile.value) highestTile.value = value;
}

// --- Lifecycle ---
onMounted(() => {
  // Load best score from localStorage if available
  if (process.client) {
    const saved = localStorage.getItem("numberMergeBestScore");
    if (saved) bestScore.value = parseInt(saved, 10);
  }
  generateNextBlock();
});

// --- Weighted Random ---
function weightedChoice<T>(items: T[], weights: number[]): T {
  // Gneric <T> means it can be any type
  // items - array of items to choose from
  // weights - array of weights corresponding to the items [0.70, 0.20, 10]
  const sum = weights.reduce((a, b) => a + b, 0);
  // get sum of the weights
  let r = Math.random() * sum;
  // get a random number between 0 and sum of weights
  for (let i = 0; i < items.length; i++) {
    // loop through the items
    // subtract the weight from the random number
    // if its less than or equal to 0 then return the item
    if ((r -= weights[i]) <= 0) return items[i];
  }
  // fallback in case of rounding errors
  // then return the last item
  return items[items.length - 1];
}

function generateNextBlock() {
  // determine the max allowed value for the next block
  // which is half of the highest tile value
  const maxAllowed = Math.max(2, Math.floor(highestTile.value / 2));
  // generate options which are powers of 2 up to maxAllowed
  const options: number[] = [];
  // generate powers of 2 up to maxAllowed
  // then put them in the options array
  for (let p = 2; p <= maxAllowed; p *= 2) options.push(p);
  // if no option is generated then put the value 2 in the options
  if (options.length === 0) options.push(2);

  let chosen: number;
  // like let chosen = 0

  // if there is only one option then choose it
  if (options.length === 1) chosen = options[0];
  // if there are two options then choose the first one with 75% chance
  else if (options.length === 2) chosen = weightedChoice(options, [0.75, 0.25]);
  // if there is more than one option the choose the first one with 60% chance
  else {
    const restWeight = 0.15;
    chosen = weightedChoice(options, [
      0.6, // 60% chance for the smallest option
      0.25, // 30% chance for the second smallest option
      ...Array(options.length - 2) // rest of the options //[0.05, 0.05, 0.05]
        .fill(restWeight / (options.length - 2)), // evenly distribute the rest weight
    ]);
  }

  nextBlock.value = chosen;
}

// --- Game Logic ---
function isColumnFull(columnIndex: number) {
  return grid[columnIndex].length >= maxHeight;
}
// check if game over
// if all the columns are full then game over
// and the next block does not mathch any of the bottom blocks in the columns

function checkGameOver() {
  // if there is at least one column that is not full then not game over
  if (grid.some((c) => c.length < maxHeight)) return false;
  // if all columns are full then check if there are any possible merges
  for (let c = 0; c < columns; c++) {
    if (grid[c][maxHeight - 1].value === nextBlock.value) return false;
    // loop through each column
    for (let r = 0; r < grid[c].length; r++) {
      // loop through each row in the column
      const v = grid[c][r].value;
      // get the value of the block
      // check the neighbors (left, right, up, down)
      const neighbors = [
        { col: c - 1, row: r },
        { col: c + 1, row: r },
        { col: c, row: r - 1 },
        { col: c, row: r + 1 },
      ];
      // loop through the neighbours
      for (const n of neighbors) {
        // if the neighbour is within bounds
        // and has the same value as the current block
        // then not game over
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
  gameOver.value = false;
  mergeIndicators.splice(0, mergeIndicators.length);
  liquidConnections.splice(0, liquidConnections.length);
  highestTile.value = 2;
  generateNextBlock();
}

function updateBestScore() {
  if (score.value > bestScore.value) {
    bestScore.value = score.value;
    if (process.client) {
      localStorage.setItem("numberMergeBestScore", bestScore.value.toString());
    }
  }
}

// function activatePowerUp(type: keyof PowerUps) {
//   if (powerUps[type] <= 0) return;
//   powerUps[type]--;
//   console.log(`Used ${type}`);
// }

const activePowerUp = ref<keyof PowerUps | null>(null);
const swapSelection = reactive<{ first?: Position; second?: Position }>({});

// --- State for Undo ---
const history = reactive<
  { grid: Block[][]; score: number; nextBlock: number }[]
>([]);

// Save snapshot before each move
function saveHistory() {
  const snapshot = {
    grid: grid.map((col) => col.map((b) => ({ ...b }))),
    score: score.value,
    nextBlock: nextBlock.value,
  };
  history.splice(3, history.length, snapshot); // keep memory in check
}

function undoMove() {
  if (history.length === 0) {
    alert("No moves to undo!");
    return;
  }
  const last = history.pop()!;
  grid.forEach((col, i) => {
    col.splice(0, col.length, ...last.grid[i]);
  });
  score.value = last.score;
  nextBlock.value = last.nextBlock;
}

// --- Power-up Costs ---
const powerUpCosts: Record<keyof PowerUps, number> = {
  hammer: 35,
  swap: 45,
  undo: 30,
};

// --- Main handler with gem check ---
function activatePowerUp(type: keyof PowerUps, ...args: any[]) {
  if (gems.value < powerUpCosts[type]) {
    alert("Not enough gems!");
    return;
  }

  // Deduct gems and apply effect
  gems.value -= powerUpCosts[type];

  if (type === "hammer") {
    useHammer(args[0], args[1]); // col, row
  } else if (type === "swap") {
    useSwap(args[0], args[1], args[2], args[3]); // col1,row1,col2,row2
  } else if (type === "undo") {
    undoMove();
  }

  activePowerUp.value = type;
}

// --- Hammer: remove a block ---
async function useHammer(col: number, row: number) {
  if (!grid[col] || !grid[col][row]) return;

  saveHistory();
  grid[col].splice(row, 1); // remove block
  await nextTick();

  // let gravity happen (blocks above fall naturally because of array shift)
  await mergeConnectedBlocks();
}

// --- Swap: swap two blocks ---
async function useSwap(c1: number, r1: number, c2: number, r2: number) {
  if (!grid[c1]?.[r1] || !grid[c2]?.[r2]) return;

  saveHistory();
  const temp = grid[c1][r1];
  grid[c1][r1] = grid[c2][r2];
  grid[c2][r2] = temp;

  await nextTick();
  await mergeConnectedBlocks();
}

async function onBlockClick(col: number, row: number) {
  if (activePowerUp.value === "hammer") {
    gems.value -= powerUpCosts.hammer;
    await useHammer(col, row);
    activePowerUp.value = null; // reset
    return;
  }

  if (activePowerUp.value === "swap") {
    if (!swapSelection.first) {
      // first selection
      swapSelection.first = { col, row };
    } else {
      // second selection
      swapSelection.second = { col, row };
      gems.value -= powerUpCosts.swap;
      await useSwap(
        swapSelection.first.col,
        swapSelection.first.row,
        swapSelection.second.col,
        swapSelection.second.row
      );
      swapSelection.first = undefined;
      swapSelection.second = undefined;
      activePowerUp.value = null; // reset
    }
    return;
  }

  // no powerup -> normal shoot
  shootBlock(col);
}

async function addMergeIndicator(col: number, row: number, value: number) {
  // waits for dom to update first
  await nextTick();
  // get all the columns with the class game-column
  // then index into the array col
  const colEl = document.querySelectorAll<HTMLElement>(".game-column")[col];
  if (!colEl) return;

  // get all the blocks in the column
  const blockEls = Array.from(
    colEl.querySelectorAll(".number-block")
  ) as HTMLElement[];

  // if the row exists then get its position
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

  // create the indicator
  const indicator: MergeIndicator = {
    id: indicatorId++,
    value,
    x,
    y,
    color: value >= 100 ? "#ffd700" : value >= 50 ? "#ff6b6b" : "#4ecdc4",
  };

  mergeIndicators.push(indicator);

  // remove the indicator after the animation is done (1.6s)
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
  // start with the position of the block we are checking
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

async function shootBlock(columnIndex: number) {
  saveHistory();

  if (isColumnFull(columnIndex) || gameOver.value) {
    if (gameOver.value) return;
    if (grid[columnIndex][6].value != nextBlock.value) return;
  }

  // Add the new block to the column
  grid[columnIndex].push(createBlock(nextBlock.value));

  generateNextBlock();
  await nextTick();

  // Start the merge process with the target column specified
  await mergeConnectedBlocks(columnIndex);

  await nextTick();
  if (checkGameOver()) {
    gameOver.value = true;
    updateBestScore();
  }
}
async function mergeConnectedBlocks(targetColumn?: number) {
  // Reset visual state
  clearAllAnimationStates();

  // We'll treat the first loop specially if we have a shot column
  // this is first merge after shooting a block
  // if targetColumn is defined, it's the column where the block was shot
  let isFirstMerge = targetColumn !== undefined;

  // target column is the col where the block was shot
  // shotPos helps prioritize merges involving the shot block
  // if this is the first merge after shooting
  // then we note the position of the shot block
  // else undefined
  const shotPos = isFirstMerge
    ? { col: targetColumn!, row: grid[targetColumn!].length - 1 }
    : undefined;

  // Process merges one-by-one until there are none left
  while (true) {
    // Build list of current merge groups (connected components with length >= 2)
    const visited = new Set<string>();
    // array of groups to merge, each with their positions, base value, and max row for prioritization
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

    // Nothing to merge -> exit
    if (groups.length === 0) break;

    // Choose ONE group to process now (step-by-step)
    // Priority: first merge -> group that contains the shot block (if any)
    // Fallback: pick the bottom-most group (highest maxRow), deterministic tie-breaker included
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
        if (b.maxRow !== a.maxRow) return b.maxRow - a.maxRow; // bottom-most first
        // tie-breaker: choose group with smaller leftmost column (deterministic)
        const leftA = Math.min(...a.positions.map((p) => p.col));
        const leftB = Math.min(...b.positions.map((p) => p.col));
        return leftA - leftB;
      });
      groupToProcess = groups[0];
    }

    // SAFETY: if we somehow didn't get a group, bail out
    if (!groupToProcess) break;

    // Apply visual flags to the involved blocks
    groupToProcess.positions.forEach((pos, index) => {
      const block = grid[pos.col][pos.row];
      if (!block) return;
      block.liquidMerging = index === 0;
      block.liquidAbsorbing = index !== 0;
    });

    // Compute merged value & award score
    const k = groupToProcess.positions.length;
    const newValue = groupToProcess.base * Math.pow(2, k - 1);
    score.value += newValue;

    // Determine which column the merged block should fall into:
    // Rule: If shot column has blocks in this merge (even in chain reactions), use shot column
    // Otherwise, the falling block (topmost/highest row) absorbs → merged block at falling block position
    let primaryCol: number;
    let mergeRow: number;

    // Check if any block in the shot column is part of this merge
    const shotColInMerge =
      targetColumn !== undefined &&
      groupToProcess.positions.some((p) => p.col === targetColumn);

    if (shotColInMerge) {
      // Merge involves shot column: merged block stays in shot column
      primaryCol = targetColumn!;
      // Find the topmost block in the shot column that's part of the merge
      const shotColBlocks = groupToProcess.positions.filter(
        (p) => p.col === targetColumn
      );
      mergeRow = Math.min(...shotColBlocks.map((p) => p.row));
    } else {
      // Falling block absorbs: find the topmost block (lowest row index = highest position)
      const fallingBlock = groupToProcess.positions.reduce((top, cur) =>
        cur.row < top.row ? cur : top
      );
      primaryCol = fallingBlock.col;
      mergeRow = fallingBlock.row;
    }

    // Show merge indicator near the position where merge occurs
    await addMergeIndicator(primaryCol, mergeRow, newValue);

    // Wait for liquid animation to play
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Remove merged blocks safely:
    // Sort descending: remove larger row first within the same column to maintain indices
    const sortedPositions = groupToProcess.positions.slice().sort((a, b) => {
      if (a.col !== b.col) return b.col - a.col;
      return b.row - a.row;
    });

    // Track how many blocks we removed below mergeRow in primaryCol
    let removedBelowMerge = 0;
    for (const p of sortedPositions) {
      if (grid[p.col] && grid[p.col][p.row]) {
        const blk = grid[p.col][p.row];
        blk.liquidMerging = false;
        blk.liquidAbsorbing = false;
        blk.liquidStretching = false;

        // Track removals in primary column below merge position
        if (p.col === primaryCol && p.row < mergeRow) {
          removedBelowMerge++;
        }

        grid[p.col].splice(p.row, 1);
      }
    }

    // Adjust merge row position after removals
    const adjustedMergeRow = mergeRow - removedBelowMerge;

    // Create merged block and insert it at the correct position
    const newBlock = createBlock(newValue);
    tryUpdateHighestTile(newBlock.value);
    grid[primaryCol].splice(adjustedMergeRow, 0, newBlock); // Insert at lowest merge position

    // After first processed merge, no longer prioritize shot column
    isFirstMerge = false;

    // Small animation wait and allow DOM to update before next iteration
    await new Promise((resolve) => setTimeout(resolve, 250));
    await nextTick();

    // Loop continues and re-evaluates grid for further merges (chain reactions)
  } // end while
}
</script>
