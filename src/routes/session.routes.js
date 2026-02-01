import { Router } from 'express';
import { listSessions } from '../controllers/session.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { revokeSession } from '../controllers/session.controller.js';
import { revokeAllSessions } from '../controllers/session.controller.js';
const router = Router();

router.get('/',requireAuth,listSessions);
router.delete('/:id',requireAuth, revokeSession);
router.delete('/', requireAuth, revokeAllSessions);

export default router;