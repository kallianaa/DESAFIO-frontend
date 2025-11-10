import { DisciplinaRepository } from '../repositories/DisciplinaRepository';

export class DisciplinaService {
  private disciplinaRepository: DisciplinaRepository;

  constructor() {
    this.disciplinaRepository = new DisciplinaRepository();
  }

  async getAllDisciplinas(): Promise<any[]> {
    return await this.disciplinaRepository.findAll();
  }

  async getDisciplinaById(id: number): Promise<any | null> {
    const disciplina = await this.disciplinaRepository.findById(id);
    if (!disciplina) {
      throw new Error('Disciplina não encontrada');
    }
    return disciplina;
  }

  async getTurmasByDisciplina(disciplinaId: number): Promise<any[]> {

    await this.getDisciplinaById(disciplinaId);
    return await this.disciplinaRepository.getTurmas(disciplinaId);
  }
}

export default new DisciplinaService();
