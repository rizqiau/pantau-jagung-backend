import { prisma } from "../../infrastructure/prisma.js";

export class ReportUseCase {
  /**
   * Mengambil laporan biaya lengkap dengan semua agregasi yang dibutuhkan.
   */
  static async getCostReport(lahanId?: string) {
    const aktivitas = await prisma.aktivitasHarian.findMany({
      where: lahanId
        ? { jadwal: { siklus: { blok: { lahanId } } } }
        : {},
      include: {
        kehadiranPekerja: {
          include: { pekerja: true },
        },
        pemakaianMaterial: {
          include: { material: true },
        },
        jadwal: {
          include: {
            siklus: {
              include: {
                blok: {
                  include: {
                    lahan: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { tanggal: "asc" },
    });

    // Ambil luas total lahan
    const lahanFilter = lahanId ? { id: lahanId } : {};
    const lahanList = await prisma.lahan.findMany({ where: lahanFilter });
    const totalLuasHa = lahanList.reduce((sum, l) => sum + l.luasTotal, 0) || 1;

    // Struktur Agregasi
    const perLahan: Record<string, { nama: string; total: number }> = {};
    const perBlok: Record<string, { nama: string; total: number }> = {};
    const perSiklus: Record<string, { nama: string; total: number }> = {};
    const perJadwal: Record<string, { nama: string; total: number }> = {};
    const perHari: Record<string, { nama: string; total: number }> = {};
    const perMinggu: Record<string, { nama: string; total: number }> = {};
    const perKegiatan: Record<string, { nama: string; total: number }> = {};
    const biayaKumulatifMap: Record<string, number> = {};

    let totalBiayaSeluruhnya = 0;
    let totalBiayaHK = 0;
    let totalBiayaMaterial = 0;
    const uniquePekerja = new Set<string>();
    const uniqueMaterial = new Set<string>();
    const kegiatanSet = new Set<string>();

    // Detail per kegiatan (untuk layar Detail Biaya)
    const detailKegiatan: any[] = [];

    aktivitas.forEach((a) => {
      const biayaHK = a.totalBiayaPekerja;
      const biayaMat = a.totalBiayaMaterial;
      const biaya = biayaHK + biayaMat;
      totalBiayaSeluruhnya += biaya;
      totalBiayaHK += biayaHK;
      totalBiayaMaterial += biayaMat;

      // Hitung unique pekerja & material
      a.kehadiranPekerja.forEach((kp) => uniquePekerja.add(kp.pekerjaId));
      a.pemakaianMaterial.forEach((pm) => uniqueMaterial.add(pm.materialId));

      const lahanIdCur = a.jadwal.siklus.blok.lahan.id;
      const namaLahan = a.jadwal.siklus.blok.lahan.namaLahan;
      const blokId = a.jadwal.siklus.blok.id;
      const namaBlok = `${namaLahan} - ${a.jadwal.siklus.blok.namaBlok}`;
      const siklusId = a.jadwal.siklus.id;
      const namaSiklus = `${namaBlok} (Tanam: ${a.jadwal.siklus.tanggalTanam.toISOString().split("T")[0]})`;
      const jadwalId = a.jadwal.id;
      const namaKegiatan = a.jadwal.kegiatan;
      const namaJadwal = `${namaKegiatan} (M${a.jadwal.mingguKe})`;
      const hariStr = a.tanggal.toISOString().split("T")[0] || "";
      const mingguStr = `Minggu ${a.jadwal.mingguKe}`;

      kegiatanSet.add(jadwalId);

      // Aggregate per Lahan
      if (!perLahan[lahanIdCur]) perLahan[lahanIdCur] = { nama: namaLahan, total: 0 };
      perLahan[lahanIdCur].total += biaya;

      // Aggregate per Blok
      if (!perBlok[blokId]) perBlok[blokId] = { nama: namaBlok, total: 0 };
      perBlok[blokId].total += biaya;

      // Aggregate per Siklus
      if (!perSiklus[siklusId]) perSiklus[siklusId] = { nama: namaSiklus, total: 0 };
      perSiklus[siklusId].total += biaya;

      // Aggregate per Jadwal
      if (!perJadwal[jadwalId]) perJadwal[jadwalId] = { nama: namaJadwal, total: 0 };
      perJadwal[jadwalId].total += biaya;

      // Aggregate per Hari
      if (!perHari[hariStr]) perHari[hariStr] = { nama: hariStr, total: 0 };
      perHari[hariStr].total += biaya;

      // Aggregate per Minggu
      if (!perMinggu[mingguStr]) perMinggu[mingguStr] = { nama: mingguStr, total: 0 };
      perMinggu[mingguStr].total += biaya;

      // Aggregate per Kegiatan (untuk donut chart)
      if (!perKegiatan[namaKegiatan]) perKegiatan[namaKegiatan] = { nama: namaKegiatan, total: 0 };
      perKegiatan[namaKegiatan].total += biaya;

      // Biaya kumulatif
      biayaKumulatifMap[hariStr] = (biayaKumulatifMap[hariStr] || 0) + biaya;

      // Hitung HST
      const tanggalTanam = new Date(a.jadwal.siklus.tanggalTanam);
      const tanggalAktivitas = new Date(a.tanggal);
      const hst = Math.floor((tanggalAktivitas.getTime() - tanggalTanam.getTime()) / (1000 * 60 * 60 * 24));

      // Detail kegiatan
      detailKegiatan.push({
        id: a.id,
        kegiatan: namaKegiatan,
        tanggal: hariStr,
        hstKe: hst,
        totalBiaya: biaya,
        biayaPerHa: biaya / totalLuasHa,
        totalBiayaHK: biayaHK,
        totalBiayaMaterial: biayaMat,
        totalHK: a.kehadiranPekerja.length,
        totalJenisMaterial: a.pemakaianMaterial.length,
        rincianHK: a.kehadiranPekerja.map((kp) => ({
          nama: kp.pekerja.nama,
          upah: kp.upahHarian,
        })),
        rincianMaterial: a.pemakaianMaterial.map((pm) => ({
          nama: pm.material.namaMaterial,
          jumlah: pm.jumlahPakai,
          satuan: pm.material.satuan,
          hargaSatuan: pm.hargaSatuan,
          total: pm.jumlahPakai * pm.hargaSatuan,
        })),
      });
    });

    // Biaya kumulatif (running total)
    const sortedDays = Object.keys(biayaKumulatifMap).sort();
    let cumTotal = 0;
    const biayaKumulatif = sortedDays.map((day) => {
      cumTotal += biayaKumulatifMap[day] || 0;
      return { nama: day, total: cumTotal };
    });

    // Progress Budidaya — ambil siklus aktif terbaru
    let progressBudidaya: any = null;
    const siklusAktif = await prisma.siklusTanam.findFirst({
      where: lahanId
        ? { blok: { lahanId }, status: { not: "SELESAI" } }
        : { status: { not: "SELESAI" } },
      include: {
        blok: { include: { lahan: true } },
        jadwalPerawatan: { orderBy: { mingguKe: "asc" } },
      },
      orderBy: { tanggalTanam: "desc" },
    });

    if (siklusAktif) {
      const now = new Date();
      const tanggalTanam = new Date(siklusAktif.tanggalTanam);
      const hst = Math.floor((now.getTime() - tanggalTanam.getTime()) / (1000 * 60 * 60 * 24));
      const jadwalSelesai = siklusAktif.jadwalPerawatan.filter((j) => j.status === "SELESAI").length;
      const totalJadwal = siklusAktif.jadwalPerawatan.length;
      const currentJadwal = siklusAktif.jadwalPerawatan.find((j) => j.status === "TERJADWAL");

      progressBudidaya = {
        hstHariIni: hst,
        tahapSaatIni: currentJadwal?.kegiatan || siklusAktif.status,
        progressPersen: totalJadwal > 0 ? Math.round((jadwalSelesai / totalJadwal) * 100) : 0,
        namaLahan: siklusAktif.blok.lahan.namaLahan,
        namaBlok: siklusAktif.blok.namaBlok,
      };
    }

    const formatArr = (obj: Record<string, any>) =>
      Object.values(obj).sort((a, b) => b.total - a.total);
    const formatDateArr = (obj: Record<string, any>) =>
      Object.values(obj).sort((a, b) => a.nama.localeCompare(b.nama));

    return {
      totalBiayaSeluruhnya,
      totalBiayaHK,
      totalBiayaMaterial,
      totalKegiatan: kegiatanSet.size,
      totalHK: uniquePekerja.size,
      totalJenisMaterial: uniqueMaterial.size,
      biayaPerHa: totalBiayaSeluruhnya / totalLuasHa,
      perKegiatan: formatArr(perKegiatan),
      biayaKumulatif,
      perLahan: formatArr(perLahan),
      perBlok: formatArr(perBlok),
      perSiklus: formatArr(perSiklus),
      perJadwal: formatArr(perJadwal),
      perHari: formatDateArr(perHari),
      perMinggu: formatDateArr(perMinggu),
      detailKegiatan,
      progressBudidaya,
    };
  }

  /**
   * Mengambil laporan panen.
   */
  static async getHarvestReport(lahanId?: string) {
    const panen = await prisma.panen.findMany({
      where: {
        statusVerifikasi: "APPROVED",
        ...(lahanId ? { siklus: { blok: { lahanId } } } : {}),
      },
      include: {
        siklus: {
          include: {
            blok: {
              include: {
                lahan: true,
              },
            },
          },
        },
      },
      orderBy: { tanggalPanen: "asc" },
    });

    let totalBeratSeluruhnya = 0;
    let totalPendapatanSeluruhnya = 0;

    const perLahan: Record<string, { nama: string; totalBerat: number; totalPendapatan: number }> = {};
    const perBulan: Record<string, { nama: string; totalBerat: number; totalPendapatan: number }> = {};

    panen.forEach((p) => {
      totalBeratSeluruhnya += p.beratHasil;
      totalPendapatanSeluruhnya += p.totalPendapatan;

      const lahanIdCur = p.siklus.blok.lahan.id;
      const namaLahan = p.siklus.blok.lahan.namaLahan;
      const date = new Date(p.tanggalPanen);
      const bulanStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

      if (!perLahan[lahanIdCur]) perLahan[lahanIdCur] = { nama: namaLahan, totalBerat: 0, totalPendapatan: 0 };
      perLahan[lahanIdCur].totalBerat += p.beratHasil;
      perLahan[lahanIdCur].totalPendapatan += p.totalPendapatan;

      if (!perBulan[bulanStr]) perBulan[bulanStr] = { nama: bulanStr, totalBerat: 0, totalPendapatan: 0 };
      perBulan[bulanStr].totalBerat += p.beratHasil;
      perBulan[bulanStr].totalPendapatan += p.totalPendapatan;
    });

    const formatArray = (obj: Record<string, any>) => Object.values(obj);

    return {
      totalBeratSeluruhnya,
      totalPendapatanSeluruhnya,
      perLahan: formatArray(perLahan).sort((a: any, b: any) => b.totalBerat - a.totalBerat),
      perBulan: formatArray(perBulan).sort((a: any, b: any) => a.nama.localeCompare(b.nama)),
    };
  }
}
