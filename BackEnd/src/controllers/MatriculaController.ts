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

  public create = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { turma_id, aluno_id } = req.body;

      if (!turma_id) {
        res.status(400).json({
          success: false,
          error: 'turma_id é obrigatório'
        });
        return;
      }

      const [alunoResult] = await this.db.execute(`
        SELECT id FROM Aluno WHERE id = ?
      `, [aluno_id]);

      if (!Array.isArray(alunoResult) || alunoResult.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Registro de aluno não encontrado. Entre em contato com o administrador.'
        });
        return;
      }

      const [existingMatricula] = await this.db.execute(`
        SELECT id FROM Matricula 
        WHERE aluno_id = ? AND turma_id = ? AND status = 'ATIVA'
      `, [aluno_id, turma_id]);

      if (Array.isArray(existingMatricula) && existingMatricula.length > 0) {
        res.status(400).json({
          success: false,
          error: 'Aluno já está matriculado nesta turma'
        });
        return;
      }

      const [turmaResult] = await this.db.execute(`
        SELECT vagas FROM Turma WHERE id = ?
      `, [turma_id]);

      if (!Array.isArray(turmaResult) || turmaResult.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Turma não encontrada'
        });
        return;
      }

      const turma = turmaResult[0] as any;

      const [countResult] = await this.db.execute(`
        SELECT COUNT(*) as matriculados 
        FROM Matricula 
        WHERE turma_id = ? AND status = 'ATIVA'
      `, [turma_id]);

      const matriculados = (countResult as any[])[0].matriculados;
      const vagas_disponiveis = turma.vagas - matriculados;

      if (vagas_disponiveis <= 0) {
        res.status(400).json({
          success: false,
          error: 'Turma sem vagas disponíveis'
        });
        return;
      }

      const matriculaId = require('crypto').randomUUID();
      await this.db.execute(`
        INSERT INTO Matricula (id, aluno_id, turma_id, status)
        VALUES (?, ?, ?, 'ATIVA')
      `, [matriculaId, aluno_id, turma_id]);

      const [novaMatricula] = await this.db.execute(`
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
        WHERE m.id = ?
      `, [matriculaId]);

      res.status(201).json({
        success: true,
        data: Array.isArray(novaMatricula) ? novaMatricula[0] : null,
        message: 'Matrícula realizada com sucesso'
      });
    } catch (error) {
      console.error('Error creating enrollment:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao realizar matrícula'
      });
    }
  };

  public cancel = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const [matriculaResult] = await this.db.execute(`
        SELECT aluno_id, status FROM Matricula WHERE id = ?
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

      if (matricula.status !== 'ATIVA') {
        res.status(400).json({
          success: false,
          error: 'Apenas matrículas ativas podem ser canceladas'
        });
        return;
      }

      await this.db.execute(`
        UPDATE Matricula SET status = 'CANCELADA' WHERE id = ?
      `, [id]);

      res.json({
        success: true,
        message: 'Matrícula cancelada com sucesso'
      });
    } catch (error) {
      console.error('Error canceling enrollment:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao cancelar matrícula'
      });
    }
  };
}

export default new MatriculaController();
