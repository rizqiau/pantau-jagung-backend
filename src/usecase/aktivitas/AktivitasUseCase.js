// File: src/usecase/AktivitasUseCase.ts
import { prisma } from "../../infrastructure/prisma.js";
import { AuditLogUseCase } from "../audit/AuditLogUseCase.js";
export class AktivitasUseCase {
    static async inputAktivitasHarian(payload) {
        const { id, // UUID opsional dari Android
        jadwalId, mandorId, tanggal, luasDikerjakan, listPekerja, listMaterial, } = payload;
        if (id) {
            const existing = await prisma.aktivitasHarian.findUnique({
                where: { id },
                include: {
                    kehadiranPekerja: true,
                    pemakaianMaterial: true,
                },
            });
            if (existing) {
                // Catat audit log khusus untuk retry sinkronisasi offline
                await prisma.auditLog.create({
                    data: {
                        userId: mandorId || null,
                        action: "CREATE",
                        tableName: "AktivitasHarian",
                        recordId: id,
                        details: `SYNC_RETRY: Menerima sinkronisasi ulang duplikat dari Android untuk aktivitas harian ID ${id}.`,
                    },
                });
                console.log(`[Idempotency]: Menemukan aktivitas harian duplikat dengan ID ${id}. Mengembalikan data yang sudah ada.`);
                return existing;
            }
        }
        const jadwal = await prisma.jadwalPerawatan.findUnique({
            where: { id: jadwalId },
        });
        if (!jadwal)
            throw new Error("Jadwal pekerjaan tidak ditemukan");
        let totalBiayaPekerja = 0;
        if (listPekerja && listPekerja.length > 0) {
            totalBiayaPekerja = listPekerja.reduce((sum, p) => sum + p.upahHarian, 0);
        }
        let totalBiayaMaterial = 0;
        const pemakaianMaterialData = [];
        // --- CEK STOK MATERIAL SEBELUM MEMPROSES ---
        if (listMaterial && listMaterial.length > 0) {
            for (const item of listMaterial) {
                const materialMaster = await prisma.katalogMaterial.findUnique({
                    where: { id: item.materialId },
                });
                if (!materialMaster)
                    throw new Error(`Material dengan ID ${item.materialId} tidak ditemukan`);
                // Validasi: Apakah stok di gudang cukup?
                if (materialMaster.stok < item.jumlahPakai) {
                    throw new Error(`Stok ${materialMaster.namaMaterial} tidak mencukupi. Sisa stok: ${materialMaster.stok}`);
                }
                const biaya = materialMaster.hargaSatuan * item.jumlahPakai;
                totalBiayaMaterial += biaya;
                pemakaianMaterialData.push({
                    materialId: item.materialId,
                    jumlahPakai: item.jumlahPakai,
                    hargaSatuan: materialMaster.hargaSatuan,
                });
            }
        }
        return await prisma.$transaction(async (tx) => {
            const aktivitasBaru = await tx.aktivitasHarian.create({
                data: {
                    id: id || undefined,
                    jadwalId,
                    mandorId,
                    tanggal: new Date(tanggal),
                    luasDikerjakan,
                    totalBiayaPekerja,
                    totalBiayaMaterial,
                    kehadiranPekerja: {
                        create: listPekerja
                            ? listPekerja.map((p) => ({
                                pekerjaId: p.pekerjaId,
                                upahHarian: p.upahHarian,
                            }))
                            : [],
                    },
                    pemakaianMaterial: {
                        create: pemakaianMaterialData,
                    },
                },
                include: {
                    kehadiranPekerja: true,
                    pemakaianMaterial: true,
                },
            });
            // Progress luasSelesai tidak lagi diupdate di sini. 
            // Akan diupdate saat Asisten Lapangan memberikan status APPROVED pada VerifikasiMandor.
            // --- LOGIKA BARU: POTONG STOK MATERIAL OTOMATIS ---
            if (listMaterial && listMaterial.length > 0) {
                for (const item of listMaterial) {
                    await tx.katalogMaterial.update({
                        where: { id: item.materialId },
                        data: { stok: { decrement: item.jumlahPakai } },
                    });
                }
            }
            await AuditLogUseCase.record(tx, {
                userId: mandorId,
                action: "CREATE",
                tableName: "AktivitasHarian",
                recordId: aktivitasBaru.id,
                details: `Mandor mencatat laporan aktivitas harian untuk kegiatan "${jadwal.kegiatan}" dengan luas pengerjaan ${luasDikerjakan} Ha (Biaya Pekerja: Rp ${totalBiayaPekerja}, Biaya Material: Rp ${totalBiayaMaterial}).`,
            });
            return aktivitasBaru;
        });
    }
    // --- REKAP AKTIVITAS HARIAN DENGAN TOTAL BIAYA ---
    static async getAllAktivitas() {
        const listAktivitas = await prisma.aktivitasHarian.findMany({
            orderBy: { tanggal: "desc" },
            include: {
                mandor: { select: { nama: true } },
                jadwal: { select: { kegiatan: true, mingguKe: true } },
            },
        });
        // Petakan (map) hasilnya untuk menambahkan totalBiayaKeseluruhan
        return listAktivitas.map((aktivitas) => ({
            ...aktivitas,
            totalBiayaKeseluruhan: aktivitas.totalBiayaPekerja + aktivitas.totalBiayaMaterial,
        }));
    }
}
//# sourceMappingURL=AktivitasUseCase.js.map