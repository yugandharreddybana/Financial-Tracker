-- Runs BEFORE Hibernate DDL (spring.sql.init.mode=always).
-- 1. Create the finance_app schema so Hibernate can create tables in it.
-- 2. Drop ALL legacy currency columns that Hibernate ddl-auto=update never removes.
-- IF EXISTS guards make every statement safe on any database state.
CREATE SCHEMA IF NOT EXISTS finance_app;

-- Legacy direct-currency columns on bank_accounts (replaced by currency_id FK)
ALTER TABLE IF EXISTS finance_app.bank_accounts DROP COLUMN IF EXISTS currency_code;
ALTER TABLE IF EXISTS finance_app.bank_accounts DROP COLUMN IF EXISTS currency_symbol;
ALTER TABLE IF EXISTS finance_app.bank_accounts DROP COLUMN IF EXISTS currency_name;
ALTER TABLE IF EXISTS finance_app.bank_accounts DROP COLUMN IF EXISTS currency_flag;

-- Legacy currency column on users (currency selection removed from signup)
ALTER TABLE IF EXISTS finance_app.users DROP COLUMN IF EXISTS currency;

-- Drop old unique-on-code constraint and replace with composite (code, country)
-- so that multiple Eurozone countries can each have their own EUR row.
ALTER TABLE IF EXISTS finance_app.currencies DROP CONSTRAINT IF EXISTS currencies_code_key;
ALTER TABLE IF EXISTS finance_app.currencies DROP CONSTRAINT IF EXISTS uq_currency_code_country;
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'finance_app' AND table_name = 'currencies') THEN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint
      WHERE conname = 'uq_currency_code_country'
    ) THEN
      ALTER TABLE finance_app.currencies
        ADD CONSTRAINT uq_currency_code_country UNIQUE (code, country);
    END IF;
  END IF;
END$$;
-- Remove the generic 'Eurozone' EUR entry (replaced by per-country entries added by CurrencySeeder)
DELETE FROM finance_app.currencies WHERE code = 'EUR' AND country = 'Eurozone';
