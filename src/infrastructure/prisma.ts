import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import dotenv from "dotenv";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

// Buat connection pool menggunakan library pg murni
const pool = new Pool({ connectionString });

// Pasangkan pool tersebut ke adapter Prisma
const adapter = new PrismaPg(pool);

// Inisialisasi Prisma Client dengan adapter
export const prisma = new PrismaClient({ adapter });
