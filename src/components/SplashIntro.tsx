'use client';

import React, { useEffect, useState } from 'react';
import { Truck, Sparkles, ArrowRight } from 'lucide-react';

interface SplashIntroProps {
  onComplete: () => void;
}

export const SplashIntro: React.FC<SplashIntroProps> = ({ onComplete }) => {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Auto transition to main app after 3.2 seconds of majestic dramatic intro
    const timer = setTimeout(() => {
      handleClose();
    }, 3200);

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsFading(true);
    setTimeout(() => {
      onComplete();
    }, 700);
  };

  return (
    <div className={`splash-overlay ${isFading ? 'fade-out' : ''}`}>
      {/* Background Orbit Animations */}
      <div className="splash-orbit-1" />
      <div className="splash-orbit-2" />
      <div className="splash-glow-core" />

      {/* Dramatic Content Appearing from Void */}
      <div className="splash-title-wrapper">
        <div className="splash-logo-badge">
          <Truck size={48} color="#050811" strokeWidth={2.5} />
        </div>

        <h1 className="splash-title">المخترز للحاويات</h1>

        <div className="splash-subtitle">
          أنظمة إدارة وتأجير الحاويات التجارية والأنقاض
        </div>
      </div>

      {/* Skip Button */}
      <button 
        id="skip-splash-btn"
        className="splash-skip-btn" 
        onClick={handleClose}
      >
        <span>تخطي العرض والدخول</span>
        <ArrowRight size={16} />
      </button>
    </div>
  );
};
