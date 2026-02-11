const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createParcelle = async (req, res) => {
  try {
    const { name, area, exploitationId } = req.body;
    const parcelle = await prisma.parcelle.create({
      data: { name, area: parseFloat(area), exploitationId: parseInt(exploitationId) },
    });
    res.status(201).json(parcelle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getParcelles = async (req, res) => {
  try {
    const { exploitationId } = req.query;
    const userId = req.user.userId;
    
    // If exploitationId is provided, verify it belongs to the user
    if (exploitationId) {
      const exp = await prisma.exploitation.findFirst({
        where: { id: parseInt(exploitationId), userId }
      });
      if (!exp) return res.status(403).json({ message: 'Access denied' });
    }

    const where = exploitationId 
      ? { exploitationId: parseInt(exploitationId) } 
      : { exploitation: { userId } };

    const parcelles = await prisma.parcelle.findMany({
      where,
      include: { cultures: true },
    });
    res.json(parcelles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getParcelleById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const parcelle = await prisma.parcelle.findFirst({
      where: { id: parseInt(id), exploitation: { userId } },
      include: { cultures: true, exploitation: true },
    });
    if (!parcelle) return res.status(404).json({ message: 'Parcelle not found' });
    res.json(parcelle);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateParcelle = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, area } = req.body;
    const userId = req.user.userId;

    const parcelle = await prisma.parcelle.findFirst({
      where: { id: parseInt(id), exploitation: { userId } }
    });
    if (!parcelle) return res.status(404).json({ message: 'Parcelle not found or access denied' });

    const updated = await prisma.parcelle.update({
      where: { id: parseInt(id) },
      data: { 
        name, 
        area: area ? parseFloat(area) : undefined 
      }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteParcelle = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const parcelle = await prisma.parcelle.findFirst({
      where: { id: parseInt(id), exploitation: { userId } }
    });
    if (!parcelle) return res.status(404).json({ message: 'Parcelle not found or access denied' });

    await prisma.parcelle.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Parcelle deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createParcelle, getParcelles, getParcelleById, updateParcelle, deleteParcelle };
