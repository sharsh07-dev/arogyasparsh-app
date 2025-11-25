const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// ⚠️ PASTE YOUR KEYS HERE
cloudinary.config({
  cloud_name: 'do0rlgy7c', 
  api_key: '991835597372967',
  api_secret: 'ftF97djxd4c8chRN4Xwzkl9up0M'
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'arogyasparsh_proofs', // Folder name in your cloud
    allowed_formats: ['jpg', 'png', 'jpeg', 'pdf'],
  },
});

module.exports = { cloudinary, storage };