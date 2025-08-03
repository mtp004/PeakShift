import { useState } from 'react';

interface UploadResponse {
  success: boolean;
  filename: string;
  fileSize: number;
  extractedText: string;
  utilityRateName: string;
  message: string;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [utilityRateName, setUtilityRateName] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files?.[0] || null);
    setError('');
    setUtilityRateName('');
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      setError('');
      setUtilityRateName('');

      // Step 1: Upload to your backend
      const response = await fetch('https://handlefileupload-s43aur27va-uc.a.run.app', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server error ${response.status}: ${response.statusText}`);
      }

      const data: UploadResponse = await response.json();
      setUtilityRateName(data.utilityRateName);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="d-flex flex-column justify-content-center align-items-center h-100">
      {/* Text at the beginning - now bigger and bolder */}
      <p className="text-center mb-3 fw-bold fs-4">
        Upload your electric bill to find your rate name(Cannot exceed 1MB)
      </p>
      <p className="text-center mt-3 text-muted small">
        Accepted filetypes: .pdf, .jpeg, .png, .jpg
      </p>
      <div className="d-flex align-items-center mb-3">
        <input
          type="file"
          accept="image/*, .pdf"
          onChange={handleFileChange}
          className="form-control w-auto me-2"
        />
        <button
          onClick={handleUpload}
          disabled={uploading || !file}
          className="btn btn-primary"
        >
          ✓
        </button>
      </div>

      {uploading ? (
          <div className="spinner-border spinner-border-sm" role="status"></div>
        ) : (
        <span>{utilityRateName}</span>
      )}
      {error && (
        <span className="text-danger">{error}</span>
      )}
      <p className="text-center mt-3 text-muted small">
        * Disclaimer: AI can make mistakes. Please double-check the result.
      </p>
    </div>
  );
}
