import cors from 'cors';
import dotenv from 'dotenv';
import express, { Application, Request, Response } from 'express';
import helmet from 'helmet';
import Database from './config/database';
import authRoutes from './routes/authRoutes';
import disciplineRoutes from './routes/disciplineRoutes';
import matriculaRoutes from './routes/matriculaRoutes';
import professorRoutes from './routes/professorRoutes';
import studentRoutes from './routes/studentRoutes';
import turmaRoutes from './routes/turmaRoutes';
import userRoutes from './routes/userRoutes';

dotenv.config();

class App {
  public app: Application;
  private port: number;
  private db: Database;

  constructor() {
    this.app = express();
    this.port = parseInt(process.env.PORT || '3000');
    this.db = Database.getInstance();
    this.initializeMiddlewares();
    this.initializeRoutes();
    this.initializeErrorHandling();
  }

  private initializeMiddlewares(): void {
    this.app.use(helmet());
    this.app.use(cors({
      origin: process.env.CORS_ORIGIN || '*',
      credentials: true
    }));
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  }

  private initializeRoutes(): void {
    this.app.get('/', (req: Request, res: Response) => {
      res.json({
        message: 'Sistema Acadêmico - API REST',
        version: '1.0.0',
        status: 'OK',
        timestamp: new Date().toISOString(),
        endpoints: {
          auth: '/api/auth',
          users: '/api/users',
          professors: '/api/professors',
          students: '/api/students',
          disciplines: '/api/disciplines',
          classes: '/api/turmas',
          enrollments: '/api/matriculas'
        }
      });
    });

    this.app.use('/api/auth', authRoutes);
    this.app.use('/api/users', userRoutes);
    this.app.use('/api/professors', professorRoutes);
    this.app.use('/api/students', studentRoutes);
    this.app.use('/api/disciplines', disciplineRoutes);
    this.app.use('/api/turmas', turmaRoutes);
    this.app.use('/api/matriculas', matriculaRoutes);

    this.app.get('/api', (req: Request, res: Response) => {
      res.json({
        name: 'Sistema Acadêmico API',
        version: '1.0.0',
        description: 'API REST para gerenciamento acadêmico com Express.js + TypeScript + MySQL',
        features: [
          'Autenticação JWT',
          'Gerenciamento de usuários (Admin, Professor, Aluno)',
          'Gestão de disciplinas e pré-requisitos',
          'Criação e administração de turmas',
          'Sistema de matrículas com validação de vagas',
          'Controle de acesso baseado em roles'
        ]
      });
    });

    this.app.use('*', (req: Request, res: Response) => {
      res.status(404).json({
        success: false,
        error: 'Rota não encontrada',
        message: `A rota ${req.originalUrl} não existe`,
        suggestion: 'Consulte GET /api para ver todas as rotas disponíveis'
      });
    });
  }

  private initializeErrorHandling(): void {
    this.app.use((error: Error, req: Request, res: Response, next: any) => {
      console.error('Erro na aplicação:', error.message);

      if (error.name === 'ValidationError') {
        return res.status(400).json({
          success: false,
          error: 'Erro de validação',
          message: error.message
        });
      }

      if (error.name === 'UnauthorizedError') {
        return res.status(401).json({
          success: false,
          error: 'Não autorizado',
          message: 'Token de acesso inválido ou expirado'
        });
      }

      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Algo deu errado',
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    });
  }

  public async initialize(): Promise<void> {
    try {
      const connected = await this.db.testConnection();
      if (!connected) {
        console.error('Falha na conexão com o banco de dados');
        process.exit(1);
      }

      console.log('Banco de dados conectado com sucesso');
    } catch (error) {
      console.error('Erro ao inicializar aplicação:', error);
      process.exit(1);
    }
  }

  public listen(): void {
    this.app.listen(this.port, () => {
      console.log(`Servidor rodando em: http://localhost:${this.port}`);
    });
  }

  public async shutdown(): Promise<void> {
    console.log('Encerrando servidor...');
    await this.db.close();
    process.exit(0);
  }
}

const app = new App();

process.on('SIGTERM', async () => {
  await app.shutdown();
});

process.on('SIGINT', async () => {
  await app.shutdown();
});

(async () => {
  await app.initialize();
  app.listen();
})();

export default app;
