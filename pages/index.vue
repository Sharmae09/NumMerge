<template>
  <ion-page>
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

      <!-- Game Grid -->
      <div class="grid-container">
        <div class="bg-black flex-col">
          <div class="flex score-details-menu">
            <div class="score-item">
              <div class="score-label">Score</div>
              <div class="score-value">{{ score }}</div>
            </div>
            <div class="score-item">
              <div class="score-label">Best</div>
              <div class="score-value">{{ bestScore }}</div>
            </div>
          </div>
          <div class="grid column-shoot-screen">
            <div
              v-for="(column, colIndex) in grid"
              :key="colIndex"
              class="column"
              :class="{
                'column-full': isColumnFull(colIndex),
                'column-hover': hoveredColumn === colIndex,
              }"
              @click="shootBlock(colIndex)"
              @mouseenter="hoveredColumn = colIndex"
              @mouseleave="hoveredColumn = -1"
            >
              <!-- Blocks in column (at top) -->
              <div
                v-for="(block, blockIndex) in column"
                :key="block.id"
                class="block"
                :class="[
                  `block-${block.value}`,
                  { merging: block.merging },
                  { 'merge-target': block.mergeTarget },
                ]"
                :style="{
                  animationDelay: `${blockIndex * 0.1}s`,
                  zIndex: block.merging ? 1000 : 1,
                }"
              >
                <span class="block-text">{{ block.value }}</span>
                <div class="block-shine"></div>

                <!-- Merge effect particles -->
                <div v-if="block.merging" class="merge-particles">
                  <div class="particle" v-for="i in 8" :key="i"></div>
                </div>
              </div>

              <!-- Spacer to push indicator and preview to bottom -->
              <div class="column-spacer"></div>

              <!-- Preview block when hovering at bottom -->
              <div
                v-if="hoveredColumn === colIndex && !isColumnFull(colIndex)"
                class="block preview-block bottom-preview"
                :class="`block-${nextBlockValue}`"
              >
                {{ nextBlockValue }}
              </div>

              <!-- Column indicator at bottom -->
              <div class="column-indicator">
                <ion-icon name="arrow-up-outline"></ion-icon>
              </div>
            </div>
          </div>
          <div class="flex items-center justify-center">
            <div class="next-block text-center">
              <div class="next-label">Next</div>
              <div
                class="block preview-block mx-auto"
                :class="`block-${nextBlockValue}`"
              >
                {{ nextBlockValue }}
              </div>
            </div>
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
  </ion-page>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted, computed } from "vue";
import { IonIcon } from "@ionic/vue";

