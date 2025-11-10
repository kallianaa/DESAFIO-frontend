import { Router } from 'express';
import AuthController from '../controllers/AuthController';

const router: Router = Router();

router.post('/register', AuthController.register);
router.post('/login', AuthController.login);
router.post('/validate', AuthController.validate);

export default router;
