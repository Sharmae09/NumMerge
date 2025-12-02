import { Preferences } from "@capacitor/preferences";
import { navigateTo } from "#app";

export default defineNuxtRouteMiddleware(async (to) => {
  // We skip redirecting if we're already on the game page
  if (to.path === "/game") return;

  // Check if it's the user's first app open
  const { value } = await Preferences.get({ key: "hasOpenedBefore" });

  if (!value) {
    // Mark that the app has now been opened
    await Preferences.set({ key: "hasOpenedBefore", value: "true" });

    // Redirect to game.vue
    return navigateTo("/game");
  }
});
