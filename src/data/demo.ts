import type { PipelinePhase, Project } from '../types';

export const pipelinePhases: PipelinePhase[] = [
  'Lead / Simulation Generated',
  'Site Inspection & Structural Verification',
  'Material Allocation & Hardware Procurement',
  'On-Site Installation & Electrical Wiring',
  'Net-Metering Integration & Final Testing'
];

export const projects: Project[] = [
  {
    id: 'KSS-1042',
    clientName: 'Naveed Textiles',
    address: 'Korangi Industrial Area',
    phase: 'Lead / Simulation Generated',
    systemSizeKw: 28,
    assignedTo: 'A. Khan',
    value: 1840000,
    progress: 18,
    priority: 'High',
    dueDate: '2026-07-09',
    materialsReady: 22
  },
  {
    id: 'KSS-1045',
    clientName: 'Green Villas Block B',
    address: 'DHA Phase 6',
    phase: 'Site Inspection & Structural Verification',
    systemSizeKw: 12,
    assignedTo: 'S. Raza',
    value: 920000,
    progress: 36,
    priority: 'Standard',
    dueDate: '2026-07-12',
    materialsReady: 45
  },
  {
    id: 'KSS-1048',
    clientName: 'Sapphire Cold Storage',
    address: 'SITE Super Highway',
    phase: 'Material Allocation & Hardware Procurement',
    systemSizeKw: 45,
    assignedTo: 'M. Ali',
    value: 3380000,
    progress: 58,
    priority: 'Critical',
    dueDate: '2026-07-15',
    materialsReady: 82
  },
  {
    id: 'KSS-1051',
    clientName: 'Farooq Residence',
    address: 'Gulshan-e-Iqbal',
    phase: 'On-Site Installation & Electrical Wiring',
    systemSizeKw: 9,
    assignedTo: 'H. Noor',
    value: 760000,
    progress: 76,
    priority: 'High',
    dueDate: '2026-07-18',
    materialsReady: 100
  },
  {
    id: 'KSS-1053',
    clientName: 'Metro Clinic',
    address: 'Bahadurabad',
    phase: 'Net-Metering Integration & Final Testing',
    systemSizeKw: 18,
    assignedTo: 'F. Ahmed',
    value: 1420000,
    progress: 91,
    priority: 'Standard',
    dueDate: '2026-07-22',
    materialsReady: 100
  }
];
