import initSqlJs, { type Database, type SqlJsStatic } from 'sql.js'

export type UserRole = 'admin' | 'manager' | 'doctor' | 'decider'

export interface UserRow {
  id: number
  username: string
  password_hash: string
  role: UserRole
  real_name: string
  department: string
  created_at: string
}

export interface PatientRow {
  patient_id: string
  name: string
  gender: 'M' | 'F' | 'U'
  birth_date: string
  phone: string | null
  id_card_masked: string
  admission_date: string
}

export interface StudyRow {
  study_uid: string
  patient_id: string
  modality: 'CT' | 'MRI' | 'DR' | 'US'
  study_date: string
  description: string | null
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CRITICAL'
  report_summary: string | null
  assigned_doctor: string | null
}

export interface DeviceRow {
  device_id: string
  manufacturer: string
  model: string
  location: string
  status: 'ONLINE' | 'OFFLINE' | 'MAINTENANCE'
  last_maintenance: string | null
  warranty_expiry: string | null
}

export interface AuditLogRow {
  id: number
  user_id: number | null
  action: string
  target_resource: string | null
  ip_address: string | null
  timestamp: string
}

export interface SystemConfigRow {
  key: string
  value: string
  description: string | null
  is_active: number
}

export interface BlindPackageRow {
  id: number
  package_code: string
  bidder_alias: string
  tech_score: number | null
  price_score: number | null
  sealed: number
  summary: string | null
  created_at: string
}

const DEMO_PASSWORDS: Record<string, string> = {
  admin: 'admin123',
  dept_head: 'med2026',
  dr_zhang: 'doctor123',
  president: 'admin999',
}

/** Simple reversible demo hash — not for production */
export function hashPassword(plain: string): string {
  return btoa(`ds_pacs:${plain}`)
}

export function verifyPassword(plain: string, hash: string): boolean {
  return hashPassword(plain) === hash
}

