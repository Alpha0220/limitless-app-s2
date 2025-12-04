import { NextRequest, NextResponse } from 'next/server';

/**
 * API Route สำหรับอัปโหลดไฟล์ไปยัง Cloudinary
 * Cloudinary API: https://cloudinary.com/documentation/image_upload_api
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { imageBase64, imageType } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Cloudinary configuration
    const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
    const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
    const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { 
          error: 'Cloudinary ไม่ได้ตั้งค่า',
          details: 'กรุณาเพิ่ม CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, และ CLOUDINARY_API_SECRET ใน environment variables'
        },
        { status: 500 }
      );
    }

    // Upload to Cloudinary using signed upload
    // For unsigned upload, you need to create an upload preset first
    const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;
    
    // Use signed upload with API secret
    const timestamp = Math.round(new Date().getTime() / 1000);
    const params = new URLSearchParams();
    params.append('file', `data:${imageType};base64,${imageBase64}`);
    params.append('timestamp', timestamp.toString());
    
    // Generate signature for signed upload
    const crypto = await import('crypto');
    const signatureString = `timestamp=${timestamp}${CLOUDINARY_API_SECRET}`;
    const signature = crypto.createHash('sha1').update(signatureString).digest('hex');
    params.append('api_key', CLOUDINARY_API_KEY);
    params.append('signature', signature);

    const response = await fetch(uploadUrl, {
      method: 'POST',
      body: params,
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Cloudinary API error:', data);
      return NextResponse.json(
        { 
          error: 'Failed to upload image to Cloudinary',
          details: data.error?.message || 'Unknown error'
        },
        { status: response.status }
      );
    }

    // Return the image URL
    return NextResponse.json(
      { 
        success: true,
        imageUrl: data.secure_url, // Use secure_url for HTTPS
        publicId: data.public_id,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload image',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

