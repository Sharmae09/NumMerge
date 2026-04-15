// composables/useDailyReward.ts
import { Preferences } from "@capacitor/preferences";
import { ref } from "vue";
import { usePreferences } from "~/composables/usePreferences";

const REWARD_KEY = "lastClaimDate";
const REWARD_HISTORY_KEY = "rewardHistory";
const rewardAmount = 50; // 💎 daily reward amount

const rewardDays = ref<{ claimed: boolean; today: boolean; locked: boolean }[]>(
  []
);
const lastClaimDate = ref<string | null>(null);
const canClaim = ref(false);

export function useDailyReward() {
  const { gems, setGems } = usePreferences();

  // async function loadRewards() {
  //   const stored = await Preferences.get({ key: REWARD_HISTORY_KEY });
  //   const history = stored.value ? JSON.parse(stored.value) : [];
  //   const today = new Date().toDateString();

  //   // Determine if user can claim
  //   canClaim.value = !history.includes(today);

  //   // Create 30-day structure (visual only)
  //   const days = Array.from({ length: 30 }, (_, i) => {
  //     const date = new Date();
  //     date.setDate(i + 1);
  //     const dateStr = date.toDateString();

  //     return {
  //       claimed: history.includes(dateStr),
  //       today: i === new Date().getDate() - 1,
  //       locked: i > new Date().getDate() - 1,
  //     };
  //   });

  //   rewardDays.value = days;
  // }
  async function loadRewards() {
    const stored = await Preferences.get({ key: REWARD_HISTORY_KEY });
    const history: string[] = stored.value ? JSON.parse(stored.value) : [];

    const todayStr = new Date().toDateString();

    // Can claim if today is not in history
    canClaim.value = !history.includes(todayStr);

    // index of today in reward calendar (based on history streak)
    const todayIndex = history.length; // 0-based index

    const days = Array.from({ length: 30 }, (_, i) => ({
      claimed: i < history.length,
      today: i === todayIndex,
      locked: i > todayIndex,
    }));

    rewardDays.value = days;
  }

  async function load() {
    const { value } = await Preferences.get({ key: REWARD_KEY });
    lastClaimDate.value = value;
    await loadRewards();
  }

  async function claimReward() {
    const today = new Date().toDateString();

    // prevent double-claiming
    if (!canClaim.value) return gems.value;

    // Save today's claim
    await Preferences.set({ key: REWARD_KEY, value: today });
    lastClaimDate.value = today;

    // Update reward history
    const stored = await Preferences.get({ key: REWARD_HISTORY_KEY });
    const history = stored.value ? JSON.parse(stored.value) : [];
    if (!history.includes(today)) {
      history.push(today);
      await Preferences.set({
        key: REWARD_HISTORY_KEY,
        value: JSON.stringify(history),
      });
    }

    // 💎 Update gems using your composable
    const newTotal = gems.value + rewardAmount;
    await setGems(newTotal);
    gems.value = newTotal; // keep it reactive

    canClaim.value = false;
    await loadRewards(); // refresh UI state

    return newTotal;
  }

  return {
    rewardAmount,
    canClaim,
    lastClaimDate,
    rewardDays,
    load,
    claimReward,
  };
}
