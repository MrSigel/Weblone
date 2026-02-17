import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useParams } from 'react-router-dom';
import { 
  ArrowRight, 
  Globe, 
  Layout, 
  BarChart3, 
  Wrench, 
  ShieldCheck,
  ChevronRight,
  Activity,
  Layers,
  Zap,
  Check,
  ArrowUp,
  ArrowDown,
  ChevronDown,
  User,
  Settings,
  Link as LinkIcon,
  Eye,
  Plus,
  Briefcase,
  Monitor,
  MousePointer2,
  Trophy,
  PieChart,
  HardDrive,
  Trash2,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';

// --- CONFIG ---
const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:3001' : '';

// --- GLOBE COMPONENT ---
const GlobeBackground = () => {
  const routes = [
    { d: "M 100 250 Q 250 100 400 250", duration: 3, delay: 0 },
    { d: "M 150 350 Q 300 200 450 350", duration: 4, delay: 1 },
    { d: "M 50 300 Q 200 150 350 300", duration: 3.5, delay: 0.5 },
    { d: "M 200 400 Q 350 250 500 400", duration: 5, delay: 2 },
    { d: "M 120 200 Q 280 50 440 200", duration: 4.5, delay: 1.5 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden select-none" style={{ zIndex: 0 }}>
      <svg 
        viewBox="0 0 600 600" 
        className="absolute w-full h-full opacity-[0.12] translate-y-20 scale-125 md:scale-150 transform-gpu"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Längengrade */}
        <ellipse cx="300" cy="300" rx="250" ry="250" stroke="white" strokeWidth="0.5" />
        <ellipse cx="300" cy="300" rx="180" ry="250" stroke="white" strokeWidth="0.5" />
        <ellipse cx="300" cy="300" rx="100" ry="250" stroke="white" strokeWidth="0.5" />
        <line x1="300" y1="50" x2="300" y2="550" stroke="white" strokeWidth="0.5" />
        
        {/* Breitengrade */}
        <ellipse cx="300" cy="300" rx="250" ry="180" stroke="white" strokeWidth="0.5" />
        <ellipse cx="300" cy="300" rx="250" ry="100" stroke="white" strokeWidth="0.5" />
        <line x1="50" y1="300" x2="550" y2="300" stroke="white" strokeWidth="0.5" />
      </svg>

      <svg 
        viewBox="0 0 600 600" 
        className="absolute w-full h-full translate-y-20 scale-125 md:scale-150 transform-gpu"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {routes.map((route, i) => (
          <g key={i}>
            {/* Pfad-Basis (unsichtbar oder extrem dezent) */}
            <path d={route.d} stroke="white" strokeWidth="0.5" opacity="0.05" />
            
            {/* Animierte Datenlinie */}
            <motion.path
              d={route.d}
              stroke="url(#gradient-line)"
              strokeWidth="2"
              strokeLinecap="round"
              initial={{ pathLength: 0.2, pathOffset: 0, opacity: 0 }}
              animate={{ 
                pathOffset: [0, 1],
                opacity: [0, 1, 1, 0]
              }}
              transition={{
                duration: route.duration,
                repeat: Infinity,
                delay: route.delay,
                ease: "easeInOut"
              }}
            />
            
            {/* Nodes am Ende */}
            <motion.circle
              cx="0" cy="0" r="2"
              fill="#6366f1"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              transition={{ duration: route.duration, repeat: Infinity, delay: route.delay }}
            >
              <animateMotion path={route.d} dur={`${route.duration}s`} repeatCount="indefinite" begin={`${route.delay}s`} />
            </motion.circle>
          </g>
        ))}
        
        <defs>
          <linearGradient id="gradient-line" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="50%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="transparent" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

// --- DESIGN TOKENS ---
const theme = {
  bg: 'bg-transparent',
  surface: 'bg-[#0A0A0A]/40',
  border: 'border-white/10',
  borderHover: 'hover:border-[#333333]',
  textPrimary: 'text-[#EDEDED]',
  textSecondary: 'text-[#A1A1A1]',
  accent: 'text-indigo-500',
  accentBg: 'bg-indigo-600',
  accentHover: 'hover:bg-indigo-500'
};

const landingBackgroundThemes = {
  dark: {
    label: 'Dark Classic',
    siteClass: 'bg-[#050505]',
    previewClass: 'bg-[#050505]',
    bubbles: true
  },
  ocean: {
    label: 'Ocean Blue',
    siteClass: 'bg-gradient-to-br from-[#0b1020] via-[#10223f] to-[#0a1730]',
    previewClass: 'bg-gradient-to-br from-[#0b1020] via-[#10223f] to-[#0a1730]',
    bubbles: false
  },
  sunset: {
    label: 'Sunset Gold',
    siteClass: 'bg-gradient-to-br from-[#1a1020] via-[#3a1b2f] to-[#4a2a12]',
    previewClass: 'bg-gradient-to-br from-[#1a1020] via-[#3a1b2f] to-[#4a2a12]',
    bubbles: false
  },
  emerald: {
    label: 'Emerald Night',
    siteClass: 'bg-gradient-to-br from-[#071713] via-[#0f2a22] to-[#102720]',
    previewClass: 'bg-gradient-to-br from-[#071713] via-[#0f2a22] to-[#102720]',
    bubbles: false
  }
};

// --- SHARED COMPONENTS ---

const ScrollReveal = ({ children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 30 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-100px" }}
    transition={{ duration: 0.8, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
  >
    {children}
  </motion.div>
);

const KickLogo = ({ className = "h-6 w-auto" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M4 3H9V8H11V6H12V5H13V4H14V3H20V9H19V10H18V11H17V12H18V13H19V14H20V20H14V19H13V18H12V17H11V15H9V20H4V3Z" fill="#53FC18"/>
  </svg>
);

const BackgroundBubbles = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: -1 }}>
    {/* Base Background */}
    <div className="absolute inset-0 bg-[#050505]" />
    
    {/* Animated Mesh Gradients */}
    <motion.div 
      animate={{
        x: [0, 100, 0],
        y: [0, 50, 0],
        scale: [1, 1.2, 1],
      }}
      transition={{
        duration: 20,
        repeat: Infinity,
        ease: "linear"
      }}
      className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] rounded-full opacity-20 blur-[120px]"
      style={{ background: 'radial-gradient(circle, #4f46e5 0%, transparent 70%)' }}
    />
    
    <motion.div 
      animate={{
        x: [0, -80, 0],
        y: [0, 120, 0],
        scale: [1.2, 1, 1.2],
      }}
      transition={{
        duration: 25,
        repeat: Infinity,
        ease: "linear"
      }}
      className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full opacity-20 blur-[120px]"
      style={{ background: 'radial-gradient(circle, #9333ea 0%, transparent 70%)' }}
    />

    <motion.div 
      animate={{
        x: [0, 40, 0],
        y: [0, -60, 0],
      }}
      transition={{
        duration: 15,
        repeat: Infinity,
        ease: "linear"
      }}
      className="absolute bottom-[10%] left-[20%] w-[40%] h-[40%] rounded-full opacity-10 blur-[100px]"
      style={{ background: 'radial-gradient(circle, #4338ca 0%, transparent 70%)' }}
    />
  </div>
);

const MidnightParticles = () => {
  const particles = Array.from({ length: 40 }).map((_, i) => ({
    id: i,
    size: Math.random() * 2 + 0.5,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 15 + 10,
    delay: Math.random() * 10,
    opacity: Math.random() * 0.4 + 0.1
  }));

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden bg-[#050B18]" style={{ zIndex: -1 }}>
      {/* Mesh Gradients for deep midnight feel */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-indigo-950/20 to-transparent" />
      <motion.div 
        animate={{
          scale: [1, 1.1, 1],
          opacity: [0.15, 0.25, 0.15],
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-indigo-600/10 blur-[140px]" 
      />
      <motion.div 
        animate={{
          scale: [1.1, 1, 1.1],
          opacity: [0.1, 0.2, 0.1],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-800/10 blur-[140px]" 
      />
      
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white"
          style={{
            width: p.size,
            height: p.size,
            left: `${p.x}%`,
            top: `${p.y}%`,
            opacity: p.opacity
          }}
          animate={{
            y: [0, -120, 0],
            opacity: [p.opacity, p.opacity * 2, p.opacity],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Define auth/dashboard paths
  const isAuthOrDashboard = ['/login', '/register', '/onboarding', '/dashboard', '/superadmin'].some(path => location.pathname.startsWith(path));
  
  // Check if we are on a streamer page (any path that isn't root, privacy, terms, imprint, login, etc.)
  const reservedPaths = ['/', '/login', '/register', '/onboarding', '/dashboard', '/superadmin', '/privacy', '/terms', '/imprint'];
  const isStreamerPage = !reservedPaths.includes(location.pathname) && !isAuthOrDashboard;

  // We don't want the main Weblone Header on Streamer pages or Auth/Dashboard
  if (isStreamerPage || isAuthOrDashboard) return null;

  const links = [
    { name: 'Funktionen', href: '#features' },
    { name: 'Ablauf', href: '#workflow' },
    { name: 'FAQ', href: '#faq' }
  ];

  return (
    <header className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'py-4' : 'py-8'}`}>
      <div className={`max-w-[800px] mx-auto px-6 transition-all duration-300 ${scrolled ? 'scale-95' : 'scale-100'}`}>
        <div className={`flex justify-between items-center px-6 py-2 rounded-full border transition-all duration-300 ${scrolled ? 'bg-[#0A0A0A]/40 backdrop-blur-xl border-white/5 shadow-2xl' : 'bg-transparent border-transparent'}`}>
          <Link to="/" className="text-xl font-bold tracking-tight text-white/90 hover:text-white transition-colors">
            Weblone
          </Link>
          
          <nav className="hidden md:flex gap-8">
            {links.map(link => (
              <a key={link.name} href={link.href} className="text-[13px] font-medium text-white/50 hover:text-white transition-colors">
                {link.name}
              </a>
            ))}
          </nav>
          <div className="flex items-center">
            <Link to="/login" className="text-[13px] font-bold text-white/90 hover:text-white transition-colors">
              Login
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

const SectionHeader = ({ title, subtitle, label, center = false }) => (
  <div className={`mb-16 ${center ? 'text-center' : ''}`}>
    {label && (
      <motion.span 
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-indigo-500 text-xs font-bold tracking-[0.2em] uppercase mb-4 block"
      >
        {label}
      </motion.span>
    )}
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="text-3xl md:text-5xl font-bold tracking-tight text-[#EDEDED] mb-4 leading-tight"
    >
      {title}
    </motion.h2>
    {subtitle && (
      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={`text-lg text-[#A1A1A1] leading-relaxed ${center ? 'mx-auto' : ''} max-w-2xl`}
      >
        {subtitle}
      </motion.p>
    )}
  </div>
);

const FeatureCard = ({ icon: Icon, title, description, index }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className={`p-8 rounded-xl border ${theme.border} ${theme.surface} ${theme.borderHover} transition-all group relative overflow-hidden`}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
    <div className="mb-6 text-[#EDEDED] group-hover:text-indigo-500 transition-colors relative z-10">
      <Icon size={24} strokeWidth={1.5} />
    </div>
    <h3 className="text-lg font-semibold text-[#EDEDED] mb-3 relative z-10">{title}</h3>
    <p className="text-[#A1A1A1] text-sm leading-relaxed relative z-10">{description}</p>
  </motion.div>
);

const AccordionItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className={`border-b ${theme.border}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full py-6 flex justify-between items-center text-left hover:text-white transition-colors"
      >
        <span className="text-lg font-medium text-[#EDEDED]">{question}</span>
        <ChevronDown className={`text-[#555] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-[#A1A1A1] leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- PAGE COMPONENTS ---

const Home = () => {
  return (
    <div className="relative min-h-screen">
      <BackgroundBubbles />
      {/* Hero */}
      <section className="pt-48 pb-32 relative overflow-hidden min-h-[90vh] flex items-center">
        <GlobeBackground />
        <div className="max-w-[1200px] mx-auto px-6 relative z-10 w-full">
            <div className="max-w-4xl">
                <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-[#EDEDED] mb-8 leading-[1.1]">
                  Die professionelle Zentrale <br />
                  für deinen <span className="text-indigo-500">Stream.</span>
                </h1>
                <p className="text-lg md:text-xl text-[#A1A1A1] mb-12 leading-relaxed max-w-xl">
                  Etabliere deine eigene Marke, verwalte deine Partnerschaften effizient und biete deiner Community ein interaktives Zuhause ? Website + Dashboard.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mb-16">
                  <Link to="/register" className="bg-[#EDEDED] text-[#050505] px-8 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-[#D4D4D4] transition-all group">
                    Jetzt Starten <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
                
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 1 }}
                  className="flex items-center gap-8 pt-8 border-t border-[#1A1A1A]"
                >
                  <span className="text-sm font-bold tracking-widest text-[#A1A1A1]">OPTIMIERT FÜR</span>
                  <div className="flex items-center gap-6">
                    <a href="https://twitch.tv" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                      <svg className="h-6 w-auto" viewBox="0 0 24 28" xmlns="http://www.w3.org/2000/svg">
                        <path fill="#9146FF" d="M2.149 0L0 5.53v19.105h6.919V28l5.353-3.365h4.413L24 16.817V0H2.149zm20.106 15.53l-3.321 3.321h-4.821l-3.52 3.52v-3.52H5.163V1.747h17.092V15.53zm-3.823-8.831h-2.112v5.354h2.112V6.699zm-6.234 0h-2.112v5.354h2.112V6.699z" />
                      </svg>
                    </a>
                    <a href="https://kick.com" target="_blank" rel="noopener noreferrer" className="hover:opacity-80 transition-opacity">
                      <KickLogo className="h-6 w-auto" />
                    </a>
                  </div>
                </motion.div>
            </div>
        </div>
      </section>

      {/* Benefits Chips */}
      <section className={`py-12 border-y ${theme.border} relative z-10 backdrop-blur-sm`}>
        <div className="max-w-[1200px] mx-auto px-6">
          <ScrollReveal>
            <div className="flex flex-wrap justify-center md:justify-between items-center gap-8">
              {[
                'Volle Markenkontrolle',
                'Maximale Monetarisierung',
                'Automatisierte Prozesse',
                'Zentrale Verwaltung'
              ].map((benefit, i) => (
                <div 
                  key={benefit} 
                  className="flex items-center gap-2 text-[#EDEDED] font-medium"
                >
                  <Check size={16} className="text-indigo-500" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-32 relative z-10">
        <div className="max-w-[1200px] mx-auto px-6">
          <ScrollReveal>
            <SectionHeader 
              label="Features"
              title="Alles, was du zum Wachsen brauchst."
              subtitle="Eine umfassende Suite an Tools, entwickelt für höchste Performance und maximale Conversion."
            />
          </ScrollReveal>
          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard 
              index={0}
              icon={Globe}
              title="Eigene Creator-Website"
              description="Erstelle in Minuten eine vollwertige Webpräsenz mit integriertem Shop, Giveaways und Partner-Landingpages."
            />
            <FeatureCard 
              index={1}
              icon={Layout}
              title="Dashboard & Site Builder"
              description="Gestalte deine Seite per Drag-and-drop. Positioniere Partner-Deals genau dort, wo sie konvertieren."
            />
            <FeatureCard 
              index={2}
              icon={Zap}
              title="Twitch/Kick Anbindung"
              description="Verbinde deine Accounts direkt. Unser Bot übernimmt die Chat-Analyse und liefert Community-Insights."
            />
            <FeatureCard 
              index={3}
              icon={Wrench}
              title="Pro-Streaming-Tools"
              description="Nutze Bonushunt-Listen, Wagerbars, Slottracker und Turniersysteme direkt auf deiner eigenen Domain."
            />
            <FeatureCard 
              index={4}
              icon={BarChart3}
              title="Deals & Monetarisierung"
              description="Nutze vordefinierte Deals und verwalte deine Partnerschaften über ein hochpräzises Postback-System."
            />
            <FeatureCard 
              index={5}
              icon={Activity}
              title="Live-Tracking"
              description="Behalte deine Einnahmen und Conversions in Echtzeit im Blick ? mit chirurgischer Präzision."
            />
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className={`py-32 border-t ${theme.border} relative z-10 backdrop-blur-sm`}>
        <div className="max-w-[1200px] mx-auto px-6">
          <ScrollReveal>
            <div className="grid md:grid-cols-2 gap-24 items-center">
              <div className={`aspect-video rounded-2xl border ${theme.border} ${theme.surface} overflow-hidden shadow-2xl relative group flex items-center justify-center`}>
                 <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 {/* Cartoonish Casino Illustration SVG */}
                 <svg viewBox="0 0 200 200" className="w-48 h-48 drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                   <motion.path 
                     initial={{ pathLength: 0 }}
                     whileInView={{ pathLength: 1 }}
                     transition={{ duration: 2, ease: "easeInOut" }}
                     d="M40,150 L160,150 L160,60 L40,60 Z" 
                     fill="none" 
                     stroke="#4f46e5" 
                     strokeWidth="2" 
                   />
                   <rect x="60" y="80" width="25" height="40" rx="4" fill="#1A1A1A" stroke="#4f46e5" strokeWidth="1" />
                   <rect x="90" y="80" width="25" height="40" rx="4" fill="#1A1A1A" stroke="#4f46e5" strokeWidth="1" />
                   <rect x="120" y="80" width="25" height="40" rx="4" fill="#1A1A1A" stroke="#4f46e5" strokeWidth="1" />
                   <motion.circle 
                     animate={{ scale: [1, 1.2, 1] }}
                     transition={{ duration: 2, repeat: Infinity }}
                     cx="72.5" cy="100" r="5" fill="#53FC18" 
                   />
                   <motion.circle 
                     animate={{ scale: [1, 1.2, 1] }}
                     transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                     cx="102.5" cy="100" r="5" fill="#53FC18" 
                   />
                   <motion.circle 
                     animate={{ scale: [1, 1.2, 1] }}
                     transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                     cx="132.5" cy="100" r="5" fill="#53FC18" 
                   />
                   <path d="M165,80 L175,80 L175,120 L165,120" fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
                   <circle cx="170" cy="70" r="6" fill="#ef4444" />
                 </svg>
              </div>
              <div>
                <SectionHeader 
                  label="Werde Casino-Streamer"
                  title="Dein Weg zum Slot-Profi."
                  subtitle="Die größten Schwierigkeiten als Slot-Streamer sind der Content, ein sauberes Overlay und auch die entsprechenden Sponsoren."
                />
                <motion.p 
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="text-[#A1A1A1] leading-relaxed mb-8"
                >
                  Dennoch ist jeder dieser Punkte notwendig, um einen hoch qualitativen Stream zu bieten. Weblone liefert dir die Infrastruktur, um genau diese Hürden zu meistern.
                </motion.p>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* So funktioniert's */}
      <section id="workflow" className={`py-32 border-t ${theme.border} relative z-10`}>
        <div className="max-w-[1200px] mx-auto px-6">
          <ScrollReveal>
            <SectionHeader 
              center
              label="Prozess"
              title="In wenigen Schritten live."
            />
            <div className="grid md:grid-cols-4 gap-12 text-center">
              {[
                { step: '01', title: 'Anmeldung & Check', desc: 'Registriere dich auf Weblone und lass deinen Kanal von unserem Expertenteam prüfen.' },
                { step: '02', title: 'Setup & Design', desc: 'Wir richten dein All-in-One Paket ein und erstellen deine personalisierten Overlays & Designs.' },
                { step: '03', title: 'Deals & Sponsoren', desc: 'Wähle aus unseren exklusiven Casino-Deals und starte deine profitablen Partnerschaften.' },
                { step: '04', title: 'Live & Profit', desc: 'Geh live mit vollem Support und erhalte deine automatisierten Auszahlungen direkt aufs Dashboard.' }
              ].map((item, i) => (
                <div 
                  key={i} 
                  className="relative"
                >
                  <div className="text-5xl font-black text-white mb-6 transition-colors">{item.step}</div>
                  <h4 className="text-xl font-bold text-[#EDEDED] mb-3">{item.title}</h4>
                  <p className="text-[#A1A1A1] text-sm leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Vorteile Karussell (ehemals Anwendungsbereiche) */}
      <section id="advantages" className={`py-32 border-t ${theme.border} bg-[#080808]/30 relative z-10 backdrop-blur-sm overflow-hidden`}>
        <div className="max-w-[1200px] mx-auto px-6 mb-16">
          <ScrollReveal>
            <SectionHeader 
              label="Benefits"
              title="Alle Vorteile im überblick."
            />
          </ScrollReveal>
        </div>
        
        {/* Infinite Carousel */}
        <ScrollReveal delay={0.2}>
          <div className="relative flex overflow-hidden group">
            <motion.div 
              animate={{ x: ["0%", "-50%"] }}
              transition={{ 
                duration: 30, 
                repeat: Infinity, 
                ease: "linear" 
              }}
              className="flex gap-6 whitespace-nowrap"
            >
              {[...Array(2)].map((_, i) => (
                <div key={i} className="flex gap-6">
                  {[
                    { title: 'Einfach nur Streamen', desc: 'Du kannst dich voll und ganz auf das Streamen konzentrieren. Um alles andere kümmern wir uns!' },
                    { title: 'Die Software', desc: 'Wir haben ein komplettes All-in-One Paket nur für Slotstreamer entwickelt. Du profitierst von unserem technischen Know-How!' },
                    { title: 'Pünktliche Auszahlungen', desc: 'Wir zahlen automatisiert an jedem 15. des Monats über unser Dashboard aus. Verlässlich und pünktlich.' },
                    { title: 'Die besten Casino-Deals', desc: 'Ein einziger Ansprechpartner für alle deine Casino-Deals. übersichtlich und transparent.' },
                    { title: 'Qualitätsberatung', desc: 'Regelmäßige Konversationen um gemeinsam Lösungen zu finden. Kontinuierliche Verbesserung ist das Geheimnis.' },
                    { title: 'Starthilfe', desc: 'Unser Netzwerk aus Slotstreamern hilft jedem Neuling durch Raids, Hosts und Shoutouts.' },
                    { title: 'Persönlicher Support', desc: 'Unser Team nimmt sich zu allen Zeiten deinen Problemen an. Ein Ansprechpartner für alle Fälle.' },
                    { title: 'Designs', desc: 'Ein Designer plant deinen kompletten Auftritt: Overlays, Banner, Animationen und Alerts.' }
                  ].map((adv, idx) => (
                    <div 
                      key={idx} 
                      className={`w-[350px] p-8 rounded-2xl border ${theme.border} ${theme.surface} hover:bg-[#0E0E0E] transition-colors flex-shrink-0 whitespace-normal`}
                    >
                      <h4 className="text-xl font-bold text-[#EDEDED] mb-4">{adv.title}</h4>
                      <p className="text-[#A1A1A1] leading-relaxed text-sm">{adv.desc}</p>
                    </div>
                  ))}
                </div>
              ))}
            </motion.div>
          </div>
        </ScrollReveal>
      </section>

      {/* Payment Options Section */}
      <section className={`py-32 border-t ${theme.border} relative z-10 backdrop-blur-sm`}>
        <div className="max-w-[1200px] mx-auto px-6">
          <ScrollReveal>
            <div className="grid md:grid-cols-2 gap-24 items-center">
              <div>
                <SectionHeader 
                  label="Monetarisierung"
                  title="Wie werde ich bezahlt?"
                  subtitle="Wir bieten zwei verschiedene Möglichkeiten an, um deine Einnahmen zu maximieren."
                />
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                      <Zap size={24} />
                    </div>
                    <div>
                      <h4 className="text-[#EDEDED] font-bold mb-2">Monatliches Fixum</h4>
                      <p className="text-[#A1A1A1] text-sm leading-relaxed">
                        Bekannteren Streamern bieten wir eine monatliche Summe an, welche je nach Größe und Reichweite deines Kanals variieren kann.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                      <BarChart3 size={24} />
                    </div>
                    <div>
                      <h4 className="text-[#EDEDED] font-bold mb-2">CPA-Vergütung</h4>
                      <p className="text-[#A1A1A1] text-sm leading-relaxed">
                        Alternativ kannst du nach Ersteinzahlungen (FTDs) verrechnen. Du wirst für jeden neuen Spieler, der eine Einzahlung tätigt, entsprechend vergütet.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`aspect-video rounded-2xl border ${theme.border} ${theme.surface} overflow-hidden shadow-2xl relative group flex items-center justify-center`}>
                 <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                 {/* Minimalist Payment Illustration */}
                 <svg viewBox="0 0 200 200" className="w-48 h-48">
                   <motion.rect 
                      initial={{ height: 0 }}
                      whileInView={{ height: 60 }}
                      transition={{ duration: 1 }}
                      x="50" y="100" width="20" fill="#4f46e5" rx="2" 
                   />
                   <motion.rect 
                      initial={{ height: 0 }}
                      whileInView={{ height: 100 }}
                      transition={{ duration: 1, delay: 0.2 }}
                      x="90" y="60" width="20" fill="#6366f1" rx="2" 
                   />
                   <motion.rect 
                      initial={{ height: 0 }}
                      whileInView={{ height: 80 }}
                      transition={{ duration: 1, delay: 0.4 }}
                      x="130" y="80" width="20" fill="#818cf8" rx="2" 
                   />
                   <motion.circle 
                      animate={{ y: [0, -10, 0] }}
                      transition={{ duration: 3, repeat: Infinity }}
                      cx="100" cy="40" r="10" fill="#53FC18" 
                   />
                   <path d="M40,165 L160,165" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.2" />
                 </svg>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className={`py-32 border-t ${theme.border} relative z-10`}>
        <div className="max-w-[800px] mx-auto px-6">
          <ScrollReveal>
            <SectionHeader 
              center
              label="FAQ"
              title="Häufig gestellte Fragen."
            />
            <div className="space-y-2">
              {[
                { q: 'Benötige ich Programmierkenntnisse?', a: 'Nein. Das gesamte System ist als No-Code-Plattform konzipiert. Du kannst alles visuell über dein Dashboard steuern.' },
                { q: 'Kann ich meine eigene Domain nutzen?', a: 'Ja, du kannst jede vorhandene Domain mit deiner Website verbinden oder eine Subdomain von uns nutzen.' },
                { q: 'Welche Plattformen werden unterstützt?', a: 'Wir bieten eine vollständige Integration für Twitch und Kick, inklusive Chat-Bot-Anbindung und Live-Daten.' },
                { q: 'Wie sicher sind meine Daten?', a: 'Sicherheit hat Priorität. Alle Daten werden verschlüsselt übertragen und auf hochsicheren Servern verarbeitet.' },
                { q: 'Gibt es eine Mindestlaufzeit?', a: 'Nein, unsere Abonnements sind flexibel und können jederzeit zum Ende des Abrechnungszeitraums gekündigt werden.' },
                { q: 'Wird die Website mobil gut dargestellt?', a: 'Ja, alle Websites und Dashboards sind vollständig responsive und für Smartphones sowie Tablets optimiert.' }
              ].map((faq, i) => (
                <AccordionItem key={i} question={faq.q} answer={faq.a} />
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-40 relative overflow-hidden z-10">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-6xl font-bold tracking-tighter text-[#EDEDED] mb-8 leading-tight"
          >
            Bereit, deinen Stream auf <br /> das nächste Level zu heben?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[#A1A1A1] text-lg md:text-xl mb-12 max-w-xl mx-auto leading-relaxed"
          >
            Hör auf, dich mit Notlösungen zufrieden zu geben. Baue die Infrastruktur, die dein Content verdient.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="flex justify-center"
          >
            <Link to="/register" className="bg-[#EDEDED] text-[#050505] px-10 py-4 rounded-full font-bold text-lg hover:bg-[#D4D4D4] transition-all inline-flex items-center justify-center">
              Jetzt Website erstellen
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-20 border-t ${theme.border} bg-[#050505] relative z-10`}>
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-1">
              <div className="text-xl font-bold tracking-tight text-[#EDEDED] flex items-center gap-2 mb-6">
                <span>Weblone</span>
              </div>
              <p className="text-sm text-[#A1A1A1] leading-relaxed">
                Der moderne Standard für Creator-Management und Markenaufbau.
              </p>
            </div>
            {[
              { title: 'Produkt', links: ['Funktionen', 'Lösungen'] },
              { title: 'Rechtliches', links: ['Datenschutz', 'AGB'] }
            ].map(col => (
              <div key={col.title}>
                <h5 className="text-sm font-bold text-[#EDEDED] mb-6 tracking-wide uppercase">{col.title}</h5>
                <ul className="space-y-4">
                  {col.links.map(link => (
                    <li key={link}>
                      <a 
                        href={link === 'Datenschutz' ? '/privacy' : link === 'AGB' ? '/terms' : '#'} 
                        className="text-sm text-[#A1A1A1] hover:text-[#EDEDED] transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-[#1A1A1A] gap-4">
            <p className="text-xs text-[#555]">
              ? {new Date().getFullYear()} Weblone Infrastructure Inc. Alle Rechte vorbehalten.
            </p>
            <div className="flex gap-6 text-[#555] text-xs">
              <Link to="/privacy" className="hover:text-white">Datenschutz</Link>
              <Link to="/terms" className="hover:text-white">AGB</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

const Privacy = () => (
  <div className={`${theme.bg} min-h-screen text-[#EDEDED] pt-32 pb-20 relative overflow-hidden`}>
    <BackgroundBubbles />
    <div className="max-w-[800px] mx-auto px-6 relative z-10">
      <h1 className="text-4xl font-bold tracking-tight mb-8">Datenschutzerklärung</h1>
      <div className="prose prose-invert text-[#A1A1A1] leading-relaxed space-y-6">
        <section>
          <h2 className="text-xl font-bold text-[#EDEDED] mt-12">1. Datenschutz auf einen Blick</h2>
          <p>Die folgenden Hinweise geben einen einfachen überblick darüber, was mit Ihren personenbezogenen Daten passiert, wenn Sie diese Website besuchen. Personenbezogene Daten sind alle Daten, mit denen Sie persönlich identifiziert werden können.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-[#EDEDED] mt-8">2. Datenerfassung auf dieser Website</h2>
          <h3 className="text-lg font-bold text-[#EDEDED] mt-4">Cookies & Tracking</h3>
          <p>Unsere Website verwendet technische Cookies, die für den Betrieb der Plattform notwendig sind. Wir nutzen Analysetools nur mit Ihrer ausdrücklichen Zustimmung, um die Benutzererfahrung zu verbessern.</p>
          <h3 className="text-lg font-bold text-[#EDEDED] mt-4">Server-Log-Dateien</h3>
          <p>Der Provider der Seiten erhebt und speichert automatisch Informationen in sogenannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind: Browsertyp, Betriebssystem, Referrer URL, Hostname des zugreifenden Rechners und Uhrzeit der Serveranfrage.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-[#EDEDED] mt-8">3. Rechte der betroffenen Person</h2>
          <p>Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Herkunft, Empfänger und Zweck Ihrer gespeicherten personenbezogenen Daten. Sie haben außerdem ein Recht, die Berichtigung oder Löschung dieser Daten zu verlangen.</p>
        </section>
      </div>
    </div>
  </div>
);

const Terms = () => (
  <div className={`${theme.bg} min-h-screen text-[#EDEDED] pt-32 pb-20 relative overflow-hidden`}>
    <BackgroundBubbles />
    <div className="max-w-[800px] mx-auto px-6 relative z-10">
      <h1 className="text-4xl font-bold tracking-tight mb-8">Allgemeine Geschäftsbedingungen (AGB)</h1>
      <div className="prose prose-invert text-[#A1A1A1] leading-relaxed space-y-6">
        <section>
          <h2 className="text-xl font-bold text-[#EDEDED] mt-12">1. Geltungsbereich</h2>
          <p>Diese AGB gelten für alle Verträge zwischen Weblone Infrastructure Inc. und den Nutzern der Plattform. Mit der Registrierung erklärt sich der Nutzer mit diesen Bedingungen einverstanden.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-[#EDEDED] mt-8">2. Leistungsbeschreibung</h2>
          <p>Weblone bietet eine Infrastruktur für Creator, einschließlich Website-Builder, Dashboard-Systemen und Vermittlung von Werbepartnern. Der genaue Leistungsumfang ergibt sich aus der jeweiligen Leistungsbeschreibung zum Zeitpunkt des Vertragsschlusses.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-[#EDEDED] mt-8">3. Pflichten des Nutzers</h2>
          <p>Der Nutzer ist verpflichtet, bei der Registrierung wahrheitsgemäße Angaben zu machen. Es ist untersagt, die Plattform für illegale Aktivitäten oder zur Verbreitung von schädlicher Software zu nutzen.</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-[#EDEDED] mt-8">4. Auszahlungen & Vergütung</h2>
          <p>Auszahlungen erfolgen gemäß den im Dashboard vereinbarten Konditionen. Weblone behält sich das Recht vor, Auszahlungen bei Verdacht auf Betrug oder Manipulation bis zur Klärung einzubehalten.</p>
        </section>
      </div>
    </div>
  </div>
);

const Imprint = () => (
  <div className={`${theme.bg} min-h-screen text-[#EDEDED] pt-32 pb-20 relative overflow-hidden`}>
    <BackgroundBubbles />
    <div className="max-w-[800px] mx-auto px-6 relative z-10">
      <h1 className="text-4xl font-bold tracking-tight mb-8">Impressum</h1>
      <div className="prose prose-invert text-[#A1A1A1] leading-relaxed space-y-4">
        <p>Weblone Infrastructure Inc.</p>
        <p>Edge Computing Plaza 101</p>
        <p>San Francisco, CA 94105</p>
        <p className="mt-8">Vertreten durch den Vorstand.</p>
        <p>E-Mail: hello@streamline.io</p>
      </div>
    </div>
  </div>
);

// --- STREAMER LANDING PAGE CONTENT ---
const StreamerPageContent = ({ data }) => {
  // Template Styles mapping
  const templateStyles = {
    1: { // Neon Night
      bg: 'bg-[#05000A]',
      accent: 'text-purple-500',
      border: 'border-purple-500/20',
      card: 'bg-purple-900/10',
      nav: 'bg-purple-900/20 backdrop-blur-xl border-purple-500/10'
    },
    2: { // Minimal Pro
      bg: 'bg-[#0A0A0A]',
      accent: 'text-zinc-100',
      border: 'border-zinc-800',
      card: 'bg-zinc-900/50',
      nav: 'bg-black/40 backdrop-blur-xl border-zinc-800'
    },
    3: { // Casino Master
      bg: 'bg-[#000A05]',
      accent: 'text-green-500',
      border: 'border-green-500/20',
      card: 'bg-green-900/10',
      nav: 'bg-green-900/20 backdrop-blur-xl border-green-500/10'
    }
  };

  const style = templateStyles[data.user.templateId] || templateStyles[2];

  return (
    <div className={`min-h-screen ${style.bg} text-white`}>
      <BackgroundBubbles />
      
      {/* Streamer Custom Nav */}
      <nav className={`fixed top-4 md:top-6 left-1/2 -translate-x-1/2 w-[94%] max-w-4xl z-50 px-4 md:px-8 py-3 md:py-4 rounded-2xl border ${style.nav} flex justify-between items-center`}>
        <span className="text-lg md:text-xl font-black tracking-tighter">{data.user.username}</span>
        <div className="hidden sm:flex gap-4 md:gap-6 items-center">
          <a href="#about" className="text-sm font-medium hover:opacity-70 transition-opacity">About</a>
          <a href="#deals" className="text-sm font-medium hover:opacity-70 transition-opacity">Deals</a>
          <button className={`bg-white text-black px-4 py-2 rounded-lg text-sm font-bold hover:bg-white/90 transition-all`}>
            Follow
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto pt-32 md:pt-40 px-4 md:px-6 relative z-10 pb-20 md:pb-32">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-24"
        >
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black tracking-tighter mb-6 uppercase italic">
            {data.user.username}<span className={style.accent}>.</span>
          </h1>
          <p className="text-base md:text-xl text-[#A1A1A1] max-w-xl mx-auto">
            Willkommen in meiner Community. Checke unten meine exklusiven Deals und Tools ab!
          </p>
        </motion.div>
        
        <div id="deals" className="grid gap-8">
          {data.blocks.map((block, i) => (
            <motion.div 
              key={block.id} 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`p-6 md:p-10 rounded-3xl border ${style.border} ${style.card} group hover:scale-[1.01] transition-all`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <span className={`text-xs font-bold tracking-[0.2em] uppercase ${style.accent} mb-4 block`}>
                    {block.type}
                  </span>
                  <h2 className="text-3xl font-bold mb-4">{block.name}</h2>
                  <p className="text-[#A1A1A1] max-w-lg mb-8">
                    Sichere dir jetzt exklusive Vorteile und unterstütze den Stream direkt über diesen Link.
                  </p>
                  <button className={`px-8 py-3 rounded-xl font-bold border ${style.border} hover:bg-white hover:text-black transition-all`}>
                    Angebot ?ffnen
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- STREAMER LANDING PAGE ---
const StreamerPage = () => {
  const { slug } = useParams();
  return <StreamerPageOverride slug={slug} />;
};

// --- AUTH & ONBOARDING COMPONENTS ---

const Login = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (data.success) {
        onLogin(data.user);
        if (data.user?.isSuperadmin) {
          navigate('/superadmin');
        } else {
          // Immer zum Dashboard, Setupwizard ist nun optionaler Startbutton dort
          navigate('/dashboard');
        }
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Verbindung zum Server fehlgeschlagen.');
    }
  };

  return (
    <div className={`${theme.bg} min-h-screen flex items-center justify-center pt-20 px-6 relative overflow-hidden`}>
      <BackgroundBubbles />
      <div className="max-w-md w-full relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-8 rounded-3xl border ${theme.border} ${theme.surface} backdrop-blur-xl shadow-2xl`}
        >
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-[#EDEDED] mb-2">Willkommen zurück</h1>
            <p className="text-[#A1A1A1]">Logge dich in dein Streamer-Dashboard ein.</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-[#A1A1A1] mb-2">E-Mail Adresse</label>
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full bg-white/5 border ${theme.border} rounded-xl px-4 py-3 text-[#EDEDED] focus:outline-none focus:border-indigo-500 transition-colors`}
                placeholder="name@stream.de"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#A1A1A1] mb-2">Passwort</label>
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full bg-white/5 border ${theme.border} rounded-xl px-4 py-3 text-[#EDEDED] focus:outline-none focus:border-indigo-500 transition-colors`}
                placeholder="••••••••"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-[#EDEDED] text-[#050505] py-4 rounded-xl font-bold hover:bg-[#D4D4D4] transition-all"
            >
              Einloggen
            </button>
          </form>
          <div className="mt-8 pt-8 border-t border-white/5 text-center flex flex-col gap-4">
            <Link to="/register" className="text-indigo-500 text-sm font-medium hover:text-indigo-400 transition-colors">
              Account erstellen
            </Link>
            <Link to="/" className="text-[#A1A1A1] text-sm font-medium hover:text-white transition-colors">
              Zurück zur Startseite
            </Link>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="text-[#555] text-sm font-medium hover:text-[#777] transition-colors"
            >
              Zugang anfragen
            </button>
          </div>
        </motion.div>
      </div>

      {/* Modal Backdrop */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className={`max-w-md w-full p-8 rounded-3xl border ${theme.border} bg-[#0A0A0A] shadow-2xl relative overflow-hidden`}
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
              
              <div className="relative z-10">
                <h2 className="text-2xl font-bold text-[#EDEDED] mb-6">Zugang anfragen</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-500 flex-shrink-0">
                      <User size={20} />
                    </div>
                    <div>
                      <span className="text-xs text-[#A1A1A1] block uppercase tracking-wider font-bold mb-1">Ansprechpartner</span>
                      <span className="text-[#EDEDED] font-medium">Enrico Gross</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-indigo-500 flex-shrink-0">
                      <Zap size={20} />
                    </div>
                    <div>
                      <span className="text-xs text-[#A1A1A1] block uppercase tracking-wider font-bold mb-1">E-Mail</span>
                      <a href="mailto:kontakt@weblone.de" className="text-[#EDEDED] font-medium hover:text-indigo-400 transition-colors">kontakt@weblone.de</a>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mt-8">
                    <h4 className="text-sm font-bold text-[#EDEDED] mb-2 flex items-center gap-2">
                      <ShieldCheck size={16} className="text-green-500" />
                      Wichtige Hinweise
                    </h4>
                    <ul className="text-xs text-[#A1A1A1] space-y-2 leading-relaxed">
                      <li>• Freischaltung erfolgt manuell nach Prüfung deines Kanals.</li>
                      <li>? Antwortzeit in der Regel innerhalb von 24 Stunden.</li>
                      <li>• Exklusiver Zugang für verifizierte Streamer (Twitch/Kick).</li>
                    </ul>
                  </div>

                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="w-full bg-[#EDEDED] text-[#050505] py-3 rounded-xl font-bold mt-4 hover:bg-[#D4D4D4] transition-all"
                  >
                    Schließen
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Register = ({ onRegister }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    inviteCode: ''
  });
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();
      if (data.success) {
        onRegister(data.user);
        // Immer zum Dashboard, Setupwizard ist nun optionaler Startbutton dort
        navigate('/dashboard');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Verbindung zum Server fehlgeschlagen.');
    }
  };

  return (
    <div className={`${theme.bg} min-h-screen flex items-center justify-center pt-20 px-6 relative overflow-hidden`}>
      <BackgroundBubbles />
      <div className="max-w-md w-full relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-8 rounded-3xl border ${theme.border} ${theme.surface} backdrop-blur-xl shadow-2xl`}
        >
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-[#EDEDED] mb-2">Account erstellen</h1>
            <p className="text-[#A1A1A1]">Starte jetzt mit deiner Streamer-Website.</p>
          </div>
          <form onSubmit={handleRegister} className="space-y-6">
            {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">{error}</div>}
            <div>
              <label className="block text-sm font-medium text-[#A1A1A1] mb-2">E-Mail Adresse</label>
              <input 
                type="email" 
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className={`w-full bg-white/5 border ${theme.border} rounded-xl px-4 py-3 text-[#EDEDED] focus:outline-none focus:border-indigo-500 transition-colors`}
                placeholder="name@stream.de"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#A1A1A1] mb-2">Passwort</label>
              <input 
                type="password" 
                required
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className={`w-full bg-white/5 border ${theme.border} rounded-xl px-4 py-3 text-[#EDEDED] focus:outline-none focus:border-indigo-500 transition-colors`}
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#A1A1A1] mb-2">Einladungscode</label>
              <input 
                type="text" 
                required
                value={formData.inviteCode}
                onChange={(e) => setFormData({...formData, inviteCode: e.target.value})}
                className={`w-full bg-white/5 border ${theme.border} rounded-xl px-4 py-3 text-[#EDEDED] focus:outline-none focus:border-indigo-500 transition-colors`}
                placeholder="Code eingeben"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20"
            >
              Registrieren
            </button>
          </form>
          <div className="mt-8 pt-8 border-t border-white/5 text-center flex flex-col gap-4">
            <Link to="/login" className="text-indigo-500 text-sm font-medium hover:text-indigo-400 transition-colors">
              Bereits einen Account? Einloggen
            </Link>
            <Link to="/" className="text-[#A1A1A1] text-sm font-medium hover:text-white transition-colors">
              Zurück zur Startseite
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const OnboardingStart = ({ user }) => {
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  return (
    <div className={`${theme.bg} min-h-screen flex items-center justify-center pt-20 px-6 relative overflow-hidden`}>
      <BackgroundBubbles />
      <div className="max-w-2xl w-full text-center relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-8"
        >
          <div className="inline-flex p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-500 mb-4">
            <Zap size={40} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-[#EDEDED] leading-tight">
            Willkommen. In wenigen Schritten zu deiner eigenen Streamer-Website.
          </h1>
          <p className="text-[#A1A1A1] text-lg max-w-lg mx-auto leading-relaxed">
            Wir führen dich durch den Prozess, um deine Marke zu stärken und deine Community zu begeistern.
          </p>
          <button 
            onClick={() => navigate('/onboarding/template')}
            className="bg-[#EDEDED] text-[#050505] px-10 py-4 rounded-full font-bold text-lg hover:bg-[#D4D4D4] transition-all inline-flex items-center gap-2 group"
          >
            Setup starten <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>
      </div>
    </div>
  );
};

const TemplateSelection = ({ user }) => {
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  
  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const handleNext = () => {
    localStorage.setItem('selectedTemplate', selected);
    navigate('/onboarding/setup');
  };

  const templates = [
    { id: 1, name: 'Neon Night', image: 'bg-gradient-to-br from-purple-900 to-black' },
    { id: 2, name: 'Minimal Pro', image: 'bg-gradient-to-br from-zinc-800 to-black' },
    { id: 3, name: 'Casino Master', image: 'bg-gradient-to-br from-green-900 to-black' }
  ];

  return (
    <div className={`${theme.bg} min-h-screen pt-32 pb-20 px-6 relative overflow-hidden`}>
      <BackgroundBubbles />
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-[#EDEDED] mb-4">Wähle dein Template</h2>
          <p className="text-[#A1A1A1]">Dieses Design wird die Basis für deine neue Website sein.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {templates.map((tpl) => (
            <motion.div 
              key={tpl.id}
              whileHover={{ y: -5 }}
              onClick={() => setSelected(tpl.id)}
              className={`cursor-pointer rounded-2xl border-2 transition-all overflow-hidden ${selected === tpl.id ? 'border-indigo-500 ring-4 ring-indigo-500/10' : `border-white/5 ${theme.surface}`}`}
            >
              <div className={`aspect-[4/5] ${tpl.image} flex items-end p-6`}>
                <div className="w-full h-1/3 bg-black/40 backdrop-blur-md rounded-xl p-4 border border-white/10">
                  <div className="h-2 w-2/3 bg-white/20 rounded-full mb-2" />
                  <div className="h-2 w-1/2 bg-white/10 rounded-full" />
                </div>
              </div>
              <div className="p-4 flex justify-between items-center">
                <span className="font-bold text-[#EDEDED]">{tpl.name}</span>
                {selected === tpl.id && <Check size={18} className="text-indigo-500" />}
              </div>
            </motion.div>
          ))}
        </div>
        
        <div className="flex justify-center">
          <button 
            disabled={!selected}
            onClick={handleNext}
            className={`px-10 py-4 rounded-full font-bold text-lg transition-all ${selected ? 'bg-[#EDEDED] text-[#050505] hover:bg-[#D4D4D4]' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
          >
            Weiter
          </button>
        </div>
      </div>
    </div>
  );
};

const BaseSetup = ({ user, onComplete }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    siteSlug: '',
    category: 'Casino'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const handleFinish = async () => {
    if (!user) return;
    setLoading(true);
    setError('');
    
    // Normalize slug: lowercase and remove special chars/spaces
    const normalizedSlug = formData.siteSlug.toLowerCase().trim().replace(/[^a-z0-9]/g, '-');
    
    const templateId = localStorage.getItem('selectedTemplate');
    try {
      const response = await fetch(`${API_BASE}/api/user/${user.id}/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, siteSlug: normalizedSlug, templateId })
      });
      const data = await response.json();
      if (data.success) {
        localStorage.removeItem('selectedTemplate');
        onComplete({ isSetupComplete: 1, ...formData, siteSlug: normalizedSlug });
        navigate(`/dashboard/${normalizedSlug}`);
      } else {
        setError(data.error || 'Setup fehlgeschlagen.');
      }
    } catch (err) {
      console.error(err);
      setError('Verbindung zum Server fehlgeschlagen.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${theme.bg} min-h-screen pt-32 pb-20 px-6 relative overflow-hidden`}>
      <BackgroundBubbles />
      <div className="max-w-md mx-auto relative z-10">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#EDEDED] mb-4">Basis-Setup</h2>
          <p className="text-[#A1A1A1]">Nur noch ein paar Details und deine Seite ist bereit.</p>
        </div>
        
        <div className={`p-8 rounded-3xl border ${theme.border} ${theme.surface} backdrop-blur-xl shadow-2xl space-y-6`}>
          {error && <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">{error}</div>}
          <div>
            <label className="block text-sm font-medium text-[#A1A1A1] mb-2">Streamer-Name</label>
            <input 
              type="text" 
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              className={`w-full bg-white/5 border ${theme.border} rounded-xl px-4 py-3 text-[#EDEDED] focus:outline-none focus:border-indigo-500 transition-colors`}
              placeholder="z.B. Knossi"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#A1A1A1] mb-2">Website-Slug (URL Name)</label>
            <div className="flex items-center">
              <span className="bg-white/5 border border-r-0 border-white/10 rounded-l-xl px-4 py-3 text-[#555] text-sm">{window.location.host}/</span>
              <input 
                type="text" 
                value={formData.siteSlug}
                onChange={(e) => setFormData({...formData, siteSlug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                className={`flex-1 bg-white/5 border ${theme.border} rounded-r-xl px-4 py-3 text-[#EDEDED] focus:outline-none focus:border-indigo-500 transition-colors`}
                placeholder="deinname"
              />
            </div>
            <p className="text-[10px] text-[#555] mt-2">Nur Kleinbuchstaben, Zahlen und Bindestriche erlaubt.</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#A1A1A1] mb-2">Kategorie</label>
            <select 
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className={`w-full bg-[#0A0A0A] border ${theme.border} rounded-xl px-4 py-3 text-[#EDEDED] focus:outline-none focus:border-indigo-500 transition-colors appearance-none`}
            >
              <option>Casino</option>
              <option>Gaming</option>
              <option>Just Chatting</option>
              <option>Sports</option>
            </select>
          </div>
          <button 
            onClick={handleFinish}
            disabled={loading || !formData.username || !formData.siteSlug}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
          >
            {loading ? 'Wird eingerichtet...' : 'Setup abschließen'}
          </button>
        </div>
      </div>
    </div>
  );
};

const OnboardingWizard = ({ user, onComplete, initialStep = 0 }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(initialStep);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [slugState, setSlugState] = useState({ checking: false, available: true, message: '' });

  const [basic, setBasic] = useState({
    fullName: '',
    streamerName: user?.username || '',
    siteSlug: user?.siteSlug || '',
    category: user?.category || 'Casino'
  });
  const [templateId, setTemplateId] = useState(user?.templateId || 2);
  const [social, setSocial] = useState({
    twitchBotUsername: '',
    twitchOauthToken: '',
    kickChannel: '',
    kickWebhookUrl: '',
    kickWebhookSecret: ''
  });
  const [bot, setBot] = useState({
    twitchChannel: '',
    kickChannel: '',
    adIntervalMinutes: 15,
    adMessage: 'Werbung: Checkt meine Deals auf der Landingpage.',
    autoStartReader: false
  });
  const [dealSelections, setDealSelections] = useState({});
  const [deals, setDeals] = useState([]);
  const [landing, setLanding] = useState({
    navTitle: user?.username || '',
    slogan: '',
    primaryCtaText: 'Jetzt Bonus sichern',
    primaryCtaUrl: '',
    stickyCtaEnabled: 1,
    stickyCtaText: 'Jetzt registrieren & Bonus aktivieren',
    stickyCtaUrl: '',
    trustBadgeText: 'Verifiziert | 18+ | Verantwortungsvoll spielen',
    urgencyText: 'Nur heute: exklusive Freispiele für neue Spieler'
  });
  const [pageVisibility, setPageVisibility] = useState({
    '': true,
    shop: true,
    hunt: true,
    giveaway: true
  });

  const isValidUrl = (value) => {
    if (!value) return true;
    try {
      const u = new URL(value);
      return ['http:', 'https:'].includes(u.protocol);
    } catch (e) {
      return false;
    }
  };

  const stepLabels = [
    'Basisdaten',
    'Template',
    'Social Tokens',
    'Landingpage',
    'Verbindung starten'
  ];

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        const [dashRes, settingsRes, pagesRes] = await Promise.all([
          fetch(`${API_BASE}/api/user/${user.id}/dashboard`),
          fetch(`${API_BASE}/api/site/${user.id}/settings`),
          fetch(`${API_BASE}/api/site/${user.id}/pages`)
        ]);

        const dash = await dashRes.json();
        const settings = await settingsRes.json();
        const pages = await pagesRes.json();

        if (dash.success) {
          setDeals(dash.data?.deals || []);
          const next = {};
          (dash.data?.deals || []).forEach((d) => { next[d.id] = d.status !== 'Deaktiviert'; });
          setDealSelections(next);

          let parsedTools = {};
          try {
            parsedTools = typeof dash.data?.user?.toolsConfig === 'string'
              ? JSON.parse(dash.data.user.toolsConfig || '{}')
              : (dash.data?.user?.toolsConfig || {});
          } catch (e) {}

          setSocial((prev) => ({
            ...prev,
            twitchBotUsername: parsedTools?.chatAuth?.twitchBotUsername || '',
            twitchOauthToken: parsedTools?.chatAuth?.twitchOauthToken || '',
            kickChannel: parsedTools?.socialAuth?.kick?.channel || '',
            kickWebhookUrl: parsedTools?.kickBridge?.webhookUrl || '',
            kickWebhookSecret: parsedTools?.kickBridge?.webhookSecret || ''
          }));
          setBot((prev) => ({
            ...prev,
            twitchChannel: parsedTools?.bonushunt?.twitch || '',
            kickChannel: parsedTools?.bonushunt?.kick || ''
          }));
        }

        if (settings.success) {
          setLanding((prev) => ({ ...prev, ...(settings.settings || {}) }));
        }
        if (pages.success) {
          const vis = { ...pageVisibility };
          (pages.pages || []).forEach((p) => {
            vis[p.slug || ''] = !!p.visible;
          });
          setPageVisibility(vis);
        }
      } catch (err) {
        console.error(err);
      }
    };
    load();
  }, [user?.id]);

  const normalizeSlug = (value) => String(value || '').toLowerCase().trim().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');

  useEffect(() => {
    const slug = normalizeSlug(basic.siteSlug || basic.streamerName);
    if (!slug || !user?.id) {
      setSlugState({ checking: false, available: false, message: 'Slug fehlt.' });
      return;
    }
    if (slug.length < 3) {
      setSlugState({ checking: false, available: false, message: 'Name muss mindestens 3 Zeichen haben.' });
      return;
    }

    const isOwnSlug = user?.siteSlug && slug === user.siteSlug;
    if (isOwnSlug) {
      setSlugState({ checking: false, available: true, message: 'Dein aktueller Name.' });
      return;
    }

    const timeoutId = setTimeout(async () => {
      setSlugState({ checking: true, available: false, message: 'Prüfe Verfügbarkeit...' });
      try {
        const res = await fetch(`${API_BASE}/api/check-slug/${encodeURIComponent(slug)}`);
        const data = await res.json();
        if (data.available) {
          setSlugState({ checking: false, available: true, message: 'Name ist verfügbar.' });
        } else {
          setSlugState({ checking: false, available: false, message: 'Dieser Name ist bereits vergeben.' });
        }
      } catch (err) {
        setSlugState({ checking: false, available: false, message: 'Check fehlgeschlagen.' });
      }
    }, 450);

    return () => clearTimeout(timeoutId);
  }, [basic.siteSlug, basic.streamerName, user?.id, user?.siteSlug]);

  const getStepError = (currentStep) => {
    const slug = normalizeSlug(basic.siteSlug || basic.streamerName);
    if (currentStep === 0) {
      if (!basic.fullName.trim()) return 'Name ist erforderlich.';
      if (!basic.streamerName.trim()) return 'Streamername ist erforderlich.';
      if (!slug) return 'Seiten-Name ist erforderlich.';
      if (slug.length < 3) return 'Name muss mindestens 3 Zeichen haben.';
      if (!slugState.available) return slugState.message || 'Name ist nicht verfügbar.';
      return '';
    }
    if (currentStep === 2) {
      if ((social.twitchOauthToken && !social.twitchBotUsername) || (!social.twitchOauthToken && social.twitchBotUsername)) {
        return 'Für Twitch Bot müssen Username und OAuth Token gemeinsam gesetzt werden.';
      }
      if (social.kickWebhookUrl && !isValidUrl(social.kickWebhookUrl)) return 'Kick Webhook URL ist ungültig.';
      return '';
    }
    if (currentStep === 3) {
      if (landing.primaryCtaUrl && !isValidUrl(landing.primaryCtaUrl)) return 'Primary CTA URL ist ungültig.';
      if (landing.stickyCtaUrl && !isValidUrl(landing.stickyCtaUrl)) return 'Sticky CTA URL ist ungültig.';
      return '';
    }
    return '';
  };

  const currentStepError = getStepError(step);

  const connectTwitchOauth = () => {
    if (!user?.id) return;
    window.location.href = `${API_BASE}/api/social/twitch/start?userId=${user.id}`;
  };

  const finalizeWizard = async () => {
    if (!user?.id) return;
    const blockers = [0, 2, 3].map((s) => getStepError(s)).filter(Boolean);
    if (blockers.length > 0) {
      setError(blockers[0]);
      return;
    }
    setSaving(true);
    setError('');
    setStatus('Richte alles ein...');

    const slug = normalizeSlug(basic.siteSlug || basic.streamerName);
    try {
      // Step A: setup account/site basics
      if (!user.isSetupComplete) {
        const setupRes = await fetch(`${API_BASE}/api/user/${user.id}/setup`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            templateId,
            username: basic.streamerName,
            siteSlug: slug,
            category: basic.category
          })
        });
        const setupData = await setupRes.json();
        if (!setupRes.ok || !setupData.success) throw new Error(setupData.error || 'Setup fehlgeschlagen.');
      }

      setStatus('Speichere Tools und Social...');
      const dashboardRes = await fetch(`${API_BASE}/api/user/${user.id}/dashboard`);
      const dashboardData = await dashboardRes.json();
      const currentUser = dashboardData?.data?.user || user;
      const currentDeals = dashboardData?.data?.deals || [];

      let toolsConfig = {};
      try {
        toolsConfig = typeof currentUser?.toolsConfig === 'string'
          ? JSON.parse(currentUser.toolsConfig || '{}')
          : (currentUser?.toolsConfig || {});
      } catch (e) {}

      toolsConfig.chatAuth = {
        ...(toolsConfig.chatAuth || {}),
        twitchBotUsername: social.twitchBotUsername,
        twitchOauthToken: social.twitchOauthToken
      };
      toolsConfig.kickBridge = {
        ...(toolsConfig.kickBridge || {}),
        webhookUrl: social.kickWebhookUrl,
        webhookSecret: social.kickWebhookSecret
      };

      ['bonushunt', 'wagerbar', 'slottracker', 'tournament'].forEach((toolId) => {
        toolsConfig[toolId] = {
          ...(toolsConfig[toolId] || {}),
          twitch: bot.twitchChannel,
          kick: bot.kickChannel
        };
      });

      await fetch(`${API_BASE}/api/user/${user.id}/tools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolsConfig })
      });

      if (social.kickChannel?.trim()) {
        await fetch(`${API_BASE}/api/user/${user.id}/social/kick/connect`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channel: social.kickChannel.trim() })
        });
      }

      setStatus('Speichere Landingpage...');
      await fetch(`${API_BASE}/api/site/${user.id}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...landing,
          navTitle: landing.navTitle || basic.streamerName
        })
      });

      const pagesRes = await fetch(`${API_BASE}/api/site/${user.id}/pages`);
      const pagesData = await pagesRes.json();
      for (const p of (pagesData.pages || [])) {
        const key = p.slug || '';
        if (typeof pageVisibility[key] === 'boolean') {
          await fetch(`${API_BASE}/api/site/${user.id}/pages/${p.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ title: p.title, slug: p.slug, visible: pageVisibility[key] ? 1 : 0 })
          });
        }
      }

      if (bot.autoStartReader && social.twitchBotUsername && social.twitchOauthToken) {
        await fetch(`${API_BASE}/api/user/${user.id}/tools/chat-reader/start`, { method: 'POST' });
      }

      onComplete?.({
        ...user,
        username: basic.streamerName,
        siteSlug: slug,
        category: basic.category,
        isSetupComplete: 1
      });
      navigate(`/dashboard/${slug}`);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Einrichtung fehlgeschlagen.');
    } finally {
      setSaving(false);
      setStatus('');
    }
  };

  return (
    <div className={`${theme.bg} min-h-screen pt-28 pb-20 px-6 relative overflow-hidden`}>
      <BackgroundBubbles />
      <div className="max-w-5xl mx-auto relative z-10 space-y-6">
        <div className={`p-6 rounded-2xl border ${theme.border} ${theme.surface} backdrop-blur-xl`}>
          <div className="text-center space-y-3">
            <h1 className="text-3xl md:text-4xl font-bold text-[#EDEDED]">Setup Wizard</h1>
            <p className="text-[#A1A1A1]">Schritt {step + 1} von {stepLabels.length}: {stepLabels[step]}</p>
          </div>
          <div className="mt-5 w-full h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full bg-indigo-600 transition-all" style={{ width: `${((step + 1) / stepLabels.length) * 100}%` }} />
          </div>
          <div className="mt-5 grid grid-cols-2 md:grid-cols-7 gap-2">
            {stepLabels.map((label, idx) => (
              <button
                key={label}
                onClick={() => idx <= step && !saving ? setStep(idx) : null}
                className={`px-3 py-2 rounded-xl text-xs font-bold border ${idx === step ? 'bg-indigo-600 border-indigo-500 text-white' : idx < step ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' : 'bg-white/5 border-white/10 text-[#A1A1A1]'}`}
              >
                {idx + 1}. {label}
              </button>
            ))}
          </div>
        </div>

        <div className={`p-6 md:p-8 rounded-2xl border ${theme.border} ${theme.surface} shadow-2xl backdrop-blur-xl space-y-6`}>
          {error && <p className="text-sm text-red-300">{error}</p>}
          {status && <p className="text-sm text-indigo-300">{status}</p>}

          {step === 0 && (
            <div className="grid md:grid-cols-2 gap-4">
              <input value={basic.fullName} onChange={(e) => setBasic({ ...basic, fullName: e.target.value })} placeholder="Dein echter Name" className="bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3" />
              <input value={basic.streamerName} onChange={(e) => setBasic({ ...basic, streamerName: e.target.value })} placeholder="Streamer Name" className="bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3" />
              <input
                value={basic.siteSlug}
                onChange={(e) => setBasic({ ...basic, siteSlug: normalizeSlug(e.target.value) })}
                placeholder="Wunsch-Name für deine Seite (z.B. dein-name)"
                className={`bg-[#0A0A0A] border rounded-xl px-4 py-3 ${slugState.checking ? 'border-amber-500/40' : slugState.available ? 'border-emerald-500/40' : 'border-red-500/40'}`}
              />
              <select value={basic.category} onChange={(e) => setBasic({ ...basic, category: e.target.value })} className="bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3">
                <option>Casino</option>
                <option>Gaming</option>
                <option>Just Chatting</option>
                <option>Sports</option>
              </select>
              <p className={`md:col-span-2 text-xs ${slugState.available ? 'text-emerald-300' : 'text-red-300'}`}>{slugState.message}</p>
            </div>
          )}

          {step === 1 && (
            <div className="grid md:grid-cols-3 gap-4">
              {[
                { id: 1, name: 'Neon Night', preset: 'Dynamische Promo-Struktur mit schnellen CTA-Flaechen' },
                { id: 2, name: 'Minimal Pro', preset: 'Klarer Baukasten für einfache Link-Pflege' },
                { id: 3, name: 'Casino Master', preset: 'Conversion-fokussiertes Setup für Casino Traffic' }
              ].map((tpl) => (
                <button key={tpl.id} onClick={() => setTemplateId(tpl.id)} className={`p-6 rounded-xl border text-left flex flex-col ${templateId === tpl.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/10 bg-white/5'}`}>
                  <div className="w-full h-24 mb-3 rounded-lg bg-indigo-500/20 flex items-center justify-center overflow-hidden border border-white/5">
                     {tpl.id === 1 && <div className="w-16 h-12 border-2 border-indigo-500/50 rounded flex flex-col gap-1 p-1"><div className="w-full h-1 bg-indigo-500/50"></div><div className="w-1/2 h-1 bg-indigo-500/30"></div><div className="grid grid-cols-2 gap-1 flex-1"><div className="bg-indigo-500/20 rounded"></div><div className="bg-indigo-500/20 rounded"></div></div></div>}
                     {tpl.id === 2 && <div className="w-16 h-12 border-2 border-emerald-500/50 rounded flex flex-col gap-1 p-1"><div className="w-full h-2 bg-emerald-500/40 rounded"></div><div className="flex-1 space-y-1"><div className="w-full h-1 bg-emerald-500/20"></div><div className="w-full h-1 bg-emerald-500/20"></div><div className="w-full h-1 bg-emerald-500/20"></div></div></div>}
                     {tpl.id === 3 && <div className="w-16 h-12 border-2 border-amber-500/50 rounded flex flex-col gap-1 p-1"><div className="w-full h-1 bg-amber-500/50"></div><div className="flex-1 flex gap-1"><div className="w-1/3 bg-amber-500/20"></div><div className="flex-1 bg-amber-500/10"></div></div></div>}
                  </div>
                  <p className="font-bold text-white">Vorlage: {tpl.name}</p>
                  <p className="text-xs text-[#A1A1A1] mt-1">Design #{tpl.id}</p>
                  <p className="text-xs text-[#A1A1A1] mt-2 flex-1">{tpl.preset}</p>
                </button>
              ))}
            </div>
          )}

          {step === 2 && (
            <div className="grid md:grid-cols-2 gap-4">
              <input value={social.twitchBotUsername} onChange={(e) => setSocial({ ...social, twitchBotUsername: e.target.value })} placeholder="Twitch Bot Username" className="bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3" />
              <input value={social.twitchOauthToken} onChange={(e) => setSocial({ ...social, twitchOauthToken: e.target.value })} placeholder="Twitch OAuth Token" className="bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3" />
              <input value={social.kickChannel} onChange={(e) => setSocial({ ...social, kickChannel: e.target.value })} placeholder="Kick Channel" className="bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3" />
              <input value={social.kickWebhookUrl} onChange={(e) => setSocial({ ...social, kickWebhookUrl: e.target.value })} placeholder="Kick Webhook URL (optional)" className="bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3" />
              <input value={social.kickWebhookSecret} onChange={(e) => setSocial({ ...social, kickWebhookSecret: e.target.value })} placeholder="Kick Webhook Secret (optional)" className="bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 md:col-span-2" />
              <button onClick={connectTwitchOauth} className="md:col-span-2 bg-indigo-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-indigo-500 transition-all">
                Optional: Twitch Account via OAuth verbinden
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="grid md:grid-cols-2 gap-4">
              <input value={landing.navTitle || ''} onChange={(e) => setLanding({ ...landing, navTitle: e.target.value })} placeholder="Navigationstitel" className="bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3" />
              <input value={landing.slogan || ''} onChange={(e) => setLanding({ ...landing, slogan: e.target.value })} placeholder="Slogan" className="bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3" />
              <input value={landing.primaryCtaText || ''} onChange={(e) => setLanding({ ...landing, primaryCtaText: e.target.value })} placeholder="CTA Text" className="bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3" />
              <input value={landing.primaryCtaUrl || ''} onChange={(e) => setLanding({ ...landing, primaryCtaUrl: e.target.value })} placeholder="CTA URL" className="bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3" />
              <input value={landing.stickyCtaText || ''} onChange={(e) => setLanding({ ...landing, stickyCtaText: e.target.value })} placeholder="Sticky CTA Text" className="bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3" />
              <input value={landing.stickyCtaUrl || ''} onChange={(e) => setLanding({ ...landing, stickyCtaUrl: e.target.value })} placeholder="Sticky CTA URL" className="bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3" />
              <input value={landing.trustBadgeText || ''} onChange={(e) => setLanding({ ...landing, trustBadgeText: e.target.value })} placeholder="Trust Text" className="bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 md:col-span-2" />
              <input value={landing.urgencyText || ''} onChange={(e) => setLanding({ ...landing, urgencyText: e.target.value })} placeholder="FOMO Text" className="bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 md:col-span-2" />
              <div className="md:col-span-2 p-4 rounded-xl border border-white/10 bg-white/5 space-y-2">
                <p className="text-sm font-bold text-white">Seiten Sichtbarkeit</p>
                {[
                  { key: '', label: 'Home' },
                  { key: 'shop', label: 'Casinos' },
                  { key: 'hunt', label: 'Hunt' },
                  { key: 'giveaway', label: 'Giveaway' }
                ].map((page) => (
                  <label key={page.key || 'home'} className="flex items-center justify-between">
                    <span className="text-sm text-[#EDEDED]">{page.label}</span>
                    <input
                      type="checkbox"
                      checked={!!pageVisibility[page.key]}
                      onChange={(e) => setPageVisibility({ ...pageVisibility, [page.key]: e.target.checked })}
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4">
              <p className="text-[#A1A1A1]">Wenn du auf "Verbindung starten" klickst, wird alles automatisch eingerichtet:</p>
              <ul className="text-sm text-[#EDEDED] space-y-2">
                <li>- Basisdaten und Template</li>
                <li>- Social Konfiguration</li>
                <li>- Landingpage Buttons und Seiten</li>
              </ul>
              <button
                onClick={finalizeWizard}
                disabled={saving || !!getStepError(0) || !!getStepError(2) || !!getStepError(3) || slugState.checking}
                className="w-full bg-indigo-600 text-white px-6 py-4 rounded-xl font-black hover:bg-indigo-500 transition-all disabled:opacity-50"
              >
                {saving ? 'Richte ein...' : 'Verbindung starten'}
              </button>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0 || saving}
              className="px-4 py-2 rounded-xl bg-white/10 text-white disabled:opacity-30"
            >
              Zurück
            </button>
            {step < 4 && (
              <button
                onClick={() => {
                  const msg = getStepError(step);
                  if (msg) {
                    setError(msg);
                    return;
                  }
                  setError('');
                  setStep((s) => Math.min(4, s + 1));
                }}
                disabled={saving || !!currentStepError || (step === 0 && slugState.checking)}
                className="px-5 py-2 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 disabled:opacity-50"
              >
                Weiter
              </button>
            )}
          </div>
          {!!currentStepError && step < 4 && (
            <p className="text-xs text-amber-300">{currentStepError}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// --- DASHBOARD COMPONENTS ---

const Sidebar = ({ activeTab, setActiveTab, isSetupComplete }) => {
  const menuItems = [
    { id: 'overview', name: 'Overview', icon: Layout },
    { id: 'builder', name: 'Site Builder', icon: Monitor, restricted: true },
    { id: 'deals', name: 'Deals / Sponsorships', icon: Briefcase, restricted: true },
    { id: 'tools', name: 'Tools', icon: Wrench, restricted: true },
    { id: 'domain', name: 'Domain', icon: Globe, restricted: true },
    { id: 'settings', name: 'Settings', icon: Settings, restricted: true }
  ];

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className={`w-64 h-full border-r ${theme.border} bg-[#050505]/50 flex flex-col`}>
      <div className="p-8 border-b border-white/5">
        <Link to="/" className="text-2xl font-black tracking-tighter text-white">
          Weblone
        </Link>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const isDisabled = item.restricted && !isSetupComplete;
          return (
            <button
              key={item.id}
              onClick={() => !isDisabled && setActiveTab(item.id)}
              disabled={isDisabled}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                  : isDisabled
                    ? 'opacity-30 cursor-not-allowed text-[#A1A1A1]'
                    : 'text-[#A1A1A1] hover:bg-white/5 hover:text-[#EDEDED]'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.name}</span>
              {isDisabled && <Lock size={14} className="ml-auto" />}
            </button>
          );
        })}
      </nav>
      <div className="p-4 border-t border-white/5 space-y-2">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500/70 hover:bg-red-500/5 hover:text-red-500 transition-all"
        >
          <User size={20} />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

const Dashboard = ({ user }) => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [activeTab, setActiveTab] = useState('overview');
  const [data, setData] = useState({ user: null, blocks: [], deals: [] });
  const [loading, setLoading] = useState(true);
  const [showSupportModal, setShowSupportModal] = useState(false);
  const [supportForm, setSupportForm] = useState({ subject: '', message: '', priority: 'normal' });
  const [supportStatus, setSupportStatus] = useState('');
  const [supportTickets, setSupportTickets] = useState([]);

  const loadDashboardData = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/user/${user.id}/dashboard`);
      const result = await response.json();
      if (result.success) {
        setData(result.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Redirect to personalized dashboard if slug is missing
    if (!slug && user.siteSlug) {
      navigate(`/dashboard/${user.siteSlug}`);
      return;
    }

    // Security check: only allow own dashboard
    if (slug && user.siteSlug && slug !== user.siteSlug) {
      navigate(`/dashboard/${user.siteSlug}`);
      return;
    }

    loadDashboardData();
  }, [user, navigate, slug]);

  useEffect(() => {
    if (showSupportModal) {
      loadSupportTickets();
      setSupportStatus('');
    }
  }, [showSupportModal]);

  const loadSupportTickets = async () => {
    if (!user?.id) return;
    try {
      const response = await fetch(`${API_BASE}/api/user/${user.id}/support-tickets`);
      const result = await response.json();
      if (result.success) {
        setSupportTickets(result.tickets || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const submitSupportTicket = async () => {
    if (!user?.id || !supportForm.subject.trim() || !supportForm.message.trim()) {
      setSupportStatus('Bitte Betreff und Nachricht ausfüllen.');
      return;
    }
    setSupportStatus('Ticket wird erstellt...');
    try {
      const response = await fetch(`${API_BASE}/api/user/${user.id}/support-ticket`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: supportForm.subject.trim(),
          message: supportForm.message.trim(),
          priority: supportForm.priority
        })
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        setSupportStatus(result.error || 'Ticket konnte nicht erstellt werden.');
        return;
      }
      setSupportStatus(`Ticket #${result.ticketId} erfolgreich erstellt.`);
      setSupportForm({ subject: '', message: '', priority: 'normal' });
      await loadSupportTickets();
    } catch (err) {
      setSupportStatus('Ticket konnte nicht erstellt werden.');
    }
  };

  if (loading) return <div className="h-screen bg-[#050505] flex items-center justify-center text-white font-bold text-2xl">Lädt dein Dashboard...</div>;

  const renderContent = () => {
    switch(activeTab) {
      case 'overview': return <DashboardOverview data={data} setActiveTab={setActiveTab} onRefresh={loadDashboardData} />;
      case 'builder': return (
        <SiteBuilder 
          user={user} 
          deals={data.deals || []}
          onUpdate={(newUser) => setData({...data, user: newUser})} 
        />
      );
      case 'deals': return <DealsContent deals={data.deals} userId={user.id} onUpdate={(newDeals) => setData({...data, deals: newDeals})} />;
      case 'tools': return <ToolsContent user={data.user} onUpdate={(newUser) => setData({...data, user: newUser})} />;
      case 'domain': return <DomainContent user={data.user} />;
      case 'settings': return <SettingsContent user={data.user} onUpdate={(newUser) => setData({...data, user: newUser})} />;
      default: return <DashboardOverview data={data} setActiveTab={setActiveTab} onRefresh={loadDashboardData} />;
    }
  };

  const isSetupComplete = !!(data.user?.isSetupComplete || user.isSetupComplete);

  return (
    <div className="flex h-screen bg-[#050505] overflow-hidden pt-20 relative">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} isSetupComplete={isSetupComplete} />
      <main className="flex-1 overflow-y-auto p-12 custom-scrollbar relative">
        <BackgroundBubbles />
        <div className="max-w-5xl mx-auto relative z-10">
          {renderContent()}
        </div>
      </main>

      <button
        onClick={() => setShowSupportModal(true)}
        className="fixed bottom-6 right-6 z-40 bg-red-600 text-white px-6 py-4 rounded-2xl font-black shadow-2xl shadow-red-900/40 hover:bg-red-500 transition-all border border-red-300/30"
      >
        Support
      </button>

      {showSupportModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`w-full max-w-2xl p-6 rounded-2xl border ${theme.border} ${theme.surface} space-y-4`}>
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-[#EDEDED]">Support Ticket</h2>
              <button onClick={() => setShowSupportModal(false)} className="px-3 py-2 rounded-lg bg-white/10 text-sm">Schließen</button>
            </div>

            <div className="grid md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Betreff"
                value={supportForm.subject}
                onChange={(e) => setSupportForm({ ...supportForm, subject: e.target.value })}
                className="md:col-span-2 bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2"
              />
              <select
                value={supportForm.priority}
                onChange={(e) => setSupportForm({ ...supportForm, priority: e.target.value })}
                className="bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2"
              >
                <option value="low">low</option>
                <option value="normal">normal</option>
                <option value="high">high</option>
              </select>
            </div>

            <textarea
              placeholder="Nachricht"
              value={supportForm.message}
              onChange={(e) => setSupportForm({ ...supportForm, message: e.target.value })}
              className="w-full min-h-32 bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2"
            />

            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-[#A1A1A1]">{supportStatus}</p>
              <button onClick={submitSupportTicket} className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-indigo-500 transition-all">
                Ticket senden
              </button>
            </div>

            <div className="pt-3 border-t border-white/10 space-y-2 max-h-52 overflow-y-auto">
              <p className="text-sm font-bold text-[#EDEDED]">Deine letzten Tickets</p>
              {supportTickets.length === 0 && <p className="text-xs text-[#A1A1A1]">Noch keine Tickets vorhanden.</p>}
              {supportTickets.map((ticket) => (
                <div key={ticket.id} className="p-3 rounded-lg border border-white/10 bg-white/5">
                  <p className="font-bold text-sm">#{ticket.id} {ticket.subject}</p>
                  <p className="text-xs text-[#A1A1A1]">{ticket.status} | {ticket.priority} | {new Date(ticket.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const DashboardOverview = ({ data, setActiveTab, onRefresh }) => {
  const navigate = useNavigate();
  const [kickChannel, setKickChannel] = useState(data.social?.kickAccount?.channel || '');
  const [socialStatus, setSocialStatus] = useState('');
  const userId = data?.user?.id;
  let parsedToolsConfig = {};
  try {
    parsedToolsConfig = typeof data?.user?.toolsConfig === 'string'
      ? JSON.parse(data.user.toolsConfig || '{}')
      : (data?.user?.toolsConfig || {});
  } catch (e) {}

  useEffect(() => {
    setKickChannel(data.social?.kickAccount?.channel || '');
  }, [data.social?.kickAccount?.channel]);

  const connectTwitch = () => {
    if (!userId) return;
    window.location.href = `${API_BASE}/api/social/twitch/start?userId=${userId}`;
  };

  const connectKick = async () => {
    if (!userId || !kickChannel.trim()) {
      setSocialStatus('Bitte Kick Channel eingeben.');
      return;
    }
    setSocialStatus('');
    try {
      const response = await fetch(`${API_BASE}/api/user/${userId}/social/kick/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: kickChannel.trim() })
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        setSocialStatus(result.error || 'Kick Verbindung fehlgeschlagen.');
        return;
      }
      await onRefresh?.();
      setSocialStatus('Kick Konto verbunden.');
    } catch (err) {
      setSocialStatus('Kick Verbindung fehlgeschlagen.');
    }
  };

  const disconnectSocial = async (platform) => {
    if (!userId) return;
    try {
      await fetch(`${API_BASE}/api/user/${userId}/social/disconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ platform })
      });
      await onRefresh?.();
      setSocialStatus(`${platform} getrennt.`);
    } catch (err) {
      setSocialStatus(`${platform} konnte nicht getrennt werden.`);
    }
  };

  const refreshSocialStats = async () => {
    if (!userId) return;
    setSocialStatus('Synchronisiere Social-Daten...');
    try {
      const response = await fetch(`${API_BASE}/api/user/${userId}/social/refresh`, { method: 'POST' });
      const result = await response.json();
      if (!response.ok || !result.success) {
        setSocialStatus(result.error || 'Sync fehlgeschlagen.');
        return;
      }
      await onRefresh?.();
      setSocialStatus(result.result?.errors?.length ? `Teilweise aktualisiert: ${result.result.errors.join(' | ')}` : 'Social-Daten aktualisiert.');
    } catch (err) {
      setSocialStatus('Sync fehlgeschlagen.');
    }
  };

  const overviewStats = [
    { title: 'Besucher heute', value: data.stats?.visitors || '0', change: data.stats?.visitorsChange || '0%', icon: User },
    { title: 'Deals Aktiv', value: data.deals?.filter(d => d.status === 'Aktiv').length || 0, change: 'Live', icon: Briefcase },
    { title: 'Conversions', value: data.stats?.conversions || '0', change: data.stats?.conversionsChange || '0%', icon: MousePointer2 },
    { title: 'Twitch Follower', value: data.social?.twitch?.followers ?? '-', change: data.social?.twitchConnected ? 'Connected' : 'Nicht verbunden', icon: Activity },
    { title: 'Twitch Subs', value: data.social?.twitch?.subs ?? '-', change: data.social?.twitch?.subsError ? 'Scope fehlt' : 'Live', icon: Trophy },
    { title: 'Neue Follower 24h', value: data.social?.twitch?.newFollowers24h ?? '-', change: data.social?.twitch?.lastSync ? new Date(data.social.twitch.lastSync).toLocaleTimeString() : 'Kein Sync', icon: BarChart3 }
  ];
  const checklist = [
    { label: 'Site Builder eingerichtet', done: !!data.user?.siteSlug, action: () => setActiveTab('builder') },
    { label: 'Mind. 1 Deal aktiv', done: (data.deals || []).some((d) => d.status === 'Aktiv'), action: () => setActiveTab('deals') },
    { label: 'Twitch oder Kick verbunden', done: !!(data.social?.twitchConnected || data.social?.kickConnected), action: () => setActiveTab('overview') },
    { label: 'Bot-Channels hinterlegt', done: !!(parsedToolsConfig?.twitchChannel || parsedToolsConfig?.kickChannel), action: () => setActiveTab('tools') }
  ];

  return (
    <div className="space-y-8">
      {!data.user?.isSetupComplete && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative p-8 rounded-3xl bg-gradient-to-br from-indigo-600 to-indigo-800 border border-indigo-400/30 shadow-2xl overflow-hidden group"
        >
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <h2 className="text-2xl md:text-3xl font-black text-white">Bist du bereit für den Start?</h2>
              <p className="text-indigo-100 max-w-lg">Richte deine Streamer-Seite in nur wenigen Schritten ein. Wir führen dich durch Design, Social-Links und mehr.</p>
            </div>
            <button 
              onClick={() => navigate('/onboarding')}
              className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black text-lg hover:bg-indigo-50 shadow-xl transition-all hover:scale-105 active:scale-95 shrink-0"
            >
              Jetzt Setup starten
            </button>
          </div>
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl group-hover:bg-white/20 transition-all duration-700" />
        </motion.div>
      )}

      <div className="flex justify-between items-center">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-3xl font-bold text-[#EDEDED] mb-2">Willkommen zurück, {data.user?.username || 'Streamer'}!</h1>
          <p className="text-[#A1A1A1]">Verwalte hier deine Website, Inhalte, Tools und Deals.</p>
        </motion.div>
        <div className="flex gap-4">
          <div className="bg-[#0A0A0A] border border-white/5 rounded-xl px-4 py-2 flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-[#A1A1A1]">Site Online</span>
          </div>
        </div>
      </div>

      <section className={`p-6 rounded-2xl border ${theme.border} ${theme.surface} space-y-4`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-bold text-[#EDEDED]">Twitch/Kick Verbindung</h3>
            <p className="text-sm text-[#A1A1A1]">Verbinde deine Accounts und lade Follower/Subs/Trenddaten in das Dashboard.</p>
          </div>
          <button onClick={refreshSocialStats} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-indigo-500 transition-all">
            Daten aktualisieren
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white">Twitch</h4>
              {data.social?.twitchConnected ? (
                <button onClick={() => disconnectSocial('twitch')} className="text-xs text-red-300 bg-red-500/20 px-3 py-1 rounded-lg">Trennen</button>
              ) : (
                <button onClick={connectTwitch} className="text-xs text-white bg-indigo-600 px-3 py-1 rounded-lg">Mit Twitch anmelden</button>
              )}
            </div>
            <p className="text-xs text-[#A1A1A1]">{data.social?.twitchConnected ? `Verbunden als ${data.social?.twitchAccount?.displayName || data.social?.twitchAccount?.login}` : 'Nicht verbunden'}</p>
          </div>

          <div className="p-4 rounded-xl border border-white/10 bg-white/5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-white">Kick</h4>
              {data.social?.kickConnected && <button onClick={() => disconnectSocial('kick')} className="text-xs text-red-300 bg-red-500/20 px-3 py-1 rounded-lg">Trennen</button>}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={kickChannel}
                onChange={(e) => setKickChannel(e.target.value)}
                placeholder="Kick Channel (z.B. enricos)"
                className="flex-1 bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
              />
              <button onClick={connectKick} className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-bold">Verbinden</button>
            </div>
            <p className="text-xs text-[#A1A1A1]">{data.social?.kickConnected ? `Verbunden: ${data.social?.kickAccount?.channel}` : 'Nicht verbunden'}</p>
          </div>
        </div>
        {socialStatus && <p className="text-sm text-[#A1A1A1]">{socialStatus}</p>}
      </section>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`p-6 rounded-2xl border ${theme.border} ${theme.surface} flex items-center justify-between group transition-all ${!data.user?.isSetupComplete ? 'opacity-40 grayscale pointer-events-none' : 'hover:border-indigo-500/30'}`}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
            <LinkIcon size={24} />
          </div>
          <div>
            <span className="text-sm text-[#A1A1A1] block">Deine Website</span>
            <a href={`${window.location.protocol}//${window.location.host}/${data.user?.siteSlug}`} target="_blank" rel="noopener noreferrer" className="text-[#EDEDED] font-bold hover:text-indigo-500 transition-colors">{window.location.host}/{data.user?.siteSlug || '...'}</a>
          </div>
        </div>
        <div className="flex gap-2">
          <a
            href={`${window.location.protocol}//${window.location.host}/${data.user?.siteSlug}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all ${!data.user?.isSetupComplete ? 'cursor-not-allowed opacity-50' : 'hover:bg-indigo-500'}`}
            onClick={(e) => !data.user?.isSetupComplete && e.preventDefault()}
          >
            Seite besuchen
          </a>
          <button
            onClick={() => setActiveTab('builder')}
            disabled={!data.user?.isSetupComplete}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${!data.user?.isSetupComplete ? 'bg-white/5 text-[#A1A1A1] cursor-not-allowed' : 'bg-[#EDEDED] text-[#050505] hover:bg-[#D4D4D4]'}`}
          >
            Editor
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {overviewStats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-6 rounded-2xl border ${theme.border} ${theme.surface}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 rounded-lg bg-white/5 text-indigo-500">
                <stat.icon size={20} />
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded-full bg-indigo-500/10 text-indigo-500">
                {stat.change}
              </span>
            </div>
            <span className="text-sm text-[#A1A1A1]">{stat.title}</span>
            <div className="text-2xl font-bold text-[#EDEDED] mt-1">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      <section className={`p-6 rounded-2xl border ${theme.border} ${theme.surface} space-y-4`}>
        <h3 className="text-xl font-bold text-[#EDEDED]">Setup-Checkliste</h3>
        <div className="grid md:grid-cols-2 gap-3">
          {checklist.map((item, idx) => (
            <button
              key={idx}
              onClick={item.action}
              className={`text-left p-4 rounded-xl border transition-all ${item.done ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-white/10 bg-white/5 hover:border-indigo-500/40'}`}
            >
              <p className="font-bold text-white">{item.label}</p>
              <p className={`text-xs mt-1 ${item.done ? 'text-emerald-300' : 'text-[#A1A1A1]'}`}>{item.done ? 'Erledigt' : 'Jetzt einrichten'}</p>
            </button>
          ))}
        </div>
      </section>

      <div>
        <h3 className="text-xl font-bold text-[#EDEDED] mb-6">Quick-Links</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { id: 'builder', name: 'Site Builder', icon: Monitor },
            { id: 'deals', name: 'Deals', icon: Briefcase },
            { id: 'tools', name: 'Tools', icon: Wrench },
            { id: 'domain', name: 'Domain', icon: Globe }
          ].map((link, i) => {
            const isDisabled = !data.user?.isSetupComplete;
            return (
              <button
                key={i}
                onClick={() => !isDisabled && setActiveTab(link.id)}
                disabled={isDisabled}
                className={`p-4 rounded-xl border transition-all text-left group ${theme.border} ${theme.surface} ${isDisabled ? 'opacity-40 grayscale cursor-not-allowed' : 'hover:border-indigo-500/50'}`}
              >
                <link.icon size={20} className={`mb-3 transition-colors ${isDisabled ? 'text-[#A1A1A1]' : 'text-[#A1A1A1] group-hover:text-indigo-500'}`} />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-[#EDEDED]">{link.name}</span>
                  {isDisabled && <Lock size={12} className="text-[#A1A1A1]" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
const SiteBuilder = ({ user, deals = [], onUpdate }) => {
  const [settings, setSettings] = useState({
    navTitle: user?.username || '',
    slogan: '',
    backgroundTheme: 'dark',
    conversionBoosterEnabled: 1,
    primaryCtaText: 'Jetzt Bonus sichern',
    primaryCtaUrl: '',
    stickyCtaEnabled: 1,
    stickyCtaText: 'Jetzt registrieren & Bonus aktivieren',
    stickyCtaUrl: '',
    trustBadgeText: 'Verifiziert | 18+ | Verantwortungsvoll spielen',
    urgencyText: 'Nur heute: exklusive Freispiele für neue Spieler',
    abTestEnabled: 0,
    ctaAText: 'Jetzt Bonus sichern',
    ctaAUrl: '',
    ctaBText: 'Bonus für neue Spieler holen',
    ctaBUrl: ''
  });
  const [ctaStats, setCtaStats] = useState({ default: { impressions: 0, clicks: 0, ctr: 0 }, a: { impressions: 0, clicks: 0, ctr: 0 }, b: { impressions: 0, clicks: 0, ctr: 0 } });
  const [pages, setPages] = useState([]);
  const [activePageId, setActivePageId] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [previewDeals, setPreviewDeals] = useState(deals || []);
  const [casinoDealDrafts, setCasinoDealDrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [isAddingPage, setIsAddingPage] = useState(false);
  const [newPage, setNewPage] = useState({ title: '', slug: '' });
  const activeBackgroundTheme = landingBackgroundThemes[settings.backgroundTheme] || landingBackgroundThemes.dark;

  useEffect(() => {
    setPreviewDeals(deals || []);
  }, [deals]);

  useEffect(() => {
    const next = {};
    (previewDeals || []).forEach((d) => {
      next[d.id] = {
        name: d.name || '',
        deal: d.deal || '',
        imageUrl: d.imageUrl || '',
        promoCode: d.promoCode || 'DIEGAWINOS',
        bonusTerms: d.bonusTerms || '100% Sticky - 300EUR Max Bonus - 40x Wager',
        status: d.status || 'Aktiv',
        performance: d.performance || '0 clicks'
      };
    });
    setCasinoDealDrafts(next);
  }, [previewDeals]);

  useEffect(() => {
    const fetchSiteData = async () => {
      try {
        const [settRes, pagesRes, dashRes] = await Promise.all([
          fetch(`${API_BASE}/api/site/${user.id}/settings`),
          fetch(`${API_BASE}/api/site/${user.id}/pages`),
          fetch(`${API_BASE}/api/user/${user.id}/dashboard`)
        ]);
        const settData = await settRes.json();
        const pagesData = await pagesRes.json();
        const dashData = await dashRes.json();
        
        if (settData.success) {
          setSettings((prev) => ({ ...prev, ...(settData.settings || {}) }));
        }
        if (pagesData.success) {
          setPages(pagesData.pages);
          if (pagesData.pages.length > 0) {
            setActivePageId(pagesData.pages[0].id);
          }
        }
        if (dashData.success) {
          setPreviewDeals(dashData?.data?.deals || []);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchSiteData();
  }, [user.id]);

  useEffect(() => {
    const fetchCtaStats = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/user/${user.id}/cta-stats`);
        const result = await response.json();
        if (result.success && result.stats) setCtaStats(result.stats);
      } catch (err) { console.error(err); }
    };
    fetchCtaStats();
  }, [user.id]);

  useEffect(() => {
    if (activePageId) {
      const fetchBlocks = async () => {
        try {
          const res = await fetch(`${API_BASE}/api/site/${user.id}/pages/${activePageId}/blocks`);
          const data = await res.json();
          if (data.success) setBlocks(data.blocks);
        } catch (err) { console.error(err); }
      };
      fetchBlocks();
    }
  }, [activePageId, user.id]);

  const saveSettings = async (overrideSettings) => {
    try {
      const payload = (overrideSettings && !overrideSettings?.target) ? overrideSettings : settings;
      await fetch(`${API_BASE}/api/site/${user.id}/settings`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) { console.error(err); }
  };

  const addPage = async () => {
    if (!newPage.title) return;
    try {
      const res = await fetch(`${API_BASE}/api/site/${user.id}/pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newPage, type: 'custom' })
      });
      const data = await res.json();
      if (data.success) {
        const newPageObj = { id: data.pageId, ...newPage, type: 'custom', visible: 1 };
        setPages([...pages, newPageObj]);
        setActivePageId(data.pageId);
        setIsAddingPage(false);
        setNewPage({ title: '', slug: '' });
      }
    } catch (err) { console.error(err); }
  };

  const updatePageVisibility = async (pageId, visible) => {
    try {
      const page = pages.find(p => p.id === pageId);
      await fetch(`${API_BASE}/api/site/${user.id}/pages/${pageId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...page, visible: visible ? 1 : 0 })
      });
      setPages(pages.map(p => p.id === pageId ? { ...p, visible: visible ? 1 : 0 } : p));
    } catch (err) { console.error(err); }
  };

  const deletePage = async (pageId) => {
    try {
      const res = await fetch(`${API_BASE}/api/site/${user.id}/pages/${pageId}`, { method: 'DELETE' });
      if (res.ok) {
        const newPages = pages.filter(p => p.id !== pageId);
        setPages(newPages);
        if (activePageId === pageId && newPages.length > 0) {
          setActivePageId(newPages[0].id);
        }
      }
    } catch (err) { console.error(err); }
  };

  const addBlock = async (blockType) => {
    const defaultData = {
      Hero: { title: 'Willkommen', subtitle: 'Schön dass du da bist!' },
      Text: { content: 'Hier steht dein Text...' },
      Button: { label: 'Klick mich', url: '#' },
      LinkList: { links: [{ label: 'Twitch', url: 'https://twitch.tv' }] }
    };
    try {
      const res = await fetch(`${API_BASE}/api/site/${user.id}/pages/${activePageId}/blocks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockType, dataJson: defaultData[blockType] || {} })
      });
      const data = await res.json();
      if (data.success) {
        setBlocks([...blocks, { id: data.blockId, blockType, dataJson: JSON.stringify(defaultData[blockType] || {}), visible: 1 }]);
      }
    } catch (err) { console.error(err); }
  };

  const updateBlock = async (blockId, newData, visible) => {
    try {
      await fetch(`${API_BASE}/api/site/${user.id}/pages/${activePageId}/blocks/${blockId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataJson: newData, visible: visible ? 1 : 0 })
      });
      setBlocks(blocks.map(b => b.id === blockId ? { ...b, dataJson: JSON.stringify(newData), visible: visible ? 1 : 0 } : b));
    } catch (err) { console.error(err); }
  };

  const deleteBlock = async (blockId) => {
    try {
      await fetch(`${API_BASE}/api/site/${user.id}/pages/${activePageId}/blocks/${blockId}`, { method: 'DELETE' });
      setBlocks(blocks.filter(b => b.id !== blockId));
    } catch (err) { console.error(err); }
  };

  const persistBlockOrder = async (orderedIds) => {
    try {
      await fetch(`${API_BASE}/api/site/${user.id}/pages/${activePageId}/blocks/reorder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ blockIds: orderedIds })
      });
    } catch (err) { console.error(err); }
  };

  const moveBlock = (blockId, direction) => {
    const currentIndex = blocks.findIndex((b) => b.id === blockId);
    if (currentIndex < 0) return;

    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;

    const reordered = [...blocks];
    const [moved] = reordered.splice(currentIndex, 1);
    reordered.splice(targetIndex, 0, moved);
    const normalized = reordered.map((block, index) => ({ ...block, sortOrder: index + 1 }));
    setBlocks(normalized);
    persistBlockOrder(normalized.map((b) => b.id));
  };

  const updateCasinoDealDraft = (dealId, key, value) => {
    setCasinoDealDrafts((prev) => ({
      ...prev,
      [dealId]: { ...(prev[dealId] || {}), [key]: value }
    }));
  };

  const saveCasinoDeal = async (dealId) => {
    const draft = casinoDealDrafts[dealId];
    if (!draft) return;
    try {
      const response = await fetch(`${API_BASE}/api/user/${user.id}/deal/${dealId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...draft,
          id: dealId
        })
      });
      if (!response.ok) return;
      setPreviewDeals((prev) => prev.map((d) => d.id === dealId ? { ...d, ...draft } : d));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-12 text-center text-white">Lädt Site Builder...</div>;

  const activePage = pages.find(p => p.id === activePageId);
  const isCasinoPage = activePage?.slug === 'shop';

  return (
    <div className="space-y-8 pb-20">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#EDEDED] mb-2">Site Builder</h1>
          <p className="text-[#A1A1A1]">Gestalte deine Landingpage individuell.</p>
        </div>
        <div className="flex gap-4">
           <a 
            href={`${window.location.protocol}//${window.location.host}/${user?.siteSlug}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-white/5 border border-white/10 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-white/10 transition-all"
          >
            <Eye size={20} /> Live ansehen
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar: Navigation & Branding */}
        <div className="lg:col-span-4 space-y-6">
          {/* Branding Section */}
          <section className={`p-6 rounded-2xl border ${theme.border} ${theme.surface} space-y-4`}>
            <h3 className="text-sm font-bold text-[#A1A1A1] uppercase tracking-wider flex items-center gap-2">
              <Zap size={16} className="text-indigo-500" /> Branding
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-white/10 p-3 bg-white/5">
                <div>
                  <p className="text-sm font-bold text-white">Conversion Booster aktiv</p>
                  <p className="text-xs text-[#A1A1A1]">Steuert FOMO-Banner, CTA-Button, Trust-Leiste und Sticky-Leiste.</p>
                </div>
                <input
                  type="checkbox"
                  checked={!!settings.conversionBoosterEnabled}
                  onChange={(e) => {
                    const next = { ...settings, conversionBoosterEnabled: e.target.checked ? 1 : 0 };
                    setSettings(next);
                    saveSettings(next);
                  }}
                />
              </div>
              <div>
                <label className="text-xs text-[#A1A1A1] mb-1 block">Navigationstitel</label>
                <input 
                  type="text"
                  value={settings.navTitle}
                  onChange={(e) => setSettings({...settings, navTitle: e.target.value})}
                  onBlur={saveSettings}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2 text-white focus:border-indigo-500 outline-none text-sm"
                  placeholder="Dein Brandname"
                />
              </div>
              <div>
                <label className="text-xs text-[#A1A1A1] mb-1 block">Slogan (optional)</label>
                <input 
                  type="text"
                  value={settings.slogan}
                  onChange={(e) => setSettings({...settings, slogan: e.target.value})}
                  onBlur={saveSettings}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2 text-white focus:border-indigo-500 outline-none text-sm"
                  placeholder="Dein Slogan"
                />
              </div>
              <div>
                <label className="text-xs text-[#A1A1A1] mb-1 block">Hintergrund-Theme</label>
                <select
                  value={settings.backgroundTheme || 'dark'}
                  onChange={(e) => {
                    const next = { ...settings, backgroundTheme: e.target.value };
                    setSettings(next);
                    saveSettings(next);
                  }}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2 text-white focus:border-indigo-500 outline-none text-sm"
                >
                  {Object.entries(landingBackgroundThemes).map(([key, item]) => (
                    <option key={key} value={key}>{item.label}</option>
                  ))}
                </select>
                <div className={`mt-2 h-10 rounded-lg border border-white/10 ${activeBackgroundTheme.previewClass}`} />
              </div>
            </div>
          </section>

          <section className={`p-6 rounded-2xl border ${theme.border} ${theme.surface} space-y-4`}>
            <h3 className="text-sm font-bold text-[#A1A1A1] uppercase tracking-wider flex items-center gap-2">
              <MousePointer2 size={16} className="text-indigo-500" /> Conversion Booster
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-[#A1A1A1] mb-1 block">Primärer CTA Text</label>
                <input
                  type="text"
                  value={settings.primaryCtaText || ''}
                  onChange={(e) => setSettings({ ...settings, primaryCtaText: e.target.value })}
                  onBlur={saveSettings}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2 text-white focus:border-indigo-500 outline-none text-sm"
                  placeholder="Jetzt Bonus sichern"
                />
              </div>
              <div>
                <label className="text-xs text-[#A1A1A1] mb-1 block">Primärer CTA Link</label>
                <input
                  type="text"
                  value={settings.primaryCtaUrl || ''}
                  onChange={(e) => setSettings({ ...settings, primaryCtaUrl: e.target.value })}
                  onBlur={saveSettings}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2 text-white focus:border-indigo-500 outline-none text-sm"
                  placeholder="https://dein-casino-partner.de/offer"
                />
              </div>
              <div className="flex items-center justify-between rounded-xl border border-white/10 p-3 bg-white/5">
                <div>
                  <p className="text-sm font-bold text-white">Sticky CTA Leiste</p>
                  <p className="text-xs text-[#A1A1A1]">Bleibt unten sichtbar auf der Landingpage.</p>
                </div>
                <input
                  type="checkbox"
                  checked={!!settings.stickyCtaEnabled}
                  onChange={(e) => {
                    const next = { ...settings, stickyCtaEnabled: e.target.checked ? 1 : 0 };
                    setSettings(next);
                    saveSettings(next);
                  }}
                  onBlur={saveSettings}
                />
              </div>
              <div>
                <label className="text-xs text-[#A1A1A1] mb-1 block">Sticky CTA Text</label>
                <input
                  type="text"
                  value={settings.stickyCtaText || ''}
                  onChange={(e) => setSettings({ ...settings, stickyCtaText: e.target.value })}
                  onBlur={saveSettings}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2 text-white focus:border-indigo-500 outline-none text-sm"
                  placeholder="Jetzt registrieren & Bonus aktivieren"
                />
              </div>
              <div>
                <label className="text-xs text-[#A1A1A1] mb-1 block">Sticky CTA Link</label>
                <input
                  type="text"
                  value={settings.stickyCtaUrl || ''}
                  onChange={(e) => setSettings({ ...settings, stickyCtaUrl: e.target.value })}
                  onBlur={saveSettings}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2 text-white focus:border-indigo-500 outline-none text-sm"
                  placeholder="https://dein-casino-partner.de/offer"
                />
              </div>
              <div>
                <label className="text-xs text-[#A1A1A1] mb-1 block">Trust Text</label>
                <input
                  type="text"
                  value={settings.trustBadgeText || ''}
                  onChange={(e) => setSettings({ ...settings, trustBadgeText: e.target.value })}
                  onBlur={saveSettings}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2 text-white focus:border-indigo-500 outline-none text-sm"
                  placeholder="Verifiziert | 18+ | Verantwortungsvoll spielen"
                />
              </div>
              <div>
                <label className="text-xs text-[#A1A1A1] mb-1 block">FOMO Text</label>
                <input
                  type="text"
                  value={settings.urgencyText || ''}
                  onChange={(e) => setSettings({ ...settings, urgencyText: e.target.value })}
                  onBlur={saveSettings}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2 text-white focus:border-indigo-500 outline-none text-sm"
                  placeholder="Nur heute: exklusive Freispiele für neue Spieler"
                />
              </div>

              <div className="rounded-xl border border-white/10 p-3 bg-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">A/B Test CTA</p>
                    <p className="text-xs text-[#A1A1A1]">Teste 2 Varianten für bessere Klickrate.</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={!!settings.abTestEnabled}
                    onChange={(e) => {
                      const next = { ...settings, abTestEnabled: e.target.checked ? 1 : 0 };
                      setSettings(next);
                      saveSettings(next);
                    }}
                  />
                </div>
                <div className="grid grid-cols-1 gap-3">
                  <input
                    type="text"
                    value={settings.ctaAText || ''}
                    onChange={(e) => setSettings({ ...settings, ctaAText: e.target.value })}
                    onBlur={saveSettings}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2 text-white focus:border-indigo-500 outline-none text-sm"
                    placeholder="Variante A Text"
                  />
                  <input
                    type="text"
                    value={settings.ctaAUrl || ''}
                    onChange={(e) => setSettings({ ...settings, ctaAUrl: e.target.value })}
                    onBlur={saveSettings}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2 text-white focus:border-indigo-500 outline-none text-sm"
                    placeholder="Variante A Link"
                  />
                  <input
                    type="text"
                    value={settings.ctaBText || ''}
                    onChange={(e) => setSettings({ ...settings, ctaBText: e.target.value })}
                    onBlur={saveSettings}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2 text-white focus:border-indigo-500 outline-none text-sm"
                    placeholder="Variante B Text"
                  />
                  <input
                    type="text"
                    value={settings.ctaBUrl || ''}
                    onChange={(e) => setSettings({ ...settings, ctaBUrl: e.target.value })}
                    onBlur={saveSettings}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2 text-white focus:border-indigo-500 outline-none text-sm"
                    placeholder="Variante B Link"
                  />
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-[#A1A1A1]">A CTR</p>
                    <p className="font-bold text-white">{ctaStats?.a?.ctr ?? 0}%</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-[#A1A1A1]">B CTR</p>
                    <p className="font-bold text-white">{ctaStats?.b?.ctr ?? 0}%</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                    <p className="text-[#A1A1A1]">Default CTR</p>
                    <p className="font-bold text-white">{ctaStats?.default?.ctr ?? 0}%</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Navigation / Pages Section */}
          <section className={`p-6 rounded-2xl border ${theme.border} ${theme.surface} space-y-4`}>
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-[#A1A1A1] uppercase tracking-wider">Navigation</h3>
              <button 
                onClick={() => setIsAddingPage(true)}
                className="p-1 rounded-lg bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20 transition-all"
              >
                <Plus size={18} />
              </button>
            </div>

            {isAddingPage && (
              <div className="p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/5 space-y-3">
                <input 
                  type="text"
                  placeholder="Seitentitel"
                  value={newPage.title}
                  onChange={(e) => setNewPage({...newPage, title: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                />
                <div className="flex gap-2">
                  <button onClick={() => setIsAddingPage(false)} className="flex-1 py-1.5 text-xs text-[#A1A1A1]">Abbrechen</button>
                  <button onClick={addPage} className="flex-1 py-1.5 bg-indigo-600 rounded-lg text-xs font-bold text-white">Hinzufügen</button>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {pages.map((page) => (
                <div 
                  key={page.id}
                  onClick={() => setActivePageId(page.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${activePageId === page.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/5 hover:border-white/20 bg-white/5'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-1.5 h-1.5 rounded-full ${page.visible ? 'bg-green-500' : 'bg-white/10'}`} />
                    <span className={`text-sm font-bold ${activePageId === page.id ? 'text-white' : 'text-[#A1A1A1] group-hover:text-white'}`}>{page.title}</span>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => { e.stopPropagation(); updatePageVisibility(page.id, !page.visible); }}
                      className="p-1 text-[#A1A1A1] hover:text-white"
                    >
                      {page.visible ? <Eye size={14} /> : <Eye size={14} className="opacity-30" />}
                    </button>
                    {page.type === 'custom' && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); deletePage(page.id); }}
                        className="p-1 text-[#A1A1A1] hover:text-red-500"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Main Area: Content Blocks & Editor */}
        <div className="lg:col-span-8 space-y-6">
          <div className={`p-8 rounded-3xl border ${theme.border} ${theme.surface} min-h-[500px] flex flex-col`}>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-xl font-bold text-white">Inhalt: {activePage?.title}</h2>
                <p className="text-xs text-[#A1A1A1]">
                  {isCasinoPage ? 'Diese feste Seite wird automatisch aus aktiven Deals erzeugt.' : 'Verwalte die Blöcke dieser Seite.'}
                </p>
              </div>
              {!isCasinoPage && (
                <div className="flex gap-2">
                  {['Hero', 'Text', 'Button', 'LinkList'].map(type => (
                    <button 
                      key={type}
                      onClick={() => addBlock(type)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-white hover:bg-white/10 transition-all uppercase tracking-wider"
                    >
                      + {type}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4 flex-1">
              {isCasinoPage ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-indigo-500/20 bg-indigo-500/10 text-sm text-indigo-200">
                    Die Seite "Casinos" zeigt automatisch alle aktiven Deals. Inhalte koennen hier nicht manuell als Block hinzugefuegt werden.
                  </div>
                  <div className="p-4 rounded-xl border border-white/10 bg-white/5 text-sm text-[#A1A1A1]">
                    Aenderungen an Name, Deal-Text, Spielen-Link, Code, Bonus-Zeile und Bild verwaltest du zentral unter "Deals / Sponsorships".
                  </div>
                  {(previewDeals || []).length === 0 ? (
                    <div className="p-4 rounded-xl border border-white/10 bg-white/5 text-sm text-[#A1A1A1]">
                      Es sind noch keine Deals vorhanden.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {(previewDeals || []).map((deal) => (
                        <div key={deal.id} className="p-3 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between gap-3">
                          <p className="text-sm font-bold text-white">{deal.name || 'Deal'}</p>
                          <span className="text-[10px] font-bold uppercase px-2 py-1 rounded-full border border-white/15 text-[#A1A1A1]">
                            {deal.status || 'Aktiv'}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ) : blocks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-white/10">
                  <Layers size={48} className="mb-4" />
                  <p className="font-bold">Keine Blöcke vorhanden</p>
                </div>
              ) : (
                blocks.map((block, index) => (
                  <BlockEditor 
                    key={block.id} 
                    block={block} 
                    isFirst={index === 0}
                    isLast={index === blocks.length - 1}
                    onMoveUp={() => moveBlock(block.id, 'up')}
                    onMoveDown={() => moveBlock(block.id, 'down')}
                    onUpdate={(data, visible) => updateBlock(block.id, data, visible)}
                    onDelete={() => deleteBlock(block.id)}
                  />
                ))
              )}
            </div>
          </div>

          <BuilderPreview
            user={user}
            deals={previewDeals}
            settings={settings}
            pages={pages}
            blocks={blocks}
            activePageId={activePageId}
            setActivePageId={setActivePageId}
          />
        </div>
      </div>
    </div>
  );
};

const BuilderPreview = ({ user, deals = [], settings, pages, blocks, activePageId, setActivePageId }) => {
  const activePage = pages.find((p) => p.id === activePageId) || pages[0];
  const visiblePages = pages;
  const pageBlocks = [...blocks].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
  const isCasinoPage = activePage?.slug === 'shop';
  const conversionBoosterEnabled = Number(settings?.conversionBoosterEnabled ?? 1) === 1;
  const previewTheme = landingBackgroundThemes[settings?.backgroundTheme] || landingBackgroundThemes.dark;

  return (
    <section className={`p-6 rounded-2xl border ${theme.border} ${theme.surface} space-y-5`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#A1A1A1] uppercase tracking-wider">Live Vorschau</h3>
        <span className="text-xs text-[#A1A1A1]">Änderungen erscheinen sofort</span>
      </div>

      <div className={`rounded-2xl border border-white/10 overflow-hidden ${previewTheme.previewClass}`}>
        <div className="px-4 py-3 border-b border-white/10 bg-[#0A0A0A] flex items-center justify-between">
          <span className="font-bold text-white">{settings.navTitle || user?.username || 'Streamer'}</span>
          <span className="text-xs text-[#A1A1A1]">{activePage?.title || 'Seite'}</span>
        </div>

        <div className="px-4 py-3 border-b border-white/10 flex flex-wrap gap-2">
          {(visiblePages.length ? visiblePages : pages).map((page) => (
            <button
              key={page.id}
              onClick={() => setActivePageId(page.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${page.id === activePageId ? 'bg-indigo-600 text-white' : 'bg-white/5 text-[#A1A1A1] hover:text-white'}`}
            >
              {page.title}
            </button>
          ))}
        </div>

        <div className="p-6 space-y-6">
          {!!conversionBoosterEnabled && !!settings.urgencyText && (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
              {settings.urgencyText}
            </div>
          )}

          {!!conversionBoosterEnabled && !!settings.primaryCtaUrl && (
            <a
              href={settings.primaryCtaUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-500 transition-all"
            >
              {settings.primaryCtaText || 'Jetzt Bonus sichern'}
            </a>
          )}

          {isCasinoPage ? (
            <CasinoDealsSection deals={deals} compact />
          ) : pageBlocks.length === 0 ? (
            <div className="text-center py-12 text-[#A1A1A1]">
              Diese Seite hat noch keine Blöcke.
            </div>
          ) : (
            pageBlocks.map((block) => <RenderBlock key={block.id} block={block} deals={[]} />)
          )}

          {!!conversionBoosterEnabled && !!settings.trustBadgeText && (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              {settings.trustBadgeText}
            </div>
          )}
        </div>

        {!!conversionBoosterEnabled && !!settings.stickyCtaEnabled && (
          <div className="sticky bottom-0 border-t border-white/10 bg-[#0A0A0A] px-4 py-3 flex items-center justify-between gap-3">
            <p className="text-xs text-[#A1A1A1] truncate">{settings.stickyCtaText || 'Jetzt registrieren & Bonus aktivieren'}</p>
            <a
              href={settings.stickyCtaUrl || settings.primaryCtaUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 bg-indigo-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-indigo-500 transition-all"
            >
              Zum Angebot
            </a>
          </div>
        )}
      </div>
    </section>
  );
};

const BlockEditor = ({ block, isFirst, isLast, onMoveUp, onMoveDown, onUpdate, onDelete }) => {
  const [data, setData] = useState(() => {
    try {
      return typeof block.dataJson === 'string' ? JSON.parse(block.dataJson) : block.dataJson;
    } catch (e) { return {}; }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    try {
      setData(typeof block.dataJson === 'string' ? JSON.parse(block.dataJson) : block.dataJson);
    } catch (e) {
      setData({});
    }
  }, [block.dataJson]);

  const handleChange = (key, value) => {
    const newData = { ...data, [key]: value };
    setData(newData);
    onUpdate(newData, block.visible);
  };

  return (
    <div className={`rounded-2xl border ${block.visible ? 'border-white/10 bg-white/5' : 'border-white/5 bg-transparent opacity-50'} overflow-hidden transition-all`}>
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <Layers size={16} />
          </div>
          <div>
            <span className="text-sm font-bold text-white">{block.blockType} Block</span>
            <span className="text-[10px] text-[#A1A1A1] block uppercase tracking-widest">ID: {block.id}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button 
            onClick={onMoveUp}
            disabled={isFirst}
            className="p-2 text-[#A1A1A1] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowUp size={16} />
          </button>
          <button 
            onClick={onMoveDown}
            disabled={isLast}
            className="p-2 text-[#A1A1A1] hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ArrowDown size={16} />
          </button>
           <button 
            onClick={() => onUpdate(data, !block.visible)}
            className="p-2 text-[#A1A1A1] hover:text-white transition-colors"
          >
            {block.visible ? <Eye size={16} /> : <Eye size={16} className="opacity-30" />}
          </button>
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-[#A1A1A1] hover:text-white transition-colors"
          >
            <Settings size={16} />
          </button>
          <button 
            onClick={onDelete}
            className="p-2 text-[#A1A1A1] hover:text-red-500 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0 }} 
            animate={{ height: 'auto' }} 
            exit={{ height: 0 }} 
            className="overflow-hidden bg-[#0A0A0A]/50 border-t border-white/5"
          >
            <div className="p-6 space-y-4">
              {block.blockType === 'Hero' && (
                <>
                  <div>
                    <label className="text-xs text-[#A1A1A1] mb-1 block">Titel</label>
                    <input 
                      type="text" 
                      value={data.title} 
                      onChange={(e) => handleChange('title', e.target.value)}
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#A1A1A1] mb-1 block">Untertitle</label>
                    <textarea 
                      value={data.subtitle} 
                      onChange={(e) => handleChange('subtitle', e.target.value)}
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2 text-white text-sm"
                    />
                  </div>
                </>
              )}
              {block.blockType === 'Text' && (
                <div>
                  <label className="text-xs text-[#A1A1A1] mb-1 block">Inhalt</label>
                  <textarea 
                    value={data.content} 
                    onChange={(e) => handleChange('content', e.target.value)}
                    rows={4}
                    className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2 text-white text-sm"
                  />
                </div>
              )}
              {block.blockType === 'Button' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[#A1A1A1] mb-1 block">Button Text</label>
                    <input 
                      type="text" 
                      value={data.label} 
                      onChange={(e) => handleChange('label', e.target.value)}
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[#A1A1A1] mb-1 block">URL</label>
                    <input 
                      type="text" 
                      value={data.url} 
                      onChange={(e) => handleChange('url', e.target.value)}
                      className="w-full bg-[#050505] border border-white/10 rounded-xl px-4 py-2 text-white text-sm"
                    />
                  </div>
                </div>
              )}
              {block.blockType === 'LinkList' && (
                <div className="space-y-3">
                   {data.links?.map((link, i) => (
                     <div key={i} className="grid grid-cols-2 gap-3 items-end">
                       <div>
                         <label className="text-[10px] text-[#A1A1A1] mb-1 block">Label</label>
                         <input 
                          type="text" 
                          value={link.label} 
                          onChange={(e) => {
                            const newLinks = [...data.links];
                            newLinks[i].label = e.target.value;
                            handleChange('links', newLinks);
                          }}
                          className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs"
                        />
                       </div>
                       <div>
                         <label className="text-[10px] text-[#A1A1A1] mb-1 block">URL</label>
                         <input 
                          type="text" 
                          value={link.url} 
                          onChange={(e) => {
                            const newLinks = [...data.links];
                            newLinks[i].url = e.target.value;
                            handleChange('links', newLinks);
                          }}
                          className="w-full bg-[#050505] border border-white/10 rounded-lg px-3 py-1.5 text-white text-xs"
                        />
                       </div>
                     </div>
                   ))}
                   <button 
                    onClick={() => handleChange('links', [...(data.links || []), { label: 'Neuer Link', url: '#' }])}
                    className="text-xs text-indigo-500 font-bold"
                   >
                     + Link hinzufügen
                   </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const DealsContent = ({ deals, userId, onUpdate }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [newDeal, setNewDeal] = useState({
    name: '',
    deal: '',
    status: 'Aktiv',
    imageUrl: '',
    ctaUrl: '',
    promoCode: 'DIEGAWINOS',
    bonusTerms: '100% Sticky - 300EUR Max Bonus - 40x Wager'
  });
  const [dealImages, setDealImages] = useState({});
  const [dealNames, setDealNames] = useState({});
  const [dealTexts, setDealTexts] = useState({});
  const [dealLinks, setDealLinks] = useState({});
  const [dealCodes, setDealCodes] = useState({});
  const [dealTerms, setDealTerms] = useState({});
  useEffect(() => {
    const nextImages = {};
    const nextNames = {};
    const nextTexts = {};
    const nextLinks = {};
    const nextCodes = {};
    const nextTerms = {};
    (deals || []).forEach((d) => {
      nextImages[d.id] = d.imageUrl || '';
      nextNames[d.id] = d.name || '';
      nextTexts[d.id] = d.deal || '';
      nextLinks[d.id] = d.ctaUrl || '';
      nextCodes[d.id] = d.promoCode || 'DIEGAWINOS';
      nextTerms[d.id] = d.bonusTerms || '100% Sticky - 300EUR Max Bonus - 40x Wager';
    });
    setDealImages(nextImages);
    setDealNames(nextNames);
    setDealTexts(nextTexts);
    setDealLinks(nextLinks);
    setDealCodes(nextCodes);
    setDealTerms(nextTerms);
  }, [deals]);

  const toggleDeal = async (id, currentStatus) => {
    const newStatus = currentStatus === 'Aktiv' ? 'Deaktiviert' : 'Aktiv';
    const deal = deals.find(d => d.id === id);
    try {
      const response = await fetch(`${API_BASE}/api/user/${userId}/deal/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...deal, status: newStatus })
      });
      if (response.ok) {
        onUpdate(deals.map(d => d.id === id ? { ...d, status: newStatus } : d));
      }
    } catch (err) { console.error(err); }
  };

  const handleAddDeal = async () => {
    if (!newDeal.name || !newDeal.deal) return;
    try {
      const response = await fetch(`${API_BASE}/api/user/${userId}/deal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDeal)
      });
      if (response.ok) {
        const result = await response.json();
        onUpdate([...deals, { id: result.dealId, ...newDeal, performance: '0 clicks' }]);
        setIsAdding(false);
        setNewDeal({
          name: '',
          deal: '',
          status: 'Aktiv',
          imageUrl: '',
          ctaUrl: '',
          promoCode: 'DIEGAWINOS',
          bonusTerms: '100% Sticky - 300EUR Max Bonus - 40x Wager'
        });
      }
    } catch (err) { console.error(err); }
  };

  const handleDeleteDeal = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/api/user/${userId}/deal/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        onUpdate(deals.filter(d => d.id !== id));
      }
    } catch (err) { console.error(err); }
  };

  const saveDealConfig = async (deal) => {
    try {
      const name = (dealNames[deal.id] || deal.name || '').trim();
      const dealText = (dealTexts[deal.id] || deal.deal || '').trim();
      const imageUrl = (dealImages[deal.id] || '').trim();
      const ctaUrl = (dealLinks[deal.id] || '').trim();
      const promoCode = (dealCodes[deal.id] || 'DIEGAWINOS').trim();
      const bonusTerms = (dealTerms[deal.id] || '100% Sticky - 300EUR Max Bonus - 40x Wager').trim();
      const response = await fetch(`${API_BASE}/api/user/${userId}/deal/${deal.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...deal, name, deal: dealText, imageUrl, ctaUrl, promoCode, bonusTerms })
      });
      if (response.ok) {
        onUpdate(deals.map((d) => d.id === deal.id ? { ...d, name, deal: dealText, imageUrl, ctaUrl, promoCode, bonusTerms } : d));
      }
    } catch (err) { console.error(err); }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#EDEDED] mb-2">Deals & Sponsorships</h1>
          <p className="text-[#A1A1A1]">Deals aktivieren und Performance einsehen.</p>
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-500 transition-all"
        >
          <Plus size={20} /> Neuer Deal
        </button>
      </div>

      {isAdding && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-2xl border border-indigo-500/30 bg-indigo-500/5 space-y-4`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-[#A1A1A1] uppercase mb-2 block">Name des Deals</label>
              <input 
                type="text"
                value={newDeal.name}
                onChange={(e) => setNewDeal({...newDeal, name: e.target.value})}
                placeholder="z.B. Stake.com"
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#A1A1A1] uppercase mb-2 block">Bonus Info</label>
              <input 
                type="text"
                value={newDeal.deal}
                onChange={(e) => setNewDeal({...newDeal, deal: e.target.value})}
                placeholder="z.B. 100% Bonus bis 500€"
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#A1A1A1] uppercase mb-2 block">Spielen Link URL</label>
              <input
                type="text"
                value={newDeal.ctaUrl || ''}
                onChange={(e) => setNewDeal({ ...newDeal, ctaUrl: e.target.value })}
                placeholder="https://dein-casino-link.tld"
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#A1A1A1] uppercase mb-2 block">Code</label>
              <input
                type="text"
                value={newDeal.promoCode || ''}
                onChange={(e) => setNewDeal({ ...newDeal, promoCode: e.target.value })}
                placeholder="z.B. DIEGAWINOS"
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#A1A1A1] uppercase mb-2 block">Bonus Zeile</label>
              <input
                type="text"
                value={newDeal.bonusTerms || ''}
                onChange={(e) => setNewDeal({ ...newDeal, bonusTerms: e.target.value })}
                placeholder="100% Sticky - 300EUR Max Bonus - 40x Wager"
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-[#A1A1A1] uppercase mb-2 block">Casino Bild URL (optional)</label>
              <input
                type="text"
                value={newDeal.imageUrl || ''}
                onChange={(e) => setNewDeal({ ...newDeal, imageUrl: e.target.value })}
                placeholder="https://.../casino-logo.png"
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-all"
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => setIsAdding(false)} className="px-4 py-2 text-[#A1A1A1] hover:text-white transition-colors">Abbrechen</button>
            <button onClick={handleAddDeal} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-500 transition-all">Speichern</button>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {deals.length === 0 ? (
           <div className="col-span-full p-12 rounded-2xl border border-dashed border-white/10 text-center">
            <Briefcase size={48} className="mx-auto text-white/5 mb-4" />
            <p className="text-[#A1A1A1]">Noch keine Deals vorhanden. Erstelle deinen ersten Deal!</p>
          </div>
        ) : deals.map((deal, i) => (
          <motion.div 
            key={deal.id} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-6 rounded-2xl border ${theme.border} ${theme.surface} relative overflow-hidden group hover:border-indigo-500/30 transition-all`}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                <Briefcase size={24} className="text-indigo-500" />
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggleDeal(deal.id, deal.status)}
                  className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${deal.status === 'Aktiv' ? 'bg-green-500/10 text-green-500 hover:bg-green-500/20' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'}`}
                >
                  {deal.status}
                </button>
                <button 
                  onClick={() => handleDeleteDeal(deal.id)}
                  className="text-white/20 hover:text-red-500 transition-colors p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
            <h3 className="text-lg font-bold text-[#EDEDED] mb-1">{deal.name}</h3>
            <p className="text-sm text-indigo-500 font-medium mb-4">{deal.deal}</p>
            <div className="space-y-2 mb-4">
              <label className="text-[10px] uppercase font-bold text-[#A1A1A1]">Name</label>
              <input
                type="text"
                value={dealNames[deal.id] || ''}
                onChange={(e) => setDealNames({ ...dealNames, [deal.id]: e.target.value })}
                placeholder="z.B. Razed"
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
              />
              <label className="text-[10px] uppercase font-bold text-[#A1A1A1]">Deal Text</label>
              <input
                type="text"
                value={dealTexts[deal.id] || ''}
                onChange={(e) => setDealTexts({ ...dealTexts, [deal.id]: e.target.value })}
                placeholder="z.B. 100% Bonus bis 500€"
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
              />
              <label className="text-[10px] uppercase font-bold text-[#A1A1A1]">Spielen Link URL</label>
              <input
                type="text"
                value={dealLinks[deal.id] || ''}
                onChange={(e) => setDealLinks({ ...dealLinks, [deal.id]: e.target.value })}
                placeholder="https://dein-casino-link.tld"
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
              />
              <label className="text-[10px] uppercase font-bold text-[#A1A1A1]">Code</label>
              <input
                type="text"
                value={dealCodes[deal.id] || ''}
                onChange={(e) => setDealCodes({ ...dealCodes, [deal.id]: e.target.value })}
                placeholder="DIEGAWINOS"
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
              />
              <label className="text-[10px] uppercase font-bold text-[#A1A1A1]">Bonus Zeile</label>
              <input
                type="text"
                value={dealTerms[deal.id] || ''}
                onChange={(e) => setDealTerms({ ...dealTerms, [deal.id]: e.target.value })}
                placeholder="100% Sticky - 300EUR Max Bonus - 40x Wager"
                className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
              />
              <label className="text-[10px] uppercase font-bold text-[#A1A1A1]">Casino Bild URL</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={dealImages[deal.id] || ''}
                  onChange={(e) => setDealImages({ ...dealImages, [deal.id]: e.target.value })}
                  placeholder="https://.../logo.png"
                  className="flex-1 bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white"
                />
                <button
                  onClick={() => saveDealConfig(deal)}
                  className="px-3 py-2 rounded-lg bg-white/10 text-xs font-bold hover:bg-white/20"
                >
                  Deal speichern
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-white/5">
              <div className="flex items-center gap-2 text-[#A1A1A1]">
                <PieChart size={16} />
                <span className="text-xs">{deal.performance}</span>
              </div>
              <button className="text-sm font-bold text-[#EDEDED] hover:text-indigo-500 transition-colors">Statistiken</button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const ToolsContent = ({ user, onUpdate }) => {
  const [configs, setConfigs] = useState(() => {
    try {
      return typeof user?.toolsConfig === 'string' ? JSON.parse(user.toolsConfig) : (user?.toolsConfig || {});
    } catch (e) { return {}; }
  });
  const [isSaving, setIsSaving] = useState(false);
  const [status, setStatus] = useState('');
  const [adTimer, setAdTimer] = useState({ running: false, intervalMinutes: 15, message: 'Werbung: Checkt meine Deals auf der Landingpage.' });
  const [tournamentTitle, setTournamentTitle] = useState('Stream Turnier');
  const [pickupAfterMinutes, setPickupAfterMinutes] = useState(30);
  const [manualMessage, setManualMessage] = useState('Testnachricht aus dem Streamer Dashboard');
  const [readerStatus, setReaderStatus] = useState({ running: false, channels: [], startedAt: null, lastError: null });
  const [readerLogs, setReaderLogs] = useState([]);

  const saveToolsConfig = async (nextConfig) => {
    setIsSaving(true);
    setStatus('');
    try {
      const response = await fetch(`${API_BASE}/api/user/${user.id}/tools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ toolsConfig: nextConfig })
      });
      if (!response.ok) throw new Error('Speichern fehlgeschlagen');
      setConfigs(nextConfig);
      onUpdate({ ...user, toolsConfig: JSON.stringify(nextConfig) });
      setStatus('Konfiguration gespeichert.');
    } catch (err) {
      setStatus('Konfiguration konnte nicht gespeichert werden.');
    } finally {
      setIsSaving(false);
    }
  };

  const runToolAction = async (path, body = {}) => {
    setStatus('');
    try {
      const response = await fetch(`${API_BASE}${path}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        setStatus(result.error || 'Aktion fehlgeschlagen.');
        return;
      }
      const attempted = result.result?.attempted ?? 0;
      const errorCount = result.result?.errors?.length ?? 0;
      setStatus(`Gesendet an ${attempted} Kanal/Kanäle${errorCount ? ` (${errorCount} Fehler)` : ''}.`);
    } catch (err) {
      setStatus('Aktion fehlgeschlagen.');
    }
  };

  const fetchTimerStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/user/${user.id}/tools/ad-timer/status`);
      const result = await response.json();
      if (result.success) {
        setAdTimer((prev) => ({
          ...prev,
          running: !!result.running,
          intervalMinutes: result.intervalMinutes || prev.intervalMinutes,
          message: result.message || prev.message
        }));
      }
    } catch (err) { console.error(err); }
  };

  const fetchReaderStatus = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/user/${user.id}/tools/chat-reader/status`);
      const result = await response.json();
      if (result.success) {
        setReaderStatus({
          running: !!result.running,
          channels: result.channels || [],
          startedAt: result.startedAt || null,
          lastError: result.lastError || null
        });
      }
    } catch (err) { console.error(err); }
  };

  const fetchReaderLogs = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/user/${user.id}/tools/chat-reader/logs?limit=120`);
      const result = await response.json();
      if (result.success) setReaderLogs(result.logs || []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchTimerStatus();
    fetchReaderStatus();
    fetchReaderLogs();
  }, [user?.id]);

  useEffect(() => {
    if (!readerStatus.running) return;
    const interval = setInterval(() => {
      fetchReaderStatus();
      fetchReaderLogs();
    }, 3000);
    return () => clearInterval(interval);
  }, [readerStatus.running, user?.id]);

  const tools = [
    { name: 'Bonushunt List', id: 'bonushunt', desc: 'Verwalte deine Boni und teile die Liste live mit deinem Stream.', icon: List },
    { name: 'Wagerbar', id: 'wagerbar', desc: 'Visualisiere deinen Fortschritt beim Umsetzen von Boni.', icon: Activity },
    { name: 'Slottracker', id: 'slottracker', desc: 'Behalte den Überblick über deine gespielten Slots und Ergebnisse.', icon: BarChart3 },
    { name: 'Tournament System', id: 'tournament', desc: 'Erstelle Giveaways und Turniere für deine Community.', icon: Trophy }
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-[#EDEDED] mb-2">Streaming Tools</h1>
        <p className="text-[#A1A1A1]">Bots für Twitch/Kick konfigurieren: Channels joinen, schreiben, Turnier-/Timer-Aktionen.</p>
      </motion.div>

      <section className={`p-6 rounded-2xl border ${theme.border} ${theme.surface} space-y-4`}>
        <h3 className="text-lg font-bold text-[#EDEDED]">Bot Auth & Kick Bridge</h3>
        <p className="text-xs text-[#A1A1A1]">
          Für Twitch muss dein Bot-Account Moderator im Channel sein. Token als OAuth (oauth:...) hinterlegen.
          Für Kick wird aktuell eine Bridge-Webhook-URL benötigt.
        </p>
        <div className="grid md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Twitch Bot Username"
            value={configs.chatAuth?.twitchBotUsername || ''}
            onChange={(e) => setConfigs({ ...configs, chatAuth: { ...(configs.chatAuth || {}), twitchBotUsername: e.target.value } })}
            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
          />
          <input
            type="password"
            placeholder="Twitch OAuth Token (oauth:...)"
            value={configs.chatAuth?.twitchOauthToken || ''}
            onChange={(e) => setConfigs({ ...configs, chatAuth: { ...(configs.chatAuth || {}), twitchOauthToken: e.target.value } })}
            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
          />
          <input
            type="text"
            placeholder="Kick Bridge Webhook URL"
            value={configs.kickBridge?.webhookUrl || ''}
            onChange={(e) => setConfigs({ ...configs, kickBridge: { ...(configs.kickBridge || {}), webhookUrl: e.target.value } })}
            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
          />
          <input
            type="password"
            placeholder="Kick Bridge Secret (optional)"
            value={configs.kickBridge?.webhookSecret || ''}
            onChange={(e) => setConfigs({ ...configs, kickBridge: { ...(configs.kickBridge || {}), webhookSecret: e.target.value } })}
            className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
          />
        </div>
        <button
          onClick={() => saveToolsConfig(configs)}
          disabled={isSaving}
          className="bg-indigo-600 text-white px-6 py-2 rounded-xl font-bold hover:bg-indigo-500 disabled:opacity-50"
        >
          {isSaving ? 'Speichert...' : 'Bot-Konfiguration speichern'}
        </button>
      </section>

      <div className="grid md:grid-cols-2 gap-6">
        {tools.map((tool, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={`p-8 rounded-2xl border ${theme.border} ${theme.surface} hover:border-indigo-500/50 transition-all group`}
          >
            <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 mb-6 group-hover:scale-110 transition-transform">
              {tool.icon && <tool.icon size={28} />}
            </div>
            <h3 className="text-xl font-bold text-[#EDEDED] mb-3">{tool.name}</h3>
            <p className="text-[#A1A1A1] text-sm leading-relaxed mb-6">{tool.desc}</p>

            <div className="space-y-3 pt-4 border-t border-white/5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-[#A1A1A1] uppercase mb-1 block">Twitch Channel</label>
                  <input
                    type="text"
                    placeholder="channelname"
                    value={configs[tool.id]?.twitch || ''}
                    onChange={(e) => setConfigs({ ...configs, [tool.id]: { ...(configs[tool.id] || {}), twitch: e.target.value } })}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-[#A1A1A1] uppercase mb-1 block">Kick Channel</label>
                  <input
                    type="text"
                    placeholder="channelname"
                    value={configs[tool.id]?.kick || ''}
                    onChange={(e) => setConfigs({ ...configs, [tool.id]: { ...(configs[tool.id] || {}), kick: e.target.value } })}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>
              <button
                onClick={() => saveToolsConfig(configs)}
                disabled={isSaving}
                className="w-full py-2 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 disabled:opacity-50"
              >
                Kanal speichern
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <section className={`p-6 rounded-2xl border ${theme.border} ${theme.surface} space-y-5`}>
        <h3 className="text-lg font-bold text-[#EDEDED]">Bot Aktionen</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-[#A1A1A1] uppercase font-bold">Test Nachricht</label>
            <input
              type="text"
              value={manualMessage}
              onChange={(e) => setManualMessage(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
              placeholder="Nachricht für Twitch/Kick"
            />
            <button
              onClick={() => runToolAction(`/api/user/${user.id}/tools/chat/test`, { message: manualMessage })}
              className="w-full py-2 rounded-xl bg-white/10 border border-white/10 text-white font-bold text-sm"
            >
              Test senden
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-[#A1A1A1] uppercase font-bold">Turnier Start</label>
            <input
              type="text"
              value={tournamentTitle}
              onChange={(e) => setTournamentTitle(e.target.value)}
              className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
              placeholder="Turniertitel"
            />
            <div className="flex gap-2">
              <input
                type="number"
                min="0"
                value={pickupAfterMinutes}
                onChange={(e) => setPickupAfterMinutes(Number(e.target.value))}
                className="w-32 bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
              />
              <button
                onClick={() => runToolAction(`/api/user/${user.id}/tools/tournament/start`, { title: tournamentTitle, pickupAfterMinutes })}
                className="flex-1 py-2 rounded-xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-500"
              >
                Turnier starten
              </button>
            </div>
            <button
              onClick={() => runToolAction(`/api/user/${user.id}/tools/tournament/pickup`, { message: 'Punkte zum Abholen sind jetzt verfuegbar.' })}
              className="w-full py-2 rounded-xl bg-white/10 border border-white/10 text-white font-bold text-sm"
            >
              Pickup Hinweis jetzt senden
            </button>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 space-y-2">
          <label className="text-xs text-[#A1A1A1] uppercase font-bold">Werbe Timer</label>
          <div className="grid md:grid-cols-[140px_1fr_auto] gap-2">
            <input
              type="number"
              min="1"
              max="240"
              value={adTimer.intervalMinutes}
              onChange={(e) => setAdTimer({ ...adTimer, intervalMinutes: Number(e.target.value) })}
              className="bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
            />
            <input
              type="text"
              value={adTimer.message}
              onChange={(e) => setAdTimer({ ...adTimer, message: e.target.value })}
              className="bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white"
              placeholder="Werbenachricht"
            />
            {!adTimer.running ? (
              <button
                onClick={async () => {
                  await runToolAction(`/api/user/${user.id}/tools/ad-timer/start`, { intervalMinutes: adTimer.intervalMinutes, message: adTimer.message });
                  fetchTimerStatus();
                }}
                className="px-4 py-2 rounded-xl bg-green-600 text-white font-bold text-sm"
              >
                Start
              </button>
            ) : (
              <button
                onClick={async () => {
                  await runToolAction(`/api/user/${user.id}/tools/ad-timer/stop`, {});
                  fetchTimerStatus();
                }}
                className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-sm"
              >
                Stop
              </button>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs text-[#A1A1A1] uppercase font-bold">Dauerhafter Chat Reader (Twitch)</label>
            <div className="flex gap-2">
              {!readerStatus.running ? (
                <button
                  onClick={async () => {
                    await runToolAction(`/api/user/${user.id}/tools/chat-reader/start`, {});
                    fetchReaderStatus();
                    fetchReaderLogs();
                  }}
                  className="px-4 py-2 rounded-xl bg-green-600 text-white font-bold text-sm"
                >
                  Reader Start
                </button>
              ) : (
                <button
                  onClick={async () => {
                    await runToolAction(`/api/user/${user.id}/tools/chat-reader/stop`, {});
                    fetchReaderStatus();
                  }}
                  className="px-4 py-2 rounded-xl bg-red-600 text-white font-bold text-sm"
                >
                  Reader Stop
                </button>
              )}
              <button
                onClick={() => {
                  fetchReaderStatus();
                  fetchReaderLogs();
                }}
                className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-white font-bold text-sm"
              >
                Refresh
              </button>
            </div>
          </div>

          <p className="text-xs text-[#A1A1A1]">
            Status: {readerStatus.running ? 'Läuft' : 'Gestoppt'}
            {readerStatus.channels?.length ? ` | Channels: ${readerStatus.channels.join(', ')}` : ''}
            {readerStatus.lastError ? ` | Letzter Fehler: ${readerStatus.lastError}` : ''}
          </p>

          <div className="bg-[#0A0A0A] border border-white/10 rounded-xl p-3 h-56 overflow-y-auto font-mono text-xs space-y-1">
            {readerLogs.length === 0 ? (
              <p className="text-[#777]">Noch keine Chat-Logs vorhanden.</p>
            ) : (
              readerLogs.map((log, idx) => (
                <p key={idx} className="text-[#CFCFCF]">
                  [{new Date(log.at).toLocaleTimeString()}] {log.channel ? `#${log.channel}` : ''} {log.username ? `${log.username}:` : ''} {log.message}
                </p>
              ))
            )}
          </div>
        </div>

        {status && <p className="text-sm text-[#A1A1A1]">{status}</p>}
      </section>
    </div>
  );
};
const DomainContent = ({ user }) => {
  const [customDomain, setCustomDomain] = useState(user?.category || '');
  const [isSaving, setIsLoading] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await fetch(`${API_BASE}/api/user/${user.id}/domain`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customDomain })
      });
    } catch (err) { console.error(err); }
    finally { setIsLoading(false); }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-[#EDEDED] mb-2">Domain & Hosting</h1>
        <p className="text-[#A1A1A1]">Subdomain / eigene Domain verwalten.</p>
      </motion.div>

      <div className={`p-8 rounded-2xl border ${theme.border} ${theme.surface} space-y-6`}>
        <div className="flex items-center gap-4 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
          <Globe size={24} className="text-indigo-500" />
          <div>
            <span className="text-xs text-[#A1A1A1] block uppercase tracking-wider font-bold">Aktive Domain</span>
            <span className="text-lg font-bold text-[#EDEDED]">{window.location.host}/{user?.siteSlug}</span>
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <h4 className="font-bold text-[#EDEDED]">Eigene Domain verbinden</h4>
          <div className="flex gap-4">
            <input 
              type="text" 
              value={customDomain}
              onChange={(e) => setCustomDomain(e.target.value)}
              className={`flex-1 bg-white/5 border ${theme.border} rounded-xl px-4 py-3 text-[#EDEDED] focus:outline-none focus:border-indigo-500 transition-colors`}
              placeholder="z.B. deinname.de"
            />
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#EDEDED] text-[#050505] px-6 py-3 rounded-xl font-bold hover:bg-[#D4D4D4] transition-all disabled:opacity-50"
            >
              {isSaving ? 'Speichert...' : 'Verbinden'}
            </button>
          </div>
          <p className="text-xs text-[#A1A1A1]">Du musst die A-Records deiner Domain auf unsere IP-Adresse (1.2.3.4) setzen.</p>
        </div>
      </div>
    </div>
  );
};

const SettingsContent = ({ user, onUpdate }) => {
  const [formData, setFormData] = useState({
    username: user?.username || '',
    email: user?.email || '',
    avatarUrl: user?.avatarUrl || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`${API_BASE}/api/user/${user.id}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        onUpdate({ ...user, ...formData });
        // Update local storage too
        const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...savedUser, ...formData }));
      }
    } catch (err) { console.error(err); }
    finally { setIsSaving(false); }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold text-[#EDEDED] mb-2">Settings</h1>
        <p className="text-[#A1A1A1]">Profil & Darstellung verwalten.</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-8">
        <div className={`p-8 rounded-2xl border ${theme.border} ${theme.surface} space-y-6`}>
          <h3 className="text-xl font-bold text-[#EDEDED]">Profil</h3>
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center overflow-hidden text-3xl font-bold text-white shadow-lg border-2 border-white/10">
              {formData.avatarUrl ? (
                <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                formData.username?.charAt(0) || 'S'
              )}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-[#A1A1A1] uppercase block">Avatar URL</label>
              <input 
                type="text" 
                value={formData.avatarUrl}
                onChange={(e) => setFormData({...formData, avatarUrl: e.target.value})}
                placeholder="https://example.com/image.jpg"
                className={`w-64 bg-white/5 border ${theme.border} rounded-xl px-4 py-2 text-sm text-[#EDEDED] focus:outline-none focus:border-indigo-500 transition-colors`} 
              />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#A1A1A1] mb-2">Benutzername</label>
              <input 
                type="text" 
                value={formData.username}
                onChange={(e) => setFormData({...formData, username: e.target.value})}
                className={`w-full bg-white/5 border ${theme.border} rounded-xl px-4 py-3 text-[#EDEDED] focus:outline-none focus:border-indigo-500 transition-colors`} 
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#A1A1A1] mb-2">E-Mail</label>
              <input 
                type="email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className={`w-full bg-white/5 border ${theme.border} rounded-xl px-4 py-3 text-[#EDEDED] focus:outline-none focus:border-indigo-500 transition-colors`} 
              />
            </div>
          </div>
        </div>

        <div className={`p-8 rounded-2xl border ${theme.border} ${theme.surface} space-y-6`}>
          <h3 className="text-xl font-bold text-[#EDEDED]">Branding</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-[#A1A1A1] mb-2">Akzentfarbe</label>
              <div className="flex gap-4">
                <input type="color" defaultValue="#6366f1" className="w-12 h-12 rounded-lg bg-transparent border-0 cursor-pointer" />
                <input type="text" defaultValue="#6366f1" className={`flex-1 bg-white/5 border ${theme.border} rounded-xl px-4 py-3 text-[#EDEDED] focus:outline-none focus:border-indigo-500 transition-colors`} />
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="bg-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
          >
            {isSaving ? 'Speichert...' : '?nderungen speichern'}
          </button>
        </div>
      </div>
    </div>
  );
};

const SuperAdminPage = () => {
  const navigate = useNavigate();
  const { section } = useParams();
  const superadminSections = ['overview', 'support', 'payouts', 'bots', 'security', 'audit'];
  const activeSection = superadminSections.includes(section || '') ? section : 'overview';
  const TOKEN_KEY = 'superadmin_token';
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [error, setError] = useState('');
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [isDeletingUser, setIsDeletingUser] = useState(false);
  const [newDeal, setNewDeal] = useState({
    name: '',
    deal: '',
    performance: '0 clicks',
    status: 'Aktiv',
    imageUrl: '',
    promoCode: 'DIEGAWINOS',
    bonusTerms: '100% Sticky - 300EUR Max Bonus - 40x Wager'
  });
  const [analytics, setAnalytics] = useState(null);
  const [auditLogs, setAuditLogs] = useState([]);
  const [monitor, setMonitor] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [ticketForm, setTicketForm] = useState({ userId: '', subject: '', message: '', priority: 'normal', assignee: '' });
  const [payoutForm, setPayoutForm] = useState({ userId: '', amount: '', currency: 'EUR', note: '', period: '', dueDate: '' });
  const [dealTemplate, setDealTemplate] = useState('starter');
  const [bulkStatus, setBulkStatus] = useState('Aktiv');

  useEffect(() => {
    if (!section) {
      navigate('/superadmin/overview', { replace: true });
      return;
    }
    if (!superadminSections.includes(section)) {
      navigate('/superadmin/overview', { replace: true });
    }
  }, [section, navigate]);

  const authHeaders = () => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  });

  const authedFetch = async (url, options = {}) => {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        ...authHeaders()
      }
    });
    const result = await response.json();
    if (!response.ok || result.success === false) {
      const err = new Error(result.error || 'API Fehler');
      err.status = response.status;
      throw err;
    }
    return result;
  };

  const fetchDashboardData = async () => {
    if (!token) return;
    try {
      const [analyticsRes, auditRes, monitorRes, ticketsRes, payoutsRes, sessionsRes] = await Promise.all([
        authedFetch(`${API_BASE}/api/superadmin/analytics`),
        authedFetch(`${API_BASE}/api/superadmin/audit?limit=100`),
        authedFetch(`${API_BASE}/api/superadmin/bot-monitor`),
        authedFetch(`${API_BASE}/api/superadmin/support-tickets`),
        authedFetch(`${API_BASE}/api/superadmin/payouts`),
        authedFetch(`${API_BASE}/api/superadmin/security/sessions`)
      ]);
      setAnalytics(analyticsRes.analytics || null);
      setAuditLogs(auditRes.logs || []);
      setMonitor(monitorRes.monitor || []);
      setTickets(ticketsRes.tickets || []);
      setPayouts(payoutsRes.payouts || []);
      setSessions(sessionsRes.sessions || []);
    } catch (err) {
      if (err.status === 401) {
        handleLogout();
      } else {
        setError(err.message || 'Superadmin Daten konnten nicht geladen werden.');
      }
    }
  };

  const fetchUsers = async () => {
    if (!token) return;
    setLoadingUsers(true);
    try {
      const result = await authedFetch(`${API_BASE}/api/superadmin/users`);
      setUsers(result.users || []);
      if (!selectedUserId && (result.users || []).length > 0) {
        setSelectedUserId(result.users[0].id);
      }
    } catch (err) {
      if (err.status === 401) {
        handleLogout();
      } else {
        setError(err.message || 'Superadmin-API nicht erreichbar.');
      }
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchUserDetails = async (userId) => {
    if (!token || !userId) return;
    setLoadingDetails(true);
    try {
      const result = await authedFetch(`${API_BASE}/api/superadmin/user/${userId}`);
      setSelectedData(result.data);
    } catch (err) {
      setSelectedData(null);
      if (err.status === 401) {
        handleLogout();
      } else {
        setError(err.message || 'Nutzerdetails konnten nicht geladen werden.');
      }
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchDashboardData();
  }, [token]);

  useEffect(() => {
    fetchUserDetails(selectedUserId);
  }, [selectedUserId, token]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch(`${API_BASE}/api/superadmin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, twoFactorCode })
      });
      const result = await response.json();
      if (result.success) {
        localStorage.setItem(TOKEN_KEY, result.token);
        setToken(result.token);
      } else {
        setError(result.error || 'Login fehlgeschlagen.');
      }
    } catch (err) {
      setError('Login fehlgeschlagen.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken('');
    setSelectedData(null);
    setUsers([]);
    setSelectedUserId(null);
  };

  const addDealToUser = async () => {
    if (!selectedUserId || !newDeal.name || !newDeal.deal) return;
    try {
      await authedFetch(`${API_BASE}/api/superadmin/user/${selectedUserId}/deal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDeal)
      });
      setNewDeal({
        name: '',
        deal: '',
        performance: '0 clicks',
        status: 'Aktiv',
        imageUrl: '',
        promoCode: 'DIEGAWINOS',
        bonusTerms: '100% Sticky - 300EUR Max Bonus - 40x Wager'
      });
      fetchUserDetails(selectedUserId);
      fetchDashboardData();
    } catch (err) {
      setError(err.message || 'Deal konnte nicht hinzugefügt werden.');
    }
  };

  const updateDealStatus = async (deal) => {
    const nextStatus = deal.status === 'Aktiv' ? 'Deaktiviert' : 'Aktiv';
    try {
      await authedFetch(`${API_BASE}/api/superadmin/user/${selectedUserId}/deal/${deal.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...deal, status: nextStatus })
      });
      fetchUserDetails(selectedUserId);
      fetchDashboardData();
    } catch (err) {
      setError(err.message || 'Deal-Status konnte nicht geändert werden.');
    }
  };

  const deleteDeal = async (dealId) => {
    try {
      await authedFetch(`${API_BASE}/api/superadmin/user/${selectedUserId}/deal/${dealId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      fetchUserDetails(selectedUserId);
      fetchDashboardData();
    } catch (err) {
      setError(err.message || 'Deal konnte nicht gelöscht werden.');
    }
  };

  const toggleUserSelection = (userId) => {
    setSelectedUserIds((prev) => (
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    ));
  };

  const applyDealTemplate = async () => {
    if (selectedUserIds.length === 0) return;
    try {
      await authedFetch(`${API_BASE}/api/superadmin/deal-template/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: selectedUserIds, template: dealTemplate })
      });
      fetchUserDetails(selectedUserId);
      fetchDashboardData();
    } catch (err) {
      setError(err.message || 'Template konnte nicht angewendet werden.');
    }
  };

  const applyBulkStatus = async () => {
    if (selectedUserIds.length === 0) return;
    try {
      await authedFetch(`${API_BASE}/api/superadmin/bulk/deals/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userIds: selectedUserIds, status: bulkStatus })
      });
      fetchUserDetails(selectedUserId);
      fetchDashboardData();
    } catch (err) {
      setError(err.message || 'Bulk Status konnte nicht gesetzt werden.');
    }
  };

  const createTicket = async () => {
    try {
      await authedFetch(`${API_BASE}/api/superadmin/support-tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...ticketForm,
          userId: ticketForm.userId ? Number(ticketForm.userId) : null
        })
      });
      setTicketForm({ userId: '', subject: '', message: '', priority: 'normal', assignee: '' });
      fetchDashboardData();
    } catch (err) {
      setError(err.message || 'Ticket konnte nicht erstellt werden.');
    }
  };

  const updateTicketStatus = async (ticketId, status) => {
    try {
      await authedFetch(`${API_BASE}/api/superadmin/support-tickets/${ticketId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      fetchDashboardData();
    } catch (err) {
      setError(err.message || 'Ticket konnte nicht aktualisiert werden.');
    }
  };

  const createPayout = async () => {
    try {
      await authedFetch(`${API_BASE}/api/superadmin/payouts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payoutForm,
          userId: payoutForm.userId ? Number(payoutForm.userId) : null,
          amount: Number(payoutForm.amount || 0)
        })
      });
      setPayoutForm({ userId: '', amount: '', currency: 'EUR', note: '', period: '', dueDate: '' });
      fetchDashboardData();
      if (selectedUserId) fetchUserDetails(selectedUserId);
    } catch (err) {
      setError(err.message || 'Payout konnte nicht erstellt werden.');
    }
  };

  const markPayoutPaid = async (payoutId) => {
    try {
      await authedFetch(`${API_BASE}/api/superadmin/payouts/${payoutId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'paid', paidAt: new Date().toISOString() })
      });
      fetchDashboardData();
      if (selectedUserId) fetchUserDetails(selectedUserId);
    } catch (err) {
      setError(err.message || 'Payout konnte nicht aktualisiert werden.');
    }
  };

  const revokeSession = async (tokenSuffix) => {
    try {
      await authedFetch(`${API_BASE}/api/superadmin/security/sessions/revoke`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenSuffix })
      });
      fetchDashboardData();
    } catch (err) {
      setError(err.message || 'Session konnte nicht beendet werden.');
    }
  };

  const revokeAllSessions = async () => {
    try {
      await authedFetch(`${API_BASE}/api/superadmin/security/sessions/revoke-all`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      fetchDashboardData();
    } catch (err) {
      setError(err.message || 'Sessions konnten nicht beendet werden.');
    }
  };

  const deleteSelectedUser = async () => {
    if (!selectedData?.user?.id) return;
    const label = selectedData.user.siteSlug || selectedData.user.username || String(selectedData.user.id);
    const confirmation = window.prompt(`Zum vollständigen Löschen bitte exakt "${label}" eingeben:`);
    if (confirmation !== label) {
      setError('Löschung abgebrochen: Bestätigung stimmt nicht.');
      return;
    }

    setIsDeletingUser(true);
    setError('');
    try {
      await authedFetch(`${API_BASE}/api/superadmin/user/${selectedData.user.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      });
      setSelectedData(null);
      setSelectedUserId(null);
      setSelectedUserIds((prev) => prev.filter((id) => id !== selectedData.user.id));
      await fetchUsers();
      await fetchDashboardData();
    } catch (err) {
      setError(err.message || 'Streamer konnte nicht gelöscht werden.');
    } finally {
      setIsDeletingUser(false);
    }
  };

  const filteredUsers = users.filter((u) => {
    const query = search.toLowerCase();
    return (
      (u.email || '').toLowerCase().includes(query) ||
      (u.username || '').toLowerCase().includes(query) ||
      (u.siteSlug || '').toLowerCase().includes(query)
    );
  });

  const linksFromBlocks = (selectedData?.pageBlocks || []).flatMap((block) => {
    try {
      const data = typeof block.dataJson === 'string' ? JSON.parse(block.dataJson) : (block.dataJson || {});
      if (block.blockType === 'Button' && data.url) return [{ label: data.label || 'Button', url: data.url }];
      if (block.blockType === 'LinkList' && Array.isArray(data.links)) return data.links.filter((x) => x?.url);
      return [];
    } catch (e) {
      return [];
    }
  });

  const sectionMeta = {
    overview: { title: 'Overview', text: 'User-Ansicht, Deals, Seiten und Links eines Streamers.' },
    support: { title: 'Support', text: 'Alle Support-Tickets zentral verwalten.' },
    payouts: { title: 'Payouts', text: 'Auszahlungen planen und auf bezahlt setzen.' },
    bots: { title: 'Bots', text: 'Chat Reader und AdTimer Status aller Streamer.' },
    security: { title: 'Security', text: 'Aktive Superadmin Sessions verwalten.' },
    audit: { title: 'Audit', text: 'Alle relevanten Admin-Aktionen nachvollziehen.' }
  };
  const openTicketCount = (tickets || []).filter((t) => ['open', 'in_progress'].includes(t.status)).length;
  const pendingPayoutCount = (payouts || []).filter((p) => p.status === 'pending').length;
  const tabItems = [
    { id: 'overview', label: 'Overview' },
    { id: 'support', label: 'Support', badge: openTicketCount },
    { id: 'payouts', label: 'Payouts', badge: pendingPayoutCount },
    { id: 'bots', label: 'Bots' },
    { id: 'security', label: 'Security' },
    { id: 'audit', label: 'Audit' }
  ];

  if (!token) {
    return (
      <div className="min-h-screen bg-[#050B18] text-white flex items-center justify-center px-6 relative overflow-hidden font-sans">
        <MidnightParticles />
        <div className="w-full max-w-md p-10 rounded-[2.5rem] border border-white/5 bg-[#0A0A0A]/60 backdrop-blur-2xl shadow-2xl relative z-10">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-500 border border-indigo-500/30 mb-6">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-3xl font-black tracking-tight">Access Control</h1>
            <p className="text-[#A1A1A1] text-xs font-bold uppercase tracking-[0.2em] mt-2">Weblone Superadmin v2.0</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Administrator Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@weblone.com"
                className="w-full bg-[#050505] border border-white/5 rounded-2xl px-5 py-4 text-sm focus:border-indigo-500/50 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">Secure Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-[#050505] border border-white/5 rounded-2xl px-5 py-4 text-sm focus:border-indigo-500/50 outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">2FA Authenticator Code</label>
              <input
                type="text"
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                placeholder="000 000"
                className="w-full bg-[#050505] border border-white/5 rounded-2xl px-5 py-4 text-sm focus:border-indigo-500/50 outline-none transition-all"
              />
            </div>
            
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[11px] font-bold text-center">
                {error}
              </div>
            )}
            
            <button type="submit" className="w-full bg-indigo-600 rounded-2xl py-4 font-black uppercase tracking-widest text-xs hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 mt-4">
              Authorize Access
            </button>
          </form>
          
          <div className="mt-8 pt-8 border-t border-white/5 text-center">
            <p className="text-[10px] font-bold text-white/10 uppercase tracking-[0.3em]">Authorized Personnel Only</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050B18] text-white pt-20 relative overflow-hidden font-sans">
      <MidnightParticles />
      <div className="max-w-7xl mx-auto px-6 py-8 space-y-6 relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center text-indigo-500 border border-indigo-500/30">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight">Superadmin Dashboard</h1>
              <p className="text-[#A1A1A1] text-xs font-medium uppercase tracking-widest mt-1">Weblone Cloud Management v2.0</p>
            </div>
          </div>
          <button onClick={handleLogout} className="bg-red-500/10 text-red-400 border border-red-500/20 px-6 py-2.5 rounded-2xl font-bold hover:bg-red-500/20 transition-all flex items-center gap-2">
            <ArrowRight size={18} className="rotate-180" />
            Logout Session
          </button>
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <section className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {[
            { label: 'Total Users', value: analytics?.totalUsers, icon: User, color: 'text-indigo-500' },
            { label: 'Setup Rate', value: `${analytics?.setupRate}%`, icon: Zap, color: 'text-amber-500' },
            { label: 'Active Deals', value: analytics?.activeDeals, icon: Trophy, color: 'text-emerald-500' },
            { label: 'Open Tickets', value: analytics?.openTickets, icon: Briefcase, color: 'text-red-500' },
            { label: 'Pending Payouts', value: analytics?.pendingPayouts, icon: PieChart, color: 'text-blue-500' },
            { label: 'Bots Online', value: analytics?.botOnline, icon: Activity, color: 'text-purple-500' }
          ].map((stat, i) => (
            <div key={i} className={`p-6 rounded-[2rem] border border-white/5 bg-[#0A0A0A]/40 backdrop-blur-xl hover:border-white/10 transition-all group relative overflow-hidden`}>
              <div className="relative z-10">
                <stat.icon size={20} className={`${stat.color} mb-4`} />
                <p className="text-[10px] font-black text-[#A1A1A1] uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-white">{stat.value ?? '-'}</p>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                <stat.icon size={80} />
              </div>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {activeSection === 'overview' && (
          <aside className="lg:col-span-4 p-6 rounded-[2.5rem] border border-white/5 bg-[#0A0A0A]/40 backdrop-blur-xl space-y-6 shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-xs uppercase tracking-[0.2em] text-white/40">Streamer Directory</h3>
              <div className="flex gap-1">
                <button onClick={() => setSelectedUserIds(users.map((u) => u.id))} className="text-[10px] px-2 py-1 rounded bg-white/5 hover:bg-white/10 font-bold uppercase tracking-tight transition-colors">All</button>
                <button onClick={() => setSelectedUserIds([])} className="text-[10px] px-2 py-1 rounded bg-white/5 hover:bg-white/10 font-bold uppercase tracking-tight transition-colors">None</button>
              </div>
            </div>

            <div className="relative">
              <Eye size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search database..."
                className="w-full bg-[#050505] border border-white/5 rounded-2xl pl-11 pr-4 py-3.5 text-sm focus:border-indigo-500/50 outline-none transition-all placeholder:text-white/10 font-medium"
              />
            </div>

            <div className="max-h-[60vh] overflow-y-auto pr-2 space-y-2 custom-scrollbar">
              {loadingUsers && <div className="py-20 text-center text-sm font-black text-white/20 animate-pulse uppercase tracking-widest">Accessing records...</div>}
              {!loadingUsers && filteredUsers.map((u) => (
                <div
                  key={u.id}
                  className={`group relative p-4 rounded-[1.5rem] border transition-all cursor-pointer ${
                    selectedUserId === u.id 
                    ? 'border-indigo-500/50 bg-indigo-500/10 shadow-lg shadow-indigo-500/5' 
                    : 'border-white/5 bg-[#050505] hover:border-white/10'
                  }`}
                  onClick={() => setSelectedUserId(u.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-black text-sm">{u.username || 'Unnamed'}</p>
                        <span className="text-[10px] font-black text-white/10">#{u.id}</span>
                      </div>
                      <p className="text-[11px] text-[#A1A1A1] font-medium truncate opacity-60">{u.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${(u.health?.score ?? 0) >= 70 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                        <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{u.siteSlug ? `/${u.siteSlug}` : 'NO SLUG'}</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={selectedUserIds.includes(u.id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        toggleUserSelection(u.id);
                      }}
                      className="mt-1 w-4 h-4 rounded-md border-white/10 bg-[#050505] checked:bg-indigo-500 transition-all cursor-pointer accent-indigo-500"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-white/5 space-y-4">
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">Bulk Engine ({selectedUserIds.length})</p>
              <div className="grid grid-cols-2 gap-2">
                <select value={dealTemplate} onChange={(e) => setDealTemplate(e.target.value)} className="bg-[#050505] border border-white/5 rounded-xl px-3 py-2.5 text-xs font-black outline-none cursor-pointer uppercase tracking-tighter">
                  <option value="starter">Starter Kit</option>
                  <option value="pro">Pro Suite</option>
                </select>
                <button onClick={applyDealTemplate} className="text-[10px] font-black uppercase tracking-[0.1em] py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20">Apply</button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <select value={bulkStatus} onChange={(e) => setBulkStatus(e.target.value)} className="bg-[#050505] border border-white/5 rounded-xl px-3 py-2.5 text-xs font-black outline-none cursor-pointer uppercase tracking-tighter">
                  <option value="Aktiv">Active</option>
                  <option value="Deaktiviert">Inactive</option>
                </select>
                <button onClick={applyBulkStatus} className="text-[10px] font-black uppercase tracking-[0.1em] py-2.5 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5">Status</button>
              </div>
            </div>
          </aside>
          )}

          <main className={`${activeSection === 'overview' ? 'lg:col-span-8' : 'lg:col-span-12'} p-8 rounded-[2.5rem] border border-white/5 bg-[#0A0A0A]/40 backdrop-blur-xl space-y-8 shadow-2xl`}>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h2 className="text-3xl font-black tracking-tight">{sectionMeta[activeSection]?.title || 'Overview'}</h2>
                <p className="text-sm text-[#A1A1A1] mt-1 font-medium">{sectionMeta[activeSection]?.text || ''}</p>
              </div>
              <div className="flex flex-wrap gap-2 bg-[#050505] p-1.5 rounded-[1.2rem] border border-white/5">
                {tabItems.map(({ id, label, badge }) => (
                  <button
                    key={id}
                    onClick={() => navigate(`/superadmin/${id}`)}
                    className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${
                      activeSection === id 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                      : 'text-white/30 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {label}
                    {typeof badge === 'number' && badge > 0 && (
                      <span className={`min-w-5 h-5 px-1 rounded-full text-[9px] font-black inline-flex items-center justify-center ${
                        id === 'support' ? 'bg-red-500 text-white' : 'bg-amber-500 text-black'
                      }`}>
                        {badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-px w-full bg-gradient-to-r from-white/5 via-white/10 to-transparent" />

            {loadingDetails && <p className="text-sm text-[#A1A1A1]">Lade Nutzerdetails...</p>}
            {!loadingDetails && activeSection === 'overview' && !selectedData && <p className="text-sm text-[#A1A1A1]">Wähle links einen Nutzer aus.</p>}

            {!loadingDetails && activeSection === 'overview' && selectedData && (
              <>
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedData.user.username || 'Unbenannter Nutzer'}</h2>
                    <p className="text-[#A1A1A1] text-sm">{selectedData.user.email}</p>
                    <p className="text-indigo-400 text-sm">{selectedData.user.siteSlug ? `${window.location.host}/${selectedData.user.siteSlug}` : 'Keine ?ffentliche URL'}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedData.user.siteSlug && (
                      <a
                        href={`${window.location.protocol}//${window.location.host}/${selectedData.user.siteSlug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-indigo-600 px-4 py-2 rounded-xl font-bold hover:bg-indigo-500 transition-all"
                      >
                        Streamer öffnen
                      </a>
                    )}
                    <button
                      onClick={deleteSelectedUser}
                      disabled={isDeletingUser}
                      className="bg-red-500/15 text-red-300 border border-red-500/30 px-4 py-2 rounded-xl font-bold hover:bg-red-500/25 transition-all disabled:opacity-50"
                    >
                      {isDeletingUser ? 'Löscht...' : 'Streamer löschen'}
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                  <p className="font-bold mb-2">User Health</p>
                  <p className="text-sm">Score: <span className="text-indigo-300">{selectedData.health?.score ?? 0}%</span></p>
                  <p className="text-xs text-[#A1A1A1] mt-1">Flags: {(selectedData.health?.flags || []).join(', ') || 'none'}</p>
                </div>

                <section className="space-y-3">
                  <h3 className="text-lg font-bold">Deals Verwalten</h3>
                  <div className="grid md:grid-cols-7 gap-3">
                    <input
                      type="text"
                      placeholder="Deal Name"
                      value={newDeal.name}
                      onChange={(e) => setNewDeal({ ...newDeal, name: e.target.value })}
                      className="bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2"
                    />
                    <input
                      type="text"
                      placeholder="Deal Text"
                      value={newDeal.deal}
                      onChange={(e) => setNewDeal({ ...newDeal, deal: e.target.value })}
                      className="bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2"
                    />
                    <input
                      type="text"
                      placeholder="Performance"
                      value={newDeal.performance}
                      onChange={(e) => setNewDeal({ ...newDeal, performance: e.target.value })}
                      className="bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2"
                    />
                    <input
                      type="text"
                      placeholder="Bild URL (optional)"
                      value={newDeal.imageUrl || ''}
                      onChange={(e) => setNewDeal({ ...newDeal, imageUrl: e.target.value })}
                      className="bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2"
                    />
                    <input
                      type="text"
                      placeholder="Code"
                      value={newDeal.promoCode || ''}
                      onChange={(e) => setNewDeal({ ...newDeal, promoCode: e.target.value })}
                      className="bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2"
                    />
                    <input
                      type="text"
                      placeholder="Bonus Zeile"
                      value={newDeal.bonusTerms || ''}
                      onChange={(e) => setNewDeal({ ...newDeal, bonusTerms: e.target.value })}
                      className="bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2"
                    />
                    <button onClick={addDealToUser} className="bg-indigo-600 rounded-xl font-bold hover:bg-indigo-500 transition-all">
                      Deal hinzufügen
                    </button>
                  </div>
                  <div className="space-y-2">
                    {(selectedData.deals || []).map((deal) => (
                      <div key={deal.id} className="p-3 rounded-xl border border-white/10 bg-white/5 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-bold">{deal.name}</p>
                          <p className="text-sm text-[#A1A1A1]">{deal.deal}</p>
                          <p className="text-xs text-amber-300">{deal.bonusTerms || '100% Sticky - 300EUR Max Bonus - 40x Wager'}</p>
                          <p className="text-xs text-[#EDEDED]">Code: {deal.promoCode || 'DIEGAWINOS'}</p>
                          <p className="text-xs text-indigo-400">{deal.performance}</p>
                          {!!deal.imageUrl && <p className="text-xs text-[#A1A1A1] truncate">{deal.imageUrl}</p>}
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => updateDealStatus(deal)} className="px-3 py-2 rounded-lg bg-white/10 text-sm">
                            {deal.status}
                          </button>
                          <button onClick={() => deleteDeal(deal.id)} className="px-3 py-2 rounded-lg bg-red-500/20 text-red-300 text-sm">
                            Löschen
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-3">
                  <h3 className="text-lg font-bold">Seiten & Links</h3>
                  <div className="grid md:grid-cols-2 gap-3">
                    <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                      <p className="font-bold mb-2">Seiten ({selectedData.pages?.length || 0})</p>
                      <div className="space-y-1 text-sm text-[#A1A1A1]">
                        {(selectedData.pages || []).map((p) => (
                          <p key={p.id}>{p.title} ({p.slug || 'home'})</p>
                        ))}
                      </div>
                    </div>
                    <div className="p-4 rounded-xl border border-white/10 bg-white/5">
                      <p className="font-bold mb-2">Links ({linksFromBlocks.length})</p>
                      <div className="space-y-1 text-sm">
                        {linksFromBlocks.map((l, idx) => (
                          <a key={idx} href={l.url} target="_blank" rel="noopener noreferrer" className="block text-indigo-400 truncate">
                            {(l.label || 'Link')}: {l.url}
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              </>
            )}

            {activeSection === 'support' && (
                <section className="space-y-4">
                  <h3 className="text-lg font-bold">Support Inbox</h3>
                  <div className="grid md:grid-cols-5 gap-3">
                    <input type="number" placeholder="User ID" value={ticketForm.userId} onChange={(e) => setTicketForm({ ...ticketForm, userId: e.target.value })} className="bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2" />
                    <input type="text" placeholder="Subject" value={ticketForm.subject} onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })} className="bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2" />
                    <select value={ticketForm.priority} onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })} className="bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2">
                      <option value="low">low</option>
                      <option value="normal">normal</option>
                      <option value="high">high</option>
                    </select>
                    <input type="text" placeholder="Assignee" value={ticketForm.assignee} onChange={(e) => setTicketForm({ ...ticketForm, assignee: e.target.value })} className="bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2" />
                    <button onClick={createTicket} className="bg-indigo-600 rounded-xl font-bold hover:bg-indigo-500 transition-all">Ticket erstellen</button>
                  </div>
                  <textarea placeholder="Message" value={ticketForm.message} onChange={(e) => setTicketForm({ ...ticketForm, message: e.target.value })} className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2 min-h-24" />
                  <div className="space-y-2">
                    {tickets.map((t) => (
                      <div key={t.id} className="p-3 rounded-xl border border-white/10 bg-white/5 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-bold">#{t.id} {t.subject}</p>
                          <p className="text-xs text-[#A1A1A1]">User {t.userId || '-'} | {t.priority} | {t.status}</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => updateTicketStatus(t.id, 'in_progress')} className="px-3 py-2 text-xs rounded-lg bg-white/10">In Progress</button>
                          <button onClick={() => updateTicketStatus(t.id, 'closed')} className="px-3 py-2 text-xs rounded-lg bg-emerald-600/20 text-emerald-200">Close</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
            )}

            {activeSection === 'payouts' && (
                <section className="space-y-4">
                  <h3 className="text-lg font-bold">Payout Management</h3>
                  <div className="grid md:grid-cols-6 gap-3">
                    <input type="number" placeholder="User ID" value={payoutForm.userId} onChange={(e) => setPayoutForm({ ...payoutForm, userId: e.target.value })} className="bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2" />
                    <input type="number" placeholder="Amount" value={payoutForm.amount} onChange={(e) => setPayoutForm({ ...payoutForm, amount: e.target.value })} className="bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2" />
                    <input type="text" placeholder="Currency" value={payoutForm.currency} onChange={(e) => setPayoutForm({ ...payoutForm, currency: e.target.value })} className="bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2" />
                    <input type="text" placeholder="Period" value={payoutForm.period} onChange={(e) => setPayoutForm({ ...payoutForm, period: e.target.value })} className="bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2" />
                    <input type="date" value={payoutForm.dueDate} onChange={(e) => setPayoutForm({ ...payoutForm, dueDate: e.target.value })} className="bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2" />
                    <button onClick={createPayout} className="bg-indigo-600 rounded-xl font-bold hover:bg-indigo-500 transition-all">Payout erstellen</button>
                  </div>
                  <input type="text" placeholder="Notiz" value={payoutForm.note} onChange={(e) => setPayoutForm({ ...payoutForm, note: e.target.value })} className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-3 py-2" />
                  <div className="space-y-2">
                    {payouts.map((p) => (
                      <div key={p.id} className="p-3 rounded-xl border border-white/10 bg-white/5 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-bold">#{p.id} User {p.userId || '-'} - {p.amount} {p.currency}</p>
                          <p className="text-xs text-[#A1A1A1]">{p.status} | due: {p.dueDate || '-'} | {p.period || '-'}</p>
                        </div>
                        <button onClick={() => markPayoutPaid(p.id)} className="px-3 py-2 text-xs rounded-lg bg-emerald-600/20 text-emerald-200">
                          Als bezahlt markieren
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
            )}

            {activeSection === 'security' && (
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold">Security Sessions</h3>
                    <button onClick={revokeAllSessions} className="px-3 py-2 text-xs rounded-lg bg-red-500/20 text-red-300">
                      Alle anderen Sessions beenden
                    </button>
                  </div>
                  <div className="space-y-2">
                    {sessions.map((s) => (
                      <div key={`${s.tokenSuffix}-${s.createdAt}`} className="p-3 rounded-xl border border-white/10 bg-white/5 flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-bold">...{s.tokenSuffix}</p>
                          <p className="text-xs text-[#A1A1A1]">{s.ip || 'n/a'} | created: {s.createdAt} | last: {s.lastSeenAt}</p>
                        </div>
                        <button onClick={() => revokeSession(s.tokenSuffix)} className="px-3 py-2 text-xs rounded-lg bg-white/10">
                          Beenden
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
            )}

            {activeSection === 'bots' && (
                <section className="space-y-3">
                  <h3 className="text-lg font-bold">Bot Monitoring</h3>
                  <div className="space-y-2">
                    {monitor.map((m) => (
                      <div key={m.userId} className="p-3 rounded-xl border border-white/10 bg-white/5">
                        <p className="font-bold">{m.username || 'NoName'} #{m.userId} {m.siteSlug ? `(/${m.siteSlug})` : ''}</p>
                        <p className="text-xs text-[#A1A1A1]">
                          Reader: {m.readerRunning ? 'online' : 'offline'} | Channels: {(m.readerChannels || []).join(', ') || '-'} | AdTimer: {m.adTimerRunning ? `on (${m.adTimerIntervalMinutes}m)` : 'off'}
                        </p>
                        {m.lastReaderError && <p className="text-xs text-red-300 mt-1">Last Error: {m.lastReaderError}</p>}
                      </div>
                    ))}
                  </div>
                </section>
            )}

            {activeSection === 'audit' && (
                <section className="space-y-3">
                  <h3 className="text-lg font-bold">Audit Log</h3>
                  <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="p-3 rounded-xl border border-white/10 bg-white/5">
                        <p className="font-bold">{log.action}</p>
                        <p className="text-xs text-[#A1A1A1]">{log.actor} | userId: {log.targetUserId || '-'} | {log.createdAt}</p>
                        <p className="text-xs text-indigo-300 mt-1">{log.payloadJson || '{}'}</p>
                      </div>
                    ))}
                  </div>
                </section>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

const List = (props) => (
  <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"></line>
    <line x1="8" y1="12" x2="21" y2="12"></line>
    <line x1="8" y1="18" x2="21" y2="18"></line>
    <line x1="3" y1="6" x2="3.01" y2="6"></line>
    <line x1="3" y1="12" x2="3.01" y2="12"></line>
    <line x1="3" y1="18" x2="3.01" y2="18"></line>
  </svg>
);

// --- MAIN APP ---

const App = () => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [subdomain, setSubdomain] = useState(null);

  useEffect(() => {
    const host = window.location.hostname.toLowerCase();
    const parts = host.split('.');
    const isRenderHost = host.endsWith('.onrender.com');
    
    // Main domains list
    const mainDomains = ['localhost', 'weblone.de', 'onrender.com'];
    const isMainDomain = isRenderHost || mainDomains.some(d => host === d || host === 'www.' + d);

    if (!isMainDomain) {
      // If it's something like streamer.weblone.de or streamer.onrender.com
      if (parts.length > (host.includes('localhost') ? 1 : 2)) {
        const sub = parts[0].toLowerCase();
        if (sub !== 'www') {
          setSubdomain(sub);
        }
      } else {
        // If it's a completely custom domain like mybrand.com
        setSubdomain(host);
      }
    }
  }, []);

  const handleSetUser = (userData) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user');
    }
  };

  // If we are on a subdomain, show the StreamerPage directly
  if (subdomain) {
    return (
      <Router>
        <div className="min-h-screen">
          <Routes>
            <Route path="/" element={<StreamerPageOverride slug={subdomain} />} />
            {/* Still allow other routes if needed, but primary is the streamer page */}
            <Route path="*" element={<StreamerPageOverride slug={subdomain} />} />
          </Routes>
        </div>
      </Router>
    );
  }

  return (
    <Router>
      <div className="min-h-screen">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login onLogin={handleSetUser} />} />
            <Route path="/register" element={<Register onRegister={handleSetUser} />} />
            <Route path="/onboarding" element={<OnboardingWizard user={user} onComplete={(updatedUser) => handleSetUser({ ...user, ...updatedUser })} initialStep={0} />} />
            <Route path="/onboarding/template" element={<OnboardingWizard user={user} onComplete={(updatedUser) => handleSetUser({ ...user, ...updatedUser })} initialStep={1} />} />
            <Route path="/onboarding/setup" element={<OnboardingWizard user={user} onComplete={(updatedUser) => handleSetUser({ ...user, ...updatedUser })} initialStep={2} />} />
            <Route path="/dashboard" element={<Dashboard user={user} />} />
            <Route path="/dashboard/:slug" element={<Dashboard user={user} />} />
            <Route path="/superadmin" element={<SuperAdminPage />} />
            <Route path="/superadmin/:section" element={<SuperAdminPage />} />
            <Route path="/:slug" element={<StreamerPage />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/imprint" element={<Imprint />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

// Helper component to pass slug directly
const StreamerPageOverride = ({ slug }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activePageSlug, setActivePageSlug] = useState('');

  useEffect(() => {
    const fetchStreamerData = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/public/site/${slug}`);
        const result = await response.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStreamerData();
  }, [slug]);

  if (loading) return <div className="h-screen bg-[#05000A] flex items-center justify-center text-white">Lade Streamer Seite...</div>;
  if (!data) return (
    <div className="h-screen bg-[#050505] flex flex-col items-center justify-center text-white p-6 text-center">
      <h1 className="text-4xl font-bold mb-4">Ups!</h1>
      <p className="text-[#A1A1A1] mb-8">Streamer "{slug}" nicht gefunden.</p>
      <a href={`${window.location.protocol}//${window.location.host}`} className="bg-indigo-600 px-6 py-3 rounded-xl font-bold">Zurück zur Startseite</a>
    </div>
  );

  return <PublicStreamerSite data={data} activePageSlug={activePageSlug} setActivePageSlug={setActivePageSlug} />;
};

const CasinoDealCard = ({ deal, ctaHref }) => {
  const [deposit, setDeposit] = useState(60);
  const bonus = Math.max(0, Number(deposit) || 0);
  const total = bonus * 2;
  const wager = total * 40;
  const countries = [
    { code: 'DE', src: 'https://flagcdn.com/w80/de.png' },
    { code: 'AT', src: 'https://flagcdn.com/w80/at.png' },
    { code: 'CH', src: 'https://flagcdn.com/w80/ch.png' },
    { code: 'CA', src: 'https://flagcdn.com/w80/ca.png' },
    { code: 'NO', src: 'https://flagcdn.com/w80/no.png' },
    { code: 'SE', src: 'https://flagcdn.com/w80/se.png' },
    { code: 'FI', src: 'https://flagcdn.com/w80/fi.png' },
    { code: 'DK', src: 'https://flagcdn.com/w80/dk.png' },
    { code: 'NL', src: 'https://flagcdn.com/w80/nl.png' }
  ];
  const payments = [
    { name: 'Visa', src: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg' },
    { name: 'Mastercard', src: 'https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg' },
    { name: 'PaySafe', src: 'https://logo.clearbit.com/paysafecard.com' },
    { name: 'BTC', src: 'https://upload.wikimedia.org/wikipedia/commons/4/46/Bitcoin.svg' },
    { name: 'ETH', src: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Ethereum_logo_2014.svg' }
  ];
  const providers = [
    { name: 'Playn GO', src: 'https://logo.clearbit.com/playngo.com' },
    { name: 'Big Time', src: 'https://logo.clearbit.com/bigtimegaming.com' },
    { name: 'Pragmatic', src: 'https://logo.clearbit.com/pragmaticplay.com' },
    { name: 'Merkur', src: 'https://logo.clearbit.com/merkur-gaming.com' },
    { name: 'Relax', src: 'https://logo.clearbit.com/relax-gaming.com' },
    { name: 'Nolimit', src: 'https://logo.clearbit.com/nolimitcity.com' },
    { name: 'Greentube', src: 'https://logo.clearbit.com/greentube.com' },
    { name: 'Blueprint', src: 'https://logo.clearbit.com/blueprintgaming.com' },
    { name: 'Hacksaw', src: 'https://logo.clearbit.com/hacksawgaming.com' },
    { name: 'Elk', src: 'https://logo.clearbit.com/elk-studios.com' },
    { name: 'Endorphina', src: 'https://logo.clearbit.com/endorphina.com' },
    { name: 'NetEnt', src: 'https://logo.clearbit.com/netent.com' },
    { name: 'Microgaming', src: 'https://logo.clearbit.com/microgaming.co.uk' },
    { name: 'Push', src: 'https://logo.clearbit.com/pushgaming.com' },
    { name: 'Quickspin', src: 'https://logo.clearbit.com/quickspin.com' },
    { name: 'Thunderkick', src: 'https://logo.clearbit.com/thunderkick.com' },
    { name: 'Yggdrasil', src: 'https://logo.clearbit.com/yggdrasilgaming.com' },
    { name: 'Red Tiger', src: 'https://logo.clearbit.com/redtigergaming.com' }
  ];
  const licenseLogo = 'https://upload.wikimedia.org/wikipedia/commons/b/b1/Flag_of_Cura%C3%A7ao.svg';

  return (
    <article className="rounded-2xl border border-[#253252] bg-[#161d2f] overflow-hidden shadow-2xl">
      <div className="grid md:grid-cols-[180px_1fr_auto] items-center border-b border-[#2a385c]">
        <div className="h-full min-h-[90px] bg-[#11192b] border-r border-[#2a385c] flex items-center justify-center p-3">
          {deal.imageUrl ? (
            <img src={deal.imageUrl} alt={deal.name} className="max-h-14 md:max-h-16 max-w-full object-contain" />
          ) : (
            <p className="text-xl font-black tracking-tight text-white">{deal.name}</p>
          )}
        </div>
        <div className="px-4 py-4">
          <p className="text-3xl md:text-5xl font-black text-amber-300 leading-none">{deal.deal}</p>
          <p className="text-sm text-white/80 mt-1"><span className="text-amber-300">&#9733;</span> 5.0/5</p>
        </div>
        <div className="px-4 pb-4 md:pb-0">
          <a
            href={deal.ctaUrl || ctaHref || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center bg-green-600 hover:bg-green-500 text-white font-black px-7 py-3 rounded-md border border-green-300/20"
          >
            SPIELEN
          </a>
        </div>
      </div>

      <div className="px-4 py-3 border-b border-[#2a385c] text-center text-sm font-bold text-white">
        {deal.bonusTerms || '100% Sticky - 300EUR Max Bonus - 40x Wager'}
      </div>
      <div className="px-4 py-3 border-b border-[#2a385c] text-sm text-[#d8def1]">
        <span className="text-amber-300">&#10003;</span> Book of Ra
        <span className="mx-3 text-amber-300">&#10003;</span> Lucky Lady
        <span className="mx-3 text-amber-300">&#10003;</span> Keine 5 Sekunden Pause
        <span className="mx-3 text-amber-300">&#10003;</span> Keine Maxbet-Sperre
      </div>
      <div className="px-4 py-3 border-b border-[#2a385c] text-center text-lg font-black text-amber-300">
        Einfacher / Schneller VIP Transfer <span className="text-white font-semibold">Code:</span> {deal.promoCode || 'DIEGAWINOS'}
      </div>

      <div className="grid md:grid-cols-[1.6fr_0.8fr_0.8fr] gap-4 p-4 border-b border-[#2a385c]">
        <div>
          <p className="font-bold mb-2">Features:</p>
          <ul className="space-y-1 text-sm text-[#d8def1]">
            <li><span className="text-emerald-400">+</span> Reloadboni über den VIP-Support anfragbar</li>
            <li><span className="text-emerald-400">+</span> Alle Auszahlungen binnen Minuten auf dem Konto</li>
            <li><span className="text-emerald-400">+</span> Keine verbotenen Spiele im Bonus</li>
            <li><span className="text-emerald-400">+</span> VPN - Freundlich</li>
            <li><span className="text-emerald-400">+</span> Paysafecard & Klarna ab der 2. Einzahlung</li>
            <li><span className="text-red-400">-</span> Max-Cashout nur im Willkommensbonus</li>
          </ul>
        </div>
        <div className="md:border-l md:border-[#2a385c] md:pl-4">
          <p className="font-bold mb-2">Verfügbarkeit:</p>
          <div className="grid grid-cols-3 gap-1.5">
            {countries.map((country) => (
              <div key={country.code} className="rounded bg-white/10 border border-white/10 p-1 flex items-center justify-center">
                <img
                  src={country.src}
                  alt={country.code}
                  className="h-4 w-auto"
                  loading="lazy"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="md:border-l md:border-[#2a385c] md:pl-4">
          <p className="font-bold mb-2">Einzahlung:</p>
          <div className="grid grid-cols-2 gap-1.5">
            {payments.map((method) => (
              <div key={method.name} className="rounded bg-white/10 border border-white/10 p-1 flex items-center justify-center h-8">
                <img
                  src={method.src}
                  alt={method.name}
                  className="max-h-5 w-auto"
                  loading="lazy"
                  onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement.textContent = method.name; }}
                />
              </div>
            ))}
          </div>
          <div className="mt-2 text-center rounded bg-[#11192b] border border-white/10 text-xs py-2">
            Crypto Guide
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 text-center border-b border-[#2a385c]">
        <div className="p-4 md:border-r md:border-[#2a385c]">
          <p className="text-sm font-bold">Max bet:</p>
          <p className="text-4xl font-black text-amber-300">5EUR</p>
        </div>
        <div className="p-4 md:border-r md:border-[#2a385c]">
          <p className="text-sm font-bold">Freispiele:</p>
          <p className="text-4xl font-black text-amber-300">100</p>
          <p className="text-sm text-white/80 italic">(in Sugar Rush 1000)</p>
        </div>
        <div className="p-4">
          <p className="text-sm font-bold">Lizenz:</p>
          <div className="mt-2 flex flex-col items-center gap-1">
            <img
              src={licenseLogo}
              alt="Curacao Lizenz"
              className="h-8 w-auto rounded-sm border border-white/20"
              loading="lazy"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <p className="text-xs text-[#d8def1]">Curacao</p>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-[#2a385c]">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2">
          {providers.map((provider) => (
            <div key={provider.name} className="rounded bg-white/5 border border-white/10 py-2 px-2 flex items-center justify-center h-10">
              <img
                src={provider.src}
                alt={provider.name}
                className="max-h-5 w-auto"
                loading="lazy"
                onError={(e) => { e.currentTarget.style.display = 'none'; e.currentTarget.parentElement.textContent = provider.name; }}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="p-4">
        <p className="font-bold">
          Berechne dein Bonusguthaben:
          <span className="font-normal italic text-[#d8def1]"> (Maximaler Bonus bei einer Einzahlung von 300EUR)</span>
        </p>
        <div className="mt-3 grid md:grid-cols-[220px_1fr_1fr_1fr] gap-3 items-end">
          <div>
            <label className="text-xs text-[#d8def1] block mb-1">Einzahlungsbetrag</label>
            <div className="flex rounded border border-white/20 overflow-hidden">
              <input
                type="number"
                min="0"
                value={deposit}
                onChange={(e) => setDeposit(Math.max(0, Number(e.target.value || 0)))}
                className="w-full bg-[#0f172a] px-3 py-2 text-xl font-bold outline-none"
              />
              <span className="px-3 py-2 bg-[#1e293b] text-[#d8def1]">EUR</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-4xl font-black text-amber-300">{total.toLocaleString('de-DE')}EUR</p>
            <p className="text-xs text-[#d8def1]">Gesamtguthaben</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-black text-amber-300">{bonus.toLocaleString('de-DE')}EUR</p>
            <p className="text-xs text-[#d8def1]">Bonusguthaben</p>
          </div>
          <div className="text-center">
            <p className="text-4xl font-black text-amber-300">{wager.toLocaleString('de-DE')}EUR</p>
            <p className="text-xs text-[#d8def1]">Wager (D+B)</p>
          </div>
        </div>
      </div>
    </article>
  );
};

const CasinoDealsSection = ({ deals = [], compact = false, ctaHref = '#' }) => {
  if (!deals.length) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-8 text-center text-[#A1A1A1]">
        Auf dieser Seite erscheinen Bonus-Angebote automatisch, sobald ein Deal hinzugefügt wurde.
      </div>
    );
  }

  return (
    <div className={'space-y-4 ' + (compact ? 'max-h-[640px] overflow-y-auto pr-1' : '')}>
      {deals.map((deal) => (
        <CasinoDealCard key={deal.id} deal={deal} ctaHref={ctaHref} />
      ))}
    </div>
  );
};

const PublicStreamerSite = ({ data, activePageSlug, setActivePageSlug }) => {
  const { user, settings, pages, blocks, deals } = data;
  const [ctaVariant, setCtaVariant] = useState('default');
  
  const currentPage = pages.find(p => p.slug === activePageSlug) || pages[0];
  const pageBlocks = blocks.filter(b => b.pageId === currentPage?.id);
  const isCasinoPage = currentPage?.slug === 'shop';
  const slug = user?.siteSlug;
  const activeDeals = (deals || []).filter((d) => d.status !== 'Deaktiviert');
  const conversionBoosterEnabled = Number(settings?.conversionBoosterEnabled ?? 1) === 1;
  const siteTheme = landingBackgroundThemes[settings?.backgroundTheme] || landingBackgroundThemes.dark;

  useEffect(() => {
    if (!conversionBoosterEnabled || !settings?.abTestEnabled) {
      setCtaVariant('default');
      return;
    }
    const hasA = !!settings?.ctaAUrl;
    const hasB = !!settings?.ctaBUrl;
    if (hasA && hasB) {
      setCtaVariant(Math.random() < 0.5 ? 'a' : 'b');
    } else if (hasA) {
      setCtaVariant('a');
    } else if (hasB) {
      setCtaVariant('b');
    } else {
      setCtaVariant('default');
    }
  }, [conversionBoosterEnabled, settings?.abTestEnabled, settings?.ctaAUrl, settings?.ctaBUrl, slug]);

  useEffect(() => {
    if (!slug || !conversionBoosterEnabled) return;
    fetch(`${API_BASE}/api/public/site/${slug}/cta-impression`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ variant: ctaVariant })
    }).catch(() => {});
  }, [slug, ctaVariant, conversionBoosterEnabled]);

  const resolvedCtaText = ctaVariant === 'a'
    ? (settings.ctaAText || settings.primaryCtaText || 'Jetzt Bonus sichern')
    : ctaVariant === 'b'
      ? (settings.ctaBText || settings.primaryCtaText || 'Jetzt Bonus sichern')
      : (settings.primaryCtaText || 'Jetzt Bonus sichern');
  const trackedCtaHref = `${API_BASE}/api/public/site/${slug}/cta/${ctaVariant}`;
  const hasAnyCtaTarget = !!(settings.primaryCtaUrl || settings.stickyCtaUrl || settings.ctaAUrl || settings.ctaBUrl);

  return (
    <div className={`min-h-screen text-white font-sans selection:bg-indigo-500/30 flex flex-col ${siteTheme.siteClass}`}>
      {siteTheme.bubbles && <BackgroundBubbles />}
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 py-3 md:py-6">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <div className="bg-[#0A0A0A]/40 backdrop-blur-xl border border-white/5 rounded-2xl md:rounded-full px-4 md:px-8 py-3 flex flex-col sm:flex-row justify-between sm:items-center gap-3 sm:gap-0 shadow-2xl">
            <button onClick={() => setActivePageSlug('')} className="text-xl font-bold tracking-tighter hover:text-indigo-500 transition-colors">
              {settings.navTitle || user.username}
            </button>
            
            <div className="w-full sm:w-auto overflow-x-auto">
              <div className="flex gap-4 md:gap-8 min-w-max">
              {pages.map(page => (
                <button 
                  key={page.id}
                  onClick={() => setActivePageSlug(page.slug)}
                  className={`text-sm font-bold transition-all ${activePageSlug === page.slug ? 'text-indigo-500' : 'text-white/50 hover:text-white'}`}
                >
                  {page.title}
                </button>
              ))}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero / Header Area (Dynamic) */}
      <main className="pt-32 md:pt-40 pb-16 md:pb-20 flex-1">
        <div className="max-w-5xl mx-auto px-4 md:px-6 space-y-12 md:space-y-20">
          {!!conversionBoosterEnabled && !!settings.urgencyText && (
            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-center text-amber-200 font-medium">
              {settings.urgencyText}
            </div>
          )}

          {!!conversionBoosterEnabled && !!hasAnyCtaTarget && (
            <div className="text-center">
              <a
                href={trackedCtaHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-indigo-600 text-white px-8 py-4 rounded-2xl font-black text-lg hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-900/40"
              >
                {resolvedCtaText}
              </a>
            </div>
          )}

          {isCasinoPage ? (
            <CasinoDealsSection deals={activeDeals} ctaHref={trackedCtaHref} />
          ) : pageBlocks.length === 0 ? (
            <div className="text-center py-20">
               {currentPage?.slug === '' ? (
                 <div className="space-y-6">
                    <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tighter">
                      Willkommen bei <span className="text-indigo-500">{user.username}</span>
                    </h1>
                    <p className="text-base md:text-xl text-[#A1A1A1] max-w-2xl mx-auto">
                      {settings.slogan || 'Entdecke meine exklusiven Deals und Tools.'}
                    </p>
                 </div>
               ) : (
                 <p className="text-[#A1A1A1]">Diese Seite hat noch keinen Inhalt.</p>
               )}
            </div>
          ) : (
            pageBlocks.map(block => (
              <RenderBlock key={block.id} block={block} deals={deals} />
            ))
          )}

          {!!conversionBoosterEnabled && !!settings.trustBadgeText && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-center text-emerald-200 text-sm">
              {settings.trustBadgeText}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-12 md:py-20 border-t border-white/5 text-center">
        <div className="max-w-5xl mx-auto px-4 md:px-6">
          <p className="text-sm text-[#555] font-medium">
            © 2026 {settings.navTitle || user.username} ? Powered by <a href="https://weblone.onrender.com" target="_blank" rel="noopener noreferrer" className="text-indigo-500 font-bold hover:text-indigo-400 transition-colors">Weblone</a>
          </p>
        </div>
      </footer>

      {!!conversionBoosterEnabled && !!settings.stickyCtaEnabled && !!hasAnyCtaTarget && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/10 bg-[#0A0A0A]/95 backdrop-blur-xl">
          <div className="max-w-5xl mx-auto px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[#EDEDED]">{settings.stickyCtaText || 'Jetzt registrieren & Bonus aktivieren'}</p>
            <a
              href={trackedCtaHref}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-indigo-600 text-white px-5 py-2 rounded-xl font-bold hover:bg-indigo-500 transition-all"
            >
              Zum Angebot
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

const RenderBlock = ({ block, deals }) => {
  let data = {};
  try {
    data = typeof block.dataJson === 'string' ? JSON.parse(block.dataJson) : (block.dataJson || {});
  } catch (e) {
    data = {};
  }

  switch (block.blockType) {
    case 'Hero':
      return (
        <section className="text-center space-y-4 md:space-y-6">
          <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold tracking-tighter animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {data.title}
          </h1>
          <p className="text-base md:text-xl text-[#A1A1A1] max-w-2xl mx-auto">
            {data.subtitle}
          </p>
        </section>
      );
    case 'Text':
      return (
        <section className="max-w-3xl mx-auto">
          <p className="text-lg text-[#A1A1A1] leading-relaxed whitespace-pre-wrap">
            {data.content}
          </p>
        </section>
      );
    case 'Button':
      return (
        <div className="flex justify-center">
          <a 
            href={data.url} 
            target="_blank" 
            rel="noopener noreferrer"
            className="w-full sm:w-auto text-center bg-indigo-600 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-500/20"
          >
            {data.label}
          </a>
        </div>
      );
    case 'LinkList':
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
          {data.links?.map((link, i) => (
            <a 
              key={i}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-between group hover:border-indigo-500/50 transition-all"
            >
              <span className="font-bold">{link.label}</span>
              <ArrowRight size={18} className="text-white/20 group-hover:text-indigo-500 transition-colors" />
            </a>
          ))}
        </div>
      );
    default:
      return null;
  }
};

export default App;
