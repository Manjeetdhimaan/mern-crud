import bcrypt from 'bcryptjs';
import { QueryResult } from 'mysql2';

import db from '../config/db';
import DatabaseService from './db-service';
import JwtHelper from '../middlewares/jwt-helper';

export default class UserService {
    databaseService = new DatabaseService();
    jwtHelper = new JwtHelper();
    async signup(email: string, password: string, fullName: string): Promise<QueryResult | Error> {
        return new Promise(async (resolve, reject) => {
            // check if user doesn't exists already.
            if (!await this.databaseService.isUserExist(email)) {
                try {
                    const hashedPassword = await bcrypt.hash(password, 10);
                    const query = 'INSERT INTO Users (email, password, fullName) VALUES (?, ?, ?)'
                    const [result] = await db.query(
                        query,
                        [email, hashedPassword, fullName]
                    );
                    return resolve(result);
                } catch (error) {
                    return reject(error);
                }
            }
            else return reject('User with this email exists already, Please try with different one.');
        })
    }

    async login(email: string, password: string): Promise<QueryResult | Error> {
        return new Promise(async (resolve, reject) => {
            try {
                const [rows] = await db.query('SELECT * FROM Users WHERE email = ?', [email]);
                const user = (rows as any[])[0];

                if (user && await bcrypt.compare(password, user.password)) {
                    user.token = await this.jwtHelper.generateJwt(user.id, user.email);
                    const { password, ...userWithoutPassword } = user;
                    return resolve(userWithoutPassword);
                }
                else {
                    return reject('No user found.');
                }
            } catch (error) {
                return reject(error);
            }
        })
    }

    async getUsers(page = 1, limit = 10): Promise<QueryResult | Error> {
        return new Promise(async (resolve, reject) => {
            try {
                const offset = (page - 1) * limit;
                const query = 'SELECT id, email, fullName, createdAt, updatedAt FROM Users LIMIT ? OFFSET ?';
                const [result] = await db.query(
                    query,
                    [limit, offset]
                );
                return resolve(result);
            } catch (error) {
                return reject(error);
            }
        })
    }
}