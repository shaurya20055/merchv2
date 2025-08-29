// src/routes/api/uploads/+server.ts

import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { v2 as cloudinary } from 'cloudinary';
import { env } from '$env/dynamic/private';

// Configure Cloudinary from your .env variables
cloudinary.config({ 
  cloud_name: env.CLOUDINARY_CLOUD_NAME, 
  api_key: env.CLOUDINARY_API_KEY, 
  api_secret: env.CLOUDINARY_API_SECRET 
});

export const POST: RequestHandler = async ({ request }) => {
  try {
    const formData = await request.formData();
    const file = formData.get('screenshot') as File;

    if (!file) {
      return json({ error: 'No file uploaded.' }, { status: 400 });
    }

    // Convert the file to a format Cloudinary can accept
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Use a Promise to upload the stream to Cloudinary
    const uploadResult: any = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            { folder: 'payment-screenshots' },
            (error, result) => {
                if (error) return reject(error);
                resolve(result);
            }
        ).end(buffer);
    });

    if (!uploadResult || !uploadResult.secure_url) {
        throw new Error('Cloudinary upload failed');
    }

    // Return the secure URL of the uploaded image
    return json({ screenshotUrl: uploadResult.secure_url });

  } catch (error) {
    console.error('Error uploading screenshot:', error);
    return json({ error: 'Failed to upload screenshot' }, { status: 500 });
  }
}
