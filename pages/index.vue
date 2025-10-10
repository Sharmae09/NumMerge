<template>
  <ion-content class="home-content">
    <!-- <ion-modal :is-open="true">
      <TestModal />
    </ion-modal> -->

    <div class="status-bar">
      <div class="flex flex-col">
        <div class="status-item">
          <div class="gem-icon">💎</div>
          <span class="text-white">{{ displayNum(gems) }}</span>
          <div class="add-btn">+</div>
        </div>
      </div>
      <div class="status-item">
        <div class="crown-icon">👑</div>
        <span class="text-white"> {{ displayNum(bestScore) }}</span>
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
          <div class="num-block" :class="`block-${bestBlock}`">
            {{ displayNum(bestBlock) }}
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
  width: calc(4rem + 6vw);
  height: calc(4rem + 6vw);
  border-radius: 20%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: calc(1.5rem + 2vw);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4),
    inset 0 2px 10px rgba(255, 255, 255, 0.1);
  animation: glow 2s ease-in-out infinite alternate;
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

.status-bar {
  /* backface-visibility: hidden !important; */
  background: rgba(255, 255, 255, 0) !important;
}
</style>
