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
                {
                  'liquid-merging': block.liquidMerging,
                  'liquid-absorbing': block.liquidAbsorbing,
                  'liquid-stretching': block.liquidStretching,
                },
              ]"
              :style="{
                top: `${blockIndex * 52}px`,
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
            </div>
          </div>
        </div>

        <!-- Liquid connection effects overlay -->
        <div class="liquid-connections-overlay">
          <div
            v-for="connection in liquidConnections"
            :key="connection.id"
            class="liquid-connection"
            :style="{
              left: `${connection.x1}px`,
              top: `${connection.y1}px`,
              width: `${Math.sqrt(
                Math.pow(connection.x2 - connection.x1, 2) +
                  Math.pow(connection.y2 - connection.y1, 2)
              )}px`,
              transform: `rotate(${
                (Math.atan2(
                  connection.y2 - connection.y1,
                  connection.x2 - connection.x1
                ) *
                  180) /
                Math.PI
              }deg)`,
            }"
          ></div>
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
  border-radius: 20px;
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

/* Enhanced Number Blocks with Organic Liquid Effects */
.number-block {
  position: absolute;
  width: 60px;
  height: 60px;
  border-radius: 20%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  left: 50%;
  transform: translateX(-50%);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4),
    inset 0 2px 10px rgba(255, 255, 255, 0.1);
  animation: dropIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: visible;
  transition: all 0.3s ease;
}

/* Liquid Merge Animations */
.number-block.liquid-merging {
  animation: liquidMergeMain 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  z-index: 1000;
}

.number-block.liquid-absorbing {
  animation: liquidAbsorb 1.2s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  z-index: 999;
}

.number-block.liquid-stretching {
  animation: liquidStretch 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
  z-index: 998;
}

/* Liquid Blobs */
.liquid-blobs {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.liquid-blob {
  position: absolute;
  background: inherit;
  border-radius: 50%;
  opacity: 0.6;
}

.liquid-blob-1 {
  width: 140%;
  height: 90%;
  top: -15%;
  left: -20%;
  animation: liquidBlob1 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

.liquid-blob-2 {
  width: 90%;
  height: 140%;
  top: -20%;
  left: 15%;
  opacity: 0.5;
  animation: liquidBlob2 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

.liquid-blob-3 {
  width: 120%;
  height: 120%;
  top: -10%;
  left: -10%;
  opacity: 0.4;
  animation: liquidBlob3 1.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
}

/* Liquid Streams */
.liquid-streams {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 200%;
  height: 200%;
  pointer-events: none;
}

.liquid-stream {
  position: absolute;
  background: radial-gradient(ellipse, rgba(230, 8, 8, 0.824), transparent 70%);
  border-radius: 50%;
}

.stream-1 {
  width: 80px;
  height: 20px;
  top: -10px;
  left: -40px;
  animation: liquidStream1 0.6s ease-in-out forwards;
}

.stream-2 {
  width: 60px;
  height: 15px;
  top: 5px;
  left: -30px;
  animation: liquidStream2 0.6s ease-in-out 0.2s forwards;
}

/* Liquid Connections Overlay */
.liquid-connections-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 997;
}

.liquid-connection {
  position: absolute;
  height: 8px;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.4) 20%,
    rgba(255, 255, 255, 0.6) 50%,
    rgba(255, 255, 255, 0.4) 80%,
    transparent 100%
  );
  border-radius: 4px;
  opacity: 0;
  transform-origin: left center;
  animation: liquidConnectionFlow 0.8s ease-in-out forwards;
}

.block-number {
  font-size: 16px;
  font-weight: 700;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  z-index: 10;
  position: relative;
}

.large-number {
  font-size: 32px !important;
}

