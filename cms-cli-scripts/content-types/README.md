# Content Type Migrations

Modular migration scripts for Contentful content model.

## Usage

```bash
npm run migrate  # Create all content types
npm run seed     # Populate sample data
```


## Troubleshooting

- **Content type exists**: Migration uses `createContentType()`. Delete existing types first.
- **Field not showing**: Run migration, refresh Contentful UI.
- **Validation errors**: Check slug pattern and rating range (1-5).
```

