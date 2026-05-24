import { VerifikasiUseCase } from "../../usecase/verifikasi/VerifikasiUseCase.js";
export class VerifikasiController {
    // Create Laporan Verifikasi QC
    static async create(req, res) {
        try {
            const laporanBaru = await VerifikasiUseCase.createVerifikasi(req.body);
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