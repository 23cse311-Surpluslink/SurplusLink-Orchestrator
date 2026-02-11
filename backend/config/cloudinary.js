import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import dotenv from 'dotenv';

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    const isAvatar = file.fieldname === 'avatar';
    
    // Determine resource type: images for avatars, 'auto' for others to handle PDFs correctly
    const resourceType = isAvatar ? 'image' : 'auto';

    return {
      folder: isAvatar ? 'surplus-link-avatars' : 'surplus-link-verifications',
      resource_type: resourceType,
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
      // Removed forced format: 'pdf' to allow original file extensions to persist
    };
  },
});

const upload = multer({ storage: storage });

export { cloudinary };
export default upload;
