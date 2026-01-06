const emailService = require('./email.service');

/**
 * Generate email template for buyer delivery confirmation request
 * @param {Object} subOrder - SubOrder with populated buyer and product info
 * @returns {Object} - { subject, html }
 */
const generateBuyerDeliveryConfirmationEmail = (subOrder) => {
  const subOrderId = subOrder._id.toString();
  const confirmUrl = `${emailService.FRONTEND_URL}/order/confirm-delivery?subOrderId=${subOrderId}&confirmed=true`;
  const reportIssueUrl = `${emailService.FRONTEND_URL}/report-issue`;
  const buyerName = subOrder.buyer_id?.name || 'Customer';
  const orderId = subOrderId.slice(-8);
  const trackingNumber = subOrder.tracking_number || 'N/A';

  const subject = 'Please Confirm Your Order Delivery';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirm Your Order Delivery</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #121416 0%, #2a2d30 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">📦 Order Delivery Confirmation</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px;">Hi ${buyerName},</p>
        
        <p style="font-size: 16px;">
          The seller has marked your order as delivered. Please confirm if you have received your package.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #121416;">
          <p style="margin: 5px 0;"><strong>Order ID:</strong> ${orderId}</p>
          <p style="margin: 5px 0;"><strong>Tracking Number:</strong> ${trackingNumber}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${confirmUrl}" style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            ✅ Yes, I Received It
          </a>
        </div>
        
        <div style="text-align: center; margin: 20px 0;">
          <p style="font-size: 14px; color: #666; margin-bottom: 10px;">
            Having issues with your order?
          </p>
          <a href="${reportIssueUrl}" style="display: inline-block; color: #121416; text-decoration: underline; font-size: 14px;">
            Report an Issue
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          This is an automated email from Shopshop. Please do not reply to this email.
        </p>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
};

/**
 * Generate email template for admin notification when buyer disputes delivery
 * @param {Object} subOrder - SubOrder with populated buyer, seller, and product info
 * @returns {Object} - { subject, html }
 */
const generateAdminDisputeNotificationEmail = (subOrder) => {
  const subOrderId = subOrder._id.toString();
  const orderId = subOrderId.slice(-8);
  const buyerName = subOrder.buyer_id?.name || 'Unknown';
  const buyerEmail = subOrder.buyer_id?.email || 'Unknown';
  const sellerName = subOrder.seller_id?.name || 'Unknown';
  const currentStatus = subOrder.orderStatus || 'Unknown';

  const subject = `⚠️ Delivery Dispute - Order ${orderId}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Delivery Dispute Notification</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">⚠️ Delivery Dispute Alert</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px;">A buyer has reported that they did not receive their order.</p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ef4444;">
          <h3 style="margin-top: 0; color: #ef4444;">Order Details</h3>
          <p style="margin: 5px 0;"><strong>Sub-Order ID:</strong> ${orderId}</p>
          <p style="margin: 5px 0;"><strong>Current Order Status:</strong> ${currentStatus}</p>
          <p style="margin: 5px 0;"><strong>Buyer Feedback:</strong> Not received</p>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Buyer Information</h3>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${buyerName}</p>
          <p style="margin: 5px 0;"><strong>Email:</strong> ${buyerEmail}</p>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Seller Information</h3>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${sellerName}</p>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px;">
          Please review this case and take appropriate action.
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          This is an automated notification from Shopshop.
        </p>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
};

/**
 * Generate email template for gift card notification
 * @param {Object} params - { recipientName, senderName }
 * @returns {Object} - { subject, html }
 */
const generateGiftCardNotificationEmail = ({ recipientName, senderName }) => {
  const subject = `🎁 You've Received a Gift Card from ${senderName}!`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>You've Received a Gift Card!</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #FF0808 0%, #FF4040 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">🎁 You've Received a Gift Card!</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px;">Hi ${recipientName || 'there'},</p>
        
        <p style="font-size: 16px;">
          <strong>${senderName}</strong> has sent you a gift card!
        </p>
        
        <p style="font-size: 16px;">
          Your gift card PDF is attached to this email. You can use the gift card code from the PDF at checkout to apply the balance to your purchase.
        </p>
        
        <p style="font-size: 16px; margin-top: 20px;">
          Happy shopping! 🛍️
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          This is an automated email from Shopshop. Please do not reply to this email.
        </p>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
};

