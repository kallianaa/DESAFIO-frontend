import { Router } from 'express';
import AlunoController from '../controllers/AlunoController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router: Router = Router();

router.get('/', authenticateToken, AlunoController.getAll);
router.get('/:id', authenticateToken, AlunoController.getById);
router.put('/:id', authenticateToken, AlunoController.update);
router.delete('/:id', authenticateToken, requireAdmin, AlunoController.delete);
router.get('/:id/matriculas', authenticateToken, AlunoController.getMatriculas);

export default router;