interface Block {
  value: number;
  id: number;
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

const columns = 5;
const maxHeight = 8;
const grid = reactive<Block[][]>(Array.from({ length: columns }, () => []));
const score = ref(0);
const bestScore = ref(0);
const gameOver = ref(false);
const nextBlockValue = ref(2);
const hoveredColumn = ref(-1);
const mergeIndicators = reactive<MergeIndicator[]>([]);
let nextId = 1;
let indicatorId = 1;

// Load best score from localStorage
onMounted(() => {
  const saved = localStorage.getItem("numberMergeBestScore");
  if (saved) {
    bestScore.value = parseInt(saved);
  }
  generateNextBlock();
});

// Generate next block value
function generateNextBlock() {
  const rand = Math.random();
  if (rand < 0.7) nextBlockValue.value = 2;
  else if (rand < 0.9) nextBlockValue.value = 4;
  else nextBlockValue.value = 8;
}

// Check if column is full
function isColumnFull(columnIndex: number) {
  return grid[columnIndex].length >= maxHeight;
}

// Check if game is over
function checkGameOver() {
  return grid.every((column) => column.length >= maxHeight);
}

function resetGame() {
  grid.forEach((col) => col.splice(0, col.length));
  score.value = 0;
  gameOver.value = false;
  hoveredColumn.value = -1;
  mergeIndicators.splice(0, mergeIndicators.length);
  generateNextBlock();
}

// Update best score
function updateBestScore() {
  if (score.value > bestScore.value) {
    bestScore.value = score.value;
    localStorage.setItem("numberMergeBestScore", bestScore.value.toString());
  }
}

// Add floating score indicator
function addMergeIndicator(col: number, row: number, value: number) {
  const gridElement = document.querySelector(".grid-container");
  const rect = gridElement?.getBoundingClientRect();

  if (rect) {
    const x = rect.left + col * 73 + 35; // Approximate position
    const y = rect.top + 100 + (maxHeight - row) * 20; // Adjusted for upward shooting

    const indicator: MergeIndicator = {
      id: indicatorId++,
      value,
      x,
      y,
      color: value >= 100 ? "#ffd700" : value >= 50 ? "#ff6b6b" : "#4ecdc4",
    };

    mergeIndicators.push(indicator);

    // Remove indicator after animation
    setTimeout(() => {
      const index = mergeIndicators.findIndex((i) => i.id === indicator.id);
      if (index > -1) mergeIndicators.splice(index, 1);
    }, 2000);
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

    // Explore neighbors (up, down, left, right)
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

function mergeConnectedBlocks(targetColumn?: number) {
  const processed = new Set<string>();
  let mergedAny = false;

  for (let col = 0; col < columns; col++) {
    for (let row = 0; row < grid[col].length; row++) {
      const block = grid[col][row];
      if (!block) continue;
      const key = `${col},${row}`;
      if (processed.has(key)) continue;

      const connected = findConnectedBlocks(col, row);

      if (connected.length >= 2) {
        mergedAny = true;

        // Mark blocks as merging for animation
        connected.forEach((pos, index) => {
          const block = grid[pos.col][pos.row];
          if (block) {
            block.merging = true;
            // Mark the target block (where merged block will appear)
            if (index === 0) block.mergeTarget = true;
          }
        });

        // Calculate total value with bonus for 3+
        let totalValue = block.value * connected.length;
        if (connected.length > 2) {
          totalValue += block.value; // bonus
        }

        score.value += totalValue;

        // Show merge indicator at the target position
        const targetPos =
          targetColumn !== undefined
            ? { col: targetColumn, row: 0 }
            : connected[0];
        addMergeIndicator(targetPos.col, targetPos.row, totalValue);

        // Wait for merge animation, then remove blocks and add new one
        setTimeout(() => {
          // Remove all original blocks
          connected
            .sort((a, b) => b.row - a.row)
            .forEach((pos) => {
              grid[pos.col].splice(pos.row, 1);
            });

          // Decide column for the merged block - add at bottom for upward shooting
          const dropCol =
            targetColumn !== undefined ? targetColumn : connected[0].col;
          grid[dropCol].unshift({
            value: totalValue,
            id: nextId++,
          });

          // Continue checking for more merges after a delay
          setTimeout(() => mergeConnectedBlocks(targetColumn), 100);
        }, 800); // Wait for merge animation to complete
      }

      connected.forEach((pos) => processed.add(`${pos.col},${pos.row}`));
    }
  }

  // If no merges occurred, we're done
  if (!mergedAny) {
    // Clear any remaining merge states
    grid.forEach((column) => {
      column.forEach((block) => {
        block.merging = false;
        block.mergeTarget = false;
      });
    });
  }
}

function shootBlock(columnIndex: number) {
  if (isColumnFull(columnIndex) || gameOver.value) return;

  const column = grid[columnIndex];
  // Add block at the bottom of the column
  column.push({ value: nextBlockValue.value, id: nextId++ });

  // Start merge process after a short delay
  setTimeout(() => mergeConnectedBlocks(columnIndex), 200);

  generateNextBlock();

  // Check game over after all merges are complete
  setTimeout(() => {
    if (checkGameOver()) {
      gameOver.value = true;
      updateBestScore();
    }
  }, 2000);
}
</script>

<style scoped>
.game-content {
  position: relative;
}

.game-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  backdrop-filter: blur(10px);
}

.score-board {
  display: flex;
  gap: 20px;
}

.score-item {
  text-align: center;
}

.score-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  text-transform: uppercase;
  font-weight: bold;
  margin-bottom: 5px;
}

.score-value {
  font-size: 24px;
  font-weight: bold;
  color: white;
}

.next-block {
  display: flex;
  align-items: center;
  gap: 10px;
}

.next-label {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: bold;
}

.grid-container {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  position: relative;
}

.grid {
  display: flex;
  gap: 8px;
  background: rgba(0, 0, 0, 0.975);
  backdrop-filter: blur(10px);
}

.column {
  display: flex;
  flex-direction: column;
  gap: 5px;
  width: 65px;
  min-height: 400px;
  cursor: pointer;
  position: relative;
  padding: 10px 5px;
  border-radius: 15px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.column:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
}
/* When you hover to  */
.column-hover {
  border-color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.1);
}

.column-full {
  border-color: #ff6b6b;
  background: rgba(255, 107, 107, 0.1);
  cursor: not-allowed;
}

.column-spacer {
  flex: 1; /* This pushes the indicator and preview to the bottom */
}

.column-indicator {
  color: rgba(255, 255, 255, 0.6);
  font-size: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 30px;
  opacity: 0;
  transition: opacity 0.3s ease;
  margin-top: auto; /* Ensures it stays at bottom */
}

.column:hover .column-indicator {
  opacity: 1;
  animation: bounceUp 1s infinite;
}

.bottom-preview {
  margin-bottom: 5px; /* Small gap above the indicator */
}

.block {
  width: 55px;
  height: 55px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  border-radius: 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
  animation: shootUp 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Merge animations */
.block.merging {
  animation: mergeGlow 0.8s ease-in-out;
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.8), 0 4px 12px rgba(0, 0, 0, 0.15);
}

.block.merge-target {
  animation: mergeTarget 0.8s ease-in-out;
  transform: scale(1.2);
  z-index: 1000;
}

