// DATA EXPORT UTILITIES
// Functions to export data to CSV, Excel, and PDF formats

const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');

/**
 * Export data to CSV format
 * @param {Array} data - Array of objects to export
 * @param {Array} columns - Optional array of column names to include
 * @returns {String} CSV string
 */
function exportToCSV(data, columns = null) {
  if (!data || data.length === 0) {
    return '';
  }

  // Get column headers
  const headers = columns || Object.keys(data[0]);

  // Create CSV header row
  const csvHeader = headers.map(escapeCSVField).join(',');

  // Create CSV data rows
  const csvRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      return escapeCSVField(value);
    }).join(',');
  });

  // Combine header and rows
  return [csvHeader, ...csvRows].join('\n');
}

/**
 * Escape and format a CSV field
 */
function escapeCSVField(value) {
  if (value === null || value === undefined) {
    return '';
  }

  // Convert to string
  let str = String(value);

  // If contains comma, quotes, or newline, wrap in quotes and escape quotes
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    str = '"' + str.replace(/"/g, '""') + '"';
  }

  return str;
}

/**
 * Export data to Excel format
 * @param {Array} data - Array of objects to export
 * @param {String} sheetName - Name of the worksheet
 * @param {Object} options - Optional formatting options
 * @returns {Promise<Buffer>} Excel file buffer
 */
async function exportToExcel(data, sheetName = 'Data', options = {}) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  if (!data || data.length === 0) {
    return await workbook.xlsx.writeBuffer();
  }

  // Get columns from first row
  const headers = Object.keys(data[0]);

  // Define columns with headers
  worksheet.columns = headers.map(header => ({
    header: formatHeader(header),
    key: header,
    width: 20
  }));

  // Style header row
  worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF7C3AED' } // Purple background
  };
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
  worksheet.getRow(1).height = 25;

  // Add data rows
  data.forEach(row => {
    const rowData = {};
    headers.forEach(header => {
      rowData[header] = formatCellValue(row[header]);
    });
    worksheet.addRow(rowData);
  });

  // Apply alternating row colors
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1 && rowNumber % 2 === 0) {
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFF8FAFC' } // Light gray
      };
    }
  });

  // Add filters to header row
  worksheet.autoFilter = {
    from: 'A1',
    to: `${String.fromCharCode(64 + headers.length)}1`
  };

  // Freeze header row
  worksheet.views = [
    { state: 'frozen', xSplit: 0, ySplit: 1 }
  ];

  // Add summary at the bottom if numeric data exists
  const numericColumns = headers.filter(header => {
    return typeof data[0][header] === 'number';
  });

  if (numericColumns.length > 0) {
    const summaryRow = worksheet.addRow({});
    summaryRow.getCell(1).value = 'TOTAL';
    summaryRow.font = { bold: true };
    summaryRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE5E7EB' }
    };

    numericColumns.forEach(column => {
      const columnIndex = headers.indexOf(column) + 1;
      const columnLetter = String.fromCharCode(64 + columnIndex);
      const formula = `SUM(${columnLetter}2:${columnLetter}${data.length + 1})`;
      summaryRow.getCell(columnIndex).value = { formula };
      summaryRow.getCell(columnIndex).numFmt = '#,##0.00';
    });
  }

  // Generate buffer
  return await workbook.xlsx.writeBuffer();
}

/**
 * Format header text (convert snake_case to Title Case)
 */
function formatHeader(header) {
  return header
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Format cell value for Excel
 */
function formatCellValue(value) {
  if (value === null || value === undefined) {
    return '';
  }

  // Format dates
  if (value instanceof Date) {
    return value;
  }

  // Check if string looks like date
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return date;
    }
  }

  // Format booleans
  if (typeof value === 'boolean') {
    return value ? 'Yes' : 'No';
  }

  return value;
}

/**
 * Export data to PDF format
 * @param {Array} data - Array of objects to export
 * @param {String} title - Document title
 * @param {Object} options - Optional formatting options
 * @returns {Promise<Buffer>} PDF file buffer
 */
async function exportToPDF(data, title = 'Data Export', options = {}) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'LETTER',
      layout: 'landscape',
      margins: { top: 50, bottom: 50, left: 50, right: 50 }
    });

    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });

    doc.on('error', reject);

    // Header
    doc.fontSize(20).font('Helvetica-Bold').text(title, { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).font('Helvetica').text(`Generated on ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    if (!data || data.length === 0) {
      doc.fontSize(12).text('No data available');
      doc.end();
      return;
    }

    // Table
    const headers = Object.keys(data[0]);
    const tableTop = doc.y;
    const columnWidth = (doc.page.width - 100) / headers.length;

    // Draw header row
    doc.fontSize(9).font('Helvetica-Bold');
    headers.forEach((header, i) => {
      const x = 50 + (i * columnWidth);
      doc.rect(x, tableTop, columnWidth, 20).fill('#7C3AED');
      doc.fillColor('white').text(formatHeader(header), x + 5, tableTop + 5, {
        width: columnWidth - 10,
        align: 'left'
      });
    });

    // Draw data rows
    doc.font('Helvetica').fontSize(8);
    let y = tableTop + 20;
    const maxRows = 30; // Limit rows per page

    data.slice(0, maxRows).forEach((row, rowIndex) => {
      // Alternate row colors
      if (rowIndex % 2 === 0) {
        doc.rect(50, y, doc.page.width - 100, 18).fill('#F8FAFC');
      }

      doc.fillColor('black');
      headers.forEach((header, i) => {
        const x = 50 + (i * columnWidth);
        const value = formatCellValue(row[header]);
        doc.text(String(value), x + 5, y + 4, {
          width: columnWidth - 10,
          align: 'left',
          ellipsis: true
        });
      });

      y += 18;

      // Add new page if needed
      if (y > doc.page.height - 100) {
        doc.addPage();
        y = 50;
      }
    });

    // Footer
    doc.fontSize(8).fillColor('gray');
    doc.text(
      `Page 1 of 1 • Showing ${Math.min(data.length, maxRows)} of ${data.length} records`,
      50,
      doc.page.height - 50,
      { align: 'center' }
    );

    doc.end();
  });
}

/**
 * Export data to JSON format (for API responses)
 * @param {Array} data - Array of objects to export
 * @param {Boolean} pretty - Whether to prettify JSON
 * @returns {String} JSON string
 */
function exportToJSON(data, pretty = false) {
  return JSON.stringify(data, null, pretty ? 2 : 0);
}

/**
 * Determine appropriate export format based on data size
 * @param {Number} rowCount - Number of rows
 * @returns {String} Recommended format
 */
function getRecommendedFormat(rowCount) {
  if (rowCount < 100) {
    return 'pdf'; // Small dataset, PDF is nice
  } else if (rowCount < 10000) {
    return 'excel'; // Medium dataset, Excel works well
  } else {
    return 'csv'; // Large dataset, CSV is most efficient
  }
}

module.exports = {
  exportToCSV,
  exportToExcel,
  exportToPDF,
  exportToJSON,
  getRecommendedFormat
};
