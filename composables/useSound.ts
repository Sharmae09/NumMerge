import type { SoundId } from '~/plugins/sound.client';

export const useSound = () => {
  const { $playSound } = useNuxtApp();
  return {
    playSound: (id: SoundId) => $playSound(id),
  };
};
