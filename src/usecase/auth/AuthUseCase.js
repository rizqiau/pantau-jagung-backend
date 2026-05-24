// File: src/usecase/AuthUseCase.ts
import { prisma } from "../../infrastructure/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const JWT_SECRET = process.env.JWT_SECRET || "pantau-jagung-secret-key-2026";
export class AuthUseCase {
    /**
     * Login user dengan username & password.
     * Mengembalikan JWT token + data user (tanpa password).
     */
    static async login(username, password) {
        // 1. Cari user berdasarkan username
        const user = await prisma.user.findUnique({
            where: { username },
        });
        if (!user) {
            throw new Error("Username tidak ditemukan");
        }
        // 2. Verifikasi password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error("Password salah");
        }
        // 3. Generate JWT token (simple, no refresh)
        const token = jwt.sign({
            userId: user.id,
            username: user.username,
            role: user.role,
        }, JWT_SECRET, { expiresIn: "30d" } // Token berlaku 30 hari
        );
        // 4. Catat di Audit Log
        await prisma.auditLog.create({
            data: {
                userId: user.id,
                action: "CREATE",
                tableName: "Auth",
                recordId: user.id,
                details: `User "${user.nama}" (${user.role}) berhasil login.`,
            },
        });
        // 5. Return token + user data (tanpa password)
        return {
            token,
            user: {
                id: user.id,
                nama: user.nama,
                username: user.username,
                role: user.role,
            },
        };
    }
}
//# sourceMappingURL=AuthUseCase.js.map