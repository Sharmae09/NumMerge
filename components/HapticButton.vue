<template>
  <ion-button expand="block" color="primary" @click="handleClick">
    <slot>Tap Me</slot>
  </ion-button>
</template>

<script setup lang="ts">
import { Haptics, ImpactStyle } from "@capacitor/haptics";

const props = defineProps<{
  strength?: "light" | "medium" | "heavy";
}>();

const handleClick = async () => {
  const styleMap = {
    light: ImpactStyle.Light,
    medium: ImpactStyle.Medium,
    heavy: ImpactStyle.Heavy,
  };

  await Haptics.impact({ style: styleMap[props.strength || "medium"] });
};
</script>

<style scoped>
ion-button {
  --border-radius: 12px;
  --padding-start: 1rem;
  --padding-end: 1rem;
  font-weight: 600;
}
</style>
