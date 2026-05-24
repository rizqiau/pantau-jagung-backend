// File: src/delivery/MaterialController.ts
import { Request, Response } from "express";
import { MaterialUseCase } from "../../usecase/material/MaterialUseCase.js";

export class MaterialController {
  static async create(req: Request, res: Response) {
    try {
      const operatorId = (req.headers["x-user-id"] as string) || req.body.operatorId || null;
      const materialBaru = await MaterialUseCase.createMaterial({ ...req.body, operatorId });
      res.status(201).json({
        success: true,
        message: "Material berhasil ditambahkan",
        data: materialBaru,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const kategori = req.query.kategori as string | undefined;
      const listMaterial = await MaterialUseCase.getAllMaterials(kategori);
      res.status(200).json({ success: true, data: listMaterial });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!id) throw new Error("ID Material wajib disertakan");

      const operatorId = (req.headers["x-user-id"] as string) || req.body.operatorId || null;
      const materialDiupdate = await MaterialUseCase.updateMaterial(
        id,
        { ...req.body, operatorId },
      );
      res.status(200).json({
        success: true,
        message: "Material berhasil diperbarui",
        data: materialDiupdate,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!id) throw new Error("ID Material wajib disertakan");

      const operatorId = (req.headers["x-user-id"] as string) || null;
      await MaterialUseCase.deleteMaterial(id, operatorId);
      res
        .status(200)
        .json({ success: true, message: "Material berhasil dihapus" });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // 5. Restock Material
  static async restock(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { jumlahRestock } = req.body;

      if (!id) throw new Error("ID Material wajib disertakan");
      if (jumlahRestock === undefined) throw new Error("jumlahRestock wajib disertakan dalam body");

      const operatorId = (req.headers["x-user-id"] as string) || req.body.operatorId || null;
      const materialRestocked = await MaterialUseCase.restockMaterial(id, {
        jumlahRestock: Number(jumlahRestock),
        operatorId,
      });

      res.status(200).json({
        success: true,
        message: "Stok material berhasil diperbarui (Restock)",
        data: materialRestocked,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}
