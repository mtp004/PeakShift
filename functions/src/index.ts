import { onRequest } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import Busboy from 'busboy';
import { processImageWithOcr, OcrSpaceResponse } from './OCR-helper';

initializeApp();

export const handleFileUpload = onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', 'https://peakshift-react.web.app');
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
  let uploadedFileName: string 
  let fileBuffer: Buffer

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
      // Check if it's an image file (optional validation)
      const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'pdf'];
      const fileExtension = uploadedFileName.toLowerCase().split('.').pop();
      
      if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
        res.status(400).send('Invalid file type. Please upload an image or PDF file.');
        return;
      }
      
      const ocrResult: OcrSpaceResponse = await processImageWithOcr(
        fileBuffer,
        uploadedFileName,
        OCR_API_KEY,
        OCR_API_URL
      );

      let extractedText = '';
      if (!ocrResult.IsErroredOnProcessing && ocrResult.ParsedResults && ocrResult.ParsedResults.length > 0) {
        extractedText = ocrResult.ParsedResults
        ?.map(result => result.ParsedText)
        ?.join('\n\n') || '';
      } else {
        // Handle OCR errors
        const errorMessage = ocrResult.ErrorMessage?.length > 0 
          ? ocrResult.ErrorMessage.join(', ')
          : 'Unknown OCR error';
        res.status(400).send(errorMessage);
        return;
      }

      //Implement here

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=AIzaSyDW2LYFJwI2n3sdtkkHYQMwa1-HX5I-dCY`,
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
Analyze the following OCR text from a utility bill or rate schedule document.
- **Task:** Extract ONLY the utility rate name, excluding any prefixes or labels.
- **Rate Name Characteristics:**
  - Usually a distinct line item, often bold or larger font. However, if cycle/plan identifiers appear on the line immediately after the rate name, include them as part of the complete rate name
  - May be near keywords like 'Rate Schedule', 'Service Type', 'Billing Plan', or 'Cycle'
  - Can include alphanumeric identifiers (e.g., 'Cycle 17')
- **Output:**
  - Return ONLY the rate name without prefixes like "Rate Schedule:" or "Service Type:"
  - If none found, return: "No schedule name can be extracted"
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
        filename: uploadedFileName,
        fileSize: fileBuffer.length,
        extractedText: extractedText,
        utilityRateName: modelText,
        message: 'File processed successfully'
      });

    } catch (error: any) {
      // Return error response
      res.status(500).send((error as Error).message);
    }
  });

  // Event listener for errors
  busboy.on('error', (err: any) => {
    res.status(500).send('Error parsing file upload');
  });

  // Feed the buffered rawBody to busboy
  busboy.end(req.rawBody);
});