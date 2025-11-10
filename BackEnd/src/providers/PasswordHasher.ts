import bcrypt from 'bcryptjs';

export class PasswordHasher {
  private saltRounds: number;

  constructor() {
    this.saltRounds = 12;
  }

  public async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, this.saltRounds);
  }

  public async compare(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
  }
}

export default new PasswordHasher();
