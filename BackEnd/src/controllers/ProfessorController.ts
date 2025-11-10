import { Response } from 'express';
import Database from '../config/database';
import { AuthRequest } from '../middleware/auth';

class ProfessorController {
  private db = Database.getInstance().getConnection();

  getAll = async (req: AuthRequest, res: Response) => {
    try {
      const [professors] = await this.db.execute(`
        SELECT 
          p.id,
          p.siape,
          u.nome,
          u.email,
          COUNT(DISTINCT t.id) as total_turmas
        FROM Professor p
        INNER JOIN Usuario u ON p.id = u.id
        LEFT JOIN Turma t ON p.id = t.professor_id
        GROUP BY p.id, p.siape, u.nome, u.email
        ORDER BY u.nome
      `);

      res.json({
        success: true,
        data: professors,
        count: Array.isArray(professors) ? professors.length : 0
      });
    } catch (error) {
      console.error('Error fetching professors:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar professores'
      });
    }
  };

  getById = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const [professorResult] = await this.db.execute(`
        SELECT 
          p.id,
          p.siape,
          u.nome,
          u.email
        FROM Professor p
        INNER JOIN Usuario u ON p.id = u.id
        WHERE p.id = ?
      `, [id]);

      if (!Array.isArray(professorResult) || professorResult.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Professor não encontrado'
        });
      }

      res.json({
        success: true,
        data: professorResult[0]
      });
    } catch (error) {
      console.error('Error fetching professor:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar professor'
      });
    }
  };

  getTurmas = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const [turmas] = await this.db.execute(`
        SELECT 
          t.id,
          t.codigo,
          t.disciplina_id,
          d.nome as disciplina_nome,
          d.codigo as disciplina_codigo,
          d.creditos,
          t.vagas,
          t.dia,
          t.turno,
          COUNT(CASE WHEN m.status = 'ATIVA' THEN 1 END) as alunos_matriculados,
          (t.vagas - COUNT(CASE WHEN m.status = 'ATIVA' THEN 1 END)) as vagas_disponiveis
        FROM Turma t
        INNER JOIN Disciplina d ON t.disciplina_id = d.id
        LEFT JOIN Matricula m ON t.id = m.turma_id
        WHERE t.professor_id = ?
        GROUP BY t.id, t.codigo, t.disciplina_id, d.nome, d.codigo, d.creditos, t.vagas, t.dia, t.turno
        ORDER BY d.nome, t.dia, t.turno
      `, [id]);

      res.json({
        success: true,
        data: turmas,
        count: Array.isArray(turmas) ? turmas.length : 0
      });
    } catch (error) {
      console.error('Error fetching professor turmas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar turmas do professor'
      });
    }
  };

  update = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { siape } = req.body;

      const [existingProfessor] = await this.db.execute(
        'SELECT id FROM Professor WHERE id = ?',
        [id]
      );

      if (!Array.isArray(existingProfessor) || existingProfessor.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Professor não encontrado'
        });
      }

      if (siape) {

        const [existingSiape] = await this.db.execute(
          'SELECT id FROM Professor WHERE siape = ? AND id != ?',
          [siape, id]
        );

        if (Array.isArray(existingSiape) && existingSiape.length > 0) {
          return res.status(409).json({
            success: false,
            error: 'SIAPE já está em uso por outro professor'
          });
        }

        await this.db.execute(
          'UPDATE Professor SET siape = ? WHERE id = ?',
          [siape, id]
        );
      }

      const [updatedProfessor] = await this.db.execute(`
        SELECT 
          p.id,
          p.siape,
          u.nome,
          u.email
        FROM Professor p
        INNER JOIN Usuario u ON p.id = u.id
        WHERE p.id = ?
      `, [id]);

      res.json({
        success: true,
        data: Array.isArray(updatedProfessor) ? updatedProfessor[0] : null,
        message: 'Professor atualizado com sucesso'
      });
    } catch (error) {
      console.error('Error updating professor:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao atualizar professor'
      });
    }
  };

  delete = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const [existingProfessor] = await this.db.execute(`
        SELECT 
          p.id,
          p.siape,
          u.nome,
          u.email
        FROM Professor p
        INNER JOIN Usuario u ON p.id = u.id
        WHERE p.id = ?
      `, [id]);

      if (!Array.isArray(existingProfessor) || existingProfessor.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Professor não encontrado'
        });
      }

      const deletedProfessor = existingProfessor[0];

      const [activeTurmas] = await this.db.execute(
        'SELECT COUNT(*) as count FROM Turma WHERE professor_id = ?',
        [id]
      );

      const turmaCount = Array.isArray(activeTurmas) && activeTurmas.length > 0 
        ? (activeTurmas[0] as any).count 
        : 0;

      if (turmaCount > 0) {
        return res.status(409).json({
          success: false,
          error: `Não é possível excluir professor com ${turmaCount} turma(s) ativa(s). Remova ou reatribua as turmas primeiro.`
        });
      }

      await this.db.execute('DELETE FROM Usuario WHERE id = ?', [id]);

      res.json({
        success: true,
        data: deletedProfessor,
        message: 'Professor e usuário excluídos com sucesso'
      });
    } catch (error) {
      console.error('Error deleting professor:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao excluir professor'
      });
    }
  };
}

export default new ProfessorController();
