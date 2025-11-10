import { Response } from 'express';
import Database from '../config/database';
import { AuthRequest } from '../middleware/auth';

class TurmaController {
  private db = Database.getInstance().getConnection();

  public getAll = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { disciplina_id, professor_id, dia, turno, vagas_disponiveis } = req.query;

      let query = `
        SELECT 
          t.id,
          t.codigo,
          d.codigo as disciplina_codigo,
          d.nome as disciplina_nome,
          d.creditos,
          up.nome as professor_nome,
          p.siape as professor_siape,
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
      `;

      const conditions: string[] = [];
      const values: any[] = [];

      if (disciplina_id) {
        conditions.push('t.disciplina_id = ?');
        values.push(disciplina_id);
      }

      if (professor_id) {
        conditions.push('t.professor_id = ?');
        values.push(professor_id);
      }

      if (dia !== undefined) {
        conditions.push('t.dia = ?');
        values.push(dia);
      }

      if (turno !== undefined) {
        conditions.push('t.turno = ?');
        values.push(turno);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += `
        GROUP BY t.id, t.codigo, d.codigo, d.nome, d.creditos, up.nome, p.siape, t.vagas, t.dia, t.turno
      `;

      if (vagas_disponiveis) {
        query += ' HAVING vagas_disponiveis > 0';
      }

      query += ' ORDER BY d.nome, t.dia, t.turno';

      const [turmas] = await this.db.execute(query, values);

      res.json({
        success: true,
        data: turmas,
        count: Array.isArray(turmas) ? turmas.length : 0
      });
    } catch (error) {
      console.error('Error fetching classes:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar turmas'
      });
    }
  };

  public getById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const [turmaResult] = await this.db.execute(`
        SELECT 
          t.id,
          t.codigo,
          d.id as disciplina_id,
          d.codigo as disciplina_codigo,
          d.nome as disciplina_nome,
          d.creditos,
          p.id as professor_id,
          up.nome as professor_nome,
          p.siape as professor_siape,
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
        WHERE t.id = ?
        GROUP BY t.id, t.codigo, d.id, d.codigo, d.nome, d.creditos, p.id, up.nome, p.siape, t.vagas, t.dia, t.turno
      `, [id]);

      if (!Array.isArray(turmaResult) || turmaResult.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Turma não encontrada'
        });
        return;
      }

      res.json({
        success: true,
        data: turmaResult[0]
      });
    } catch (error) {
      console.error('Error fetching class:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar turma'
      });
    }
  };

  public getAlunos = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const [alunos] = await this.db.execute(`
        SELECT 
          m.id as matricula_id,
          m.data as matricula_data,
          m.status as matricula_status,
          a.id as aluno_id,
          a.ra,
          ua.nome as aluno_nome,
          ua.email as aluno_email
        FROM Matricula m
        INNER JOIN Aluno a ON m.aluno_id = a.id
        INNER JOIN Usuario ua ON a.id = ua.id
        WHERE m.turma_id = ?
        ORDER BY ua.nome
      `, [id]);

      res.json({
        success: true,
        data: alunos,
        count: Array.isArray(alunos) ? alunos.length : 0
      });
    } catch (error) {
      console.error('Error fetching class students:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar alunos da turma'
      });
    }
  };

  public create = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { disciplina_id, professor_id, vagas, dia, turno } = req.body;

      if (!disciplina_id || !professor_id || !vagas || dia === undefined || turno === undefined) {
        res.status(400).json({
          success: false,
          error: 'disciplina_id, professor_id, vagas, dia e turno são obrigatórios'
        });
        return;
      }

      const [disciplinaExists] = await this.db.execute(
        'SELECT id FROM Disciplina WHERE id = ?',
        [disciplina_id]
      );

      if (!Array.isArray(disciplinaExists) || disciplinaExists.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Disciplina não encontrada'
        });
        return;
      }

      const [professorExists] = await this.db.execute(
        'SELECT id FROM Professor WHERE id = ?',
        [professor_id]
      );

      if (!Array.isArray(professorExists) || professorExists.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Professor não encontrado'
        });
        return;
      }

      const codigo = `${dia}${turno}`;
      const [existingTurma] = await this.db.execute(
        'SELECT id FROM Turma WHERE codigo = ?',
        [codigo]
      );

      if (Array.isArray(existingTurma) && existingTurma.length > 0) {
        res.status(409).json({
          success: false,
          error: `Já existe uma turma com o código ${codigo} (dia: ${dia}, turno: ${turno})`
        });
        return;
      }

      const [result] = await this.db.execute(
        'INSERT INTO Turma (disciplina_id, professor_id, vagas, dia, turno) VALUES (?, ?, ?, ?, ?)',
        [disciplina_id, professor_id, vagas, dia, turno]
      ) as any;

      const turmaId = result.insertId;

      const [newTurma] = await this.db.execute(`
        SELECT 
          t.id,
          t.codigo,
          d.id as disciplina_id,
          d.codigo as disciplina_codigo,
          d.nome as disciplina_nome,
          d.creditos,
          p.id as professor_id,
          up.nome as professor_nome,
          p.siape as professor_siape,
          t.vagas,
          t.dia,
          t.turno,
          0 as alunos_matriculados,
          t.vagas as vagas_disponiveis
        FROM Turma t
        INNER JOIN Disciplina d ON t.disciplina_id = d.id
        INNER JOIN Professor p ON t.professor_id = p.id
        INNER JOIN Usuario up ON p.id = up.id
        WHERE t.id = ?
      `, [turmaId]);

      res.status(201).json({
        success: true,
        data: Array.isArray(newTurma) ? newTurma[0] : null,
        message: 'Turma criada com sucesso'
      });
    } catch (error) {
      console.error('Error creating turma:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao criar turma'
      });
    }
  };

  public update = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { professor_id, vagas, dia, turno } = req.body;

      const [existingTurma] = await this.db.execute(
        'SELECT id FROM Turma WHERE id = ?',
        [id]
      );

      if (!Array.isArray(existingTurma) || existingTurma.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Turma não encontrada'
        });
        return;
      }

      if (professor_id) {
        const [professorExists] = await this.db.execute(
          'SELECT id FROM Professor WHERE id = ?',
          [professor_id]
        );

        if (!Array.isArray(professorExists) || professorExists.length === 0) {
          res.status(404).json({
            success: false,
            error: 'Professor não encontrado'
          });
          return;
        }
      }

      if (dia !== undefined || turno !== undefined) {

        const [current] = await this.db.execute(
          'SELECT dia, turno FROM Turma WHERE id = ?',
          [id]
        ) as any[];

        const currentData = current[0];
        const newDia = dia !== undefined ? dia : currentData.dia;
        const newTurno = turno !== undefined ? turno : currentData.turno;
        const newCodigo = `${newDia}${newTurno}`;

        const [conflict] = await this.db.execute(
          'SELECT id FROM Turma WHERE codigo = ? AND id != ?',
          [newCodigo, id]
        );

        if (Array.isArray(conflict) && conflict.length > 0) {
          res.status(409).json({
            success: false,
            error: `Já existe uma turma com o código ${newCodigo} (dia: ${newDia}, turno: ${newTurno})`
          });
          return;
        }
      }

      if (vagas !== undefined) {
        const [enrollmentCount] = await this.db.execute(
          "SELECT COUNT(*) as count FROM Matricula WHERE turma_id = ? AND status = 'ATIVA'",
          [id]
        ) as any[];

        const currentEnrollments = enrollmentCount[0].count;

        if (vagas < currentEnrollments) {
          res.status(409).json({
            success: false,
            error: `Não é possível reduzir vagas para ${vagas}. Existem ${currentEnrollments} alunos matriculados.`
          });
          return;
        }
      }

      const updates: string[] = [];
      const values: any[] = [];

      if (professor_id) {
        updates.push('professor_id = ?');
        values.push(professor_id);
      }
      if (vagas !== undefined) {
        updates.push('vagas = ?');
        values.push(vagas);
      }
      if (dia !== undefined) {
        updates.push('dia = ?');
        values.push(dia);
      }
      if (turno !== undefined) {
        updates.push('turno = ?');
        values.push(turno);
      }

      if (updates.length > 0) {
        values.push(id);
        await this.db.execute(
          `UPDATE Turma SET ${updates.join(', ')} WHERE id = ?`,
          values
        );
      }

      const [updatedTurma] = await this.db.execute(`
        SELECT 
          t.id,
          t.codigo,
          d.id as disciplina_id,
          d.codigo as disciplina_codigo,
          d.nome as disciplina_nome,
          d.creditos,
          p.id as professor_id,
          up.nome as professor_nome,
          p.siape as professor_siape,
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
        WHERE t.id = ?
        GROUP BY t.id, t.codigo, d.id, d.codigo, d.nome, d.creditos, p.id, up.nome, p.siape, t.vagas, t.dia, t.turno
      `, [id]);

      res.json({
        success: true,
        data: Array.isArray(updatedTurma) ? updatedTurma[0] : null,
        message: 'Turma atualizada com sucesso'
      });
    } catch (error) {
      console.error('Error updating turma:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao atualizar turma'
      });
    }
  };

  public delete = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const [existingTurma] = await this.db.execute(`
        SELECT 
          t.id,
          t.codigo,
          d.nome as disciplina_nome,
          up.nome as professor_nome,
          t.vagas,
          t.dia,
          t.turno
        FROM Turma t
        INNER JOIN Disciplina d ON t.disciplina_id = d.id
        INNER JOIN Professor p ON t.professor_id = p.id
        INNER JOIN Usuario up ON p.id = up.id
        WHERE t.id = ?
      `, [id]);

      if (!Array.isArray(existingTurma) || existingTurma.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Turma não encontrada'
        });
        return;
      }

      const deletedTurma = existingTurma[0];

      const [activeMatriculas] = await this.db.execute(
        "SELECT COUNT(*) as count FROM Matricula WHERE turma_id = ? AND status = 'ATIVA'",
        [id]
      );

      const matriculaCount = Array.isArray(activeMatriculas) && activeMatriculas.length > 0
        ? (activeMatriculas[0] as any).count
        : 0;

      if (matriculaCount > 0) {
        res.status(409).json({
          success: false,
          error: `Não é possível excluir turma com ${matriculaCount} matrícula(s) ativa(s). Cancele as matrículas primeiro.`
        });
        return;
      }

      await this.db.execute('DELETE FROM Turma WHERE id = ?', [id]);

      res.json({
        success: true,
        data: deletedTurma,
        message: 'Turma excluída com sucesso'
      });
    } catch (error) {
      console.error('Error deleting turma:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao excluir turma'
      });
    }
  };
}

export default new TurmaController();
