import { VerifikasiUseCase } from "../../usecase/verifikasi/VerifikasiUseCase.js";
import { uploadImageBase64 } from "../../infrastructure/cloudinary.js";
export class VerifikasiController {
    // Create Laporan Verifikasi QC
    static async create(req, res) {
        try {
            // Kita tampung body request ke variabel payload
            const payload = req.body;
            // 2. Ambil list hasil kerja dari payload
            const items = payload.hasilKerjaPekerja || payload.listHasilKerja || [];
            // 3. Unggah semua foto Base64 ke Cloudinary secara paralel (bersamaan)
            const updatedItems = await Promise.all(items.map(async (item) => {
                // Cek apakah item punya fotoBukti, dan apakah itu Base64 
                // (Kita asumsikan string Base64 pasti panjangnya > 500 karakter. 
                // Jika URL biasa dari Cloudinary, panjangnya hanya sekitar 80-100 karakter).
                if (item.fotoBukti && item.fotoBukti.length > 500) {
                    try {
                        // Unggah ke folder 'laporan-qc' di Cloudinary
                        const secureUrl = await uploadImageBase64(item.fotoBukti, 'laporan-qc');
                        // Timpa data teks Base64 yang panjang dengan URL pendek yang bersih
                        item.fotoBukti = secureUrl;
                    }
                    catch (err) {
                        console.error("Gagal mengunggah foto untuk pekerja:", item.pekerjaId, err);
                        // Lemparkan error jika foto gagal diunggah
                        throw new Error("Gagal mengunggah foto bukti ke Cloudinary");
                    }
                }
                return item;
            }));
            // 4. Timpa array lama di payload dengan array baru yang sudah berisi URL gambar
            if (payload.hasilKerjaPekerja)
                payload.hasilKerjaPekerja = updatedItems;
            if (payload.listHasilKerja)
                payload.listHasilKerja = updatedItems;
            // 5. Teruskan payload yang sudah bersih (berisi URL) ke Database melalui UseCase
            const laporanBaru = await VerifikasiUseCase.createVerifikasi(payload);
            res.status(201).json({
                success: true,
                message: "Laporan verifikasi berhasil dikirim ke Asisten Lapangan",
                data: laporanBaru,
            });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    // Get List Laporan Berdasarkan Blok ID
    static async getByBlok(req, res) {
        try {
            const blokId = req.params.blokId;
            if (!blokId)
                throw new Error("ID Blok wajib disertakan");
            const listLaporan = await VerifikasiUseCase.getVerifikasiByBlok(blokId);
            res.status(200).json({ success: true, data: listLaporan });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
    // Get List Laporan yang masih PENDING (Untuk Inbox Asisten Lapangan)
    static async getPending(req, res) {
        try {
            const listLaporan = await VerifikasiUseCase.getVerifikasiPending();
            res.status(200).json({ success: true, data: listLaporan });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
    // Action Status Laporan (Approve / Reject) dari Asisten Lapangan
    static async updateStatus(req, res) {
        try {
            const id = req.params.id;
            const { asistenId, status } = req.body; // status: "APPROVED" atau "REJECTED"
            if (!id)
                throw new Error("ID Verifikasi wajib disertakan");
            if (!asistenId || !status)
                throw new Error("asistenId dan status wajib disertakan");
            if (status !== "APPROVED" && status !== "REJECTED")
                throw new Error("Status harus APPROVED atau REJECTED");
            const hasilReview = await VerifikasiUseCase.batasiAtauVerifikasiLaporan(id, asistenId, status);
            res.status(200).json({
                success: true,
                message: `Laporan berhasil di-${status.toLowerCase()}`,
                data: hasilReview,
            });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
}
//# sourceMappingURL=VerifikasiController.js.map