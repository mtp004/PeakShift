export const compressImage = async (file: File): Promise<File | null> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'FILE_COMPRESS');

  try {
    // Step 1: Upload to Cloudinary
    const cloudName = import.meta.env.VITE_CLOUDINARY_NAME;
    const uploadResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    );

    if (!uploadResponse.ok) {
      const errorText = await uploadResponse.text();
      throw new Error(`Cloudinary upload failed: ${uploadResponse.status} - ${errorText}`);
    }

    const uploadData = await uploadResponse.json();
    const publicId = uploadData.public_id;
    const originalMimeType = file.type;

    // Step 2: Fetch and compress the uploaded image
    const qualityLevels = [90, 80, 70, 60, 50];
    for (const quality of qualityLevels) {
      const optimizedUrl = `https://res.cloudinary.com/peakshift/image/upload/c_limit,w_2000,h_2000,e_grayscale,e_contrast:40,e_sharpen:100,q_${quality}/${publicId}`;
      // Fetch the actual image directly
      const response = await fetch(optimizedUrl);
      if (!response.ok) {
        continue;
      }
      
      // Check content length from the response headers
      const contentLength = response.headers.get('Content-Length');
      if (!contentLength || parseInt(contentLength) > 1024 * 1024) {
        continue;
      }
      
      const blob = await response.blob();
      deleteResource(publicId).catch(error => {
        console.warn('Failed to clean up after successful compression:', error);
      });
      
      return new File([blob], file.name, { type: originalMimeType });
    }

    if (publicId) {
      deleteResource(publicId).catch(error => {
        console.warn('Failed to clean up after compression failure:', error);
      });
    }
    //If loop completes without finding a suitable size
    return null;
    
  } catch (error: any) {
    throw error;
  }
};

export const deleteResource = async (publicId: string): Promise<{ message: string; result: any }> => {
  try {
    const response = await fetch(
      `https://deletecloudinaryresource-s43aur27va-uc.a.run.app?publicId=${encodeURIComponent(publicId)}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new Error(errorMessage || 'Failed to delete resource');
    }

    const result = await response.json();
    return result;
    
  } catch (error: any) {
    throw error;
  }
};

