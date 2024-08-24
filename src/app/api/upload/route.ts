// ~/app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

const allowedFileTypes = ['image/png', 'image/jpeg', 'application/pdf', 'image/vnd.adobe.photoshop'];
const allowedExtensions = ['.png', '.jpg', '.jpeg', '.pdf', '.psd'];

export async function POST(request: NextRequest) {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const workOrderItemId = data.get('workOrderItemId');

    if (!file) {
        return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    if (!allowedFileTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
        return NextResponse.json({ success: false, message: 'Invalid file type' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileName = `${Date.now()}${fileExtension}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    const filePath = join(uploadDir, fileName);

    try {
        await writeFile(filePath, buffer);
        console.log(`Uploaded file saved to ${filePath}`);

        // Here you would typically save the fileUrl to your database
        // associated with the workOrderItemId if it exists

        const fileUrl = `/uploads/${fileName}`;
        return NextResponse.json({
            success: true,
            fileUrl,
            message: 'File uploaded successfully'
        });
    } catch (error) {
        console.error('Error saving file:', error);
        return NextResponse.json({ success: false, message: 'Error saving file' }, { status: 500 });
    }
}