export function getDemoPassword(username: string): string | undefined {
  return DEMO_PASSWORDS[username]
}

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS ds_users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'manager', 'doctor', 'decider')),
    real_name TEXT,
    department TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ds_system_configs (
    key TEXT PRIMARY KEY,
    value TEXT,
    description TEXT,
    is_active INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS ds_patients (
    patient_id TEXT PRIMARY KEY,
    name TEXT,
    gender TEXT CHECK(gender IN ('M', 'F', 'U')),
    birth_date DATE,
    phone TEXT,
    id_card_masked TEXT,
    admission_date DATETIME
);

CREATE TABLE IF NOT EXISTS ds_studies (
    study_uid TEXT PRIMARY KEY,
    patient_id TEXT,
    modality TEXT CHECK(modality IN ('CT', 'MRI', 'DR', 'US')),
    study_date DATETIME,
    description TEXT,
    status TEXT CHECK(status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CRITICAL')),
    report_summary TEXT,
    assigned_doctor TEXT,
    FOREIGN KEY (patient_id) REFERENCES ds_patients(patient_id)
);

CREATE TABLE IF NOT EXISTS ds_audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    target_resource TEXT,
    ip_address TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES ds_users(id)
);

CREATE TABLE IF NOT EXISTS ds_devices (
    device_id TEXT PRIMARY KEY,
    manufacturer TEXT,
    model TEXT,
    location TEXT,
    status TEXT CHECK(status IN ('ONLINE', 'OFFLINE', 'MAINTENANCE')),
    last_maintenance DATE,
    warranty_expiry DATE
);

CREATE TABLE IF NOT EXISTS ds_blind_packages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    package_code TEXT UNIQUE NOT NULL,
    bidder_alias TEXT NOT NULL,
    tech_score REAL,
    price_score REAL,
    sealed INTEGER DEFAULT 1,
    summary TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
`

function seedSql(): string {
  return `
INSERT OR IGNORE INTO ds_users (username, password_hash, role, real_name, department) VALUES
('admin', '${hashPassword(DEMO_PASSWORDS.admin)}', 'admin', '系统管理员', '信息科'),
('dept_head', '${hashPassword(DEMO_PASSWORDS.dept_head)}', 'manager', '李主任', '影像科'),
('dr_zhang', '${hashPassword(DEMO_PASSWORDS.dr_zhang)}', 'doctor', '张医生', '影像科'),
('president', '${hashPassword(DEMO_PASSWORDS.president)}', 'decider', '王院长', '院办');

INSERT OR IGNORE INTO ds_system_configs (key, value, description, is_active) VALUES
('ai_assistance_enabled', 'true', '是否开启AI辅助诊断模块', 1),
('blind_review_mode', 'true', '是否启用双盲评审数据脱敏模式', 1),
('site_title', '深州市医院影像诊断系统', '站点标题', 1),
('project_code', 'HB2026073610070027', '招标项目编号', 1),
('budget_cny', '1050000', '项目预算（元）', 1),
('delivery_days', '30', '合同交付日历天数', 1);

INSERT OR IGNORE INTO ds_patients (patient_id, name, gender, birth_date, phone, id_card_masked, admission_date) VALUES
('P1001', '张三', 'M', '1985-05-12', '138****1021', '131182********1234', '2026-09-01 09:30:00'),
('P1002', '李四', 'F', '1990-08-23', '139****8832', '131182********5678', '2026-09-01 10:15:00'),
('P1003', '王五', 'M', '1978-11-03', '137****4410', '131182********9012', '2026-09-02 08:40:00'),
('P1004', '赵六', 'F', '1995-02-18', '136****2298', '131182********3456', '2026-09-02 14:20:00'),
('P1005', '陈七', 'M', '1968-07-30', '135****7715', '131182********7890', '2026-09-03 09:05:00');

INSERT OR IGNORE INTO ds_studies (study_uid, patient_id, modality, study_date, description, status, report_summary, assigned_doctor) VALUES
('1.2.840.113619.2.55.3.12345.1.1', 'P1001', 'CT', '2026-09-01 09:45:00', '胸部CT平扫', 'COMPLETED', '双肺未见明显活动性病变。', 'dr_zhang'),
('1.2.840.113619.2.55.3.12345.1.2', 'P1002', 'MRI', '2026-09-01 10:30:00', '颅脑MRI平扫+DWI', 'CRITICAL', '左侧基底节区急性脑梗死可能。', 'dr_zhang'),
('1.2.840.113619.2.55.3.12345.1.3', 'P1003', 'DR', '2026-09-02 08:55:00', '胸部正侧位', 'COMPLETED', '心肺膈未见明确异常。', 'dr_zhang'),
('1.2.840.113619.2.55.3.12345.1.4', 'P1004', 'CT', '2026-09-02 14:40:00', '上腹部CT增强', 'IN_PROGRESS', NULL, 'dr_zhang'),
('1.2.840.113619.2.55.3.12345.1.5', 'P1005', 'MRI', '2026-09-03 09:20:00', '腰椎MRI', 'PENDING', NULL, NULL),
('1.2.840.113619.2.55.3.12345.1.6', 'P1001', 'US', '2026-09-03 11:00:00', '腹部超声', 'PENDING', NULL, NULL);

INSERT OR IGNORE INTO ds_devices (device_id, manufacturer, model, location, status, last_maintenance, warranty_expiry) VALUES
('DEV-CT-001', 'GE Healthcare', 'LightSpeed VCT', '放射科CT室1', 'ONLINE', '2026-07-15', '2028-06-30'),
('DEV-MRI-001', 'Siemens', 'MAGNETOM Aera 1.5T', '放射科MRI室', 'ONLINE', '2026-08-01', '2027-12-31'),
('DEV-DR-001', 'Philips', 'DigitalDiagnost C90', '放射科DR室', 'ONLINE', '2026-06-20', '2027-06-20'),
('DEV-US-001', 'Mindray', 'Resona 7', '超声科诊室2', 'MAINTENANCE', '2026-05-10', '2026-11-30'),
('DEV-CT-002', 'United Imaging', 'uCT 780', '放射科CT室2', 'OFFLINE', '2026-04-02', '2027-03-15');

INSERT OR IGNORE INTO ds_blind_packages (package_code, bidder_alias, tech_score, price_score, sealed, summary) VALUES
('PKG-A-01', '投标人甲', 86.5, 92.0, 1, '技术方案完整，DICOM 3.0 与 AI 接口预留清晰'),
('PKG-B-02', '投标人乙', 81.0, 88.5, 1, '交付周期短，维保响应承诺达标'),
('PKG-C-03', '投标人丙', 90.2, 79.0, 1, '三维重建与危急值联动表现突出');

INSERT OR IGNORE INTO ds_audit_logs (user_id, action, target_resource, ip_address) VALUES
(1, 'LOGIN', 'auth', '10.32.1.10'),
(1, 'VIEW_IMAGE', '1.2.840.113619.2.55.3.12345.1.1', '10.32.1.10'),
(3, 'VIEW_IMAGE', '1.2.840.113619.2.55.3.12345.1.2', '10.32.1.22'),
(3, 'EXPORT_REPORT', '1.2.840.113619.2.55.3.12345.1.2', '10.32.1.22'),
(2, 'REVIEW_REPORT', '1.2.840.113619.2.55.3.12345.1.1', '10.32.1.15'),
(1, 'TOGGLE_CONFIG', 'blind_review_mode', '10.32.1.10');
`
}

let SQL: SqlJsStatic | null = null
let db: Database | null = null

const IDB_NAME = 'ds_pacs_demo'
const IDB_STORE = 'sqlite'
const IDB_KEY = 'db'

async function openIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, 1)
    req.onupgradeneeded = () => {
      const idb = req.result
      if (!idb.objectStoreNames.contains(IDB_STORE)) {
        idb.createObjectStore(IDB_STORE)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

async function loadFromIndexedDB(): Promise<Uint8Array | null> {
  try {
    const idb = await openIdb()
    return await new Promise((resolve, reject) => {
      const tx = idb.transaction(IDB_STORE, 'readonly')
      const store = tx.objectStore(IDB_STORE)
      const req = store.get(IDB_KEY)
      req.onsuccess = () => resolve((req.result as Uint8Array) ?? null)
      req.onerror = () => reject(req.error)
    })
  } catch {
    return null
  }
}

async function saveToIndexedDB(data: Uint8Array): Promise<void> {
  const idb = await openIdb()
  await new Promise<void>((resolve, reject) => {
    const tx = idb.transaction(IDB_STORE, 'readwrite')
    tx.objectStore(IDB_STORE).put(data, IDB_KEY)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

function isSqliteBytes(bytes: Uint8Array): boolean {
  if (bytes.length < 16) return false
  const magic = String.fromCharCode(...bytes.subarray(0, 15))
  return magic === 'SQLite format 3'
}

async function tryFetchRemoteDb(): Promise<Uint8Array | null> {
  const urls = ['/api/db', 'https://26-hb-ds-pacs.softwarelink.net/api/db']
  for (const url of urls) {
    try {
      const res = await fetch(url, { method: 'GET' })
      if (!res.ok) continue
      const buf = await res.arrayBuffer()
      const bytes = new Uint8Array(buf)
      if (isSqliteBytes(bytes)) return bytes
    } catch {
      // continue
    }
  }
  return null
}

function openOrSeed(bytes: Uint8Array | null): Database {
  if (!SQL) throw new Error('sql.js not loaded')
  if (bytes && isSqliteBytes(bytes)) {
    try {
      return new SQL.Database(bytes)
    } catch {
      // fall through
    }
  }
  const fresh = new SQL.Database()
  fresh.run(SCHEMA_SQL)
  fresh.run(seedSql())
  return fresh
}

export async function initDatabase(): Promise<Database> {
  if (db) return db

  const mod = await import('sql.js/dist/sql-wasm.js')
  const init = ((mod as { default?: typeof initSqlJs }).default ??
    (mod as unknown as typeof initSqlJs)) as typeof initSqlJs

  SQL = await init({
    locateFile: (file: string) => `/${file}`,
  })

  const local = await loadFromIndexedDB()
  const localOk = local && isSqliteBytes(local) ? local : null
  const remote = localOk ? null : await tryFetchRemoteDb()
  db = openOrSeed(localOk ?? remote)
  if (!localOk) await persistDatabase()

  db.run(SCHEMA_SQL)
  const count = queryValue<number>('SELECT COUNT(*) as c FROM ds_users')
  if (!count) {
    db.run(seedSql())
    await persistDatabase()
  }

  return db
}

export function getDatabase(): Database {
  if (!db) throw new Error('Database not initialized')
  return db
}

export async function persistDatabase(): Promise<void> {
  if (!db) return
  const data = db.export()
  await saveToIndexedDB(data)

  try {
    await fetch('/api/save-db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/octet-stream' },
      body: new Blob([data.buffer as ArrayBuffer]),
    })
  } catch {
    // Worker endpoint may be unavailable in local/dev
  }
}

function rowsFromExec<T>(sql: string, params: unknown[] = []): T[] {
  const database = getDatabase()
  const stmt = database.prepare(sql)
  stmt.bind(params as never[])
  const rows: T[] = []
  while (stmt.step()) {
    rows.push(stmt.getAsObject() as T)
  }
  stmt.free()
  return rows
}

export function queryAll<T>(sql: string, params: unknown[] = []): T[] {
  return rowsFromExec<T>(sql, params)
}

export function queryOne<T>(sql: string, params: unknown[] = []): T | null {
  const rows = rowsFromExec<T>(sql, params)
  return rows[0] ?? null
}

export function queryValue<T>(sql: string, params: unknown[] = []): T | null {
  const row = queryOne<Record<string, T>>(sql, params)
  if (!row) return null
  return Object.values(row)[0] ?? null
}

export function runSql(sql: string, params: unknown[] = []): void {
  const database = getDatabase()
  database.run(sql, params as never[])
}

export function findUserByUsername(username: string): UserRow | null {
  return queryOne<UserRow>('SELECT * FROM ds_users WHERE username = ?', [username])
}

export function isBlindMode(): boolean {
  const row = queryOne<SystemConfigRow>(
    "SELECT * FROM ds_system_configs WHERE key = 'blind_review_mode'",
  )
  return (row?.value ?? 'true') === 'true'
}

export function maskName(name: string | null | undefined): string {
  if (!name) return '***'
  if (name.length <= 1) return '*'
  return name[0] + '*'.repeat(Math.min(name.length - 1, 2))
}

export function listPatients(mask = false): PatientRow[] {
  const rows = queryAll<PatientRow>('SELECT * FROM ds_patients ORDER BY admission_date DESC')
  if (!mask) return rows
  return rows.map((p) => ({
    ...p,
    name: maskName(p.name),
    phone: p.phone ? p.phone.replace(/\d(?=\d{4})/g, '*') : null,
  }))
}

export function listStudies(): StudyRow[] {
  return queryAll<StudyRow>('SELECT * FROM ds_studies ORDER BY study_date DESC')
}

export function listDevices(): DeviceRow[] {
  return queryAll<DeviceRow>('SELECT * FROM ds_devices ORDER BY device_id')
}

export function listAuditLogs(limit = 100): AuditLogRow[] {
  return queryAll<AuditLogRow>(
    'SELECT * FROM ds_audit_logs ORDER BY id DESC LIMIT ?',
    [limit],
  )
}

export function listConfigs(): SystemConfigRow[] {
  return queryAll<SystemConfigRow>('SELECT * FROM ds_system_configs ORDER BY key')
}

export function listBlindPackages(unseal = false): BlindPackageRow[] {
  const rows = queryAll<BlindPackageRow>('SELECT * FROM ds_blind_packages ORDER BY id')
  if (unseal) return rows
  return rows.map((p) => ({
    ...p,
    bidder_alias: '******',
    summary: p.sealed ? '【暗标密封中】技术方案与报价已脱敏' : p.summary,
  }))
}

export function dashboardStats() {
  const studiesTotal = queryValue<number>('SELECT COUNT(*) FROM ds_studies') ?? 0
  const studiesCritical =
    queryValue<number>("SELECT COUNT(*) FROM ds_studies WHERE status = 'CRITICAL'") ?? 0
  const studiesPending =
    queryValue<number>(
      "SELECT COUNT(*) FROM ds_studies WHERE status IN ('PENDING','IN_PROGRESS')",
    ) ?? 0
  const devicesOnline =
    queryValue<number>("SELECT COUNT(*) FROM ds_devices WHERE status = 'ONLINE'") ?? 0
  const devicesTotal = queryValue<number>('SELECT COUNT(*) FROM ds_devices') ?? 0
  const patientsToday =
    queryValue<number>(
      "SELECT COUNT(*) FROM ds_patients WHERE date(admission_date) = date('now','localtime')",
    ) ?? 0
  const budget = queryValue<number>("SELECT value FROM ds_system_configs WHERE key = 'budget_cny'")
  const modalityRows = queryAll<{ modality: string; c: number }>(
    'SELECT modality, COUNT(*) as c FROM ds_studies GROUP BY modality',
  )
  const statusRows = queryAll<{ status: string; c: number }>(
    'SELECT status, COUNT(*) as c FROM ds_studies GROUP BY status',
  )

  return {
    studiesTotal,
    studiesCritical,
    studiesPending,
    devicesOnline,
    devicesTotal,
    onlineRate: devicesTotal > 0 ? Math.round((devicesOnline / devicesTotal) * 100) : 0,
    patientsToday: patientsToday || 3,
    budget: Number(budget ?? 1050000),
    modalityRows,
    statusRows,
  }
}

export function writeAuditLog(
  userId: number | null,
  action: string,
  targetResource: string,
) {
  runSql(
    `INSERT INTO ds_audit_logs (user_id, action, target_resource, ip_address)
     VALUES (?, ?, ?, ?)`,
    [userId, action, targetResource, '127.0.0.1'],
  )
}

export function updateStudyReport(studyUid: string, summary: string, status: StudyRow['status']) {
  runSql(
    `UPDATE ds_studies SET report_summary = ?, status = ? WHERE study_uid = ?`,
    [summary, status, studyUid],
  )
}

export function updateConfig(key: string, value: string) {
  runSql(`UPDATE ds_system_configs SET value = ? WHERE key = ?`, [value, key])
}

export function updateDeviceStatus(deviceId: string, status: DeviceRow['status']) {
  runSql(`UPDATE ds_devices SET status = ? WHERE device_id = ?`, [status, deviceId])
}

export function unsealBlindPackage(id: number) {
  runSql(`UPDATE ds_blind_packages SET sealed = 0 WHERE id = ?`, [id])
}
