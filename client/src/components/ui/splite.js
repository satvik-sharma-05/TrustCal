'use client';

import React, { Suspense, lazy } from 'react';

const Spline = lazy(() => import('@splinetool/react-spline'));

/**
 * SplineScene - Lazy-loaded Spline 3D scene (no cursor-follow).
 * For cursor-follow robot use SplineRobotSection instead.
 */
export function SplineScene({ scene, className }) {
  return (
    <Suspense
      fallback={
        <div className="w-full h-full flex items-center justify-center bg-black/50">
          <div className="w-10 h-10 rounded-full border-2 border-zinc-500/40 border-t-zinc-400 animate-spin" />
        </div>
      }
    >
      <Spline
        scene={scene}
        className={className}
        renderOnDemand={false}
      />
    </Suspense>
  );
}
