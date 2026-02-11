const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createRecolte = async (req, res) => {
  try {
    const { quantity, price, date, cultureId } = req.body;
    const recolte = await prisma.recolte.create({
      data: {
        quantity: parseFloat(quantity),
        price: parseFloat(price),
        date: new Date(date),
        cultureId: parseInt(cultureId),
      },
    });
    res.status(201).json(recolte);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getRecoltes = async (req, res) => {
  try {
    const { cultureId } = req.query;
    const where = cultureId ? { cultureId: parseInt(cultureId) } : {};
    const recoltes = await prisma.recolte.findMany({ where });
    res.json(recoltes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateRecolte = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity, price, date } = req.body;
    const userId = req.user.userId;

    const recolte = await prisma.recolte.findFirst({
      where: { id: parseInt(id), culture: { parcelle: { exploitation: { userId } } } }
    });
    if (!recolte) return res.status(404).json({ message: 'Recolte not found or access denied' });

    const updated = await prisma.recolte.update({
      where: { id: parseInt(id) },
      data: {
        quantity: quantity ? parseFloat(quantity) : undefined,
        price: price ? parseFloat(price) : undefined,
        date: date ? new Date(date) : undefined
      }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteRecolte = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const recolte = await prisma.recolte.findFirst({
      where: { id: parseInt(id), culture: { parcelle: { exploitation: { userId } } } }
    });
    if (!recolte) return res.status(404).json({ message: 'Recolte not found or access denied' });

    await prisma.recolte.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Recolte deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createRecolte, getRecoltes, updateRecolte, deleteRecolte };
