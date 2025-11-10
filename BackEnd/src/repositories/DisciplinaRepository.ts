import { Pool, RowDataPacket } from 'mysql2/promise';
import Database from '../config/database';

export class DisciplinaRepository {
  private db: Pool;

  constructor() {
    this.db = Database.getInstance().getConnection();
  }

  async findAll(): Promise<any[]> {
    const [disciplines] = await this.db.execute<RowDataPacket[]>(`
      SELECT 
        d.id,
        d.nome,
        d.codigo,
        d.carga_horaria,
        d.descricao
      FROM Disciplina d
      ORDER BY d.nome
    `);
    return disciplines;
  }

  async findById(id: number): Promise<any | null> {
    const [disciplineResult] = await this.db.execute<RowDataPacket[]>(`
      SELECT 
        d.id,
        d.nome,
        d.codigo,
        d.carga_horaria,
        d.descricao
      FROM Disciplina d
      WHERE d.id = ?
    `, [id]);

    return disciplineResult.length > 0 ? disciplineResult[0] : null;
  }

  async getTurmas(disciplinaId: number): Promise<any[]> {
    const [turmas] = await this.db.execute<RowDataPacket[]>(`
      SELECT 
        t.id,
        t.semestre,
        t.ano,
        t.horario,
        t.sala,
        t.vagas_totais,
        t.vagas_disponiveis,
        p.id as professor_id,
        u.nome as professor_nome
      FROM Turma t
      INNER JOIN Professor p ON t.professor_id = p.id
      INNER JOIN Usuario u ON p.usuario_id = u.id
      WHERE t.disciplina_id = ?
      ORDER BY t.ano DESC, t.semestre DESC
    `, [disciplinaId]);
    return turmas;
  }
}

export default new DisciplinaRepository();
