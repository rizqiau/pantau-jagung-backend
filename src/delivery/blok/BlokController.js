import { BlokUseCase } from "../../usecase/blok/BlokUseCase.js";
export class BlokController {
    static async getProgressByLahan(req, res) {
        try {
            const lahanId = req.params.lahanId;
            if (!lahanId)
                throw new Error("ID Lahan wajib disertakan");
            const dataProgress = await BlokUseCase.getBlokProgressByLahan(lahanId);
            res.status(200).json({
                success: true,
                message: "Data progress blok berhasil dikalkulasi",
                data: dataProgress,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
    static async getRiwayatJadwal(req, res) {
        try {
            // Gunakan 'as string' untuk menghindari error type casting di TypeScript strict mode
            const jadwalId = req.params.jadwalId;
            if (!jadwalId)
                throw new Error("ID Jadwal kegiatan wajib disertakan");
            const riwayatPekerjaan = await BlokUseCase.getRiwayatPekerjaanByJadwal(jadwalId);
            res.status(200).json({
                success: true,
                message: "Riwayat pekerjaan per hari berhasil diambil",
                data: riwayatPekerjaan,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message,
            });
        }
    }
}
//# sourceMappingURL=BlokController.js.map