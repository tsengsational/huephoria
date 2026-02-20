import React, { useEffect } from 'react';

/**
 * AdBanner Component
 * Renders a sticky footer Google AdSense ad unit.
 */
const AdBanner = ({ slot }) => {
    useEffect(() => {
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

        // Give the DOM a moment to settle
        const timer = setTimeout(pushAd, 300);
        return () => clearTimeout(timer);
    }, [slot]);

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] flex justify-center bg-white/80 backdrop-blur-md border-t border-gray-100 p-2 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <div className="w-full max-w-lg overflow-hidden flex justify-center items-center h-[60px]">
                <ins
                    className="adsbygoogle"
                    style={{ display: 'inline-block', width: '100%', height: '60px' }}
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
