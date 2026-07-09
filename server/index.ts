import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import multer from 'multer';
import { z } from 'zod';
import { login, requireAuth, requireRole, type AuthenticatedRequest } from './auth.js';
import { pipelinePhases, projects } from './data.js';
import { calculateSolarEstimate } from './solarEngine.js';

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4000);
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 8 * 1024 * 1024,
    files: 6
  },
  fileFilter: (_req, file, callback) => {
    if (!file.mimetype.startsWith('image/')) {
      callback(new Error('Only image uploads are allowed'));
      return;
    }

    callback(null, true);
  }
});

const estimateSchema = z.object({
  monthlyBillKwh: z.number().positive().max(100000),
  availableRoofAreaSqFt: z.number().positive().max(1000000),
  propertyType: z.enum(['residential', 'commercial']).optional()
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

app.use(cors());
app.use(express.json({ limit: '256kb' }));

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', service: "Khan's Solar System API" });
});

app.post('/api/estimates', (req, res) => {
  const parsed = estimateSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid estimate request', issues: parsed.error.issues });
    return;
  }

  res.json(calculateSolarEstimate(parsed.data));
});

app.post('/api/auth/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ message: 'Invalid login payload' });
    return;
  }

  const session = await login(parsed.data.email, parsed.data.password);
  if (!session) {
    res.status(401).json({ message: 'Invalid credentials' });
    return;
  }

  res.json(session);
});

app.get('/api/me', requireAuth, (req: AuthenticatedRequest, res) => {
  res.json({ user: req.user });
});

app.get('/api/client/projects', requireAuth, requireRole('client', 'admin'), (_req, res) => {
  res.json({
    timeline: ['Contract signed', 'Site inspection', 'Material staged', 'Installation', 'Net-metering approval'],
    invoices: ['INV-KSS-1045.pdf'],
    approvals: [{ name: 'Net-metering application', status: 'Pending utility review' }]
  });
});

app.get('/api/engineering/projects', requireAuth, requireRole('engineer', 'admin'), (_req, res) => {
  res.json({
    inspectionsDue: projects.filter((project) => project.phase === pipelinePhases[1]),
    hardwareOptions: ['550W mono PERC panel', '10kW hybrid inverter', 'Flush rail kit', 'Lithium battery bank']
  });
});

app.post('/api/engineering/site-media', requireAuth, requireRole('engineer', 'admin'), upload.array('photos', 6), (req, res) => {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  res.status(201).json({
    uploaded: files.map((file) => ({
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size
    }))
  });
});

app.get('/api/admin/dashboard', requireAuth, requireRole('admin'), (_req, res) => {
  const totalRevenue = projects.reduce((sum, project) => sum + project.value, 0);

  res.json({
    activePipelineCount: projects.length,
    inventory: {
      panels550w: 1240,
      hybridInverters: 37,
      railKits: 96
    },
    totalRevenue,
    projects
  });
});

app.get('/api/pipeline', requireAuth, requireRole('admin', 'engineer'), (_req, res) => {
  res.json({ phases: pipelinePhases, projects });
});

app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(400).json({ message: error.message });
});

app.listen(port, () => {
  console.log(`Khan's Solar System API listening on http://127.0.0.1:${port}`);
});
