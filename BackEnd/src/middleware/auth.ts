import { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
  user?: {
    id: string;
    nome: string;
    email: string;
    roles: string[];
  };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Token de acesso requerido'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;
    req.user = decoded.user;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      error: 'Token inválido'
    });
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuário não autenticado'
      });
    }

    const userRoles = req.user.roles;
    const hasRole = roles.some(role => userRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        error: 'Acesso negado. Permissões insuficientes.'
      });
    }

    next();
  };
};

export const requireAdmin = requireRole('ADMIN');
export const requireProfessor = requireRole('PROFESSOR', 'ADMIN');
export const requireAluno = requireRole('ALUNO', 'PROFESSOR', 'ADMIN');

export { AuthRequest };
