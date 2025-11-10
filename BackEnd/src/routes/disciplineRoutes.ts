import { Router } from 'express';
import DisciplinaController from '../controllers/DisciplinaController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router: Router = Router();

router.get('/', authenticateToken, DisciplinaController.getAll);
router.get('/:id', authenticateToken, DisciplinaController.getById);
router.get('/:id/turmas', authenticateToken, DisciplinaController.getTurmas);
router.post('/', authenticateToken, requireAdmin, DisciplinaController.create);
router.put('/:id', authenticateToken, requireAdmin, DisciplinaController.update);
router.delete('/:id', authenticateToken, requireAdmin, DisciplinaController.delete);

export default router;
