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
                    {/* Show SVG Image for PDF */}
                    <svg className="h-10 w-10 text-red-500" width="24" height="24" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round">  <path stroke="none" d="M0 0h24v24H0z" />  <rect width="6" height="6" x="14" y="5" rx="1" />  <line x1="4" y1="7" x2="10" y2="7" />  <line x1="4" y1="11" x2="10" y2="11" />  <line x1="4" y1="15" x2="20" y2="15" />  <line x1="4" y1="19" x2="20" y2="19" /></svg>
                </div>
            )}
            {isPSD && (
                <div>
                    <svg className="h-10 w-10 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />  <circle cx="8.5" cy="8.5" r="1.5" />  <polyline points="21 15 16 10 5 21" /></svg>
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