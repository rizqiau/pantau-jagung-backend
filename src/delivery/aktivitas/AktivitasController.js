import { AktivitasUseCase } from "../../usecase/aktivitas/AktivitasUseCase.js";
export class AktivitasController {
    static async create(req, res) {
        try {
            const hasilAktivitas = await AktivitasUseCase.inputAktivitasHarian(req.body);
            res.status(201).json({
                success: true,
                message: "Aktivitas harian berhasil dicatat, biaya terkalkulasi, dan progress blok diperbarui",
                data: hasilAktivitas,
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                error: error.message,
            });
        }
    }
    static async getAll(req, res) {
        try {
            const listAktivitas = await AktivitasUseCase.getAllAktivitas();
            res.status(200).json({
                success: true,
                data: listAktivitas,
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
//# sourceMappingURL=AktivitasController.js.map