import React from 'react';

const lineWrapperTops = ['top-[10%]', 'top-[30%]', 'top-[50%]', 'top-[70%]', 'top-[90%]'];

/**
 * Grid + animated horizontal lines + corner SVG lines. Use as a decorative layer behind dashboard content.
 */
const AnimatedGridBackground = ({ className = '' }) => {
  return (
    <>
      {/* Grid */}
      <div
        className={`absolute inset-0 w-full h-full bg-[length:50px_50px] animate-grid-move z-0 ${className}`}
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,149,0,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,149,0,0.07) 1px, transparent 1px)
          `,
        }}
        aria-hidden
      />
      <div className="absolute inset-0 w-full h-full overflow-hidden z-[1] pointer-events-none">
        {lineWrapperTops.map((topClass, index) => (
          <div key={index} className={`absolute w-full h-[100px] ${topClass}`}>
            <div className="w-full h-0.5 relative overflow-hidden">
              <div
                className={`absolute top-0 w-full h-full ${index % 2 !== 0 ? 'animate-line-move-reverse' : 'animate-line-move'}`}
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, #ff9500 20%, #ffd700 50%, #ff9500 80%, transparent 100%)',
                }}
              />
            </div>
          </div>
        ))}
      </div>
      {/* Corner lines - hidden on small screens */}
      <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[100px] z-[5] pointer-events-none">
        <svg
          className="absolute top-1/2 -translate-y-1/2 left-[-150px] w-[120px] h-[60px] animate-corner-line"
          viewBox="0 0 120 60"
          stroke="#ff9500"
          strokeWidth="2"
          fill="none"
          strokeDasharray="50"
          aria-hidden
        >
          <path d="M120 0 L20 0 Q0 0 0 20 L0 60" />
        </svg>
        <svg
          className="absolute top-1/2 -translate-y-1/2 right-[-150px] w-[120px] h-[60px] scale-x-[-1] animate-corner-line"
          style={{ animationDelay: '3s' }}
          viewBox="0 0 120 60"
          stroke="#ff9500"
          strokeWidth="2"
          fill="none"
          strokeDasharray="50"
          aria-hidden
        >
          <path d="M120 0 L20 0 Q0 0 0 20 L0 60" />
        </svg>
      </div>
    </>
  );
};

export default AnimatedGridBackground;
