// This file is used to generate a PDF for a proof
import { jsPDF } from 'jspdf';
import { formatDate } from '~/utils/formatters';

const loadImage = async (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = url;
    });
};

const loadSVG = async (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            
            const newImg = new Image();
            newImg.onload = () => resolve(newImg);
            newImg.onerror = (e) => reject(e);
            newImg.src = canvas.toDataURL('image/png');
        };
        
        img.onerror = (e) => reject(e);
        img.src = url;
    });
};

export const generateProofPDF = async (proof: any) => {
    
    let yPos = 20;
    const leftMargin = 20;
    const doc = new jsPDF();

    try {
        const logoUrl = window.location.origin + '/images/thomson-pdf-logo.svg';
        const logoDataUrl = await loadSVG(logoUrl);
        // reduce size of logo by 20%
        doc.addImage(logoDataUrl, 'SVG', leftMargin - 20, yPos - 12, 90 * 0.8, 30 * 0.8); // Adjusted height to 30
    } catch (error) {
        console.error('Error loading logo:', error);
    }
    yPos += 20;
    // Proof Header
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(`Proof #${proof.proofNumber}`, leftMargin, yPos);
    
    // Status indicator
    doc.text('Proof Status:', leftMargin + 100, yPos);
    const statusColor = proof.approved ? '008000' : '808080';
    doc.setTextColor(statusColor);
    doc.text(proof.approved ? 'Approved' : 'Pending', leftMargin + 140, yPos);
    doc.setTextColor(0, 0, 0);
    yPos += 15;

    // Proof Details Box
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setDrawColor(200, 200, 200);
    const detailsBox = {
        x: leftMargin,
        y: yPos,
        width: doc.internal.pageSize.width - (leftMargin + 20),
        padding: 5
    };

    // Details content
    const details = [
        `Date Submitted: ${formatDate(proof.dateSubmitted)}`,
        `Proof Method: ${proof.proofMethod || 'N/A'}`,
        `Proof Count: ${proof.proofCount || 'N/A'}`,
    ];

    // Draw details box
    doc.rect(detailsBox.x, detailsBox.y, detailsBox.width, 
        (details.length * 12) + (detailsBox.padding * 2), 'S');

    // Add details content
    let detailsY = detailsBox.y + detailsBox.padding + 5;
    
    doc.setFont('helvetica', 'bold');
    doc.text('Date Submitted:', detailsBox.x + detailsBox.padding, detailsY);
    doc.setFont('helvetica', 'normal');
    const splitDateSubmitted = doc.splitTextToSize(proof.dateSubmitted, 
        doc.internal.pageSize.width - (leftMargin + 50));
    doc.text(splitDateSubmitted, detailsBox.x + 50, detailsY);
    detailsY += splitDateSubmitted.length * 5;

    doc.setFont('helvetica', 'bold');
    doc.text('Proof Method:', detailsBox.x + detailsBox.padding, detailsY);
    doc.setFont('helvetica', 'normal');
    const splitProofMethod = doc.splitTextToSize(proof.proofMethod, 
        doc.internal.pageSize.width - (leftMargin + 50));
    doc.text(splitProofMethod, detailsBox.x + 50, detailsY);
    detailsY += splitProofMethod.length * 5;

    doc.setFont('helvetica', 'bold');
    doc.text('Proof Count:', detailsBox.x + detailsBox.padding, detailsY);
    doc.setFont('helvetica', 'normal');
    const splitProofCount = doc.splitTextToSize(proof.proofCount, 
        doc.internal.pageSize.width - (leftMargin + 50));
    doc.text(splitProofCount, detailsBox.x + 50, detailsY);
    detailsY += splitProofCount.length * 5;

    yPos = detailsY + 10;

    // Notes section (if exists)
    if (proof.notes) {
        doc.setFont('helvetica', 'bold');
        doc.text('Notes:', detailsBox.x + detailsBox.padding, detailsY);
        doc.setFont('helvetica', 'normal');
        
        // Word wrap for notes
        const splitNotes = doc.splitTextToSize(proof.notes, 
            doc.internal.pageSize.width - (leftMargin + 50));
        doc.text(splitNotes, leftMargin + 50, detailsY);
        yPos += (splitNotes.length * 5) + 10;
    }

    if (!proof.artwork?.length) return;

    // Pre-load all images
    const artworkPromises = proof.artwork.map(async (art: { fileUrl: any; description: any; }) => {
        let fileUrl = art.fileUrl;
        if (!fileUrl.startsWith('http')) {
            const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || '';
            fileUrl = `${BASE_URL}${fileUrl}`;
        }

        const fileType = fileUrl.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png'].includes(fileType || '')) {
            try {
                const img = await loadImage(fileUrl);
                return { img, fileUrl, fileType, description: art.description };
            } catch (error) {
                console.error('Error loading image:', error, fileUrl);
                return null;
            }
        }
        return null;
    });

    const loadedArtwork = await Promise.all(artworkPromises);

    // Artwork section
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Artwork:', leftMargin, yPos);
    yPos += 10;

    // Add the loaded images
    for (const art of loadedArtwork) {
        if (!art) continue;

        const maxWidth = 150;  // Increased max width
        const maxHeight = 100; // Increased max height
        
        const aspect = art.img.width / art.img.height;
        let width = maxWidth;
        let height = width / aspect;
        
        if (height > maxHeight) {
            height = maxHeight;
            width = height * aspect;
        }

        // Add image with border
        doc.setDrawColor(200, 200, 200);
        doc.rect(leftMargin - 2, yPos - 2, width + 4, height + 4, 'S');
        doc.addImage(art.img, art.fileType.toUpperCase(), leftMargin, yPos, width, height);
        yPos += height + 5;

        // Image description
        if (art.description) {
            doc.setFontSize(9);
            doc.setFont('helvetica', 'italic');
            const splitDescription = doc.splitTextToSize(art.description, width);
            doc.text(splitDescription, leftMargin, yPos);
            yPos += (splitDescription.length * 5) + 15;
        }
    }

    doc.save(`proof_${proof.proofNumber}.pdf`);
};