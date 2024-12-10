import { jsPDF } from 'jspdf';
import { formatDate } from '~/utils/formatters';

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
    const doc = new jsPDF();

     
    
    // Initial setup
    doc.setFont('helvetica', 'bold');
    let yPos = 20;
    const leftMargin = 20;
    const rightColStart = doc.internal.pageSize.width / 2 + 10;
    const pageWidth = doc.internal.pageSize.width;
    
    // Add Thomson logo/header
    try {
        const logoUrl = window.location.origin + '/images/thomson-pdf-logo.svg';
        const logoDataUrl = await loadSVG(logoUrl);
        doc.addImage(logoDataUrl, 'SVG', leftMargin - 20, yPos - 12, 90, 30); // Adjusted height to 30
    } catch (error) {
        console.error('Error loading logo:', error);
    }
    
    // Add Status on right side
    doc.setFontSize(16);
    doc.text('STATUS', rightColStart, yPos);
    doc.text(`${orderItem.status}`, rightColStart + 50, yPos);
    
    // Job Details header
    yPos += 20;
    doc.setFontSize(20);
    doc.text('JOB DETAILS', leftMargin, yPos);

    // Add dates to the right of Job Details
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DATE STARTED', rightColStart, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(new Date()), rightColStart + 50, yPos);
    
    doc.setFont('helvetica', 'bold');
    doc.text('COMPLETION DATE', rightColStart, yPos + 5);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(new Date()), rightColStart + 50, yPos + 5);

    yPos += 15; // Space after headers

    // Two-column layout for top section
    const addField = (label: string, value: string, x: number, currentY: number, spacing: number = 10, labelWidth: number = 20) => {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(label, x, currentY);
        
        // Calculate value position based on label length
        // const labelWidth = doc.getTextWidth(label);
        // const labelWidth = 20;
        const valueX = x + labelWidth + 10;
        
        doc.setFont('helvetica', 'normal');
        doc.text(value || 'N/A', valueX, currentY);
        return currentY + spacing;
    };

    // Modified addField function to handle text wrapping
    const addWrappedField = (label: string, value: string, x: number, currentY: number, maxWidth: number, labelWidth: number = 20): number => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, x, currentY);
        
        // Calculate value position based on label length
        // const labelWidth = doc.getTextWidth(label);
        const valueX = x + labelWidth + 10;
        
        // Split the value text if it's too long
        doc.setFont('helvetica', 'normal');
        const availableWidth = maxWidth - (valueX - x);
        const lines = doc.splitTextToSize(value || 'N/A', availableWidth);
        
        // Draw the wrapped text
        doc.text(lines, valueX, currentY);
        
        // Return the Y position after this field (accounting for multiple lines)
        return currentY + (lines.length * 7); // 7 units per line of text
    };

    // Left column
    let leftY = yPos;
    leftY = addField('ORDER', `#${order.orderNumber}`, leftMargin, leftY);
    leftY = addField('COMPANY', order.Office?.Company.name || 'N/A', leftMargin, leftY);
    
    // Contact Information
    leftY += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('CONTACT INFORMATION', leftMargin, leftY);
    leftY += 10;
    
    if (order.contactPerson) {
        leftY = addField('Name', order.contactPerson.name || 'N/A', leftMargin, leftY, 7, 10);
        leftY = addField('Email', order.contactPerson.email || 'N/A', leftMargin, leftY, 7, 10);
        leftY = addField('Phone', order.contactPerson?.phone || 'N/A', leftMargin, leftY, 7, 10);
    }

    // Right column (excluding the dates that are now above)
    let rightY = yPos;
    rightY = addField('ITEM', `#${orderItem.orderItemNumber}`, rightColStart, rightY, 20, 30);
    rightY = addField('P.O. NUMBER', order.WorkOrder.purchaseOrderNumber || 'N/A', rightColStart, rightY, 20, 30);
    rightY = addField('QUANTITY', orderItem.quantity.toString(), rightColStart, rightY, 10, 30);
    // Utilize the new addWrappedField function for Paper Stock
    rightY = addWrappedField('Paper Stock', orderItem.OrderItemStock[0]?.notes || 'N/A', rightColStart, rightY, pageWidth - rightColStart - leftMargin, 30);
    const filenames = orderItem.Typesetting?.TypesettingProofs?.map((proof: any) => proof.artwork?.map((art: any) => art.fileUrl).join(', ')).join(', ');

    rightY = addField('FILE NAME(S)', filenames || 'N/A', rightColStart, rightY, 10, 30);

    // Project Description (full width)
    yPos = Math.max(leftY, rightY) + 5; // More space before project description
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('PROJECT DESCRIPTION', leftMargin, yPos);
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    const splitDescription = doc.splitTextToSize(orderItem.description || 'N/A', pageWidth - (leftMargin * 2));
    doc.text(splitDescription, leftMargin, yPos);
    yPos += splitDescription.length * 7 + 10; // More space after description

    // Process Typesetting Proofs with proper sizing
    if (typesetting?.length > 0) {
        let proofCount = 0;
        let lastImageHeight = 0; // Track the height of the last row of images
        
        for (const proof of typesetting[0].TypesettingProofs || []) {
            for (const art of proof.artwork || []) {
                try {
                    const img = await loadImage(art.fileUrl);
                    const maxWidth = (pageWidth - leftMargin * 2.5) / 2;
                    const maxHeight = 200;
                    
                    // Calculate image dimensions maintaining aspect ratio
                    const aspect = img.width / img.height;
                    let width = maxWidth;
                    let height = width / aspect;
                    
                    if (height > maxHeight) {
                        height = maxHeight;
                        width = height * aspect;
                    }
                    
                    lastImageHeight = height; // Store the height for spacing calculation
                    
                    // Position image in left or right column
                    const xPos = proofCount % 2 === 0 ? leftMargin : rightColStart;
                    
                    // Add new page if needed
                    if (yPos + height > doc.internal.pageSize.height - 40) {
                        doc.addPage();
                        yPos = 20;
                    }
                    
                    doc.addImage(img, 'JPEG', xPos, yPos, width, height);
                    
                    // Move to next row after every 2 images
                    if (proofCount % 2 === 1) {
                        yPos += height + 20;
                    }
                    
                    proofCount++;
                } catch (error) {
                    console.error('Error processing proof image:', error);
                }
            }
        }

        // If we ended with an odd number of images, we need to move down by the last image height
        if (proofCount % 2 === 1) {
            yPos += lastImageHeight + 20;
        }

        // Reduce spacing after images section
        yPos += 20; // Changed from 40 to 20
    }

    // Typesetting and Bindery Options with proper alignment
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    
    // Typesetting Details (left column)
    doc.text('TYPESETTING DETAILS', leftMargin, yPos);
    const typesettingY = yPos + 8;
    doc.setFontSize(12);
    
    // Modified addDetailsField with tighter alignment
    const addDetailsField = (label: string, value: string, x: number, currentY: number, maxWidth: number): number => {
        // Draw label
        doc.setFont('helvetica', 'bold');
        doc.text(label, x, currentY);
        
        // Calculate label width and position value right after it with small gap
        // const labelWidth = doc.getTextWidth(label);
        const labelWidth = 20;
        const valueX = x + labelWidth + 10; // Keep the 10 unit gap after label
        
        doc.setFont('helvetica', 'normal');
        
        // For multi-line text, split by words and control the wrapping
        const words = value.split(' ');
        let currentLine = '';
        let yOffset = 0;
        const lineHeight = 5;

        words.forEach((word, index) => {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
            const testWidth = doc.getTextWidth(testLine);

            // Increase available width by reducing right margin
            const availableWidth = maxWidth - (valueX - x) + 10; // Increased from -20 to +10
            if (testWidth > availableWidth && index > 0) {
                doc.text(currentLine, valueX, currentY + yOffset);
                currentLine = word;
                yOffset += lineHeight;
            } else {
                currentLine = testLine;
            }
        });

        // Draw the last line
        if (currentLine) {
            doc.text(currentLine, valueX, currentY + yOffset);
            yOffset += lineHeight;
        }

        return currentY + Math.max(yOffset, lineHeight + 2);
    };
    
    // Typesetting Details section
    if (typesetting?.length > 0) {
        const ts = typesetting[0];
        let currentY = typesettingY;
        currentY = addDetailsField('Date In', formatDate(ts.dateIn), leftMargin, currentY, pageWidth/2 - 20);
        currentY = addDetailsField('Status', ts.status, leftMargin, currentY + 2, pageWidth/2 - 20);
        currentY = addDetailsField('Prep Time', `${ts.prepTime || 0} Hours`, leftMargin, currentY + 2, pageWidth/2 - 20);
    }

    // Bindery Options (right column)
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('BINDERY OPTIONS', rightColStart, yPos);
    doc.setFontSize(12);

    if (orderItem.ProcessingOptions?.length > 0) {
        const options = orderItem.ProcessingOptions[0];
        let currentY = typesettingY;
        
        const binderyWidth = pageWidth - rightColStart - leftMargin;
        
        currentY = addDetailsField('Cutting', options.cutting || 'N/A', rightColStart, currentY, binderyWidth);
        currentY = addDetailsField('Folding', options.folding || 'N/A', rightColStart, currentY + 2, binderyWidth);
        currentY = addDetailsField('Binding', options.binding || 'N/A', rightColStart, currentY + 2, binderyWidth);
        currentY = addDetailsField('Stitching', options.stitching || 'N/A', rightColStart, currentY + 2, binderyWidth);
    }

    // Add page numbers with proper alignment
    const pageCount = doc.internal.pages.length - 1; // Subtract 1 because jsPDF uses 1-based indexing
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const text = `Page ${i} of ${pageCount}`;
        const textWidth = doc.getTextWidth(text);
        doc.text(text, pageWidth - textWidth - 20, doc.internal.pageSize.height - 10);
    }

    // Save the PDF
    doc.save(`job_details_${order.orderNumber}_${orderItem.orderItemNumber}.pdf`);
};