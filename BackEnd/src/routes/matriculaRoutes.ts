import { Router } from 'express';
import MatriculaController from '../controllers/MatriculaController';
import { authenticateToken } from '../middleware/auth';

const router: Router = Router();

router.get('/', authenticateToken, MatriculaController.getAll);
router.get('/:id', authenticateToken, MatriculaController.getById);
router.get('/aluno/:alunoId/disponiveis', authenticateToken, MatriculaController.getTurmasDisponiveis);

export default router;
