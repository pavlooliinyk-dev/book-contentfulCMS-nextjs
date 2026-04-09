# Content Type Migrations

This directory contains the Contentful migration scripts organized by content type.

## Structure

```
cli-scripts/
├── migration.js              # Main migration entry point (single source of truth)
└── content-types/            # Individual content type definitions
    ├── taxonomyTerm.js       # TaxonomyTerm content type
    ├── author.js             # Author content type
    ├── book.js               # Book content type
    └── homePage.js           # HomePage content type
```

## Usage

Run the migration to create all content types from scratch:

```bash
npm run migrate
```

Or directly with Contentful CLI:

```bash
contentful space migration cli-scripts/migration.js
```

## What This Migration Does

Creates all content types from scratch in a fresh Contentful space:

