import { Response } from 'express';
import Database from '../config/database';
import { AuthRequest } from '../middleware/auth';

class MatriculaController {
  private db = Database.getInstance().getConnection();

  public getAll = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { aluno_id, turma_id, status, disciplina_id } = req.query;

      let query = `
        SELECT 
          m.id,
          m.data,
          m.status,
          a.id as aluno_id,
          a.ra,
          ua.nome as aluno_nome,
          t.id as turma_id,
          t.codigo as turma_codigo,
          d.codigo as disciplina_codigo,
          d.nome as disciplina_nome,
          d.creditos,
          up.nome as professor_nome,
          t.dia,
          t.turno
        FROM Matricula m
        INNER JOIN Aluno a ON m.aluno_id = a.id
        INNER JOIN Usuario ua ON a.id = ua.id
        INNER JOIN Turma t ON m.turma_id = t.id
        INNER JOIN Disciplina d ON t.disciplina_id = d.id
        INNER JOIN Professor p ON t.professor_id = p.id
        INNER JOIN Usuario up ON p.id = up.id
      `;

      const conditions: string[] = [];
      const values: any[] = [];

      if (aluno_id) {
        conditions.push('m.aluno_id = ?');
        values.push(aluno_id);
      }

      if (turma_id) {
        conditions.push('m.turma_id = ?');
        values.push(turma_id);
      }

      if (status) {
        conditions.push('m.status = ?');
        values.push(status);
      }

      if (disciplina_id) {
        conditions.push('t.disciplina_id = ?');
        values.push(disciplina_id);
      }

      if (!req.user?.roles?.includes('ADMIN') && req.user?.roles?.includes('ALUNO')) {
        conditions.push('m.aluno_id = ?');
        values.push(req.user.id);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY m.data DESC';

      const [matriculas] = await this.db.execute(query, values);

      res.json({
        success: true,
        data: matriculas,
        count: Array.isArray(matriculas) ? matriculas.length : 0
      });
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar matrículas'
      });
    }
  };

  public getById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const [matriculaResult] = await this.db.execute(`
        SELECT 
          m.id,
          m.data,
          m.status,
          a.id as aluno_id,
          a.ra,
          ua.nome as aluno_nome,
          ua.email as aluno_email,
          t.id as turma_id,
          t.codigo as turma_codigo,
          d.codigo as disciplina_codigo,
          d.nome as disciplina_nome,
          d.creditos,
          up.nome as professor_nome,
          t.dia,
          t.turno
        FROM Matricula m
        INNER JOIN Aluno a ON m.aluno_id = a.id
        INNER JOIN Usuario ua ON a.id = ua.id
        INNER JOIN Turma t ON m.turma_id = t.id
        INNER JOIN Disciplina d ON t.disciplina_id = d.id
        INNER JOIN Professor p ON t.professor_id = p.id
        INNER JOIN Usuario up ON p.id = up.id
        WHERE m.id = ?
      `, [id]);

      if (!Array.isArray(matriculaResult) || matriculaResult.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Matrícula não encontrada'
        });
        return;
      }

      const matricula = matriculaResult[0] as any;

      if (!req.user?.roles?.includes('ADMIN') && req.user?.id !== matricula.aluno_id) {
        res.status(403).json({
          success: false,
          error: 'Acesso negado'
        });
        return;
      }

      res.json({
        success: true,
        data: matricula
      });
    } catch (error) {
      console.error('Error fetching enrollment:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar matrícula'
      });
    }
  };

  public getTurmasDisponiveis = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const aluno_id = req.user?.id;

      const [turmasDisponiveis] = await this.db.execute(`
        SELECT DISTINCT
          t.id,
          t.codigo,
          d.codigo as disciplina_codigo,
          d.nome as disciplina_nome,
          d.creditos,
          up.nome as professor_nome,
          t.vagas,
          t.dia,
          t.turno,
          COUNT(m.id) as alunos_matriculados,
          (t.vagas - COUNT(m.id)) as vagas_disponiveis
        FROM Turma t
        INNER JOIN Disciplina d ON t.disciplina_id = d.id
        INNER JOIN Professor p ON t.professor_id = p.id
        INNER JOIN Usuario up ON p.id = up.id
        LEFT JOIN Matricula m ON t.id = m.turma_id AND m.status = 'ATIVA'
        WHERE t.id NOT IN (
          SELECT ma.turma_id 
          FROM Matricula ma 
          WHERE ma.aluno_id = ? AND ma.status = 'ATIVA'
        )
        GROUP BY t.id, t.codigo, d.codigo, d.nome, d.creditos, up.nome, t.vagas, t.dia, t.turno
        HAVING vagas_disponiveis > 0
        ORDER BY d.nome, t.dia, t.turno
      `, [aluno_id]);

      res.json({
        success: true,
        data: turmasDisponiveis,
        count: Array.isArray(turmasDisponiveis) ? turmasDisponiveis.length : 0
      });
    } catch (error) {
      console.error('Error fetching available classes:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar turmas disponíveis'
      });
    }
  };
}

export default new MatriculaController();
