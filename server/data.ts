export const pipelinePhases = [
  'Lead / Simulation Generated',
  'Site Inspection & Structural Verification',
  'Material Allocation & Hardware Procurement',
  'On-Site Installation & Electrical Wiring',
  'Net-Metering Integration & Final Testing'
] as const;

export const projects = [
  {
    id: 'KSS-1042',
    clientName: 'Naveed Textiles',
    address: 'Korangi Industrial Area',
    phase: pipelinePhases[0],
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
    phase: pipelinePhases[1],
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
    phase: pipelinePhases[2],
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
    phase: pipelinePhases[3],
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
    phase: pipelinePhases[4],
    systemSizeKw: 18,
    assignedTo: 'F. Ahmed',
    value: 1420000,
    progress: 91,
    priority: 'Standard',
    dueDate: '2026-07-22',
    materialsReady: 100
  }
];