/**
 * Generate email template for user registration success
 * @param {Object} params - { userName, userEmail, role }
 * @returns {Object} - { subject, html }
 */
const generateRegistrationSuccessEmail = ({ userName, userEmail, role }) => {
  const isSeller = role === 'seller';
  const subject = isSeller
    ? 'Welcome to Shopshop - Start Selling Today! 🚀'
    : 'Welcome to Shopshop - Start Shopping Now! 🛍️';

  const shopUrl = `${emailService.FRONTEND_URL}`;
  const sellUrl = `${emailService.FRONTEND_URL}/sell`;
  const exploreUrl = `${emailService.FRONTEND_URL}/categories`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Shopshop!</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #121416 0%, #2a2d30 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">${
          isSeller ? '🚀 Welcome to Shopshop!' : '🛍️ Welcome to Shopshop!'
        }</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px;">Hi ${userName},</p>
        
        <p style="font-size: 16px;">
          ${
            isSeller
              ? "Congratulations! Your seller account has been successfully created. You're now ready to start selling on Shopshop!"
              : 'Thank you for joining Shopshop! Your account has been successfully created. Start exploring amazing products and great deals!'
          }
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #121416;">
          <h3 style="margin-top: 0; color: #121416;">${
            isSeller ? 'Next Steps:' : "What's Next?"
          }</h3>
          ${
            isSeller
              ? `
              <p style="margin: 10px 0;">1. Complete your seller profile</p>
              <p style="margin: 10px 0;">2. Add your first product</p>
              <p style="margin: 10px 0;">3. Start receiving orders from buyers</p>
            `
              : `
              <p style="margin: 10px 0;">1. Browse our wide selection of products</p>
              <p style="margin: 10px 0;">2. Add items to your cart</p>
              <p style="margin: 10px 0;">3. Enjoy secure checkout and fast delivery</p>
            `
          }
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${
            isSeller ? sellUrl : exploreUrl
          }" style="display: inline-block; background: #121416; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            ${isSeller ? 'Go to Seller Dashboard' : 'Start Shopping'}
          </a>
        </div>
        
        <div style="text-align: center; margin: 20px 0;">
          <a href="${shopUrl}" style="display: inline-block; color: #121416; text-decoration: underline; font-size: 14px;">
            Visit Shopshop Homepage
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          This is an automated email from Shopshop. Please do not reply to this email.
        </p>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
};

/**
 * Generate email template for password reset
 * @param {Object} params - { userName, resetUrl }
 * @returns {Object} - { subject, html }
 */
const generatePasswordResetEmail = ({ userName, resetUrl }) => {
  const subject = 'Reset your Shopshop password';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #121416 0%, #2a2d30 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Reset your password</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px;">Hi ${userName || 'there'},</p>
        
        <p style="font-size: 16px;">
          We received a request to reset the password for your Shopshop account.
          If you made this request, please click the button below to choose a new password.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="display: inline-block; background: #121416; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Reset password
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666;">
          This link will expire in 1 hour. If you did not request a password reset, you can safely ignore this email and your password will remain unchanged.
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          This is an automated email from Shopshop. Please do not reply to this email.
        </p>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
};

/**
 * Generate email template for order placement success (buyer)
 * @param {Object} order - Order with populated details
 * @returns {Object} - { subject, html }
 */
