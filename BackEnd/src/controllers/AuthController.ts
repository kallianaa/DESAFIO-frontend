import bcrypt from 'bcryptjs';
import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import Database from '../config/database';
import { AuthResponse, CreateUsuarioRequest, LoginRequest } from '../types';

class AuthController {
  private db = Database.getInstance().getConnection();

  public register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { nome, email, senha, roles, siape, ra }: CreateUsuarioRequest = req.body;

      if (!nome || !email || !senha || !roles || roles.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Nome, email, senha e roles são obrigatórios'
        });
        return;
      }

      const hasProfessorRole = roles.includes(2);
      const hasAlunoRole = roles.includes(3);

      if (hasProfessorRole && !siape) {
        res.status(400).json({
          success: false,
          error: 'SIAPE é obrigatório para usuários com role PROFESSOR'
        });
        return;
      }

      if (hasAlunoRole && !ra) {
        res.status(400).json({
          success: false,
          error: 'RA é obrigatório para usuários com role ALUNO'
        });
        return;
      }

      const [existingUser] = await this.db.execute(
        'SELECT id FROM Usuario WHERE email = ?',
        [email]
      );

      if (Array.isArray(existingUser) && existingUser.length > 0) {
        res.status(409).json({
          success: false,
          error: 'Email já está em uso'
        });
        return;
      }

      if (hasProfessorRole && siape) {
        const [existingSiape] = await this.db.execute(
          'SELECT id FROM Professor WHERE siape = ?',
          [siape]
        );

        if (Array.isArray(existingSiape) && existingSiape.length > 0) {
          res.status(409).json({
            success: false,
            error: 'SIAPE já está em uso'
          });
          return;
        }
      }

      if (hasAlunoRole && ra) {
        const [existingRa] = await this.db.execute(
          'SELECT id FROM Aluno WHERE ra = ?',
          [ra]
        );

        if (Array.isArray(existingRa) && existingRa.length > 0) {
          res.status(409).json({
            success: false,
            error: 'RA já está em uso'
          });
          return;
        }
      }

      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(senha, saltRounds);

      const userId = uuidv4();
      await this.db.execute(
        'INSERT INTO Usuario (id, nome, email, senha_hash) VALUES (?, ?, ?, ?)',
        [userId, nome, email, hashedPassword]
      );

      for (const roleId of roles) {
        await this.db.execute(
          'INSERT INTO UsuarioRole (usuario_id, role_id) VALUES (?, ?)',
          [userId, roleId]
        );
      }

      if (hasProfessorRole && siape) {
        await this.db.execute(
          'INSERT INTO Professor (id, siape) VALUES (?, ?)',
          [userId, siape]
        );
      }

      if (hasAlunoRole && ra) {
        await this.db.execute(
          'INSERT INTO Aluno (id, ra) VALUES (?, ?)',
          [userId, ra]
        );
      }

      const [userResult] = await this.db.execute(`
        SELECT u.id, u.nome, u.email, GROUP_CONCAT(r.nome) as roles
        FROM Usuario u
        LEFT JOIN UsuarioRole ur ON u.id = ur.usuario_id
        LEFT JOIN Role r ON ur.role_id = r.id
        WHERE u.id = ?
        GROUP BY u.id
      `, [userId]);

      const userData = Array.isArray(userResult) ? userResult[0] : null;

      if (userData) {
        if (hasProfessorRole && siape) {
          (userData as any).siape = siape;
        }
        if (hasAlunoRole && ra) {
          (userData as any).ra = ra;
        }
      }

      res.status(201).json({
        success: true,
        data: userData,
        message: 'Usuário criado com sucesso'
      });

    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };

  public login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, senha }: LoginRequest = req.body;

      if (!email || !senha) {
        res.status(400).json({
          success: false,
          error: 'Email e senha são obrigatórios'
        });
        return;
      }

      const [userResult] = await this.db.execute(`
        SELECT 
          u.id, 
          u.nome, 
          u.email, 
          u.senha_hash,
          GROUP_CONCAT(r.nome) as roles
        FROM Usuario u
        LEFT JOIN UsuarioRole ur ON u.id = ur.usuario_id
        LEFT JOIN Role r ON ur.role_id = r.id
        WHERE u.email = ?
        GROUP BY u.id, u.nome, u.email, u.senha_hash
      `, [email]);

      if (!Array.isArray(userResult) || userResult.length === 0) {
        res.status(401).json({
          success: false,
          error: 'Credenciais inválidas'
        });
        return;
      }

      const user = userResult[0] as any;

      const isValidPassword = await bcrypt.compare(senha, user.senha_hash);
      if (!isValidPassword) {
        res.status(401).json({
          success: false,
          error: 'Credenciais inválidas'
        });
        return;
      }

      const userRoles = user.roles ? user.roles.split(',') : [];
      const tokenPayload = {
        user: {
          id: user.id,
          nome: user.nome,
          email: user.email,
          roles: userRoles
        }
      };

      const secret = process.env.JWT_SECRET || 'default-secret';
      const token = jwt.sign(
        tokenPayload,
        secret,
        { expiresIn: '7d' }
      );

      const response: AuthResponse = {
        success: true,
        token,
        usuario: tokenPayload.user
      };

      res.json(response);

    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  };

  public validate = async (req: Request, res: Response): Promise<void> => {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader && authHeader.split(' ')[1];

      if (!token) {
        res.status(401).json({
          success: false,
          error: 'Token não fornecido'
        });
        return;
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;

      res.json({
        success: true,
        usuario: decoded.user,
        message: 'Token válido'
      });

    } catch (error) {
      res.status(401).json({
        success: false,
        error: 'Token inválido'
      });
    }
  };
}

export default new AuthController();