/* Block Colors - Enhanced with liquid-friendly gradients */
.block-2 {
  background: radial-gradient(
    ellipse at 30% 30%,
    #4facfe 0%,
    #3498db 50%,
    #2980b9 100%
  );
  color: white;
}
.block-4 {
  background: radial-gradient(
    ellipse at 30% 30%,
    #ff9a56 0%,
    #e67e22 50%,
    #d35400 100%
  );
  color: white;
}
.block-8 {
  background: radial-gradient(
    ellipse at 30% 30%,
    #ff6b9d 0%,
    #e91e63 50%,
    #c2185b 100%
  );
  color: white;
}
.block-16 {
  background: radial-gradient(
    ellipse at 30% 30%,
    #c471ed 0%,
    #9c27b0 50%,
    #7b1fa2 100%
  );
  color: white;
}
.block-32 {
  background: radial-gradient(
    ellipse at 30% 30%,
    #8b7cf8 0%,
    #673ab7 50%,
    #512da8 100%
  );
  color: white;
}
.block-64 {
  background: radial-gradient(
    ellipse at 30% 30%,
    #667eea 0%,
    #3f51b5 50%,
    #303f9f 100%
  );
  color: white;
}
.block-128 {
  background: radial-gradient(
    ellipse at 30% 30%,
    #5eb3f6 0%,
    #2196f3 50%,
    #1976d2 100%
  );
  color: white;
}
.block-256 {
  background: radial-gradient(
    ellipse at 30% 30%,
    #4dd0e1 0%,
    #00bcd4 50%,
    #0097a7 100%
  );
  color: white;
}
.block-512 {
  background: radial-gradient(
    ellipse at 30% 30%,
    #81c784 0%,
    #4caf50 50%,
    #388e3c 100%
  );
  color: white;
}
.block-1024 {
  background: radial-gradient(
    ellipse at 30% 30%,
    #ffb74d 0%,
    #ff9800 50%,
    #f57c00 100%
  );
  color: white;
}
.block-2048 {
  background: radial-gradient(
    ellipse at 30% 30%,
    #e57373 0%,
    #f44336 50%,
    #d32f2f 100%
  );
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

.large-next-block {
  position: relative;
  width: 80px;
  height: 80px;
  border-radius: 20%;
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

/* Enhanced Liquid Animations - Organic Blob Merging */
@keyframes dropIn {
  from {
    transform: translateX(-50%) translateY(100px) scale(1.2);
    opacity: 0;
    border-radius: 45% 55% 52% 48%;
  }
  30% {
    border-radius: 38% 62% 58% 42%;
  }
  70% {
    border-radius: 52% 48% 43% 57%;
  }
  to {
    transform: translateX(-50%) translateY(0) scale(1);
    opacity: 1;
    border-radius: 48% 52% 56% 44%;
  }
}

@keyframes liquidMergeMain {
  0% {
    transform: translateX(-50%) scale(1);
    border-radius: 48% 52% 56% 64%;
    opacity: 1;
    filter: blur(0px);
  }
  15% {
    transform: translateX(-50%) scale(1.1);
    border-radius: 35% 65% 70% 60%;
  }
  35% {
    transform: translateX(-50%) scale(1.3) scaleY(0.8);
    border-radius: 25% 75% 80% 60%;
    filter: blur(1px);
  }
  55% {
    transform: translateX(-50%) scale(1.6) scaleY(0.6);
    border-radius: 15% 85% 90% 10%;
    opacity: 0.9;
    filter: blur(2px);
  }
  75% {
    transform: translateX(-50%) scale(2) scaleY(0.3);
    border-radius: 15% 75% 75% 15%;
    opacity: 0.6;
    filter: blur(3px);
  }
  90% {
    transform: translateX(-50%) scale(2.5) scaleY(0.1);
    border-radius: 2% 98% 98% 2%;
    opacity: 0.3;
    filter: blur(4px);
  }
  100% {
    transform: translateX(-50%) scale(3) scaleY(0.05);
    border-radius: 50%;
    opacity: 0;
    filter: blur(5px);
  }
}

@keyframes liquidAbsorb {
  0% {
    transform: translateX(-50%) scale(1);
    border-radius: 48% 52% 56% 44%;
    opacity: 1;
  }
  20% {
    transform: translateX(-50%) scale(0.9) scaleX(1.2);
    border-radius: 35% 65% 45% 55%;
  }
  45% {
    transform: translateX(-50%) scale(0.7) scaleX(1.5);
    border-radius: 25% 75% 35% 65%;
    opacity: 0.8;
  }
  70% {
    transform: translateX(-50%) scale(0.4) scaleX(2);
    border-radius: 15% 85% 25% 75%;
    opacity: 0.5;
  }
  85% {
    transform: translateX(-50%) scale(0.2) scaleX(2.5);
    border-radius: 5% 95% 15% 85%;
    opacity: 0.2;
  }
  100% {
    transform: translateX(-50%) scale(0.1) scaleX(3);
    border-radius: 50%;
    opacity: 0;
  }
}

@keyframes liquidStretch {
  0% {
    border-radius: 38% 42% 46% 34%;
  }
  25% {
    border-radius: 30% 50% 25% 45%;
    transform: translateX(-50%) scaleY(1.1);
  }
  50% {
    border-radius: 25% 55% 15% 65%;
    transform: translateX(-50%) scaleY(1.2) scaleX(0.9);
  }
  75% {
    border-radius: 30% 45% 30% 50%;
    transform: translateX(-50%) scaleY(1.1) scaleX(0.95);
  }
  100% {
    border-radius: 35% 25% 30% 24%;
    transform: translateX(-50%) scaleY(1) scaleX(1);
  }
}

@keyframes liquidBlob1 {
  0% {
    transform: scale(0) rotate(0deg);
    border-radius: 45% 55% 60% 40%;
    opacity: 0.7;
  }
  25% {
    transform: scale(0.8) rotate(45deg);
    border-radius: 35% 65% 75% 25%;
    opacity: 0.6;
  }
  50% {
    transform: scale(1.4) rotate(90deg);
    border-radius: 25% 75% 85% 15%;
    opacity: 0.4;
  }
  75% {
    transform: scale(1.8) rotate(135deg);
    border-radius: 15% 85% 95% 5%;
    opacity: 0.2;
  }
  100% {
    transform: scale(2.2) rotate(180deg);
    border-radius: 50%;
    opacity: 0;
  }
}

@keyframes liquidBlob2 {
  0% {
    transform: scale(0) rotate(0deg);
    border-radius: 55% 45% 40% 60%;
    opacity: 0.5;
  }
  30% {
    transform: scale(0.6) rotate(60deg);
    border-radius: 40% 60% 30% 70%;
    opacity: 0.4;
  }
  60% {
    transform: scale(1.2) rotate(120deg);
    border-radius: 30% 70% 20% 80%;
    opacity: 0.3;
  }
  80% {
    transform: scale(1.6) rotate(160deg);
    border-radius: 20% 80% 10% 90%;
    opacity: 0.1;
  }
  100% {
    transform: scale(2) rotate(180deg);
    border-radius: 50%;
    opacity: 0;
  }
}

@keyframes liquidBlob3 {
  0% {
    transform: scale(1);
    border-radius: 50% 50% 45% 55%;
    opacity: 0.4;
  }
  30% {
    transform: scale(1.3);
    border-radius: 40% 60% 35% 65%;
    opacity: 0.3;
  }
  60% {
    transform: scale(1.8);
    border-radius: 30% 70% 25% 75%;
    opacity: 0.2;
  }
  80% {
    transform: scale(2.3);
    border-radius: 20% 80% 15% 85%;
    opacity: 0.1;
  }
  100% {
    transform: scale(3);
    border-radius: 50%;
    opacity: 0;
  }
}

@keyframes liquidStream1 {
  0% {
    transform: scaleX(0) scaleY(1);
    opacity: 0;
  }
  50% {
    transform: scaleX(1) scaleY(1.2);
    opacity: 0.6;
  }
  100% {
    transform: scaleX(1.5) scaleY(0.8);
    opacity: 0;
  }
}

@keyframes liquidStream2 {
  0% {
    transform: scaleX(0) scaleY(1) rotate(15deg);
    opacity: 0;
  }
  60% {
    transform: scaleX(1.2) scaleY(1) rotate(15deg);
    opacity: 0.4;
  }
  100% {
    transform: scaleX(2) scaleY(0.6) rotate(15deg);
    opacity: 0;
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
const bestScore = ref(0);
const gameOver = ref(false);
const nextBlockValue = ref(2);
const gems = ref(0);
const mergeIndicators = reactive<MergeIndicator[]>([]);
const liquidConnections = reactive<LiquidConnection[]>([]);
const powerUps = reactive<PowerUps>({ hammer: 150, swap: 175, undo: 75 });
const highestTile = ref(2);

let indicatorId = 1;
let connectionId = 1;
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

function usePowerUp(type: keyof PowerUps) {
  if (powerUps[type] <= 0) return;
  powerUps[type]--;
  console.log(`Used ${type}`);
}



async function createLiquidConnection(pos1: Position, pos2: Position) {
  await nextTick();
  const colEls = Array.from(
    document.querySelectorAll(".game-column")
  ) as HTMLElement[];

  const getBlockPosition = (col: number, row: number) => {
    const colEl = colEls[col];
    if (!colEl) return { x: 0, y: 0 };

    const colRect = colEl.getBoundingClientRect();
    const gameArea = document.querySelector(".game-area") as HTMLElement;
    const gameRect = gameArea?.getBoundingClientRect() || { left: 0, top: 0 };

    return {
      x: colRect.left - gameRect.left + colRect.width / 2,
      y: colRect.top - gameRect.top + row * 52 + 30,
    };
  };

  const start = getBlockPosition(pos1.col, pos1.row);
  const end = getBlockPosition(pos2.col, pos2.row);

  const connection: LiquidConnection = {
    id: connectionId++,
    x1: start.x,
    y1: start.y,
    x2: end.x,
    y2: end.y,
  };

  liquidConnections.push(connection);

  setTimeout(() => {
    const idx = liquidConnections.findIndex((c) => c.id === connection.id);
    if (idx > -1) liquidConnections.splice(idx, 1);
  }, 800);
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

async function mergeConnectedBlocks(targetColumn?: number) {
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

  // Apply liquid merge effects
  for (const group of toMerge) {
    // Create liquid connections between merging blocks
    for (let i = 0; i < group.positions.length - 1; i++) {
      await createLiquidConnection(group.positions[i], group.positions[i + 1]);
    }

    // Apply liquid animations ONLY to blocks involved in merging
    group.positions.forEach((pos, index) => {
      const block = grid[pos.col][pos.row];
      if (block) {
        if (index === 0) {
          // First block becomes the main merging block
          block.liquidMerging = true;
        } else {
          // Other blocks get absorbed
          block.liquidAbsorbing = true;
        }
      }
    });

    const k = group.positions.length;
    const newValue = group.base * Math.pow(2, k - 1);
    score.value += newValue;

    // FIXED: Determine where the merged block should be placed
    let primaryPosition;

    if (targetColumn !== undefined) {
      // If we have a target column (from initial shot), prefer that column
      const targetColumnPositions = group.positions.filter(
        (p) => p.col === targetColumn
      );
      if (targetColumnPositions.length > 0) {
        // Use the bottommost position in the target column (highest row index)
        primaryPosition = targetColumnPositions.reduce((bottom, current) => {
          return current.row > bottom.row ? current : bottom;
        });
      } else {
        // Fallback: use the bottommost position overall
        primaryPosition = group.positions.reduce((bottom, current) => {
          return current.row > bottom.row ? current : bottom;
        });
      }
    } else {
      // For chain reactions, use the bottommost position overall
      primaryPosition = group.positions.reduce((bottom, current) => {
        return current.row > bottom.row ? current : bottom;
      });
    }

    await addMergeIndicator(primaryPosition.col, primaryPosition.row, newValue);

    // Wait for liquid animation to play
    await new Promise((resolve) => setTimeout(resolve, 400));

    // Remove merged blocks after animation (sort by row descending to avoid index issues)
    group.positions
      .slice()
      .sort((a, b) => b.row - a.row)
      .forEach((p) => {
        if (grid[p.col] && grid[p.col][p.row]) {
          // Clear animation states before removing
          const block = grid[p.col][p.row];
          block.liquidMerging = false;
          block.liquidAbsorbing = false;
          block.liquidStretching = false;
          grid[p.col].splice(p.row, 1);
        }
      });

    // Add new block at the PRIMARY merge position
    // Since we removed blocks, we need to recalculate the position
    // The new block should go at the bottom of the primary column
    const newBlock = createBlock(newValue);
    grid[primaryPosition.col].push(newBlock);
  }

  // Wait for animations to complete before checking for more merges
  await new Promise((resolve) => setTimeout(resolve, 600));

  // Recurse until no more merges (pass targetColumn for first level, undefined for chain reactions)
  await nextTick();
  await mergeConnectedBlocks(); // Chain reactions don't have a preferred target column
}

// Updated shootBlock function
async function shootBlock(columnIndex: number) {
  if (isColumnFull(columnIndex) || gameOver.value) {
    if (gameOver.value) return;
    if (grid[columnIndex][6].value != nextBlockValue.value) return;
  }

  // Add the new block to the column
  grid[columnIndex].push(createBlock(nextBlockValue.value));

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
</script>
