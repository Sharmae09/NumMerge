// composables/useBackButton.ts
import { App } from "@capacitor/app";
import { onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";

export function useBackButtonHandler() {
  const router = useRouter();

  const handler = () => {
    if (router.options.history.state.back !== null) {
      router.back();
    } else {
      // Optionally show a confirm dialog before exit
      App.exitApp(); // or do nothing
    }
  };

  onMounted(() => {
    App.addListener("backButton", handler);
  });

  onUnmounted(() => {
    App.removeAllListeners(); // Clean up
  });
}
