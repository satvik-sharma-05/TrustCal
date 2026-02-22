import React, { useRef, useEffect, useCallback, useState } from 'react';

const TUBES_SCRIPT = 'https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js';
const FADE_OUT_MS = 600;

const TubesLanding = ({ onEnter }) => {
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let mounted = true;
    const initTubes = (TubesCursor) => {
      if (!mounted || !canvas || typeof TubesCursor !== 'function') return;
      try {
        appRef.current = TubesCursor(canvas, {
          tubes: {
            colors: ['#00FF41', '#00CC33', '#00FF41'],
            lights: {
              intensity: 400,
              colors: ['#00FF41', '#00CC33', '#00F5FF', '#00FF41'],
            },
          },
        });
      } catch (e) {
        console.warn('TubesCursor init:', e);
      }
    };

    // CDN script is ESM ("export") — must load with type="module" to avoid SyntaxError
    const onReady = () => {
      if (!mounted || !canvas) return;
      const TubesCursor = window.__TubesCursor;
      if (TubesCursor) initTubes(TubesCursor);
    };

    if (window.__TubesCursor) {
      onReady();
      return () => { mounted = false; appRef.current = null; };
    }

    const handleReady = () => {
      onReady();
      window.removeEventListener('tubes-ready', handleReady);
    };
    window.addEventListener('tubes-ready', handleReady);

    const script = document.createElement('script');
    script.type = 'module';
    script.textContent = `
      import('${TUBES_SCRIPT}')
        .then(m => { window.__TubesCursor = m.default || m.TubesCursor || m; window.dispatchEvent(new Event('tubes-ready')); })
        .catch(() => window.dispatchEvent(new Event('tubes-ready')));
    `;
    document.body.appendChild(script);

    return () => {
      mounted = false;
      window.removeEventListener('tubes-ready', handleReady);
      if (script.parentNode) script.parentNode.removeChild(script);
      appRef.current = null;
    };
  }, []);

  const handleClick = useCallback(() => {
    if (exiting) return;
    if (appRef.current && appRef.current.tubes) {
      try {
        // Stick to Matrix palette
        const colors = ['#00FF41', '#00CC33', '#00F5FF'];
        const lightsColors = ['#00FF41', '#00F5FF', '#00CC33', '#00FF41'];
        appRef.current.tubes.setColors(colors);
        appRef.current.tubes.setLightsColors(lightsColors);
      } catch (err) {
        console.warn('Tubes setColors:', err);
      }
    }
    setExiting(true);
  }, [exiting]);

  useEffect(() => {
    if (!exiting) return;
    const id = setTimeout(() => onEnter(), FADE_OUT_MS);
    return () => clearTimeout(id);
  }, [exiting, onEnter]);

  return (
    <div
      id="app"
      className={`fixed inset-0 w-full h-full m-0 transition-opacity duration-[800ms] ease-in-out ${exiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100'}`}
      style={{ touchAction: 'none', backgroundColor: '#000' }}
    >
      <canvas
        ref={canvasRef}
        id="canvas"
        className="fixed top-0 right-0 bottom-0 left-0 w-full h-full overflow-hidden"
        style={{ display: 'block', pointerEvents: 'none' }}
        aria-hidden
      />
      <div
        className="hero relative h-full flex flex-col items-center justify-center gap-6 cursor-pointer z-10"
        onClick={handleClick}
        onKeyDown={(e) => { if (e.key === 'Enter' && !exiting) { e.preventDefault(); setExiting(true); } }}
        role="button"
        tabIndex={0}
        aria-label="Initialize Secure Uplink"
      >
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-3 mb-6 opacity-40">
            <div className="w-2 h-2 bg-primary animate-pulse" />
            <span className="text-[10px] font-mono font-black tracking-[0.5em] text-primary uppercase">Secure_Uplink_v4.0</span>
          </div>
          <h1 className="m-0 p-0 text-white leading-[100%] select-none text-[90px] font-black uppercase tracking-tighter mix-blend-difference" style={{ fontFamily: 'var(--font-sans)', textShadow: '0 0 30px rgba(0, 255, 65, 0.4)' }}>
            PulseGuard<span className="text-primary italic">.ai</span>
          </h1>
          <h2 className="m-0 p-0 text-primary leading-[100%] select-none text-[20px] font-black uppercase tracking-[0.8em] mt-6 opacity-80" style={{ fontFamily: 'var(--font-mono)' }}>
            Adaptive_Defense_Shell
          </h2>
        </div>

        <div className="mt-20 flex flex-col items-center gap-6 group">
          <div className="w-12 h-[1px] bg-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-primary animate-line-move" />
          </div>
          <span className="text-primary/40 group-hover:text-primary transition-all duration-300 no-underline text-[9px] font-black tracking-[0.4em] uppercase font-mono">
            Execute_Bypass_Protocol
          </span>
        </div>
      </div>
    </div>
  );
};

export default TubesLanding;
