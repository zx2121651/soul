"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
function runMigrations() {
    return __awaiter(this, void 0, void 0, function* () {
        const pool = new pg_1.Pool({
            user: process.env.DB_USER || 'postgres',
            host: process.env.DB_HOST || 'localhost',
            database: process.env.DB_NAME || 'soul_app',
            password: process.env.DB_PASSWORD || 'postgres',
            port: parseInt(process.env.DB_PORT || '5432', 10),
        });
        const client = yield pool.connect();
        try {
            console.log('Running migrations...');
            const migrationFilePath = path_1.default.join(__dirname, '../migrations/001_initial_schema.sql');
            const sql = fs_1.default.readFileSync(migrationFilePath, 'utf8');
            yield client.query('BEGIN');
            yield client.query(sql);
            yield client.query('COMMIT');
            console.log('✅ Migrations applied successfully.');
        }
        catch (error) {
            yield client.query('ROLLBACK');
            console.error('❌ Migration failed:', error);
            process.exit(1);
        }
        finally {
            client.release();
            yield pool.end();
        }
    });
}
runMigrations();
