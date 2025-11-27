
import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameMode, Theme } from '../types';
import { TUBE_CAPACITY, COLORS } from '../constants';
import { HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playSound } from '../services/audioService';

interface TubeProps {
  colors: string[];
  index: number;
  isSelected: boolean;
  isSolved: boolean;
  gameMode: GameMode;
  theme: Theme;
  isMystery?: boolean;
  colorBlindMode?: boolean; // New Prop
  onClick: (index: number) => void;
}

// SVG Path Definitions in 0 to 1 coordinate space (Relative)
const SHAPES = {
  tube: {
    // U-Shape
    path: "M 0.1 0 L 0.1 0.85 Q 0.1 1 0.5 1 Q 0.9 1 0.9 0.85 L 0.9 0",
    overlay: "M 0.1 0 L 0.1 0.85 Q 0.1 1 0.5 1 Q 0.9 1 0.9 0.85 L 0.9 0",
    width: "w-12 sm:w-16",
    neckOffset: 0
  },
  flask: {
    // Erlenmeyer-ish Flask / Bottle
    path: "M 0.35 0 L 0.35 0.35 L 0.05 1 L 0.95 1 L 0.65 0.35 L 0.65 0",
    overlay: "M 0.35 0 L 0.35 0.35 L 0.05 1 L 0.95 1 L 0.65 0.35 L 0.65 0",
    width: "w-16 sm:w-20",
    neckOffset: 10 
  },
  cup: {
    // Tapered Glass
    path: "M 0 0 L 0.15 1 L 0.85 1 L 1 0",
    overlay: "M 0 0 L 0.15 1 L 0.85 1 L 1 0",
    width: "w-14 sm:w-20",
    neckOffset: 0
  },
  potion: {
    // Round Bottom Flask
    path: "M 0.35 0 L 0.35 0.3 Q 0.35 0.4 0.1 0.6 Q 0 0.7 0.1 0.9 Q 0.2 1 0.5 1 Q 0.8 1 0.9 0.9 Q 1 0.7 0.9 0.6 Q 0.65 0.4 0.65 0.3 L 0.65 0",
    overlay: "M 0.35 0 L 0.35 0.3 Q 0.35 0.4 0.1 0.6 Q 0 0.7 0.1 0.9 Q 0.2 1 0.5 1 Q 0.8 1 0.9 0.9 Q 1 0.7 0.9 0.6 Q 0.65 0.4 0.65 0.3 L 0.65 0",
    width: "w-16 sm:w-24",
    neckOffset: 5
  }
};

