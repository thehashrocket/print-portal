import { ShippingInfo, ShippingMethod } from '@prisma/client';
import { jsPDF } from 'jspdf';
import { SerializedProcessingOptions, SerializedShippingInfo } from '~/types/serializedTypes';
import { formatDate, formatTime } from '~/utils/formatters';

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



export const generateOrderItemPDF = async (
    orderItem: any, 
    order: any, 
    typesetting: any, 
    orderItemStocks: any, 
    paperProducts: any,
    shippingInfo: SerializedShippingInfo,
    processingOptions: SerializedProcessingOptions[]
) => {
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
    doc.text(formatDate(orderItem.createdAt), rightColStart + 50, yPos);
    
    doc.setFont('helvetica', 'bold');
    doc.text('IN HANDS DATE', rightColStart, yPos + 5);
    doc.setFont('helvetica', 'normal');
    doc.text(formatDate(order.inHandsDate), rightColStart + 50, yPos + 5);

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
        leftY += 10;
    }

    if (orderItem.ProductType) {
        leftY = addField('Product Type', orderItem.ProductType.name || 'N/A', leftMargin, leftY, 7, 18, 12);
        leftY += 10;
    }

    // Loop through the orderItem.OrderItemStock and print the paper product only if it exists
    // if (orderItem.OrderItemStock) {
    //     leftY = addField('Paper Product', orderItem.OrderItemStock.paperProduct.paperType + ' ' + orderItem.OrderItemStock.paperProduct.finish + ' ' + orderItem.OrderItemStock.paperProduct.weightLb + ' lbs' || 'N/A', leftMargin, leftY, 7, 18, 12);
    //     leftY += 10;
    // }

    // Right column (excluding the dates that are now above)
    let rightY = yPos;
    rightY = addField('ITEM', `#${orderItem.orderItemNumber}`, rightColStart, rightY, 10, 30);
    rightY = addField('P.O. NUMBER', order.WorkOrder.purchaseOrderNumber || 'N/A', rightColStart, rightY, 10, 30, 13);
    rightY = addField('QUANTITY', orderItem.quantity.toString(), rightColStart, rightY, 10, 30, 13);
    // Utilize the new addWrappedField function for Paper Stock
    // rightY = addWrappedField('PAPER STOCK', orderItem.PaperProduct?.paperType + ' ' + orderItem.PaperProduct?.finish + ' ' + orderItem.PaperProduct?.weightLb + ' lbs' || 'N/A', rightColStart, rightY, pageWidth - rightColStart - leftMargin, 30, 13  );
    rightY = addField('SIZE', orderItem.size || 'N/A', rightColStart, rightY, 10, 30, 13);
    rightY = addField('COLOR', orderItem.ink || 'N/A', rightColStart, rightY, 10, 30, 13);



    yPos = Math.max(leftY, rightY) + 5; // More space before project description

    // Shipping Info (full width)
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('SHIPPING INFO', leftMargin, yPos);
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    if (shippingInfo.shippingMethod === ShippingMethod.Pickup && shippingInfo.ShippingPickup) {
        const pickupDate = shippingInfo.ShippingPickup.pickupDate ? formatDate(new Date(shippingInfo.ShippingPickup.pickupDate as string)) : 'N/A';
        const pickupTime = shippingInfo.ShippingPickup.pickupTime || 'N/A';
        yPos = addField('Pickup Date', pickupDate, leftMargin, yPos, 7, 30, 12);
        yPos = addField('Pickup Time', pickupTime, leftMargin, yPos, 7, 30, 12);
        yPos = addField('Pickup Notes', shippingInfo.ShippingPickup.notes || 'N/A', leftMargin, yPos, 7, 30, 12);
    } else {
        yPos = addField('Shipping Date', shippingInfo.shippingDate ? formatDate(new Date(shippingInfo.shippingDate as string)) : 'N/A', leftMargin, yPos, 7, 30, 12);
    }
    yPos = addField('Shipping Inst.', shippingInfo.instructions || 'N/A', leftMargin, yPos, 7, 30, 12);

    // Project Description (full width)
    yPos += 10;
    if (orderItem.description) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Project Description', leftMargin, yPos);
        yPos += 10;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        const splitDescription = doc.splitTextToSize(orderItem.description || 'N/A', pageWidth - (leftMargin * 2));
        doc.text(splitDescription, leftMargin, yPos);
        yPos += splitDescription.length * 7 + 10; // More space after description
    }

    yPos = checkAndAddPage(doc, yPos, 40); // Check if we need a new page

    // Print Special Instructions (full width)
    if (orderItem.specialInstructions) {
       doc.setFontSize(14);
       doc.setFont('helvetica', 'bold');
       doc.text('Special Instructions', leftMargin, yPos);
       yPos += 10;
       doc.setFont('helvetica', 'normal');
       doc.setFontSize(12);
       const splitInstructions = doc.splitTextToSize(orderItem.specialInstructions || 'N/A', pageWidth - (leftMargin * 2));
       doc.text(splitInstructions, leftMargin, yPos);
       yPos += splitInstructions.length * 7 + 10; // More space after description
    }

    if (orderItemStocks) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text('Paper Stock', leftMargin, yPos);
        yPos += 10;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(12);
        // Loop through the paperProducts and print the paper product only if it exists
        for (const paperProduct of paperProducts) {
            if (paperProduct) {
                doc.text(paperProduct, leftMargin, yPos);
                yPos += 5;
            }
        }
        yPos += 10;
        // Loop through the orderItem.OrderItemStock and print the paper product only if it exists
        // for (const stock of orderItemStocks) {
        //     if (stock.paperProduct) {
        //         doc.text(stock.paperProduct.paperType + ' ' + stock.paperProduct.finish + ' ' + stock.paperProduct.weightLb + ' lbs', leftMargin, yPos);
        //     }
        // }
    }

    
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
    if (typesetting?.length > 0 && typesetting[0].TypesettingProofs?.length > 0) {
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

    // Typesetting Details section
    if (typesetting?.length > 0) {

        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('TYPESETTING DETAILS', leftMargin, yPos);
        const typesettingY = yPos + 8;
        doc.setFontSize(9);

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
    }
    

    yPos = checkAndAddPage(doc, yPos, 40); // Check if we need a new page
    
    // Bindery Options section
    if (processingOptions?.length > 0) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('BINDERY OPTIONS', leftMargin, yPos);
        yPos += 10;
        doc.setFontSize(12);

        // Define field groups
        const basicOptions = [
            { key: 'cutting', label: 'Cutting' },
            { key: 'padding', label: 'Padding' },
            { key: 'drilling', label: 'Drilling' },
            { key: 'folding', label: 'Folding' },
        ];

        const additionalOptions = [
            { key: 'stitching', label: 'Stitching' },
            { key: 'binding', label: 'Binding' },
        ];

        const numberingOptions = [
            { key: 'numberingStart', label: 'Numbering Start' },
            { key: 'numberingEnd', label: 'Numbering End' },
            { key: 'numberingColor', label: 'Numbering Color' },
            { key: 'binderyTime', label: 'Bindery Time' },
        ];

        const otherFields = [
            { key: 'other', label: 'Other' },
            { key: 'description', label: 'Description' },
        ];

        // Process each set of options
        for (let i = 0; i < processingOptions.length; i++) {
            const options = processingOptions[i] as SerializedProcessingOptions;
            
            // Add a separator and option number if there are multiple sets
            if (i > 0) {
                yPos += 10;
                doc.setFont('helvetica', 'bold');
                doc.text(`Option Set ${i + 1}`, leftMargin, yPos);
                yPos += 10;
            }

            let leftY = yPos;
            let rightY = yPos;

            // Process basic options (left column)
            for (const field of basicOptions) {
                const value = options[field.key as keyof SerializedProcessingOptions];
                if (value) {
                    doc.setFont('helvetica', 'bold');
                    doc.text(field.label, leftMargin, leftY);
                    doc.setFont('helvetica', 'normal');
                    doc.text(String(value), leftMargin + 60, leftY);
                    leftY += 7;
                }
            }

            // Add spacing before additional options
            leftY += 3;

            // Process additional options (left column)
            for (const field of additionalOptions) {
                const value = options[field.key as keyof SerializedProcessingOptions];
                if (value) {
                    doc.setFont('helvetica', 'bold');
                    doc.text(field.label, leftMargin, leftY);
                    doc.setFont('helvetica', 'normal');
                    doc.text(String(value), leftMargin + 60, leftY);
                    leftY += 7;
                }
            }

            // Process numbering options (right column)
            for (const field of numberingOptions) {
                const value = options[field.key as keyof SerializedProcessingOptions];
                if (value) {
                    doc.setFont('helvetica', 'bold');
                    doc.text(field.label, rightColStart, rightY);
                    doc.setFont('helvetica', 'normal');
                    doc.text(String(value), rightColStart + 60, rightY);
                    rightY += 7;
                }
            }

            // Update yPos to the maximum height of both columns
            yPos = Math.max(leftY, rightY);

            // Process other fields at the bottom
            for (const field of otherFields) {
                const value = options[field.key as keyof SerializedProcessingOptions];
                if (value) {
                    yPos += 7;
                    doc.setFont('helvetica', 'bold');
                    doc.text(field.label, leftMargin, yPos);
                    doc.setFont('helvetica', 'normal');
                    doc.text(String(value), leftMargin + 60, yPos);
                }
            }

            // Add spacing after this set of options
            yPos += 10;

            // Check if we need a new page before the next set
            if (i < processingOptions.length - 1) {
                yPos = checkAndAddPage(doc, yPos, 40);
            }
        }
    }
    yPos = checkAndAddPage(doc, yPos, 40); // Check if we need a new page
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