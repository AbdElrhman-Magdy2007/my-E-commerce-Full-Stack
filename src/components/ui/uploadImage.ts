export const uploadImageToCloudinary = async (imageFile: File) => {
    if (!imageFile || imageFile.size === 0) {
      console.error("❌ No image file provided!");
      return null;
    }
  
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "your_upload_preset");
    formData.append("api_key", process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "your_api_key");
  
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );
  
      if (!response.ok) {
        throw new Error(`Failed to upload image: ${response.statusText}`);
      }
  
      const data = await response.json();
      console.log("✅ Image uploaded successfully:", data.secure_url);
      return data.secure_url;
    } catch (error) {
      console.error("🚨 Error uploading file to Cloudinary:", error);
      return null;
    }
  };
  