import { LahanUseCase } from "../../usecase/lahan/LahanUseCase.js";
export class LahanController {
    // Create Lahan
    static async create(req, res) {
        try {
            const operatorId = req.headers["x-user-id"] || req.body.operatorId || null;
            const lahanBaru = await LahanUseCase.createLahanBerjenjang({
                ...req.body,
                operatorId,
            });
            res.status(201).json({ success: true, data: lahanBaru });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
    // Get All Lahan
    static async getAll(req, res) {
        try {
            const listLahan = await LahanUseCase.getAllLahan();
            res.status(200).json({ success: true, data: listLahan });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
    // Get Lahan By ID (Detail Lengkap)
    static async getById(req, res) {
        try {
            const id = req.params.id;
            if (!id)
                throw new Error("ID Lahan wajib disertakan");
            const detailLahan = await LahanUseCase.getLahanById(id);
            if (!detailLahan) {
                res
                    .status(404)
                    .json({ success: false, message: "Lahan tidak ditemukan" });
                return;
            }
            res.status(200).json({ success: true, data: detailLahan });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
    // Update Lahan
    static async update(req, res) {
        try {
            const id = req.params.id;
            if (!id)
                throw new Error("ID Lahan wajib disertakan");
            const operatorId = req.headers["x-user-id"] || req.body.operatorId || null;
            const lahanDiupdate = await LahanUseCase.updateLahan(id, {
                ...req.body,
                operatorId,
            });
            res.status(200).json({
                success: true,
                message: "Informasi lahan berhasil diperbarui",
                data: lahanDiupdate,
            });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
    // Delete Lahan
    static async delete(req, res) {
        try {
            const id = req.params.id;
            if (!id)
                throw new Error("ID Lahan wajib disertakan");
            const operatorId = req.headers["x-user-id"] || null;
            await LahanUseCase.deleteLahan(id, operatorId);
            res.status(200).json({
                success: true,
                message: "Lahan dan seluruh data jadwal di dalamnya berhasil dihapus permanen",
            });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
    // Reschedule Jadwal
    static async reschedule(req, res) {
        try {
            const id = req.params.id;
            const { tanggalBaru } = req.body;
            if (!id)
                throw new Error("ID Jadwal wajib disertakan");
            if (!tanggalBaru)
                throw new Error("Format tanggalBaru wajib disertakan dalam body");
            const operatorId = req.headers["x-user-id"] || req.body.operatorId || null;
            const hasilReschedule = await LahanUseCase.rescheduleJadwal(id, tanggalBaru, operatorId);
            res.status(200).json({
                success: true,
                data: hasilReschedule,
            });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}
//# sourceMappingURL=LahanController.js.map