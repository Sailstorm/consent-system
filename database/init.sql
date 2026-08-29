CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS data_sources (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL UNIQUE,
    agency TEXT NOT NULL,
    source_url TEXT NOT NULL,
    licence TEXT,
    refresh_frequency TEXT NOT NULL,
    last_successful_import TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS organisations (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    business_name TEXT NOT NULL,
    abn VARCHAR(11),
    registration_status TEXT,
    registration_date DATE,
    cancellation_date DATE,
    source_id INTEGER NOT NULL REFERENCES data_sources(id),
    source_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS organisations_source_name_abn_unique
ON organisations (source_id, business_name, COALESCE(abn, ''));

CREATE INDEX IF NOT EXISTS organisations_business_name_trgm_idx
ON organisations USING GIN (business_name gin_trgm_ops);

CREATE INDEX IF NOT EXISTS organisations_abn_idx
ON organisations (abn);

CREATE TABLE IF NOT EXISTS ndb_periods (
    id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_notifications INTEGER CHECK (total_notifications IS NULL OR total_notifications >= 0),
    source_id INTEGER NOT NULL REFERENCES data_sources(id),
    source_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (source_id, period_start, period_end)
);

CREATE TABLE IF NOT EXISTS ndb_sector_stats (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    period_id INTEGER NOT NULL REFERENCES ndb_periods(id) ON DELETE CASCADE,
    sector TEXT NOT NULL,
    notifications INTEGER NOT NULL CHECK (notifications >= 0),
    percentage NUMERIC(5, 2) CHECK (percentage IS NULL OR percentage BETWEEN 0 AND 100),
    UNIQUE (period_id, sector)
);

CREATE TABLE IF NOT EXISTS ndb_cause_stats (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    period_id INTEGER NOT NULL REFERENCES ndb_periods(id) ON DELETE CASCADE,
    cause TEXT NOT NULL,
    notifications INTEGER NOT NULL CHECK (notifications >= 0),
    percentage NUMERIC(5, 2) CHECK (percentage IS NULL OR percentage BETWEEN 0 AND 100),
    UNIQUE (period_id, cause)
);

CREATE TABLE IF NOT EXISTS ndb_information_type_stats (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    period_id INTEGER NOT NULL REFERENCES ndb_periods(id) ON DELETE CASCADE,
    information_type TEXT NOT NULL,
    notifications INTEGER CHECK (notifications IS NULL OR notifications >= 0),
    UNIQUE (period_id, information_type)
);

CREATE TABLE IF NOT EXISTS ndb_people_affected_stats (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    period_id INTEGER NOT NULL REFERENCES ndb_periods(id) ON DELETE CASCADE,
    affected_range TEXT NOT NULL,
    notifications INTEGER NOT NULL CHECK (notifications >= 0),
    sort_order INTEGER NOT NULL DEFAULT 0,
    UNIQUE (period_id, affected_range)
);

CREATE TABLE IF NOT EXISTS import_runs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    source_id INTEGER NOT NULL REFERENCES data_sources(id),
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    status TEXT NOT NULL CHECK (status IN ('running', 'completed', 'failed')),
    imported_records INTEGER NOT NULL DEFAULT 0 CHECK (imported_records >= 0),
    error_message TEXT
);

INSERT INTO data_sources (
    code,
    name,
    agency,
    source_url,
    licence,
    refresh_frequency
)
VALUES
    (
        'asic_business_names',
        'ASIC Business Names Dataset',
        'Australian Securities and Investments Commission',
        'https://data.gov.au/data/dataset/asic-business-names',
        'Creative Commons Attribution 3.0 Australia',
        'Weekly'
    ),
    (
        'oaic_ndb',
        'Notifiable Data Breaches Scheme Dataset',
        'Office of the Australian Information Commissioner',
        'https://data.gov.au/data/dataset/notifiable-data-breaches-ndb-scheme',
        'Creative Commons Attribution 4.0 International',
        'Twice yearly'
    )
ON CONFLICT (code) DO UPDATE SET
    name = EXCLUDED.name,
    agency = EXCLUDED.agency,
    source_url = EXCLUDED.source_url,
    licence = EXCLUDED.licence,
    refresh_frequency = EXCLUDED.refresh_frequency;
