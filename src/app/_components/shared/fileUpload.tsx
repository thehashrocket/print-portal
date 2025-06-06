// ~/src/app/_components/shared/fileUpload.tsx
import React, { useState, useEffect, useRef } from 'react';
import { FileText, FileSpreadsheet, FileImage, Download } from 'lucide-react';
import { Button } from '../ui/button';
import Image from 'next/image';

interface FileUploadProps {
    onFileUploaded: (fileUrl: string, description: string) => void;
    onFileRemoved: (fileUrl: string) => void;
    onDescriptionChanged: (fileUrl: string, description: string) => void;
    onDescriptionBlur?: (fileUrl: string) => void;
    workOrderItemId?: string | null;
    initialFiles?: { fileUrl: string; description: string }[];
}

const FileUpload: React.FC<FileUploadProps> = ({
    onFileUploaded,
    onFileRemoved,
    onDescriptionChanged,
    onDescriptionBlur,
    workOrderItemId,
    initialFiles = []
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadedFiles, setUploadedFiles] = useState<{ fileUrl: string; description: string }[]>(initialFiles);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

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

    const sanitizeFileName = (description: string | null, extension: string | undefined): string => {
        if (!description) return `file.${extension ?? 'txt'}`;
        
        // Remove special characters and replace spaces with underscores
        const sanitized = description
            .replace(/[^a-zA-Z0-9\s-]/g, '')
            .replace(/\s+/g, '_')
            .slice(0, 30); // Limit to 30 characters
        
        return `${sanitized}.${extension ?? 'txt'}`;
    };

    useEffect(() => {
        return () => {
            uploadedFiles.forEach(file => {
                if (file.fileUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(file.fileUrl);
                }
            });
        };
    }, [uploadedFiles]);

    useEffect(() => {
        setUploadedFiles(initialFiles);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        setError(null);
        setUploadProgress(0);
    }, [initialFiles]);

    const validateFile = (file: File): boolean => {
        const fileType = file.type;
        const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
        
        if (fileExtension === '.csv') {
            return true;
        }

        return allowedFileTypes.includes(fileType) || allowedExtensions.includes(fileExtension);
    };

    const getFileType = (fileUrl: string) => {
        const ext = fileUrl.split('.').pop()?.toLowerCase();
        if (!ext) return 'Unknown';
        if (['jpeg', 'jpg', 'gif', 'png'].includes(ext)) return 'Image';
        if (['pdf', 'doc', 'docx', 'rtf'].includes(ext)) return 'Document';
        if (['xls', 'xlsx', 'csv'].includes(ext)) return 'Spreadsheet';
        if (ext === 'psd') return 'PSD';
        return 'Unknown';
    };

    const getMimeType = (file: File): string => {
        if (file.name.toLowerCase().endsWith('.csv')) {
            return 'text/csv';
        }
        return file.type || 'application/octet-stream';
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!validateFile(file)) {
            setError('Invalid file type. Please upload a supported file type.');
            return;
        }

        setError(null);
        setUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('file', file);
        
        const mimeType = getMimeType(file);
        formData.append('fileType', mimeType);
        formData.append('fileName', file.name);
        formData.append('fileExtension', file.name.split('.').pop()?.toLowerCase() || '');
        
        if (workOrderItemId) {
            formData.append('workOrderItemId', workOrderItemId);
        }

        try {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/upload', true);

            xhr.setRequestHeader('X-File-Type', mimeType);
            xhr.setRequestHeader('X-File-Name', file.name);
            xhr.setRequestHeader('X-File-Extension', file.name.split('.').pop()?.toLowerCase() || '');

            console.log('Uploading file:', {
                name: file.name,
                type: mimeType,
                originalType: file.type,
                size: file.size,
                lastModified: new Date(file.lastModified).toISOString()
            });

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const progress = (event.loaded / event.total) * 100;
                    setUploadProgress(Math.round(progress));
                }
            };

            xhr.onload = () => {
                try {
                    console.log('Response status:', xhr.status);
                    console.log('Response text:', xhr.responseText);
                    
                    const response = JSON.parse(xhr.responseText);
                    
                    if (xhr.status !== 200) {
                        console.error('Server responded with status:', xhr.status);
                        console.error('Response:', response);
                        setError(response.message || `Upload failed with status ${xhr.status}`);
                        return;
                    }

                    if (!response.success) {
                        console.error('Upload not successful:', response);
                        setError(response.message || 'Upload failed - server indicated failure');
                        return;
                    }

                    const newFile = { fileUrl: response.fileUrl, description: '' };
                    setUploadedFiles(prev => [...prev, newFile]);
                    onFileUploaded(response.fileUrl, '');
                    if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                    }
                } catch {
                    console.error('Error parsing response:', xhr.responseText);
                    setError('Server returned an invalid response');
                }
            };

            xhr.onerror = (e) => {
                console.error('XHR Error:', e);
                setError('Network error during upload');
            };

            xhr.send(formData);
        } catch (error) {
            console.error('Error uploading file:', error);
            setError(error instanceof Error ? error.message : 'Failed to upload file. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveFile = (fileUrl: string) => {
        setUploadedFiles(prev => prev.filter(file => file.fileUrl !== fileUrl));
        onFileRemoved(fileUrl);
    };

    const handleDownload = async (fileUrl: string, description: string) => {
        try {
            const response = await fetch(fileUrl);
            const blob = await response.blob();
            const extension = fileUrl.split('.').pop()?.toLowerCase();
            const fileName = sanitizeFileName(description, extension);
            
            // Create a temporary link element to trigger the download
            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(link.href);
        } catch (error) {
            console.error('Error downloading file:', error);
        }
    };

    const handleDescriptionChange = (fileUrl: string, newDescription: string) => {
        setUploadedFiles(prev =>
            prev.map(file =>
                file.fileUrl === fileUrl ? { ...file, description: newDescription } : file
            )
        );
        onDescriptionChanged(fileUrl, newDescription);
    };

    const handleDescriptionBlur = (fileUrl: string) => {
        if (onDescriptionBlur) {
            onDescriptionBlur(fileUrl);
        }
    };

    const renderFileIcon = (fileType: string) => {
        switch (fileType) {
            case 'Image':
                return <FileImage className="h-10 w-10 text-blue-500" />;
            case 'Spreadsheet':
                return <FileSpreadsheet className="h-10 w-10 text-green-500" />;
            default:
                return <FileText className="h-10 w-10 text-red-500" />;
        }
    };

    const renderPreview = (file: { fileUrl: string; description: string }) => {
        const fileType = getFileType(file.fileUrl);
        const fileExtension = file.fileUrl.split('.').pop()?.toLowerCase();

        return (
            <div className="flex flex-col items-center">
                {fileType === 'Image' ? (
                    <>
                        {renderFileIcon(fileType)}
                        <Image 
                            src={file.fileUrl} 
                            alt="File preview" 
                            width={100} 
                            height={100} 
                            className="mt-2" 
                        />
                    </>
                ) : (
                    <>
                        {renderFileIcon(fileType)}
                        <p className="text-sm text-gray-600 mt-2">
                            {fileExtension?.toUpperCase()} {fileType}
                        </p>
                    </>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    disabled={uploading}
                    accept={allowedExtensions.join(',')}
                    className="file-input file-input-bordered w-full max-w-xs"
                />
                <p className="text-sm text-gray-600">
                    Supported files: Images (PNG, JPG), Documents (PDF, DOC, DOCX, RTF), 
                    Spreadsheets (XLS, XLSX, CSV), Design Files (PSD)
                </p>
            </div>

            {uploading && (
                <div className="space-y-1">
                    <progress className="progress w-56" value={uploadProgress} max="100"></progress>
                    <p className="text-sm text-gray-600">{uploadProgress}% Uploaded</p>
                </div>
            )}

            {error && <p className="text-red-500">{error}</p>}

            {/* Show Files in a grid format */}
            <div className="space-y-4 grid grid-cols-2 gap-4">
                {uploadedFiles.map((file, index) => (
                    <div key={index} className="p-4 border rounded space-y-4">
                        {renderPreview(file)}
                        <textarea
                            value={file.description}
                            onChange={(e) => handleDescriptionChange(file.fileUrl, e.target.value)}
                            onBlur={() => handleDescriptionBlur(file.fileUrl)}
                            placeholder="Add description..."
                            className="mt-2 w-full p-2 border rounded"
                            rows={2}
                        />
                        <div className="flex justify-between">
                            <Button
                                variant="destructive"
                                onClick={() => handleRemoveFile(file.fileUrl)}
                                className="w-full"
                            >
                                Remove
                            </Button>
                            <Button 
                                disabled={uploading}
                                variant="outline" 
                                onClick={() => handleDownload(file.fileUrl, file.description)}
                            >
                                <Download className="h-4 w-4" /> Download
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FileUpload;