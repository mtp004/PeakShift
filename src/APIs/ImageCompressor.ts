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
      const qualityLevels = [100, 90, 80, 70, 60, 50, 40];
      for (const quality of qualityLevels) {
        const optimizedUrl = `https://res.cloudinary.com/peakshift/image/upload/c_limit,w_2000,h_2000,e_grayscale,e_contrast:40,e_sharpen:100,q_${quality}/${publicId}`;;
        const response = await fetch(optimizedUrl);

        if (!response.ok) {
          continue;
        }

        const blob = await response.blob();
        if (blob.size > 0 && blob.size <= 1024 * 1024) {
          return new File([blob], file.name, { type: originalMimeType });
        }
      }

      // If loop completes without finding a suitable size
      return null;
    } catch (err) {
      throw err;
    }
};