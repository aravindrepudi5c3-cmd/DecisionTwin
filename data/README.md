# DecisionTwin data

The read-only master dataset belongs at:

`data/DecisionTwin_IT_Master_Dataset.csv`

Processing outputs are written to `data/processed/` and profiling/validation reports to `data/reports/`.

The import pipeline will not create records until the real CSV is placed at the path above. The `dist/` directory is generated output and must not be used as source storage.

Run seeding only from a server or local shell with `VITE_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`; never put the service-role key in a `VITE_` frontend environment variable.
