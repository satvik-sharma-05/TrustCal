import React, { Suspense, lazy } from 'react';

const Spline = lazy(() => import('@splinetool/react-spline'));

const SPLINE_SCENE = 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode';

/**
 * Full-viewport Spline 3D scene as website background
 */
const SplineBackground = () => {
  return (
    <div className="fixed inset-0 w-full h-full z-0">
      <Suspense
        fallback={
          <div className="absolute inset-0 bg-navy-base flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-2 border-purple/40 border-t-purple animate-spin" />
          </div>
        }
      >
        <Spline
          scene={SPLINE_SCENE}
          className="absolute inset-0 w-full h-full"
        />
      </Suspense>
      {/* Dark overlay for content legibility */}
      <div
        className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70 pointer-events-none"
        aria-hidden
      />
    </div>
  );
};

export default SplineBackground;
