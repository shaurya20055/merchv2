import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import nodemailer from 'nodemailer';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { orderDetails } = await request.json();

    if (!orderDetails) {
      return json({ error: 'Missing order details' }, { status: 400 });
    }

    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: env.GMAIL_USER,
        pass: env.GMAIL_APP_PASSWORD, 
      },
    });

    // Set up the email data
    const mailOptions = {
      from: `"ML Club Merch" <${env.GMAIL_USER}>`, // sender address
      to: orderDetails.email, // The customer's email address
      subject: `Your ML Club Order is Confirmed! (Order #${orderDetails.id})`, // Subject line
      html: `
        <h1>Thanks for your order, ${orderDetails.fullName}!</h1>
        <p>We've received your order and will begin processing it shortly.</p>
        <h3>Order Summary:</h3>
        <ul>
          <li>Product: ${orderDetails.product.name}</li>
          <li>Price: ₹${orderDetails.product.price}</li>
          <li>Size: ${orderDetails.tshirtSize}</li>
          <li>Delivery Address: ${orderDetails.deliveryAddress}</li>
          ${orderDetails.include_nits_logo ? '<li>Customization: Includes NIT Silchar Logo</li>' : ''}
          ${orderDetails.include_ml_club_logo ? '<li>Customization: Includes ML Club Logo</li>' : ''}
        </ul>
        <p>We will contact you once your payment has been verified.</p>
      `,
    };
  
    // Send the email
    await transporter.sendMail(mailOptions);
    
    return json({ success: true, message: 'Email sent successfully' });

  } catch (error) {
    console.error('Nodemailer error:', error);
    return json({ error: 'Failed to send email' }, { status: 500 });
  }
};

