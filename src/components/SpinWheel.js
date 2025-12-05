'use client';

import React, { useRef } from 'react';

/**
 * Generate distinct colors for wheel slices
 * Uses a large palette + golden angle distribution to avoid repeats
 */
export function generateWheelColors(count) {
  const basePalette = [
    '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E', '#10B981', '#14B8A6',
    '#06B6D4', '#0EA5E9', '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899',
    '#F472B6', '#FB7185', '#9CA3AF', '#FACC15', '#4ADE80', '#34D399', '#2DD4BF', '#38BDF8',
    '#60A5FA', '#818CF8', '#A78BFA', '#C084FC', '#F472B6', '#FDA4AF', '#FBCFE8', '#E0F2FE'
  ];
  
  if (count <= basePalette.length) return basePalette.slice(0, count);

  const colors = [...basePalette];
  const needed = count - basePalette.length;
  const goldenAngle = 137.508;
  
  for (let i = 0; i < needed; i++) {
    const hue = ((i * goldenAngle) % 360).toFixed(2);
    colors.push(`hsl(${hue}, 70%, 55%)`);
  }
  
  return colors;
}

/**
 * Reusable Spin Wheel Component with Collision-Based Winner Detection
 * 
 * @param {Array} items - Array of {text, color} objects to display on wheel
 * @param {number} rotation - Current rotation in degrees
 * @param {boolean} spinning - Whether wheel is currently spinning
 * @param {string} pointerColor - Color of the pointer arrow
 * @param {function} onSliceChange - Callback when pointer enters a new slice
 * @param {function} onSpinComplete - Callback when spinning stops (winner determined)
 * @param {function} onSpinEnd - Callback when spin animation ends
 * @param {number} size - Diameter of wheel in pixels (default 520)
 * @param {boolean} debug - Show debug markers
 */
