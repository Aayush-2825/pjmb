import { Router } from 'express';
import { listAccounts, disconnectAccount } from '../controllers/account.controller.js';
import { requireAuth } from '../middlewares/requireAuth.js';

const router = Router();

router.get('/', requireAuth, listAccounts);
router.delete('/:id', requireAuth, disconnectAccount);



export default router;