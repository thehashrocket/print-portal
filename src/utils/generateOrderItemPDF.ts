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

export const generateOrderItemPDF = async (orderItem: any, order: any) => {
    const doc = new jsPDF();
    
    // Set initial y position
    let yPos = 20;
    const leftMargin = 20;
    const rightCol = 110;
    const pageHeight = doc.internal.pageSize.height;
    
    // Header
    doc.setFontSize(20);
    doc.text('Job Details', leftMargin, yPos);
    yPos += 15;

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
        yPos = checkAndAddPage(doc, yPos, 50);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Bindery Options', leftMargin, yPos);
        yPos += 10;
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        const options = orderItem.ProcessingOptions[0];
        
        if (options.cutting) {
            const splitCutting = doc.splitTextToSize(`Cutting: ${options.cutting}`, 170);
            doc.text(splitCutting, leftMargin, yPos);
            yPos += splitCutting.length * 5;
        }
        yPos += 5;
        
        if (options.folding) {
            const splitFolding = doc.splitTextToSize(`Folding: ${options.folding}`, 170);
            doc.text(splitFolding, leftMargin, yPos);
            yPos += splitFolding.length * 5;
        }
        yPos += 5;
        
        if (options.binding) {
            doc.text(`Binding: ${options.binding}`, leftMargin, yPos);
            yPos += 5;
        }
        
        if (options.stitching) {
            const splitStitching = doc.splitTextToSize(`Stitching: ${options.stitching}`, 170);
            doc.text(splitStitching, leftMargin, yPos);
            yPos += splitStitching.length * 5;
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