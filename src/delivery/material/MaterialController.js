import { MaterialUseCase } from "../../usecase/material/MaterialUseCase.js";
export class MaterialController {
    static async create(req, res) {
        try {
            const operatorId = req.headers["x-user-id"] || req.body.operatorId || null;
            const materialBaru = await MaterialUseCase.createMaterial({ ...req.body, operatorId });
            res.status(201).json({
                success: true,
                message: "Material berhasil ditambahkan",
                data: materialBaru,
            });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    static async getAll(req, res) {
        try {
            const listMaterial = await MaterialUseCase.getAllMaterials();
            res.status(200).json({ success: true, data: listMaterial });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
    static async update(req, res) {
        try {
            const id = req.params.id;
            if (!id)
                throw new Error("ID Material wajib disertakan");
            const operatorId = req.headers["x-user-id"] || req.body.operatorId || null;
            const materialDiupdate = await MaterialUseCase.updateMaterial(id, { ...req.body, operatorId });
            res.status(200).json({
                success: true,
                message: "Material berhasil diperbarui",
                data: materialDiupdate,
            });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    static async delete(req, res) {
        try {
            const id = req.params.id;
            if (!id)
                throw new Error("ID Material wajib disertakan");
            const operatorId = req.headers["x-user-id"] || null;
            await MaterialUseCase.deleteMaterial(id, operatorId);
            res
                .status(200)
                .json({ success: true, message: "Material berhasil dihapus" });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    // 5. Restock Material
    static async restock(req, res) {
        try {
            const id = req.params.id;
            const { jumlahRestock } = req.body;
            if (!id)
                throw new Error("ID Material wajib disertakan");
            if (jumlahRestock === undefined)
                throw new Error("jumlahRestock wajib disertakan dalam body");
            const operatorId = req.headers["x-user-id"] || req.body.operatorId || null;
            const materialRestocked = await MaterialUseCase.restockMaterial(id, {
                jumlahRestock: Number(jumlahRestock),
                operatorId,
            });
            res.status(200).json({
                success: true,
                message: "Stok material berhasil diperbarui (Restock)",
                data: materialRestocked,
            });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
}
//# sourceMappingURL=MaterialController.js.map