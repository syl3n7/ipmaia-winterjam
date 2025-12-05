'use client';

import React, { useRef, useEffect } from 'react';
import { Wheel } from 'spin-wheel';

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
 * Professional Spin Wheel Component using spin-wheel library
 * Provides accurate winner determination and smooth animations
 *
 * @param {Array} items - Array of {text, color} objects to display on wheel
 * @param {boolean} spinning - Whether wheel is currently spinning
 * @param {string} pointerColor - Color of the pointer arrow
 * @param {function} onSliceChange - Callback when pointer enters a new slice
 * @param {function} onSpinComplete - Callback when spinning stops (winner determined)
 * @param {function} onSpinEnd - Callback when spin animation ends
 * @param {number} size - Diameter of wheel in pixels (default 520)
 * @param {boolean} debug - Show debug markers
 */
export function SpinWheel({ items, spinning, pointerColor = '#ef4444', onSliceChange, onSpinComplete, onSpinEnd, size = 520, debug = false }) {
  const containerRef = useRef(null);
  const wheelRef = useRef(null);
  const winnerTimeoutRef = useRef(null);

  // Convert our items format to spin-wheel format
  const wheelItems = items.map(item => ({
    label: item.text,
    backgroundColor: item.color,
    weight: 1 // Equal weight for all items
  }));

  // Initialize wheel when component mounts
  useEffect(() => {
    if (!containerRef.current || !items.length) return;

    const props = {
      items: wheelItems,
      radius: 0.95,
      pointerAngle: 0, // Pointer at top (0 degrees)
      borderWidth: 8,
      borderColor: '#374151',
      lineWidth: 2,
      lineColor: '#1f2937',
      isInteractive: false, // We'll control spinning programmatically
      itemLabelFontSizeMax: 16,
      itemLabelRadius: 0.8,
      itemLabelAlign: 'right',
      itemLabelColors: ['#ffffff'],
      itemLabelStrokeColor: '#000000',
      itemLabelStrokeWidth: 2,
      onCurrentIndexChange: (event) => {
        // Update pointer color when slice changes
        const currentItem = items[event.currentIndex];
        if (currentItem && onSliceChange) {
          onSliceChange(currentItem);
        }
      },
      onRest: (event) => {
        // Determine winner after wheel stops
        const winningItem = items[event.currentIndex];
        if (winnerTimeoutRef.current) {
          clearTimeout(winnerTimeoutRef.current);
        }

        winnerTimeoutRef.current = setTimeout(() => {
          onSpinComplete?.(winningItem);
        }, 2000);

        onSpinEnd?.();
      },
      onSpin: (event) => {
        // Wheel started spinning
      },
    };

    wheelRef.current = new Wheel(containerRef.current, props);

    return () => {
      if (wheelRef.current) {
        wheelRef.current.remove();
        wheelRef.current = null;
      }
      if (winnerTimeoutRef.current) {
        clearTimeout(winnerTimeoutRef.current);
      }
    };
  }, [items, debug]);

  // Handle spinning state changes
  useEffect(() => {
    if (!wheelRef.current) return;

    if (spinning) {
      // Generate random winning item and spin to it
      const winningIndex = Math.floor(Math.random() * items.length);
      const duration = 4000; // 4 seconds for normal spinning
      const numberOfRevolutions = Math.floor(Math.random() * 3) + 3; // 3-5 revolutions

      wheelRef.current.spinToItem(winningIndex, duration, true, numberOfRevolutions, 1);
    }
  }, [spinning, items, debug]);

  // Update wheel items when items prop changes
  useEffect(() => {
    if (wheelRef.current && items.length) {
      wheelRef.current.items = wheelItems;
    }
  }, [items]);

  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
      onWheel={(e) => e.stopPropagation()}
      onTouchMove={(e) => e.stopPropagation()}
    >
      {/* Wheel Container */}
      <div
        ref={containerRef}
        className="relative rounded-full overflow-hidden shadow-2xl border-8 border-gray-700"
        style={{ width: size, height: size }}
      />

      {/* Pointer Arrow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 z-10">
        <div
          className="w-0 h-0 border-l-[18px] border-l-transparent border-r-[18px] border-r-transparent border-t-[36px] drop-shadow-lg"
          style={{ borderTopColor: pointerColor }}
        />
      </div>

      {/* Center Circle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-gray-900 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
        <span className="text-xl">🎯</span>
      </div>

      {/* Debug Info */}
      {debug && (
        <div className="absolute top-2 left-2 bg-black bg-opacity-90 text-white px-4 py-3 rounded text-xs z-20 font-mono max-w-xs">
          <div className="font-bold mb-1">🎯 SPIN-WHEEL DEBUG</div>
          <div>Items: {items.length}</div>
          <div>Status: <span className={spinning ? 'text-green-400' : 'text-red-400'}>{spinning ? 'SPINNING' : 'STOPPED'}</span></div>
          <div>Library: spin-wheel v5.0.2</div>
        </div>
      )}
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
