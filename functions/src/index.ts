import { onRequest } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import Busboy from 'busboy';
import { processImageWithOcr } from './OCR-helper';

initializeApp();

export const handleFileUpload = onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    res.status(405).send('Method not allowed');
    return;
  }

  // Ensure Content-Type is multipart/form-data
  const contentType = req.headers['content-type'];
  if (!contentType || !contentType.startsWith('multipart/form-data')) {
    res.status(400).send('Bad Request: Content-Type must be multipart/form-data');
    return;
  }

  if (!req.rawBody) {
    res.status(500).send('Internal Server Error: Raw body not available for parsing.');
    return;
  }

  // Extract boundary from Content-Type header
  const boundary = contentType.split('boundary=')[1];
  if (!boundary) {
    res.status(400).send('Bad Request: Missing boundary in Content-Type header.');
    return;
  }

  // OCR Configuration - You should store these as environment variables
  const OCR_API_KEY = 'K89233544288957';
  const OCR_API_URL = 'https://api.ocr.space/parse/image';

  // Variables to store file data
  let uploadedFileName: string | undefined;
  let fileBuffer: Buffer | undefined;

  // Create a new Busboy instance
  const busboy = Busboy({
    headers: { 'content-type': `multipart/form-data; boundary=${boundary}` }
  });

  // Event listener for when a file is encountered
  busboy.on('file', (fieldname, file, filenameInfo) => {
    uploadedFileName = filenameInfo.filename;
    
    // Collect file chunks into a buffer
    const chunks: Buffer[] = [];
    
    file.on('data', (chunk) => {
      chunks.push(chunk);
    });
    
    file.on('end', () => {
      fileBuffer = Buffer.concat(chunks);
    });
  });

  // Event listener for when all fields and files have been parsed
  busboy.on('finish', async () => {
    try {
      if (!uploadedFileName || !fileBuffer) {
        res.status(400).json({ 
          error: 'No file uploaded or file data not found' 
        });
        return;
      }

      // Check if it's an image file (optional validation)
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'pdf'];
      const fileExtension = uploadedFileName.toLowerCase().split('.').pop();
      
      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        res.status(400).json({ 
          error: 'Invalid file type. Please upload an image or PDF file.' 
        });
        return;
      }
      
      const extractedText = await processImageWithOcr(
        fileBuffer,
        uploadedFileName,
        OCR_API_KEY,
        OCR_API_URL
      );

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=AIzaSyDW2LYFJwI2n3sdtkkHYQMwa1-HX5I-dCY`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `
From the following OCR text, extract the full utility rate name. 

The rate name is typically on its own line, but may include additional descriptors such as cycle numbers (e.g., "Cycle 17") on the same line. 

Return only the full rate name exactly as it appears — including any numbers, codes, or cycles — and nothing else.

Text:
${extractedText}
`
                  },
                ],
              },
            ],
          }),
        }
      );

      if (!geminiRes.ok) {
        throw new Error(`Gemini API error ${geminiRes.status}`);
      }

      const geminiData = await geminiRes.json();
      const modelText =
        geminiData?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '(No result)';

      // Return successful response with extracted text
      res.status(200).json({
        success: true,
        filename: uploadedFileName,
        fileSize: fileBuffer.length,
        extractedText: extractedText,
        utilityRateName: modelText,
        message: 'File processed successfully'
      });

    } catch (error) {
      console.error('Error processing file:', error);
      
      // Return error response
      res.status(500).json({
        success: false,
        error: 'Failed to process file with OCR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Event listener for errors
  busboy.on('error', (err: any) => {
    console.error('Busboy parsing error:', err);
    res.status(500).json({ 
      error: 'Error parsing file upload',
      details: err.message 
    });
  });

  // Feed the buffered rawBody to busboy
  busboy.end(req.rawBody);
});