# Models Layer

For the file-based database phase, schema validation and operations are managed inside `src/services/storageService.js` and standard payload validations are registered under `src/validators/`.

When migrating to databases such as MongoDB or PostgreSQL, this directory will house:
- Mongoose Schemas/Models (for MongoDB)
- Sequelize/Prisma Models (for SQL)
