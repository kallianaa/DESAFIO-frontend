import { Router } from 'express';
import UsuarioController from '../controllers/UsuarioController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router: Router = Router();

router.get('/', authenticateToken, requireAdmin, UsuarioController.getAll);
router.get('/:id', authenticateToken, UsuarioController.getById);
router.put('/:id', authenticateToken, UsuarioController.update);
router.delete('/:id', authenticateToken, requireAdmin, UsuarioController.delete);

export default router;
