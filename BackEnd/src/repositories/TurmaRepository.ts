import { Pool, RowDataPacket } from 'mysql2/promise';
import Database from '../config/database';

export class TurmaRepository {
  private db: Pool;

  constructor() {
    this.db = Database.getInstance().getConnection();
  }

  async findAll(filters?: { disciplinaId?: number; professorId?: number; semestre?: number; ano?: number }): Promise<any[]> {
    let query = `
      SELECT 
        t.id,
        t.disciplina_id,
        d.nome as disciplina_nome,
        d.codigo as disciplina_codigo,
        t.professor_id,
        u.nome as professor_nome,
        t.semestre,
        t.ano,
        t.horario,
        t.sala,
        t.vagas_totais,
        t.vagas_disponiveis,
        COUNT(m.id) as total_alunos
      FROM Turma t
      INNER JOIN Disciplina d ON t.disciplina_id = d.id
      INNER JOIN Professor p ON t.professor_id = p.id
      INNER JOIN Usuario u ON p.usuario_id = u.id
      LEFT JOIN Matricula m ON t.id = m.turma_id
    `;

    const conditions: string[] = [];
    const values: any[] = [];

    if (filters?.disciplinaId) {
      conditions.push('t.disciplina_id = ?');
      values.push(filters.disciplinaId);
    }
    if (filters?.professorId) {
      conditions.push('t.professor_id = ?');
      values.push(filters.professorId);
    }
    if (filters?.semestre) {
      conditions.push('t.semestre = ?');
      values.push(filters.semestre);
    }
    if (filters?.ano) {
      conditions.push('t.ano = ?');
      values.push(filters.ano);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY t.id, t.disciplina_id, d.nome, d.codigo, t.professor_id, u.nome, t.semestre, t.ano, t.horario, t.sala, t.vagas_totais, t.vagas_disponiveis';
    query += ' ORDER BY t.ano DESC, t.semestre DESC';

    const [turmas] = await this.db.execute<RowDataPacket[]>(query, values);
    return turmas;
  }

  async findById(id: number): Promise<any | null> {
    const [turmaResult] = await this.db.execute<RowDataPacket[]>(`
      SELECT 
        t.id,
        t.disciplina_id,
        d.nome as disciplina_nome,
        d.codigo as disciplina_codigo,
        t.professor_id,
        u.nome as professor_nome,
        t.semestre,
        t.ano,
        t.horario,
        t.sala,
        t.vagas_totais,
        t.vagas_disponiveis
      FROM Turma t
      INNER JOIN Disciplina d ON t.disciplina_id = d.id
      INNER JOIN Professor p ON t.professor_id = p.id
      INNER JOIN Usuario u ON p.usuario_id = u.id
      WHERE t.id = ?
    `, [id]);

    return turmaResult.length > 0 ? turmaResult[0] : null;
  }

  async getAlunos(turmaId: number): Promise<any[]> {
    const [alunos] = await this.db.execute<RowDataPacket[]>(`
      SELECT 
        a.id,
        u.nome,
        u.email,
        a.matricula,
        a.curso,
        m.data_matricula,
        m.nota_final,
        m.situacao
      FROM Matricula m
      INNER JOIN Aluno a ON m.aluno_id = a.id
      INNER JOIN Usuario u ON a.usuario_id = u.id
      WHERE m.turma_id = ?
      ORDER BY u.nome
    `, [turmaId]);
    return alunos;
  }
}

export default new TurmaRepository();
