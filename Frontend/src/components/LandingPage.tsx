import React, { useEffect, useState, useRef } from 'react';
import { Lock, Unlock, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Type definition for spline-viewer to avoid TS errors
declare global {
  namespace JSX {
    interface IntrinsicElements {
      'spline-viewer': any;
    }
  }
}

const PillCTA = ({ children, onClick }: { children: React.ReactNode, onClick: () => void }) => (
  <button 
    onClick={onClick}
    className="rounded-full bg-pill-dark px-8 py-3 text-white font-body font-medium transition-all duration-150 hover:-translate-y-[1px]"
  >
    {children}
  </button>
);

const TrustBadge = ({ children }: { children: React.ReactNode }) => (
  <div className="glass-pill inline-flex items-center gap-2 px-4 py-1.5 mb-8 text-sm font-medium text-ink">
    <div className="w-2 h-2 rounded-full bg-accent-blue animate-pulse" />
    {children}
  </div>
);

const AuroraBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    <div className="absolute top-[10%] left-[20%] w-[520px] h-[520px] bg-accent-violet rounded-full blur-[90px] opacity-45 mix-blend-multiply animate-[drift-a_26s_ease-in-out_infinite]" />
    <div className="absolute top-[30%] right-[15%] w-[480px] h-[480px] bg-accent-blue rounded-full blur-[90px] opacity-45 mix-blend-multiply animate-[drift-b_32s_ease-in-out_infinite]" />
    <div className="absolute bottom-[20%] left-[30%] w-[560px] h-[560px] bg-haze rounded-full blur-[90px] opacity-45 mix-blend-multiply animate-[drift-c_38s_ease-in-out_infinite]" />
  </div>
);

const SplineScene = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check user preference for reduced motion and mobile
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (window.innerWidth < 768 || prefersReducedMotion) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !isLoaded) {
        setIsLoaded(true);
        const script = document.createElement('script');
        script.type = 'module';
        script.src = 'https://unpkg.com/@splinetool/viewer@1.0.94/build/spline-viewer.js';
        document.body.appendChild(script);
      }
    });

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isLoaded]);

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 mix-blend-darken">
      {isLoaded && (
        <spline-viewer url="https://prod.spline.design/PpqhO6v2MXp8veP1/scene.splinecode"></spline-viewer>
      )}
    </div>
  );
};

const CommandBar = () => {
  const navigate = useNavigate();
  return (
    <div className="glass-pill flex items-center p-2 pl-6 w-full max-w-xl mx-auto mt-8 mb-16 transition-shadow focus-within:ring-2 focus-within:ring-accent-violet/30">
      <Search className="w-5 h-5 text-ink-dim mr-3 flex-shrink-0" />
      <input 
        type="text" 
        placeholder="Ask CryptML how it handles your data model..." 
        className="flex-grow bg-transparent border-none outline-none text-ink placeholder:text-ink-dim font-body min-w-0"
      />
      <button 
        onClick={() => navigate('/prediction')}
        className="bg-pill-dark text-white rounded-full px-6 py-2.5 font-medium ml-2 hover:opacity-90 transition-opacity flex-shrink-0"
      >
        Ask
      </button>
    </div>
  );
};

