// File: src/usecase/PanenUseCase.ts
import { prisma } from "../../infrastructure/prisma.js";
import { AuditLogUseCase } from "../audit/AuditLogUseCase.js";

export class PanenUseCase {
  // 1. Mandor Menginput Laporan Panen Baru
  static async inputPanen(payload: any) {
    const {
      id, // UUID opsional dari Android
      siklusId,
      mandorId,
      tanggalPanen,
      beratHasil,
      hargaJualPerKg,
      kualitas,
      catatan,
    } = payload;

    if (id) {
      const existing = await prisma.panen.findUnique({
        where: { id },
        include: {
          mandor: { select: { nama: true } },
          siklus: {
            include: {
              blok: { select: { namaBlok: true } },
            },
          },
        },
      });
      if (existing) {
        // Catat audit log khusus untuk retry sinkronisasi offline
        await prisma.auditLog.create({
          data: {
            userId: mandorId || null,
            action: "CREATE",
            tableName: "Panen",
            recordId: id,
            details: `SYNC_RETRY: Menerima sinkronisasi ulang duplikat dari Android untuk laporan panen ID ${id}.`,
          },
        });
        console.log(`[Idempotency]: Menemukan laporan panen duplikat dengan ID ${id}. Mengembalikan data yang sudah ada.`);
        return existing;
      }
    }

    // A. Validasi keberadaan Siklus Tanam
    const siklus = await prisma.siklusTanam.findUnique({
      where: { id: siklusId },
    });
    if (!siklus) throw new Error("Siklus tanam tidak ditemukan");

    // B. Validasi Mandor
    const mandor = await prisma.user.findUnique({
      where: { id: mandorId },
    });
    if (!mandor) throw new Error("Mandor tidak ditemukan");
    if (mandor.role !== "MANDOR") {
      throw new Error("Hanya pengguna dengan role MANDOR yang dapat menginput laporan panen");
    }

    // C. Server-side calculation untuk total pendapatan
    const totalPendapatan = beratHasil * hargaJualPerKg;

    // D. Simpan data secara atomik dan ubah status siklus menjadi PANEN
    return await prisma.$transaction(async (tx) => {
      const panenBaru = await tx.panen.create({
        data: {
          id: id || undefined,
          siklusId,
          mandorId,
          tanggalPanen: new Date(tanggalPanen),
          beratHasil,
          hargaJualPerKg,
          totalPendapatan,
          kualitas,
          catatan,
          statusVerifikasi: "PENDING", // Default awal masuk
        },
        include: {
          mandor: { select: { nama: true } },
          siklus: {
            include: {
              blok: { select: { namaBlok: true } },
            },
          },
        },
      });

      // Update status siklus tanam secara otomatis menjadi PANEN
      await tx.siklusTanam.update({
        where: { id: siklusId },
        data: { status: "PANEN" },
      });

      await AuditLogUseCase.record(tx, {
        userId: mandorId,
        action: "CREATE",
        tableName: "Panen",
        recordId: panenBaru.id,
        details: `Mandor menginput laporan hasil panen (Berat: ${beratHasil} kg, Harga: Rp ${hargaJualPerKg}/kg, Pendapatan Kotor: Rp ${totalPendapatan}).`,
      });

      return panenBaru;
    });
  }

  // 2. Mengambil Semua Daftar Panen (Untuk Audit Riwayat Keuangan)
  static async getAllPanen() {
    return await prisma.panen.findMany({
      orderBy: { tanggalPanen: "desc" },
      include: {
        mandor: { select: { nama: true } },
        asistenPemeriksa: { select: { nama: true } },
        siklus: {
          include: {
            blok: {
              select: {
                namaBlok: true,
                lahan: { select: { namaLahan: true } },
              },
            },
          },
        },
      },
    });
  }

  // 3. Mengambil Daftar Panen Berdasarkan Siklus Tanam
  static async getPanenBySiklus(siklusId: string) {
    return await prisma.panen.findMany({
      where: { siklusId },
      orderBy: { tanggalPanen: "desc" },
      include: {
        mandor: { select: { nama: true } },
        asistenPemeriksa: { select: { nama: true } },
      },
    });
  }

  // 4. Asisten Lapangan Melakukan Verifikasi Laporan Panen (APPROVE / REJECT)
  static async verifikasiPanen(
    id: string,
    asistenId: string,
    status: "APPROVED" | "REJECTED",
  ) {
    // A. Validasi keberadaan Laporan Panen
    const panen = await prisma.panen.findUnique({
      where: { id },
      include: { siklus: true },
    });
    if (!panen) throw new Error("Laporan panen tidak ditemukan");

    // B. Validasi Pemeriksa (Asisten Lapangan)
    const asisten = await prisma.user.findUnique({
      where: { id: asistenId },
    });
    if (!asisten) throw new Error("Asisten Lapangan tidak ditemukan");
    if (asisten.role !== "ASISTEN_LAPANGAN") {
      throw new Error("Hanya Asisten Lapangan yang dapat memverifikasi laporan panen");
    }

    // C. Atomic Transaction: Update status verifikasi panen dan status siklus tanam
    return await prisma.$transaction(async (tx) => {
      const panenUpdated = await tx.panen.update({
        where: { id },
        data: {
          statusVerifikasi: status,
          diperiksaOleh: asistenId,
        },
        include: {
          mandor: { select: { nama: true } },
          asistenPemeriksa: { select: { nama: true } },
        },
      });

      // Jika APPROVED, tandai Siklus Tanam sebagai SELESAI
      if (status === "APPROVED") {
        await tx.siklusTanam.update({
          where: { id: panen.siklusId },
          data: { status: "SELESAI" },
        });
      }

      await AuditLogUseCase.record(tx, {
        userId: asistenId,
        action: "UPDATE",
        tableName: "Panen",
        recordId: id,
        details: `Asisten Lapangan memverifikasi laporan panen dengan status: ${status}.`,
      });

      return panenUpdated;
    });
  }
}
