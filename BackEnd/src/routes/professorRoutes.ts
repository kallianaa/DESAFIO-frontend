import { Router } from 'express';
import ProfessorController from '../controllers/ProfessorController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router: Router = Router();

router.get('/', authenticateToken, ProfessorController.getAll);
router.get('/:id', authenticateToken, ProfessorController.getById);
router.put('/:id', authenticateToken, requireAdmin, ProfessorController.update);
router.delete('/:id', authenticateToken, requireAdmin, ProfessorController.delete);
router.get('/:id/turmas', authenticateToken, ProfessorController.getTurmas);

export default router;
