// Client-side PDF generation using html2pdf.js
// No server dependencies - works entirely in browser context

export default async function handler(req, res) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.status(200).end();
    return;
  }

  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { html } = req.body;

  if (!html) {
    return res.status(400).json({ error: 'HTML content is required' });
  }

  try {
    console.log('🚀 Starting client-side PDF generation...');
    
    // Return HTML page that will generate PDF client-side
    const clientSideGenerator = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>PDF Generator</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js"></script>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 20px; 
            background: #f5f5f5; 
        }
        .generator-container { 
            max-width: 800px; 
            margin: 0 auto; 
            background: white; 
            padding: 20px; 
            border-radius: 8px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
        }
        .status { 
            padding: 10px; 
            border-radius: 4px; 
            margin: 10px 0; 
            text-align: center;
        }
        .loading { background: #e3f2fd; color: #1976d2; }
        .success { background: #e8f5e8; color: #2e7d32; }
        .error { background: #ffebee; color: #c62828; }
        #content { display: none; }
        button {
            background: #34C759;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            margin: 10px 5px;
        }
        button:hover { background: #2da94b; }
        button:disabled { background: #ccc; cursor: not-allowed; }
    </style>
</head>
<body>
    <div class="generator-container">
        <h1>📄 Agreement PDF Generator</h1>
        <div id="status" class="status loading">🔄 Initializing PDF generation...</div>
        
        <button id="generateBtn" onclick="generatePDF()" disabled>Generate PDF</button>
        <button id="previewBtn" onclick="showPreview()" disabled>Show Preview</button>
        
        <div id="content">${html.replace(/'/g, "&#39;")}</div>
    </div>

    <script>
        let htmlContent = ${JSON.stringify(html)};
        
        window.onload = function() {
            document.getElementById('status').innerHTML = '✅ Ready to generate PDF';
            document.getElementById('status').className = 'status success';
            document.getElementById('generateBtn').disabled = false;
            document.getElementById('previewBtn').disabled = false;
        };

        function showPreview() {
            const content = document.getElementById('content');
            if (content.style.display === 'none') {
                content.style.display = 'block';
                document.getElementById('previewBtn').innerHTML = 'Hide Preview';
            } else {
                content.style.display = 'none';
                document.getElementById('previewBtn').innerHTML = 'Show Preview';
            }
        }

        async function generatePDF() {
            try {
                document.getElementById('status').innerHTML = '🔄 Generating PDF...';
                document.getElementById('status').className = 'status loading';
                document.getElementById('generateBtn').disabled = true;
                
                // Create temporary container for PDF generation
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = htmlContent;
                
                // Better styling for PDF conversion
                tempDiv.style.width = '794px'; // A4 width in pixels
                tempDiv.style.minHeight = '1123px'; // A4 height in pixels  
                tempDiv.style.padding = '40px';
                tempDiv.style.margin = '0';
                tempDiv.style.backgroundColor = 'white';
                tempDiv.style.fontFamily = 'Arial, sans-serif';
                tempDiv.style.fontSize = '16px';
                tempDiv.style.lineHeight = '1.5';
                tempDiv.style.color = 'black';
                tempDiv.style.position = 'absolute';
                tempDiv.style.top = '-9999px';
                tempDiv.style.left = '-9999px';
                
                // Ensure all fonts are web-safe
                const allElements = tempDiv.querySelectorAll('*');
                allElements.forEach(el => {
                    const computedStyle = window.getComputedStyle ? window.getComputedStyle(el) : el.currentStyle;
                    if (computedStyle && computedStyle.fontFamily) {
                        el.style.fontFamily = 'Arial, sans-serif';
                    }
                });
                
                document.body.appendChild(tempDiv);
                
                // Wait for images to load
                const images = tempDiv.querySelectorAll('img');
                const imagePromises = Array.from(images).map(img => {
                    return new Promise((resolve) => {
                        if (img.complete) {
                            resolve();
                        } else {
                            img.onload = resolve;
                            img.onerror = resolve; // Continue even if image fails
                            // Timeout after 5 seconds
                            setTimeout(resolve, 5000);
                        }
                    });
                });
                
                await Promise.all(imagePromises);
                
                // Wait a bit more for any remaining rendering
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // PDF generation options - simplified for better compatibility
                const options = {
                    margin: [10, 10, 10, 10],
                    filename: 'agreement.pdf',
                    image: { 
                        type: 'jpeg', 
                        quality: 0.95
                    },
                    html2canvas: { 
                        scale: 1.5, // Reduced scale for better stability
                        useCORS: true,
                        allowTaint: true,
                        letterRendering: true,
                        logging: true,
                        width: 794,
                        height: 1123
                    },
                    jsPDF: { 
                        unit: 'mm', 
                        format: 'a4', 
                        orientation: 'portrait'
                    }
                };
                
                // Generate PDF
                await html2pdf().set(options).from(tempDiv).save();
                
                // Clean up
                document.body.removeChild(tempDiv);
                
                document.getElementById('status').innerHTML = '🎉 PDF generated and downloaded successfully!';
                document.getElementById('status').className = 'status success';
                document.getElementById('generateBtn').disabled = false;
                
            } catch (error) {
                console.error('PDF generation error:', error);
                document.getElementById('status').innerHTML = '❌ Error generating PDF: ' + error.message;
                document.getElementById('status').className = 'status error';
                document.getElementById('generateBtn').disabled = false;
            }
        }
    </script>
</body>
</html>`;

    // Return the client-side generator
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(clientSideGenerator);
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    res.status(500).json({ 
      error: 'Failed to create PDF generator',
      details: error.message 
    });
  }
}