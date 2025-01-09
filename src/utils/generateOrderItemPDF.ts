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

async (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = url;
    });
};

// Check if we need a new page and add it if necessary
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
        doc.addImage(logoDataUrl, 'SVG', leftMargin - 20, yPos - 12, 90 * 0.8, 30 * 0.8); // Adjusted height to 30
    } catch (error) {
        console.error('Error loading logo:', error);
    }
    
    // Add Status on right side
    doc.setFontSize(16);
    // Set the color of text to red
    doc.setTextColor(255, 0, 0);
    doc.text('STATUS', rightColStart, yPos);
    // set the color of text to black
    doc.setTextColor(0, 0, 0);
    doc.text(`${orderItem.status}`, rightColStart + 50, yPos);
    
    // Item Details header
    yPos += 20;
    doc.setFontSize(15);
    doc.text('ITEM DETAILS', leftMargin, yPos);

    // Add dates to the right of Item Details
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DATE STARTED', rightColStart, yPos);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(new Date()), rightColStart + 50, yPos);
    
    doc.setFont('helvetica', 'bold');
    doc.text('COMPLETION DATE', rightColStart, yPos + 5);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(new Date()), rightColStart + 50, yPos + 5);

    yPos += 15; // Space after headers

    // Modified addDetailsField with tighter alignment
    const addDetailsField = (label: string, value: any, x: number, currentY: number, maxWidth: number): number => {
        // Draw label
        doc.setFont('helvetica', 'bold');
        doc.text(label, x, currentY);
        
        const labelWidth = 20;
        const valueX = x + labelWidth + 10;
        
        doc.setFont('helvetica', 'normal');
        
        // Convert value to string and handle different types
        let valueStr;
        if (typeof value === 'boolean') {
            valueStr = value ? 'Yes' : 'No';
        } else if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T/)) {
            // Handle ISO date strings
            valueStr = formatDate(new Date(value));
        } else {
            valueStr = String(value || 'N/A');
        }
        
        // For multi-line text, split by words and control the wrapping
        const words = valueStr.split(' ');
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

    // Two-column layout for top section
    const addField = (label: string, value: string, x: number, currentY: number, spacing: number = 10, labelWidth: number = 20, fontSize: number = 14) => {
        doc.setFontSize(fontSize);
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
    const addWrappedField = (label: string, value: string, x: number, currentY: number, maxWidth: number, labelWidth: number = 20, fontSize: number = 14): number => {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(fontSize);
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
    leftY = addField('ORDER', `#${order.orderNumber}`, leftMargin, leftY, 10, 20, 13);
    leftY = addField('COMPANY', order.Office?.Company.name || 'N/A', leftMargin, leftY, 10, 20, 13);
    
    // Contact Information
    leftY += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('CONTACT INFORMATION', leftMargin, leftY);
    leftY += 10;
    
    if (order.contactPerson) {
        leftY = addField('Name', order.contactPerson.name || 'N/A', leftMargin, leftY, 7, 10, 12);
        leftY = addField('Email', order.contactPerson.email || 'N/A', leftMargin, leftY, 7, 10, 12);
        leftY = addField('Phone', order.contactPerson?.phone || 'N/A', leftMargin, leftY, 7, 10, 12);
    }

    // Right column (excluding the dates that are now above)
    let rightY = yPos;
    rightY = addField('ITEM', `#${orderItem.orderItemNumber}`, rightColStart, rightY, 10, 30);
    rightY = addField('P.O. NUMBER', order.WorkOrder.purchaseOrderNumber || 'N/A', rightColStart, rightY, 10, 30, 13);
    rightY = addField('QUANTITY', orderItem.quantity.toString(), rightColStart, rightY, 10, 30, 13);
    // Utilize the new addWrappedField function for Paper Stock
    rightY = addWrappedField('PAPER STOCK', orderItem.PaperProduct?.paperType + ' ' + orderItem.PaperProduct?.finish + ' ' + orderItem.PaperProduct?.weightLb + ' lbs' || 'N/A', rightColStart, rightY, pageWidth - rightColStart - leftMargin, 30, 13  );
    rightY = addField('SIZE', orderItem.size || 'N/A', rightColStart, rightY, 10, 30, 13);
    rightY = addField('COLOR', orderItem.ink || 'N/A', rightColStart, rightY, 10, 30, 13);

    if (order.ShippingInfo) {
        rightY += 10;
        doc.setFont('helvetica', 'bold');
        doc.text('SHIPPING INFORMATION', rightColStart, rightY);
        rightY += 10;
        rightY = addField('Shipping Method', order.ShippingInfo.shippingMethod || 'N/A', rightColStart, rightY, 7, 30, 12);
        rightY = addField('Shipping Date', formatDate(order.ShippingInfo.shippingDate) || 'N/A', rightColStart, rightY, 7, 30, 12);
        rightY = addField('Shipping Notes', order.ShippingInfo.shippingNotes || 'N/A', rightColStart, rightY, 7, 30, 12);

        if (order.ShippingInfo.Address) {
            const address = [
                order.ShippingInfo.Address.name,
                order.ShippingInfo.Address.line1,
                order.ShippingInfo.Address.line2,
                `${order.ShippingInfo.Address.city}, ${order.ShippingInfo.Address.state} ${order.ShippingInfo.Address.zipCode}`
            ].filter(Boolean).join('\n');  // filter(Boolean) removes empty/null values

            rightY = addField('Address', address, rightColStart, rightY, 7, 30, 12);
        }

        if (order.ShippingInfo.trackingNumber) {
            rightY = addField('Tracking Number', order.ShippingInfo.trackingNumber, rightColStart, rightY, 7, 30, 12);
        }

    }
    // const filenames = orderItem.Typesetting?.TypesettingProofs?.map((proof: any) => proof.artwork?.map((art: any) => art.fileUrl).join(', ')).join(', ');

    // rightY = addField('FILE NAME(S)', filenames || 'N/A', rightColStart, rightY, 10, 30);

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

    doc.setFont('helvetica', 'normal');
    if (orderItem.ProductType) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('Product Type', leftMargin, yPos);
        yPos += 10;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.text(orderItem.ProductType.name, leftMargin, yPos);
    } else {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('Product Type', leftMargin, yPos);
        yPos += 10;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        doc.text('N/A', leftMargin, yPos);
    }
    yPos += 10;
    // if (orderItem.PaperProduct) {
    //     doc.setFont('helvetica', 'bold');
    //     doc.setFontSize(14);
    //     doc.text('Paper Stock', leftMargin, yPos);
    //     yPos += 10;
    //     doc.setFont('helvetica', 'normal');
    //     doc.setFontSize(12);
    //     doc.text(orderItem.PaperProduct.paperType + ' ' + orderItem.PaperProduct.finish + ' ' + orderItem.PaperProduct.weightLb + ' lbs', leftMargin, yPos);
    // } else {
    //     doc.setFont('helvetica', 'bold');
    //     doc.setFontSize(14);
    //     doc.text('Paper Stock', leftMargin, yPos);
    //     yPos += 10;
    //     doc.setFont('helvetica', 'normal');
    //     doc.setFontSize(12);
    //     doc.text('N/A', leftMargin, yPos);
    // }
    // yPos += 10;
    

    // Process Typesetting Proofs with proper sizing
    if (typesetting?.length > 0) {
        let proofCount = 0;
        let lastImageHeight = 0; // Track the height of the last row of images
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('PROOF FILE NAME(S)', leftMargin, yPos);
        yPos += 10;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        for (const proof of typesetting[0].TypesettingProofs || []) {
            for (const art of proof.artwork || []) {
                try {
                    doc.text(art.fileUrl, leftMargin, yPos);
                    yPos += 5;
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

    yPos = checkAndAddPage(doc, yPos, 40); // Check if we need a new page

    // Typesetting and Bindery Options with proper alignment
    
    // Typesetting Details
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('TYPESETTING DETAILS', leftMargin, yPos);
    const typesettingY = yPos + 8;
    doc.setFontSize(9);
    
    // Typesetting Details section
    if (typesetting?.length > 0) {
        const ts = typesetting[0];
        let leftY = typesettingY;
        let rightY = typesettingY;
        
        const typesettingWidth = pageWidth/2 - 30; // Slightly reduced width for better spacing
        const keys = Object.keys(ts).filter(key => {
            const skipKeys = ["createdAt", "updatedAt", "createdById", "orderItemId", "id", "workOrderItemId", "TypesettingOptions", "TypesettingProofs"];
            return !skipKeys.includes(key);
        });

        // Split keys into two arrays for left and right columns
        const midPoint = Math.ceil(keys.length / 2);
        const leftKeys = keys.slice(0, midPoint);
        const rightKeys = keys.slice(midPoint);

        // Process left column
        for (const key of leftKeys) {
            const formattedKey = key.replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase());
            leftY = addDetailsField(formattedKey, ts[key], leftMargin, leftY, typesettingWidth);
        }

        // Process right column
        for (const key of rightKeys) {
            const formattedKey = key.replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase());
            rightY = addDetailsField(formattedKey, ts[key], rightColStart, rightY, typesettingWidth);
        }

        // Update yPos to the maximum height of both columns
        yPos = Math.max(leftY, rightY) + 10;
    } else {
        yPos += 10;
        doc.text('N/A', leftMargin, yPos);
        yPos += 10;
    }
    

    yPos = checkAndAddPage(doc, yPos, 40); // Check if we need a new page
    
    // Bindery Options section
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('BINDERY OPTIONS', leftMargin, yPos);
    doc.setFontSize(9);

    if (orderItem.ProcessingOptions?.length > 0) {
        const options = orderItem.ProcessingOptions[0];
        let leftY = yPos + 8;
        let rightY = yPos + 8;
        
        const binderyWidth = pageWidth/2 - 30; // Match typesetting width
        const keys = Object.keys(options).filter(key => {
            const skipKeys = ["createdAt", "updatedAt", "createdById", "orderItemId", "id"];
            return !skipKeys.includes(key) && options[key]; // Only include keys with values
        });

        // Split keys into two arrays for left and right columns
        const midPoint = Math.ceil(keys.length / 2);
        const leftKeys = keys.slice(0, midPoint);
        const rightKeys = keys.slice(midPoint);

        // Process left column
        for (const key of leftKeys) {
            leftY = checkAndAddPage(doc, leftY, 10);
            const formattedKey = key.replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase());
            leftY = addDetailsField(formattedKey, options[key], leftMargin, leftY, binderyWidth);
        }

        // Process right column
        for (const key of rightKeys) {
            rightY = checkAndAddPage(doc, rightY, 10);
            const formattedKey = key.replace(/([A-Z])/g, ' $1')
                .replace(/^./, str => str.toUpperCase());
            rightY = addDetailsField(formattedKey, options[key], rightColStart, rightY, binderyWidth);
        }

        // Update yPos to the maximum height of both columns
        yPos = Math.max(leftY, rightY) + 10;
    } else {
        yPos += 10;
        doc.text('N/A', leftMargin, yPos);
        yPos += 10;
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
    doc.save(`item_details_${order.orderNumber}_${orderItem.orderItemNumber}.pdf`);
};