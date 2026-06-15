import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const backendRoot = path.resolve(__dirname, '../..');
const fallbackDbPath = path.join(backendRoot, 'database.json');
const dbPath = process.env.DB_PATH
  ? path.resolve(backendRoot, process.env.DB_PATH)
  : fallbackDbPath;
const useSsl = process.env.DATABASE_SSL === 'true' || process.env.PGSSLMODE === 'require';

type JsonRecord = Record<string, unknown>;

interface JsonDatabaseFile {
  db?: Record<string, JsonRecord[]>;
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is required to run PostgreSQL migration.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: useSsl ? { rejectUnauthorized: false } : false
});

function readSourceDatabase(): Record<string, JsonRecord[]> {
  if (!fs.existsSync(dbPath)) {
    console.warn(`Source database not found at ${dbPath}. Migration will create empty tables only.`);
    return {};
  }

  const raw = fs.readFileSync(dbPath, 'utf8');
  const parsed = JSON.parse(raw) as JsonDatabaseFile;
  return parsed.db ?? {};
}

function toJson(value: unknown) {
  return value === undefined ? null : JSON.stringify(value);
}

async function ensureSchema() {
  const statements = [
    `CREATE TABLE IF NOT EXISTS admins (
      id INTEGER PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      secret_key TEXT,
      email VARCHAR(255),
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_login TIMESTAMPTZ
    )`,
    `CREATE TABLE IF NOT EXISTS content (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      title_uzb TEXT,
      title_ru TEXT,
      title_en TEXT,
      description TEXT,
      description_uzb TEXT,
      description_ru TEXT,
      description_en TEXT,
      content_text TEXT,
      content_text_uzb TEXT,
      content_text_ru TEXT,
      content_text_en TEXT,
      image_url TEXT,
      image_path TEXT,
      image_folder TEXT,
      image_name TEXT,
      media_type VARCHAR(20),
      video_url TEXT,
      slug TEXT,
      views INTEGER,
      album TEXT,
      category VARCHAR(100) NOT NULL,
      is_published BOOLEAN NOT NULL DEFAULT FALSE,
      publish_date TIMESTAMPTZ,
      created_by INTEGER,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS offline_queue (
      id INTEGER PRIMARY KEY,
      action VARCHAR(100) NOT NULL,
      payload JSONB NOT NULL,
      status VARCHAR(20) NOT NULL,
      retry_count INTEGER NOT NULL DEFAULT 0,
      max_retries INTEGER NOT NULL DEFAULT 3,
      error_message TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      processed_at TIMESTAMPTZ
    )`,
    `CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY,
      key VARCHAR(255) UNIQUE NOT NULL,
      value TEXT,
      description TEXT,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS teachers (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      name_uzb TEXT,
      name_ru TEXT,
      name_en TEXT,
      subject TEXT NOT NULL,
      subject_uzb TEXT,
      subject_ru TEXT,
      subject_en TEXT,
      bio TEXT,
      bio_uzb TEXT,
      bio_ru TEXT,
      bio_en TEXT,
      image_url TEXT,
      image_path TEXT,
      image_folder TEXT,
      image_name TEXT,
      experience_years INTEGER NOT NULL DEFAULT 0,
      phone TEXT,
      social_links JSONB,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_by INTEGER,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS students (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      grade TEXT NOT NULL,
      class_name TEXT NOT NULL,
      "group" TEXT,
      date_of_birth TEXT NOT NULL,
      parent_name TEXT NOT NULL,
      parent_phone TEXT NOT NULL,
      image_url TEXT,
      image_folder TEXT,
      image_name TEXT,
      achievements JSONB,
      certificates JSONB,
      attendance JSONB,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS activity_logs (
      id INTEGER PRIMARY KEY,
      admin_id INTEGER,
      action VARCHAR(100) NOT NULL,
      entity VARCHAR(100) NOT NULL,
      entity_id INTEGER,
      message TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS notifications (
      id INTEGER PRIMARY KEY,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(20) NOT NULL,
      read BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`,
    `CREATE TABLE IF NOT EXISTS devices (
      id INTEGER PRIMARY KEY,
      admin_id INTEGER NOT NULL,
      fingerprint TEXT NOT NULL,
      device_name TEXT NOT NULL,
      ip_address TEXT NOT NULL,
      user_agent TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      last_active TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      is_active BOOLEAN NOT NULL DEFAULT TRUE
    )`,
    `CREATE TABLE IF NOT EXISTS login_history (
      id INTEGER PRIMARY KEY,
      admin_id INTEGER NOT NULL,
      username TEXT NOT NULL,
      ip_address TEXT NOT NULL,
      user_agent TEXT NOT NULL,
      device_name TEXT NOT NULL,
      success BOOLEAN NOT NULL DEFAULT TRUE,
      login_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      logout_time TIMESTAMPTZ
    )`,
    `CREATE TABLE IF NOT EXISTS section_content (
      id INTEGER PRIMARY KEY,
      page VARCHAR(100) NOT NULL,
      section VARCHAR(100) NOT NULL,
      key VARCHAR(100) NOT NULL,
      value TEXT NOT NULL,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE(page, section, key)
    )`,
    `CREATE TABLE IF NOT EXISTS staff (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL,
      position TEXT NOT NULL,
      description TEXT NOT NULL,
      image_url TEXT,
      image_path TEXT,
      image_folder TEXT,
      image_name TEXT,
      order_num INTEGER NOT NULL DEFAULT 0,
      is_active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ
    )`
  ];

  for (const statement of statements) {
    await pool.query(statement);
  }
}

