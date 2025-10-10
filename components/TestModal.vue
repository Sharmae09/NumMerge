<template>
  <!-- <ion-modal :is-open="isOpen" @didDismiss="close"> -->
  <ion-card class="pause-modal">
    <div class="header">
      <ion-icon name="close" @click="close" />
      <h2>Paused</h2>
    </div>

    <ion-list lines="none" class="settings-list">
      <ion-item>
        <ion-icon slot="start" name="volume-high-outline" />
        <ion-label>Sound</ion-label>
        <ion-toggle
          :checked="sound"
          color="success"
          @ionChange="toggleSound"
        ></ion-toggle>
      </ion-item>

      <ion-item>
        <ion-icon slot="start" name="vibration-outline" />
        <ion-label>Vibration</ion-label>
        <ion-toggle
          :checked="vibration"
          color="success"
          @ionChange="toggleVibration"
        ></ion-toggle>
      </ion-item>

      <ion-item button detail @click="openThemes">
        <ion-icon slot="start" name="color-palette-outline" />
        <ion-label>Themes</ion-label>
      </ion-item>
    </ion-list>

    <div class="buttons">
      <ion-button
        expand="block"
        shape="round"
        color="success"
        @click="continueGame"
      >
        Continue
      </ion-button>

      <div class="secondary-buttons">
        <ion-button
          fill="solid"
          color="medium"
          shape="round"
          @click="restartGame"
        >
          Restart
        </ion-button>
        <ion-button fill="solid" color="medium" shape="round" @click="goHome">
          Home
        </ion-button>
      </div>
    </div>
  </ion-card>
  <!-- </ion-modal> -->
</template>

<script setup lang="ts">
import { ref } from "vue";

const props = defineProps({
  isOpen: Boolean,
});
const emit = defineEmits([
  "update:isOpen",
  "restart",
  "home",
  "continue",
  "themes",
]);

const sound = ref(true);
const vibration = ref(true);

const toggleSound = () => (sound.value = !sound.value);
const toggleVibration = () => (vibration.value = !vibration.value);
const close = () => emit("update:isOpen", false);
const continueGame = () => emit("continue");
const restartGame = () => emit("restart");
const goHome = () => emit("home");
const openThemes = () => emit("themes");
</script>

<style scoped>
.pause-modal {
  background: #1c1c1e;
  color: white;
  border-radius: 1rem;
  padding: 1rem;
  text-align: center;
  max-width: 350px;
  margin: auto;
}

.header {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  margin-bottom: 1rem;
}

.header ion-icon {
  position: absolute;
  left: 0;
  font-size: 1.5rem;
  cursor: pointer;
}

.settings-list ion-item {
  --background: transparent;
  color: #fff;
  font-size: 1rem;
}

.buttons {
  margin-top: 1.5rem;
}

.secondary-buttons {
  display: flex;
  justify-content: space-around;
  margin-top: 0.8rem;
}

ion-button[color="medium"] {
  --background: #444;
  --background-activated: #555;
  --color: #fff;
}
</style>
