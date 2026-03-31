const prisma = require('../prisma');

const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.user.delete({ where: { id } });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getSystemStats = async (req, res) => {
  try {
    const [userCount, accountCount, campaignCount, logCount] = await Promise.all([
      prisma.user.count(),
      prisma.account.count(),
      prisma.campaign.count(),
      prisma.emailLog.count()
    ]);

    res.json({ userCount, accountCount, campaignCount, logCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getUsers, deleteUser, getSystemStats };
