import { Router, Request, Response } from "express";
import { prisma } from "../prisma";

const router = Router();

/**
 * @route   GET /api/users/:id
 * @desc    Retrieves the user's public data by ID
 * @access  Public or Authenticated (depending on future protection)
 */
router.get("/:id", async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = Number(req.params.id);

    if (!Number.isInteger(userId) || userId <= 0) {
      res.status(400).json({ message: "Invalid ID" });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true },
    });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error searching for user:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

export default router;