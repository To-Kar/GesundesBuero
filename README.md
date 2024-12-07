# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).

# GesundesBuero

## Local Development Setup

1. Clone the repository
2. Copy `api/local.settings.json.template` to `api/local.settings.json`
3. Fill in your database credentials in `local.settings.json`
4. Never commit `local.settings.json` to the repository

```bash
# Setup steps
cp api/local.settings.json.template api/local.settings.json
# Edit api/local.settings.json with your credentials
```

## Environment Variables Required

The following environment variables are needed:

- `DB_SERVER`: Your Azure SQL Server name
- `DB_NAME`: Your database name
- `DB_USER`: Database username
- `DB_PASSWORD`: Database password

For production deployment, these are set as GitHub Secrets and Azure Function App settings.
