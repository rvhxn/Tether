import { Router } from 'express';
import { getVaultCollisions, saveVaultCollision, deleteVaultCollision } from '../controllers/vault.js';

const router = Router();

router.get('/', getVaultCollisions);
router.post('/', saveVaultCollision);
router.delete('/:id', deleteVaultCollision);

export default router;
