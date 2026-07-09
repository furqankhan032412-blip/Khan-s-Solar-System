import { Float, Html, OrbitControls, PerspectiveCamera, Sparkles, Stars } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Download,
  Eye,
  EyeOff,
  Home,
  Loader2,
  LockKeyhole,
  Mail,
  MapPin,
  Menu,
  Moon,
  PanelTop,
  Phone,
  RotateCcw,
  Send,
  ShieldCheck,
  Sun,
  SunMedium,
  X,
  Zap
} from 'lucide-react';
import React from 'react';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import type { Group, Mesh } from 'three';
import { MathUtils } from 'three';

type PropertyType = 'residential' | 'commercial';
type GraphicsMode = 'low' | 'medium' | 'high';
type Orientation = 'south' | 'east-west' | 'flat';
type InverterType = 'hybrid' | 'grid-tie' | 'three-phase';
type AdminModule = 'dashboard' | 'projects' | 'users' | 'inquiries' | 'packages' | 'panels' | 'inverters' | 'recommendations' | 'reports';

type DesignerInput = {
  propertyType: PropertyType;
  roofArea: number;
  energyNeed: number;
  panelWattage: number;
  panelCount: number;
  orientation: Orientation;
  inverterType: InverterType;
};

type Recommendation = {
  recommendedPanelWattage: number;
  recommendedPanels: number;
  selectedSystemKw: number;
  recommendedSystemKw: number;
  monthlyGeneration: number;
  inverterCapacity: number;
  roofPanelCapacity: number;
  co2Savings: number;
  billReduction: number;
  status: 'excellent' | 'warning' | 'danger';
  message: string;
};

const navItems = [
  ['Home', 'home'],
  ['Residential', 'residential'],
  ['Commercial', 'commercial'],
  ['Designer', 'designer'],
  ['Panels', 'panels'],
  ['Inverters', 'inverters'],
  ['Projects', 'projects'],
  ['Packages', 'packages'],
  ['Contact', 'contact']
] as const;

const defaultDesigner: DesignerInput = {
  propertyType: 'residential',
  roofArea: 720,
  energyNeed: 1200,
  panelWattage: 550,
  panelCount: 10,
  orientation: 'south',
  inverterType: 'hybrid'
};

const ADMIN_EMAIL = 'admin@khanssolar.test';
const ADMIN_PASSWORD = 'Solar123!';
const ADMIN_SESSION_KEY = 'kss_admin_session';
const adminModules: { id: AdminModule; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'projects', label: 'Projects' },
  { id: 'users', label: 'Users' },
  { id: 'inquiries', label: 'Inquiries' },
  { id: 'packages', label: 'Solar Packages' },
  { id: 'panels', label: 'Panel Sizes' },
  { id: 'inverters', label: 'Inverters' },
  { id: 'recommendations', label: 'Recommendations' },
  { id: 'reports', label: 'Reports' }
];

