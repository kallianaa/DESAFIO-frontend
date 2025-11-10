import { v4 as uuidv4 } from 'uuid';
import { JWTProvider } from '../providers/JWTProvider';
import { PasswordHasher } from '../providers/PasswordHasher';
import { UsuarioRepository } from '../repositories/UsuarioRepository';

export class UsuarioService {
  private usuarioRepository: UsuarioRepository;
  private passwordHasher: PasswordHasher;
  private jwtProvider: JWTProvider;

  constructor() {
    this.usuarioRepository = new UsuarioRepository();
    this.passwordHasher = new PasswordHasher();
    this.jwtProvider = new JWTProvider();
  }

  async login(email: string, senha: string): Promise<{ token: string; usuario: any } | null> {
    const user = await this.usuarioRepository.findByEmail(email);

    if (!user) {
      return null;
    }

    const isValidPassword = await this.passwordHasher.compare(senha, user.senha_hash);
    if (!isValidPassword) {
      return null;
    }

    const userRoles = user.roles ? user.roles.split(',') : [];
    const tokenPayload = {
      user: {
        id: user.id,
        nome: user.nome,
        email: user.email,
        roles: userRoles
      }
    };

    const token = this.jwtProvider.sign(tokenPayload);

    return {
      token,
      usuario: tokenPayload.user
    };
  }

  async register(nome: string, email: string, senha: string, roles: number[]): Promise<any> {

    const emailExists = await this.usuarioRepository.emailExists(email);
    if (emailExists) {
      throw new Error('Email já está em uso');
    }

    const hashedPassword = await this.passwordHasher.hash(senha);

    const userId = uuidv4();
    await this.usuarioRepository.create(userId, nome, email, hashedPassword);

    for (const roleId of roles) {
      await this.usuarioRepository.assignRole(userId, roleId);
    }

    return await this.usuarioRepository.findById(userId);
  }

  async getAllUsers(): Promise<any[]> {
    return await this.usuarioRepository.findAll();
  }

  async getUserById(id: string): Promise<any | null> {
    return await this.usuarioRepository.findById(id);
  }

  async updateUser(id: string, updates: { nome?: string; email?: string }): Promise<any | null> {
    const exists = await this.usuarioRepository.exists(id);
    if (!exists) {
      throw new Error('Usuário não encontrado');
    }

    await this.usuarioRepository.update(id, updates);
    return await this.usuarioRepository.findById(id);
  }

  async deleteUser(id: string): Promise<any> {
    const user = await this.usuarioRepository.findById(id);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    await this.usuarioRepository.delete(id);
    return user;
  }
}

export default new UsuarioService();
