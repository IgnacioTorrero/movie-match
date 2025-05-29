import { Router, Request, Response } from 'express';
import { prisma } from '../prisma';

const router = Router();

router.get('/api/users/:id', async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = parseInt(req.params.id);

      if (isNaN(userId)) {
        res.status(400).json({ message: 'ID inválido' });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
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