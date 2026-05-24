// File: src/usecase/blok/BlokUseCase.ts
import { prisma } from "../../infrastructure/prisma.js";
export class BlokUseCase {
    // Ambil semua blok di lahan tertentu lengkap dengan progress kegiatan aktifnya
    static async getBlokProgressByLahan(lahanId) {
        // 1. Ambil semua blok yang berelasi dengan lahanId
        const bloks = await prisma.blok.findMany({
            where: { lahanId },
            include: {
                siklusTanam: {
                    where: {
                        status: { not: "SELESAI" }, // Hanya ambil siklus tanam yang sedang berjalan
                    },
                    include: {
                        jadwalPerawatan: {
                            orderBy: { tanggalJadwal: "asc" },
                        },
                    },
                },
            },
            orderBy: { namaBlok: "asc" },
        });
        // 2. Petakan data untuk menghitung persentase progress tiap kegiatan
        return bloks.map((blok) => {
            const siklusAktif = blok.siklusTanam[0] || null;
            // Jika belum ada siklus tanam aktif, kembalikan progress kosong
            if (!siklusAktif) {
                return {
                    id: blok.id,
                    namaBlok: blok.namaBlok,
                    luasBlok: blok.luasBlok,
                    kegiatanAktif: "Tidak ada siklus aktif",
                    persentaseProgress: 0,
                    jadwal: [],
                };
            }
            // Cari kegiatan yang statusnya belum selesai atau terdekat dari tanggal sekarang
            const kegiatanSaatIni = siklusAktif.jadwalPerawatan.find((j) => j.status === "TERJADWAL") ||
                siklusAktif.jadwalPerawatan[siklusAktif.jadwalPerawatan.length - 1];
            // Hitung rumus matematika progress %
            let persentase = 0;
            if (kegiatanSaatIni && blok.luasBlok > 0) {
                persentase = (kegiatanSaatIni.luasSelesai / blok.luasBlok) * 100;
                // Batasi maksimal 100% jika ada inputan berlebih
                if (persentase > 100)
                    persentase = 100;
            }
            return {
                id: blok.id,
                namaBlok: blok.namaBlok,
                luasBlok: blok.luasBlok,
                statusSiklus: siklusAktif.status,
                jadwalId: kegiatanSaatIni ? kegiatanSaatIni.id : null,
                kegiatanAktif: kegiatanSaatIni
                    ? kegiatanSaatIni.kegiatan
                    : "Semua jadwal selesai",
                mingguKe: kegiatanSaatIni ? kegiatanSaatIni.mingguKe : null,
                luasSelesai: kegiatanSaatIni ? kegiatanSaatIni.luasSelesai : 0,
                // Dibulatkan menjadi 1 angka di belakang koma (contoh: 50.0%)
                persentaseProgress: Math.round(persentase * 10) / 10,
            };
        });
    }
    static async getRiwayatPekerjaanByJadwal(jadwalId) {
        return await prisma.verifikasiMandor.findMany({
            where: {
                jadwalId: jadwalId,
            },
            orderBy: {
                tanggal: "desc", // Menampilkan laporan terbaru di urutan paling atas
            },
            include: {
                mandor: {
                    select: {
                        id: true,
                        nama: true, // Menampilkan nama Mandor yang bertugas pada hari itu
                    },
                },
                hasilKerjaPekerja: {
                    include: {
                        pekerja: {
                            select: {
                                id: true,
                                nama: true, // Menampilkan nama Pekerja Harian (Agus, Rudi, dll)
                                peran: true,
                            },
                        },
                    },
                },
            },
        });
    }
}
//# sourceMappingURL=BlokUseCase.js.map