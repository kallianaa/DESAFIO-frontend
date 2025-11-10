import jwt from 'jsonwebtoken';

export interface TokenPayload {
  user: {
    id: string;
    nome: string;
    email: string;
    roles: string[];
  };
}

export class JWTProvider {
  private secret: string;
  private expiresIn: string;

  constructor() {
    this.secret = process.env.JWT_SECRET || 'default-secret';
    this.expiresIn = process.env.JWT_EXPIRE || '7d';
  }

  public sign(payload: TokenPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: '7d' });
  }

  public verify(token: string): TokenPayload {
    return jwt.verify(token, this.secret) as TokenPayload;
  }

  public decode(token: string): TokenPayload | null {
    return jwt.decode(token) as TokenPayload | null;
  }
}

export default new JWTProvider();
