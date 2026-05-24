-- CreateEnum
CREATE TYPE "StatusSiklus" AS ENUM ('PERSIAPAN', 'VEGETATIF', 'GENERATIF', 'PANEN', 'SELESAI');

-- CreateEnum
CREATE TYPE "StatusKegiatan" AS ENUM ('TERJADWAL', 'SELESAI', 'TERLEWAT');

-- CreateEnum
CREATE TYPE "StatusVerifikasi" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "RoleUser" AS ENUM ('ASISTEN_LAPANGAN', 'MANDOR');

-- CreateTable
CREATE TABLE "Lahan" (
    "id" TEXT NOT NULL,
    "namaLahan" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "luasTotal" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lahan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Blok" (
    "id" TEXT NOT NULL,
    "lahanId" TEXT NOT NULL,
    "namaBlok" TEXT NOT NULL,
    "luasBlok" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Blok_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiklusTanam" (
    "id" TEXT NOT NULL,
    "blokId" TEXT NOT NULL,
    "tanggalTanam" TIMESTAMP(3) NOT NULL,
    "estimasiPanen" TIMESTAMP(3) NOT NULL,
    "status" "StatusSiklus" NOT NULL DEFAULT 'PERSIAPAN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SiklusTanam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JadwalPerawatan" (
    "id" TEXT NOT NULL,
    "siklusId" TEXT NOT NULL,
    "kegiatan" TEXT NOT NULL,
    "mingguKe" INTEGER NOT NULL,
    "tanggalJadwal" TIMESTAMP(3) NOT NULL,
    "status" "StatusKegiatan" NOT NULL DEFAULT 'TERJADWAL',
    "luasSelesai" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JadwalPerawatan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "RoleUser" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PekerjaHarian" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "peran" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PekerjaHarian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KatalogMaterial" (
    "id" TEXT NOT NULL,
    "namaMaterial" TEXT NOT NULL,
    "kategori" TEXT NOT NULL,
    "satuan" TEXT NOT NULL,
    "hargaSatuan" DOUBLE PRECISION NOT NULL,
    "stok" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KatalogMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AktivitasHarian" (
    "id" TEXT NOT NULL,
    "jadwalId" TEXT NOT NULL,
    "mandorId" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "luasDikerjakan" DOUBLE PRECISION NOT NULL,
    "totalBiayaPekerja" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "totalBiayaMaterial" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AktivitasHarian_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KehadiranPekerja" (
    "id" TEXT NOT NULL,
    "aktivitasId" TEXT NOT NULL,
    "pekerjaId" TEXT NOT NULL,
    "upahHarian" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "KehadiranPekerja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PemakaianMaterial" (
    "id" TEXT NOT NULL,
    "aktivitasId" TEXT NOT NULL,
    "materialId" TEXT NOT NULL,
    "jumlahPakai" DOUBLE PRECISION NOT NULL,
    "hargaSatuan" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "PemakaianMaterial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerifikasiMandor" (
    "id" TEXT NOT NULL,
    "blokId" TEXT NOT NULL,
    "jadwalId" TEXT NOT NULL,
    "mandorId" TEXT NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL,
    "catatan" TEXT,
    "statusVerifikasi" "StatusVerifikasi" NOT NULL DEFAULT 'PENDING',
    "diperiksaOleh" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerifikasiMandor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HasilKerjaPekerja" (
    "id" TEXT NOT NULL,
    "verifikasiId" TEXT NOT NULL,
    "pekerjaId" TEXT NOT NULL,
    "luasDikerjakan" DOUBLE PRECISION NOT NULL,
    "fotoBukti" TEXT,

    CONSTRAINT "HasilKerjaPekerja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Panen" (
    "id" TEXT NOT NULL,
    "siklusId" TEXT NOT NULL,
    "tanggalPanen" TIMESTAMP(3) NOT NULL,
    "beratHasil" DOUBLE PRECISION NOT NULL,
    "hargaJualPerKg" DOUBLE PRECISION NOT NULL,
    "totalPendapatan" DOUBLE PRECISION NOT NULL,
    "kualitas" TEXT NOT NULL,
    "catatan" TEXT,
    "statusVerifikasi" "StatusVerifikasi" NOT NULL DEFAULT 'PENDING',
    "mandorId" TEXT NOT NULL,
    "diperiksaOleh" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Panen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "tableName" TEXT NOT NULL,
    "recordId" TEXT,
    "details" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- AddForeignKey
ALTER TABLE "Blok" ADD CONSTRAINT "Blok_lahanId_fkey" FOREIGN KEY ("lahanId") REFERENCES "Lahan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SiklusTanam" ADD CONSTRAINT "SiklusTanam_blokId_fkey" FOREIGN KEY ("blokId") REFERENCES "Blok"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JadwalPerawatan" ADD CONSTRAINT "JadwalPerawatan_siklusId_fkey" FOREIGN KEY ("siklusId") REFERENCES "SiklusTanam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AktivitasHarian" ADD CONSTRAINT "AktivitasHarian_jadwalId_fkey" FOREIGN KEY ("jadwalId") REFERENCES "JadwalPerawatan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AktivitasHarian" ADD CONSTRAINT "AktivitasHarian_mandorId_fkey" FOREIGN KEY ("mandorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KehadiranPekerja" ADD CONSTRAINT "KehadiranPekerja_aktivitasId_fkey" FOREIGN KEY ("aktivitasId") REFERENCES "AktivitasHarian"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KehadiranPekerja" ADD CONSTRAINT "KehadiranPekerja_pekerjaId_fkey" FOREIGN KEY ("pekerjaId") REFERENCES "PekerjaHarian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PemakaianMaterial" ADD CONSTRAINT "PemakaianMaterial_aktivitasId_fkey" FOREIGN KEY ("aktivitasId") REFERENCES "AktivitasHarian"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PemakaianMaterial" ADD CONSTRAINT "PemakaianMaterial_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "KatalogMaterial"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerifikasiMandor" ADD CONSTRAINT "VerifikasiMandor_blokId_fkey" FOREIGN KEY ("blokId") REFERENCES "Blok"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerifikasiMandor" ADD CONSTRAINT "VerifikasiMandor_jadwalId_fkey" FOREIGN KEY ("jadwalId") REFERENCES "JadwalPerawatan"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerifikasiMandor" ADD CONSTRAINT "VerifikasiMandor_mandorId_fkey" FOREIGN KEY ("mandorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VerifikasiMandor" ADD CONSTRAINT "VerifikasiMandor_diperiksaOleh_fkey" FOREIGN KEY ("diperiksaOleh") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HasilKerjaPekerja" ADD CONSTRAINT "HasilKerjaPekerja_verifikasiId_fkey" FOREIGN KEY ("verifikasiId") REFERENCES "VerifikasiMandor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HasilKerjaPekerja" ADD CONSTRAINT "HasilKerjaPekerja_pekerjaId_fkey" FOREIGN KEY ("pekerjaId") REFERENCES "PekerjaHarian"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Panen" ADD CONSTRAINT "Panen_siklusId_fkey" FOREIGN KEY ("siklusId") REFERENCES "SiklusTanam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Panen" ADD CONSTRAINT "Panen_mandorId_fkey" FOREIGN KEY ("mandorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Panen" ADD CONSTRAINT "Panen_diperiksaOleh_fkey" FOREIGN KEY ("diperiksaOleh") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
