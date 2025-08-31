import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import nodemailer from 'nodemailer';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ request }) => {
  const { orderDetails } = await request.json();

  // Create a transporter object using the default SMTP transport with Gmail
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: env.GMAIL_USER, // Your Gmail address from .env
      pass: env.GMAIL_APP_PASSWORD, // Your Gmail App Password from .env
    },
  });

  // Calculate total price for the email
  const totalPrice = orderDetails.product.price * orderDetails.quantity;

  // Set up email data
  const mailOptions = {
    from: `"ML Club Merch" <${env.GMAIL_USER}>`, // sender address
    to: orderDetails.email, // list of receivers
    subject: `Your ML Club Order is Confirmed! (Order #${orderDetails.id})`, // Subject line
    html: `
      <h1>Thanks for your order, ${orderDetails.fullName}!</h1>
      <p>We've received your order and will begin processing it shortly.</p>
      <h3>Order Summary:</h3>
      <ul>
        <li>Product: ${orderDetails.product.name}</li>
        <li>Size: ${orderDetails.tshirtSize}</li>
        <li>Quantity: ${orderDetails.quantity}</li>
        <li><strong>Total Price:</strong> ₹${totalPrice}</li>
        <li>Delivery Address: ${orderDetails.deliveryAddress}</li>
        ${orderDetails.include_nits_logo ? '<li>Customization: Includes NIT Silchar Logo</li>' : ''}
        ${orderDetails.include_ml_club_logo ? '<li>Customization: Includes ML Club Logo</li>' : ''}
        ${orderDetails.customPrintText ? `<li>Custom Print: "${orderDetails.customPrintText}"</li>` : ''}
      </ul>
      <p>We will contact you once your payment has been verified.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return json({ success: true, message: 'Email sent successfully' });
  } catch (error) {
    console.error('Nodemailer error:', error);
    return json({ error: 'Failed to send email' }, { status: 500 });
  }
};

