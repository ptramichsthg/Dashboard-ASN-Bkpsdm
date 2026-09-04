import React, { useState, useEffect } from 'react';
import bgimage1 from '../assets/login-loading-state/bgimage1.png';
import bgimage2 from '../assets/login-loading-state/bgimage2.png';
import asnManBesarKiri from '../assets/login-loading-state/ASN Man Besar Kiri untuk bgimage1.png';
import asnManKecilKiri from '../assets/login-loading-state/ASN Man Kecil Kiri untuk bgimage2.png';
import asnWomenBesarKanan from '../assets/login-loading-state/ASN Women Besar Kanan untuk bgimage2.png';
import asnWomenKecilKanan from '../assets/login-loading-state/ASN Women Kecil Kanan untuk bgimage1.png';

const LoginLoadingState = ({ message = 'Sedang masuk...' }) => {
  const [currentState, setCurrentState] = useState(0); // 0 = State 1, 1 = State 2

  useEffect(() => {
    // Berganti state setiap 2.5 detik untuk animasi smooth
    const interval = setInterval(() => {
      setCurrentState((prev) => (prev + 1) % 2);
    }, 2500);

    return () => clearInterval(interval);
  }, []);

  // State 1: Man Besar Kiri + Women Kecil Kanan (bgimage1)
  // State 2: Women Besar Kanan + Man Kecil Kiri (bgimage2)

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        zIndex: 10000,
        backgroundColor: '#1e293b',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Background Layer dengan smooth transition */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
        }}
      >
        {/* Background 1 */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${bgimage1})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: currentState === 0 ? 1 : 0,
            transition: 'opacity 1.2s ease-in-out',
          }}
        />
        {/* Background 2 */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${bgimage2})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            opacity: currentState === 1 ? 1 : 0,
            transition: 'opacity 1.2s ease-in-out',
          }}
        />
      </div>

      {/* Characters Group Container - Centered */}
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '20px',
          width: '100%',
          maxWidth: '800px',
          height: 'auto',
          padding: '0 20px',
          marginBottom: '80px', // Space for text below
          zIndex: 5,
        }}
      >
        {/* ASN Man Besar Kiri (State 1) */}
        <img
          src={asnManBesarKiri}
          alt="ASN Man"
          style={{
            maxWidth: '280px',
            maxHeight: '400px',
            width: '40%',
            height: 'auto',
            objectFit: 'contain',
            opacity: currentState === 0 ? 1 : 0,
            transform: currentState === 0 ? 'translateX(0)' : 'translateX(-80px)',
            transition: 'opacity 1s ease-in-out, transform 1.2s ease-in-out',
            position: 'absolute',
            left: '50%',
            marginLeft: '-180px', // Center adjustment for left character
          }}
        />

        {/* ASN Man Kecil Kiri (State 2) */}
        <img
          src={asnManKecilKiri}
          alt="ASN Man Small"
          style={{
            maxWidth: '220px',
            maxHeight: '320px',
            width: '32%',
            height: 'auto',
            objectFit: 'contain',
            opacity: currentState === 1 ? 1 : 0,
            transform: currentState === 1 ? 'translateX(0)' : 'translateX(-80px)',
            transition: 'opacity 1s ease-in-out, transform 1.2s ease-in-out',
            position: 'absolute',
            left: '50%',
            marginLeft: '-160px', // Center adjustment for left character
          }}
        />

        {/* ASN Women Kecil Kanan (State 1) */}
        <img
          src={asnWomenKecilKanan}
          alt="ASN Women Small"
          style={{
            maxWidth: '220px',
            maxHeight: '320px',
            width: '32%',
            height: 'auto',
            objectFit: 'contain',
            opacity: currentState === 0 ? 1 : 0,
            transform: currentState === 0 ? 'translateX(0)' : 'translateX(80px)',
            transition: 'opacity 1s ease-in-out, transform 1.2s ease-in-out',
            position: 'absolute',
            right: '50%',
            marginRight: '-160px', // Center adjustment for right character
          }}
        />

        {/* ASN Women Besar Kanan (State 2) */}
        <img
          src={asnWomenBesarKanan}
          alt="ASN Women"
          style={{
            maxWidth: '280px',
            maxHeight: '400px',
            width: '40%',
            height: 'auto',
            objectFit: 'contain',
            opacity: currentState === 1 ? 1 : 0,
            transform: currentState === 1 ? 'translateX(0)' : 'translateX(80px)',
            transition: 'opacity 1s ease-in-out, transform 1.2s ease-in-out',
            position: 'absolute',
            right: '50%',
            marginRight: '-180px', // Center adjustment for right character
          }}
        />
      </div>

      {/* Text Overlay */}
      <div
        style={{
          position: 'absolute',
          bottom: '12%',
          left: '50%',
          transform: 'translateX(-50%)',
          textAlign: 'center',
          zIndex: 10,
          width: '100%',
          padding: '0 20px',
        }}
      >
        {/* Loading Text */}
        <div
          style={{
            fontSize: 'clamp(1.2rem, 4vw, 1.8rem)',
            fontWeight: 700,
            color: '#ffffff',
            textShadow: '0 2px 12px rgba(0,0,0,0.6), 0 0 30px rgba(0,0,0,0.4)',
            marginBottom: '1.5rem',
            letterSpacing: '0.5px',
          }}
        >
          {message}
        </div>

        {/* Animated Dots */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: '#ffffff',
                boxShadow: '0 2px 8px rgba(0,0,0,0.4), 0 0 20px rgba(255,255,255,0.3)',
                animation: `dotBounce 1.4s infinite ease-in-out ${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Keyframes for dot animation */}
      <style>{`
        @keyframes dotBounce {
          0%, 80%, 100% {
            opacity: 0.4;
            transform: scale(0.8);
          }
          40% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          /* Mobile: Reduce character sizes and spacing */
        }

        @media (max-width: 480px) {
          /* Small mobile: Further reduce sizes */
        }
      `}</style>
    </div>
  );
};

export default LoginLoadingState;
