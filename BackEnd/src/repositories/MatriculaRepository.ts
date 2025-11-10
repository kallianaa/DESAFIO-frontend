import { Pool, RowDataPacket } from 'mysql2/promise';
import Database from '../config/database';

export class MatriculaRepository {
  private db: Pool;

  constructor() {
    this.db = Database.getInstance().getConnection();
  }

  async findAll(): Promise<any[]> {
    const [matriculas] = await this.db.execute<RowDataPacket[]>(`
      SELECT 
        m.id,
        m.aluno_id,
        ua.nome as aluno_nome,
        m.turma_id,
        t.semestre,
        t.ano,
        d.nome as disciplina_nome,
        d.codigo as disciplina_codigo,
        up.nome as professor_nome,
        m.data_matricula,
        m.nota_final,
        m.situacao
      FROM Matricula m
      INNER JOIN Aluno a ON m.aluno_id = a.id
      INNER JOIN Usuario ua ON a.usuario_id = ua.id
      INNER JOIN Turma t ON m.turma_id = t.id
      INNER JOIN Disciplina d ON t.disciplina_id = d.id
      INNER JOIN Professor p ON t.professor_id = p.id
      INNER JOIN Usuario up ON p.usuario_id = up.id
      ORDER BY m.data_matricula DESC
    `);
    return matriculas;
  }

  async findById(id: number): Promise<any | null> {
    const [matriculaResult] = await this.db.execute<RowDataPacket[]>(`
      SELECT 
        m.id,
        m.aluno_id,
        ua.nome as aluno_nome,
        m.turma_id,
        t.semestre,
        t.ano,
        d.nome as disciplina_nome,
        d.codigo as disciplina_codigo,
        up.nome as professor_nome,
        m.data_matricula,
        m.nota_final,
        m.situacao
      FROM Matricula m
      INNER JOIN Aluno a ON m.aluno_id = a.id
      INNER JOIN Usuario ua ON a.usuario_id = ua.id
      INNER JOIN Turma t ON m.turma_id = t.id
      INNER JOIN Disciplina d ON t.disciplina_id = d.id
      INNER JOIN Professor p ON t.professor_id = p.id
      INNER JOIN Usuario up ON p.usuario_id = up.id
      WHERE m.id = ?
    `, [id]);

    return matriculaResult.length > 0 ? matriculaResult[0] : null;
  }

  async getTurmasDisponiveis(alunoId: number): Promise<any[]> {
    const [turmas] = await this.db.execute<RowDataPacket[]>(`
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
      WHERE t.vagas_disponiveis > 0
        AND t.id NOT IN (
          SELECT turma_id FROM Matricula WHERE aluno_id = ?
        )
      GROUP BY t.id, t.disciplina_id, d.nome, d.codigo, t.professor_id, u.nome, t.semestre, t.ano, t.horario, t.sala, t.vagas_totais, t.vagas_disponiveis
      ORDER BY t.ano DESC, t.semestre DESC
    `, [alunoId]);
    return turmas;
  }

  async create(alunoId: number, turmaId: number): Promise<number> {
    const [result] = await this.db.execute<any>(
      'INSERT INTO Matricula (aluno_id, turma_id, data_matricula, situacao) VALUES (?, ?, NOW(), ?)',
      [alunoId, turmaId, 'ATIVA']
    );
    return result.insertId;
  }
}

export default new MatriculaRepository();
