// File: src/usecase/DashboardUseCase.ts
import { prisma } from "../../infrastructure/prisma.js";

export class DashboardUseCase {
  /**
   * Dashboard Summary untuk Mandor:
   * - Jumlah blok aktif yang ditugaskan
   * - Kegiatan hari ini
   * - Total data belum disinkronkan (placeholder, dihitung di Android)
   */
  static async getMandorDashboard(mandorId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Kegiatan yang harus dikerjakan (hari ini atau tertunda)
    const kegiatanHariIni = await prisma.jadwalPerawatan.findMany({
      where: {
        tanggalJadwal: {
          lt: tomorrow,
        },
        status: "TERJADWAL",
      },
      include: {
        siklus: {
          include: {
            blok: {
              include: {
                lahan: { select: { namaLahan: true } },
              },
            },
          },
        },
      },
    });

    // Aktivitas harian terakhir mandor ini (Mini-Feed Riwayat)
    const aktivitasTerakhir = await prisma.aktivitasHarian.findMany({
      where: { mandorId },
      orderBy: { tanggal: "desc" },
      take: 5,
      include: {
        jadwal: {
          select: {
            kegiatan: true,
            siklus: {
              select: {
                blok: { select: { namaBlok: true } },
              },
            },
          },
        },
      },
    });

    // Total laporan pending dari mandor ini
    const totalPendingQc = await prisma.verifikasiMandor.count({
      where: { mandorId, statusVerifikasi: "PENDING" },
    });

    const totalPendingPanen = await prisma.panen.count({
      where: { mandorId, statusVerifikasi: "PENDING" },
    });

    // ─── FITUR BARU 1: Blok Progress untuk Mandor ───────────
    const allSiklus = await prisma.siklusTanam.findMany({
      where: { status: { not: "SELESAI" } },
      include: {
        blok: { select: { id: true, namaBlok: true, luasBlok: true } },
        jadwalPerawatan: {
          orderBy: { mingguKe: "asc" },
          select: {
            id: true,
            kegiatan: true,
            mingguKe: true,
            status: true,
            luasSelesai: true,
          },
        },
      },
    });

    const blokProgress = allSiklus.map((s) => {
      const aktif = s.jadwalPerawatan.find((j) => j.status === "TERJADWAL") || 
                    s.jadwalPerawatan[s.jadwalPerawatan.length - 1];

      let persen = 0;
      if (aktif && s.blok.luasBlok > 0) {
        persen = (aktif.luasSelesai / s.blok.luasBlok) * 100;
        if (persen > 100) persen = 100;
      }

      return {
        id: s.blok.id,
        namaBlok: s.blok.namaBlok,
        luasBlok: s.blok.luasBlok,
        statusSiklus: s.status,
        jadwalId: aktif?.id || null,
        kegiatanAktif: aktif?.kegiatan || null,
        mingguKe: aktif?.mingguKe || null,
        luasSelesai: aktif?.luasSelesai || 0,
        persentaseProgress: Math.round(persen),
      };
    });

    // ─── FITUR BARU 2: Statistik Personal Mingguan ──────────
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const aktivitasMingguIni = await prisma.aktivitasHarian.findMany({
      where: {
        mandorId,
        tanggal: { gte: startOfWeek },
      },
      include: {
        kehadiranPekerja: true,
      },
    });

    const totalLuasMingguIni = aktivitasMingguIni.reduce(
      (sum, a) => sum + a.luasDikerjakan,
      0
    );
    const totalPekerjaMingguIni = aktivitasMingguIni.reduce(
      (sum, a) => sum + a.kehadiranPekerja.length,
      0
    );
    const jumlahHariKerja = aktivitasMingguIni.length;
    const rataRataPekerjaPerHari =
      jumlahHariKerja > 0
        ? Math.round(totalPekerjaMingguIni / jumlahHariKerja)
        : 0;

    const totalBiayaMingguIni = aktivitasMingguIni.reduce(
      (sum, a) => sum + a.totalBiayaPekerja + a.totalBiayaMaterial,
      0
    );

    const statistikMingguan = {
      totalLuasDikerjakan: parseFloat(totalLuasMingguIni.toFixed(2)),
      rataRataPekerjaPerHari,
      jumlahHariKerja,
      totalBiaya: totalBiayaMingguIni,
    };

    return {
      kegiatanHariIni,
      aktivitasTerakhir,
      totalPendingQc,
      totalPendingPanen,
      totalPending: totalPendingQc + totalPendingPanen,
      blokProgress,
      statistikMingguan,
    };
  }

  /**
   * Dashboard Summary untuk Asisten Lapangan:
   * - Total hektar perkebunan
   * - Grafik keuangan mingguan
   * - Jumlah laporan pending yang menunggu persetujuan
   */
  static async getAsistenDashboard() {
    // Total luas lahan
    const totalLahan = await prisma.lahan.aggregate({
      _sum: { luasTotal: true },
      _count: true,
    });

    // Total blok
    const totalBlok = await prisma.blok.count();

    // Siklus aktif (belum selesai)
    const siklusAktif = await prisma.siklusTanam.count({
      where: { status: { not: "SELESAI" } },
    });

    // Laporan pending (QC + Panen)
    const pendingVerifikasi = await prisma.verifikasiMandor.count({
      where: { statusVerifikasi: "PENDING" },
    });

    const pendingPanen = await prisma.panen.count({
      where: { statusVerifikasi: "PENDING" },
    });

    // Keuangan minggu ini
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Minggu
    startOfWeek.setHours(0, 0, 0, 0);

    const keuanganMingguIni = await prisma.aktivitasHarian.aggregate({
      where: {
        tanggal: { gte: startOfWeek },
      },
      _sum: {
        totalBiayaPekerja: true,
        totalBiayaMaterial: true,
      },
    });

    // Pendapatan panen minggu ini
    const pendapatanMingguIni = await prisma.panen.aggregate({
      where: {
        tanggalPanen: { gte: startOfWeek },
        statusVerifikasi: "APPROVED",
      },
      _sum: {
        totalPendapatan: true,
      },
    });

    // Material dengan stok rendah (< 10)
    const materialLowStock = await prisma.katalogMaterial.findMany({
      where: { stok: { lt: 10 } },
      orderBy: { stok: "asc" },
    });

    return {
      totalLuasHektar: totalLahan._sum.luasTotal || 0,
      totalLahan: totalLahan._count,
      totalBlok,
      siklusAktif,
      pendingApprovals: pendingVerifikasi + pendingPanen,
      pendingVerifikasi,
      pendingPanen,
      keuanganMingguIni: {
        totalBiayaPekerja: keuanganMingguIni._sum.totalBiayaPekerja || 0,
        totalBiayaMaterial: keuanganMingguIni._sum.totalBiayaMaterial || 0,
        totalBiaya:
          (keuanganMingguIni._sum.totalBiayaPekerja || 0) +
          (keuanganMingguIni._sum.totalBiayaMaterial || 0),
      },
      pendapatanMingguIni: pendapatanMingguIni._sum.totalPendapatan || 0,
      materialLowStock,
    };
  }
}
