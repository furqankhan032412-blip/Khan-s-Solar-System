import { AnimatePresence, motion } from 'framer-motion';
import type React from 'react';
import {
  AlertTriangle,
  BatteryCharging,
  Building2,
  Calculator,
  ChartArea,
  ChevronLeft,
  ChevronRight,
  Factory,
  Home,
  RotateCcw,
  Zap
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { calculateEstimate } from '../lib/solar';
import type { EstimateInput } from '../types';
import { SolarVisualizer } from './SolarVisualizer';
import { useMemo, useState } from 'react';

const stepVariants = {
  enter: { x: 48, opacity: 0 },
  center: { x: 0, opacity: 1 },
  exit: { x: -48, opacity: 0 }
};

export function EstimatorWizard() {
  const [step, setStep] = useState(0);
  const [input, setInput] = useState<EstimateInput>({
    monthlyBillKwh: 1200,
    availableRoofAreaSqFt: 720,
    propertyType: 'residential'
  });
  const estimate = useMemo(() => calculateEstimate(input), [input]);
  const resetInput = () =>
    setInput({
      monthlyBillKwh: 1200,
      availableRoofAreaSqFt: 720,
      propertyType: 'residential'
    });

  return (
    <section className="grid min-h-[720px] grid-cols-1 bg-[#f5f7f4] lg:grid-cols-[minmax(420px,0.9fr)_1.1fr]">
      <div className="flex min-h-[620px] flex-col justify-between px-5 py-6 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-solar">Khan's Solar System</p>
            <h1 className="mt-2 text-4xl font-semibold leading-tight text-ink sm:text-5xl">Solar estimator and project command center</h1>
          </div>
          <div className="hidden h-12 w-12 items-center justify-center rounded-full bg-ink text-white sm:flex">
            <Zap size={22} />
          </div>
        </div>

        <div className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white p-5 shadow-soft">
          <div className="mb-5 flex items-center gap-2">
            {[0, 1, 2].map((item) => (
              <span key={item} className={`h-1.5 flex-1 rounded-full ${item <= step ? 'bg-solar' : 'bg-slate-200'}`} />
            ))}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 260, damping: 25, mass: 0.9 }}
            >
              {step === 0 && (
                <BillStep monthlyBillKwh={input.monthlyBillKwh} onChange={(monthlyBillKwh) => setInput({ ...input, monthlyBillKwh })} />
              )}
              {step === 1 && <PropertyStep input={input} onChange={setInput} />}
              {step === 2 && <Results estimate={estimate} />}
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 flex items-center justify-between">
            <button
              className="inline-flex h-11 items-center gap-2 rounded-md border border-slate-200 px-4 text-sm font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              disabled={step === 0}
              onClick={() => setStep((value) => Math.max(0, value - 1))}
            >
              <ChevronLeft size={18} /> Back
            </button>
            <button
              className="inline-flex h-11 items-center gap-2 rounded-md bg-ink px-4 text-sm font-semibold text-white"
              onClick={() => setStep((value) => Math.min(2, value + 1))}
            >
              {step === 2 ? 'Ready' : 'Next'} <ChevronRight size={18} />
            </button>
          </div>
          {step === 2 && (
            <button className="mt-3 inline-flex h-10 items-center gap-2 text-sm font-semibold text-slate-600" onClick={resetInput}>
              <RotateCcw size={16} /> Reset estimate
            </button>
          )}
        </div>

        <QuickStats estimate={estimate} />
      </div>

      <div className="relative min-h-[460px] border-l border-slate-200">
        <SolarVisualizer panelCount={estimate.panelCount} />
        <div className="absolute bottom-5 left-5 right-5 grid gap-3 sm:grid-cols-3">
          <Metric label="System" value={`${estimate.recommendedSystemSizeKw} kW`} icon={<Calculator size={18} />} />
          <Metric label="Panels" value={`${estimate.panelCount} plates`} icon={<ChartArea size={18} />} />
          <Metric label="Payback" value={`${estimate.paybackYears} yrs`} icon={<BatteryCharging size={18} />} />
        </div>
      </div>
    </section>
  );
}

function BillStep({ monthlyBillKwh, onChange }: { monthlyBillKwh: number; onChange: (value: number) => void }) {
  return (
    <div>
      <div className="flex items-center gap-3 text-ink">
        <Calculator />
        <h2 className="text-2xl font-semibold">Monthly energy use</h2>
      </div>
      <p className="mt-2 text-sm leading-6 text-slate-600">Consumption range for residential and commercial proposals.</p>
      <label className="mt-8 block text-sm font-semibold text-slate-700">Average monthly bill in kWh</label>
      <input
        className="mt-4 w-full accent-solar"
        min={250}
        max={6500}
        step={50}
        type="range"
        value={monthlyBillKwh}
        onChange={(event) => onChange(Number(event.target.value))}
      />
      <div className="mt-3 flex items-end justify-between">
        <span className="text-sm text-slate-500">250 kWh</span>
        <strong className="text-4xl text-ink">{monthlyBillKwh.toLocaleString()} kWh</strong>
        <span className="text-sm text-slate-500">6,500 kWh</span>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <ResultLine label="Estimated monthly spend" value={formatCurrency(monthlyBillKwh * 52)} />
        <ResultLine label="Daily consumption" value={`${Math.round(monthlyBillKwh / 30).toLocaleString()} kWh`} />
      </div>
    </div>
  );
}

