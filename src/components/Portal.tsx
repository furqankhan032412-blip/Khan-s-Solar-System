import { motion } from 'framer-motion';
import type React from 'react';
import { BarChart3, Boxes, CalendarCheck, FileDown, HardHat, ImageUp, KeyRound, ShieldCheck, Users } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { pipelinePhases, projects } from '../data/demo';
import type { AuthUser, Project, Role } from '../types';

const roleTabs: { role: Role; label: string }[] = [
  { role: 'client', label: 'Client' },
  { role: 'engineer', label: 'Field Engineering' },
  { role: 'admin', label: 'Admin' }
];

export function Portal({
  activeRole,
  onRoleChange,
  currentUser
}: {
  activeRole: Role;
  onRoleChange?: (role: Role) => void;
  currentUser?: AuthUser;
}) {
  return (
    <section className="min-h-[720px] bg-white px-5 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-solar">Secure portal</p>
            <h2 className="mt-2 text-3xl font-semibold text-ink">{roleTitle(activeRole)} profile</h2>
          </div>
          {onRoleChange && (
            <div className="inline-flex rounded-md border border-slate-200 bg-slate-50 p-1">
              {roleTabs.map((tab) => (
                <button
                  key={tab.role}
                  className={`h-10 rounded px-3 text-sm font-semibold ${activeRole === tab.role ? 'bg-ink text-white' : 'text-slate-600'}`}
                  onClick={() => onRoleChange(tab.role)}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <motion.div
          key={activeRole}
          className="mt-7 grid gap-5 xl:grid-cols-[300px_1fr]"
          initial={{ y: 18, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
        >
          <SessionCard activeRole={activeRole} currentUser={currentUser} />
          <div>
            {activeRole === 'client' && <ClientView />}
            {activeRole === 'engineer' && <EngineerView />}
            {activeRole === 'admin' && <AdminView />}
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export function PipelineTracker() {
  return (
    <section className="min-h-[720px] bg-[#f5f7f4] px-5 py-10 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-7 flex items-center gap-3">
          <CalendarCheck className="text-solar" />
          <h2 className="text-3xl font-semibold text-ink">Structural project pipeline</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-5">
          {pipelinePhases.map((phase) => (
            <div key={phase} className="min-h-72 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
              <div className="flex min-h-12 items-start justify-between gap-3">
                <h3 className="text-sm font-bold text-ink">{phase}</h3>
                <span className="rounded bg-slate-100 px-2 py-1 text-xs font-bold text-slate-500">
                  {projects.filter((project) => project.phase === phase).length}
                </span>
              </div>
              <div className="mt-3 space-y-3">
                {projects.filter((project) => project.phase === phase).map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ClientView() {
  const steps = ['Contract signed', 'Site inspection', 'Material staged', 'Installation', 'Net-metering approval'];
  const project = projects[1];

  return (
    <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <Panel title="Installation timeline" icon={<ShieldCheck />}>
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center gap-3">
              <span className={`h-9 w-9 rounded-full text-center text-sm font-bold leading-9 ${index < 3 ? 'bg-solar text-white' : 'bg-slate-100 text-slate-500'}`}>
                {index + 1}
              </span>
              <div>
                <p className="font-semibold text-ink">{step}</p>
                <p className="text-sm text-slate-500">{index < 3 ? 'Completed' : 'Pending'}</p>
              </div>
            </div>
          ))}
        </div>
      </Panel>
      <Panel title="Documents and approvals" icon={<FileDown />}>
        <div className="mb-4 rounded-md bg-slate-50 p-3">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">Active file</p>
          <p className="mt-1 font-semibold text-ink">{project.clientName}</p>
          <p className="text-sm text-slate-500">{project.progress}% complete - Due {project.dueDate}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {['Invoice', 'Load design', 'Net-metering file'].map((item) => (
            <button key={item} className="rounded-md border border-slate-200 p-4 text-left font-semibold text-ink">
              <FileDown className="mb-4 text-solar" size={20} />
              {item}
            </button>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function EngineerView() {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <Panel title="Structural inputs" icon={<HardHat />}>
        <div className="space-y-3">
          {['Roof pitch', 'Beam spacing', 'Wind exposure', 'Shading notes'].map((field) => (
            <label key={field} className="block">
              <span className="text-sm font-semibold text-slate-600">{field}</span>
              <input className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 outline-none focus:border-solar" />
            </label>
          ))}
        </div>
      </Panel>
      <Panel title="Hardware selection" icon={<Boxes />}>
        <div className="space-y-3">
          {['550W mono PERC panel', '10kW hybrid inverter', 'Flush rail kit', 'Lithium battery bank'].map((item) => (
            <label key={item} className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-3 text-sm font-semibold text-ink">
              {item}
              <input type="checkbox" className="h-4 w-4 accent-solar" defaultChecked />
            </label>
          ))}
          <label className="block">
            <span className="text-sm font-semibold text-slate-600">Inverter capacity</span>
            <select className="mt-1 h-10 w-full rounded-md border border-slate-200 px-3 outline-none focus:border-solar">
              <option>10kW hybrid</option>
              <option>12kW hybrid</option>
              <option>15kW hybrid</option>
              <option>25kW three-phase</option>
            </select>
          </label>
        </div>
      </Panel>
      <Panel title="Inspection media" icon={<ImageUp />}>
        <label className="flex min-h-64 items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 text-center">
          <div>
            <ImageUp className="mx-auto text-solar" />
            <p className="mt-3 text-sm font-semibold text-ink">Upload roof photos</p>
            <p className="mt-1 text-xs text-slate-500">Server limit: 8MB per image</p>
            <input className="sr-only" type="file" accept="image/*" multiple />
          </div>
        </label>
      </Panel>
    </div>
  );
}

function AdminView() {
  const revenue = projects.reduce((sum, project) => sum + project.value, 0);
  const chartData = pipelinePhases.map((phase) => ({
    phase: phase.split(' ')[0],
    projects: projects.filter((project) => project.phase === phase).length
  }));

  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-4">
        <Stat title="Active projects" value={String(projects.length)} icon={<Users />} />
        <Stat title="Inventory panels" value="1,240" icon={<Boxes />} />
        <Stat title="Revenue" value={`Rs ${Math.round(revenue / 100000).toLocaleString()}L`} icon={<BarChart3 />} />
        <Stat title="Assigned crews" value="8" icon={<HardHat />} />
      </div>
      <Panel title="Pipeline load" icon={<BarChart3 />}>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="phase" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="projects" fill="#0f766e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>
    </div>
  );
}

function SessionCard({ activeRole, currentUser }: { activeRole: Role; currentUser?: AuthUser }) {
  const fallbackProfile = {
    client: { name: 'Demo Client', email: 'client@khanssolar.test' },
    engineer: { name: 'Field Engineer', email: 'engineer@khanssolar.test' },
    admin: { name: 'Ops Manager', email: 'admin@khanssolar.test' }
  }[activeRole];
  const profile = currentUser ?? { ...fallbackProfile, company: 'Khan Solar Demo', id: 'demo', role: activeRole };

  return (
    <Panel title="Access profile" icon={<KeyRound />}>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-semibold text-ink">{profile.name}</p>
          <p className="text-sm text-slate-500">{profile.email}</p>
          <p className="mt-1 text-sm text-slate-500">{profile.company}</p>
        </div>
        <div className="rounded-md bg-emerald-50 p-3 text-sm font-semibold text-solar">Protected session active - RBAC: {activeRole}</div>
        <div className="grid grid-cols-2 gap-3">
          <AccessPill allowed={activeRole === 'client' || activeRole === 'admin'} label="Client files" />
          <AccessPill allowed={activeRole === 'engineer' || activeRole === 'admin'} label="Site tools" />
          <AccessPill allowed={activeRole === 'admin'} label="Revenue" />
          <AccessPill allowed={activeRole === 'admin'} label="Assignments" />
        </div>
      </div>
    </Panel>
  );
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-5 flex items-center gap-3 text-ink">
        <span className="text-solar">{icon}</span>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function Stat({ title, value, icon }: { title: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between text-solar">{icon}</div>
      <p className="mt-6 text-sm font-bold uppercase tracking-[0.14em] text-slate-500">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-ink">{value}</p>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="rounded-md border border-slate-200 bg-slate-50 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">{project.id}</p>
        <span className={`rounded px-2 py-1 text-[11px] font-bold ${priorityClass(project.priority)}`}>{project.priority}</span>
      </div>
      <h4 className="mt-1 font-semibold text-ink">{project.clientName}</h4>
      <p className="mt-1 text-sm text-slate-500">{project.address}</p>
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="font-semibold text-solar">{project.systemSizeKw} kW</span>
        <span className="text-slate-500">{project.assignedTo}</span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-slate-200">
        <div className="h-2 rounded-full bg-solar" style={{ width: `${project.progress}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs font-semibold text-slate-500">
        <span>{project.progress}%</span>
        <span>{project.materialsReady}% stock</span>
      </div>
      <p className="mt-2 text-xs font-semibold text-slate-500">Due {project.dueDate}</p>
    </article>
  );
}

function AccessPill({ allowed, label }: { allowed: boolean; label: string }) {
  return (
    <span className={`rounded-md px-2 py-2 text-center text-xs font-bold ${allowed ? 'bg-teal-50 text-solar' : 'bg-slate-100 text-slate-400'}`}>
      {label}
    </span>
  );
}

function priorityClass(priority: Project['priority']) {
  if (priority === 'Critical') return 'bg-rose-100 text-rose-700';
  if (priority === 'High') return 'bg-amber-100 text-amber-700';
  return 'bg-slate-200 text-slate-600';
}

function roleTitle(role: Role) {
  if (role === 'engineer') return 'Field Engineering';
  if (role === 'admin') return 'Admin';
  return 'Client';
}
