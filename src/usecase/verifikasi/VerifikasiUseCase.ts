// File: src/usecase/verifikasi/VerifikasiUseCase.ts
import { prisma } from "../../infrastructure/prisma.js";
import { AuditLogUseCase } from "../audit/AuditLogUseCase.js";

export class VerifikasiUseCase {
  // 1. Mandor Menginput Laporan Verifikasi Baru (Quality Control + Foto)
  static async createVerifikasi(payload: any) {
    const { id, blokId, jadwalId, mandorId, tanggal, catatan, listHasilKerja, hasilKerjaPekerja } =
      payload;
    const items = hasilKerjaPekerja || listHasilKerja || [];

    if (id) {
      const existing = await prisma.verifikasiMandor.findUnique({
        where: { id },
        include: {
          hasilKerjaPekerja: {
            include: {
              pekerja: { select: { nama: true } },
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
            tableName: "VerifikasiMandor",
            recordId: id,
            details: `SYNC_RETRY: Menerima sinkronisasi ulang duplikat dari Android untuk laporan verifikasi ID ${id}.`,
          },
        });
        console.log(`[Idempotency]: Menemukan laporan verifikasi duplikat dengan ID ${id}. Mengembalikan data yang sudah ada.`);
        return existing;
      }
    }

    // Validasi dasar kesiapan data master
    const blokExists = await prisma.blok.findUnique({ where: { id: blokId } });
    if (!blokExists) throw new Error("Blok tidak ditemukan");

    const jadwalExists = await prisma.jadwalPerawatan.findUnique({
      where: { id: jadwalId },
    });
    if (!jadwalExists) throw new Error("Jadwal kegiatan tidak ditemukan");

    // Simpan data Verifikasi (Header) beserta Hasil Kerja Pekerja (Detail) secara atomik
    return await prisma.$transaction(async (tx) => {
      const laporanBaru = await tx.verifikasiMandor.create({
        data: {
          id: id || undefined,
          blokId,
          jadwalId,
          mandorId,
          tanggal: new Date(tanggal),
          catatan,
          statusVerifikasi: "PENDING", // Default awal laporan masuk
          hasilKerjaPekerja: {
            create: items.map((item: any) => ({
              pekerjaId: item.pekerjaId,
              luasDikerjakan: item.luasDikerjakan,
              fotoBukti: item.fotoBukti, // URL dari Cloud Storage / Local Upload
            })),
          },
        },
        include: {
          hasilKerjaPekerja: {
            include: {
              pekerja: { select: { nama: true } },
            },
          },
        },
      });

      await AuditLogUseCase.record(tx, {
        userId: mandorId,
        action: "CREATE",
        tableName: "VerifikasiMandor",
        recordId: laporanBaru.id,
        details: `Mandor mengirim laporan verifikasi fisik (QC) untuk kegiatan "${jadwalExists.kegiatan}" dengan ${items.length} Pekerja Harian.`,
      });

      return laporanBaru;
    });
  }

  // 2. Ambil List Laporan Verifikasi Berdasarkan Blok (Untuk Filter Hierarki di Android)
  static async getVerifikasiByBlok(blokId: string) {
    return await prisma.verifikasiMandor.findMany({
      where: { blokId },
      orderBy: { tanggal: "desc" },
      include: {
        mandor: { select: { nama: true } },
        jadwal: { select: { kegiatan: true, mingguKe: true } },
        hasilKerjaPekerja: {
          include: {
            pekerja: { select: { nama: true, peran: true } },
          },
        },
      },
    });
  }

  // 2.5 Ambil List Laporan Verifikasi yang masih PENDING (Untuk Inbox Asisten Lapangan)
  static async getVerifikasiPending() {
    return await prisma.verifikasiMandor.findMany({
      where: { statusVerifikasi: "PENDING" },
      orderBy: { tanggal: "desc" },
      include: {
        mandor: { select: { nama: true } },
        jadwal: { select: { kegiatan: true, mingguKe: true } },
        hasilKerjaPekerja: {
          include: {
            pekerja: { select: { nama: true, peran: true } },
          },
        },
      },
    });
  }

  // 3. Asisten Lapangan Mengubah Status Laporan (APPROVE / REJECT)
  static async batasiAtauVerifikasiLaporan(
    id: string,
    asistenId: string,
    status: "APPROVED" | "REJECTED",
  ) {
    // Validasi apakah laporan benar-benar ada
    const laporan = await prisma.verifikasiMandor.findUnique({
      where: { id },
      include: { jadwal: true, hasilKerjaPekerja: true },
    });
    if (!laporan) throw new Error("Laporan verifikasi tidak ditemukan");

    if (laporan.statusVerifikasi === "APPROVED" && status === "APPROVED") {
      throw new Error("Laporan ini sudah disetujui sebelumnya.");
    }

    return await prisma.$transaction(async (tx: { verifikasiMandor: { update: (arg0: { where: { id: string; }; data: { statusVerifikasi: "APPROVED" | "REJECTED"; diperiksaOleh: string; }; include: { asistenPemeriksa: { select: { nama: boolean; }; }; }; }) => any; }; jadwalPerawatan: { update: (arg0: { where: { id: any; }; data: { luasSelesai: { increment: any; }; }; }) => any; }; }) => {
      const hasilReview = await tx.verifikasiMandor.update({
        where: { id },
        data: {
          statusVerifikasi: status,
          diperiksaOleh: asistenId,
        },
        include: {
          asistenPemeriksa: { select: { nama: true } },
        },
      });

      // Jika APPROVED, tambahkan luasDikerjakan ke JadwalPerawatan.luasSelesai
      if (status === "APPROVED") {
        const totalLuas = laporan.hasilKerjaPekerja.reduce(
          (sum: number, item: any) => sum + item.luasDikerjakan,
          0
        );

        if (totalLuas > 0) {
          await tx.jadwalPerawatan.update({
            where: { id: laporan.jadwalId },
            data: {
              luasSelesai: { increment: totalLuas },
            },
          });
        }
      }

      await AuditLogUseCase.record(tx, {
        userId: asistenId,
        action: "UPDATE",
        tableName: "VerifikasiMandor",
        recordId: id,
        details: `Asisten Lapangan memverifikasi laporan QC untuk kegiatan "${laporan.jadwal.kegiatan}" dengan status: ${status}.`,
      });

      return hasilReview;
    });
  }
}
