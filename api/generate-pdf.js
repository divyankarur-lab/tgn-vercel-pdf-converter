import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { JSDOM } from 'jsdom';

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { html, options = {} } = req.body;

  if (!html) {
    return res.status(400).json({ error: 'HTML content is required' });
  }

  try {
    console.log('🚀 Starting PDF generation with pdf-lib (no browser dependencies)...');
    console.log('Runtime environment:', process.env.VERCEL ? 'Vercel' : 'Local');
    
    // Parse HTML to extract text content
    const dom = new JSDOM(html);
    const document = dom.window.document;
    
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Add fonts
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    
    // Add a page
    const page = pdfDoc.addPage();
    const { width, height } = page.getSize();
    
    // Extract text content and basic styling
    let yPosition = height - 50;
    const lineHeight = 20;
    const margin = 50;
    const maxWidth = width - (margin * 2);
    
    console.log('📄 Parsing HTML and generating PDF...');
    
    // Process different HTML elements
    const elements = document.body.querySelectorAll('h1, h2, h3, p, li, div');
    
    for (const element of elements) {
      const text = element.textContent?.trim();
      if (!text) continue;
      
      let fontSize = 12;
      let currentFont = font;
      let color = rgb(0, 0, 0);
      
      // Basic styling based on element type
      switch (element.tagName.toLowerCase()) {
        case 'h1':
          fontSize = 24;
          currentFont = boldFont;
          color = rgb(0.15, 0.38, 0.92); // Blue color
          break;
        case 'h2':
          fontSize = 20;
          currentFont = boldFont;
          break;
        case 'h3':
          fontSize = 16;
          currentFont = boldFont;
          break;
        case 'li':
          // Add bullet point
          page.drawText('• ', {
            x: margin,
            y: yPosition,
            size: fontSize,
            font: currentFont,
            color
          });
          break;
      }
      
      // Simple text wrapping
      const words = text.split(' ');
      let currentLine = '';
      
      for (const word of words) {
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const textWidth = currentFont.widthOfTextAtSize(testLine, fontSize);
        
        if (textWidth > maxWidth && currentLine !== '') {
          // Draw current line
          const xPos = element.tagName.toLowerCase() === 'li' ? margin + 15 : margin;
          page.drawText(currentLine, {
            x: xPos,
            y: yPosition,
            size: fontSize,
            font: currentFont,
            color
          });
          
          yPosition -= lineHeight;
          currentLine = word;
          
          // Add new page if needed
          if (yPosition < 50) {
            const newPage = pdfDoc.addPage();
            yPosition = newPage.getSize().height - 50;
          }
        } else {
          currentLine = testLine;
        }
      }
      
      // Draw remaining text
      if (currentLine) {
        const xPos = element.tagName.toLowerCase() === 'li' ? margin + 15 : margin;
        page.drawText(currentLine, {
          x: xPos,
          y: yPosition,
          size: fontSize,
          font: currentFont,
          color
        });
      }
      
      yPosition -= lineHeight + (element.tagName.startsWith('h') ? 10 : 5);
      
      // Add new page if needed
      if (yPosition < 50) {
        const newPage = pdfDoc.addPage();
        yPosition = newPage.getSize().height - 50;
      }
    }

    // Generate PDF bytes
    const pdfBytes = await pdfDoc.save();
    
    console.log(`✅ PDF generated successfully (${pdfBytes.length} bytes)`);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdfBytes.length);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Send PDF buffer
    res.send(Buffer.from(pdfBytes));

  } catch (error) {
    console.error('❌ PDF generation error:', error);
    res.status(500).json({ 
      error: 'PDF generation failed',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  }
}

// Handle CORS preflight
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
    responseLimit: '50mb',
  },
}