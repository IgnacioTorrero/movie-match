import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/api/users/:id', async (req: Request, res: Response): Promise<void> => {
    try {
      const user = await prisma.user.findUnique({
        where: { id: parseInt(req.params.id) },
        select: { id: true, email: true },
      });
  
      if (!user) {
        res.status(404).json({ message: 'Usuario no encontrado' });
        return;
      }
  
      res.json(user);
    } catch (error) {
      console.error('Error al buscar usuario:', error);
      res.status(500).json({ message: 'Error interno del servidor' });
    }
  });  

export default router;