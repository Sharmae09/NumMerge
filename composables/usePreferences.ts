import { Preferences } from "@capacitor/preferences";
import { ref, onMounted } from "vue";

export function usePreferences() {
  const bestScore = ref<number>(0);
  const gems = ref<number>(0);
  const bestBlock = ref<number>(0);
  const theme = ref<string>("light");
  const isVibration = ref<boolean>(true);

  // load data on startup
  onMounted(async () => {
    const savedBest = await Preferences.get({ key: "bestScore" });
    const savedGems = await Preferences.get({ key: "gems" });
    const savedbestBlock = await Preferences.get({ key: "bestBlock" });
    const savedTheme = await Preferences.get({ key: "theme" });
    const savedisVibration = await Preferences.get({ key: "isVibration" });

    if (savedBest.value) bestScore.value = Number(savedBest.value);
    if (savedGems.value) gems.value = Number(savedGems.value);
    if (savedbestBlock.value) bestBlock.value = Number(savedbestBlock.value);
    if (savedTheme.value) theme.value = savedTheme.value;
    if (savedisVibration.value)
      isVibration.value = savedisVibration.value === "true";
  });

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
    await Preferences.set({ key: "isVibration", value: String(value) });
  }

  return {
    bestScore,
    gems,
    theme,
    bestBlock,
    setBestScore,
    setGems,
    setTheme,
    setBestBlock,
    setIsVibration,
    isVibration,
  };
}
