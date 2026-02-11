const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createCharge = async (req, res) => {
  try {
    const { type, amount, date, cultureId } = req.body;
    const charge = await prisma.charge.create({
      data: {
        type,
        amount: parseFloat(amount),
        date: new Date(date),
        cultureId: parseInt(cultureId),
      },
    });
    res.status(201).json(charge);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCharges = async (req, res) => {
  try {
    const { cultureId } = req.query;
    const where = cultureId ? { cultureId: parseInt(cultureId) } : {};
    const charges = await prisma.charge.findMany({ where });
    res.json(charges);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateCharge = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, amount, date } = req.body;
    const userId = req.user.userId;

    const charge = await prisma.charge.findFirst({
      where: { id: parseInt(id), culture: { parcelle: { exploitation: { userId } } } }
    });
    if (!charge) return res.status(404).json({ message: 'Charge not found or access denied' });

    const updated = await prisma.charge.update({
      where: { id: parseInt(id) },
      data: {
        type,
        amount: amount ? parseFloat(amount) : undefined,
        date: date ? new Date(date) : undefined
      }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteCharge = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    // Verify ownership via hierarchy
    const charge = await prisma.charge.findFirst({
      where: { id: parseInt(id), culture: { parcelle: { exploitation: { userId } } } }
    });
    if (!charge) return res.status(404).json({ message: 'Charge not found or access denied' });

    await prisma.charge.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Charge deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createCharge, getCharges, updateCharge, deleteCharge };
