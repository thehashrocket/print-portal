// ~/src/app/_components/shared/artworkComponent/artworkComponent.tsx
// Accepts props: artworkUrl, artworkDescription
// Conditionally renders an image with the given artworkUrl and description depending on the file type of the artworkUrl
// Renders File Type Icon and Description if the file type is not an image

// Props:
// - artworkUrl: string
// - artworkDescription: string | null

// Usage:
// <ArtworkComponent artworkUrl={artwork.fileUrl} artworkDescription={artwork.description} />

import React from "react";
import Image from "next/image";
import { FileImage, FileText, FileSpreadsheet, DownloadIcon } from "lucide-react";
import { Button } from "../../ui/button";

const sanitizeFileName = (description: string | null, extension: string): string => {
    if (!description) return `file.${extension}`;
    
    // Remove special characters and replace spaces with underscores
    const sanitized = description
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .replace(/\s+/g, '_')
        .slice(0, 30); // Limit to 30 characters
    
    return `${sanitized}.${extension}`;
};

type ArtworkComponentProps = {
    artworkUrl: string;
    artworkDescription: string | null;
};

const ArtworkComponent: React.FC<ArtworkComponentProps> = ({
    artworkUrl,
    artworkDescription,
}) => {
    const fileExtension = artworkUrl.split('.').pop()?.toLowerCase();

    const getFileType = (ext: string | undefined) => {
        if (!ext) return 'Unknown';
        if (['jpeg', 'jpg', 'gif', 'png'].includes(ext)) return 'Image';
        if (['pdf', 'doc', 'docx', 'rtf'].includes(ext)) return 'Document';
        if (['xls', 'xlsx', 'csv'].includes(ext)) return 'Spreadsheet';
        if (ext === 'psd') return 'PSD';
        return 'Unknown';
    };

    const renderFileIcon = () => {
        const type = getFileType(fileExtension);
        switch (type) {
            case 'Image':
                return <FileImage className="h-10 w-10 text-blue-500" />;
            case 'Spreadsheet':
                return <FileSpreadsheet className="h-10 w-10 text-green-500" />;
            default:
                return <FileText className="h-10 w-10 text-red-500" />;
        }
    };

    const handleDownload = async () => {
        try {
            const response = await fetch(artworkUrl);
            const blob = await response.blob();
            const extension = fileExtension || 'unknown';
            const fileName = sanitizeFileName(artworkDescription, extension);
            
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

    return (
        <div>
            {getFileType(fileExtension) === 'Image' ? (
                <Image 
                    src={artworkUrl} 
                    alt={artworkDescription ?? ''} 
                    width={200} 
                    height={200} 
                />
            ) : (
                <div className="flex flex-col items-center">
                    {renderFileIcon()}
                    <p className="text-sm text-gray-600 mt-2">
                        {fileExtension?.toUpperCase()} File
                    </p>
                </div>
            )}
            <p><strong>File: </strong>{artworkUrl}</p>
            <p><strong>Description: </strong>{artworkDescription ?? ''}</p>
            <p><strong>File Type: </strong>{getFileType(fileExtension)}</p>
            <Button variant="outline" size="icon" onClick={handleDownload}>
                <DownloadIcon className="h-4 w-4" />
            </Button>
        </div>
    );
};

export default ArtworkComponent;