.merge-particles {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.particle {
  position: absolute;
  width: 4px;
  height: 4px;
  background: #ffd700;
  border-radius: 50%;
  animation: particleExplosion 0.8s ease-out forwards;
}

.particle:nth-child(1) {
  animation-delay: 0s;
}
.particle:nth-child(2) {
  animation-delay: 0.1s;
}
.particle:nth-child(3) {
  animation-delay: 0.2s;
}
.particle:nth-child(4) {
  animation-delay: 0.3s;
}
.particle:nth-child(5) {
  animation-delay: 0.1s;
}
.particle:nth-child(6) {
  animation-delay: 0.2s;
}
.particle:nth-child(7) {
  animation-delay: 0.3s;
}
.particle:nth-child(8) {
  animation-delay: 0.4s;
}

.merge-indicator {
  position: fixed;
  font-size: 24px;
  font-weight: bold;
  pointer-events: none;
  z-index: 2000;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  animation: floatUp 2s ease-out forwards;
}

.block-text {
  position: relative;
  z-index: 2;
  font-size: 16px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.block-shine {
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    45deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  transition: left 0.5s ease;
}

.block:hover .block-shine {
  left: 100%;
}

.preview-block {
  opacity: 0.6;
  animation: pulse 1s infinite;
  border: 2px dashed rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.1) !important;
}

/* Block colors */
.block-2 {
  background: linear-gradient(135deg, #eee4da, #ede0c8);
  color: #776e65;
}
.block-4 {
  background: linear-gradient(135deg, #ede0c8, #f2b179);
  color: #776e65;
}
.block-8 {
  background: linear-gradient(135deg, #f2b179, #f59563);
  color: #f9f6f2;
}
.block-16 {
  background: linear-gradient(135deg, #f59563, #f67c5f);
  color: #f9f6f2;
}
.block-32 {
  background: linear-gradient(135deg, #f67c5f, #f65e3b);
  color: #f9f6f2;
}
.block-64 {
  background: linear-gradient(135deg, #edcf72, #fdbf2d);
  color: #f9f6f2;
}
.block-128 {
  background: linear-gradient(135deg, #fdbf2d, #ffc649);
  color: #f9f6f2;
}
.block-256 {
  background: linear-gradient(135deg, #ffc649, #ffcc02);
  color: #f9f6f2;
}
.block-512 {
  background: linear-gradient(135deg, #ffcc02, #ffd700);
  color: #f9f6f2;
}
.block-1024 {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  color: #f9f6f2;
  font-size: 14px;
}
.block-2048 {
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
  color: #f9f6f2;
  font-size: 14px;
}

.instructions {
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  backdrop-filter: blur(10px);
}

.instructions p {
  margin: 5px 0;
  font-size: 14px;
}

.game-over-modal {
  padding: 40px;
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

/* Enhanced animations */
@keyframes shootUp {
  from {
    transform: translateY(100px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

@keyframes mergeGlow {
  0% {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: scale(1);
  }
  50% {
    box-shadow: 0 0 30px rgba(255, 215, 0, 0.8), 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: scale(1.1);
  }
  100% {
    box-shadow: 0 0 40px rgba(255, 215, 0, 1), 0 4px 12px rgba(0, 0, 0, 0.15);
    transform: scale(0.8);
    opacity: 0;
  }
}

@keyframes mergeTarget {
  0% {
    transform: scale(1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
  50% {
    transform: scale(1.3);
    box-shadow: 0 0 40px rgba(76, 175, 80, 0.8), 0 8px 24px rgba(0, 0, 0, 0.2);
  }
  100% {
    transform: scale(1.1);
    box-shadow: 0 0 20px rgba(76, 175, 80, 0.6), 0 6px 18px rgba(0, 0, 0, 0.15);
  }
}

@keyframes particleExplosion {
  0% {
    transform: translate(50%, 50%) scale(0);
    opacity: 1;
  }
  100% {
    transform: translate(
        calc(50% + var(--random-x, 0) * 50px),
        calc(50% + var(--random-y, 0) * 50px)
      )
      scale(1);
    opacity: 0;
  }
}

@keyframes floatUp {
  0% {
    transform: translateY(0);
    opacity: 1;
    font-size: 24px;
  }
  100% {
    transform: translateY(-80px);
    opacity: 0;
    font-size: 32px;
  }
}

@keyframes bounceUp {
  0%,
  20%,
  50%,
  80%,
  100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.3;
  }
}

/* Add random positions for particles */
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
  --random-x: 1.5;
  --random-y: 0;
}
.particle:nth-child(7) {
  --random-x: 0;
  --random-y: 1.5;
}
.particle:nth-child(8) {
  --random-x: -1.5;
  --random-y: 0;
}

/* Responsive design */
@media (max-width: 480px) {
  .grid {
    gap: 6px;
    padding: 15px;
  }

  .column {
    width: 55px;
    min-height: 350px;
  }

  .block {
    width: 45px;
    height: 45px;
  }

  .block-text {
    font-size: 14px;
  }

  .game-info {
    padding: 10px;
    margin-bottom: 15px;
  }

  .score-value {
    font-size: 20px;
  }

  .merge-indicator {
    font-size: 18px;
  }
}

.score-details-menu {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.column-shoot-screen {
  background: #4a90e2;
  height: 80vh;
  width: 100vw;
}
</style>