export function SpinWheel({ items, rotation, spinning, pointerColor = '#ef4444', onSliceChange, onSpinComplete, onSpinEnd, size = 520, debug = false }) {
  const wheelRef = useRef(null);
  const lastSliceIndexRef = useRef(-1);
  const stopTimeoutRef = useRef(null);
  const animationStartTimeRef = useRef(null);
  const animationFrameRef = useRef(null);
  const [currentRotation, setCurrentRotation] = React.useState(rotation);
  
  // Sync currentRotation with rotation prop when not spinning
  React.useEffect(() => {
    if (!spinning) {
      setCurrentRotation(rotation);
    }
  }, [rotation, spinning]);
  const radius = size / 2;
  
  // Calculate current slice based on current rotation
  const debugInfo = React.useMemo(() => {
    if (!items || items.length === 0) return { segmentAngle: 0, normalizedRotation: 0, angleAtPointer: 0 };
    const segmentAngle = 360 / items.length;
    const normalizedRotation = ((currentRotation % 360) + 360) % 360;
    const angleAtPointer = ((-90 + normalizedRotation - segmentAngle / 2) + 360) % 360;
    return { segmentAngle, normalizedRotation, angleAtPointer };
  }, [currentRotation, items]);

  const currentSliceIndex = React.useMemo(() => {
    if (!items || items.length === 0) return -1;
    const newIndex = Math.floor(debugInfo.angleAtPointer / debugInfo.segmentAngle) % items.length;

    // Debug: Log slice changes
    if (debug && newIndex !== lastSliceIndexRef.current && lastSliceIndexRef.current !== -1) {
      const timestamp = new Date().toLocaleTimeString();
      console.log(`[${timestamp}] 🎯 Slice change: ${lastSliceIndexRef.current} → ${newIndex} (${items[newIndex]?.text})`);
    }

    return newIndex;
  }, [debugInfo, items, debug]);

  // Handle spinning animation
  React.useEffect(() => {
    if (spinning) {
      const startTime = Date.now();
      const startRotation = currentRotation;
      const targetRotation = rotation;
      const duration = 12000; // 12 seconds for debugging
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function to match the original cubic-bezier
        const easedProgress = 1 - Math.pow(1 - progress, 3);
        
        const currentRot = startRotation + (targetRotation - startRotation) * easedProgress;
        setCurrentRotation(currentRot);
        
        if (progress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          // Animation complete, notify parent
          onSpinEnd?.();
        }
      };
      
      animate();
    } else {
      // When not spinning, sync with the target rotation
      setCurrentRotation(rotation);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinning, rotation]);

  // Handle slice changes
  React.useEffect(() => {
    if (currentSliceIndex !== lastSliceIndexRef.current && currentSliceIndex >= 0 && items[currentSliceIndex]) {
      const currentSlice = items[currentSliceIndex];
      if (debug) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] 🎨 onSliceChange: ${currentSlice.text} (${currentSlice.color})`);
      }
      onSliceChange?.(currentSlice);
      lastSliceIndexRef.current = currentSliceIndex;
    }
  }, [currentSliceIndex, items, onSliceChange, debug]);

  // Handle spin completion
  React.useEffect(() => {
    if (spinning) {
      // Clear any existing timeout
      if (stopTimeoutRef.current) {
        clearTimeout(stopTimeoutRef.current);
        stopTimeoutRef.current = null;
      }
    } else {
      // Wheel stopped, capture the winning slice immediately
      const winningSliceIndex = currentSliceIndex;
      const winningSlice = items[winningSliceIndex];

      if (debug && winningSlice) {
        const timestamp = new Date().toLocaleTimeString();
        console.log(`[${timestamp}] 🎯 Winner captured: ${winningSlice.text} (${winningSlice.color}) - will announce in 2s`);
      }

      // Wait 2 seconds then determine winner
      stopTimeoutRef.current = setTimeout(() => {
        if (winningSlice) {
          const announceTimestamp = new Date().toLocaleTimeString();
          console.log(`[${announceTimestamp}] 🏆 Winner determined: ${winningSlice.text} (${winningSlice.color})`);
          onSpinComplete?.(winningSlice);
        }
      }, 2000);
    }

    return () => {
      if (stopTimeoutRef.current) {
        clearTimeout(stopTimeoutRef.current);
      }
    };
  }, [spinning, currentSliceIndex, items, onSpinComplete]);
  
  if (!items || items.length === 0) {
    return (
      <div className="flex justify-center items-center" style={{ width: size, height: size }}>
        <p className="text-gray-400">No items to display</p>
      </div>
    );
  }

  const segmentAngle = 360 / items.length;
  const currentSlice = items[currentSliceIndex];

  return (
    <div 
      className="relative" 
      style={{ width: size, height: size }}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      {/* Debug Info */}
      {debug && (
        <div className="absolute top-2 left-2 bg-black bg-opacity-90 text-white px-4 py-3 rounded text-xs z-20 font-mono max-w-xs">
          <div className="font-bold mb-1">🎯 WHEEL DEBUG</div>
          <div>Rotation: {currentRotation.toFixed(2)}°</div>
          <div>Slice: #{currentSliceIndex} <span className="font-bold">{currentSlice?.text || 'none'}</span></div>
          <div>Pointer: <span style={{color: pointerColor}}>●</span> {pointerColor}</div>
          <div>Status: <span className={spinning ? 'text-green-400' : 'text-red-400'}>{spinning ? 'SPINNING' : 'STOPPED'}</span></div>
          <div>Items: {items.length}</div>
          <div>Segment: {debugInfo.segmentAngle.toFixed(1)}° each</div>
          <div>Norm Rot: {debugInfo.normalizedRotation.toFixed(1)}°</div>
          <div>Pointer Angle: {debugInfo.angleAtPointer.toFixed(1)}°</div>
          <div className="mt-2 pt-2 border-t border-gray-600">
            <div className="text-yellow-400">Last Change: #{lastSliceIndexRef.current}</div>
          </div>
        </div>
      )}

      {/* Pointer Arrow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-10">
        <div
          className="w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[36px] drop-shadow-lg"
          style={{ borderTopColor: pointerColor }}
        />
      </div>

      {/* Wheel */}
      <div
        ref={wheelRef}
        className="relative rounded-full overflow-hidden shadow-2xl border-8 border-gray-700"
        style={{
          width: size,
          height: size,
          transform: `rotate(${currentRotation}deg)`,
        }}
        onWheel={(e) => e.stopPropagation()}
        onTouchMove={(e) => e.stopPropagation()}
      >
        {items.map((item, index) => {
          const startAngle = index * segmentAngle;
          const center = radius;
          
          // SVG path coordinates
          const startRad = ((startAngle - 90) * Math.PI) / 180;
          const endRad = ((startAngle + segmentAngle - 90) * Math.PI) / 180;
          const x1 = center + radius * Math.cos(startRad);
          const y1 = center + radius * Math.sin(startRad);
          const x2 = center + radius * Math.cos(endRad);
          const y2 = center + radius * Math.sin(endRad);
          const largeArc = segmentAngle > 180 ? 1 : 0;
          const pathData = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

          // Text positioning
          const textAngle = startAngle + segmentAngle / 2;
          const textRad = ((textAngle - 90) * Math.PI) / 180;
          const textRadius = radius * 0.6;
          const textX = center + textRadius * Math.cos(textRad);
          const textY = center + textRadius * Math.sin(textRad);

          return (
            <svg
              key={`${item.text}-${index}`}
              className="absolute top-0 left-0 w-full h-full"
              viewBox={`0 0 ${size} ${size}`}
            >
              <path
                d={pathData}
                fill={item.color}
                stroke="#1f2937"
                strokeWidth="2"
              />
              <text
                x={textX}
                y={textY}
                fill="white"
                fontSize="13"
                fontWeight="bold"
                textAnchor="middle"
                dominantBaseline="middle"
                transform={`rotate(${textAngle}, ${textX}, ${textY})`}
                style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}
              >
                {item.text.length > 18 ? `${item.text.slice(0, 16)}…` : item.text}
              </text>
            </svg>
          );
        })}

        {/* Debug Lines - Slice Boundaries (rotate with wheel) */}
        {debug && (
          <svg className="absolute top-0 left-0 w-full h-full pointer-events-none z-50" viewBox={`0 0 ${size} ${size}`}>
            {/* Center marker */}
            <circle
              cx={radius}
              cy={radius}
              r="3"
              fill="red"
              opacity="0.8"
            />
            {items.map((_, index) => {
              // Draw dotted lines from center to slice boundaries
              const boundaryAngle = (index + 1) * segmentAngle;
              const boundaryRad = ((boundaryAngle - 90) * Math.PI) / 180;

              const x1 = radius;
              const y1 = radius;
              const x2 = radius + radius * Math.cos(boundaryRad);
              const y2 = radius + radius * Math.sin(boundaryRad);

              return (
                <line
                  key={`debug-${index}`}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="yellow"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  opacity="0.8"
                />
              );
            })}
          </svg>
        )}        {/* Center Circle */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gray-900 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
          <span className="text-xl">🎯</span>
        </div>
      </div>

      {/* Remove the fixed debug lines outside the wheel */}
    </div>
  );
}

/**
 * Calculate which item the pointer lands on after rotation
 * 
 * @param {number} finalRotation - Final rotation value in degrees
 * @param {number} itemCount - Total number of items on wheel
 * @returns {number} Index of the selected item
 */
export function calculateWinnerIndex(finalRotation, itemCount) {
  const segmentAngle = 360 / itemCount;
  const normalizedRotation = ((finalRotation % 360) + 360) % 360;
  
  // Pointer is at -90° (top) in slice coordinate system
  // After rotation R, slice at index I has center at: (I * segmentAngle + segmentAngle/2 - R)
  // We want to find I where this equals -90° (mod 360)
  const angleAtPointer = ((-90 + normalizedRotation - segmentAngle / 2) + 360) % 360;
  const sliceIndex = Math.floor(angleAtPointer / segmentAngle) % itemCount;
  
  return sliceIndex;
}

/**
 * Calculate target rotation to land a specific item under the pointer
 * 
 * @param {number} itemIndex - Index of item to select
 * @param {number} itemCount - Total number of items
 * @param {number} currentRotation - Current rotation value
 * @param {number} minSpins - Minimum full rotations (default 5)
 * @param {number} maxSpins - Maximum full rotations (default 8)
 * @returns {number} Final rotation value
 */
export function calculateTargetRotation(itemIndex, itemCount, currentRotation, minSpins = 5, maxSpins = 8) {
  const segmentAngle = 360 / itemCount;
  
  // Small jitter within the slice
  const jitter = (Math.random() - 0.5) * (segmentAngle * 0.3);
  
  // To land slice I under pointer at -90°: rotation = I × segmentAngle + segmentAngle/2 + 90
  const targetRotation = itemIndex * segmentAngle + (segmentAngle / 2) + 90 + jitter;
  
  // Add full spins
  const extraSpins = Math.floor(Math.random() * (maxSpins - minSpins + 1)) + minSpins;
  const currentMod = ((currentRotation % 360) + 360) % 360;
  const deltaDegrees = ((targetRotation - currentMod) + 360) % 360;
  
  return currentRotation + (extraSpins * 360) + deltaDegrees;
}
