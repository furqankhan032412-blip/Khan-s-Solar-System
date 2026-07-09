import bcrypt from 'bcryptjs';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

export type Role = 'client' | 'engineer' | 'admin';

type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: Role;
  passwordHash: string;
};

export type AuthenticatedRequest = Request & {
  user?: {
    id: string;
    name: string;
    email: string;
    role: Role;
  };
};

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-only-secret-change-me';

export const users: UserRecord[] = [
  {
    id: 'usr_client_1',
    name: 'Demo Client',
    email: 'client@khanssolar.test',
    role: 'client',
    passwordHash: bcrypt.hashSync('Solar123!', 10)
  },
  {
    id: 'usr_engineer_1',
    name: 'Field Engineer',
    email: 'engineer@khanssolar.test',
    role: 'engineer',
    passwordHash: bcrypt.hashSync('Solar123!', 10)
  },
  {
    id: 'usr_admin_1',
    name: 'Ops Manager',
    email: 'admin@khanssolar.test',
    role: 'admin',
    passwordHash: bcrypt.hashSync('Solar123!', 10)
  }
];

export async function login(email: string, password: string) {
  const user = users.find((record) => record.email === email);
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return null;
  }

  const payload = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };

  return {
    user: payload,
    token: jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' })
  };
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;

  if (!token) {
    res.status(401).json({ message: 'Missing bearer token' });
    return;
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET) as AuthenticatedRequest['user'];
    next();
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function requireRole(...roles: Role[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ message: 'Insufficient role permissions' });
      return;
    }

    next();
  };
}
