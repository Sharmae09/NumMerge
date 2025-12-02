<template>
  <!-- <ion-modal :is-open="showDailyReward" @didDismiss="showDailyReward = false"> -->
  <div class="daily-reward-container">
    <ion-card class="daily-modal">
      <!-- Close Button -->
      <ion-button fill="clear" class="close-btn" @click="$emit('close')">
        <ion-icon name="close-circle" size="large"></ion-icon>
      </ion-button>

      <!-- Header Banner -->
      <div class="banner-header">
        <h2>Daily Reward</h2>
      </div>

      <!-- Status Message -->
      <div class="status-message">
        <p>
          {{ canClaim ? "You can Claim Your Reward!" : "Come back tomorrow!" }}
        </p>
      </div>

      <!-- Reward Grid (showing first 8 days) -->
      <ion-grid class="reward-grid">
        <ion-row>
          <ion-col v-for="day in 4" :key="day" size="3" class="reward-col">
            <div
              class="reward-card"
              :class="{
                claimed: rewardDays[day - 1]?.claimed,
                today: rewardDays[day - 1]?.today,
                locked: rewardDays[day - 1]?.locked,
              }"
            >
              <div class="day-label">Day {{ day }}</div>
              <div class="coin-stack">
                <img
                  src="/assets/icons/diamond.png"
                  alt="Laser Line Power-up"
                  class="powerup-icon"
                />
              </div>
              <div class="amount">{{ rewardAmount }}</div>
            </div>
          </ion-col>
        </ion-row>
        <ion-row>
          <ion-col v-for="day in 4" :key="day + 4" size="3" class="reward-col">
            <div
              class="reward-card"
              :class="{
                claimed: rewardDays[day + 3]?.claimed,
                today: rewardDays[day + 3]?.today,
                locked: rewardDays[day + 3]?.locked,
              }"
            >
              <div class="day-label">Day {{ day + 4 }}</div>
              <div class="coin-stack">
                <img
                  src="/assets/icons/diamond.png"
                  alt="Laser Line Power-up"
                  class="powerup-icon"
                />
              </div>
              <div class="amount">{{ rewardAmount }}</div>
            </div>
          </ion-col>
        </ion-row>
      </ion-grid>

      <!-- Claim Button -->
      <div class="claim-section">
        <ion-button
          v-if="canClaim"
          @click="handleClaimReward"
          class="claim-btn"
          expand="block"
          shape="round"
        >
          Claim {{ rewardAmount }} Gems
        </ion-button>
        <ion-button
          v-else
          @click="$emit('close')"
          class="claim-btn disabled"
          expand="block"
          shape="round"
          disabled
        >
          Come Back Tomorrow
        </ion-button>
      </div>
    </ion-card>
  </div>
  <!-- </ion-modal> -->
</template>

<script setup>
import { ref, onMounted } from "vue";
import {
  IonModal,
  IonCard,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
} from "@ionic/vue";
import { useDailyReward } from "~/composables/useDailyReward";
import { addIcons } from "ionicons";
import { closeCircle } from "ionicons/icons";

addIcons({
  "close-circle": closeCircle,
});

const showDailyReward = ref(true);

// Use the composable
const { rewardAmount, canClaim, rewardDays, load, claimReward } =
  useDailyReward();

// Load reward data when component mounts
onMounted(async () => {
  await load();
});
const emit = defineEmits(["close"]);

const handleClaimReward = async () => {
  const newTotal = await claimReward();
  console.log("Reward claimed! New total gems:", newTotal);
  // Optional: show success message or animation here

  // Close modal after a short delay
  setTimeout(() => {
    emit("close");
  }, 100);
};
</script>

<style scoped>
/* Add your existing styles here */
.daily-reward-container {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
}

.daily-modal {
  max-width: 500px;
  width: 100%;
  padding: 20px;
  position: relative;
}

.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
}

.banner-header {
  text-align: center;
  margin-bottom: 20px;
}

.banner-header h2 {
  font-size: 24px;
  font-weight: bold;
  color: #ffd700;
}

.status-message {
  text-align: center;
  margin-bottom: 20px;
}

.status-message p {
  font-size: 16px;
  color: #666;
}

.reward-grid {
  margin-bottom: 20px;
}

.reward-col {
  padding: 5px;
}

.reward-card {
  /* background: linear-gradient(135deg, #ff7d03 0%, #764ba2 100%); */
  background: #666;
  border-radius: 12px;
  padding: 15px 10px;
  text-align: center;
  position: relative;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.reward-card.claimed {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  opacity: 0.7;
}

.reward-card.today {
  border: 2px solid #ffd700;
  box-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
  transform: scale(1.05);
}

.reward-card.locked {
  background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
  opacity: 0.5;
}

.day-label {
  font-size: 12px;
  color: white;
  font-weight: bold;
  margin-bottom: 8px;
}

.coin-icon {
  font-size: 32px;
  color: #ffd700;
}

.amount {
  font-size: 14px;
  color: white;
  font-weight: bold;
  margin-top: 8px;
}

.claim-section {
  padding: 0 20px;
}

.claim-btn {
  --background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --background-hover: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
  font-size: 18px;
  font-weight: bold;
  height: 50px;
}

.claim-btn.disabled {
  --background: #6c757d;
  opacity: 0.6;
}
</style>
