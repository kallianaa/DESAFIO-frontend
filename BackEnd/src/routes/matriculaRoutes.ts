import { Router } from 'express';
import MatriculaController from '../controllers/MatriculaController';
import { authenticateToken } from '../middleware/auth';

const router: Router = Router();

router.get('/', authenticateToken, MatriculaController.getAll);
router.get('/disponiveis', authenticateToken, MatriculaController.getTurmasDisponiveis);
router.get('/:id', authenticateToken, MatriculaController.getById);
router.post('/', authenticateToken, MatriculaController.create);
router.delete('/:id', authenticateToken, MatriculaController.cancel);

export default router;
