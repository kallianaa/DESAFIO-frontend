import { Response } from 'express';
import Database from '../config/database';
import { AuthRequest } from '../middleware/auth';

class DisciplinaController {
  private db = Database.getInstance().getConnection();

  public getAll = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const [disciplines] = await this.db.execute(`
        SELECT 
          d.id,
          d.codigo,
          d.nome,
          d.creditos,
          GROUP_CONCAT(
            CONCAT(dp.codigo, ' - ', dp.nome) 
            ORDER BY dp.codigo 
            SEPARATOR '; '
          ) as prerequisitos
        FROM Disciplina d
        LEFT JOIN PreRequisito pr ON d.id = pr.disciplina_id
        LEFT JOIN Disciplina dp ON pr.prerequisito_id = dp.id
        GROUP BY d.id, d.codigo, d.nome, d.creditos
        ORDER BY d.codigo
      `);

      res.json({
        success: true,
        data: disciplines,
        count: Array.isArray(disciplines) ? disciplines.length : 0
      });
    } catch (error) {
      console.error('Error fetching disciplines:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar disciplinas'
      });
    }
  };

  public getById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const [disciplineResult] = await this.db.execute(`
        SELECT 
          d.id,
          d.codigo,
          d.nome,
          d.creditos
        FROM Disciplina d
        WHERE d.id = ?
      `, [id]);

      if (!Array.isArray(disciplineResult) || disciplineResult.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Disciplina não encontrada'
        });
        return;
      }

      const [prerequisites] = await this.db.execute(`
        SELECT 
          dp.id,
          dp.codigo,
          dp.nome,
          dp.creditos
        FROM PreRequisito pr
        INNER JOIN Disciplina dp ON pr.prerequisito_id = dp.id
        WHERE pr.disciplina_id = ?
        ORDER BY dp.codigo
      `, [id]);

      const discipline = { 
        ...disciplineResult[0], 
        prerequisitos: Array.isArray(prerequisites) ? prerequisites : []
      };

      res.json({
        success: true,
        data: discipline
      });
    } catch (error) {
      console.error('Error fetching discipline:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar disciplina'
      });
    }
  };

  public getTurmas = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const [turmas] = await this.db.execute(`
        SELECT 
          t.id,
          t.codigo,
          up.nome as professor_nome,
          p.siape as professor_siape,
          t.vagas,
          t.dia,
          t.turno,
          COUNT(m.id) as alunos_matriculados,
          (t.vagas - COUNT(m.id)) as vagas_disponiveis
        FROM Turma t
        INNER JOIN Professor p ON t.professor_id = p.id
        INNER JOIN Usuario up ON p.id = up.id
        LEFT JOIN Matricula m ON t.id = m.turma_id AND m.status = 'ATIVA'
        WHERE t.disciplina_id = ?
        GROUP BY t.id, t.codigo, up.nome, p.siape, t.vagas, t.dia, t.turno
        ORDER BY t.dia, t.turno
      `, [id]);

      res.json({
        success: true,
        data: turmas,
        count: Array.isArray(turmas) ? turmas.length : 0
      });
    } catch (error) {
      console.error('Error fetching discipline classes:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao buscar turmas da disciplina'
      });
    }
  };

  public create = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { codigo, nome, creditos, prerequisitos } = req.body;

      if (!codigo || !nome || !creditos) {
        res.status(400).json({
          success: false,
          error: 'Código, nome e créditos são obrigatórios'
        });
        return;
      }

      const [existingDisciplina] = await this.db.execute(
        'SELECT id FROM Disciplina WHERE codigo = ?',
        [codigo]
      );

      if (Array.isArray(existingDisciplina) && existingDisciplina.length > 0) {
        res.status(409).json({
          success: false,
          error: 'Código de disciplina já existe'
        });
        return;
      }

      const [result] = await this.db.execute(
        'INSERT INTO Disciplina (codigo, nome, creditos) VALUES (?, ?, ?)',
        [codigo, nome, creditos]
      ) as any;

      const disciplinaId = result.insertId;

      if (prerequisitos && Array.isArray(prerequisitos) && prerequisitos.length > 0) {
        for (const prerequisitoId of prerequisitos) {

          const [prereqExists] = await this.db.execute(
            'SELECT id FROM Disciplina WHERE id = ?',
            [prerequisitoId]
          );

          if (Array.isArray(prereqExists) && prereqExists.length > 0) {
            await this.db.execute(
              'INSERT INTO PreRequisito (disciplina_id, prerequisito_id) VALUES (?, ?)',
              [disciplinaId, prerequisitoId]
            );
          }
        }
      }

      const [newDisciplina] = await this.db.execute(`
        SELECT 
          d.id,
          d.codigo,
          d.nome,
          d.creditos
        FROM Disciplina d
        WHERE d.id = ?
      `, [disciplinaId]);

      const [prerequisites] = await this.db.execute(`
        SELECT 
          dp.id,
          dp.codigo,
          dp.nome,
          dp.creditos
        FROM PreRequisito pr
        INNER JOIN Disciplina dp ON pr.prerequisito_id = dp.id
        WHERE pr.disciplina_id = ?
      `, [disciplinaId]);

      const disciplina = {
        ...(Array.isArray(newDisciplina) ? newDisciplina[0] : {}),
        prerequisitos: Array.isArray(prerequisites) ? prerequisites : []
      };

      res.status(201).json({
        success: true,
        data: disciplina,
        message: 'Disciplina criada com sucesso'
      });
    } catch (error) {
      console.error('Error creating discipline:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao criar disciplina'
      });
    }
  };

  public update = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { codigo, nome, creditos, prerequisitos } = req.body;

      const [existingDisciplina] = await this.db.execute(
        'SELECT id FROM Disciplina WHERE id = ?',
        [id]
      );

      if (!Array.isArray(existingDisciplina) || existingDisciplina.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Disciplina não encontrada'
        });
        return;
      }

      if (codigo) {
        const [existingCodigo] = await this.db.execute(
          'SELECT id FROM Disciplina WHERE codigo = ? AND id != ?',
          [codigo, id]
        );

        if (Array.isArray(existingCodigo) && existingCodigo.length > 0) {
          res.status(409).json({
            success: false,
            error: 'Código de disciplina já está em uso'
          });
          return;
        }
      }

      const updates: string[] = [];
      const values: any[] = [];

      if (codigo) {
        updates.push('codigo = ?');
        values.push(codigo);
      }
      if (nome) {
        updates.push('nome = ?');
        values.push(nome);
      }
      if (creditos !== undefined) {
        updates.push('creditos = ?');
        values.push(creditos);
      }

      if (updates.length > 0) {
        values.push(id);
        await this.db.execute(
          `UPDATE Disciplina SET ${updates.join(', ')} WHERE id = ?`,
          values
        );
      }

      if (prerequisitos !== undefined && Array.isArray(prerequisitos)) {

        await this.db.execute(
          'DELETE FROM PreRequisito WHERE disciplina_id = ?',
          [id]
        );

        for (const prerequisitoId of prerequisitos) {

          if (prerequisitoId !== id) {
            const [prereqExists] = await this.db.execute(
              'SELECT id FROM Disciplina WHERE id = ?',
              [prerequisitoId]
            );

            if (Array.isArray(prereqExists) && prereqExists.length > 0) {
              await this.db.execute(
                'INSERT INTO PreRequisito (disciplina_id, prerequisito_id) VALUES (?, ?)',
                [id, prerequisitoId]
              );
            }
          }
        }
      }

      const [updatedDisciplina] = await this.db.execute(`
        SELECT 
          d.id,
          d.codigo,
          d.nome,
          d.creditos
        FROM Disciplina d
        WHERE d.id = ?
      `, [id]);

      const [prerequisites] = await this.db.execute(`
        SELECT 
          dp.id,
          dp.codigo,
          dp.nome,
          dp.creditos
        FROM PreRequisito pr
        INNER JOIN Disciplina dp ON pr.prerequisito_id = dp.id
        WHERE pr.disciplina_id = ?
      `, [id]);

      const disciplina = {
        ...(Array.isArray(updatedDisciplina) ? updatedDisciplina[0] : {}),
        prerequisitos: Array.isArray(prerequisites) ? prerequisites : []
      };

      res.json({
        success: true,
        data: disciplina,
        message: 'Disciplina atualizada com sucesso'
      });
    } catch (error) {
      console.error('Error updating discipline:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao atualizar disciplina'
      });
    }
  };

  public delete = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      const [existingDisciplina] = await this.db.execute(`
        SELECT 
          id,
          codigo,
          nome,
          creditos
        FROM Disciplina
        WHERE id = ?
      `, [id]);

      if (!Array.isArray(existingDisciplina) || existingDisciplina.length === 0) {
        res.status(404).json({
          success: false,
          error: 'Disciplina não encontrada'
        });
        return;
      }

      const deletedDisciplina = existingDisciplina[0];

      const [activeTurmas] = await this.db.execute(
        'SELECT COUNT(*) as count FROM Turma WHERE disciplina_id = ?',
        [id]
      );

      const turmaCount = Array.isArray(activeTurmas) && activeTurmas.length > 0
        ? (activeTurmas[0] as any).count
        : 0;

      if (turmaCount > 0) {
        res.status(409).json({
          success: false,
          error: `Não é possível excluir disciplina com ${turmaCount} turma(s) ativa(s). Remova as turmas primeiro.`
        });
        return;
      }

      await this.db.execute('DELETE FROM Disciplina WHERE id = ?', [id]);

      res.json({
        success: true,
        data: deletedDisciplina,
        message: 'Disciplina excluída com sucesso'
      });
    } catch (error) {
      console.error('Error deleting discipline:', error);
      res.status(500).json({
        success: false,
        error: 'Erro ao excluir disciplina'
      });
    }
  };
}

export default new DisciplinaController();
