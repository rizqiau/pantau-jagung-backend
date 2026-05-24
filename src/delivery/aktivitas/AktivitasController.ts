// File: src/delivery/AktivitasController.ts
import { Request, Response } from "express";
import { AktivitasUseCase } from "../../usecase/aktivitas/AktivitasUseCase.js";

export class AktivitasController {
  static async create(req: Request, res: Response) {
    try {
      const hasilAktivitas = await AktivitasUseCase.inputAktivitasHarian(
        req.body,
      );

      res.status(201).json({
        success: true,
        message:
          "Aktivitas harian berhasil dicatat, biaya terkalkulasi, dan progress blok diperbarui",
        data: hasilAktivitas,
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const listAktivitas = await AktivitasUseCase.getAllAktivitas();

      res.status(200).json({
        success: true,
        data: listAktivitas,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message,
      });
    }
  }
}