async function upsertRows(tableName: string, columns: string[], rows: JsonRecord[]) {
  if (!rows.length) return;

  const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
  const assignments = columns
    .filter((column) => column !== 'id')
    .map((column) => `${column} = EXCLUDED.${column}`)
    .join(', ');

  const sql = `INSERT INTO ${tableName} (${columns.join(', ')})
    VALUES (${placeholders})
    ON CONFLICT (id) DO UPDATE SET ${assignments}`;

  for (const row of rows) {
    const values = columns.map((column) => (row as Record<string, unknown>)[column]);
    await pool.query(sql, values);
  }
}

async function importData(source: Record<string, JsonRecord[]>) {
  await upsertRows('admins', [
    'id', 'username', 'password_hash', 'secret_key', 'email', 'is_active', 'created_at', 'updated_at', 'last_login'
  ], source.admins ?? []);

  await upsertRows('content', [
    'id', 'title', 'title_uzb', 'title_ru', 'title_en', 'description', 'description_uzb', 'description_ru',
    'description_en', 'content_text', 'content_text_uzb', 'content_text_ru', 'content_text_en', 'image_url',
    'image_path', 'image_folder', 'image_name', 'media_type', 'video_url', 'slug', 'views', 'album', 'category',
    'is_published', 'publish_date', 'created_by', 'created_at', 'updated_at'
  ], source.content ?? []);

  await upsertRows('offline_queue', [
    'id', 'action', 'payload', 'status', 'retry_count', 'max_retries', 'error_message', 'created_at', 'updated_at', 'processed_at'
  ], (source.offline_queue ?? []).map((row) => ({ ...row, payload: toJson(row.payload) })));

  await upsertRows('settings', ['id', 'key', 'value', 'description', 'updated_at'], source.settings ?? []);

  await upsertRows('teachers', [
    'id', 'name', 'name_uzb', 'name_ru', 'name_en', 'subject', 'subject_uzb', 'subject_ru', 'subject_en', 'bio',
    'bio_uzb', 'bio_ru', 'bio_en', 'image_url', 'image_path', 'image_folder', 'image_name', 'experience_years',
    'phone', 'social_links', 'is_active', 'created_by', 'created_at', 'updated_at'
  ], (source.teachers ?? []).map((row) => ({ ...row, social_links: toJson(row.social_links) })));

  await upsertRows('students', [
    'id', 'name', 'grade', 'class_name', 'group', 'date_of_birth', 'parent_name', 'parent_phone', 'image_url',
    'image_folder', 'image_name', 'achievements', 'certificates', 'attendance', 'is_active', 'created_at', 'updated_at'
  ], (source.students ?? []).map((row) => ({
    ...row,
    achievements: toJson(row.achievements),
    certificates: toJson(row.certificates),
    attendance: toJson(row.attendance)
  })));

  await upsertRows('activity_logs', [
    'id', 'admin_id', 'action', 'entity', 'entity_id', 'message', 'created_at'
  ], source.activity_logs ?? []);

  await upsertRows('notifications', [
    'id', 'title', 'message', 'type', 'read', 'created_at'
  ], source.notifications ?? []);

  await upsertRows('devices', [
    'id', 'admin_id', 'fingerprint', 'device_name', 'ip_address', 'user_agent', 'created_at', 'last_active', 'is_active'
  ], source.devices ?? []);

  await upsertRows('login_history', [
    'id', 'admin_id', 'username', 'ip_address', 'user_agent', 'device_name', 'success', 'login_time', 'logout_time'
  ], source.login_history ?? []);

  await upsertRows('section_content', [
    'id', 'page', 'section', 'key', 'value', 'updated_at'
  ], source.section_content ?? []);

  await upsertRows('staff', [
    'id', 'name', 'position', 'description', 'image_url', 'image_path', 'image_folder', 'image_name',
    'order_num', 'is_active', 'created_at', 'updated_at'
  ], source.staff ?? []);
}

async function resetSequences() {
  const tables = ['admins', 'content', 'offline_queue', 'settings', 'teachers', 'students', 'activity_logs', 'notifications', 'devices', 'login_history', 'section_content', 'staff'];

  for (const table of tables) {
    await pool.query(`
      SELECT setval(
        pg_get_serial_sequence('${table}', 'id'),
        COALESCE((SELECT MAX(id) FROM ${table}), 1),
        (SELECT COUNT(*) > 0 FROM ${table})
      )
    `);
  }
}

async function migrate() {
  console.log('Starting PostgreSQL migration...');
  const source = readSourceDatabase();

  try {
    await ensureSchema();
    await importData(source);
    await resetSequences();
    console.log('Migration completed successfully.');
  } finally {
    await pool.end();
  }
}

migrate().catch((error) => {
  console.error('Migration failed:', error);
  pool.end().finally(() => process.exit(1));
});
