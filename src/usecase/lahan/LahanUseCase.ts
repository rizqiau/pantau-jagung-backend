import { prisma } from "../../infrastructure/prisma.js";
import { addDays, differenceInDays } from "date-fns";
import { AuditLogUseCase } from "../audit/AuditLogUseCase.js";

export class LahanUseCase {
  static async createLahanBerjenjang(payload: any) {
    const { namaLahan, varietas, latitude, longitude, tanggalTanam, blokList } = payload;
    const tglTanam = new Date(tanggalTanam);
    const luasTotal = blokList.reduce(
      (sum: number, blok: any) => sum + blok.luasBlok,
      0,
    );

    return await prisma.$transaction(async (tx) => {
      const lahan = await tx.lahan.create({
        data: { namaLahan, varietas, latitude, longitude, luasTotal },
      });

      for (const blokData of blokList) {
        const blok = await tx.blok.create({
          data: {
            lahanId: lahan.id,
            namaBlok: blokData.namaBlok,
            luasBlok: blokData.luasBlok,
          },
        });

        const estimasiPanen = addDays(tglTanam, 112);
        const siklus = await tx.siklusTanam.create({
          data: {
            blokId: blok.id,
            tanggalTanam: tglTanam,
            estimasiPanen: estimasiPanen,
            status: "PERSIAPAN",
          },
        });

        const sopJadwal = [
          { kegiatan: "Pengolahan lahan", offsetHari: -14, mingguKe: 1 },
          { kegiatan: "Aplikasi Bahan Organik", offsetHari: -7, mingguKe: 2 },
          { kegiatan: "Penanaman", offsetHari: 0, mingguKe: 3 },
          {
            kegiatan: "Penyulaman, Penjarangan, Pemupukan, HPT",
            offsetHari: 7,
            mingguKe: 4,
          },
          {
            kegiatan: "Penyiangan, Pengendalian HPT",
            offsetHari: 35,
            mingguKe: 6,
          },
          { kegiatan: "Pemupukan", offsetHari: 42, mingguKe: 7 },
          { kegiatan: "Pengendalian HPT", offsetHari: 49, mingguKe: 8 },
          { kegiatan: "Penyiangan", offsetHari: 56, mingguKe: 9 },
          {
            kegiatan: "Pemupukan, Pengendalian HPT",
            offsetHari: 63,
            mingguKe: 10,
          },
          { kegiatan: "Panen", offsetHari: 112, mingguKe: 15 },
          { kegiatan: "Pemipilan", offsetHari: 113, mingguKe: 15 },
          { kegiatan: "Penjemuran", offsetHari: 115, mingguKe: 15 },
          { kegiatan: "Packing", offsetHari: 119, mingguKe: 16 },
        ];

        const jadwalToInsert = sopJadwal.map((sop) => ({
          siklusId: siklus.id,
          kegiatan: sop.kegiatan,
          mingguKe: sop.mingguKe,
          tanggalJadwal: addDays(tglTanam, sop.offsetHari),
          status: "TERJADWAL" as const,
        }));

        await tx.jadwalPerawatan.createMany({ data: jadwalToInsert });
      }

      await AuditLogUseCase.record(tx, {
        userId: payload.operatorId || null,
        action: "CREATE",
        tableName: "Lahan",
        recordId: lahan.id,
        details: `Membuat lahan baru "${lahan.namaLahan}" dengan luas total ${lahan.luasTotal} Ha dan ${blokList.length} Blok.`,
      });

      return lahan;
    });
  }

