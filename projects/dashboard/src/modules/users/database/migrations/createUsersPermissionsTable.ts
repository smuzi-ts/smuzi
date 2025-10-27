import {Migration} from "@smuzi/database";

export default new Migration(
{
    up() {
        return `
            CREATE TABLE IF NOT EXISTS users_permissions (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(150) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`
    },
   down() {
       return 'DROP TABLE IF EXISTS users_permissions;';
   }
})