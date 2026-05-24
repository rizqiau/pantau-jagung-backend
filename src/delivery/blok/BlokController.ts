import { Request, Response } from "express";
import { BlokUseCase } from "../../usecase/blok/BlokUseCase.js";

export class BlokController {
  static async getProgressByLahan(req: Request, res: Response) {
    try {
      const lahanId = req.params.lahanId as string;
      if (!lahanId) throw new Error("ID Lahan wajib disertakan");

      const dataProgress = await BlokUseCase.getBlokProgressByLahan(lahanId);

      res.status(200).json({
        success: true,
        message: "Data progress blok berhasil dikalkulasi",
        data: dataProgress,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async getRiwayatJadwal(req: Request, res: Response) {
    try {
      // Gunakan 'as string' untuk menghindari error type casting di TypeScript strict mode
      const jadwalId = req.params.jadwalId as string;

      if (!jadwalId) throw new Error("ID Jadwal kegiatan wajib disertakan");

      const riwayatPekerjaan =
        await BlokUseCase.getRiwayatPekerjaanByJadwal(jadwalId);

      res.status(200).json({
        success: true,
        message: "Riwayat pekerjaan per hari berhasil diambil",
        data: riwayatPekerjaan,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}
