import { AdMob, BannerAdSize, BannerAdPosition, AdMobBannerSize } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';
import { ADMOB_IDS } from '../constants';

export const isNative = Capacitor.isNativePlatform();

export const initAdMob = async () => {
  if (!isNative) return;
  try {
    await AdMob.initialize({
      requestTrackingAuthorization: true,
      testingDevices: ['2077ef9a63d2b398840261c8221a0c9b'], // Optional: Add your device ID for testing
      initializeForTesting: true,
    });
    console.log("AdMob Initialized");
  } catch (e) {
    console.error("AdMob Init Error", e);
  }
};

export const showBanner = async () => {
  if (!isNative) return;
  try {
    await AdMob.showBanner({
      adId: ADMOB_IDS.banner,
      adSize: BannerAdSize.BANNER,
      position: BannerAdPosition.BOTTOM_CENTER,
      margin: 0,
      isTesting: true, // Remove this in production if you use real IDs
    });
  } catch (e) {
    console.error("Show Banner Error", e);
  }
};

export const hideBanner = async () => {
  if (!isNative) return;
  try {
    await AdMob.hideBanner();
  } catch (e) {
    console.error("Hide Banner Error", e);
  }
};

export const showInterstitial = async () => {
  if (!isNative) return;
  try {
    await AdMob.prepareInterstitial({
      adId: ADMOB_IDS.interstitial,
      isTesting: true,
    });
    await AdMob.showInterstitial();
  } catch (e) {
    console.error("Show Interstitial Error", e);
  }
};

// Returns TRUE if ad was watched, FALSE if failed or cancelled
export const showRewarded = async (): Promise<boolean> => {
  if (!isNative) return false; // Not native, let the app handle fallback
  
  return new Promise(async (resolve) => {
    try {
      await AdMob.prepareRewardVideoAd({
        adId: ADMOB_IDS.rewarded,
        isTesting: true,
      });
      
      const rewardListener = await AdMob.addListener('onRewardVideoReward', (info) => {
        resolve(true); // User watched it
        rewardListener.remove();
      });

      const closeListener = await AdMob.addListener('onRewardVideoAdDismissed', () => {
         // If dismissed without reward, we might have resolved already or not.
         // Usually reward fires first.
      });

      await AdMob.showRewardVideoAd();
    } catch (e) {
      console.error("Show Reward Error", e);
      resolve(false);
    }
  });
};