function PropertyStep({ input, onChange }: { input: EstimateInput; onChange: (input: EstimateInput) => void }) {
  return (
    <div>
      <div className="flex items-center gap-3 text-ink">
        <Building2 />
        <h2 className="text-2xl font-semibold">Property details</h2>
      </div>
      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        <PropertyButton
          active={input.propertyType === 'residential'}
          icon={<Home size={20} />}
          label="Residential"
          onClick={() => onChange({ ...input, propertyType: 'residential' })}
        />
        <PropertyButton
          active={input.propertyType === 'commercial'}
          icon={<Factory size={20} />}
          label="Commercial"
          onClick={() => onChange({ ...input, propertyType: 'commercial' })}
        />
      </div>
      <label className="mt-8 block text-sm font-semibold text-slate-700">Available rooftop surface area</label>
      <div className="mt-3 flex items-center gap-3">
        <input
          className="h-12 w-full rounded-md border border-slate-200 px-4 text-lg font-semibold outline-none focus:border-solar"
          min={120}
          type="number"
          value={input.availableRoofAreaSqFt}
          onChange={(event) => onChange({ ...input, availableRoofAreaSqFt: Number(event.target.value) })}
        />
        <span className="shrink-0 text-sm font-semibold text-slate-500">sq ft</span>
      </div>
    </div>
  );
}

function Results({ estimate }: { estimate: ReturnType<typeof calculateEstimate> }) {
  return (
    <div>
      <div className="flex items-center gap-3 text-ink">
        <Zap />
        <h2 className="text-2xl font-semibold">Engineering result</h2>
      </div>
      {estimate.cappedByRoofArea && (
        <div className="mt-4 flex gap-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <AlertTriangle className="shrink-0" size={18} />
          <p>The roof area caps this design. Add roof space or split the array across another surface for the full load target.</p>
        </div>
      )}
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <ResultLine label="Annual production" value={`${estimate.annualProductionKwh.toLocaleString()} kWh`} />
        <ResultLine label="Project cost" value={formatCurrency(estimate.estimatedProjectCost)} />
        <ResultLine label="Inverter" value={estimate.materials.inverter} />
        <ResultLine label="Racking" value={estimate.rackConfiguration} />
        <ResultLine label="Rails" value={`${estimate.materials.mountingRailsMeters} m`} />
        <ResultLine label="Clamps" value={`${estimate.materials.clamps}`} />
        <ResultLine label="DC cable" value={`${estimate.materials.dcCableMeters} m`} />
        <ResultLine label="Combiner boxes" value={`${estimate.materials.combinerBoxes}`} />
      </div>
      <div className="mt-5 h-48 rounded-md border border-slate-200 p-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={estimate.forecast}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="year" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={44} />
            <Tooltip formatter={(value) => formatCurrency(Number(value))} />
            <Area type="monotone" dataKey="cumulativeSavings" stroke="#0f766e" fill="#99f6e4" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function QuickStats({ estimate }: { estimate: ReturnType<typeof calculateEstimate> }) {
  return (
    <div className="mt-5 grid gap-3 sm:grid-cols-3">
      <Metric label="Roof support" value={`${estimate.roofMaxSystemSizeKw} kW`} icon={<Home size={18} />} />
      <Metric label="Inverter" value={`${estimate.inverterSizeKw} kW`} icon={<Zap size={18} />} />
      <Metric label="10 yr savings" value={formatCurrency(estimate.forecast.at(-1)?.cumulativeSavings ?? 0)} icon={<ChartArea size={18} />} />
    </div>
  );
}

function formatCurrency(value: number) {
  return `Rs ${Math.round(value).toLocaleString()}`;
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-md border border-white/70 bg-white/85 p-4 shadow-soft backdrop-blur">
      <div className="flex items-center gap-2 text-solar">{icon}<span className="text-xs font-bold uppercase tracking-[0.14em]">{label}</span></div>
      <p className="mt-2 text-xl font-semibold text-ink">{value}</p>
    </div>
  );
}

function PropertyButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button
      className={`flex h-24 items-center justify-center gap-3 rounded-md border text-sm font-semibold ${
        active ? 'border-solar bg-teal-50 text-solar' : 'border-slate-200 bg-white text-slate-600'
      }`}
      onClick={onClick}
    >
      {icon}
      {label}
    </button>
  );
}

function ResultLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-slate-50 p-3">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-semibold text-ink">{value}</p>
    </div>
  );
}
