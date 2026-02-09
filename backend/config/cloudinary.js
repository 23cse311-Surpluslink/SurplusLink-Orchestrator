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
    // Determine the folder based on the field name or role
    const isDocument = file.fieldname === 'verificationDoc' || file.mimetype === 'application/pdf';
    
    return {
      folder: 'surplus-link-verifications',
      format: isDocument ? 'pdf' : undefined, // Explicitly keep pdf for docs
      resource_type: 'auto', // Cloudinary will decide if it's an image or raw (pdf is usually auto/image)
      public_id: `${Date.now()}-${file.originalname.split('.')[0]}`,
    };
  },
});

const upload = multer({ storage: storage });

export { cloudinary };
export default upload;
