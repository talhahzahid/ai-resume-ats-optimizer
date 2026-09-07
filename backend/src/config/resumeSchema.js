import { sequelize } from './database.js';

const KNOWN_TEXT_HASH_UNIQUES = [
  'resumes_textHash_key',
  'resumes_text_hash_key',
  'resumes_textHash',
  'resumes_text_hash',
  'resumes_text_hash_uk',
  'resumes_textHash_uk',
  'resumes_text_hash_session_id_unique',
];

/**
 * Drop leftover uniques on textHash (global or session-based).
 * Keep only (textHash, userId).
 */
export const dropLegacyTextHashUniques = async () => {
  for (const name of KNOWN_TEXT_HASH_UNIQUES) {
    await sequelize.query(
      `ALTER TABLE IF EXISTS resumes DROP CONSTRAINT IF EXISTS "${name}"`
    );
    await sequelize.query(`DROP INDEX IF EXISTS "${name}"`);
  }

  await sequelize.query(`
    DO $$
    DECLARE r record;
    BEGIN
      FOR r IN
        SELECT c.conname
        FROM pg_constraint c
        JOIN pg_class t ON t.oid = c.conrelid
        WHERE t.relname = 'resumes'
          AND c.contype = 'u'
          AND pg_get_constraintdef(c.oid) ILIKE '%textHash%'
          AND pg_get_constraintdef(c.oid) NOT ILIKE '%userId%'
      LOOP
        EXECUTE format('ALTER TABLE resumes DROP CONSTRAINT IF EXISTS %I', r.conname);
      END LOOP;

      FOR r IN
        SELECT indexname
        FROM pg_indexes
        WHERE tablename = 'resumes'
          AND indexdef ILIKE '%UNIQUE%'
          AND indexdef ILIKE '%textHash%'
          AND indexdef NOT ILIKE '%userId%'
      LOOP
        EXECUTE format('DROP INDEX IF EXISTS %I', r.indexname);
      END LOOP;
    END $$;
  `);
};

export const ensureResumeSchema = async () => {
  await dropLegacyTextHashUniques();

  await sequelize.query(`
    ALTER TABLE IF EXISTS resumes
    ADD COLUMN IF NOT EXISTS "userId" INTEGER;
  `);

  await sequelize.query(`
    CREATE INDEX IF NOT EXISTS resumes_user_id_idx
    ON resumes ("userId");
  `);

  await sequelize.query(`
    CREATE UNIQUE INDEX IF NOT EXISTS resumes_text_hash_user_id_unique
    ON resumes ("textHash", "userId");
  `);
};
