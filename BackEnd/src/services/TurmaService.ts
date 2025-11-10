import { TurmaRepository } from '../repositories/TurmaRepository';

export class TurmaService {
  private turmaRepository: TurmaRepository;

  constructor() {
    this.turmaRepository = new TurmaRepository();
  }

  async getAllTurmas(filters?: { disciplinaId?: number; professorId?: number; semestre?: number; ano?: number }): Promise<any[]> {
    return await this.turmaRepository.findAll(filters);
  }

  async getTurmaById(id: number): Promise<any | null> {
    const turma = await this.turmaRepository.findById(id);
    if (!turma) {
      throw new Error('Turma não encontrada');
    }
    return turma;
  }

  async getAlunosByTurma(turmaId: number): Promise<any[]> {

    await this.getTurmaById(turmaId);
    return await this.turmaRepository.getAlunos(turmaId);
  }
}

export default new TurmaService();
