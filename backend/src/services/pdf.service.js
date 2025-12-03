const PDFDocument = require('pdfkit');

const generateGiftCardPDF = async (data) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: [800, 500],
        margin: 0,
      });

      const buffers = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Background
      doc.rect(0, 0, 800, 500).fill('#0d0d0d');
      doc.rect(0, 0, 800, 500).fill('#111');

      // Main card container
      doc
        .roundedRect(60, 40, 680, 420, 20)
        .fillOpacity(0.18)
        .fill('#FFF')
        .fillOpacity(1)
        .strokeColor('#333')
        .lineWidth(1.3)
        .stroke();

      // Logo / Title
      doc
        .font('Helvetica-Bold')
        .fontSize(32)
        .fillColor('#FFD700')
        .text('ShopShop', 0, 70, { align: 'center' });

      let y = 140;

      // Message (always show - use default if not provided)
      const messageToShow = (data.personalMessage && data.personalMessage.trim()) 
        ? data.personalMessage.trim() 
        : 'A special gift, just for you.';
      
      doc
        .font('Helvetica-Oblique')
        .fontSize(17)
        .fillColor('#f2f2f2')
        .text(`"${messageToShow}"`, 0, y, {
          align: 'center',
          width: 800,
        });

      y += 28; // tight spacing

      // Sender name (immediately under message)
      if (data.senderName) {
        doc
          .font('Helvetica')
          .fontSize(14)
          .fillColor('#b3b3b3')
          .text(`— ${data.senderName} —`, 0, y, {
            align: 'center',
          });

        y += 40; // small gap AFTER the signature
      }

      // "You've received…"
      doc
        .font('Helvetica')
        .fontSize(18)
        .fillColor('#e6e6e6')
        .text("You've received a gift card of", 0, y, {
          align: 'center',
        });

      y += 32;

      // Amount (slightly reduced to balance)
      doc
        .font('Helvetica-Bold')
        .fontSize(34) // not too large
        .fillColor('#FFD700')
        .text(`LKR ${data.amount.toLocaleString()}`, 0, y, { align: 'center' });

      y += 55;

      // Gift Card Code Label
      doc
        .font('Helvetica')
        .fontSize(12)
        .fillColor('#bbbbbb')
        .text('Gift Card Code', 0, y, { align: 'center' });

      y += 6;

      // Code Box
      doc
        .roundedRect(220, y, 360, 52, 10)
        .strokeColor('#FFD700')
        .lineWidth(2)
        .stroke();

      doc
        .font('Courier-Bold')
        .fontSize(24)
        .fillColor('#FFD700')
        .text(data.code, 0, y + 12, {
          align: 'center',
        });

      y += 75;

      // Redemption instructions
      const shopUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      
      doc
        .font('Helvetica')
        .fontSize(11)
        .fillColor('#c2c2c2')
        .text('Use this code at checkout to redeem your gift card.', 0, y, {
          align: 'center',
        });

      y += 18;

      // Shop link - clickable
      const linkText = 'Visit ShopShop';
      const linkTextWidth = doc.widthOfString(linkText, { fontSize: 11 });
      const linkX = (800 - linkTextWidth) / 2;
      
      doc
        .font('Helvetica')
        .fontSize(11)
        .fillColor('#FFD700')
        .text(linkText, linkX, y, {
          link: shopUrl,
          underline: true,
        });

      y += 28;

      // Expiry date
      doc
        .font('Helvetica')
        .fontSize(11)
        .fillColor('#8c8c8c')
        .text(
          `This gift card is valid until ${new Date(
            data.expiryDate
          ).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}.`,
          0,
          y,
          { align: 'center' }
        );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
};

module.exports = { generateGiftCardPDF };
