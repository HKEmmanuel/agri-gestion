const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createCulture = async (req, res) => {
  try {
    const { type, sowingDate, parcelleId } = req.body;
    const culture = await prisma.culture.create({
      data: { 
        type, 
        sowingDate: new Date(sowingDate), 
        parcelleId: parseInt(parcelleId) 
      },
    });
    res.status(201).json(culture);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCultures = async (req, res) => {
  try {
    const { parcelleId } = req.query;
    const userId = req.user.userId;

    const where = parcelleId 
      ? { parcelleId: parseInt(parcelleId), parcelle: { exploitation: { userId } } } 
      : { parcelle: { exploitation: { userId } } };

    const cultures = await prisma.culture.findMany({
      where,
      include: { 
        charges: true, 
        recoltes: true,
        parcelle: { include: { exploitation: true } }
      },
    });
    res.json(cultures);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCultureById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const culture = await prisma.culture.findFirst({
      where: { id: parseInt(id), parcelle: { exploitation: { userId } } },
      include: { 
        charges: true, 
        recoltes: true,
        parcelle: { include: { exploitation: true } }
      },
    });
    if (!culture) return res.status(404).json({ message: 'Culture not found' });
    res.json(culture);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateCulture = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, sowingDate, status, isValidated } = req.body;
    const userId = req.user.userId;
    const role = req.user.role;

    const culture = await prisma.culture.findFirst({
      where: { id: parseInt(id), parcelle: { exploitation: { userId } } }
    });
    // If not owner, check if admin (admins can update any culture for validation)
    if (!culture && role !== 'admin') return res.status(404).json({ message: 'Culture not found or access denied' });

    const updated = await prisma.culture.update({
      where: { id: parseInt(id) },
      data: { 
        type, 
        sowingDate: sowingDate ? new Date(sowingDate) : undefined,
        status,
        isValidated: role === 'admin' ? isValidated : undefined
      }
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteCulture = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;
    const culture = await prisma.culture.findFirst({
      where: { id: parseInt(id), parcelle: { exploitation: { userId } } }
    });
    if (!culture) return res.status(404).json({ message: 'Culture not found or access denied' });

    await prisma.culture.delete({ where: { id: parseInt(id) } });
    res.json({ message: 'Culture deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createCulture, getCultures, getCultureById, updateCulture, deleteCulture };
