-- Deepzhou Hospital PACS demo schema (sql.js)
-- Table prefix: ds_

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