const generateOrderSuccessEmail = (order) => {
  const orderId = order._id?.toString() || order._id || 'N/A';
  const shortOrderId = orderId.slice(-8);
  const buyerName = order.user_id?.name || order.buyerName || 'Customer';
  const orderDate = order.created_at
    ? new Date(order.created_at).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  const finalTotal = order.finalTotal || 0;
  const paymentMethod = order.paymentMethod || 'N/A';
  const orderStatusUrl = `${emailService.FRONTEND_URL}/order-success?orderId=${orderId}`;
  const myOrdersUrl = `${emailService.FRONTEND_URL}/my-orders`;

  // Format sub-orders summary
  let subOrdersSummary = '';
  if (order.sub_orders_details && order.sub_orders_details.length > 0) {
    subOrdersSummary = order.sub_orders_details
      .map((subOrder, index) => {
        const sellerName =
          subOrder.seller_info?.businessName ||
          subOrder.seller_info?.name ||
          'Seller';
        const productCount = subOrder.products_list?.length || 0;
        return `<p style="margin: 5px 0;">• ${sellerName} - ${productCount} item(s)</p>`;
      })
      .join('');
  }

  const subject = '✅ Order Placed Successfully!';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">✅ Order Placed Successfully!</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px;">Hi ${buyerName},</p>
        
        <p style="font-size: 16px;">
          Thank you for your order! We've received your order and will process it shortly.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
          <h3 style="margin-top: 0; color: #10b981;">Order Summary</h3>
          <p style="margin: 5px 0;"><strong>Order ID:</strong> ${shortOrderId}</p>
          <p style="margin: 5px 0;"><strong>Order Date:</strong> ${orderDate}</p>
          <p style="margin: 5px 0;"><strong>Total Amount:</strong> LKR ${finalTotal.toLocaleString(
            'en-US',
            { minimumFractionDigits: 2, maximumFractionDigits: 2 }
          )}</p>
          <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${paymentMethod.toUpperCase()}</p>
          ${
            subOrdersSummary
              ? `<div style="margin-top: 15px;"><strong>Items from:</strong>${subOrdersSummary}</div>`
              : ''
          }
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${orderStatusUrl}" style="display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            View Order Details
          </a>
        </div>
        
        <div style="text-align: center; margin: 20px 0;">
          <a href="${myOrdersUrl}" style="display: inline-block; color: #121416; text-decoration: underline; font-size: 14px;">
            View All My Orders
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          This is an automated email from Shopshop. Please do not reply to this email.
        </p>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
};

/**
 * Generate email template for new order notification (seller)
 * @param {Object} subOrder - SubOrder with populated buyer and product info
 * @returns {Object} - { subject, html }
 */
const generateSellerNewOrderEmail = (subOrder) => {
  const subOrderId = subOrder._id?.toString() || subOrder._id || 'N/A';
  const shortOrderId = subOrderId.slice(-8);
  const sellerName =
    subOrder.seller_id?.name ||
    subOrder.seller_id?.sellerInfo?.businessName ||
    'Seller';
  const buyerName = subOrder.buyer_id?.name || 'Customer';
  const orderTotal = subOrder.finalTotal || 0;
  const productCount = subOrder.products_list?.length || 0;
  const sellerDashboardUrl = `${emailService.FRONTEND_URL}/sell/orders`;

  const subject = `🛒 New Order Received - Order #${shortOrderId}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Order Received</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">🛒 New Order Received!</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px;">Hi ${sellerName},</p>
        
        <p style="font-size: 16px;">
          Great news! You've received a new order from a customer.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3b82f6;">
          <h3 style="margin-top: 0; color: #3b82f6;">Order Details</h3>
          <p style="margin: 5px 0;"><strong>Order ID:</strong> ${shortOrderId}</p>
          <p style="margin: 5px 0;"><strong>Customer:</strong> ${buyerName}</p>
          <p style="margin: 5px 0;"><strong>Items:</strong> ${productCount} product(s)</p>
          <p style="margin: 5px 0;"><strong>Order Total:</strong> LKR ${orderTotal.toLocaleString(
            'en-US',
            { minimumFractionDigits: 2, maximumFractionDigits: 2 }
          )}</p>
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${sellerDashboardUrl}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            View Order in Dashboard
          </a>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 20px;">
          Please process and ship this order as soon as possible to ensure customer satisfaction.
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          This is an automated email from Shopshop. Please do not reply to this email.
        </p>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
};

/**
 * Generate email template for main order delivered (buyer)
 * @param {Object} order - Main order with populated details
 * @returns {Object} - { subject, html }
 */
const generateOrderDeliveredEmail = (order) => {
  const orderId = order._id?.toString() || order._id || 'N/A';
  const shortOrderId = orderId.slice(-8);
  const buyerName = order.user_id?.name || order.buyerName || 'Customer';
  const reportIssueUrl = `${emailService.FRONTEND_URL}/report-issue`;
  const myOrdersUrl = `${emailService.FRONTEND_URL}/my-orders`;

  const subject = '🎉 Your Order Has Been Delivered!';

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Delivered</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">🎉 Order Delivered!</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px;">Hi ${buyerName},</p>
        
        <p style="font-size: 16px;">
          Great news! Your order has been successfully delivered. We hope you're happy with your purchase!
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
          <h3 style="margin-top: 0; color: #10b981;">Order Information</h3>
          <p style="margin: 5px 0;"><strong>Order ID:</strong> ${shortOrderId}</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> Delivered ✅</p>
        </div>
        
        <p style="font-size: 16px; margin-top: 20px;">
          If you have any issues with your order or need to report a problem, please use the link below.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${reportIssueUrl}" style="display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            Report an Issue
          </a>
        </div>
        
        <div style="text-align: center; margin: 20px 0;">
          <a href="${myOrdersUrl}" style="display: inline-block; color: #121416; text-decoration: underline; font-size: 14px;">
            View My Orders
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          This is an automated email from Shopshop. Please do not reply to this email.
        </p>
      </div>
    </body>
    </html>
  `;

  return { subject, html };
};

