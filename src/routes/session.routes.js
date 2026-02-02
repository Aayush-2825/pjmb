import { Router } from 'express';
import { listSessions } from '../controllers/session.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';
import { revokeSession } from '../controllers/session.controller.js';
import { revokeAllSessions } from '../controllers/session.controller.js';
import { validate } from '../middlewares/validate.middleware.js';
import { revokeSessionSchema } from '../validators/session.validator.js';

const router = Router();

router.get('/', requireAuth, listSessions);
router.delete('/:id', requireAuth, validate(revokeSessionSchema), revokeSession);
router.delete('/', requireAuth, revokeAllSessions);

export default router;