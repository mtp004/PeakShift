export interface OcrSpaceResponse {
  ParsedResults?: {
    TextOverlay: any;
    TextOrientation: string;
    FileParseExitCode: number;
    ParsedText: string;
    ErrorMessage: string;
    ErrorDetails: string;
  }[];
  OcrExitCode: number;
  IsErroredOnProcessing: boolean;
  ErrorMessage: string[];
  ErrorDetails: string;
}

function getContentTypeFromFilename(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();
  const mimeTypes: { [key: string]: string } = {
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'bmp': 'image/bmp',
    'tiff': 'image/tiff',
    'pdf': 'application/pdf'
  };
  return mimeTypes[ext || ''] || 'image/jpeg';
}

export async function processImageWithOcr(
  fileBuffer: Buffer,
  filename: string,
  ocrApiKey: string,
  ocrApiUrl: string
): Promise<OcrSpaceResponse> {
  // --- 1. Prepare Outbound Request to OCR.space ---
  // Using native FormData (available in Node.js 18+ and browsers)
  const formDataForOcr = new FormData();
  formDataForOcr.append('apikey', ocrApiKey);
  formDataForOcr.append('language', 'eng');
  formDataForOcr.append('isOverlayRequired', 'false');
  formDataForOcr.append('scale', 'true');
  formDataForOcr.append('OCREngine', '2');
  
  // Create a Blob from the buffer for native FormData
    const uint8Array = new Uint8Array(fileBuffer);
  const blob = new Blob([uint8Array], { 
    type: getContentTypeFromFilename(filename) 
  });
  formDataForOcr.append('file', blob, filename);

  try {
    // --- 2. Make the OCR.space API Call using fetch ---
    const response = await fetch(ocrApiUrl, {
      method: 'POST',
      body: formDataForOcr,
    });

    // --- 3. Handle the HTTP Response ---
    if (!response.ok) {
      // If the response is not a success (e.g., 4xx or 5xx), throw an error.
      const errorText = await response.text();
      throw new Error(`OCR.space API request failed: HTTP Status ${response.status} - ${errorText}`);
    }
    const ocrResult: OcrSpaceResponse = await response.json();

    return ocrResult;
  } catch (error) {
    throw error;
  }
}