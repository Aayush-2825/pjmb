import { Router } from 'express';

const router = Router();

router.get('/', /* listAccounts */);
router.delete('/:id', /* disconnectAccount */);

export default router;