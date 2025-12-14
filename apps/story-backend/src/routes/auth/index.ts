import { Router } from 'express';
import { register } from './register';
import { login } from './login';
import { logout } from './logout';
import { checkSession } from './session';
import { requestPasswordReset } from './requestPasswordReset';
import { resetPassword, validateResetToken } from './resetPassword';

const router = Router();

router.post('/auth/register', register);
router.post('/auth/login', login);
router.post('/auth/logout', logout);
router.get('/auth/session', checkSession);
router.post('/auth/request-password-reset', requestPasswordReset);
router.post('/auth/reset-password', resetPassword);
router.get('/auth/validate-reset-token/:token', validateResetToken);

export default router;