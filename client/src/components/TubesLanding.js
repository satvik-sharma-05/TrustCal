import React, { useRef, useEffect, useCallback, useState } from 'react';

const TUBES_SCRIPT = 'https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js';
const FADE_OUT_MS = 600;

function randomColors(count) {
  return new Array(count)
    .fill(0)
    .map(() => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'));
}

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
            colors: ['#f967fb', '#53bc28', '#6958d5'],
            lights: {
              intensity: 200,
              colors: ['#83f36e', '#fe8a2e', '#ff008a', '#60aed5'],
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
        const colors = randomColors(3);
        const lightsColors = randomColors(4);
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
      className={`fixed inset-0 w-full h-full m-0 transition-opacity duration-[600ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] ${exiting ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      style={{ touchAction: 'none', fontFamily: "'Montserrat', serif" }}
    >
      <canvas
        ref={canvasRef}
        id="canvas"
        className="fixed top-0 right-0 bottom-0 left-0 w-full h-full overflow-hidden"
        style={{ display: 'block', pointerEvents: 'none' }}
        aria-hidden
      />
      <div
        className="hero relative h-full flex flex-col items-center justify-center gap-[10px] cursor-pointer z-10"
        onClick={handleClick}
        onKeyDown={(e) => { if (e.key === 'Enter' && !exiting) { e.preventDefault(); setExiting(true); } }}
        role="button"
        tabIndex={0}
        aria-label="Enter PulseGuard"
      >
        <h1 className="m-0 p-0 text-white leading-[100%] select-none text-[80px] font-bold uppercase" style={{ textShadow: '0 0 20px rgba(0,0,0,1)' }}>
          PulseGuard
        </h1>
        <h2 className="m-0 p-0 text-white leading-[100%] select-none text-[60px] font-medium uppercase" style={{ textShadow: '0 0 20px rgba(0,0,0,1)' }}>
          Identity Risk
        </h2>
        <span className="text-white no-underline mt-2 text-sm tracking-widest uppercase">
          Click to enter
        </span>
      </div>
    </div>
  );
};

export default TubesLanding;
