import { Router } from 'express';

const router = Router();

router.get('/', /* listUsers */);
router.get('/:id', /* getUser */);
router.patch('/:id', /* updateUser */);
router.delete('/:id', /* deleteUser */);
router.patch('/:id/block', /* toggleBlockUser */);
router.get('/:id/sessions', /* listUserSessions */);
router.delete('/:id/sessions/:sessionId', /* revokeSession */);
router.delete('/:id/sessions', /* revokeAllSessions */);

export default router;