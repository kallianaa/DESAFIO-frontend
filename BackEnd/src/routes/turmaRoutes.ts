import { Router } from 'express';
import TurmaController from '../controllers/TurmaController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router: Router = Router();

router.get('/', authenticateToken, TurmaController.getAll);
router.get('/:id', authenticateToken, TurmaController.getById);
router.get('/:id/alunos', authenticateToken, TurmaController.getAlunos);
router.post('/', authenticateToken, requireAdmin, TurmaController.create);
router.put('/:id', authenticateToken, requireAdmin, TurmaController.update);
router.delete('/:id', authenticateToken, requireAdmin, TurmaController.delete);

export default router;
