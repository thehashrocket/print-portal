import PDFDocument from 'pdfkit';

export async function generateInvoicePDF(invoice: any): Promise<string> {
    return new Promise((resolve, reject) => {
        const doc = new PDFDocument();
        let buffers: Buffer[] = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            let pdfData = Buffer.concat(buffers);
            resolve(pdfData.toString('base64'));
        });

        // Add content to the PDF
        doc.fontSize(25).text('Invoice', { align: 'center' });
        doc.moveDown();
        doc.fontSize(15).text(`Invoice Number: ${invoice.invoiceNumber}`);
        doc.text(`Date: ${invoice.dateIssued.toDateString()}`);
        doc.text(`Due Date: ${invoice.dateDue.toDateString()}`);
        doc.moveDown();
        doc.text(`Bill To: ${invoice.order.Office.Company.name}`);
        doc.moveDown();

        // Add table for invoice items
        const tableTop = 200;
        doc.font('Helvetica-Bold');
        doc.text('Item', 50, tableTop);
        doc.text('Quantity', 200, tableTop);
        doc.text('Price', 300, tableTop);
        doc.text('Total', 400, tableTop);

        let tableRow = 0;
        invoice.InvoiceItems.forEach((item: any) => {
            tableRow += 20;
            doc.font('Helvetica');
            doc.text(item.description, 50, tableTop + tableRow);
            doc.text(item.quantity.toString(), 200, tableTop + tableRow);
            doc.text(`$${item.unitPrice}`, 300, tableTop + tableRow);
            doc.text(`$${item.total}`, 400, tableTop + tableRow);
        });

        doc.moveDown();
        doc.text(`Subtotal: $${invoice.subtotal}`);
        doc.text(`Tax: $${invoice.taxAmount}`);
        doc.font('Helvetica-Bold');
        doc.text(`Total: $${invoice.total}`);

        doc.end();
    });
}