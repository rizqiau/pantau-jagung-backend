import { prisma } from "../../infrastructure/prisma.js";
import bcrypt from "bcrypt";
import { AuditLogUseCase } from "../audit/AuditLogUseCase.js";
export class PekerjaUseCase {
    // Mendaftarkan User Baru (Asisten Lapangan atau Mandor)
    static async registerUser(payload) {
        const { nama, username, password, role } = payload;
        const existingUser = await prisma.user.findUnique({ where: { username } });
        if (existingUser)
            throw new Error("Username sudah digunakan, pilih yang lain");
        const hashedPassword = await bcrypt.hash(password, 10);
        return await prisma.$transaction(async (tx) => {
            const newUser = await tx.user.create({
                data: {
                    nama,
                    username,
                    password: hashedPassword,
                    role,
                },
                select: {
                    id: true,
                    nama: true,
                    username: true,
                    role: true,
                    createdAt: true,
                },
            });
            await AuditLogUseCase.record(tx, {
                userId: payload.operatorId || null,
                action: "CREATE",
                tableName: "User",
                recordId: newUser.id,
                details: `Mendaftarkan user baru "${newUser.nama}" (Role: ${newUser.role}, Username: ${newUser.username}).`,
            });
            return newUser;
        });
    }
    // Ambil Semua User (Untuk list dropdown Mandor atau Asisten di Android)
    static async getAllUsers() {
        return await prisma.user.findMany({
            orderBy: { nama: "asc" },
            select: {
                id: true,
                nama: true,
                username: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    // Ambil Detail 1 User Berdasarkan ID (Untuk halaman profil pengguna)
    static async getUserById(id) {
        return await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                nama: true,
                username: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    static async updateUser(id, payload) {
        const { nama, username, password, role, operatorId } = payload;
        const dataToUpdate = { nama, username, role };
        if (password) {
            dataToUpdate.password = await bcrypt.hash(password, 10);
        }
        return await prisma.$transaction(async (tx) => {
            const userDiupdate = await tx.user.update({
                where: { id },
                data: dataToUpdate,
                select: {
                    id: true,
                    nama: true,
                    username: true,
                    role: true,
                    updatedAt: true,
                },
            });
            await AuditLogUseCase.record(tx, {
                userId: operatorId || null,
                action: "UPDATE",
                tableName: "User",
                recordId: id,
                details: `Memperbarui profil user "${userDiupdate.nama}" (Role: ${userDiupdate.role}, Username: ${userDiupdate.username}).`,
            });
            return userDiupdate;
        });
    }
    //Hapus User (Kasus Mandor/Asisten Resign)
    static async deleteUser(id, operatorId) {
        return await prisma.$transaction(async (tx) => {
            const user = await tx.user.findUnique({ where: { id } });
            if (!user)
                throw new Error("User tidak ditemukan");
            await AuditLogUseCase.record(tx, {
                userId: operatorId || null,
                action: "DELETE",
                tableName: "User",
                recordId: id,
                details: `Menghapus user "${user.nama}" (Role: ${user.role}, Username: ${user.username}) dari sistem pertanian secara permanen.`,
            });
            return await tx.user.delete({
                where: { id },
            });
        });
    }
    // Mendaftarkan Pekerja Harian (Menjadi Master Data Bebas)
    static async addPekerjaHarian(payload) {
        const { nama, peran, operatorId } = payload;
        return await prisma.$transaction(async (tx) => {
            const pekerja = await tx.pekerjaHarian.create({
                data: { nama, peran },
            });
            await AuditLogUseCase.record(tx, {
                userId: operatorId || null,
                action: "CREATE",
                tableName: "PekerjaHarian",
                recordId: pekerja.id,
                details: `Menambahkan pekerja harian baru "${pekerja.nama}" sebagai ${pekerja.peran || "Tanpa Peran"}.`,
            });
            return pekerja;
        });
    }
    // Ambil Semua Daftar Pekerja Harian
    // Fungsi ini berguna agar Mandor bisa melihat semua pekerja yang tersedia (List Dropdown di HP Android)
    static async getAllPekerjaHarian() {
        return await prisma.pekerjaHarian.findMany({
            orderBy: { nama: "asc" },
        });
    }
    // Update Informasi Pekerja Harian
    static async updatePekerjaHarian(id, payload) {
        const { nama, peran, operatorId } = payload;
        return await prisma.$transaction(async (tx) => {
            const pekerjaDiupdate = await tx.pekerjaHarian.update({
                where: { id },
                data: { nama, peran },
            });
            await AuditLogUseCase.record(tx, {
                userId: operatorId || null,
                action: "UPDATE",
                tableName: "PekerjaHarian",
                recordId: id,
                details: `Memperbarui data pekerja harian "${pekerjaDiupdate.nama}" sebagai ${pekerjaDiupdate.peran || "Tanpa Peran"}.`,
            });
            return pekerjaDiupdate;
        });
    }
    // Hapus Pekerja Harian (Kasus Karyawan Lepas Berhenti Kerja)
    static async deletePekerjaHarian(id, operatorId) {
        return await prisma.$transaction(async (tx) => {
            const pekerja = await tx.pekerjaHarian.findUnique({ where: { id } });
            if (!pekerja)
                throw new Error("Pekerja harian tidak ditemukan");
            await AuditLogUseCase.record(tx, {
                userId: operatorId || null,
                action: "DELETE",
                tableName: "PekerjaHarian",
                recordId: id,
                details: `Menghapus pekerja harian "${pekerja.nama}" (${pekerja.peran || "Tanpa Peran"}) dari master data secara permanen.`,
            });
            return await tx.pekerjaHarian.delete({
                where: { id },
            });
        });
    }
}
//# sourceMappingURL=PekerjaUseCase.js.map