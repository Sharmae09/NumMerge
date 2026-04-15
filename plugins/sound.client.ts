// import { Capacitor } from "@capacitor/core";
// import { NativeAudio } from "@capacitor-community/native-audio";

// export const soundList = {
//   "game-start": "sounds/game-start.mp3",
//   "game-over": "sounds/game-over.mp3",
//   "activate-power": "sounds/game-bonus.mp3",
//   "collect-gems": "sounds/collect-gems.mp3",
//   "select-power": "sounds/select-power.mp3",
//   "new-bestblock": "sounds/new-bestblock.mp3",
//   menu: "sounds/menu-selection.mp3",
//   shoot: "sounds/shoot1.mp3",
//   merge: "sounds/merge.mp3",
// } as const;

// // Strong union
// export type SoundId = keyof typeof soundList;

// // Strong map type
// const htmlAudioCache: Partial<Record<SoundId, HTMLAudioElement>> = {};

// let isNative = false;

// export default defineNuxtPlugin(async () => {
//   isNative = Capacitor.isNativePlatform();

//   const keys = Object.keys(soundList) as SoundId[];

//   if (isNative) {
//     // Native preload
//     for (const key of keys) {
//       try {
//         await NativeAudio.preload({
//           assetId: key,
//           assetPath: soundList[key], // path inside /public
//           isUrl: false, // MUST be false for bundled assets
//           volume: 1.0,
//         });
//       } catch (err) {
//         console.error(`❌ Failed to preload ${key}:`, err);
//       }
//     }
//   } else {
//     // Web fallback
//     for (const key of keys) {
//       const audio = new Audio(`/${soundList[key]}`);
//       htmlAudioCache[key] = audio;
//     }
//   }

//   const playSound = (id: SoundId) => {
//     if (!soundList[id]) {
//       console.warn(`Unknown sound id: ${id}`);
//       return;
//     }

//     if (isNative) {
//       NativeAudio.play({ assetId: id }).catch((err) => {
//         console.error(`❌ Failed to play native sound ${id}:`, err);
//       });
//     } else {
//       const audio = htmlAudioCache[id];
//       if (audio) {
//         audio.currentTime = 0;
//         audio.play().catch((err) => console.error(err));
//       }
//     }
//   };

//   return {
//     provide: {
//       playSound,
//     },
//   };
// });
// import { Capacitor } from "@capacitor/core";
// import { NativeAudio } from "@capacitor-community/native-audio";

// export const soundList = {
//   "game-start": "sounds/game-start.mp3",
//   "game-over": "sounds/game-over.mp3",
//   "activate-power": "sounds/game-bonus.mp3",
//   "collect-gems": "sounds/collect-gems.mp3",
//   "select-power": "sounds/select-power.mp3",
//   "new-bestblock": "sounds/new-bestblock.mp3",
//   menu: "sounds/menu-selection.mp3",
//   shoot: "sounds/shoot1.mp3",
//   merge: "sounds/merge.mp3",
// } as const;

// export type SoundId = keyof typeof soundList;

// const htmlAudioCache: Partial<Record<SoundId, HTMLAudioElement>> = {};

// let isNative = false;

// // 👇 This is the part you're replacing/updating
// export default defineNuxtPlugin(async () => {
//   isNative = Capacitor.isNativePlatform();

//   console.log("🔊 Sound Plugin Init - isNative:", isNative);
//   console.log("🔊 Platform:", Capacitor.getPlatform());

//   const keys = Object.keys(soundList) as SoundId[];

//   if (isNative) {
//     console.log("🔊 Loading native sounds...");
//     for (const key of keys) {
//       try {
//         const assetPath = `public/${soundList[key]}`;
//         console.log(`🔊 Preloading ${key} from ${assetPath}`);

//         await NativeAudio.preload({
//           assetId: key,
//           assetPath: assetPath,
//           isUrl: false,
//           volume: 1.0,
//         });

//         console.log(`✅ Loaded ${key}`);
//       } catch (err) {
//         console.error(`❌ Failed to preload ${key}:`, err);
//       }
//     }
//   } else {
//     console.log("🔊 Loading web sounds...");
//     for (const key of keys) {
//       const audio = new Audio(`/${soundList[key]}`);
//       htmlAudioCache[key] = audio;
//       console.log(`✅ Web audio cached: ${key}`);
//     }
//   }

//   const playSound = (id: SoundId) => {
//     console.log(`🔊 Attempting to play: ${id}`);

//     if (!soundList[id]) {
//       console.warn(`Unknown sound id: ${id}`);
//       return;
//     }

//     if (isNative) {
//       console.log(`🔊 Playing native sound: ${id}`);
//       NativeAudio.play({ assetId: id }).catch((err) => {
//         console.error(`❌ Failed to play native sound ${id}:`, err);
//       });
//     } else {
//       const audio = htmlAudioCache[id];
//       if (audio) {
//         audio.currentTime = 0;
//         audio.play().catch((err) => console.error(err));
//       }
//     }
//   };

//   return {
//     provide: {
//       playSound,
//     },
//   };
// });

import { Capacitor } from "@capacitor/core";
import { NativeAudio } from "@capacitor-community/native-audio";

export const soundList = {
  "game-start": "sounds/game-start.mp3",
  "game-over": "sounds/game-over.mp3",
  "activate-power": "sounds/game-bonus.mp3",
  "collect-gems": "sounds/collect-gems.mp3",
  "select-power": "sounds/select-power.mp3",
  "new-bestblock": "sounds/new-bestblock.mp3",
  menu: "sounds/menu-selection.mp3",
  shoot: "sounds/shoot1.mp3",
  merge: "sounds/merge.mp3",
} as const;

// Strong union
export type SoundId = keyof typeof soundList;

// Strong map type
const htmlAudioCache: Partial<Record<SoundId, HTMLAudioElement>> = {};

let isNative = false;

export default defineNuxtPlugin(async () => {
  isNative = Capacitor.isNativePlatform();

  // alert(`🔊 Sound Plugin Init - isNative: ${isNative}, Platform: ${Capacitor.getPlatform()}`);

  const keys = Object.keys(soundList) as SoundId[];

  if (isNative) {
    // alert("🔊 Starting to load native sounds...");

    for (const key of keys) {
      try {
        const assetPath = `public/${soundList[key]}`;

        await NativeAudio.preload({
          assetId: key,
          assetPath: assetPath,
          isUrl: false,
          volume: 1.0,
        });

        // alert(`✅ Loaded ${key}`);
      } catch (err: any) {
        // alert(`❌ Failed to preload ${key}: ${JSON.stringify(err)}`);
        console.error(`❌ Failed to preload ${key}:`, err);
      }
    }

    // alert("🔊 All sounds loaded!");
  } else {
    // Web fallback
    for (const key of keys) {
      const audio = new Audio(`/${soundList[key]}`);
      htmlAudioCache[key] = audio;
    }
  }

  const playSound = (id: SoundId) => {
    if (!soundList[id]) {
      alert(`Unknown sound id: ${id}`);
      return;
    }

    if (isNative) {
      NativeAudio.play({ assetId: id }).catch((err: any) => {
        // alert(`❌ Failed to play ${id}: ${JSON.stringify(err)}`);
        console.error(`❌ Failed to play native sound ${id}:`, err);
      });
    } else {
      const audio = htmlAudioCache[id];
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch((err: any) => console.error(err));
      }
    }
  };

  return {
    provide: {
      playSound,
    },
  };
});