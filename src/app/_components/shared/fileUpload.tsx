// ~/src/app/_components/shared/fileUpload.tsx
import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface FileUploadProps {
    onFileUploaded: (fileUrl: string, description: string) => void;
    onFileRemoved: (fileUrl: string) => void;
    onDescriptionChanged: (fileUrl: string, description: string) => void;
    workOrderItemId?: string | null;
    initialFiles?: { fileUrl: string; description: string }[];
}

const FileUpload: React.FC<FileUploadProps> = ({
    onFileUploaded,
    onFileRemoved,
    onDescriptionChanged,
    workOrderItemId,
    initialFiles = []
}) => {
    const [uploadedFiles, setUploadedFiles] = useState<{ fileUrl: string; description: string }[]>(initialFiles);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const allowedFileTypes = ['image/png', 'image/jpeg', 'application/pdf', 'image/vnd.adobe.photoshop'];
    const allowedExtensions = ['.png', '.jpg', '.jpeg', '.pdf', '.psd'];

    useEffect(() => {
        return () => {
            uploadedFiles.forEach(file => {
                if (file.fileUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(file.fileUrl);
                }
            });
        };
    }, [uploadedFiles]);

    const validateFile = (file: File): boolean => {
        const fileType = file.type;
        const fileExtension = `.${file.name.split('.').pop()?.toLowerCase()}`;
        return allowedFileTypes.includes(fileType) || allowedExtensions.includes(fileExtension);
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!validateFile(file)) {
            setError('Invalid file type. Please upload a PNG, JPG, JPEG, PDF, or PSD file.');
            return;
        }

        setError(null);
        setUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('file', file);
        if (workOrderItemId) {
            formData.append('workOrderItemId', workOrderItemId);
        }

        try {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', '/api/upload', true);

            xhr.upload.onprogress = (event) => {
                if (event.lengthComputable) {
                    const progress = (event.loaded / event.total) * 100;
                    setUploadProgress(Math.round(progress));
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    const response = JSON.parse(xhr.responseText);
                    if (response.success) {
                        const newFile = { fileUrl: response.fileUrl, description: '' };
                        setUploadedFiles(prev => [...prev, newFile]);
                        onFileUploaded(response.fileUrl, '');
                    } else {
                        throw new Error(response.message || 'Upload failed');
                    }
                } else {
                    throw new Error('Upload failed');
                }
            };

            xhr.onerror = () => {
                throw new Error('Upload failed');
            };

            xhr.send(formData);
        } catch (error) {
            console.error('Error uploading file:', error);
            setError('Failed to upload file. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleRemoveFile = (fileUrl: string) => {
        setUploadedFiles(prev => prev.filter(file => file.fileUrl !== fileUrl));
        onFileRemoved(fileUrl);
    };

    const handleDescriptionChange = (fileUrl: string, newDescription: string) => {
        setUploadedFiles(prev =>
            prev.map(file =>
                file.fileUrl === fileUrl ? { ...file, description: newDescription } : file
            )
        );
        onDescriptionChanged(fileUrl, newDescription);
    };

    const renderPreview = (file: { fileUrl: string; description: string }) => {
        const fileExtension = file.fileUrl.split('.').pop()?.toLowerCase();

        if (['jpg', 'jpeg', 'png'].includes(fileExtension || '')) {
            return (
                <Image src={file.fileUrl} alt="File preview" width={100} height={100} objectFit="contain" />
            );
        }

        // For non-image files, show an icon or text
        return (
            <div className="p-4 bg-gray-100 rounded">
                <p className="text-lg font-semibold">{fileExtension?.toUpperCase()} File</p>
                <p className="text-sm text-gray-600">Preview not available</p>
            </div>
        );
    };

    return (
        <div>
            <input
                type="file"
                onChange={handleFileChange}
                disabled={uploading}
                accept={allowedExtensions.join(',')}
                className="file-input file-input-bordered w-full max-w-xs"
            />
            <p className="text-sm text-gray-600 mt-1">
                Allowed file types: PNG, JPG, JPEG, PDF, PSD
            </p>
            {uploading && (
                <div className="mt-2">
                    <progress className="progress w-56" value={uploadProgress} max="100"></progress>
                    <p>{uploadProgress}% Uploaded</p>
                </div>
            )}
            {error && <p className="text-red-500 mt-2">{error}</p>}
            {uploadedFiles.map((file, index) => (
                <div key={index} className="mt-4 p-4 border rounded">
                    {renderPreview(file)}
                    <div className="mt-2">
                        <input
                            type="text"
                            value={file.description}
                            onChange={(e) => handleDescriptionChange(file.fileUrl, e.target.value)}
                            placeholder="Enter description"
                            className="input input-bordered w-full"
                        />
                    </div>
                    <button
                        onClick={() => handleRemoveFile(file.fileUrl)}
                        className="btn btn-sm btn-error mt-2"
                    >
                        Remove
                    </button>
                </div>
            ))}
        </div>
    );
};

export default FileUpload;