  // 1. Ambil Semua Lahan (Untuk halaman utama/list daftar lahan)
  static async getAllLahan() {
    return await prisma.lahan.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  // 2. Ambil Detail Lahan Berdasarkan ID (Di sinilah kita panggil include secara mendalam)
  static async getLahanById(id: string) {
    return await prisma.lahan.findUnique({
      where: { id },
      include: {
        blok: {
          include: {
            siklusTanam: {
              include: {
                jadwalPerawatan: {
                  orderBy: { tanggalJadwal: "asc" },
                },
              },
            },
          },
        },
      },
    });
  }

  // 3. Update Informasi Dasar Lahan
  static async updateLahan(id: string, payload: any) {
    const { namaLahan, latitude, longitude, operatorId } = payload;
    return await prisma.$transaction(async (tx) => {
      const lahanDiupdate = await tx.lahan.update({
        where: { id },
        data: {
          namaLahan,
          latitude,
          longitude,
        },
      });

      await AuditLogUseCase.record(tx, {
        userId: operatorId || null,
        action: "UPDATE",
        tableName: "Lahan",
        recordId: id,
        details: `Memperbarui informasi dasar lahan menjadi "${namaLahan}" (Lat: ${latitude}, Lng: ${longitude}).`,
      });

      return lahanDiupdate;
    });
  }

  // 4. Hapus Lahan beserta seluruh isinya
  static async deleteLahan(id: string, operatorId?: string | null) {
    return await prisma.$transaction(async (tx) => {
      const lahan = await tx.lahan.findUnique({ where: { id } });
      if (!lahan) throw new Error("Lahan tidak ditemukan");

      await AuditLogUseCase.record(tx, {
        userId: operatorId || null,
        action: "DELETE",
        tableName: "Lahan",
        recordId: id,
        details: `Menghapus lahan "${lahan.namaLahan}" beserta seluruh data Blok, Siklus, dan Jadwal di dalamnya secara permanen.`,
      });

      return await tx.lahan.delete({
        where: { id },
      });
    });
  }

  // 5. Reschedule Jadwal Berjenjang
  static async rescheduleJadwal(jadwalId: string, tanggalBaruString: string, operatorId?: string | null) {
    const tanggalBaru = new Date(tanggalBaruString);

    // A. Cari jadwal yang ingin digeser
    const targetJadwal = await prisma.jadwalPerawatan.findUnique({
      where: { id: jadwalId },
      include: { siklus: true },
    });

    if (!targetJadwal) throw new Error("Jadwal tidak ditemukan");

    // B. Hitung selisih hari (Delta)
    const selisihHari = differenceInDays(
      tanggalBaru,
      targetJadwal.tanggalJadwal,
    );

    if (selisihHari === 0) {
      return {
        message: "Tanggal sama, tidak ada perubahan jadwal yang dilakukan.",
        terdampak: 0,
      };
    }

    // C. Cari semua jadwal setelahnya dalam siklus yang sama yang belum selesai
    const jadwalTerdampak = await prisma.jadwalPerawatan.findMany({
      where: {
        siklusId: targetJadwal.siklusId,
        tanggalJadwal: { gte: targetJadwal.tanggalJadwal }, // Hanya ambil jadwal saat ini dan masa depan
        status: "TERJADWAL",
      },
    });

    const transactionKueri = [];

    // D. Update massal jadwal perawatan
    for (const jadwal of jadwalTerdampak) {
      const tanggalDiperbarui = addDays(jadwal.tanggalJadwal, selisihHari);

      transactionKueri.push(
        prisma.jadwalPerawatan.update({
          where: { id: jadwal.id },
          data: { tanggalJadwal: tanggalDiperbarui },
        }),
      );
    }

    // E. Update estimasi panen di Siklus Tanam
    const estimasiPanenBaru = addDays(
      targetJadwal.siklus.estimasiPanen,
      selisihHari,
    );
    transactionKueri.push(
      prisma.siklusTanam.update({
        where: { id: targetJadwal.siklusId },
        data: { estimasiPanen: estimasiPanenBaru },
      }),
    );

    // F. Catat Audit Log
    transactionKueri.push(
      prisma.auditLog.create({
        data: {
          userId: operatorId || null,
          action: "UPDATE",
          tableName: "JadwalPerawatan",
          recordId: jadwalId,
          details: `Melakukan reschedule jadwal "${targetJadwal.kegiatan}" sebesar ${selisihHari} hari. Total jadwal terdampak: ${jadwalTerdampak.length}.`,
        },
      }),
    );

    // G. Eksekusi semua secara bersamaan (Atomic Transaction)
    await prisma.$transaction(transactionKueri);

    return {
      message: "Reschedule berjenjang berhasil diterapkan",
      hariDigeser: selisihHari,
      totalJadwalTerdampak: jadwalTerdampak.length,
    };
  }
}
