'use client';

import React from 'react';
import { SplineScene } from './splite';
import { Card } from './card';
import { Spotlight } from './spotlight';

const SPLINE_SCENE_URL = 'https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode';

/**
 * Demo: Card with spotlight and Spline 3D scene (left copy, right scene).
 * Used for dashboard hero or standalone 3D showcase.
 */
export function SplineSceneBasic() {
  return (
    <Card className="w-full h-[500px] bg-black/[0.96] relative overflow-hidden border-white/10">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="rgb(34, 197, 94)"
      />
      <div className="flex h-full">
        <div className="flex-1 p-8 relative z-10 flex flex-col justify-center">
          <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 font-display">
            Interactive 3D
          </h1>
          <p className="mt-4 text-neutral-300 max-w-lg">
            Bring your UI to life with beautiful 3D scenes. Create immersive experiences
            that capture attention and enhance your design.
          </p>
        </div>
        <div className="flex-1 relative">
          <SplineScene
            scene={SPLINE_SCENE_URL}
            className="w-full h-full"
          />
        </div>
      </div>
    </Card>
  );
}