const Tube: React.FC<TubeProps> = ({ colors, index, isSelected, isSolved, gameMode, theme, isMystery = false, colorBlindMode = false, onClick }) => {
  const isWater = gameMode === GameMode.WATER;
  const shapeConfig = SHAPES[theme.containerShape] || SHAPES.tube;
  const tubeRef = useRef<HTMLDivElement>(null);
  
  // Effect for Cork/Solved Confetti
  useEffect(() => {
    if (isSolved && tubeRef.current) {
      // Calculate tube position relative to viewport for confetti
      const rect = tubeRef.current.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 4) / window.innerHeight;

      // Trigger Sound
      playSound('pop', true);

      // Trigger Local Confetti
      confetti({
        particleCount: 30,
        spread: 60,
        origin: { x, y },
        colors: colors.length > 0 ? [colors[0]] : ['#ffffff'], // Use tube color
        startVelocity: 20,
        gravity: 0.8,
        scalar: 0.6,
        disableForReducedMotion: true
      });
    }
  }, [isSolved, colors]);

  // Container Animation Classes
  const containerClass = `
    relative flex flex-col justify-end items-center cursor-pointer transition-all duration-300 ease-out
    ${isSelected ? 'animate-float-selected drop-shadow-[0_10px_10px_rgba(255,255,255,0.3)]' : 'hover:-translate-y-2'}
    ${isSolved ? 'glow-solved' : ''}
  `;

  const tubeHeight = "h-40 sm:h-52";

  const getPatternId = (color: string) => {
      const index = COLORS.indexOf(color);
      return index >= 0 ? `pattern-${index}` : undefined;
  };

  return (
    <div
      ref={tubeRef}
      className={`${containerClass} ${tubeHeight} ${shapeConfig.width}`}
      onClick={() => onClick(index)}
    >
      {/* SVG Definitions for Color Blind Patterns */}
      <svg width="0" height="0" className="absolute">
         <defs>
             {/* 0: Stripes */}
             <pattern id="pattern-0" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                 <line x1="0" y1="0" x2="0" y2="4" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
             </pattern>
             {/* 1: Dots */}
             <pattern id="pattern-1" width="4" height="4" patternUnits="userSpaceOnUse">
                 <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.3)" />
             </pattern>
             {/* 2: Grid */}
             <pattern id="pattern-2" width="6" height="6" patternUnits="userSpaceOnUse">
                 <rect width="6" height="6" fill="none" />
                 <path d="M 0 0 L 0 6 M 0 0 L 6 0" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
             </pattern>
             {/* 3: ZigZag (simulated with diagonal cross hatch) */}
             <pattern id="pattern-3" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(135)">
                 <line x1="0" y1="0" x2="0" y2="4" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
             </pattern>
             {/* 4: Checks */}
             <pattern id="pattern-4" width="8" height="8" patternUnits="userSpaceOnUse">
                 <rect x="0" y="0" width="4" height="4" fill="rgba(255,255,255,0.2)" />
                 <rect x="4" y="4" width="4" height="4" fill="rgba(255,255,255,0.2)" />
             </pattern>
             {/* 5: Cross */}
             <pattern id="pattern-5" width="6" height="6" patternUnits="userSpaceOnUse">
                <path d="M1 1L5 5M5 1L1 5" stroke="rgba(255,255,255,0.3)" strokeWidth="1"/>
             </pattern>
             {/* 6: Circles */}
             <pattern id="pattern-6" width="6" height="6" patternUnits="userSpaceOnUse">
                <circle cx="3" cy="3" r="2" stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none"/>
             </pattern>
             {/* 7: Vertical Lines */}
             <pattern id="pattern-7" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(90)">
                 <line x1="0" y1="0" x2="0" y2="4" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
             </pattern>
             {/* 8: Thick Diagonal */}
             <pattern id="pattern-8" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                 <rect width="4" height="8" fill="rgba(0,0,0,0.2)" />
             </pattern>
             {/* 9: Triangles (simulated) */}
             <pattern id="pattern-9" width="6" height="6" patternUnits="userSpaceOnUse">
                 <path d="M3 0L6 6H0Z" fill="rgba(255,255,255,0.2)" />
             </pattern>
             {/* 10-15: Recycled patterns with different scales/rotations */}
             <pattern id="pattern-10" width="3" height="3" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="0.5" fill="rgba(255,255,255,0.5)"/></pattern>
             <pattern id="pattern-11" width="4" height="4" patternUnits="userSpaceOnUse"><line x1="0" y1="2" x2="4" y2="2" stroke="rgba(255,255,255,0.3)"/></pattern>
             <pattern id="pattern-12" width="5" height="5" patternUnits="userSpaceOnUse" patternTransform="rotate(30)"><rect width="2" height="5" fill="rgba(255,255,255,0.2)"/></pattern>
             <pattern id="pattern-13" width="6" height="6" patternUnits="userSpaceOnUse"><rect x="2" y="2" width="2" height="2" fill="rgba(0,0,0,0.3)"/></pattern>
             <pattern id="pattern-14" width="4" height="4" patternUnits="userSpaceOnUse" patternTransform="rotate(60)"><line x1="0" y1="0" x2="0" y2="4" stroke="rgba(0,0,0,0.3)" strokeWidth="2"/></pattern>
             <pattern id="pattern-15" width="8" height="8" patternUnits="userSpaceOnUse"><circle cx="4" cy="4" r="3" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/></pattern>
         </defs>
      </svg>

      {/* Cork Animation */}
      <AnimatePresence>
        {isSolved && (
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 10, opacity: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 15 }}
                className="absolute top-[-15px] z-40 pointer-events-none drop-shadow-lg"
                style={{ width: '60%' }}
            >
                <svg viewBox="0 0 100 60" className="w-full h-full">
                    <path d="M 20 60 L 80 60 L 90 10 L 10 10 Z" fill="#854d0e" stroke="#5c360a" strokeWidth="2" />
                    <ellipse cx="50" cy="10" rx="40" ry="8" fill="#a16207" />
                    {/* Texture lines */}
                    <path d="M 30 20 L 40 25 M 60 40 L 70 45 M 35 50 L 45 50" stroke="#5c360a" strokeWidth="2" opacity="0.5" />
                </svg>
            </motion.div>
        )}
      </AnimatePresence>

      {/* 
        SVG Layer: Handles the shape mask, border, and reflections.
        viewBox="0 0 1 1" to match our relative path coordinates.
      */}
      <div className="absolute inset-0 z-20 pointer-events-none">
        <svg viewBox="0 0 1 1" preserveAspectRatio="none" className="w-full h-full drop-shadow-lg">
            
            <defs>
               {/* Critical: clipPathUnits="objectBoundingBox" allows the path to scale with the div */}
               <clipPath id={`clip-${index}`} clipPathUnits="objectBoundingBox">
                  <path d={shapeConfig.path} />
               </clipPath>
               
               <linearGradient id="glassShine" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                  <stop offset="20%" stopColor="rgba(255,255,255,0.4)" />
                  <stop offset="50%" stopColor="rgba(255,255,255,0)" />
                  <stop offset="80%" stopColor="rgba(255,255,255,0)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
               </linearGradient>
            </defs>

            {/* Glass Outline & Stroke */}
            <path 
              d={shapeConfig.overlay} 
              fill="url(#glassShine)" 
              stroke={isSelected ? '#fde047' : (theme.tubeStyle === 'neon' ? '#22d3ee' : 'white')}
              strokeWidth={isSelected ? '0.04' : (theme.tubeStyle === 'minimal' ? '0.01' : '0.03')} 
              vectorEffect="non-scaling-stroke"
              strokeOpacity={theme.tubeStyle === 'minimal' ? '0.5' : '0.9'}
              className={theme.tubeStyle === 'neon' ? 'drop-shadow-[0_0_5px_#22d3ee]' : ''}
            />
            
            {/* Additional Highlights specific to shape */}
            {theme.tubeStyle === 'glass' && (
                 <path 
                    d={shapeConfig.overlay} 
                    fill="none" 
                    stroke="white" 
                    strokeWidth="0.01" 
                    vectorEffect="non-scaling-stroke"
                    strokeOpacity="0.2"
                    transform="scale(0.9, 0.95) translate(0.05, 0.025)"
                 />
            )}
        </svg>
      </div>

      {/* Liquid / Ball Container - Clipped by the SVG Shape ID */}
      <div 
        className="absolute inset-0 w-full h-full z-10 flex flex-col-reverse justify-start"
        style={{ 
            clipPath: `url(#clip-${index})`,
            paddingBottom: '2%' 
        }}
      >
        <AnimatePresence mode='popLayout'>
          {colors.map((color, i) => {
            const isTop = i === colors.length - 1;
            // Mystery Mode: Hide color if it's not the top one
            const isHidden = isMystery && !isTop;
            const patternId = colorBlindMode && !isHidden ? getPatternId(color) : undefined;
            
            if (isWater) {
               // Water Rendering
              const heightPercent = (100 - shapeConfig.neckOffset) / TUBE_CAPACITY;
              
              return (
                <motion.div
                  key={`${index}-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ 
                    height: `${heightPercent}%`, 
                    opacity: 1,
                    transition: { 
                       // Use softer Spring physics for a gentle "Swell" effect
                       height: { type: "spring", stiffness: 120, damping: 10, mass: 1 }, 
                       opacity: { duration: 0.1 }
                    }
                  }}
                  exit={{ 
                    height: 0, 
                    opacity: 0,
                    transition: { duration: 0.2 } 
                  }}
                  className={`w-full relative origin-bottom flex items-center justify-center`}
                  style={{ 
                    backgroundColor: isHidden ? '#334155' : color, // Dark gray if hidden
                    // Apply realistic settle physics (swell/ripple) when top layer enters
                    animation: isTop ? 'liquid-swell-entry 0.6s ease-out' : 'none',
                    transformOrigin: 'bottom'
                  }}
                >
                    {isHidden ? (
                        <HelpCircle size={24} className="text-white/20 animate-pulse" />
                    ) : (
                        <>
                            {/* Color Blind Pattern Overlay */}
                            {patternId && (
                                <div 
                                    className="absolute inset-0 w-full h-full opacity-50 pointer-events-none" 
                                    style={{ backgroundImage: `url(#${patternId})` }} 
                                />
                            )}

                            {/* Deep Gradient for Volume */}
                            <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/40 pointer-events-none" />
                            
                            {/* Internal Caustics / Turbulence Effect */}
                            <div 
                            className="absolute inset-0 opacity-40 mix-blend-overlay animate-caustic pointer-events-none" 
                            style={{
                                backgroundImage: 'radial-gradient(circle at center, rgba(255,255,255,0.6) 0%, transparent 70%)',
                                backgroundSize: '150% 150%'
                            }}
                            />
                            
                            {/* Vertical Reflection Highlight */}
                            <div className="absolute top-0 bottom-0 left-[25%] w-[10%] bg-gradient-to-b from-white/20 to-transparent opacity-50 blur-[2px] pointer-events-none" />

                            {/* Surface Wave System - 3D Effect */}
                            {isTop && (
                            <div className="absolute top-[-8px] left-0 w-full h-[16px] z-20 overflow-visible">
                                {/* Pouring Stream Effect - Pour from above */}
                                <motion.div
                                   initial={{ height: '300%', opacity: 1 }}
                                   animate={{ height: '0%', opacity: 0 }}
                                   transition={{ duration: 0.45, ease: "circIn" }}
                                   className="absolute bottom-[95%] left-1/2 -translate-x-1/2 w-[6px] z-40 origin-bottom rounded-full"
                                   style={{ backgroundColor: color, filter: 'brightness(1.1)' }}
                                />

                                {/* Ripple Ring 1 on Entry */}
                                <motion.div 
                                    initial={{ scale: 0, opacity: 1, borderWidth: "4px" }}
                                    animate={{ scale: 2.2, opacity: 0, borderWidth: "0px" }}
                                    transition={{ duration: 0.6, ease: "easeOut" }}
                                    className="absolute top-[-4px] left-0 w-full h-[100%] rounded-[50%] border-white/80 z-40 pointer-events-none"
                                />
                                
                                {/* Ripple Ring 2 (Delayed) */}
                                <motion.div 
                                    initial={{ scale: 0, opacity: 0.8, borderWidth: "3px" }}
                                    animate={{ scale: 1.8, opacity: 0, borderWidth: "0px" }}
                                    transition={{ duration: 0.5, ease: "easeOut", delay: 0.15 }}
                                    className="absolute top-[-4px] left-0 w-full h-[100%] rounded-[50%] border-white/50 z-40 pointer-events-none"
                                />

                                {/* Wrapper for wave entry animation */}
                                <motion.div
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ delay: 0.05, type: "spring", stiffness: 150, damping: 12 }}
                                    className="w-full h-full animate-surface-bob origin-bottom"
                                >
                                    {/* Container for wave scaling */}
                                    <div 
                                        className="relative w-full h-full scale-x-[200%] left-[-50%]"
                                        style={{ animation: 'wave-surge 0.5s ease-out' }}
                                    >
                                            
                                            {/* Back Wave (Slower, Darker) */}
                                            <div className="absolute inset-0 w-full h-full animate-wave-back opacity-50 text-black/30">
                                            <svg viewBox="0 0 200 20" preserveAspectRatio="none" className="w-full h-full fill-current">
                                                <path d="M 0 10 Q 50 18 100 10 T 200 10 V 20 H 0 Z" />
                                            </svg>
                                            </div>

                                            {/* Front Wave (Faster, Main Color) */}
                                            <div className="absolute inset-0 w-full h-full animate-wave-front text-white/20">
                                            <svg viewBox="0 0 200 20" preserveAspectRatio="none" className="w-full h-full fill-current" style={{ color: color }}>
                                                    <path d="M 0 10 Q 50 2 100 10 T 200 10 V 20 H 0 Z" />
                                            </svg>
                                            </div>
                                    </div>
                                    
                                    {/* Meniscus Highlight (Rim) */}
                                    <div className="absolute top-[8px] left-0 right-0 h-[1px] bg-white/80 blur-[0.5px] z-30 shadow-[0_0_4px_rgba(255,255,255,0.8)]" />
                                </motion.div>

                                {/* Sparkling Particles on Pour - More dramatic and explosive */}
                                <div className="absolute top-[5px] left-0 right-0 flex justify-center items-center overflow-visible pointer-events-none z-50">
                                {[...Array(20)].map((_, pIdx) => (
                                    <motion.div
                                        key={`sparkle-${pIdx}`}
                                        initial={{ opacity: 1, scale: 0, x: 0, y: 0, rotate: 0 }}
                                        animate={{ 
                                            opacity: 0, 
                                            scale: Math.random() * 0.8 + 0.4,
                                            y: -50 - Math.random() * 80, // Higher splash
                                            x: (Math.random() - 0.5) * 150, // Wider splash
                                            rotate: Math.random() * 720
                                        }}
                                        transition={{ 
                                            duration: 0.5 + Math.random() * 0.5, 
                                            ease: "easeOut", 
                                            delay: Math.random() * 0.05 
                                        }}
                                        className="absolute w-1.5 h-1.5 rounded-full shadow-[0_0_6px_white]"
                                        style={{
                                          backgroundColor: Math.random() > 0.3 ? '#ffffff' : color
                                        }}
                                    />
                                ))}
                                </div>
                            </div>
                            )}

                            {/* Internal Bubbles */}
                            <div className="absolute bottom-2 left-1/3 w-1 h-1 bg-white/20 rounded-full animate-ping" style={{ animationDuration: '2s' }}/>
                            <div className="absolute bottom-6 right-1/4 w-0.5 h-0.5 bg-white/20 rounded-full animate-ping" style={{ animationDuration: '3s', animationDelay: '1s' }}/>
                        </>
                    )}
                </motion.div>
              );
            } else {
              // Ball Rendering with Physics
              return (
                <motion.div
                  key={`${index}-${i}`}
                  layout
                  // Squash and Stretch + Rotation Logic
                  initial={{ scale: 0.5, y: -400, scaleY: 1.4, scaleX: 0.7, rotate: Math.random() * 360 - 180, opacity: 0 }} 
                  animate={{ 
                      opacity: 1,
                      scale: 1, 
                      y: 0,
                      // Animation Keyframes: Start -> Impact (Squash) -> Bounce (Stretch) -> Settle
                      scaleY: [1.4, 0.6, 1.1, 0.95, 1], 
                      scaleX: [0.7, 1.4, 0.9, 1.05, 1], 
                      rotate: 0 
                  }}
                  exit={{ scale: 0, y: -100, opacity: 0 }}
                  transition={{ 
                      duration: 0.6,
                      times: [0, 0.4, 0.6, 0.8, 1], // Timing of keyframes
                      ease: "easeOut"
                  }}
                  className="rounded-full relative overflow-hidden shadow-lg flex items-center justify-center"
                  style={{ 
                      backgroundColor: isHidden ? '#334155' : color,
                      height: '23.5%', // Fit 4 balls vertically with slight gap
                      aspectRatio: '1 / 1', // Ensure perfect circle
                      margin: '1px auto', // Center horizontally
                      boxShadow: 'inset -4px -4px 8px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.2)',
                      zIndex: i
                  }}
                >
                   {isHidden ? (
                       <HelpCircle size={20} className="text-white/20" />
                   ) : (
                     <>
                         {/* Color Blind Pattern Overlay */}
                         {patternId && (
                             <div 
                                 className="absolute inset-0 w-full h-full opacity-30 pointer-events-none" 
                                 style={{ backgroundImage: `url(#${patternId})`, backgroundSize: '50%' }} 
                             />
                         )}

                        {/* Ball Shine */}
                        <div className="absolute top-[20%] left-[20%] w-[30%] h-[30%] bg-white rounded-full blur-[2px] opacity-60" />
                        
                        {theme.ballStyle === 'emoji' && (
                            <div className="w-full h-full flex items-center justify-center text-lg animate-spin-slow">⭐</div>
                        )}
                     </>
                   )}
                </motion.div>
              );
            }
          })}
        </AnimatePresence>
      </div>

      {/* Background tint for glass effect - Clipped by same path */}
      <div 
        className="absolute inset-0 w-full h-full bg-white/5 z-0"
        style={{ clipPath: `url(#clip-${index})` }}
      />
    </div>
  );
};

export default Tube;
