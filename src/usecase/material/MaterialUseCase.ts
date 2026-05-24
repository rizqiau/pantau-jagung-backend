// File: src/usecase/MaterialUseCase.ts
import { prisma } from "../../infrastructure/prisma.js";
import { AuditLogUseCase } from "../audit/AuditLogUseCase.js";

export class MaterialUseCase {
  // 1. Tambah Material Baru
  static async createMaterial(payload: any) {
    const { namaMaterial, kategori, satuan, hargaSatuan, stok } = payload;
    return await prisma.$transaction(async (tx) => {
      const material = await tx.katalogMaterial.create({
        data: {
          namaMaterial,
          kategori,
          satuan,
          hargaSatuan,
          stok: stok || 0,
        },
      });

      await AuditLogUseCase.record(tx, {
        userId: payload.operatorId || null,
        action: "CREATE",
        tableName: "KatalogMaterial",
        recordId: material.id,
        details: `Menambahkan material baru "${material.namaMaterial}" ke katalog (Kategori: ${material.kategori}, Stok: ${material.stok} ${material.satuan}, Harga: Rp ${material.hargaSatuan}).`,
      });

      return material;
    });
  }

  // 2. Ambil Semua Material (Untuk Dropdown di Aplikasi Android)
  static async getAllMaterials() {
    return await prisma.katalogMaterial.findMany({
      orderBy: { namaMaterial: "asc" },
    });
  }

  // 3. Update Material (Misal harga pupuk naik)
  static async updateMaterial(id: string, payload: any) {
    const { namaMaterial, kategori, satuan, hargaSatuan, operatorId } = payload;
    return await prisma.$transaction(async (tx) => {
      const materialDiupdate = await tx.katalogMaterial.update({
        where: { id },
        data: {
          namaMaterial,
          kategori,
          satuan,
          hargaSatuan,
        },
      });

      await AuditLogUseCase.record(tx, {
        userId: operatorId || null,
        action: "UPDATE",
        tableName: "KatalogMaterial",
        recordId: id,
        details: `Memperbarui data katalog material "${materialDiupdate.namaMaterial}" (Harga: Rp ${materialDiupdate.hargaSatuan}).`,
      });

      return materialDiupdate;
    });
  }

  // 4. Hapus Material
  static async deleteMaterial(id: string, operatorId?: string | null) {
    return await prisma.$transaction(async (tx) => {
      const material = await tx.katalogMaterial.findUnique({ where: { id } });
      if (!material) throw new Error("Material tidak ditemukan");

      await AuditLogUseCase.record(tx, {
        userId: operatorId || null,
        action: "DELETE",
        tableName: "KatalogMaterial",
        recordId: id,
        details: `Menghapus material "${material.namaMaterial}" dari katalog secara permanen.`,
      });

      return await tx.katalogMaterial.delete({
        where: { id },
      });
    });
  }

  // 5. Restock Material (Menambah Stok di Gudang Pusat)
  static async restockMaterial(id: string, payload: any) {
    const { jumlahRestock, operatorId } = payload;

    if (jumlahRestock === undefined || jumlahRestock <= 0) {
      throw new Error("Jumlah restock wajib diisi dan harus lebih besar dari 0");
    }

    return await prisma.$transaction(async (tx) => {
      const material = await tx.katalogMaterial.findUnique({ where: { id } });
      if (!material) throw new Error("Material tidak ditemukan");

      const materialDiupdate = await tx.katalogMaterial.update({
        where: { id },
        data: {
          stok: { increment: jumlahRestock },
        },
      });

      await AuditLogUseCase.record(tx, {
        userId: operatorId || null,
        action: "UPDATE",
        tableName: "KatalogMaterial",
        recordId: id,
        details: `Melakukan restock material "${material.namaMaterial}" sebanyak ${jumlahRestock} ${material.satuan}. Stok lama: ${material.stok}, Stok baru: ${materialDiupdate.stok}.`,
      });

      return materialDiupdate;
    });
  }
}
