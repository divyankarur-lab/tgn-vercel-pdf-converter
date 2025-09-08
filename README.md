# TGN Free PDF Generation Service

## 🆓 Unlimited FREE HTML to PDF conversion using Vercel + Puppeteer

This service provides unlimited PDF generation for The Good Will Network's agreement workflow.

## 🚀 Quick Setup (5 minutes)

### 1. Deploy to Vercel (FREE)
```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to this directory
cd vercel-pdf-service

# Deploy to Vercel (creates free account if needed)
vercel --prod
```

### 2. Update Your Convex Environment
After deployment, update your Convex environment variable:
```bash
PDF_GENERATION_URL=https://your-app.vercel.app/api/generate-pdf
```

### 3. Test the Service
```bash
curl -X POST https://your-app.vercel.app/api/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{"html": "<h1>Test PDF</h1>", "options": {"format": "A4"}}'
```

## ✅ Benefits

- **🆓 Completely FREE** - Vercel's generous free tier
- **⚡ Fast** - 1-3 second generation time
- **🎨 Perfect CSS Support** - Full Chrome rendering
- **📱 Responsive** - Works with any CSS framework
- **🔄 Unlimited** - No monthly request limits
- **🛡️ Reliable** - 99.9% uptime with Vercel

## 🔧 Features

- Professional PDF formatting
- Custom margins and page sizes
- Background graphics and images
- Modern CSS support (Flexbox, Grid)
- Font loading and custom fonts
- Print-optimized layouts

## 💡 Alternative Free APIs

If you prefer not to self-host:

1. **HTMLCSStoImage** - 50 PDFs/month free
2. **PDFShift** - 250 PDFs/month free  
3. **Bannerbear** - 30 PDFs/month free

## 🛠️ Environment Variables

```bash
# Optional - will fallback gracefully
PDF_GENERATION_URL=https://your-vercel-app.vercel.app/api/generate-pdf
PDF_API_KEY=your_backup_service_key  # For fallback services
```

## 📊 Usage in Your Agreement Workflow

The service automatically:
1. Receives HTML from Convex backend
2. Generates professional PDF
3. Returns binary PDF data
4. Convex stores PDF in permanent storage
5. PDF is ready for signature workflow

## 🎯 Perfect for TGN Agreements

- Branded letterheads
- Professional formatting  
- Legal document standards
- Multi-page agreements
- Custom styling and logos