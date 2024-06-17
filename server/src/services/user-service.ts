import { QueryResult } from 'mysql2';

import db from '../config/db';
import { ICountRow } from '../types/user.types';

export default class UserService {

    async isUserExist(emailOrUsername: string): Promise<boolean> {
        return new Promise(async function (resolve, reject) {
            try {
                // const query = 'SELECT COUNT(*) as count FROM Users WHERE email = ? OR username = ?';
                const query = 'SELECT COUNT(*) as count FROM Users WHERE email = ?';
                const [rows] = await db.query<QueryResult>(
                    query,
                    [emailOrUsername]
                );
                const count = (rows as ICountRow[])[0].count;
                return resolve(count > 0);
            } catch (error) {
                return reject(error);
            }
        });
    }

    async getUsersWithRole<T>(userId?: number, getDeleted = false): Promise<QueryResult | Error> {
        return new Promise(async (resolve, reject) => {
            try {
                // to get multiple 
                let query = `SELECT Users.id, Users.fullName, Users.email, Users.createdAt, Users.updatedAt, Users.isDeleted, Users.roleId, 
                Roles.id AS roleId, 
                Roles.name AS roleName, 
                Roles.normalized AS roleNormalized, 
                Roles.description AS roleDescription, 
                Roles.grants AS roleGrants 
                FROM Users JOIN Roles ON Users.roleId = Roles.id WHERE isDeleted = ${getDeleted}
            `;
                if (userId) { // to get single user
                    query = `SELECT Users.id, Users.fullName, Users.email, Users.createdAt, Users.updatedAt, Users.isDeleted, Users.roleId, 
                Roles.id AS roleId, 
                Roles.name AS roleName, 
                Roles.normalized AS roleNormalized, 
                Roles.description AS roleDescription, 
                Roles.grants AS roleGrants 
                FROM Users JOIN Roles ON Users.roleId = Roles.id WHERE Users.id = ${userId} AND isDeleted = ${getDeleted}
            `;
                }
                const [result] = await db.query<QueryResult>(query);
                return resolve(result);
            } catch (error) {
                return reject(error);
            }
        });
    }

    // async signup(email: string, password: string, fullName: string): Promise<QueryResult | Error> {
    //     return new Promise(async (resolve, reject) => {
    //         // check if user doesn't exists already.
    //         if (!await this.databaseService.isUserExist(email)) {
    //             try {
    //                 const hashedPassword = await bcrypt.hash(password, 10);
    //                 const query = 'INSERT INTO Users (email, password, fullName) VALUES (?, ?, ?)'
    //                 const [result] = await db.query<QueryResult>(
    //                     query,
    //                     [email, hashedPassword, fullName]
    //                 );
    //                 return resolve(result);
    //             } catch (error) {
    //                 return reject(error);
    //             }
    //         }
    //         else return reject('User with this email exists already, Please try with different one.');
    //     })
    // }

    // async login(email: string, password: string): Promise<IUserWithoutPassword | Error> {
    //     return new Promise(async (resolve, reject) => {
    //         try {
    //             const [rows] = await db.query<IUser[]>('SELECT * FROM Users WHERE email = ?', [email]);
    //             const user = rows[0];

    //             if (user && await bcrypt.compare(password, user.password)) {
    //                 user.token = await this.jwtHelper.generateJwt(user.id, user.email);
    //                 const { password, ...userWithoutPassword } = user;
    //                 return resolve(userWithoutPassword as IUserWithoutPassword);
    //             }
    //             else {
    //                 return reject('No user found.');
    //             }
    //         } catch (error) {
    //             return reject(error);
    //         }
    //     })
    // }
}