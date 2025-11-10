import { Pool, RowDataPacket } from 'mysql2/promise';
import Database from '../config/database';

export class UsuarioRepository {
  private db: Pool;

  constructor() {
    this.db = Database.getInstance().getConnection();
  }

  async findAll(): Promise<any[]> {
    const [users] = await this.db.execute<RowDataPacket[]>(`
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
    return users;
  }

  async findById(id: string): Promise<any | null> {
    const [userResult] = await this.db.execute<RowDataPacket[]>(`
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

    return userResult.length > 0 ? userResult[0] : null;
  }

  async findByEmail(email: string): Promise<any | null> {
    const [userResult] = await this.db.execute<RowDataPacket[]>(`
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

    return userResult.length > 0 ? userResult[0] : null;
  }

  async create(id: string, nome: string, email: string, senhaHash: string): Promise<void> {
    await this.db.execute(
      'INSERT INTO Usuario (id, nome, email, senha_hash) VALUES (?, ?, ?, ?)',
      [id, nome, email, senhaHash]
    );
  }

  async update(id: string, updates: { nome?: string; email?: string }): Promise<void> {
    const updateFields: string[] = [];
    const values: any[] = [];

    if (updates.nome) {
      updateFields.push('nome = ?');
      values.push(updates.nome);
    }
    if (updates.email) {
      updateFields.push('email = ?');
      values.push(updates.email);
    }

    if (updateFields.length > 0) {
      values.push(id);
      await this.db.execute(
        `UPDATE Usuario SET ${updateFields.join(', ')} WHERE id = ?`,
        values
      );
    }
  }

  async delete(id: string): Promise<void> {
    await this.db.execute('DELETE FROM Usuario WHERE id = ?', [id]);
  }

  async assignRole(usuarioId: string, roleId: number): Promise<void> {
    await this.db.execute(
      'INSERT INTO UsuarioRole (usuario_id, role_id) VALUES (?, ?)',
      [usuarioId, roleId]
    );
  }

  async exists(id: string): Promise<boolean> {
    const [result] = await this.db.execute<RowDataPacket[]>(
      'SELECT id FROM Usuario WHERE id = ?',
      [id]
    );
    return result.length > 0;
  }

  async emailExists(email: string): Promise<boolean> {
    const [result] = await this.db.execute<RowDataPacket[]>(
      'SELECT id FROM Usuario WHERE email = ?',
      [email]
    );
    return result.length > 0;
  }
}

export default new UsuarioRepository();
