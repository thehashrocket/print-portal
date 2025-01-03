// ~/app/api/upload/route.ts
import { type NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';

const allowedFileTypes = [
    'image/png', 
    'image/jpeg', 
    'application/pdf', 
    'image/vnd.adobe.photoshop',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/csv',
    'text/plain',
    'application/csv',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/rtf'
];

const allowedExtensions = [
    '.png', '.jpg', '.jpeg', '.pdf', '.psd',
    '.xls', '.xlsx', '.csv',
    '.doc', '.docx', '.rtf'
];

export async function POST(request: NextRequest) {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;
    const workOrderItemId = data.get('workOrderItemId');
    const fileType = request.headers.get('X-File-Type');
    const fileName = request.headers.get('X-File-Name');

    if (!file) {
        return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
    
    // Special handling for CSV files
    if (fileExtension === '.csv') {
        console.log('Processing CSV file:', {
            name: file.name,
            type: fileType || file.type,
            extension: fileExtension
        });
    }

    // Check both the file type and extension
    const isValidType = allowedFileTypes.includes(file.type) || 
                       allowedFileTypes.includes(fileType || '') ||
                       allowedExtensions.includes(fileExtension);

    if (!isValidType) {
        console.log('Invalid file:', {
            name: file.name,
            type: file.type,
            headerType: fileType,
            extension: fileExtension
        });
        return NextResponse.json({ 
            success: false, 
            message: `Invalid file type. Allowed types: ${allowedExtensions.join(', ')}` 
        }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadFileName = `${Date.now()}${fileExtension}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    const filePath = join(uploadDir, uploadFileName);

    try {
        await writeFile(filePath, buffer);
        console.log(`Uploaded file saved to ${filePath}`);

        const fileUrl = `/uploads/${uploadFileName}`;
        return NextResponse.json({
            success: true,
            fileUrl,
            message: 'File uploaded successfully'
        });
    } catch (error) {
        console.error('Error saving file:', error);
        return NextResponse.json({ 
            success: false, 
            message: 'Error saving file' 
        }, { status: 500 });
    }
}