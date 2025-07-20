const cloudinary = require('../config/cloudinary');
const streamifier = require('streamifier');

async function uploadToCloudinary(buffer, userId, folder = 'avatars') {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: 'image',
                public_id: userId ? `user_${userId}` : undefined,
                overwrite: true
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
            }
        );
        streamifier.createReadStream(buffer).pipe(uploadStream);
    });
}

module.exports = uploadToCloudinary;