import { defineNuxtPlugin } from "#app";
import {
  IonBadge,
  IonicVue,
  IonPage,
  IonHeader,
  IonFooter,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonLabel,
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonRouterOutlet,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardContent,
  IonCardTitle,
  IonCardSubtitle,
  IonList,
  IonItem,
  IonMenu,
  IonMenuButton,
  IonButtons,
  IonThumbnail,
  IonFab,
  IonFabButton,
  IonItemDivider,
  IonNote,
  IonCol,
  IonGrid,
  popoverController,
  IonPopover,
  IonInput,
  IonSegment,
  IonSegmentButton,
  IonSelect,
  IonSelectOption,
  alertController,
  IonSearchbar,
  IonModal,
  IonRow,
  IonToggle,
  IonBackButton,
  IonRange,
  IonSpinner,
} from "@ionic/vue";
import {
  volumeHighOutline,
  phonePortraitOutline,
  colorPaletteOutline,
  closeOutline,
} from "ionicons/icons";
import { addIcons } from "ionicons";
// Import Ionic's core CSS
import "@ionic/vue/css/core.css";
import "@ionic/vue/css/normalize.css";
import "@ionic/vue/css/structure.css";
import "@ionic/vue/css/typography.css";

export default defineNuxtPlugin((nuxtApp) => {
  // 1️⃣ Install IonicVue plugin first
  nuxtApp.vueApp.use(IonicVue);

  // 2️⃣ Register components globally
  const components = {
    IonRange,
    IonSpinner,
    IonToggle,
    IonPage,
    IonModal,
    IonRow,
    IonHeader,
    IonFooter,
    IonToolbar,
    IonTitle,
    IonContent,
    IonButton,
    IonLabel,
    IonTabs,
    IonTabBar,
    IonTabButton,
    IonRouterOutlet,
    IonIcon,
    IonCard,
    IonCardHeader,
    IonCardContent,
    IonCardTitle,
    IonCardSubtitle,
    IonList,
    IonItem,
    IonMenu,
    IonMenuButton,
    IonButtons,
    IonThumbnail,
    IonFab,
    IonFabButton,
    IonItemDivider,
    IonNote,
    IonCol,
    IonGrid,
    popoverController,
    IonPopover,
    IonInput,
    IonSelect,
    IonSelectOption,
    IonSegment,
    IonSegmentButton,
    alertController,
    IonBadge,
    IonBackButton,
    IonSearchbar,
  };

  addIcons({
    "volume-high-outline": volumeHighOutline,
    "vibration-outline": phonePortraitOutline,
    "color-palette-outline": colorPaletteOutline,
    "close-outline": closeOutline,
  });

  Object.entries(components).forEach(([key, component]) => {
    nuxtApp.vueApp.component(key, component);
  });
});
