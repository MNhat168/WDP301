import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: 'diwo3j5vq',
  api_key: '357275715679562', 
  api_secret: '6GzpGuDwpdPB9NSv_2SWK-2ypIM' 
});

const storage = new CloudinaryStorage({
  cloudinary,
  allowedFormats: ['jpg', 'png', 'jpeg'],
  params: {
    folder: 'EasyJob',
    resource_type: 'auto'
  }
});

const uploadCloud = multer({ storage });

export default uploadCloud;