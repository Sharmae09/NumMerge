<script lang="ts" setup>
import { IonApp } from "@ionic/vue";
import { reactive, ref, onMounted, nextTick } from "vue";

useBackButtonHandler();

import { usePreferences } from "~/composables/usePreferences";

onMounted(async () => {
  const { loadPreferences } = usePreferences();
  await loadPreferences();
});
</script>

<template>
  <IonApp>
    <NuxtPage />
  </IonApp>
</template>
