import React, { useEffect, useState } from 'react';
import { AdMob, BannerAdPosition, BannerAdSize, BannerAdPluginEvents } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

/**
 * AdBanner Component
 * Renders a platform-aware ad unit:
 * - Web: Google AdSense Footer
 * - Mobile (iOS/Android): Native AdMob Banner
 */
const AdBanner = ({ slot }) => {
    const [isNative, setIsNative] = useState(Capacitor.isNativePlatform());

    useEffect(() => {
        if (isNative) {
            // Mobile AdMob Logic
            const showBanner = async () => {
                try {
                    const isIos = Capacitor.getPlatform() === 'ios';

                    // Using AdMob Test IDs for initial integration
                    // Real IDs should be moved to .env later
                    const adId = isIos
                        ? 'ca-app-pub-3940256099942544/2934735716' // iOS Test Banner
                        : 'ca-app-pub-3940256099942544/6300978111'; // Android Test Banner

                    await AdMob.showBanner({
                        adId: adId,
                        adSize: BannerAdSize.ADAPTIVE_BANNER,
                        position: BannerAdPosition.BOTTOM_CENTER,
                        margin: 0,
                        isTesting: true,
                    });
                } catch (e) {
                    console.error('AdMob showBanner error:', e);
                }
            };

            showBanner();

            return () => {
                AdMob.removeBanner().catch(e => console.error('AdMob removeBanner error:', e));
            };
        } else {
            // Web AdSense Logic
            const pushAd = () => {
                try {
                    const ads = document.getElementsByClassName('adsbygoogle');
                    for (let i = 0; i < ads.length; i++) {
                        if (ads[i].innerHTML === '') {
                            (window.adsbygoogle = window.adsbygoogle || []).push({});
                        }
                    }
                } catch (e) {
                    console.error('AdSense error:', e);
                }
            };

            const timer = setTimeout(pushAd, 300);
            return () => clearTimeout(timer);
        }
    }, [slot, isNative]);

    // If native, we return a spacer to prevent layout shift since AdMob overlays at bottom
    if (isNative) {
        return <div className="h-[50px] md:h-[60px] w-full" />;
    }

    return (
        <div className="ad-banner fixed bottom-[72px] lg:bottom-0 left-0 right-0 z-[40] flex justify-center bg-white/80 backdrop-blur-md border-t border-gray-100 p-1 md:p-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <div className="ad-banner__container w-full flex justify-center items-center h-[50px] md:h-[60px]">
                <ins
                    className="ad-banner__ins adsbygoogle"
                    style={{ display: 'inline-block', width: '100%', height: '100%' }}
                    data-ad-client={import.meta.env.VITE_ADSENSE_PUB_ID}
                    data-ad-slot={slot || import.meta.env.VITE_ADSENSE_SLOT_ID}
                    data-ad-format="horizontal"
                    data-full-width-responsive="false"
                />
            </div>
        </div>
    );
};

export default AdBanner;
