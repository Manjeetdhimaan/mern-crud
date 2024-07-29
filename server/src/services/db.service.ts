import { QueryResult } from 'mysql2';

import db from '../config/db';

export default class DatabaseService {
    // SQL injection risk in this function
    async insertData<T>(data: { [key: string]: T }, table: string): Promise<QueryResult | Error> {
        return new Promise(async function (resolve, reject) {
            try {
                //* Getting all the keys to insert as fields into table
                if (!data || typeof data !== 'object') {
                    return reject('Invalid data provided');
                }
                const keys = Object.keys(data).map((key) => {
                    if (!data[key] || data[key] === '' || (typeof data[key] === 'string' && (data[key] as string).trim() === '')) {
                        return null;
                    }
                    return key;
                });

                //* Getting all the values to insert as values into table
                const values = Object.values(data).map(value => typeof value === 'string' ? `'${value}'` : value).join(', ');
                // const placeholders = keys.map(() => '?').join(', ');
                const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${values})`;
                const [result] = await db.query<QueryResult>(
                    query
                    // values
                );
                // manjeetdhimaan60@gmail.com
                return resolve(result);
            } catch (error) {
                return reject(error);
            }
        });
    }

    // Minimum SQL injection risk with improved logic
     // async insertData<T>(data: { [key: string]: T }, table: string): Promise<QueryResult | Error> {
    //     return new Promise(async function (resolve, reject) {
    //         try {
    //             //* Getting all the keys to insert as fields into table
    //             if (!data || typeof data !== 'object') {
    //                 return reject('Invalid data provided');
    //             }
    //             const keys = Object.keys(data).map((key) => {
    //                 if (!data[key] || data[key] === '' || (typeof data[key] === 'string' && (data[key] as string).trim() === '')) {
    //                     return null;
    //                 }
    //                 return key;
    //             });

    //             //* Getting all the values to insert as values into table
    //             const values = Object.values(data).map(value => typeof value === 'string' ? `'${value}'` : value).join(', ');
    //             const placeholders = keys.map((_, index) => `$${index + 1}`).join(', ');
    //             const query = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
    //             const [result] = await db.query<QueryResult>(
    //                 query,
    //                 values
    //             );
    //             return resolve(result);
    //         } catch (error) {
    //             return reject(error);
    //         }
    //     });
    // }

    // common api service to get data dynamically from table.
    async getAll(table: string, fields = "*", page = 1, limit = 1000, getDeleted?: boolean): Promise<QueryResult | Error> {
        return new Promise(async function (resolve, reject) {
            try {
                const offset = (page - 1) * limit;
                let query = `SELECT ${fields} FROM ${table} LIMIT ${limit} OFFSET ${offset}`;
                if (getDeleted === false) query = `SELECT ${fields} FROM ${table} WHERE isDeleted = ${false} LIMIT ${limit} OFFSET ${offset}`;
                if (getDeleted) query = `SELECT ${fields} FROM ${table} WHERE isDeleted = ${true} LIMIT ${limit} OFFSET ${offset}`;
                const [result] = await db.query<QueryResult>(
                    query
                );
                return resolve(result);
            } catch (error) {
                return reject(error);
            }
        })
    }

    // common api service to get single( or can be multiple ) data dynamically from table.
    async getData<T>(table: string, whereKey: string, whereValue: T, fields = "*", getDeleted?: boolean): Promise<QueryResult | Error> {
        return new Promise(async function (resolve, reject) {
            try {
                const extractedValue = typeof whereValue === 'string' ? `'${whereValue}'` : whereValue;
                let query = `SELECT ${fields} FROM ${table} WHERE ${whereKey} = ${extractedValue}`;
                if (getDeleted === false) query = `SELECT ${fields} FROM ${table} WHERE ${whereKey} = ${extractedValue} AND isDeleted = ${false}`;
                if (getDeleted === true) query = `SELECT ${fields} FROM ${table} WHERE ${whereKey} = ${extractedValue} AND isDeleted = ${true}`;
                const [result] = await db.query<QueryResult>(query);
                return resolve(result);
            } catch (error) {
                return reject(error);
            }
        });
    }

        // common api service to get single( or can be multiple ) data dynamically from table.
        async getDataWithOrWhere<T>(table: string, whereKey: string, whereValue: T, orWhereKey: string, orWhereValue: T, fields = "*", getDeleted?: boolean): Promise<QueryResult | Error> {
            return new Promise(async function (resolve, reject) {
                try {
                    const extractedValue = typeof whereValue === 'string' ? `'${whereValue}'` : whereValue;
                    // const extractedORValue = typeof orWhereValue === 'string' ? `'${orWhereValue}'` : orWhereValue;
                    let query = `SELECT ${fields} FROM ${table} WHERE ${whereKey} = ${extractedValue} OR ${orWhereKey} = ${extractedValue}`;
                    if (getDeleted === false) query = `SELECT ${fields} FROM ${table} WHERE ${whereKey} = ${extractedValue} OR ${orWhereKey} = ${extractedValue} AND isDeleted = ${false}`;
                    if (getDeleted === true) query = `SELECT ${fields} FROM ${table} WHERE ${whereKey} = ${extractedValue} OR ${orWhereKey} = ${extractedValue} AND isDeleted = ${true}`;
                    const [result] = await db.query<QueryResult>(query);
                    return resolve(result);
                } catch (error) {
                    return reject(error);
                }
            });
        }

    async softDelete<T>(table: string, whereKey: string, whereValue: T): Promise<QueryResult | Error> {
        return new Promise(async function (resolve, reject) {
            try {
                const value = typeof whereValue === 'string' ? `${whereValue}` : whereValue;
                const query = `UPDATE ${table} SET isDeleted = ${true} WHERE ${whereKey} = ${value}`;
                const [result] = await db.query(query);
                return resolve(result);
            } catch (error) {
                return reject(error);
            }
        });
    }

    async permanentDelete<T>(table: string, whereKey: string, whereValue: T): Promise<QueryResult | Error> {
        return new Promise(async function (resolve, reject) {
            try {
                const value = typeof whereValue === 'string' ? `${whereValue}` : whereValue;
                const query = `DELETE FROM ${table} WHERE ${whereKey} = ${value}`;
                const [result] = await db.query(query);
                return resolve(result);
            } catch (error) {
                return reject(error);
            }
        });
    }
}
