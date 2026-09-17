/**
 * Urcheck Audio System
 * URLs provided by administrator for positive chime and failure sound
 */

export const NOTIFICATION_CHIME_URL = 'https://ljymwaifrkaedgmpdpwv.supabase.co/storage/v1/object/public/notificaciones/djamban_studio-notification-chime-sfx-9-598577.mp3';
export const NEGATIVE_ERROR_SOUND_URL = 'https://ljymwaifrkaedgmpdpwv.supabase.co/storage/v1/object/public/notificaciones/sonidonegativo.mp3';

// Audio object cache to prevent lag and garbage collection delays
let positiveAudioCache: HTMLAudioElement | null = null;
let negativeAudioCache: HTMLAudioElement | null = null;

export const playSystemNotificationSound = async () => {
  try {
    if (!positiveAudioCache) {
      positiveAudioCache = new Audio(NOTIFICATION_CHIME_URL);
      positiveAudioCache.preload = 'auto';
    } else {
      positiveAudioCache.currentTime = 0;
    }
    await positiveAudioCache.play();
  } catch (err) {
    // Browsers block autoplay before user interaction or if permissions pending
    console.warn('Playback of positive chime was prevented by browser policy:', err);
  }
};

export const playSystemNegativeSound = async () => {
  try {
    if (!negativeAudioCache) {
      negativeAudioCache = new Audio(NEGATIVE_ERROR_SOUND_URL);
      negativeAudioCache.preload = 'auto';
    } else {
      negativeAudioCache.currentTime = 0;
    }
    await negativeAudioCache.play();
  } catch (err) {
    console.warn('Playback of negative sound was prevented by browser policy:', err);
  }
};
