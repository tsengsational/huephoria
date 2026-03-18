import puppeteer from 'puppeteer';
import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_PATH = path.join(__dirname, '../dist');
const PORT = 3333;

const routes = [
  '/',
  '/blog',
  '/blog/psychology-hues',
  '/blog/welcome',
  '/color-theory-guide',
  '/design-system-tips',
  '/privacy-policy',
  '/terms-of-service',
  '/cookie-policy'
];

async function prerender() {
  console.log('Starting prerender script...');
  
  const app = express();
  app.use(express.static(DIST_PATH));
  
  // Serve the index.html for all routes to handle SPA routing (Fallback)
  app.use((req, res, next) => {
    if (req.accepts('html')) {
      res.sendFile(path.join(DIST_PATH, 'index.html'));
    } else {
      next();
    }
  });

  const server = app.listen(PORT, async () => {
    console.log(`Prerender server running on http://localhost:${PORT}`);
    
    const browser = await puppeteer.launch({ 
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    
    for (const route of routes) {
      console.log(`Prerendering route: ${route}`);
      const page = await browser.newPage();
      
      // Block AdSense and other external scripts that might hang the network
      await page.setRequestInterception(true);
      page.on('request', (request) => {
        const url = request.url();
        if (url.includes('google-analytics.com') || 
            url.includes('googlesyndication.com') || 
            url.includes('doubleclick.net')) {
          request.abort();
        } else {
          request.continue();
        }
      });

      try {
        await page.goto(`http://localhost:${PORT}${route}`, { 
          waitUntil: 'networkidle2', // Changed from idle0 to idle2
          timeout: 45000 
        });
        
        // Give time for React to mount
        await new Promise(r => setTimeout(r, 2500));
        
        const content = await page.content();
        console.log(`- Content length for ${route}: ${content.length} characters`);
        
        const isRendered = content.includes('layout__header') || content.includes('layout');
        console.log(`- Is ${route} rendered? ${isRendered}`);
        
        if (!isRendered) {
          console.warn(`! Warning: ${route} might not have rendered correctly. Found root but no layout.`);
        }
        
        const filePath = path.join(DIST_PATH, route === '/' ? 'index.html' : `${route}/index.html`);
        const folderPath = path.dirname(filePath);
        
        if (!fs.existsSync(folderPath)) {
          fs.mkdirSync(folderPath, { recursive: true });
        }
        
        // If it's the home page, we overwrite index.html, otherwise we create a new index.html in the route folder
        fs.writeFileSync(filePath, content);
        console.log(`✓ Saved ${filePath}`);
      } catch (err) {
        console.error(`✗ Failed to prerender ${route}:`, err);
      } finally {
        await page.close();
      }
    }
    
    await browser.close();
    server.close(() => {
      console.log('Prerender server stopped. Prerendering complete!');
      process.exit(0);
    });
  });
}

prerender();
