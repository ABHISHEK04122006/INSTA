import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import cloudinary from '../config/cloudinary.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadsDir = path.join(__dirname, '..', 'uploads');

const isCloudinaryConfigured = () => {
  const { cloud_name, api_key, api_secret } = cloudinary.config();
  return cloud_name && api_key && api_secret && cloud_name !== 'demo';
};

const ensureUploadsDir = (folder) => {
  const dir = path.join(uploadsDir, folder);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
};

const getExtension = (resourceType, mimetype = '') => {
  const extensions = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'video/mp4': '.mp4',
    'video/webm': '.webm',
  };

  return extensions[mimetype] || (resourceType === 'video' ? '.mp4' : '.jpg');
};

export const uploadToCloudinary = async (buffer, folder, resourceType = 'image', mimetype = '') => {
  if (!isCloudinaryConfigured()) {
    const dir = ensureUploadsDir(folder);
    const ext = getExtension(resourceType, mimetype);
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const filepath = path.join(dir, filename);
    fs.writeFileSync(filepath, buffer);
    return { secure_url: `/uploads/${folder}/${filename}` };
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: `insta/${folder}`, resource_type: resourceType },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(buffer);
  });
};
