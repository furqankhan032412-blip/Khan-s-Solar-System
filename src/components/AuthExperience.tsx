import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Eye,
  EyeOff,
  HardHat,
  LockKeyhole,
  Mail,
  Moon,
  ShieldCheck,
  Sun,
  UserPlus,
  Users,
  Zap
} from 'lucide-react';
import type React from 'react';
import { useMemo, useState } from 'react';
import type { AuthUser, Role, ThemeMode } from '../types';

type StoredUser = AuthUser & {
  password: string;
};

type AuthMode = 'hero' | 'login' | 'register';

const roleCards: { role: Role; label: string; title: string; icon: typeof Users; accent: string }[] = [
  { role: 'client', label: 'Client', title: 'Track approvals, invoices, and installation progress.', icon: Users, accent: 'from-teal-500 to-emerald-400' },
  { role: 'engineer', label: 'Field Engineering', title: 'Capture roof checks, hardware choices, and inspection media.', icon: HardHat, accent: 'from-amber-500 to-orange-400' },
  { role: 'admin', label: 'Admin', title: 'Manage revenue, inventory, crews, and the project pipeline.', icon: ShieldCheck, accent: 'from-slate-800 to-teal-700' }
];

const registerRoleCards = roleCards.filter((card) => card.role !== 'admin');

const storageKey = 'kss_registered_users';
const defaultAdmin: StoredUser = {
  id: 'admin_owner_1',
  name: 'Admin Owner',
  company: "Khan's Solar System",
  email: 'admin@khanssolar.test',
  password: 'Solar123!',
  role: 'admin'
};

export function AuthExperience({
  theme,
  onThemeToggle,
  onAuthenticated
}: {
  theme: ThemeMode;
  onThemeToggle: () => void;
  onAuthenticated: (user: AuthUser) => void;
}) {
  const [mode, setMode] = useState<AuthMode>('hero');
  const [selectedRole, setSelectedRole] = useState<Role>('client');

  return (
    <AnimatedPage theme={theme}>
      <TopBar theme={theme} onThemeToggle={onThemeToggle} />
      <AnimatePresence mode="wait">
        {mode === 'hero' && (
          <HeroScreen
            key="hero"
            selectedRole={selectedRole}
            onRoleChange={setSelectedRole}
            onLogin={() => setMode('login')}
            onRegister={() => setMode('register')}
          />
        )}
        {mode === 'login' && (
          <AuthForm
            key="login"
            mode="login"
            selectedRole={selectedRole}
            onRoleChange={setSelectedRole}
            onBack={() => setMode('hero')}
            onSwitchMode={() => setMode('register')}
            onAuthenticated={onAuthenticated}
          />
        )}
        {mode === 'register' && (
          <AuthForm
            key="register"
            mode="register"
            selectedRole={selectedRole === 'admin' ? 'client' : selectedRole}
            onRoleChange={setSelectedRole}
            onBack={() => setMode('hero')}
            onSwitchMode={() => setMode('login')}
            onAuthenticated={onAuthenticated}
          />
        )}
      </AnimatePresence>
    </AnimatedPage>
  );
}

export function AppChrome({
  theme,
  activePage,
  user,
  onThemeToggle,
  onNavigate,
  onLogout,
  children
}: {
  theme: ThemeMode;
  activePage: 'profile' | 'estimator' | 'pipeline';
  user: AuthUser;
  onThemeToggle: () => void;
  onNavigate: (page: 'profile' | 'estimator' | 'pipeline') => void;
  onLogout: () => void;
  children: React.ReactNode;
}) {
  return (
    <AnimatedPage theme={theme}>
      <TopBar theme={theme} onThemeToggle={onThemeToggle}>
        <nav className="flex flex-wrap items-center gap-2">
          {(['profile', 'estimator', 'pipeline'] as const).map((page) => (
            <button
              key={page}
              className={`h-10 rounded-md px-3 text-sm font-bold capitalize transition ${
                activePage === page ? 'bg-white text-ink shadow-sm' : 'text-white/80 hover:bg-white/10'
              }`}
              onClick={() => onNavigate(page)}
            >
              {page}
            </button>
          ))}
        </nav>
      </TopBar>
      <div className="relative z-10 min-h-screen px-4 pb-8 pt-24 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 pb-5">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-white/65">{roleLabel(user.role)} profile</p>
            <h1 className="mt-1 text-3xl font-semibold text-white sm:text-4xl">Welcome, {user.name}</h1>
          </div>
          <button className="h-10 rounded-md border border-white/20 px-4 text-sm font-bold text-white hover:bg-white/10" onClick={onLogout}>
            Logout
          </button>
        </div>
        <motion.div
          key={activePage}
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -18, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          className="mx-auto max-w-7xl overflow-hidden rounded-lg border border-white/20 bg-white/95 shadow-soft"
        >
          {children}
        </motion.div>
      </div>
    </AnimatedPage>
  );
}

