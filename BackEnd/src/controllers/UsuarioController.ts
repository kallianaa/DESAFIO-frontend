import { Response } from 'express';
import Database from '../config/database';
import { AuthRequest } from '../middleware/auth';

class UsuarioController {
  private db = Database.getInstance().getConnection();

  public getAll = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const [users] = await this.db.execute(`
        SELECT 
          u.id,
          u.nome,
          u.email,
          GROUP_CONCAT(r.nome ORDER BY r.nome SEPARATOR ', ') as roles
        FROM Usuario u
        LEFT JOIN UsuarioRole ur ON u.id = ur.usuario_id
        LEFT JOIN Role r ON ur.role_id = r.id
        GROUP BY u.id, u.nome, u.email
        ORDER BY u.nome
      `);

      res.json({
        success: true,
        data: users,
        count: Array.isArray(users) ? users.length : 0
      });
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar usuários'
      });
    }
  };

  public getById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (req.user?.roles?.includes('ADMIN') === false && req.user?.id !== id) {
        res.status(403).json({
          success: false,
          error: 'Acesso negado'
        });
        return;
      }

      const [userResult] = await this.db.execute(`
        SELECT 
          u.id,
          u.nome,
          u.email,
          GROUP_CONCAT(r.nome ORDER BY r.nome SEPARATOR ', ') as roles
        FROM Usuario u
        LEFT JOIN UsuarioRole ur ON u.id = ur.usuario_id
        LEFT JOIN Role r ON ur.role_id = r.id
        WHERE u.id = ?
        GROUP BY u.id, u.nome, u.email
      `, [id]);

      if (!Array.isArray(userResult) || userResult.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
        return;
      }

      res.json({
        success: true,
        data: userResult[0]
      });
    } catch (error) {
      console.error('Error fetching user:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar usuário'
      });
    }
  };

  public update = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { nome, email } = req.body;

      if (req.user?.roles?.includes('ADMIN') === false && req.user?.id !== id) {
        res.status(403).json({
          success: false,
          error: 'Acesso negado'
        });
        return;
      }

      const [existingUser] = await this.db.execute(
        'SELECT id FROM Usuario WHERE id = ?',
        [id]
      );

      if (!Array.isArray(existingUser) || existingUser.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
        return;
      }

      const updates: string[] = [];
      const values: any[] = [];

      if (nome) {
        updates.push('nome = ?');
        values.push(nome);
      }
      if (email) {
        updates.push('email = ?');
        values.push(email);
      }

      if (updates.length === 0) {
        res.status(400).json({
          success: false,
          error: 'Nenhum campo para atualizar fornecido'
        });
        return;
      }

      values.push(id);

      await this.db.execute(
        `UPDATE Usuario SET ${updates.join(', ')} WHERE id = ?`,
        values
      );

      const [updatedUser] = await this.db.execute(`
        SELECT 
          u.id,
          u.nome,
          u.email,
          GROUP_CONCAT(r.nome ORDER BY r.nome SEPARATOR ', ') as roles
        FROM Usuario u
        LEFT JOIN UsuarioRole ur ON u.id = ur.usuario_id
        LEFT JOIN Role r ON ur.role_id = r.id
        WHERE u.id = ?
        GROUP BY u.id, u.nome, u.email
      `, [id]);

      res.json({
        success: true,
        data: Array.isArray(updatedUser) ? updatedUser[0] : null,
        message: 'Usuário atualizado com sucesso'
      });
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao atualizar usuário'
      });
    }
  };

  public delete = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const [existingUser] = await this.db.execute(`
        SELECT 
          u.id,
          u.nome,
          u.email,
          GROUP_CONCAT(r.nome ORDER BY r.nome SEPARATOR ', ') as roles
        FROM Usuario u
        LEFT JOIN UsuarioRole ur ON u.id = ur.usuario_id
        LEFT JOIN Role r ON ur.role_id = r.id
        WHERE u.id = ?
        GROUP BY u.id, u.nome, u.email
      `, [id]);

      if (!Array.isArray(existingUser) || existingUser.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Usuário não encontrado'
        });
        return;
      }

      const deletedUser = existingUser[0];

      await this.db.execute('DELETE FROM Usuario WHERE id = ?', [id]);

      res.json({
        success: true,
        data: deletedUser,
        message: 'Usuário excluído com sucesso'
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao excluir usuário'
      });
    }
  };
}

export default new UsuarioController();
