import React, { useEffect, useRef } from 'react';

interface ScannerHUDProps {
  children: React.ReactNode;
}

export const ScannerHUD: React.FC<ScannerHUDProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePosRef = useRef({ x: 50, y: 50 });

  // Handle Mouse Spotlight
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    containerRef.current.style.setProperty('--mouse-x', `${x}%`);
    containerRef.current.style.setProperty('--mouse-y', `${y}%`);
    
    mousePosRef.current = { x, y };
  };

  // Handle Canvas Particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.width;
    let height = canvas.height;

    const resize = () => {
      if (containerRef.current) {
        width = containerRef.current.clientWidth;
        height = containerRef.current.clientHeight;
        canvas.width = width;
        canvas.height = height;
      }
    };
    window.addEventListener('resize', resize);
    resize();

    const particles: { x: number; y: number; text: string; speedY: number; opacity: number; size: number }[] = [];
    const hexBytes = ['0x4A', '101', 'KEY_OK', '0xFF', 'A7', 'SIG_LOCK', '0x2B', '0x00'];

    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        text: hexBytes[Math.floor(Math.random() * hexBytes.length)],
        speedY: -0.15 - Math.random() * 0.3,
        opacity: Math.random() * 0.3 + 0.05,
        size: Math.random() * 4 + 10,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      const mouseOffset = {
        x: (mousePosRef.current.x - 50) * 0.3,
        y: (mousePosRef.current.y - 50) * 0.3
      };

      particles.forEach(p => {
        p.y += p.speedY;
        if (p.y < -20) {
          p.y = height + 20;
          p.x = Math.random() * width;
        }

        ctx.font = `${p.size}px monospace`;
        ctx.fillStyle = `rgba(232, 121, 249, ${p.opacity})`; // fuchsia-400
        
        const drawX = p.x - mouseOffset.x;
        const drawY = p.y - mouseOffset.y;
        
        ctx.fillText(p.text, drawX, drawY);
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative w-full h-full min-h-[24rem] overflow-hidden rounded-2xl flex items-center justify-center [contain:layout_paint_style]"
      style={{
        '--mouse-x': '50%',
        '--mouse-y': '50%',
        background: 'radial-gradient(600px circle at var(--mouse-x) var(--mouse-y), rgba(217, 70, 239, 0.04), transparent 40%)'
      } as React.CSSProperties}
    >
      {/* Background Particle Canvas */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 z-0 pointer-events-none opacity-60 transform-gpu [will-change:transform]"
      />

      {/* Concentric Sonar Rings */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
        <div className="absolute w-64 h-64 border border-dashed border-fuchsia-500/10 rounded-full animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite]" />
        <div className="absolute w-96 h-96 border border-dashed border-fuchsia-500/10 rounded-full animate-[ping_4s_cubic-bezier(0,0,0.2,1)_infinite_1s]" />
      </div>

      {/* Radar Sweep */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="w-[40rem] h-[40rem] rounded-full animate-[veylora-radar_4s_linear_infinite] transform-gpu [will-change:transform] opacity-20"
             style={{ background: 'conic-gradient(from 0deg, transparent 70%, rgba(217,70,239,0.3) 100%)' }} />
      </div>

      {/* Corner HUD Elements */}
      <div className="absolute top-4 left-4 text-[9px] font-mono text-fuchsia-300/40 tracking-widest select-none z-10">
        +
        <div className="mt-1">SYS.ONLINE</div>
      </div>
      <div className="absolute top-4 right-4 text-[9px] font-mono text-fuchsia-300/40 tracking-widest text-right select-none z-10">
        +
        <div className="mt-1">CONFIDENCE: HIGH</div>
      </div>
      <div className="absolute bottom-4 left-4 text-[9px] font-mono text-fuchsia-300/40 tracking-widest select-none z-10">
        <div className="mb-1">SIGNAL_LOCK: 99.4%</div>
        +
      </div>
      <div className="absolute bottom-4 right-4 text-[9px] font-mono text-fuchsia-300/40 tracking-widest text-right select-none z-10">
        <div className="mb-1">T-MINUS: 00.00</div>
        +
      </div>

      {/* Inner Children (The Badge) */}
      <div className="relative z-20">
        {children}
      </div>
    </div>
  );
};
