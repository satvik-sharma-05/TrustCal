import React, { useRef, useEffect, Suspense, lazy } from 'react';

const Spline = lazy(() => import('@splinetool/react-spline'));

const SPLINE_SCENE = 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode';

const POSSIBLE_ROBOT_NAMES = [
  'Robot', 'robot', 'Character', 'character', 'Cube', 'Mesh', 'Object',
  'Head', 'head', 'Body', 'Arm', 'Model', 'Scene', 'Group', 'Spline'
];

function findRobotObject(app) {
  if (!app) return null;
  for (const name of POSSIBLE_ROBOT_NAMES) {
    try {
      const obj = app.findObjectByName(name);
      if (obj && obj.position) return obj;
    } catch (_) {}
  }
  try {
    if (typeof app.getAllObjects === 'function') {
      const all = app.getAllObjects();
      const withPos = all.filter((o) => o && o.position && typeof o.position.x === 'number');
      const skip = (o) => o.name && /camera|light|ambient|scene/i.test(String(o.name));
      const preferred = withPos.find((o) =>
        o.name && /robot|character|mesh|body|head|model|cube|object/i.test(String(o.name)) && !skip(o)
      );
      const fallback = withPos.find((o) => !skip(o));
      return preferred || fallback || withPos[0] || null;
    }
  } catch (_) {}
  return null;
}

/**
 * Robot section - Spline scene with cursor-follow.
 * Mouse position stored in ref so it's ready when Spline loads.
 * Updates position + rotation on the found object so the robot follows the cursor.
 */
const SplineRobotSection = () => {
  const containerRef = useRef(null);
  const splineRef = useRef(null);
  const targetObjRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let rafId = null;
    let currentX = 0;
    let currentY = 0;
    const lerp = 0.18;
    const positionScale = 8;
    const rotationScale = Math.PI * 0.5;

    const tick = () => {
      const app = splineRef.current;
      const obj = targetObjRef.current;
      const { x: targetX, y: targetY } = mouseRef.current;
      currentX += (targetX - currentX) * lerp;
      currentY += (targetY - currentY) * lerp;

      if (app) {
        try {
          if (typeof app.setVariable === 'function') {
            app.setVariable('mouseX', currentX);
            app.setVariable('mouseY', currentY);
          }
        } catch (_) {}
        if (obj && obj.position) {
          obj.position.x = currentX * positionScale;
          obj.position.y = currentY * positionScale;
          if (obj.rotation) {
            obj.rotation.y = currentX * rotationScale;
            obj.rotation.x = -currentY * rotationScale;
          }
        }
        if (typeof app.requestRender === 'function') {
          app.requestRender();
        }
      }
      rafId = requestAnimationFrame(tick);
    };

    const onMouseMove = (e) => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const x = (e.clientX / w) * 2 - 1;
      const y = -((e.clientY / h) * 2 - 1);
      mouseRef.current = { x, y };
    };

    rafId = requestAnimationFrame(tick);
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  const onLoad = (app) => {
    splineRef.current = app;
    targetObjRef.current = findRobotObject(app);
    mouseRef.current = { x: 0, y: 0 };
    try {
      if (typeof app.setVariable === 'function') {
        app.setVariable('mouseX', 0);
        app.setVariable('mouseY', 0);
      }
    } catch (_) {}
  };

  return (
    <section
      ref={containerRef}
      className="relative w-full h-full min-h-[320px] bg-gradient-to-b from-black/40 to-transparent overflow-visible"
      aria-label="Robot"
    >
      <Suspense
        fallback={
          <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/90">
            <div className="w-12 h-12 rounded-full border-2 border-zinc-500/50 border-t-zinc-400 animate-spin" />
          </div>
        }
      >
        <Spline
          scene={SPLINE_SCENE}
          onLoad={onLoad}
          renderOnDemand={false}
          className="absolute inset-0 w-full h-full"
        />
      </Suspense>
    </section>
  );
};

export default SplineRobotSection;
