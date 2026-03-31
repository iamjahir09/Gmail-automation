const prisma = require('../prisma');

const addAccount = async (req, res) => {
  const { name, email, password, host, port, fromName, assignedUserId } = req.body;

  try {
    // Determine the owner: Explicitly assigned user, otherwise fallback to admin
    let targetUserId = assignedUserId || req.body.userId;
    if (!targetUserId) {
      const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
      if (!admin) throw new Error("No Administrator found to own this account.");
      targetUserId = admin.id;
    }

    const account = await prisma.account.create({
      data: {
        name,
        email,
        password: password,
        host,
        port: parseInt(port),
        fromName,
        userId: targetUserId,
      },
    });
    res.status(201).json(account);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Database Foreign Key Error' });
  }
};

const getAccounts = async (req, res) => {
  try {
    // Include user data so the Admin panel can display who owns each SMTP account
    const accounts = await prisma.account.findMany({
      include: {
        user: {
          select: { name: true, email: true, role: true }
        }
      }
    });
    res.json(accounts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const deleteAccount = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedAccount = await prisma.account.delete({
      where: { id }
    });
    res.json(deletedAccount);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { addAccount, getAccounts, deleteAccount };
