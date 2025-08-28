import { useState } from 'react';
import { compressImage } from '../APIs/ImageCompressor';
import { Tooltip } from './Tooltip';

interface UploadResponse {
  filename: string;
  fileSize: number;
  extractedText: string;
  utilityRateName: string;
  message: string;
}

interface UploadPageProps {
  enableTooltip?: Boolean;
  backgroundClass?: string;
}

const helpTooltip = (
  <>
    <div className="mb-3">
      Upload your electric bill to automatically identify your current utility rate schedule. 
      This helps you find the exact rate plan you're on so you can get accurate optimization recommendations.
    </div>
    
    <div className="fw-bold mb-2">How to upload your bill:</div>
    <ol className="mb-2 ps-3 small">
      <li className="mb-1">
        <strong>Choose your file</strong> - Select your electric bill in PDF or image format (max 1MB)
      </li>
      <li className="mb-1">
        <strong>Wait for processing</strong> - Large files will be automatically compressed to meet size requirements
      </li>
      <li className="mb-1">
        <strong>Upload the file</strong> - Click the ✓ button to send your bill for analysis
      </li>
      <li className="mb-1">
        <strong>View your rate name</strong> - Your utility rate schedule will be identified and displayed
      </li>
    </ol>
    <div className="text-muted small">
      <strong>Supported formats:</strong> PDF, JPEG, PNG, JPG, GIF, BMP, TIF, TIFF
    </div>
  </>
);

export default function UploadPage({ enableTooltip = true, backgroundClass = 'bg-white' }: UploadPageProps) {
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState('');
  const [utilityRateName, setUtilityRateName] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setCompressedFile(null);
    setError('');
    setUtilityRateName('');

    if (!selectedFile) return;

    if (selectedFile.size > 1024 * 1024) {
      try {
        setCompressing(true);
        const compressed = await compressImage(selectedFile);
        if (compressed) {
          setCompressedFile(compressed);
        } else {
          setError('Dawg this file too large to compress under 1MB 💀');
        }
      } catch (err: any) {
        setError(`Compression failed: ${err.message}`);
      } finally {
        setCompressing(false);
      }
    } else {
      setCompressedFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!compressedFile) {
      setError('Please wait for file compression to complete.');
      return;
    }

    if (compressedFile.size === 0) {
      setError('File is corrupted or empty. Please try again.');
      return;
    }

    const formData = new FormData();
    formData.append('file', compressedFile);

    try {
      setUploading(true);
      setError('');
      setUtilityRateName('');

      const response = await fetch('https://handlefileupload-s43aur27va-uc.a.run.app', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error ${response.status}: ${errorText}`);
      }

      const data: UploadResponse = await response.json();
      setUtilityRateName(data.utilityRateName);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div 
      className={`d-flex flex-column justify-content-center align-items-center h-100 p-2 position-relative ${backgroundClass}`}
    >
      {enableTooltip && (
        <div style={{ position: 'absolute', top: '20px', right: '20px' }}>
          <Tooltip tooltip={helpTooltip} />
        </div>
      )}

      <p className="text-center mb-3 fw-bold fs-4">
        Upload your electric bill to find your rate name(Cannot exceed 1MB)
      </p>
      <p className="text-center mt-3 text-muted small">
        Accepted filetypes: .pdf, .jpeg, .png, .jpg
      </p>
      <div className="d-flex justify-content-center mb-3 w-100">
        <input
          type="file"
          accept=".jpg, .jpeg, .png, .gif, .bmp, .pdf, .tif, .tiff"
          onChange={handleFileChange}
          className="form-control w-auto me-2"
        />
        <button
          onClick={handleUpload}
          disabled={uploading || compressing || !compressedFile}
          className="btn btn-primary"
        >
          ✓
        </button>
      </div>
      {compressing ? (
        <div className="d-flex align-items-center">
          <span>💔🥀 I said 1MB only, compressing nonetheless...</span>
          <div className="spinner-border spinner-border-sm me-2" role="status"></div>
        </div>
      ) : uploading ? (
        <div className="d-flex align-items-center">
          <span>Uploading...</span>
          <div className="spinner-border spinner-border-sm me-2" role="status"></div>
        </div>
      ) : (
        <span>{utilityRateName}</span>
      )}
      {error && (
        <span className="text-danger">{error}</span>
      )}
    </div>
  );
}