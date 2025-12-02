import { Preferences } from "@capacitor/preferences";
import { ref } from "vue";

const bestScore = ref<number>(0);
const gems = ref<number>(0);
const bestBlock = ref<number>(0);
const theme = ref<string>("light");
const isVibration = ref<boolean>(true);
const isSound = ref<boolean>(true);

let initialized = false;

export function usePreferences() {
  async function loadPreferences() {
    if (initialized) return; // prevent double-loading
    initialized = true;

    const savedBest = await Preferences.get({ key: "bestScore" });
    const savedGems = await Preferences.get({ key: "gems" });
    const savedBlock = await Preferences.get({ key: "bestBlock" });
    const savedTheme = await Preferences.get({ key: "theme" });
    const savedVibration = await Preferences.get({ key: "isVibration" });
    const savedSound = await Preferences.get({ key: "isSound" });

    if (savedBest.value) bestScore.value = Number(savedBest.value);
    if (savedGems.value) gems.value = Number(savedGems.value);
    if (savedBlock.value) bestBlock.value = Number(savedBlock.value);
    if (savedTheme.value) theme.value = savedTheme.value;
    if (savedVibration.value !== null) {
      isVibration.value = savedVibration.value === "true";
    }
    if (savedSound.value !== null) {
      isSound.value = savedSound.value === "true";
    }
  }

  async function setBestScore(score: number) {
    bestScore.value = score;
    await Preferences.set({ key: "bestScore", value: String(score) });
  }

  async function setBestBlock(tile: number) {
    bestBlock.value = tile;
    await Preferences.set({ key: "bestBlock", value: String(tile) });
  }

  async function setGems(value: number) {
    gems.value = value;
    await Preferences.set({ key: "gems", value: String(value) });
  }

  async function setTheme(value: string) {
    theme.value = value;
    await Preferences.set({ key: "theme", value });
  }

  async function setIsVibration(value: boolean) {
    isVibration.value = value;
    await Preferences.set({
      key: "isVibration",
      value: value ? "true" : "false",
    });
  }
  async function setIsSound(value: boolean) {
    isSound.value = value;
    await Preferences.set({
      key: "isSound",
      value: value ? "true" : "false",
    });
  }

  // Always call this once in your root layout or main app
  loadPreferences();

  return {
    bestScore,
    gems,
    bestBlock,
    theme,
    isVibration,
    isSound,
    setBestScore,
    setBestBlock,
    setGems,
    setTheme,
    setIsVibration,
    setIsSound,
    loadPreferences,
  };
}