function HeroScreen({
  selectedRole,
  onRoleChange,
  onLogin,
  onRegister
}: {
  selectedRole: Role;
  onRoleChange: (role: Role) => void;
  onLogin: () => void;
  onRegister: () => void;
}) {
  return (
    <motion.section
      className="relative z-10 flex min-h-screen items-center px-4 pt-20 sm:px-6 lg:px-8"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -24 }}
      transition={{ type: 'spring', stiffness: 160, damping: 20 }}
    >
      <div className="mx-auto grid w-full max-w-7xl items-center gap-8 lg:grid-cols-[1fr_520px]">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-2 text-sm font-bold text-white backdrop-blur">
            <Zap size={16} /> Solar SaaS command center
          </div>
          <h1 className="mt-6 text-5xl font-semibold leading-tight text-white sm:text-6xl lg:text-7xl">Khan's Solar System</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/75">
            A secure workspace for clients, field engineers, and managers to estimate systems, track installations, and manage solar operations.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button className="inline-flex h-12 items-center gap-2 rounded-md bg-white px-5 text-sm font-bold text-ink shadow-soft" onClick={onRegister}>
              <UserPlus size={18} /> Register account
            </button>
            <button className="inline-flex h-12 items-center gap-2 rounded-md border border-white/25 px-5 text-sm font-bold text-white hover:bg-white/10" onClick={onLogin}>
              Login <ArrowRight size={18} />
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-white/20 bg-white/10 p-4 shadow-soft backdrop-blur-xl">
          <div className="mb-4 flex items-center gap-3 text-white">
            <Building2 />
            <h2 className="text-xl font-semibold">Choose your portal</h2>
          </div>
          <div className="grid gap-3">
            {roleCards.map((card) => {
              const Icon = card.icon;
              const active = selectedRole === card.role;
              return (
                <button
                  key={card.role}
                  className={`group rounded-md border p-4 text-left transition ${
                    active ? 'border-white bg-white text-ink' : 'border-white/15 bg-white/10 text-white hover:bg-white/15'
                  }`}
                  onClick={() => onRoleChange(card.role)}
                >
                  <div className="flex items-center gap-3">
                    <span className={`flex h-11 w-11 items-center justify-center rounded-md bg-gradient-to-br ${card.accent} text-white`}>
                      <Icon size={20} />
                    </span>
                    <div>
                      <p className="font-bold">{card.label}</p>
                      <p className={`mt-1 text-sm ${active ? 'text-slate-500' : 'text-white/65'}`}>{card.title}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </motion.section>
  );
}

function AuthForm({
  mode,
  selectedRole,
  onRoleChange,
  onBack,
  onSwitchMode,
  onAuthenticated
}: {
  mode: 'login' | 'register';
  selectedRole: Role;
  onRoleChange: (role: Role) => void;
  onBack: () => void;
  onSwitchMode: () => void;
  onAuthenticated: (user: AuthUser) => void;
}) {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const currentRole = useMemo(() => roleCards.find((card) => card.role === selectedRole) ?? roleCards[0], [selectedRole]);
  const CurrentRoleIcon = currentRole.icon;

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setMessage('');
    const users = getStoredUsers();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || password.length < 8) {
      setMessage('Use a valid email and at least 8 password characters.');
      return;
    }

    if (mode === 'register') {
      if (!name.trim() || !company.trim()) {
        setMessage('Name and company are required for registration.');
        return;
      }

      if (users.some((user) => user.email === normalizedEmail && user.role === selectedRole)) {
        setMessage(`${roleLabel(selectedRole)} account already exists. Please login.`);
        return;
      }

      const user: StoredUser = {
        id: crypto.randomUUID(),
        name: name.trim(),
        company: company.trim(),
        email: normalizedEmail,
        password,
        role: selectedRole
      };
      saveStoredUsers([...users, user]);
      const { password: _password, ...session } = user;
      onAuthenticated(session);
      return;
    }

    const match = users.find((user) => user.email === normalizedEmail && user.password === password && user.role === selectedRole);
    if (!match) {
      setMessage(`No registered ${roleLabel(selectedRole)} account found for these credentials.`);
      return;
    }

    const { password: _password, ...session } = match;
    onAuthenticated(session);
  }

  return (
    <motion.section
      className="relative z-10 flex min-h-screen items-center justify-center px-4 py-24 sm:px-6 lg:px-8"
      initial={{ opacity: 0, scale: 0.98, y: 24 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, y: -24 }}
      transition={{ type: 'spring', stiffness: 180, damping: 22 }}
    >
      <div className="grid w-full max-w-6xl overflow-hidden rounded-lg border border-white/20 bg-white/10 shadow-soft backdrop-blur-xl lg:grid-cols-[0.95fr_1.05fr]">
        <div className="hidden bg-white/10 p-8 text-white lg:block">
          <div className={`flex h-16 w-16 items-center justify-center rounded-lg bg-gradient-to-br ${currentRole.accent}`}>
            <CurrentRoleIcon size={28} />
          </div>
          <h2 className="mt-8 text-4xl font-semibold">{mode === 'register' ? 'Create secure access' : 'Welcome back'}</h2>
          <p className="mt-4 leading-7 text-white/70">{currentRole.title}</p>
          <div className="mt-10 space-y-3">
            {['Separate role access', 'Protected profile pages', 'Animated solar workspace'].map((item) => (
              <div key={item} className="flex items-center gap-3 rounded-md bg-white/10 p-3">
                <BadgeCheck className="text-emerald-300" size={18} />
                <span className="text-sm font-semibold">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <form className="bg-white p-5 sm:p-8" onSubmit={submit}>
          <button type="button" className="text-sm font-bold text-slate-500 hover:text-ink" onClick={onBack}>
            Back to home
          </button>
          <h2 className="mt-6 text-3xl font-semibold text-ink">{mode === 'register' ? 'Register' : 'Login'}</h2>
          <p className="mt-2 text-sm text-slate-500">
            {mode === 'register' ? 'Admin accounts are created by system owners only.' : 'Select the exact portal role for this account.'}
          </p>

          <div className="mt-6 grid gap-2 sm:grid-cols-3">
            {(mode === 'register' ? registerRoleCards : roleCards).map((card) => (
              <button
                key={card.role}
                type="button"
                className={`h-12 rounded-md border px-3 text-sm font-bold ${selectedRole === card.role ? 'border-solar bg-teal-50 text-solar' : 'border-slate-200 text-slate-600'}`}
                onClick={() => onRoleChange(card.role)}
              >
                {card.label}
              </button>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            {mode === 'register' && (
              <>
                <TextInput label="Full name" value={name} onChange={setName} icon={<Users size={18} />} />
                <TextInput label="Company or site name" value={company} onChange={setCompany} icon={<Building2 size={18} />} />
              </>
            )}
            <TextInput label="Email address" value={email} onChange={setEmail} icon={<Mail size={18} />} type="email" />
            <label className="block">
              <span className="text-sm font-bold text-slate-600">Password</span>
              <div className="mt-2 flex h-12 items-center gap-2 rounded-md border border-slate-200 px-3 focus-within:border-solar">
                <LockKeyhole className="text-slate-400" size={18} />
                <input
                  className="h-full w-full outline-none"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button type="button" className="text-slate-400" onClick={() => setShowPassword((value) => !value)}>
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </label>
          </div>

          {message && <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800">{message}</div>}

          <button className="mt-6 inline-flex h-12 w-full items-center justify-center gap-2 rounded-md bg-ink text-sm font-bold text-white">
            {mode === 'register' ? 'Create account' : 'Open profile'} <ArrowRight size={18} />
          </button>
          <button type="button" className="mt-4 text-sm font-bold text-solar" onClick={onSwitchMode}>
            {mode === 'register' ? 'Already registered? Login' : 'Need an account? Register first'}
          </button>
        </form>
      </div>
    </motion.section>
  );
}

function TextInput({
  label,
  value,
  onChange,
  icon,
  type = 'text'
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  icon: React.ReactNode;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-bold text-slate-600">{label}</span>
      <div className="mt-2 flex h-12 items-center gap-2 rounded-md border border-slate-200 px-3 focus-within:border-solar">
        <span className="text-slate-400">{icon}</span>
        <input className="h-full w-full outline-none" type={type} value={value} onChange={(event) => onChange(event.target.value)} />
      </div>
    </label>
  );
}

function TopBar({
  theme,
  onThemeToggle,
  children
}: {
  theme: ThemeMode;
  onThemeToggle: () => void;
  children?: React.ReactNode;
}) {
  return (
    <header className="fixed left-0 right-0 top-0 z-30 border-b border-white/10 bg-slate-950/45 px-4 py-3 backdrop-blur-xl sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-white text-solar">
            <Zap size={20} />
          </div>
          {children ?? <p className="truncate text-sm font-bold uppercase tracking-[0.16em] text-white">Khan's Solar System</p>}
        </div>
        <button className="flex h-10 w-10 items-center justify-center rounded-md border border-white/20 text-white hover:bg-white/10" onClick={onThemeToggle}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}

function AnimatedPage({ theme, children }: { theme: ThemeMode; children: React.ReactNode }) {
  return (
    <main className={`solar-shell ${theme === 'dark' ? 'solar-shell-dark' : 'solar-shell-light'}`}>
      <div className="solar-grid" />
      <div className="solar-beam solar-beam-one" />
      <div className="solar-beam solar-beam-two" />
      <div className="solar-pulse solar-pulse-one" />
      <div className="solar-pulse solar-pulse-two" />
      {children}
    </main>
  );
}

function getStoredUsers() {
  try {
    const users = JSON.parse(localStorage.getItem(storageKey) ?? '[]') as StoredUser[];
    if (!users.some((user) => user.role === 'admin' && user.email === defaultAdmin.email)) {
      return [defaultAdmin, ...users];
    }
    return users;
  } catch {
    return [defaultAdmin];
  }
}

function saveStoredUsers(users: StoredUser[]) {
  localStorage.setItem(storageKey, JSON.stringify(users));
}

export function roleLabel(role: Role) {
  if (role === 'engineer') return 'Field Engineering';
  if (role === 'admin') return 'Admin';
  return 'Client';
}
