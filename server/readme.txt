#To run migrations
1. First install required packages ex: npm install db-migrate db-migrate-mysql
2. Create a database.json file in the root of your project:
    {
        "dev": {
            "driver": "mysql",
            "host": "${DB_HOST}",
            "user": "${DB_USER}",
            "password": "${DB_PASSWORD}",
            "database": "${DB_NAME}"
        }
    }
3. Create a directory for your migrations: mkdir -p migrations
4. Initialize db-migrate: npx db-migrate init // This will create a migrations directory and a .db-migrate file
5. Create a new migration file using db-migrate: npx db-migrate create users --sql-file // This will create a new migration file in the migrations directory with two SQL files: one for the up migration and one for the down migration
6. Edit the SQL files created in the previous step.
    For the up migration (migrations/sqls/20220101000000-create-users-table-up.sql):
        CREATE TABLE Users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        );
7. For the down migration (migrations/sqls/20220101000000-create-users-table-down.sql): DROP TABLE Users;
8. Run the Migrations: npx db-migrate up 
    To roll back the migrations, use: npx db-migrate down
9. (Optional) Add a script to your package.json to run the migrations:
    "scripts": {
        "migrate": "db-migrate up",
        "migrate:down": "db-migrate down"
    }

Here is the complete setup:
Directory Structure
    project-root/
    │
    ├── migrations/
    │   └── 20220101000000-create-users-table.js
    │   └── sqls/
    │       └── 20220101000000-create-users-table-up.sql
    │       └── 20220101000000-create-users-table-down.sql
    │
    ├── src/
    │   └── config/
    │       └── database.ts
    │
    ├── .env
    ├── database.json
    ├── package.json
    └── tsconfig.json

Also create .env file
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=password
    DB_NAME=database_name

