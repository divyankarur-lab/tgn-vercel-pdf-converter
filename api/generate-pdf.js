import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';

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

  let browser;
  
  try {
    console.log('🚀 Starting PDF generation with @sparticuz/chromium + postinstall fix...');
    
    // Launch browser with updated Chromium package and postinstall dependencies
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
      ignoreHTTPSErrors: true,
    });
    
    const page = await browser.newPage();
    
    // Use a robust method to set content and wait for it to load
    await page.setContent(html, {
      waitUntil: 'networkidle0',
      timeout: 25000 // Slightly less than Vercel's timeout
    });

    console.log('📄 Generating PDF...');

    // Generate PDF with professional settings
    const pdfBuffer = await page.pdf({
      format: options.format || 'A4',
      margin: options.margin || {
        top: '20mm',
        right: '15mm', 
        bottom: '20mm',
        left: '15mm'
      },
      printBackground: true,
      preferCSSPageSize: false,
      displayHeaderFooter: false,
      ...options
    });

    console.log(`✅ PDF generated successfully (${pdfBuffer.length} bytes)`);

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    // Send PDF buffer
    res.send(pdfBuffer);

  } catch (error) {
    console.error('❌ PDF generation error:', error);
    res.status(500).json({ 
      error: 'PDF generation failed',
      details: error.message,
      timestamp: new Date().toISOString()
    });
  } finally {
    // Always close the browser
    if (browser) {
      try {
        await browser.close();
      } catch (closeError) {
        console.warn('Browser close warning:', closeError.message);
      }
    }
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