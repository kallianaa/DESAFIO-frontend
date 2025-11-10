export interface Usuario {
  id: string;
  nome: string;
  email: string;
  senha_hash: string;
  roles?: string[];
}

export interface Role {
  id: number;
  nome: 'ADMIN' | 'PROFESSOR' | 'ALUNO';
}

export interface Professor {
  id: string;
  siape: string;
  nome?: string;
  email?: string;
}

export interface Aluno {
  id: string;
  ra: string;
  nome?: string;
  email?: string;
}

export interface Disciplina {
  id: string;
  codigo: string;
  nome: string;
  creditos: number;
  prerequisitos?: Disciplina[];
}

export interface Turma {
  id: string;
  codigo: string;
  disciplina_id: string;
  professor_id: string;
  vagas: number;
  dia: number;
  turno: number;
  disciplina?: Disciplina;
  professor?: Professor;
  alunos_matriculados?: number;
  vagas_disponiveis?: number;
}

export interface Matricula {
  id: string;
  aluno_id: string;
  turma_id: string;
  data: Date;
  status: 'ATIVA' | 'CANCELADA' | 'CONCLUIDA';
  aluno?: Aluno;
  turma?: Turma;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  count?: number;
  total?: number;
}

export interface CreateUsuarioRequest {
  nome: string;
  email: string;
  senha: string;
  roles: number[];
  siape?: string;
  ra?: string;
}

export interface CreateProfessorRequest {
  nome: string;
  email: string;
  senha: string;
  siape: string;
}

export interface CreateAlunoRequest {
  nome: string;
  email: string;
  senha: string;
  ra: string;
}

export interface CreateDisciplinaRequest {
  codigo: string;
  nome: string;
  creditos: number;
  prerequisitos?: string[];
}

export interface CreateTurmaRequest {
  disciplina_id: string;
  professor_id: string;
  vagas: number;
  dia: number;
  turno: number;
}

export interface MatricularAlunoRequest {
  aluno_id: string;
  turma_id: string;
}

export interface TurmaQuery {
  disciplina_id?: string;
  professor_id?: string;
  dia?: number;
  turno?: number;
  vagas_disponiveis?: boolean;
}

export interface MatriculaQuery {
  aluno_id?: string;
  turma_id?: string;
  status?: 'ATIVA' | 'CANCELADA' | 'CONCLUIDA';
  disciplina_id?: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface AuthResponse {
  success: boolean;
  token?: string;
  usuario?: {
    id: string;
    nome: string;
    email: string;
    roles: string[];
  };
  error?: string;
}
