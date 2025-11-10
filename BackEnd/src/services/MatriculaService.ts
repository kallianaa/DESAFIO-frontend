import { MatriculaRepository } from '../repositories/MatriculaRepository';

export class MatriculaService {
  private matriculaRepository: MatriculaRepository;

  constructor() {
    this.matriculaRepository = new MatriculaRepository();
  }

  async getAllMatriculas(): Promise<any[]> {
    return await this.matriculaRepository.findAll();
  }

  async getMatriculaById(id: number): Promise<any | null> {
    const matricula = await this.matriculaRepository.findById(id);
    if (!matricula) {
      throw new Error('Matrícula não encontrada');
    }
    return matricula;
  }

  async getTurmasDisponiveisForAluno(alunoId: number): Promise<any[]> {
    return await this.matriculaRepository.getTurmasDisponiveis(alunoId);
  }

  async createMatricula(alunoId: number, turmaId: number): Promise<any> {

    const matriculaId = await this.matriculaRepository.create(alunoId, turmaId);
    return await this.matriculaRepository.findById(matriculaId);
  }
}

export default new MatriculaService();
