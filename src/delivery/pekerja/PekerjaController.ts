import { Request, Response } from "express";
import { PekerjaUseCase } from "../../usecase/pekerja/PekerjaUseCase.js";

export class PekerjaController {
  static async registerUser(req: Request, res: Response) {
    try {
      const operatorId = (req.headers["x-user-id"] as string) || req.body.operatorId || null;
      const user = await PekerjaUseCase.registerUser({ ...req.body, operatorId });
      res.status(201).json({
        success: true,
        message: "User berhasil didaftarkan",
        data: user,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  static async getAllUsers(req: Request, res: Response) {
    try {
      const listUsers = await PekerjaUseCase.getAllUsers();
      res.status(200).json({
        success: true,
        data: listUsers,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Get User By ID
  static async getUserById(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!id) throw new Error("ID User wajib disertakan");

      const user = await PekerjaUseCase.getUserById(id);
      if (!user) {
        res
          .status(404)
          .json({ success: false, message: "User tidak ditemukan" });
        return;
      }

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Update User
  static async updateUser(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!id) throw new Error("ID User wajib disertakan");

      const operatorId = (req.headers["x-user-id"] as string) || req.body.operatorId || null;
      const userDiupdate = await PekerjaUseCase.updateUser(id, { ...req.body, operatorId });
      res.status(200).json({
        success: true,
        message: "Data user berhasil diperbarui",
        data: userDiupdate,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Delete User
  static async deleteUser(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!id) throw new Error("ID User wajib disertakan");

      const operatorId = (req.headers["x-user-id"] as string) || null;
      await PekerjaUseCase.deleteUser(id, operatorId);
      res.status(200).json({
        success: true,
        message: "User berhasil dihapus dari sistem pertanian",
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Fungsi baru untuk menambahkan pekerja harian

  static async addPekerjaHarian(req: Request, res: Response) {
    try {
      const operatorId = (req.headers["x-user-id"] as string) || req.body.operatorId || null;
      const pekerja = await PekerjaUseCase.addPekerjaHarian({ ...req.body, operatorId });
      res.status(201).json({
        success: true,
        message: "Pekerja harian berhasil ditambahkan ke Master Data",
        data: pekerja,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Fungsi baru untuk mengambil semua pekerja
  static async getAllPekerja(req: Request, res: Response) {
    try {
      const listPekerja = await PekerjaUseCase.getAllPekerjaHarian();
      res.status(200).json({ success: true, data: listPekerja });
    } catch (error: any) {
      res.status(500).json({ success: false, error: error.message });
    }
  }

  // Update Pekerja Harian
  static async updatePekerjaHarian(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!id) throw new Error("ID Pekerja wajib disertakan");

      const operatorId = (req.headers["x-user-id"] as string) || req.body.operatorId || null;
      const pekerjaDiupdate = await PekerjaUseCase.updatePekerjaHarian(
        id,
        { ...req.body, operatorId },
      );
      res.status(200).json({
        success: true,
        message: "Data pekerja harian berhasil diperbarui",
        data: pekerjaDiupdate,
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }

  // Delete Pekerja Harian
  static async deletePekerjaHarian(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      if (!id) throw new Error("ID Pekerja wajib disertakan");

      const operatorId = (req.headers["x-user-id"] as string) || null;
      await PekerjaUseCase.deletePekerjaHarian(id, operatorId);
      res.status(200).json({
        success: true,
        message: "Pekerja harian berhasil dihapus dari master data",
      });
    } catch (error: any) {
      res.status(400).json({ success: false, error: error.message });
    }
  }
}
