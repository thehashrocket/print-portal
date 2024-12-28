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
import { FileImage, FileText } from "lucide-react";

type ArtworkComponentProps = {
    artworkUrl: string;
    artworkDescription: string | null;
};

const ArtworkComponent: React.FC<ArtworkComponentProps> = ({
    artworkUrl,
    artworkDescription,
}) => {
    const isImage = artworkUrl.match(/\.(jpeg|jpg|gif|png)$/) != null;
    const isPdf = artworkUrl.match(/\.(pdf)$/) != null;
    const isPSD = artworkUrl.match(/\.(psd)$/) != null;
    const NEXTAUTH_URL = process.env.GOOGLE_CLIENT_ID;

    return (
        <div>
            {isImage && (
                <img src={artworkUrl ? artworkUrl : ''} alt={artworkDescription ? artworkDescription : ''} width={200} height={200} />
                // <Image src={artworkUrl ? artworkUrl : ''} alt={artworkDescription ? artworkDescription : ''} width={200} height={200} />
            )}
            {isPdf && (
                <div>
                    <FileText className="h-10 w-10 text-red-500" />
                </div>
            )}
            {isPSD && (
                <div>
                    <FileImage className="h-10 w-10 text-red-500" />
                </div>
            )}
            <p><strong>Artwork: </strong>{artworkUrl ? artworkUrl : ''}</p>
            <p><strong>Description: </strong>{artworkDescription ? artworkDescription : ''}</p>
            {/* Show File Type */}
            <p><strong>File Type: </strong>{isImage ? 'Image' : isPdf ? 'PDF' : isPSD ? 'PSD' : 'Unknown'}</p>
        </div>
    );
};

export default ArtworkComponent;