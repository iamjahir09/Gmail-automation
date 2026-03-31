const prisma = require('../prisma');
const path = require('path');

// Transparent 1x1 Pixel
const PIXEL = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
);

const trackOpen = async (req, res) => {
  const { logId } = req.params;

  try {
    const log = await prisma.emailLog.findUnique({
      where: { id: logId },
    });

    if (log && log.status !== 'OPENED') {
      // Update Log
      await prisma.emailLog.update({
        where: { id: logId },
        data: {
          status: 'OPENED',
          openedAt: new Date(),
        },
      });

      // Create Event
      await prisma.event.create({
        data: {
          logId,
          type: 'OPEN',
          metadata: {
            ip: req.ip,
            userAgent: req.get('user-agent'),
          },
        },
      });
    }
  } catch (error) {
    console.error('Tracking Error:', error.message);
  }

  // Send the pixel regardless of error or log status
  res.set({
    'Content-Type': 'image/gif',
    'Content-Length': PIXEL.length,
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    Pragma: 'no-cache',
    Expires: '0',
  });
  res.send(PIXEL);
};

module.exports = { trackOpen };
