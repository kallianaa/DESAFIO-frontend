import { Response } from 'express';
import Database from '../config/database';
import { AuthRequest } from '../middleware/auth';

class AlunoController {
  private db = Database.getInstance().getConnection();

  getAll = async (req: AuthRequest, res: Response) => {
    try {
      const [students] = await this.db.execute(`
        SELECT 
          a.id,
          a.ra,
          u.nome,
          u.email,
          COUNT(DISTINCT CASE WHEN m.status = 'ATIVA' THEN m.id END) as total_matriculas_ativas
        FROM Aluno a
        INNER JOIN Usuario u ON a.id = u.id
        LEFT JOIN Matricula m ON a.id = m.aluno_id
        GROUP BY a.id, a.ra, u.nome, u.email
        ORDER BY u.nome
      `);

      res.json({
        success: true,
        data: students,
        count: Array.isArray(students) ? students.length : 0
      });
    } catch (error) {
      console.error('Error fetching students:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar alunos'
      });
    }
  };

  getById = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const [studentResult] = await this.db.execute(`
        SELECT 
          a.id,
          a.ra,
          u.nome,
          u.email
        FROM Aluno a
        INNER JOIN Usuario u ON a.id = u.id
        WHERE a.id = ?
      `, [id]);

      if (!Array.isArray(studentResult) || studentResult.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Aluno não encontrado'
        });
      }

      res.json({
        success: true,
        data: studentResult[0]
      });
    } catch (error) {
      console.error('Error fetching student:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar aluno'
      });
    }
  };

  getMatriculas = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const [matriculas] = await this.db.execute(`
        SELECT 
          m.id,
          m.data,
          m.status,
          m.turma_id,
          t.codigo as turma_codigo,
          t.dia,
          t.turno,
          t.vagas,
          d.id as disciplina_id,
          d.nome as disciplina_nome,
          d.codigo as disciplina_codigo,
          d.creditos,
          p.id as professor_id,
          u.nome as professor_nome,
          p.siape as professor_siape
        FROM Matricula m
        INNER JOIN Turma t ON m.turma_id = t.id
        INNER JOIN Disciplina d ON t.disciplina_id = d.id
        INNER JOIN Professor p ON t.professor_id = p.id
        INNER JOIN Usuario u ON p.id = u.id
        WHERE m.aluno_id = ?
        ORDER BY m.data DESC
      `, [id]);

      res.json({
        success: true,
        data: matriculas,
        count: Array.isArray(matriculas) ? matriculas.length : 0
      });
    } catch (error) {
      console.error('Error fetching student matriculas:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar matrículas do aluno'
      });
    }
  };

  update = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { ra } = req.body;

      const [existingStudent] = await this.db.execute(
        'SELECT id FROM Aluno WHERE id = ?',
        [id]
      );

      if (!Array.isArray(existingStudent) || existingStudent.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Aluno não encontrado'
        });
      }

      if (ra) {

        const [existingRa] = await this.db.execute(
          'SELECT id FROM Aluno WHERE ra = ? AND id != ?',
          [ra, id]
        );

        if (Array.isArray(existingRa) && existingRa.length > 0) {
          return res.status(409).json({
            success: false,
            error: 'RA já está em uso por outro aluno'
          });
        }

        await this.db.execute(
          'UPDATE Aluno SET ra = ? WHERE id = ?',
          [ra, id]
        );
      }

      const [updatedStudent] = await this.db.execute(`
        SELECT 
          a.id,
          a.ra,
          u.nome,
          u.email
        FROM Aluno a
        INNER JOIN Usuario u ON a.id = u.id
        WHERE a.id = ?
      `, [id]);

      res.json({
        success: true,
        data: Array.isArray(updatedStudent) ? updatedStudent[0] : null,
        message: 'Aluno atualizado com sucesso'
      });
    } catch (error) {
      console.error('Error updating student:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao atualizar aluno'
      });
    }
  };

  delete = async (req: AuthRequest, res: Response) => {
    try {
      const { id } = req.params;

      const [existingStudent] = await this.db.execute(`
        SELECT 
          a.id,
          a.ra,
          u.nome,
          u.email
        FROM Aluno a
        INNER JOIN Usuario u ON a.id = u.id
        WHERE a.id = ?
      `, [id]);

      if (!Array.isArray(existingStudent) || existingStudent.length === 0) {
        return res.status(404).json({
          success: false,
          error: 'Aluno não encontrado'
        });
      }

      const deletedStudent = existingStudent[0];

      const [activeMatriculas] = await this.db.execute(
        "SELECT COUNT(*) as count FROM Matricula WHERE aluno_id = ? AND status = 'ATIVA'",
        [id]
      );

      const matriculaCount = Array.isArray(activeMatriculas) && activeMatriculas.length > 0 
        ? (activeMatriculas[0] as any).count 
        : 0;

      if (matriculaCount > 0) {
        return res.status(409).json({
          success: false,
          error: `Não é possível excluir aluno com ${matriculaCount} matrícula(s) ativa(s). Cancele as matrículas primeiro.`
        });
      }

      await this.db.execute('DELETE FROM Usuario WHERE id = ?', [id]);

      res.json({
        success: true,
        data: deletedStudent,
        message: 'Aluno e usuário excluídos com sucesso'
      });
    } catch (error) {
      console.error('Error deleting student:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao excluir aluno'
      });
    }
  };
}

export default new AlunoController();