export function App() {
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [menuOpen, setMenuOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [adminAuthed, setAdminAuthed] = useState(() => hasValidAdminSession());
  const [adminModule, setAdminModule] = useState<AdminModule>('dashboard');
  const [activeSection, setActiveSection] = useState('home');
  const reduceMotion = useReducedMotion();
  const graphics: GraphicsMode = 'medium';
  const animateScene = !reduceMotion;

  useEffect(() => {
    const syncAdminRoute = () => {
      const route = getCurrentAdminRoute();
      const moduleFromRoute = getAdminModuleFromRoute(route);
      const adminRoute = isAdminRoute(route);
      if (!adminRoute) return;
      setAdminOpen(true);
      setAdminAuthed(hasValidAdminSession());
      setAdminModule(moduleFromRoute ?? 'dashboard');
    };

    syncAdminRoute();
    window.addEventListener('hashchange', syncAdminRoute);
    window.addEventListener('popstate', syncAdminRoute);
    return () => {
      window.removeEventListener('hashchange', syncAdminRoute);
      window.removeEventListener('popstate', syncAdminRoute);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const closest = navItems
        .map(([, id]) => ({ id, distance: Math.abs((document.getElementById(id)?.getBoundingClientRect().top ?? 9999) - 88) }))
        .sort((a, b) => a.distance - b.distance)[0];
      if (closest) setActiveSection(closest.id);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  function jumpTo(id: string) {
    document.getElementById(id)?.scrollIntoView({ behavior: animateScene ? 'smooth' : 'auto', block: 'start' });
    setMenuOpen(false);
  }

  function openAdmin(module: AdminModule = 'dashboard') {
    setAdminModule(module);
    setAdminOpen(true);
    const route = module === 'dashboard' ? '/admin-dashboard' : `/admin-console/${module}`;
    history.pushState(null, '', route);
  }

  function closeAdmin() {
    setAdminOpen(false);
    if (isAdminRoute(getCurrentAdminRoute())) {
      history.replaceState(null, '', '/');
    }
  }

  function handleAdminAuthenticated() {
    createAdminSession();
    setAdminAuthed(true);
    setAdminModule('dashboard');
    history.pushState(null, '', '/admin-dashboard');
  }

  return (
    <main className={`app-shell ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>
      <Header
        theme={theme}
        activeSection={activeSection}
        menuOpen={menuOpen}
        onMenu={() => setMenuOpen((value) => !value)}
        onTheme={() => setTheme((value) => (value === 'dark' ? 'light' : 'dark'))}
        onNavigate={jumpTo}
        onAdmin={() => openAdmin('dashboard')}
      />

      <Hero theme={theme} graphics={graphics} animateScene={animateScene} onNavigate={jumpTo} />
      <ResidentialSection theme={theme} graphics={graphics} animateScene={animateScene} />
      <CommercialSection theme={theme} graphics={graphics} animateScene={animateScene} />
      <DesignerSection />
      <PanelAnimationSection theme={theme} graphics={graphics} animateScene={animateScene} />
      <InverterSection theme={theme} graphics={graphics} animateScene={animateScene} />
      <GallerySection theme={theme} graphics={graphics} animateScene={animateScene} />
      <PackagesSection />
      <ContactSection />
      <AboutSection onAdmin={() => openAdmin('dashboard')} />

      <AnimatePresence>
        {adminOpen && (
          <AdminLoginModal
            authed={adminAuthed}
            activeModule={adminModule}
            onAuthed={handleAdminAuthenticated}
            onClose={closeAdmin}
            onNavigate={(module) => openAdmin(module)}
            onLogout={() => {
              clearAdminSession();
              setAdminAuthed(false);
              setAdminModule('dashboard');
              history.pushState(null, '', '/admin');
            }}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

function Header({
  theme,
  activeSection,
  menuOpen,
  onMenu,
  onTheme,
  onNavigate,
  onAdmin
}: {
  theme: 'dark' | 'light';
  activeSection: string;
  menuOpen: boolean;
  onMenu: () => void;
  onTheme: () => void;
  onNavigate: (id: string) => void;
  onAdmin: () => void;
}) {
  return (
    <header className={`site-header ${theme === 'dark' ? 'site-header-dark' : 'site-header-light'}`}>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <button className="flex items-center gap-3 text-left" onClick={() => onNavigate('home')} aria-label="Khan's Solar System home">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-amber-300 text-slate-950 shadow-[0_0_30px_rgba(251,191,36,0.45)]">
            <Zap size={21} />
          </span>
          <span>
            <span className={`block text-sm font-bold uppercase tracking-[0.16em] ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>Khan's Solar System</span>
            <span className={`block text-xs font-semibold ${theme === 'dark' ? 'text-white/60' : 'text-slate-600'}`}>3D Energy Studio</span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 xl:flex">
          {navItems.map(([label, id]) => (
            <button
              key={id}
              className={`h-10 rounded-md px-3 text-sm font-semibold transition ${
                activeSection === id
                  ? 'bg-amber-300 text-slate-950 shadow-[0_0_24px_rgba(251,191,36,0.18)]'
                  : theme === 'dark'
                    ? 'text-white/80 hover:bg-white/10 hover:text-white'
                    : 'text-slate-700 hover:bg-slate-950/5 hover:text-slate-950'
              }`}
              onClick={() => onNavigate(id)}
            >
              {label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <button className={`theme-toggle ${theme === 'dark' ? 'night' : 'day'}`} onClick={onTheme} aria-label="Toggle day and night mode" type="button">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button className={`admin-nav-button ${theme === 'dark' ? '' : 'light'}`} onClick={onAdmin} type="button">
            <LockKeyhole size={16} /> Admin
          </button>
        </div>

        <button className={`theme-toggle lg:hidden ${theme === 'dark' ? 'night' : 'day'}`} onClick={onTheme} aria-label="Toggle day and night mode" type="button">
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button className={`icon-button lg:hidden ${theme === 'dark' ? '' : 'light'}`} onClick={onMenu} aria-label="Open menu" type="button">
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className={`border-t px-4 py-4 lg:hidden ${theme === 'dark' ? 'border-white/10 bg-slate-950' : 'border-slate-200 bg-white'}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
          >
            <div className="grid gap-2">
              {navItems.map(([label, id]) => (
                <button key={id} className={`h-11 rounded-md text-left text-sm font-semibold ${activeSection === id ? 'bg-amber-300 text-slate-950' : theme === 'dark' ? 'bg-white/5 text-white/80' : 'bg-slate-100 text-slate-700'}`} onClick={() => onNavigate(id)}>
                  <span className="px-3">{label}</span>
                </button>
              ))}
              <button className="h-11 rounded-md bg-amber-300 text-sm font-bold text-slate-950" onClick={onAdmin}>Admin login</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

function Hero({ theme, graphics, animateScene, onNavigate }: { theme: 'dark' | 'light'; graphics: GraphicsMode; animateScene: boolean; onNavigate: (id: string) => void }) {
  return (
    <section id="home" className="section-screen relative min-h-screen overflow-hidden pt-16">
      <div className="absolute inset-0">
        <SolarCanvas theme={theme} graphics={graphics} animateScene={animateScene} scene="hero" />
      </div>
      <div className={`absolute inset-0 ${theme === 'dark' ? 'bg-gradient-to-r from-slate-950 via-slate-950/75 to-slate-950/5' : 'bg-gradient-to-r from-slate-950/72 via-slate-950/36 to-white/5'}`} />
      <div className="relative z-10 mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <motion.div initial={{ y: 24, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8 }}>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-2 text-sm font-bold text-amber-100 backdrop-blur">
            <SunMedium size={16} /> Premium residential and commercial solar design
          </div>
          <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[1.02] text-white sm:text-6xl lg:text-7xl">
            Khan's Solar System
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75">
            Explore real-time 3D solar layouts, tune roof engineering inputs, compare residential and commercial systems, and generate a proposal-ready recommendation.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="primary-button" onClick={() => onNavigate('designer')}>
              Design my system <ArrowRight size={18} />
            </button>
            <button className="secondary-button" onClick={() => onNavigate('residential')}>
              View 3D systems <ChevronDown size={18} />
            </button>
          </div>
          <div className="mt-10 grid max-w-2xl gap-3 sm:grid-cols-3">
            <HeroMetric label="Monthly designs" value="420+" />
            <HeroMetric label="Panel range" value="450W-700W" />
            <HeroMetric label="CO2 mapped" value="Live" />
          </div>
        </motion.div>
        <div className="hidden lg:block" />
      </div>
    </section>
  );
}

function ResidentialSection({ theme, graphics, animateScene }: { theme: 'dark' | 'light'; graphics: GraphicsMode; animateScene: boolean }) {
  return (
    <section id="residential" className={`content-band immersive-section ${theme === 'dark' ? 'scene-dark text-white' : 'scene-light text-slate-950'}`}>
      <div className="section-scene-bg">
        <SolarCanvas theme={theme} graphics={graphics} animateScene={animateScene} scene="residential" />
      </div>
      <div className={`section-shade left ${theme === 'light' ? 'light' : ''}`} />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
        <SectionIntro
          dark={theme === 'dark'}
          eyebrow="Residential Solar"
          title="Smaller roof arrays that feel calm, efficient, and realistic."
          body="Residential systems use compact panel groups, pitched roof placement, and tighter output bands for homes. Rotate the house and inspect a 4 to 12 panel design."
          stats={[
            ['Typical panels', '4-12'],
            ['Recommended module', '450W-580W'],
            ['Best fit', 'Small to large homes']
          ]}
        />
        <div />
      </div>
    </section>
  );
}

function CommercialSection({ theme, graphics, animateScene }: { theme: 'dark' | 'light'; graphics: GraphicsMode; animateScene: boolean }) {
  return (
    <section id="commercial" className={`content-band immersive-section ${theme === 'dark' ? 'scene-dark text-white' : 'scene-light text-slate-950'}`}>
      <div className="section-scene-bg">
        <SolarCanvas theme={theme} graphics={graphics} animateScene={animateScene} scene="commercial" />
      </div>
      <div className={`section-shade right ${theme === 'light' ? 'light' : ''}`} />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8">
        <div />
        <SectionIntro
          dark={theme === 'dark'}
          eyebrow="Commercial Solar"
          title="Larger arrays for warehouses, offices, shops, and industrial rooftops."
          body="Commercial layouts support wider panel fields, three-phase inverter planning, and business-focused generation estimates with larger roof capacity."
          stats={[
            ['Typical panels', '20-150+'],
            ['Recommended module', '550W-700W'],
            ['Best fit', 'Offices, shops, warehouses']
          ]}
        />
      </div>
    </section>
  );
}

function DesignerSection() {
  const [input, setInput] = useState<DesignerInput>(defaultDesigner);
  const recommendation = useMemo(() => recommendSystem(input), [input]);
  const selectedPanels = buildPanelGrid(input.panelCount, input.propertyType);

  function update<K extends keyof DesignerInput>(key: K, value: DesignerInput[K]) {
    setInput((current) => ({ ...current, [key]: value }));
  }

  return (
    <section id="designer" className="content-band bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <SectionHeading eyebrow="Engineer Panel" title="Solar Designer with smart recommendations" />
          <button className="secondary-button w-fit" onClick={() => setInput(defaultDesigner)}>
            <RotateCcw size={17} /> Reset
          </button>
        </div>

        <div className="grid gap-6 xl:grid-cols-[390px_1fr_360px]">
          <div className="tool-panel">
            <Segmented
              label="Property type"
              value={input.propertyType}
              options={[
                ['residential', 'Residential'],
                ['commercial', 'Commercial']
              ]}
              onChange={(value) => update('propertyType', value as PropertyType)}
            />
            <Slider label="Roof area" value={input.roofArea} min={160} max={12000} step={20} suffix="sq ft" onChange={(value) => update('roofArea', value)} />
            <Slider label="Monthly energy need" value={input.energyNeed} min={350} max={18000} step={50} suffix="kWh" onChange={(value) => update('energyNeed', value)} />
            <Slider label="Panel wattage" value={input.panelWattage} min={450} max={700} step={10} suffix="W" onChange={(value) => update('panelWattage', value)} />
            <Slider
              label="Panel count"
              value={input.panelCount}
              min={input.propertyType === 'residential' ? 4 : 20}
              max={input.propertyType === 'residential' ? 24 : 180}
              step={1}
              suffix="panels"
              onChange={(value) => update('panelCount', value)}
            />
            <Select
              label="Orientation"
              value={input.orientation}
              options={[
                ['south', 'South tilt'],
                ['east-west', 'East-west rows'],
                ['flat', 'Flat ballast']
              ]}
              onChange={(value) => update('orientation', value as Orientation)}
            />
            <Select
              label="Inverter type"
              value={input.inverterType}
              options={[
                ['hybrid', 'Hybrid'],
                ['grid-tie', 'Grid-tie'],
                ['three-phase', 'Three-phase']
              ]}
              onChange={(value) => update('inverterType', value as InverterType)}
            />
          </div>

          <div className="designer-roof">
            <div className={`roof-plane ${input.propertyType}`}>
              {selectedPanels.map((panel, index) => (
                <motion.span
                  key={index}
                  className="roof-panel"
                  style={{ gridColumn: panel.column, gridRow: panel.row }}
                  initial={{ scale: 0.8, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: Math.min(index * 0.006, 0.35) }}
                />
              ))}
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-4">
              <MetricCard label="Selected system" value={`${recommendation.selectedSystemKw} kW`} />
              <MetricCard label="Roof capacity" value={`${recommendation.roofPanelCapacity} panels`} />
              <MetricCard label="Monthly output" value={`${recommendation.monthlyGeneration.toLocaleString()} kWh`} />
              <MetricCard label="CO2 savings" value={`${recommendation.co2Savings} tons`} />
            </div>
          </div>

          <div className="tool-panel">
            <div className={`status-box ${recommendation.status}`}>
              <CheckCircle2 size={20} />
              <div>
                <p className="font-bold">Recommendation</p>
                <p className="mt-1 text-sm leading-6">{recommendation.message}</p>
              </div>
            </div>
            <Result label="Best panel size" value={`${recommendation.recommendedPanelWattage}W`} />
            <Result label="Recommended panels" value={`${recommendation.recommendedPanels}`} />
            <Result label="Target system" value={`${recommendation.recommendedSystemKw} kW`} />
            <Result label="Suitable inverter" value={`${recommendation.inverterCapacity} kW ${input.inverterType}`} />
            <Result label="Bill reduction" value={`Rs ${recommendation.billReduction.toLocaleString()}/mo`} />
            <button className="primary-button mt-3 w-full justify-center" onClick={() => downloadProposal(input, recommendation)}>
              <Download size={17} /> Download proposal summary
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function PanelAnimationSection({ theme, graphics, animateScene }: { theme: 'dark' | 'light'; graphics: GraphicsMode; animateScene: boolean }) {
  return (
    <section id="panels" className={`content-band immersive-section ${theme === 'dark' ? 'scene-dark text-white' : 'scene-light text-slate-950'}`}>
      <div className="section-scene-bg">
        <SolarCanvas theme={theme} graphics={graphics} animateScene={animateScene} scene="panels" />
      </div>
      <div className={`section-shade left ${theme === 'light' ? 'light' : ''}`} />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
        <SectionIntro
          dark={theme === 'dark'}
          eyebrow="Solar Plates"
          title="Animated plates unfold, track sunlight, and push energy across the array."
          body="The panel section shows a professional mounting animation with tilting modules, subtle glass reflection, and live energy flow."
          stats={[
            ['Residential', 'compact glass'],
            ['Commercial', 'wide high-output'],
            ['Motion', 'sun tracking']
          ]}
        />
        <div />
      </div>
    </section>
  );
}

function InverterSection({ theme, graphics, animateScene }: { theme: 'dark' | 'light'; graphics: GraphicsMode; animateScene: boolean }) {
  return (
    <section id="inverters" className={`content-band immersive-section ${theme === 'dark' ? 'scene-dark text-white' : 'scene-light text-slate-950'}`}>
      <div className="section-scene-bg">
        <SolarCanvas theme={theme} graphics={graphics} animateScene={animateScene} scene="inverter" />
      </div>
      <div className={`section-shade right ${theme === 'light' ? 'light' : ''}`} />
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[1.08fr_0.92fr] lg:px-8">
        <div />
        <SectionIntro
          dark={theme === 'dark'}
          eyebrow="Inverters"
          title="Energy conversion from solar plates to inverter, battery, grid, and property."
          body="Animated current lines explain the flow without clutter: DC from panels, conversion at the inverter, then usable power for the building."
          stats={[
            ['Hybrid', 'backup ready'],
            ['Grid-tie', 'net metering'],
            ['Three-phase', 'commercial']
          ]}
        />
      </div>
    </section>
  );
}

function GallerySection({ theme, graphics, animateScene }: { theme: 'dark' | 'light'; graphics: GraphicsMode; animateScene: boolean }) {
  const items = [
    ['Residential house', '8 panel pitched roof'],
    ['Commercial roof', '96 panel warehouse'],
    ['Rooftop solar', 'flush rail array'],
    ['Ground mount', 'tilted frame system'],
    ['Inverter setup', 'hybrid conversion wall'],
    ['Battery system', 'backup storage bank']
  ];

  return (
    <section id="projects" className={`content-band immersive-section ${theme === 'dark' ? 'scene-dark text-white' : 'scene-light text-slate-950'}`}>
      <div className="section-scene-bg">
        <SolarCanvas theme={theme} graphics={graphics} animateScene={animateScene} scene="gallery" />
      </div>
      <div className={`section-shade left ${theme === 'light' ? 'light' : ''}`} />
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading dark={theme === 'dark'} eyebrow="Projects / Gallery" title="3D showcase room for solar installations" />
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div />
          <div className="grid gap-3 sm:grid-cols-2">
            {items.map(([title, body], index) => (
              <motion.article
                key={title}
                className="project-tile"
                initial={{ x: 24, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
              >
                <span className="grid h-10 w-10 place-items-center rounded-md bg-slate-950 text-amber-200">{index + 1}</span>
                <div>
                  <h3 className="font-bold">{title}</h3>
                  <p className="mt-1 text-sm text-slate-600">{body}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function PackagesSection() {
  const packages = [
    {
      name: 'Starter Home',
      capacity: '3kW - 5kW',
      panels: '4-8 panels',
      savings: 'Rs 18k/mo',
      price: 'Rs 580k+',
      description: 'Small homes, low bills, backup-ready wiring.',
      popular: false
    },
    {
      name: 'Family Hybrid',
      capacity: '6kW - 10kW',
      panels: '8-14 panels',
      savings: 'Rs 42k/mo',
      price: 'Rs 1.2M+',
      description: 'Balanced home system with hybrid inverter option.',
      popular: true
    },
    {
      name: 'Large Residence',
      capacity: '11kW - 18kW',
      panels: '14-24 panels',
      savings: 'Rs 78k/mo',
      price: 'Rs 2.1M+',
      description: 'High-consumption homes and bigger rooftops.',
      popular: false
    },
    {
      name: 'Business Roof',
      capacity: '25kW - 150kW+',
      panels: '40-150+ panels',
      savings: 'Custom ROI',
      price: 'Custom',
      description: 'Three-phase commercial design and production reporting.',
      popular: false
    }
  ];
  const features = ['25 year warranty', 'Net metering', 'Installation included', 'Monitoring app', 'Maintenance support'];

  return (
    <section id="packages" className="content-band bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Pricing / Packages" title="Clear packages with engineering headroom" />
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {packages.map((item) => (
            <article key={item.name} className={`package-card ${item.popular ? 'popular' : ''}`}>
              {item.popular && <span className="popular-badge">Most Popular</span>}
              <PanelTop className="text-amber-200" />
              <h3 className="mt-5 text-xl font-bold text-white">{item.name}</h3>
              <p className="mt-2 text-sm leading-6 text-white/60">{item.description}</p>
              <div className="mt-6 grid gap-2">
                <Result label="System capacity" value={item.capacity} />
                <Result label="Number of panels" value={item.panels} />
                <Result label="Monthly savings" value={item.savings} />
                <Result label="Starting price" value={item.price} />
              </div>
              <ul className="package-feature-list">
                {features.map((feature) => (
                  <li key={feature}><CheckCircle2 size={15} /> {feature}</li>
                ))}
              </ul>
              <div className="mt-5 grid gap-2">
                <button className="primary-button justify-center" onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}>Get Quote</button>
                <button className="secondary-button justify-center" onClick={() => document.getElementById('designer')?.scrollIntoView({ behavior: 'smooth' })}>View Details</button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

function ContactSection() {
  const [sent, setSent] = useState(false);
  const [bill, setBill] = useState(38000);
  const [usage, setUsage] = useState(900);
  const [propertyType, setPropertyType] = useState<PropertyType>('residential');
  const [roofType, setRoofType] = useState('concrete');
  const monthlySavings = Math.round(Math.min(bill * 0.78, usage * 43));
  const yearlySavings = monthlySavings * 12;
  const recommendedKw = Math.max(propertyType === 'residential' ? 3 : 20, Math.round((usage / 150) * 10) / 10);
  const estimatedRoi = propertyType === 'residential' ? '3.5 - 5 years' : '2.8 - 4.2 years';
  const co2 = Math.round((usage * 0.62 * 12) / 1000);

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <section id="contact" className="content-band bg-[#f7faf8] text-slate-950">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <SectionHeading dark={false} eyebrow="Quote Request" title="Calculate savings and request a consultation" />
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Slider dark={false} label="Monthly bill" value={bill} min={8000} max={400000} step={1000} suffix="Rs" onChange={setBill} />
            <Slider dark={false} label="Monthly use" value={usage} min={250} max={8000} step={50} suffix="kWh" onChange={setUsage} />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <MetricCard label="Bill reduction" value={`Rs ${monthlySavings.toLocaleString()}`} />
            <MetricCard label="System size" value={`${recommendedKw} kW`} />
            <MetricCard label="Estimated ROI" value={estimatedRoi} />
            <MetricCard label="Yearly savings" value={`Rs ${yearlySavings.toLocaleString()}`} />
            <MetricCard label="CO2 saved yearly" value={`${co2} tons`} />
            <MetricCard label="Roof suitability" value={usage > 4500 ? 'Commercial check' : 'Good'} />
          </div>
          <div className="mt-8 installation-line">
            {['Site survey', '3D design', 'Approval', 'Install', 'Net metering'].map((step, index) => (
              <div key={step} className="install-step">
                <span>{index + 1}</span>
                <p>{step}</p>
              </div>
            ))}
          </div>
        </div>

        <form className="quote-form" onSubmit={submit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField label="Full Name" placeholder="Your name" />
            <TextField label="Phone" placeholder="+92..." icon={<Phone size={17} />} />
            <TextField label="Email" placeholder="you@example.com" icon={<Mail size={17} />} />
            <TextField label="City" placeholder="Lahore, Karachi, Islamabad..." icon={<MapPin size={17} />} />
            <Select
              label="Property Type"
              value={propertyType}
              options={[
                ['residential', 'Residential'],
                ['commercial', 'Commercial']
              ]}
              dark={false}
              onChange={(value) => setPropertyType(value as PropertyType)}
            />
            <TextField label="Monthly Bill" placeholder="Rs 38,000" />
            <Select
              label="Roof Type"
              value={roofType}
              options={[
                ['concrete', 'Concrete roof'],
                ['metal', 'Metal shed'],
                ['tile', 'Tile roof'],
                ['ground', 'Ground mount']
              ]}
              dark={false}
              onChange={setRoofType}
            />
          </div>
          <label className="mt-4 block">
            <span className="text-sm font-bold text-slate-600">Message</span>
            <textarea className="mt-2 min-h-32 w-full rounded-md border border-slate-200 bg-white px-4 py-3 outline-none focus:border-emerald-500" placeholder="Roof size, city, inverter preference, battery need..." />
          </label>
          {sent && <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm font-bold text-emerald-800">Consultation request saved in this demo.</div>}
          <button className="primary-button mt-5 w-full justify-center">
            Send quote request <Send size={17} />
          </button>
        </form>
      </div>
    </section>
  );
}

function AboutSection({ onAdmin }: { onAdmin: () => void }) {
  const features = [
    'Residential Installations',
    'Commercial Installations',
    'Solar Design Services',
    'Net Metering Support',
    'Professional Engineering Team'
  ];
  const stats = [
    ['Projects Completed', '420+'],
    ['Panels Installed', '18,500+'],
    ['Energy Generated', '9.8 GWh'],
    ['Customer Satisfaction', '98%']
  ];

  return (
    <section id="about" className="content-band about-section bg-slate-950 text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-20 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div>
          <SectionHeading eyebrow="About Khan's Solar System" title="Premium solar engineering for homes, businesses, and long-term energy independence." />
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/68">
            Khan's Solar System designs practical, reliable solar installations with clear sizing, professional project control, and support from consultation through net metering.
          </p>
          <div className="mt-8 rounded-lg border border-white/10 bg-white/[0.06] p-5">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-amber-200">Mission Statement</p>
            <p className="mt-3 leading-7 text-white/72">
              Make premium solar planning accessible, transparent, and dependable for every property owner ready to reduce bills and build cleaner power capacity.
            </p>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {features.map((feature) => (
              <div key={feature} className="about-feature">
                <CheckCircle2 size={18} />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="grid content-center gap-5">
          <div className="grid gap-3 sm:grid-cols-2">
            {stats.map(([label, value]) => (
              <article key={label} className="about-stat">
                <p>{label}</p>
                <strong>{value}</strong>
              </article>
            ))}
          </div>

          <div className="about-contact">
            <h3>Contact Information</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <a href="mailto:info@khanssolarsystem.com"><Mail size={17} /> info@khanssolarsystem.com</a>
              <a href="tel:+923001234567"><Phone size={17} /> +92 300 1234567</a>
              <span><MapPin size={17} /> Lahore, Pakistan</span>
            </div>
            <div className="mt-5 flex flex-wrap gap-2">
              {['Facebook', 'Instagram', 'LinkedIn'].map((item) => (
                <button key={item} className="social-button" type="button">{item}</button>
              ))}
              <button className="social-button admin-link" type="button" onClick={onAdmin}>
                <LockKeyhole size={15} /> Admin
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SolarCanvas({
  theme,
  scene,
  graphics,
  animateScene
}: {
  theme: 'dark' | 'light';
  scene: 'hero' | 'residential' | 'commercial' | 'panels' | 'inverter' | 'gallery';
  graphics: GraphicsMode;
  animateScene: boolean;
}) {
  const dpr: [number, number] = graphics === 'high' ? [1, 2] : graphics === 'medium' ? [1, 1.5] : [1, 1];
  const isDay = theme === 'light';
  const sceneBackground = isDay ? '#dff2ff' : '#06111f';
  const ambientIntensity = isDay ? 0.78 : 0.34;
  const sunIntensity = isDay ? 2.65 : 0.92;
  const accentIntensity = isDay ? 0.85 : 1.6;
  return (
    <CanvasErrorBoundary scene={scene}>
      <Canvas
        shadows={graphics !== 'low'}
        dpr={dpr}
        camera={{ position: [7, 5, 8], fov: 42 }}
        gl={{ antialias: true, powerPreference: 'high-performance', failIfMajorPerformanceCaveat: false }}
        onCreated={({ gl }) => {
          gl.setClearColor(sceneBackground);
        }}
      >
        <Suspense fallback={<Html center><div className="loader">Loading 3D solar studio</div></Html>}>
          <PerspectiveCamera makeDefault position={scene === 'hero' ? [7, 4.5, 8] : [6.5, 4.2, 7]} fov={scene === 'hero' ? 38 : 42} />
          <color attach="background" args={[sceneBackground]} />
          <ambientLight intensity={ambientIntensity} />
          <directionalLight position={[5, 8, 3]} intensity={sunIntensity} castShadow={graphics !== 'low'} color={isDay ? '#fff7cc' : '#fbbf24'} />
          <pointLight position={[-4, 3, -3]} intensity={accentIntensity} color={isDay ? '#38bdf8' : '#14b8a6'} />
          {scene === 'hero' && <HeroScene animateScene={animateScene} />}
          {scene === 'residential' && <ResidentialScene animateScene={animateScene} />}
          {scene === 'commercial' && <CommercialScene animateScene={animateScene} />}
          {scene === 'panels' && <PanelScene animateScene={animateScene} />}
          {scene === 'inverter' && <InverterScene animateScene={animateScene} />}
          {scene === 'gallery' && <GalleryScene animateScene={animateScene} />}
          <OrbitControls enablePan={false} enableZoom={scene !== 'hero'} autoRotate={animateScene && scene === 'hero'} autoRotateSpeed={0.45} minDistance={4.5} maxDistance={13} maxPolarAngle={Math.PI / 2.05} />
        </Suspense>
      </Canvas>
    </CanvasErrorBoundary>
  );
}

class CanvasErrorBoundary extends React.Component<{ scene: string; children: React.ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: unknown) {
    console.error(`3D scene failed: ${this.props.scene}`, error);
  }

  render() {
    if (this.state.failed) {
      return <SceneFallback scene={this.props.scene} />;
    }

    return this.props.children;
  }
}

function SceneFallback({ scene }: { scene: string }) {
  return (
    <div className={`scene-fallback ${scene === 'commercial' || scene === 'panels' || scene === 'gallery' ? 'light' : ''}`}>
      <div className="fallback-sun" />
      <div className="fallback-array">
        {Array.from({ length: scene === 'commercial' || scene === 'gallery' ? 28 : 12 }, (_, index) => (
          <span key={index} />
        ))}
      </div>
      <p>Khan's Solar System</p>
      <strong>{sceneLabel(scene)}</strong>
    </div>
  );
}

function sceneLabel(scene: string) {
  if (scene === 'hero') return 'Premium solar design studio';
  if (scene === 'residential') return 'Residential solar roof';
  if (scene === 'commercial') return 'Commercial solar building';
  if (scene === 'panels') return 'Solar panel assembly';
  if (scene === 'inverter') return 'Inverter energy flow';
  return 'Solar project gallery';
}

function HeroScene({ animateScene }: { animateScene: boolean }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current || !animateScene) return;
    ref.current.rotation.y = Math.sin(clock.elapsedTime * 0.25) * 0.16;
  });

  return (
    <group ref={ref}>
      <Stars radius={80} depth={35} count={900} factor={4} fade speed={0.35} />
      <SunOrb position={[-3.8, 3.2, -2.2]} />
      <ResidentialModel position={[-1.6, -0.2, 0]} panelCount={10} />
      <CommercialModel position={[2.4, -0.35, -0.6]} panelCount={48} scale={0.78} />
      <EnergyParticles count={28} animateScene={animateScene} />
      <Ground color="#071827" />
    </group>
  );
}

function ResidentialScene({ animateScene }: { animateScene: boolean }) {
  return (
    <group>
      <SunOrb position={[-3.5, 4, -3]} />
      <ResidentialModel panelCount={8} />
      <EnergyParticles count={12} animateScene={animateScene} />
      <Ground color="#08251f" />
    </group>
  );
}

function CommercialScene({ animateScene }: { animateScene: boolean }) {
  return (
    <group>
      <SunOrb position={[-4, 4, -3]} />
      <CommercialModel panelCount={96} scale={1.05} />
      <EnergyParticles count={20} animateScene={animateScene} />
      <Ground color="#d7e8e0" light />
    </group>
  );
}

function PanelScene({ animateScene }: { animateScene: boolean }) {
  const group = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!group.current || !animateScene) return;
    group.current.children.forEach((child, index) => {
      child.rotation.x = -0.45 + Math.sin(clock.elapsedTime * 1.2 + index * 0.4) * 0.11;
    });
  });
  return (
    <group>
      <SunOrb position={[-3.8, 4.2, -2.6]} />
      <group ref={group} position={[0, 0.7, 0]}>
        {Array.from({ length: 18 }, (_, index) => (
          <SolarPlate key={index} position={[-2.5 + (index % 6) * 1, 0.06, -1.4 + Math.floor(index / 6) * 1]} size="commercial" />
        ))}
      </group>
      <EnergyParticles count={24} animateScene={animateScene} />
      <Ground color="#d7e8e0" light />
    </group>
  );
}

function InverterScene({ animateScene }: { animateScene: boolean }) {
  return (
    <group>
      <SunOrb position={[-4, 4, -2]} />
      <group position={[-2, 0.35, -0.8]} rotation={[0, -0.3, 0]}>
        {Array.from({ length: 8 }, (_, index) => (
          <SolarPlate key={index} position={[(index % 4) * 0.85, 0.1, Math.floor(index / 4) * 0.82]} size="residential" />
        ))}
      </group>
      <InverterBox position={[1.25, 0.85, 0]} />
      <BatteryBank position={[2.55, 0.55, 0.45]} />
      <MiniBuilding position={[3.8, 0.65, -0.7]} />
      <EnergyParticles count={18} animateScene={animateScene} />
      <Ground color="#071827" />
    </group>
  );
}

function GalleryScene({ animateScene }: { animateScene: boolean }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current || !animateScene) return;
    ref.current.rotation.y = clock.elapsedTime * 0.18;
  });
  return (
    <group>
      <group ref={ref}>
        <ResidentialModel position={[-3, 0, 0]} panelCount={6} scale={0.64} />
        <CommercialModel position={[2.6, -0.2, -0.2]} panelCount={36} scale={0.54} />
        <InverterBox position={[0, 0.75, 2.8]} />
        <BatteryBank position={[0.8, 0.55, 2.8]} />
        <group position={[0, 0.25, -2.7]}>
          {Array.from({ length: 10 }, (_, index) => (
            <SolarPlate key={index} position={[-2 + (index % 5) * 0.85, 0.08, Math.floor(index / 5) * 0.8]} size="commercial" />
          ))}
        </group>
      </group>
      <SunOrb position={[-3.8, 4.2, -3]} />
      <EnergyParticles count={18} animateScene={animateScene} />
      <Ground color="#d7e8e0" light />
    </group>
  );
}

function ResidentialModel({ panelCount, position = [0, 0, 0], scale = 1 }: { panelCount: number; position?: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale} rotation={[0, -0.42, 0]}>
      <mesh castShadow receiveShadow position={[0, 0.85, 0]}>
        <boxGeometry args={[4.2, 1.7, 3.3]} />
        <meshStandardMaterial color="#f4f6ef" roughness={0.7} />
      </mesh>
      <mesh castShadow position={[-1.25, 0.6, 1.69]}>
        <boxGeometry args={[0.7, 0.9, 0.08]} />
        <meshStandardMaterial color="#123b55" />
      </mesh>
      <mesh castShadow position={[0.8, 0.75, 1.7]}>
        <boxGeometry args={[1.25, 0.55, 0.08]} />
        <meshStandardMaterial color="#f8d76b" emissive="#a16207" emissiveIntensity={0.08} />
      </mesh>
      <group position={[0, 1.85, 0]}>
        <mesh castShadow receiveShadow rotation={[0, 0, Math.PI / 4]} position={[-1.05, 0, 0]}>
          <boxGeometry args={[3.05, 0.18, 3.75]} />
          <meshStandardMaterial color="#253844" roughness={0.55} />
        </mesh>
        <mesh castShadow receiveShadow rotation={[0, 0, -Math.PI / 4]} position={[1.05, 0, 0]}>
          <boxGeometry args={[3.05, 0.18, 3.75]} />
          <meshStandardMaterial color="#314b55" roughness={0.6} />
        </mesh>
      </group>
      <group position={[-1.45, 2.2, -0.1]} rotation={[0, 0, Math.PI / 4]}>
        {Array.from({ length: Math.min(panelCount, 12) }, (_, index) => (
          <SolarPlate key={index} position={[-0.7 + (index % 4) * 0.48, 0.08, -0.85 + Math.floor(index / 4) * 0.62]} size="residential" />
        ))}
      </group>
      <InverterBox position={[2.65, 0.85, -0.6]} scale={0.58} />
    </group>
  );
}

function CommercialModel({ panelCount, position = [0, 0, 0], scale = 1 }: { panelCount: number; position?: [number, number, number]; scale?: number }) {
  const visible = Math.min(panelCount, 120);
  return (
    <group position={position} scale={scale} rotation={[0, 0.32, 0]}>
      <mesh castShadow receiveShadow position={[0, 0.85, 0]}>
        <boxGeometry args={[5.8, 1.7, 4.2]} />
        <meshStandardMaterial color="#cfd9d5" roughness={0.8} metalness={0.08} />
      </mesh>
      <mesh castShadow position={[0, 1.77, 0]}>
        <boxGeometry args={[6.15, 0.18, 4.55]} />
        <meshStandardMaterial color="#44535a" roughness={0.5} />
      </mesh>
      {Array.from({ length: 7 }, (_, index) => (
        <mesh key={index} position={[-2.5 + index * 0.82, 0.86, 2.14]}>
          <boxGeometry args={[0.35, 0.62, 0.08]} />
          <meshStandardMaterial color="#123b55" />
        </mesh>
      ))}
      <group position={[-2.65, 1.95, -1.75]}>
        {Array.from({ length: visible }, (_, index) => (
          <SolarPlate key={index} position={[(index % 12) * 0.43, 0.08, Math.floor(index / 12) * 0.38]} size="commercial" />
        ))}
      </group>
      <mesh castShadow position={[3.4, 0.42, -1.7]}>
        <boxGeometry args={[0.65, 0.85, 0.65]} />
        <meshStandardMaterial color="#0f766e" metalness={0.2} roughness={0.35} />
      </mesh>
    </group>
  );
}

function SolarPlate({ position, size }: { position: [number, number, number]; size: 'residential' | 'commercial' }) {
  const ref = useRef<Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const material = Array.isArray(ref.current.material) ? ref.current.material[0] : ref.current.material;
    material.opacity = 0.96 + Math.sin(clock.elapsedTime * 2 + position[0]) * 0.035;
  });
  const dims: [number, number, number] = size === 'commercial' ? [0.36, 0.055, 0.62] : [0.42, 0.055, 0.7];
  return (
    <group position={position}>
      <mesh ref={ref} castShadow receiveShadow>
        <boxGeometry args={dims} />
        <meshStandardMaterial color={size === 'commercial' ? '#0b2142' : '#123c69'} metalness={0.35} roughness={0.28} emissive="#0ea5e9" emissiveIntensity={0.05} transparent opacity={0.98} />
      </mesh>
      <mesh position={[0, 0.035, 0]}>
        <boxGeometry args={[dims[0] * 0.86, 0.012, 0.018]} />
        <meshStandardMaterial color="#7dd3fc" emissive="#38bdf8" emissiveIntensity={0.4} />
      </mesh>
    </group>
  );
}

function InverterBox({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.72, 1.16, 0.32]} />
        <meshStandardMaterial color="#edf6f3" roughness={0.38} metalness={0.08} />
      </mesh>
      <mesh position={[0, 0.12, 0.17]}>
        <boxGeometry args={[0.46, 0.25, 0.025]} />
        <meshStandardMaterial color="#083344" emissive="#22d3ee" emissiveIntensity={0.32} />
      </mesh>
      <mesh position={[0, -0.28, 0.17]}>
        <boxGeometry args={[0.5, 0.08, 0.025]} />
        <meshStandardMaterial color="#0f766e" emissive="#34d399" emissiveIntensity={0.25} />
      </mesh>
    </group>
  );
}

function BatteryBank({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {[0, 1, 2].map((index) => (
        <mesh key={index} castShadow receiveShadow position={[index * 0.32, 0, 0]}>
          <boxGeometry args={[0.24, 0.86, 0.38]} />
          <meshStandardMaterial color="#101827" roughness={0.45} metalness={0.18} />
        </mesh>
      ))}
    </group>
  );
}

function MiniBuilding({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.25, 1.3, 1.05]} />
        <meshStandardMaterial color="#d9e3df" roughness={0.7} />
      </mesh>
      <mesh position={[0, 0.78, 0]}>
        <boxGeometry args={[1.45, 0.16, 1.2]} />
        <meshStandardMaterial color="#334155" />
      </mesh>
    </group>
  );
}

function SunOrb({ position }: { position: [number, number, number] }) {
  return (
    <Float speed={1.2} rotationIntensity={0.1} floatIntensity={0.25}>
      <mesh position={position}>
        <sphereGeometry args={[0.55, 32, 32]} />
        <meshStandardMaterial color="#fde68a" emissive="#f59e0b" emissiveIntensity={1.65} />
      </mesh>
      <pointLight position={position} intensity={3.2} color="#fbbf24" />
    </Float>
  );
}

function EnergyParticles({ count, animateScene }: { count: number; animateScene: boolean }) {
  const ref = useRef<Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current || !animateScene) return;
    ref.current.children.forEach((child, index) => {
      child.position.y = 1.3 + Math.sin(clock.elapsedTime * 1.8 + index) * 0.55;
      child.position.x += Math.sin(clock.elapsedTime + index) * 0.001;
    });
  });
  return (
    <group ref={ref}>
      <Sparkles count={count} scale={[7, 3.5, 5]} size={3.2} speed={animateScene ? 0.6 : 0} color="#fbbf24" />
    </group>
  );
}

function Ground({ color, light = false }: { color: string; light?: boolean }) {
  return (
    <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.04, 0]}>
      <planeGeometry args={[18, 14]} />
      <meshStandardMaterial color={color} roughness={0.88} metalness={light ? 0 : 0.05} />
    </mesh>
  );
}

function recommendSystem(input: DesignerInput): Recommendation {
  const targetKw = input.energyNeed / 30 / 5;
  const residential = input.propertyType === 'residential';
  const areaPerPanel = residential ? 25 : 29;
  const roofPanelCapacity = Math.max(1, Math.floor(input.roofArea / areaPerPanel));
  const recommendedPanelWattage = residential ? (input.energyNeed > 1600 ? 580 : input.energyNeed > 850 ? 550 : 450) : input.energyNeed > 9000 ? 700 : input.energyNeed > 4500 ? 650 : 580;
  const rawPanels = Math.ceil((targetKw * 1000) / recommendedPanelWattage);
  const minPanels = residential ? (input.energyNeed < 700 ? 4 : input.energyNeed < 1400 ? 8 : 14) : input.energyNeed < 3500 ? 20 : input.energyNeed < 9000 ? 40 : 150;
  const maxSoftPanels = residential ? 24 : 220;
  const recommendedPanels = Math.min(roofPanelCapacity, Math.max(minPanels, Math.min(rawPanels, maxSoftPanels)));
  const selectedSystemKw = round((input.panelWattage * input.panelCount) / 1000, 2);
  const recommendedSystemKw = round((recommendedPanelWattage * recommendedPanels) / 1000, 2);
  const orientationFactor = input.orientation === 'south' ? 1 : input.orientation === 'east-west' ? 0.93 : 0.87;
  const monthlyGeneration = Math.round(selectedSystemKw * 5 * 30 * orientationFactor);
  const inverterCapacity = nextInverter(selectedSystemKw, input.inverterType);
  const billReduction = Math.round(monthlyGeneration * (residential ? 52 : 64));
  const co2Savings = round((monthlyGeneration * 12 * 0.62) / 1000, 1);
  const tooManyForRoof = input.panelCount > roofPanelCapacity;
  const lowFit = selectedSystemKw < recommendedSystemKw * 0.72;
  const oversized = selectedSystemKw > recommendedSystemKw * 1.38;
  const unsuitableWattage = residential ? input.panelWattage > 580 : input.panelWattage < 550;
  const status: Recommendation['status'] = tooManyForRoof || unsuitableWattage ? 'danger' : lowFit || oversized ? 'warning' : 'excellent';
  const message = tooManyForRoof
    ? 'Selected panel count exceeds available roof capacity. Reduce count or split the array across another surface.'
    : unsuitableWattage
      ? residential
        ? 'Residential roofs usually fit 450W to 580W modules better than large commercial plates.'
        : 'Commercial projects should use 550W to 700W high-efficiency modules for better density.'
      : lowFit
        ? 'The selected system is smaller than the energy need. Increase panel count or wattage for a stronger match.'
        : oversized
          ? 'The selected system is larger than the current load. It may work if future load growth is expected.'
          : 'Selected size is a strong match for roof area, energy need, property type, and module efficiency.';

  return {
    recommendedPanelWattage,
    recommendedPanels,
    selectedSystemKw,
    recommendedSystemKw,
    monthlyGeneration,
    inverterCapacity,
    roofPanelCapacity,
    co2Savings,
    billReduction,
    status,
    message
  };
}

function nextInverter(systemKw: number, type: InverterType) {
  const sizes = type === 'three-phase' ? [15, 20, 25, 30, 50, 75, 100, 150] : [5, 8, 10, 12, 15, 20, 25, 30];
  return sizes.find((size) => size >= systemKw * 1.05) ?? sizes.at(-1) ?? 30;
}

function buildPanelGrid(count: number, type: PropertyType) {
  const columns = type === 'residential' ? 6 : 14;
  return Array.from({ length: Math.min(count, type === 'residential' ? 48 : 220) }, (_, index) => ({
    column: (index % columns) + 1,
    row: Math.floor(index / columns) + 1
  }));
}

function downloadProposal(input: DesignerInput, recommendation: Recommendation) {
  const lines = [
    "Khan's Solar System Proposal Summary",
    `Property: ${input.propertyType}`,
    `Roof area: ${input.roofArea} sq ft`,
    `Energy need: ${input.energyNeed} kWh/month`,
    `Selected panel: ${input.panelWattage}W x ${input.panelCount}`,
    `Recommended panel: ${recommendation.recommendedPanelWattage}W x ${recommendation.recommendedPanels}`,
    `Selected system: ${recommendation.selectedSystemKw} kW`,
    `Recommended system: ${recommendation.recommendedSystemKw} kW`,
    `Estimated monthly generation: ${recommendation.monthlyGeneration} kWh`,
    `Suitable inverter: ${recommendation.inverterCapacity} kW ${input.inverterType}`,
    `Recommendation: ${recommendation.message}`
  ];
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'khans-solar-proposal.txt';
  link.click();
  URL.revokeObjectURL(url);
}

function AdminLoginModal({
  authed,
  activeModule,
  onAuthed,
  onClose,
  onNavigate,
  onLogout
}: {
  authed: boolean;
  activeModule: AdminModule;
  onAuthed: () => void;
  onClose: () => void;
  onNavigate: (module: AdminModule) => void;
  onLogout: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  function validate() {
    const normalizedEmail = email.trim();
    if (!normalizedEmail) return 'Email is required.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) return 'Enter a valid email address.';
    if (!password) return 'Password is required.';
    return '';
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setSuccess('');
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }

    setError('');
    setLoading(true);
    window.setTimeout(() => {
      const valid = email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD;
      setLoading(false);
      if (!valid) {
        setError('Invalid email or password.');
        return;
      }
      setSuccess('Login successful. Opening admin console...');
      window.setTimeout(onAuthed, 350);
    }, 650);
  }

  return (
    <motion.div className="fixed inset-0 z-[70] grid place-items-center bg-slate-950/78 px-4 backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.div className="admin-modal" initial={{ y: 24, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 18, opacity: 0 }}>
        <button className="absolute right-4 top-4 text-slate-400 hover:text-slate-900" onClick={onClose} aria-label="Close admin">
          <X size={20} />
        </button>
        {!authed ? (
          <form onSubmit={submit} autoComplete="off">
            <div className="grid h-12 w-12 place-items-center rounded-md bg-slate-950 text-amber-200">
              <ShieldCheck />
            </div>
            <h2 className="mt-5 text-3xl font-bold text-slate-950">Admin login</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Registration is removed. Enter admin credentials manually to continue.</p>
            <AdminInput
              label="Email"
              value={email}
              onValue={setEmail}
              icon={<Mail size={17} />}
              placeholder="Enter admin email"
              type="email"
              autoComplete="off"
            />
            <AdminInput
              label="Password"
              value={password}
              onValue={setPassword}
              icon={<LockKeyhole size={17} />}
              placeholder="Enter password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              action={
                <button type="button" className="text-slate-400 hover:text-slate-950" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />
            <AnimatePresence>
              {error && <Notification key="error" tone="error" message={error} />}
              {success && <Notification key="success" tone="success" message={success} />}
            </AnimatePresence>
            <button className="primary-button mt-5 w-full justify-center" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : <LockKeyhole size={17} />}
              {loading ? 'Logging in...' : 'Open admin console'}
            </button>
          </form>
        ) : (
          <AdminConsole activeModule={activeModule} onNavigate={onNavigate} onLogout={onLogout} />
        )}
      </motion.div>
    </motion.div>
  );
}

function AdminConsole({ activeModule, onNavigate, onLogout }: { activeModule: AdminModule; onNavigate: (module: AdminModule) => void; onLogout: () => void }) {
  return (
    <div>
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="grid h-12 w-12 place-items-center rounded-md bg-emerald-600 text-white">
            <CheckCircle2 />
          </div>
          <h2 className="mt-5 text-3xl font-bold text-slate-950">Admin Console</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">Manage Khan's Solar System operations, packages, users, inquiries, recommendations, and reports.</p>
        </div>
        <button className="admin-logout" onClick={onLogout}>Logout</button>
      </div>

      <div className="admin-console-grid">
        <nav className="admin-sidebar" aria-label="Admin modules">
          {adminModules.map((module) => (
            <button key={module.id} className={activeModule === module.id ? 'active' : ''} onClick={() => onNavigate(module.id)}>
              {module.label}
            </button>
          ))}
        </nav>
        <motion.section key={activeModule} className="admin-module" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
          {activeModule === 'dashboard' ? <AdminDashboard /> : <AdminModuleView module={activeModule} />}
        </motion.section>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const stats = [
    ['Total Projects', '128'],
    ['Total Users', '1,482'],
    ['Total Inquiries', '346'],
    ['Total Packages', '4'],
    ['Total Installations', '92'],
    ['Monthly Revenue', 'Rs 18.4M']
  ];
  const inquiries: [string, number][] = [
    ['M1', 34],
    ['M2', 42],
    ['M3', 38],
    ['M4', 58],
    ['M5', 71],
    ['M6', 83]
  ];
  const packages: [string, number][] = [
    ['Starter Home', 38],
    ['Family Hybrid', 72],
    ['Large Residence', 46],
    ['Business Roof', 29]
  ];
  const completion: [string, number][] = [
    ['Survey', 96],
    ['Design', 88],
    ['Install', 74],
    ['Net Metering', 62]
  ];

  return (
    <div>
      <div className="admin-stats-grid">
        {stats.map(([label, value]) => (
          <article key={label} className="admin-stat-card">
            <p>{label}</p>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
      <div className="admin-chart-grid">
        <AdminChart title="Monthly inquiries" data={inquiries} />
        <AdminChart title="Package popularity" data={packages} />
        <AdminChart title="Project completion rate" data={completion} percent />
      </div>
    </div>
  );
}

function AdminModuleView({ module }: { module: AdminModule }) {
  const details: Record<Exclude<AdminModule, 'dashboard'>, { title: string; description: string; rows: string[] }> = {
    projects: {
      title: 'Projects',
      description: 'Track active residential and commercial solar projects.',
      rows: ['DHA Lahore - 12kW hybrid - Installation', 'Gulberg Office - 75kW three-phase - Design', 'Islamabad Residence - 8kW - Net metering']
    },
    users: {
      title: 'Users',
      description: 'Review customer, engineer, and operations user records.',
      rows: ['Admin Owner - Active', 'Field Engineer Team - Active', 'Client Portal Users - 1,482']
    },
    inquiries: {
      title: 'Inquiries',
      description: 'Handle quote requests and consultation submissions.',
      rows: ['New residential quote - Lahore', 'Commercial warehouse inquiry - Faisalabad', 'Battery backup consultation - Karachi']
    },
    packages: {
      title: 'Solar Packages',
      description: 'Manage Starter Home, Family Hybrid, Large Residence, and Business Roof packages.',
      rows: ['Starter Home - Published', 'Family Hybrid - Most Popular', 'Business Roof - Custom pricing']
    },
    panels: {
      title: 'Panel Sizes',
      description: 'Maintain residential and commercial panel wattage recommendations.',
      rows: ['450W residential compact', '550W residential premium', '650W commercial high-efficiency', '700W commercial max-output']
    },
    inverters: {
      title: 'Inverters',
      description: 'Manage hybrid, grid-tie, and three-phase inverter options.',
      rows: ['8kW hybrid - Residential', '15kW hybrid - Large home', '50kW three-phase - Commercial']
    },
    recommendations: {
      title: 'Recommendations',
      description: 'Tune system sizing rules for roof area, energy need, property type, and efficiency.',
      rows: ['Residential range - 4 to 24 panels', 'Commercial range - 20 to 150+ panels', 'Roof capacity warning - Enabled']
    },
    reports: {
      title: 'Reports',
      description: 'View revenue, installation progress, lead flow, and package performance.',
      rows: ['Monthly revenue report ready', 'Completion rate report ready', 'Inquiry conversion report ready']
    }
  };
  const content = details[module as Exclude<AdminModule, 'dashboard'>];

  return (
    <div>
      <h3 className="text-2xl font-bold text-slate-950">{content.title}</h3>
      <p className="mt-2 text-sm leading-6 text-slate-600">{content.description}</p>
      <div className="mt-5 grid gap-3">
        {content.rows.map((row) => (
          <div key={row} className="admin-row">
            <CheckCircle2 size={18} />
            <span>{row}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AdminChart({ title, data, percent = false }: { title: string; data: [string, number][]; percent?: boolean }) {
  const max = Math.max(...data.map((item) => item[1]), 1);
  return (
    <article className="admin-chart-card">
      <h3>{title}</h3>
      <div className="mt-5 space-y-3">
        {data.map(([label, value]) => (
          <div key={label}>
            <div className="mb-1 flex items-center justify-between text-xs font-bold text-slate-500">
              <span>{label}</span>
              <span>{value}{percent ? '%' : ''}</span>
            </div>
            <div className="admin-chart-track">
              <span style={{ width: `${Math.max(8, (value / max) * 100)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

function AdminInput({
  label,
  placeholder,
  icon,
  value,
  onValue,
  type,
  autoComplete,
  action
}: {
  label: string;
  placeholder: string;
  icon: React.ReactNode;
  value: string;
  onValue: (value: string) => void;
  type: string;
  autoComplete: string;
  action?: React.ReactNode;
}) {
  return (
    <label className="mt-4 block">
      <span className="text-sm font-bold text-slate-600">{label}</span>
      <span className="mt-2 flex h-12 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 focus-within:border-emerald-500">
        <span className="text-slate-400">{icon}</span>
        <input className="h-full w-full outline-none" type={type} placeholder={placeholder} value={value} autoComplete={autoComplete} onChange={(event) => onValue(event.target.value)} />
        {action}
      </span>
    </label>
  );
}

function Notification({ tone, message }: { tone: 'success' | 'error'; message: string }) {
  return (
    <motion.div
      className={`mt-4 rounded-md border p-3 text-sm font-bold ${tone === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-rose-200 bg-rose-50 text-rose-800'}`}
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
    >
      {message}
    </motion.div>
  );
}

function createAdminSession() {
  const storage = getSafeSessionStorage();
  if (!storage) return;
  const session = {
    token: createSessionToken(),
    createdAt: Date.now(),
    expiresAt: Date.now() + 1000 * 60 * 60 * 4
  };
  storage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
}

function clearAdminSession() {
  const storage = getSafeSessionStorage();
  storage?.removeItem(ADMIN_SESSION_KEY);
}

function hasValidAdminSession() {
  const storage = getSafeSessionStorage();
  if (!storage) return false;
  try {
    const raw = storage.getItem(ADMIN_SESSION_KEY);
    if (!raw) return false;
    const session = JSON.parse(raw) as { token?: string; expiresAt?: number };
    if (!session.token || !session.expiresAt || session.expiresAt < Date.now()) {
      storage.removeItem(ADMIN_SESSION_KEY);
      return false;
    }
    return true;
  } catch {
    storage.removeItem(ADMIN_SESSION_KEY);
    return false;
  }
}

function getSafeSessionStorage() {
  try {
    const testKey = `${ADMIN_SESSION_KEY}_test`;
    sessionStorage.setItem(testKey, '1');
    sessionStorage.removeItem(testKey);
    return sessionStorage;
  } catch {
    return null;
  }
}

function createSessionToken() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function getCurrentAdminRoute() {
  if (window.location.hash.startsWith('#/admin')) {
    return window.location.hash.slice(1);
  }

  return window.location.pathname;
}

function isAdminRoute(route: string) {
  return route === '/admin' || route === '/admin-dashboard' || route === '/admin-console' || route.startsWith('/admin-console/');
}

function getAdminModuleFromRoute(route: string): AdminModule | null {
  if (route === '/admin-dashboard' || route === '/admin-console') return 'dashboard';
  if (!route.startsWith('/admin-console/')) return null;
  const rawModule = route.replace('/admin-console/', '') as AdminModule;
  return adminModules.some((module) => module.id === rawModule) ? rawModule : 'dashboard';
}

function SectionIntro({ eyebrow, title, body, stats, dark = true }: { eyebrow: string; title: string; body: string; stats: [string, string][]; dark?: boolean }) {
  return (
    <div className="flex flex-col justify-center">
      <SectionHeading eyebrow={eyebrow} title={title} dark={dark} />
      <p className={`mt-5 max-w-xl text-base leading-8 ${dark ? 'text-white/70' : 'text-slate-600'}`}>{body}</p>
      <div className="mt-8 grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
        {stats.map(([label, value]) => (
          <MetricCard key={label} label={label} value={value} dark={dark} />
        ))}
      </div>
    </div>
  );
}

function SectionHeading({ eyebrow, title, dark = true }: { eyebrow: string; title: string; dark?: boolean }) {
  return (
    <div>
      <p className={`text-sm font-bold uppercase tracking-[0.18em] ${dark ? 'text-amber-200' : 'text-emerald-700'}`}>{eyebrow}</p>
      <h2 className={`mt-3 max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl ${dark ? 'text-white' : 'text-slate-950'}`}>{title}</h2>
    </div>
  );
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/10 p-4 backdrop-blur">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/50">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function MetricCard({ label, value, dark = true }: { label: string; value: string; dark?: boolean }) {
  return (
    <div className={`rounded-md border p-4 ${dark ? 'border-white/10 bg-white/[0.07] text-white' : 'border-slate-200 bg-white text-slate-950 shadow-sm'}`}>
      <p className={`text-xs font-bold uppercase tracking-[0.14em] ${dark ? 'text-white/50' : 'text-slate-500'}`}>{label}</p>
      <p className="mt-2 text-xl font-semibold">{value}</p>
    </div>
  );
}

function Result({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-white/[0.06] p-3">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/50">{label}</p>
      <p className="mt-1 text-sm font-semibold text-white">{value}</p>
    </div>
  );
}

function Segmented({ label, value, options, onChange }: { label: string; value: string; options: [string, string][]; onChange: (value: string) => void }) {
  return (
    <div>
      <p className="mb-2 text-sm font-bold text-white/70">{label}</p>
      <div className="grid grid-cols-2 gap-2 rounded-md border border-white/10 bg-white/[0.06] p-1">
        {options.map(([optionValue, optionLabel]) => (
          <button key={optionValue} className={`h-10 rounded text-sm font-bold ${value === optionValue ? 'bg-amber-300 text-slate-950' : 'text-white/70'}`} onClick={() => onChange(optionValue)}>
            {optionLabel}
          </button>
        ))}
      </div>
    </div>
  );
}

function Slider({ label, value, min, max, step, suffix, onChange, dark = true }: { label: string; value: number; min: number; max: number; step: number; suffix: string; onChange: (value: number) => void; dark?: boolean }) {
  const clamped = MathUtils.clamp(value, min, max);
  return (
    <label className="block">
      <span className={`flex items-center justify-between gap-3 text-sm font-bold ${dark ? 'text-white/70' : 'text-slate-600'}`}>
        <span>{label}</span>
        <span className={dark ? 'text-amber-200' : 'text-emerald-700'}>{clamped.toLocaleString()} {suffix}</span>
      </span>
      <input className="mt-3 w-full accent-amber-300" type="range" min={min} max={max} step={step} value={clamped} onChange={(event) => onChange(Number(event.target.value))} />
    </label>
  );
}

function Select({ label, value, options, onChange, dark = true }: { label: string; value: string; options: [string, string][]; onChange: (value: string) => void; dark?: boolean }) {
  return (
    <label className="block">
      <span className={`text-sm font-bold ${dark ? 'text-white/70' : 'text-slate-600'}`}>{label}</span>
      <select
        className={`mt-2 h-11 w-full rounded-md border px-3 text-sm font-bold outline-none focus:border-amber-300 ${
          dark ? 'border-white/10 bg-white/[0.08] text-white' : 'border-slate-200 bg-white text-slate-950'
        }`}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map(([optionValue, optionLabel]) => (
          <option key={optionValue} className="text-slate-950" value={optionValue}>{optionLabel}</option>
        ))}
      </select>
    </label>
  );
}

function TextField({ label, placeholder, icon, value, onValue, type = 'text' }: { label: string; placeholder?: string; icon?: React.ReactNode; value?: string; onValue?: (value: string) => void; type?: string }) {
  return (
    <label className="mt-4 block">
      <span className="text-sm font-bold text-slate-600">{label}</span>
      <span className="mt-2 flex h-12 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 focus-within:border-emerald-500">
        <span className="text-slate-400">{icon ?? <Home size={17} />}</span>
        <input className="h-full w-full outline-none" type={type} placeholder={placeholder} value={value} onChange={(event) => onValue?.(event.target.value)} />
      </span>
    </label>
  );
}

function round(value: number, precision: number) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}
