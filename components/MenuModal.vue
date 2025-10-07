<template>
  <ion-card class="menu-over-modal">
    <h2>PAUSED</h2>
    <ion-list>
      <ion-item>
        <ion-toggle
          :checked="isVibration"
          @ionChange="onToggleVibration"
          :enable-on-off-labels="true"
          >SOUND</ion-toggle
        >
      </ion-item>
      <ion-item>
        <ion-toggle :enable-on-off-labels="true">VIBRATION</ion-toggle>
      </ion-item>
    </ion-list>
    <!-- <ion-button @click="resetGame" expand="block">Play Again</ion-button> -->
    <ion-button
      @click="isMenu = false"
      class="play-button"
      shape="round"
      size="large"
      expand="block"
    >
      CONTINUE
    </ion-button>
    <ion-button
      @click="resetGame"
      class="play-button"
      shape="round"
      size="large"
      expand="block"
    >
      RESTART
    </ion-button>
    <ion-button
      @click="router.push('/')"
      class="play-button"
      shape="round"
      size="large"
      expand="block"
    >
      HOME
    </ion-button>
  </ion-card>
</template>
<script></script>
