// File: src/delivery/VerifikasiController.ts
import { Request, Response } from "express";
import { VerifikasiUseCase } from "../../usecase/verifikasi/VerifikasiUseCase.js";

export class VerifikasiController {
  // Create Laporan Verifikasi QC
  static async create(req: Request, res: Response) {
    try {
      const laporanBaru = await VerifikasiUseCase.createVerifikasi(req.body);
      res.status(201).json({
        success: true,
        message: "Laporan verifikasi berhasil dikirim ke Asisten Lapangan",
        data: laporanBaru,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Get List Laporan Berdasarkan Blok ID
  static async getByBlok(req: Request, res: Response) {
    try {
      const blokId = req.params.blokId as string;
      if (!blokId) throw new Error("ID Blok wajib disertakan");

      const listLaporan = await VerifikasiUseCase.getVerifikasiByBlok(blokId);
      res.status(200).json({ success: true, data: listLaporan });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Get List Laporan yang masih PENDING (Untuk Inbox Asisten Lapangan)
  static async getPending(req: Request, res: Response) {
    try {
      const listLaporan = await VerifikasiUseCase.getVerifikasiPending();
      res.status(200).json({ success: true, data: listLaporan });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Action Status Laporan (Approve / Reject) dari Asisten Lapangan
  static async updateStatus(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { asistenId, status } = req.body; // status: "APPROVED" atau "REJECTED"

      if (!id) throw new Error("ID Verifikasi wajib disertakan");
      if (!asistenId || !status)
        throw new Error("asistenId dan status wajib disertakan");
      if (status !== "APPROVED" && status !== "REJECTED")
        throw new Error("Status harus APPROVED atau REJECTED");

      const hasilReview = await VerifikasiUseCase.batasiAtauVerifikasiLaporan(
        id,
        asistenId,
        status,
      );
      res.status(200).json({
        success: true,
        message: `Laporan berhasil di-${status.toLowerCase()}`,
        data: hasilReview,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}
