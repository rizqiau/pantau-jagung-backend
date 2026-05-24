import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';
dotenv.config();
// Konfigurasi Cloudinary menggunakan environment variables
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
/**
 * Fungsi untuk mengunggah string Base64 ke Cloudinary
 * @param base64String Data gambar dari Android
 * @param folderName Nama folder di Cloudinary (opsional)
 * @returns URL gambar publik (secure_url)
 */
export const uploadImageBase64 = async (base64String, folderName = 'pantau-jagung') => {
    try {
        // Cloudinary membutuhkan prefix MIME-type. 
        // Kita tambahkan otomatis jika dari Android Android belum mengirimkannya.
        const base64Data = base64String.startsWith('data:image')
            ? base64String
            : `data:image/jpeg;base64,${base64String}`;
        const result = await cloudinary.uploader.upload(base64Data, {
            folder: folderName,
            resource_type: 'image',
        });
        // Kembalikan URL gambar yang sudah di-hosting
        return result.secure_url;
    }
    catch (error) {
        console.error("Error Cloudinary:", error);
        throw new Error('Gagal mengunggah gambar ke server');
    }
};
//# sourceMappingURL=cloudinary.js.map