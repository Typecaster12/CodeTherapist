import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function InteractiveBackground() {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for mouse lag to make it feel organic
  const springConfig = { damping: 50, stiffness: 150, mass: 1 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e) => {
      // Calculate coordinates relative to screen, adjusting for the spot size
      mouseX.set(e.clientX - 250); // Spot is 500px wide, so center is offset by 250
      mouseY.set(e.clientY - 250);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  // Reusable static structure for drifting particles initialized once on mount
  const [particles] = useState(() => 
    Array.from({ length: 12 }).map((_, i) => ({
      id: i,
      size: Math.random() * 2 + 1,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 30 + 30, // 30s - 60s
      delay: -Math.random() * 30,
    }))
  );

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 bg-[var(--bg-void)]">
      {/* Technical Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--text-primary) 1px, transparent 1px),
            linear-gradient(to bottom, var(--text-primary) 1px, transparent 1px)
          `,
          backgroundSize: '64px 64px',
          maskImage: 'radial-gradient(circle at center, black, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(circle at center, black, transparent 80%)'
        }}
      />

      {/* Interactive Spotlight Glow (follows mouse) */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full blur-[120px] pointer-events-none opacity-45 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]"
        style={{
          x: smoothX,
          y: smoothY,
        }}
      />

      {/* Floating Grayscale Ambient Orbs */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Top-Left drifting spot */}
        <motion.div 
          className="absolute w-[350px] h-[350px] rounded-full blur-[130px] bg-[rgba(255,255,255,0.015)] top-[10%] left-[10%]"
          animate={{
            x: [0, 50, -30, 0],
            y: [0, -40, 30, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        {/* Bottom-Right drifting spot */}
        <motion.div 
          className="absolute w-[450px] h-[450px] rounded-full blur-[150px] bg-[rgba(255,255,255,0.01)] bottom-[15%] right-[10%]"
          animate={{
            x: [0, -60, 40, 0],
            y: [0, 50, -40, 0],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      {/* Micro-Particles rising slowly */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/[0.06]"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
          }}
          animate={{
            y: ['105vh', '-5vh'],
            opacity: [0, 0.3, 0.3, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}
