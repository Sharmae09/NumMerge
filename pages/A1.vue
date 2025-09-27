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

      <!-- Top Status Bar -->
      <div class="status-bar">
        <div class="status-item">
          <div class="gem-icon">💎</div>
          <span>{{ score }}</span>
          <div class="add-btn">+</div>
        </div>

        <div class="level-display">{{ Math.floor(score / 100) || 1 }}</div>

        <div class="status-item">
          <div class="crown-icon">👑</div>
          <span>{{ bestScore }}</span>
        </div>
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
            }"
            @click="shootBlock(colIndex)"
          >
            <!-- Preview block when hovering -->
            <div
              v-if="hoveredColumn === colIndex && !isColumnFull(colIndex)"
              class="number-block preview-block"
              :class="`block-${nextBlockValue}`"
              :style="{ top: `${column.length * 52}px` }"
            >
              <span class="block-number">{{ nextBlockValue }}</span>
            </div>

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
                animationDelay: `${blockIndex * 0.05}s`,
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
        <div class="next-block-container">
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

          <div class="powerup-item" @click="usePowerUp('refresh')">
            <div class="powerup-icon">🔄</div>
            <div class="powerup-count">{{ powerUps.refresh }}</div>
          </div>

          <div class="powerup-item" @click="usePowerUp('boost')">
            <div class="powerup-icon">⚡</div>
            <div class="powerup-count">{{ powerUps.boost }}</div>
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
import { reactive, ref, onMounted } from "vue";
import { IonIcon } from "@ionic/vue";
import { Preferences } from "@capacitor/preferences";

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

interface PowerUps {
  hammer: number;
  refresh: number;
  boost: number;
}

const columns = 5;
const maxHeight = 12;
const grid = reactive<Block[][]>(Array.from({ length: columns }, () => []));
const score = ref(0);
const bestScore = ref(376); // Starting with the value from the image
const gameOver = ref(false);
const nextBlockValue = ref(2);
const hoveredColumn = ref(-1);
const mergeIndicators = reactive<MergeIndicator[]>([]);
const powerUps = reactive<PowerUps>({
  hammer: 150,
  refresh: 175,
  boost: 75,
});

let nextId = 1;
let indicatorId = 1;

// Load best score from localStorage
onMounted(() => {
  const saved = localStorage.getItem("numberMergeBestScore");
  if (saved) {
    bestScore.value = parseInt(saved);
  }
  generateNextBlock();

  // Add some initial blocks for demo - positioned at top
  grid[0].push({ value: 2, id: nextId++ });
  grid[2].push({ value: 8, id: nextId++ });
  grid[3].push({ value: 4, id: nextId++ });
});

function generateNextBlock() {
  const rand = Math.random();
  if (rand < 0.7) nextBlockValue.value = 2;
  else if (rand < 0.9) nextBlockValue.value = 4;
  else nextBlockValue.value = 8;
}

function isColumnFull(columnIndex: number) {
  return grid[columnIndex].length >= maxHeight;
}

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
}

interface Position {
  col: number;
  row: number;
}


function addMergeIndicator(col: number, row: number, value: number) {
  const gameArea = document.querySelector(".game-area");
  const rect = gameArea?.getBoundingClientRect();

  if (rect) {
    const x = rect.left + col * 68 + 34;
    const y = rect.top + 50 + row * 52; // Adjusted for top positioning

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

        connected.forEach((pos, index) => {
          const block = grid[pos.col][pos.row];
          if (block) {
            block.merging = true;
            if (index === 0) block.mergeTarget = true;
          }
        });

        let totalValue = block.value * connected.length;
        if (connected.length > 2) {
          totalValue += block.value;
        }

        score.value += totalValue;

        const targetPos =
          targetColumn !== undefined
            ? { col: targetColumn, row: grid[targetColumn].length }
            : connected[0];
        addMergeIndicator(targetPos.col, targetPos.row, totalValue);

        setTimeout(() => {
          // Sort from bottom to top to avoid index shifting issues
          connected
            .sort((a, b) => b.row - a.row)
            .forEach((pos) => {
              grid[pos.col].splice(pos.row, 1);
            });

          const dropCol =
            targetColumn !== undefined ? targetColumn : connected[0].col;

          // Add new merged block at the end (will be positioned at bottom of existing blocks)
          grid[dropCol].push({
            value: totalValue,
            id: nextId++,
          });

          setTimeout(() => mergeConnectedBlocks(targetColumn), 100);
        }, 600);
      }

      connected.forEach((pos) => processed.add(`${pos.col},${pos.row}`));
    }
  }

  if (!mergedAny) {
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
  // Add new block at the end of the array (will appear at bottom of column)
  column.push({ value: nextBlockValue.value, id: nextId++ });

  setTimeout(() => mergeConnectedBlocks(columnIndex), 100);

  generateNextBlock();

  setTimeout(() => {
    if (checkGameOver()) {
      gameOver.value = true;
      updateBestScore();
    }
  }, 1500);
}
</script>

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
}

.status-item {
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 8px 12px;
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

.level-display {
  font-size: 48px;
  font-weight: bold;
  color: white;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
}

/* Game Area */
.game-area {
  flex: 1;
  padding: 20px;
  position: relative;
  overflow: hidden;
  height: 50vh;
}

.grid-container {
  display: flex;
  justify-content: center;
  gap: 4px;
  height: 100%;
  max-height: 60vh;
}

.game-column {
  width: 64px;
  height: 100%;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.game-column:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.3);
}

.column-hover {
  border-color: #4caf50;
  box-shadow: 0 0 20px rgba(76, 175, 80, 0.3);
}

.column-full {
  border-color: #ff4444;
  background: rgba(255, 68, 68, 0.1);
  cursor: not-allowed;
}

/* Number Blocks */
.number-block {
  position: absolute;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  left: 50%;
  transform: translateX(-50%);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
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

.preview-block {
  opacity: 0.6;
  animation: pulse 1.5s infinite;
  border: 2px dashed rgba(255, 255, 255, 0.5);
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
  gap: 20px;
}

.powerup-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 60px;
}

.powerup-item:hover {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-2px);
}

.powerup-icon {
  font-size: 24px;
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
.block.merging {
  animation: mergeGlow 0.6s ease-in-out;
  z-index: 100;
}

.block.merge-target {
  animation: mergeTarget 0.6s ease-in-out;
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

/* Animations */
@keyframes dropIn {
  from {
    transform: translateX(-50%) translateY(-100px);
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

@keyframes pulse {
  0%,
  100% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.3;
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

@keyframes mergeTarget {
  0% {
    transform: translateX(-50%) scale(1);
  }
  50% {
    transform: translateX(-50%) scale(1.2);
    box-shadow: 0 0 40px rgba(76, 175, 80, 0.8);
  }
  100% {
    transform: translateX(-50%) scale(1.1);
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
    width: 42px;
    height: 42px;
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
