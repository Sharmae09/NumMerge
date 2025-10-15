import { ref, watch } from "vue";
import { Preferences } from "@capacitor/preferences";

// Game state refs
const currentScore = ref(0);
const grid = ref<any[][]>([]); // 2D grid of blocks
const gameOver = ref(false);
const lastUpdated = ref<number>(0);

let initialized = false;

export function useGameState() {
  async function loadGame() {
    if (initialized) return;
    initialized = true;

    try {
      const saved = await Preferences.get({ key: "gameState" });
      if (saved.value) {
        const state = JSON.parse(saved.value);
        currentScore.value = state.currentScore ?? 0;
        grid.value = state.grid ? JSON.parse(state.grid) : []; // 🧩 parse back
        gameOver.value = state.gameOver ?? false;
        lastUpdated.value = state.lastUpdated ?? Date.now();
      }
    } catch (err) {
      console.error("Failed to load game state:", err);
    }
  }

  async function saveGame() {
    try {
      const state = {
        currentScore: currentScore.value,
        grid: JSON.stringify(grid.value),
        gameOver: gameOver.value,
        lastUpdated: Date.now(),
      };
      await Preferences.set({
        key: "gameState",
        value: JSON.stringify(state),
      });
    } catch (err) {
      console.error("Failed to save game state:", err);
    }
  }

  async function clearGame() {
    try {
      await Preferences.remove({ key: "gameState" });
      currentScore.value = 0;
      grid.value = [];
      gameOver.value = false;
      lastUpdated.value = 0;
    } catch (err) {
      console.error("Failed to clear game state:", err);
    }
  }

  // Auto-save on changes
  watch([currentScore, grid, gameOver], saveGame, { deep: true });

  // Initialize on composable load
  loadGame();

  return {
    currentScore,
    grid,
    gameOver,
    lastUpdated,
    loadGame,
    saveGame,
    clearGame,
  };
}
