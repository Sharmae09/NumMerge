<template>
  <ion-content class="home-content">
    <div class="status-bar">
      <div class="flex flex-col">
        <div class="status-item">
          <div class="gem-icon">💎</div>
          <span class="text-white">{{ gems }}</span>
          <div class="add-btn">+</div>
        </div>
      </div>
      <div class="status-item">
        <div class="crown-icon">👑</div>
        <span class="text-white"> {{ bestScore }}</span>
      </div>
    </div>
    <div class="">
      <div class="side-bar px-2">
        <ion-button class="side-button" size="large" color="dark">
          <ion-icon slot="icon-only" size="large" :icon="settings"></ion-icon>
        </ion-button>
      </div>

      <div class="block-display">
        <div class="highest-block">
          <div class="large-next-block num-block" :class="`block-${bestBlock}`">
            <span class="block-number large-number">{{ bestBlock }}</span>
          </div>
          <h2 class="">HIGHEST BLOCK</h2>
        </div>

        <ion-button
          @click="$router.push('/game')"
          class="play-button"
          shape="round"
          size="large"
        >
          <ion-icon slot="end" :icon="play"></ion-icon>
          PLAY
        </ion-button>
      </div>
    </div>
  </ion-content>
</template>

<script setup lang="ts">
import { usePreferences } from "@/composables/usePreferences";
const { bestScore, gems, bestBlock } = usePreferences();
import { play, settings } from "ionicons/icons";
</script>
<style>
.side-bar {
  height: 10vh;
  width: 100%;
  /* background: burlywood; */
  display: flex;
  justify-content: flex-end;
}
.block-display {
  width: 100%;
  height: 80vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  /* background: yellow; */
}
.play-button {
  margin-top: 4rem;
  font-weight: 700;
  width: calc(4rem + 30vw);
  --background: linear-gradient(
    135deg,
    #4caf50,
    #2e7d32
  ); /* light → dark green */
  --color: white;
  /* background: rgb(0, 181, 82); */
}
.num-block {
  width: 60px;
  height: 60px;
  border-radius: 20%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4),
    inset 0 2px 10px rgba(255, 255, 255, 0.1);
  animation: dropIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: visible;
  transition: all 0.3s ease;
}
.highest-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: white;
  letter-spacing: 0.1em;
  text-align: center;
}
.side-button {
  height: 50px;
  width: 50px;
}
/* .home-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
} */
.status-bar {
  /* backface-visibility: hidden !important; */
  background: rgba(255, 255, 255, 0) !important;
}
</style>
