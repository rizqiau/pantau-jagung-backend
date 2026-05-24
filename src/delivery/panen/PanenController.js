import { PanenUseCase } from "../../usecase/panen/PanenUseCase.js";
export class PanenController {
    // 1. Mandor input laporan panen harian
    static async create(req, res) {
        try {
            const { siklusId, mandorId, tanggalPanen, beratHasil, hargaJualPerKg, kualitas, } = req.body;
            if (!siklusId || !mandorId || !tanggalPanen || beratHasil === undefined || hargaJualPerKg === undefined || !kualitas) {
                throw new Error("Field siklusId, mandorId, tanggalPanen, beratHasil, hargaJualPerKg, dan kualitas wajib diisi");
            }
            const hasilPanen = await PanenUseCase.inputPanen(req.body);
            res.status(201).json({
                success: true,
                message: "Laporan panen berhasil dicatat, total pendapatan kotor dihitung, dan status siklus tanam diset ke PANEN",
                data: hasilPanen,
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                error: error.message,
            });
        }
    }
    // 2. Mengambil semua daftar panen (Audit trail finansial & operasional)
    static async getAll(req, res) {
        try {
            const listPanen = await PanenUseCase.getAllPanen();
            res.status(200).json({
                success: true,
                data: listPanen,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
    // 3. Mengambil daftar panen berdasarkan Siklus Tanam
    static async getBySiklus(req, res) {
        try {
            const siklusId = req.params.siklusId;
            if (!siklusId)
                throw new Error("ID Siklus wajib disertakan");
            const listPanen = await PanenUseCase.getPanenBySiklus(siklusId);
            res.status(200).json({
                success: true,
                data: listPanen,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
    // 4. Asisten Lapangan Approve/Reject Laporan Panen
    static async updateStatus(req, res) {
        try {
            const id = req.params.id;
            const { asistenId, status } = req.body; // status: "APPROVED" atau "REJECTED"
            if (!id)
                throw new Error("ID Laporan Panen wajib disertakan");
            if (!asistenId || !status) {
                throw new Error("asistenId dan status wajib disertakan");
            }
            if (status !== "APPROVED" && status !== "REJECTED") {
                throw new Error("Status verifikasi harus APPROVED atau REJECTED");
            }
            const hasilVerifikasi = await PanenUseCase.verifikasiPanen(id, asistenId, status);
            res.status(200).json({
                success: true,
                message: `Laporan panen berhasil diverifikasi dengan status ${status}`,
                data: hasilVerifikasi,
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                error: error.message,
            });
        }
    }
}
//# sourceMappingURL=PanenController.js.map