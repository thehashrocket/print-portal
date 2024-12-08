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

const checkAndAddPage = (doc: jsPDF, yPos: number, requiredSpace: number = 40): number => {
    const pageHeight = doc.internal.pageSize.height;
    if (yPos + requiredSpace > pageHeight - 20) {
        doc.addPage();
        return 20; // Reset yPos to top of new page with margin
    }
    return yPos;
};

export const generateOrderItemPDF = async (orderItem: any, order: any, typesetting: any) => {
    console.log('typesetting', typesetting);
    const doc = new jsPDF();
    
    // Set initial y position
    let yPos = 20;
    const leftMargin = 20;
    const rightCol = 110;
    const pageHeight = doc.internal.pageSize.height;
    
    // Header section
    doc.setFontSize(24);
    doc.text('Job Details', leftMargin, yPos);
    yPos += 30;

    // Order and Item numbers
    doc.setFontSize(16);
    doc.text(`Order #${order.orderNumber}`, leftMargin, yPos);
    doc.text(`Item #${orderItem.orderItemNumber}`, leftMargin + 250, yPos);
    yPos += 25;

    // Left column
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Company:', leftMargin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(order.Office?.Company.name || 'N/A', leftMargin + 80, yPos);
    yPos += 15;

    doc.setFont('helvetica', 'bold');
    doc.text('Job Description:', leftMargin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(orderItem.description || 'N/A', leftMargin + 80, yPos);
    yPos += 15;

    doc.setFont('helvetica', 'bold');
    doc.text('Ink:', leftMargin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(orderItem.ink || 'N/A', leftMargin + 80, yPos);
    yPos += 15;

    // Right column
    let rightColumnY = yPos - 45; // Align with start of left column details
    doc.setFont('helvetica', 'bold');
    doc.text('Purchase Order Number:', leftMargin + 250, rightColumnY);
    doc.setFont('helvetica', 'normal');
    doc.text(order.WorkOrder.purchaseOrderNumber || 'N/A', leftMargin + 380, rightColumnY);
    rightColumnY += 15;

    doc.setFont('helvetica', 'bold');
    doc.text('Job Quantity:', leftMargin + 250, rightColumnY);
    doc.setFont('helvetica', 'normal');
    doc.text(orderItem.quantity.toString(), leftMargin + 380, rightColumnY);
    rightColumnY += 15;

    doc.setFont('helvetica', 'bold');
    doc.text('Status:', leftMargin + 250, rightColumnY);
    doc.setFont('helvetica', 'normal');
    doc.text(orderItem.status, leftMargin + 380, rightColumnY);

    // Contact Information section header (with proper spacing)
    yPos += 20; // Add space after the last detail
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('Contact Information', leftMargin, yPos);
    yPos += 15;

    // Contact details
    doc.setFontSize(12);
    doc.text('Name:', leftMargin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(order.contactPerson?.name || 'N/A', leftMargin + 80, yPos);
    yPos += 15;

    doc.setFont('helvetica', 'bold');
    doc.text('Email:', leftMargin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(order.contactPerson?.email || 'N/A', leftMargin + 80, yPos);
    yPos += 15;

    doc.setFont('helvetica', 'bold');
    doc.text('Phone:', leftMargin, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(order.contactPerson?.phone || 'N/A', leftMargin + 80, yPos);
    yPos += 25; // Add extra space before next section

    // Add company logo/header if needed
    doc.setFontSize(12);
    doc.text(`Order #${order.orderNumber}`, leftMargin, yPos);
    doc.text(`Item #${orderItem.orderItemNumber}`, rightCol, yPos);
    yPos += 10;

    // Basic Information - Left Column
    doc.setFontSize(10);
    const addField = (label: string, value: string, isRightColumn: boolean = false): number => {
        const currentY = isRightColumn ? yPos : checkAndAddPage(doc, yPos, 15);
        doc.setFont('helvetica', 'bold');
        doc.text(label, isRightColumn ? rightCol : leftMargin, currentY);
        doc.setFont('helvetica', 'normal');
        doc.text(value || 'N/A', isRightColumn ? rightCol : leftMargin, currentY + 5);
        if (!isRightColumn) {
            return currentY + 10;
        }
        return currentY;
    };

    // First Row
    yPos = addField('Company:', order.Office?.Company.name);
    yPos = addField('Purchase Order Number:', order.WorkOrder.purchaseOrderNumber, true);

    // Second Row - Handle Job Description with text wrapping
    yPos = checkAndAddPage(doc, yPos, 20);
    doc.setFont('helvetica', 'bold');
    doc.text('Job Description:', leftMargin, yPos);
    doc.setFont('helvetica', 'normal');
    const splitDescription = doc.splitTextToSize(orderItem.description || 'N/A', 80);
    doc.text(splitDescription, leftMargin, yPos + 5);
    yPos += 10 + (splitDescription.length - 1) * 5;

    // Job Quantity on right side
    yPos = addField('Job Quantity:', orderItem.quantity.toString(), true);

    // Third Row
    yPos = checkAndAddPage(doc, yPos, 15);
    yPos = addField('Ink:', orderItem.ink || 'N/A');
    yPos = addField('Status:', orderItem.status, true);

    // Contact Information
    yPos = checkAndAddPage(doc, yPos, 40);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Contact Information', leftMargin, yPos);
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (order.contactPerson) {
        doc.text(`Name: ${order.contactPerson.name || 'N/A'}`, leftMargin, yPos);
        yPos += 5;
        doc.text(`Email: ${order.contactPerson.email || 'N/A'}`, leftMargin, yPos);
        yPos += 5;
        doc.text(`Phone: ${order.ShippingInfo?.Address?.telephoneNumber || 'N/A'}`, leftMargin, yPos);
        yPos += 10;
    }

    // Artwork Section
    if (orderItem.artwork && orderItem.artwork.length > 0) {
        yPos = checkAndAddPage(doc, yPos, 100); // Large space for artwork
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Artwork', leftMargin, yPos);
        yPos += 10;
        doc.setFontSize(10);

        for (const art of orderItem.artwork) {
            try {
                const fileUrl = art.fileUrl;
                const fileType = fileUrl.split('.').pop()?.toLowerCase();
                const maxWidth = 100;
                const maxHeight = 80;

                yPos = checkAndAddPage(doc, yPos, maxHeight + 20);

                if (fileType === 'pdf') {
                    doc.text('PDF File:', leftMargin, yPos);
                    doc.setTextColor(0, 0, 255);
                    doc.textWithLink('View PDF', leftMargin, yPos + 5, { url: fileUrl });
                    doc.setTextColor(0, 0, 0);
                    yPos += 10;
                } else if (['jpg', 'jpeg', 'png'].includes(fileType || '')) {
                    try {
                        const img = await loadImage(fileUrl);
                        const aspect = img.width / img.height;
                        let width = maxWidth;
                        let height = width / aspect;
                        
                        if (height > maxHeight) {
                            height = maxHeight;
                            width = height * aspect;
                        }
                        
                        doc.addImage(img, fileType.toUpperCase(), leftMargin, yPos, width, height);
                        yPos += height + 5;
                    } catch (error) {
                        console.error('Error loading image:', error);
                        doc.text('Error loading image', leftMargin, yPos);
                        yPos += 10;
                    }
                }

                if (art.description) {
                    yPos = checkAndAddPage(doc, yPos, 20);
                    doc.setFont('helvetica', 'bold');
                    doc.text('Description:', leftMargin, yPos);
                    doc.setFont('helvetica', 'normal');
                    const splitArtDescription = doc.splitTextToSize(art.description, 150);
                    doc.text(splitArtDescription, leftMargin, yPos + 5);
                    yPos += 10 + (splitArtDescription.length * 5);
                }

                yPos += 10;
            } catch (error) {
                console.error('Error processing artwork:', error);
            }
        }
    }

    // Typesetting Information
    if (orderItem.Typesetting && orderItem.Typesetting.length > 0) {
        yPos = checkAndAddPage(doc, yPos, 40);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Typesetting Details', leftMargin, yPos);
        yPos += 10;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        const typesetting = orderItem.Typesetting[0];
        doc.text(`Date In: ${formatDate(typesetting.dateIn)}`, leftMargin, yPos);
        yPos += 5;
        doc.text(`Status: ${typesetting.status}`, leftMargin, yPos);
        yPos += 5;
        doc.text(`Prep Time: ${typesetting.prepTime || 'N/A'}`, leftMargin, yPos);
        yPos += 10;
    }

    // Processing Options
    if (orderItem.ProcessingOptions && orderItem.ProcessingOptions.length > 0) {
        yPos = checkAndAddPage(doc, yPos, 150);
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.text('Bindery Options', leftMargin, yPos);
        yPos += 20;
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        
        const options = orderItem.ProcessingOptions[0];
        
        if (options.cutting) {
            doc.setFont('helvetica', 'bold');
            doc.text('Cutting:', leftMargin, yPos);
            doc.setFont('helvetica', 'normal');
            const splitCutting = doc.splitTextToSize(options.cutting, 
                doc.internal.pageSize.width - (leftMargin + 80));
            doc.text(splitCutting, leftMargin + 80, yPos);
            yPos += splitCutting.length * 5;
        }
        yPos += 15;
        
        if (options.folding) {
            doc.setFont('helvetica', 'bold');
            doc.text('Folding:', leftMargin, yPos);
            doc.setFont('helvetica', 'normal');
            const splitFolding = doc.splitTextToSize(options.folding, 
                doc.internal.pageSize.width - (leftMargin + 80));
            doc.text(splitFolding, leftMargin + 80, yPos);
            yPos += splitFolding.length * 5;
        }
        yPos += 15;
        
        if (options.binding) {
            doc.setFont('helvetica', 'bold');
            doc.text('Binding:', leftMargin, yPos);
            doc.setFont('helvetica', 'normal');
            const splitBinding = doc.splitTextToSize(options.binding, 
                doc.internal.pageSize.width - (leftMargin + 80));
            doc.text(splitBinding, leftMargin + 80, yPos);
            yPos += splitBinding.length * 5;
        }
        
        if (options.stitching) {
            doc.setFont('helvetica', 'bold');
            doc.text('Stitching:', leftMargin, yPos);
            doc.setFont('helvetica', 'normal');
            const splitStitching = doc.splitTextToSize(options.stitching, 
                doc.internal.pageSize.width - (leftMargin + 80));
            doc.text(splitStitching, leftMargin + 80, yPos);
            yPos += splitStitching.length * 5;
        }
    }

    // Start a new page for the typesetting proofs
    doc.addPage();
    yPos = 20;

    // Typesetting Proofs
    if (typesetting.length > 0) {
        yPos = checkAndAddPage(doc, yPos, 40);
        
        const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

        // Process typesetting proofs
        for (const proof of typesetting) {
            if (!proof.TypesettingProofs?.length) continue;

            // Section Header
            doc.setFillColor(240, 240, 240);  // Light gray background
            doc.rect(leftMargin - 5, yPos - 5, doc.internal.pageSize.width - (leftMargin * 2) + 10, 25, 'F');
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text('Typesetting Proofs', leftMargin, yPos + 8);
            yPos += 30;

            for (const typesettingProof of proof.TypesettingProofs) {
                // Proof Header
                doc.setFontSize(12);
                doc.setFont('helvetica', 'bold');
                doc.text(`Proof #${typesettingProof.proofNumber}`, leftMargin, yPos);
                
                // Status indicator
                const statusColor = typesettingProof.approved ? '008000' : '808080';
                doc.setTextColor(statusColor);
                doc.text(typesettingProof.approved ? 'Approved' : 'Pending', leftMargin + 100, yPos);
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
                    `Date Submitted: ${formatDate(typesettingProof.dateSubmitted)}`,
                    `Proof Method: ${typesettingProof.proofMethod || 'N/A'}`,
                    `Proof Count: ${typesettingProof.proofCount || 'N/A'}`,
                ];

                // Draw details box
                doc.rect(detailsBox.x, detailsBox.y, detailsBox.width, 
                    (details.length * 12) + (detailsBox.padding * 2), 'S');

                // Add details content
                let detailsY = detailsBox.y + detailsBox.padding + 5;
                
                doc.setFont('helvetica', 'bold');
                doc.text('Date Submitted:', detailsBox.x + detailsBox.padding, detailsY);
                doc.setFont('helvetica', 'normal');
                const splitDateSubmitted = doc.splitTextToSize(typesettingProof.dateSubmitted, 
                    doc.internal.pageSize.width - (leftMargin + 50));
                doc.text(splitDateSubmitted, detailsBox.x + 50, detailsY);
                detailsY += splitDateSubmitted.length * 5;

                doc.setFont('helvetica', 'bold');
                doc.text('Proof Method:', detailsBox.x + detailsBox.padding, detailsY);
                doc.setFont('helvetica', 'normal');
                const splitProofMethod = doc.splitTextToSize(typesettingProof.proofMethod, 
                    doc.internal.pageSize.width - (leftMargin + 50));
                doc.text(splitProofMethod, detailsBox.x + 50, detailsY);
                detailsY += splitProofMethod.length * 5;

                doc.setFont('helvetica', 'bold');
                doc.text('Proof Count:', detailsBox.x + detailsBox.padding, detailsY);
                doc.setFont('helvetica', 'normal');
                const splitProofCount = doc.splitTextToSize(typesettingProof.proofCount, 
                    doc.internal.pageSize.width - (leftMargin + 50));
                doc.text(splitProofCount, detailsBox.x + 50, detailsY);
                detailsY += splitProofCount.length * 5;

                yPos = detailsY + 10;

                // Notes section (if exists)
                if (typesettingProof.notes) {
                    doc.setFont('helvetica', 'bold');
                    doc.text('Notes:', detailsBox.x + detailsBox.padding, detailsY);
                    doc.setFont('helvetica', 'normal');
                    
                    // Word wrap for notes
                    const splitNotes = doc.splitTextToSize(typesettingProof.notes, 
                        doc.internal.pageSize.width - (leftMargin + 50));
                    doc.text(splitNotes, leftMargin + 50, detailsY);
                    yPos += (splitNotes.length * 5) + 10;
                }

                if (!typesettingProof.artwork?.length) continue;

                // Pre-load all images
                const artworkPromises = typesettingProof.artwork.map(async (art: { fileUrl: any; description: any; }) => {
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

                    yPos = checkAndAddPage(doc, yPos, 100); // Increased space check

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
                
                yPos += 20; // Space between proofs
                yPos = checkAndAddPage(doc, yPos, 40);
            }
        }
    }

    // Add page numbers
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.width - 30, doc.internal.pageSize.height - 10);
    }

    // Save the PDF
    doc.save(`job_details_${order.orderNumber}_${orderItem.orderItemNumber}.pdf`);
};