/**
 * Generate email template for issue report confirmation
 * @param {Object} params - { userName, userEmail, issueType, subject, issueReportId }
 * @returns {Object} - { subject, html }
 */
const generateIssueReportConfirmationEmail = ({
  userName,
  userEmail,
  issueType,
  subject,
  issueReportId,
}) => {
  const issueTypeLabels = {
    order: 'Order Issue',
    product: 'Product Issue',
    delivery: 'Delivery Issue',
    payment: 'Payment Issue',
    review: 'Review Issue',
    other: 'Other Issue',
  };

  const issueTypeLabel = issueTypeLabels[issueType] || 'Issue';
  const myIssuesUrl = `${emailService.FRONTEND_URL}/my-orders`;

  const emailSubject = `${issueTypeLabel} Report Received`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Issue Report Received</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #528bc5 0%, #4a7bb3 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">Issue Report Received</h1>
      </div>
      
      <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
        <p style="font-size: 16px;">Hello ${userName},</p>
        
        <p style="font-size: 16px;">
          Thank you for contacting us. Your issue report has been received and is now under review by our support team.
        </p>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #528bc5;">
          <h3 style="margin-top: 0; color: #528bc5;">Report Details</h3>
          <p style="margin: 5px 0;"><strong>Issue Type:</strong> ${issueTypeLabel}</p>
          <p style="margin: 5px 0;"><strong>Subject:</strong> ${subject}</p>
          <p style="margin: 5px 0;"><strong>Report ID:</strong> ${issueReportId.slice(
            -8
          )}</p>
          <p style="margin: 5px 0;"><strong>Status:</strong> Pending Review</p>
        </div>
        
        <p style="font-size: 16px; margin-top: 20px;">
          We are reviewing the matter and will provide an update as soon as possible, typically within 24–48 hours.
        </p>
        
        <p style="font-size: 16px; margin-top: 20px;">
          If additional information is required, we will contact you.
        </p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${myIssuesUrl}" style="display: inline-block; background: #528bc5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold;">
            View My Orders
          </a>
        </div>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="font-size: 12px; color: #999; text-align: center;">
          This is an automated email from Shopshop. Please do not reply to this email. If you need immediate assistance, please contact our support team directly.
        </p>
      </div>
    </body>
    </html>
  `;

  return { subject: emailSubject, html };
};

module.exports = {
  generateBuyerDeliveryConfirmationEmail,
  generateAdminDisputeNotificationEmail,
  generateGiftCardNotificationEmail,
  generateRegistrationSuccessEmail,
  generateOrderSuccessEmail,
  generateSellerNewOrderEmail,
  generateOrderDeliveredEmail,
  generateIssueReportConfirmationEmail,
  generatePasswordResetEmail,
};