const StateCard = () => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="flex flex-col items-center">
      <div 
        className="relative w-full max-w-md aspect-[4/3] cursor-pointer group perspective-1000"
        onClick={() => setIsFlipped(!isFlipped)}
      >
        <div className={`w-full h-full transition-transform duration-700 preserve-3d relative ${isFlipped ? 'rotate-y-180' : ''}`} style={{ transformStyle: 'preserve-3d' }}>
          
          <div className="absolute inset-0 backface-hidden glass-surface flex flex-col items-center justify-center p-8" style={{ backfaceVisibility: 'hidden' }}>
             <Lock className="w-12 h-12 text-accent-blue mb-6" />
             <h3 className="font-headline font-semibold text-ink uppercase tracking-wider mb-2">Encrypted</h3>
             <p className="text-ink-dim text-center font-mono text-sm break-all">
                e2 84 94 e2 84 94 e2 84 94 e2 84 94 e2 84 94
             </p>
          </div>

          <div className="absolute inset-0 backface-hidden glass-surface flex flex-col items-center justify-center p-8" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
             <Unlock className="w-12 h-12 text-accent-violet mb-6 relative z-10" />
             <h3 className="font-headline font-semibold text-ink uppercase tracking-wider mb-2 relative z-10">Trained</h3>
             <div className="flex space-x-2 relative z-10">
               <div className="w-2 h-2 rounded-full bg-accent-violet"></div>
               <div className="w-2 h-2 rounded-full bg-accent-violet opacity-50"></div>
               <div className="w-2 h-2 rounded-full bg-accent-violet"></div>
             </div>
          </div>

        </div>
      </div>
      
      <div className="mt-8 flex items-center space-x-4">
         <button onClick={() => setIsFlipped(false)} className={`text-sm font-medium transition-colors ${!isFlipped ? 'text-ink' : 'text-ink-dim'}`}>← Prev</button>
         <div className="flex space-x-2">
           <div className={`w-1.5 h-1.5 rounded-full ${!isFlipped ? 'bg-ink' : 'bg-ink-dim/30'}`}></div>
           <div className={`w-1.5 h-1.5 rounded-full ${isFlipped ? 'bg-ink' : 'bg-ink-dim/30'}`}></div>
         </div>
         <button onClick={() => setIsFlipped(true)} className={`text-sm font-medium transition-colors ${isFlipped ? 'text-ink' : 'text-ink-dim'}`}>Next →</button>
      </div>
    </div>
  );
};

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="text-ink font-body min-h-screen selection:bg-accent-violet/20">
      
      <section className="relative min-h-[90vh] flex flex-col pt-32 overflow-hidden">
        <AuroraBackground />
        <SplineScene />
        
        <div className="container relative z-10 px-4 flex flex-col items-center text-center max-w-4xl mx-auto flex-grow justify-center">
          <TrustBadge>Audited zero-knowledge protocol</TrustBadge>
          
          <h1 className="font-headline font-semibold text-[clamp(2.5rem,5vw,4.2rem)] leading-[1.15] tracking-tight mb-6 text-ink">
            Encryption that <span className="font-accent italic font-normal text-accent-violet">learns</span>
          </h1>
          <p className="text-lg md:text-xl text-ink-dim max-w-2xl mb-4 leading-[1.6]">
            Federated ML on data that never leaves its cipher. Detect patterns, identify algorithms, and build models directly on encrypted datasets.
          </p>
          
          <CommandBar />
        </div>

        <div className="relative z-10 w-full mt-auto">
          <div className="glass-surface rounded-none border-x-0 border-b-0 py-6">
            <div className="container mx-auto px-4 flex flex-wrap justify-center gap-12 items-center text-ink-dim/60 font-medium text-sm uppercase tracking-wider">
              <span>Backed by</span>
              <span className="text-ink-dim">Sequoia</span>
              <span className="text-ink-dim">Y Combinator</span>
              <span className="text-ink-dim">MIT CSAIL</span>
              <span className="text-ink-dim">Ethereum Foundation</span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 relative">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="font-medium text-sm tracking-widest text-ink-dim uppercase mb-6">How it works</p>
              <h2 className="font-headline font-semibold text-[clamp(1.8rem,3vw,2.6rem)] leading-tight tracking-tight mb-6">
                A model that never <span className="font-accent italic text-accent-violet font-normal">sees</span> your plaintext
              </h2>
              <p className="text-ink-dim text-lg leading-[1.6] mb-10 max-w-md">
                Our architecture computes directly over the encrypted space. It identifies cryptographic signatures without requiring decryption keys.
              </p>
              <PillCTA onClick={() => navigate('/prediction')}>
                Try the prediction model
              </PillCTA>
            </div>
            
            <div className="glass-surface relative aspect-square overflow-hidden flex items-center justify-center p-8">
               <div className="w-full h-full relative flex items-center justify-center">
                 <div className="absolute w-2 h-2 bg-accent-blue rounded-full animate-ping"></div>
                 <div className="w-4 h-4 bg-accent-violet rounded-full z-10 shadow-[0_0_20px_rgba(124,92,255,0.5)]"></div>
                 <svg className="absolute inset-0 w-full h-full stroke-ink-dim/30" strokeWidth="1">
                   <circle cx="50%" cy="50%" r="30%" fill="none" strokeDasharray="4 4" />
                   <circle cx="50%" cy="50%" r="45%" fill="none" strokeDasharray="4 4" opacity="0.5" />
                 </svg>
               </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 relative">
        <div className="container mx-auto px-4">
           <StateCard />
        </div>
      </section>

      <section className="py-32 relative">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 glass-surface relative aspect-square p-4 flex items-center justify-center">
               <div className="w-full h-full border border-ink-dim/10 rounded-xl flex items-center justify-center relative overflow-hidden">
                 <svg className="w-3/4 h-3/4 stroke-accent-violet" viewBox="0 0 100 100" fill="none" strokeWidth="0.5">
                    <polygon points="50,10 90,30 90,70 50,90 10,70 10,30" />
                    <line x1="50" y1="10" x2="50" y2="50" />
                    <line x1="90" y1="30" x2="50" y2="50" />
                    <line x1="10" y1="30" x2="50" y2="50" />
                    <circle cx="50" cy="50" r="3" fill="currentColor" />
                    <circle cx="50" cy="10" r="2" fill="currentColor" />
                    <circle cx="90" cy="30" r="2" fill="currentColor" />
                    <circle cx="10" cy="30" r="2" fill="currentColor" />
                 </svg>
               </div>
            </div>

            <div className="order-1 md:order-2">
              <p className="font-medium text-sm tracking-widest text-ink-dim uppercase mb-6">Own your models</p>
              <h2 className="font-headline font-semibold text-[clamp(1.8rem,3vw,2.6rem)] leading-tight tracking-tight mb-6">
                Train on private data <span className="font-accent italic text-accent-violet font-normal">without</span> touching it
              </h2>
              <p className="text-ink-dim text-lg leading-[1.6] mb-10 max-w-md">
                Deploy decentralized nodes that train local models. Aggregate weights globally without ever exposing the underlying encrypted records.
              </p>
              <PillCTA onClick={() => navigate('/signup')}>
                Join the network
              </PillCTA>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
