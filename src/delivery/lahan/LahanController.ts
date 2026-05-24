import { Request, Response } from "express";
import { LahanUseCase } from "../../usecase/lahan/LahanUseCase.js";

export class LahanController {
  // Create Lahan
  static async create(req: Request, res: Response) {
    try {
      const operatorId = (req.headers["x-user-id"] as string) || req.body.operatorId || null;
      const lahanBaru = await LahanUseCase.createLahanBerjenjang({
        ...req.body,
        operatorId,
      });
      res.status(201).json({ success: true, data: lahanBaru });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Get All Lahan
  static async getAll(req: Request, res: Response) {
    try {
      const listLahan = await LahanUseCase.getAllLahan();
      res.status(200).json({ success: true, data: listLahan });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Get Lahan By ID (Detail Lengkap)
  static async getById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      if (!id) throw new Error("ID Lahan wajib disertakan");

      const detailLahan = await LahanUseCase.getLahanById(id);
      if (!detailLahan) {
        res
          .status(404)
          .json({ success: false, message: "Lahan tidak ditemukan" });
        return;
      }

      res.status(200).json({ success: true, data: detailLahan });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Update Lahan
  static async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      if (!id) throw new Error("ID Lahan wajib disertakan");

      const operatorId = (req.headers["x-user-id"] as string) || req.body.operatorId || null;
      const lahanDiupdate = await LahanUseCase.updateLahan(id, {
        ...req.body,
        operatorId,
      });
      res.status(200).json({
        success: true,
        message: "Informasi lahan berhasil diperbarui",
        data: lahanDiupdate,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Delete Lahan
  static async delete(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      if (!id) throw new Error("ID Lahan wajib disertakan");

      const operatorId = (req.headers["x-user-id"] as string) || null;
      await LahanUseCase.deleteLahan(id, operatorId);
      res.status(200).json({
        success: true,
        message:
          "Lahan dan seluruh data jadwal di dalamnya berhasil dihapus permanen",
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Reschedule Jadwal
  static async reschedule(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { tanggalBaru } = req.body;

      if (!id) throw new Error("ID Jadwal wajib disertakan");
      if (!tanggalBaru)
        throw new Error("Format tanggalBaru wajib disertakan dalam body");

      const operatorId = (req.headers["x-user-id"] as string) || req.body.operatorId || null;
      const hasilReschedule = await LahanUseCase.rescheduleJadwal(
        id,
        tanggalBaru,
        operatorId,
      );

      res.status(200).json({
        success: true,
        data: hasilReschedule,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }
}
