import { Router } from 'express';

const router = Router();

router.get('/', /* listSessions */);
router.delete('/:id', /* revokeSession */);
router.delete('/', /* revokeAllSessions */);

export default router;