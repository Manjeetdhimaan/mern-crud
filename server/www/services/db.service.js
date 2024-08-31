"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = __importStar(require("../config/db"));
class DatabaseService {
    async insertData(data, table) {
        return new Promise(async function (resolve, reject) {
            try {
                //* Getting all the keys to insert as fields into table
                if (!data || typeof data !== "object") {
                    return reject("Invalid data provided");
                }
                const keys = Object.keys(data).map((key) => {
                    if (!data[key] ||
                        data[key] === "" ||
                        (typeof data[key] === "string" &&
                            data[key].trim() === "")) {
                        return null;
                    }
                    return key;
                });
                //* Getting all the values to insert as values into table
                // const values = Object.values(data)
                //   .map((value) => (typeof value === "string" ? `'${value}'` : value))
                //   .join(", ");
                const values = Object.values(data);
                const query = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${new Array(values.length).fill('?')})`;
                const [result] = await db_1.default.query(query, values);
                // manjeetdhimaan60@gmail.com
                return resolve(result);
            }
            catch (error) {
                return reject(error);
            }
        });
    }
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
    async getAll(table, fields = "*", page = 1, limit = 1000, sort = "ASC", search, getDeleted) {
        return new Promise(async function (resolve, reject) {
            try {
                const offset = (page - 1) * limit;
                let query = `SELECT ${fields} FROM ${table} ORDER BY createdAt ${sort} LIMIT ${limit} OFFSET ${offset}`;
                if (search && search.trim()) {
                    query = `SELECT ${fields} FROM ${table} WHERE fullName LIKE '%${search ? search : ''}%' OR email LIKE '%${search ? search : ''}%' ORDER BY createdAt ${sort} LIMIT ${limit} OFFSET ${offset}`;
                }
                if (getDeleted === false && search && search.trim()) {
                    query = `SELECT ${fields} FROM ${table} WHERE isDeleted = ${false} AND fullName LIKE '%${search}%' OR email LIKE '%${search}%' ORDER BY createdAt ${sort} LIMIT ${limit} OFFSET ${offset}`;
                }
                if (getDeleted === false && !search) {
                    query = `SELECT ${fields} FROM ${table} WHERE isDeleted = ${false} ORDER BY createdAt ${sort} LIMIT ${limit} OFFSET ${offset}`;
                }
                if (getDeleted && search && search.trim()) {
                    query = `SELECT ${fields} FROM ${table} WHERE isDeleted = ${true} AND fullName LIKE '%${search}%' OR email LIKE '%${search}%' ORDER BY createdAt ${sort} LIMIT ${limit} OFFSET ${offset}`;
                }
                if (getDeleted && !search) {
                    query = `SELECT ${fields} FROM ${table} WHERE isDeleted = ${true} ORDER BY createdAt ${sort} LIMIT ${limit} OFFSET ${offset}`;
                }
                const [result] = await db_1.default.query(query);
                return resolve(result);
            }
            catch (error) {
                return reject(error);
            }
        });
    }
    // common api service to get single( or can be multiple ) data dynamically from table.
    async getData(table, whereKey, whereValue, fields = "*", page = 1, limit = 1000, sort = "ASC", getDeleted) {
        return new Promise(async function (resolve, reject) {
            try {
                const extractedValue = typeof whereValue === "string" ? `'${whereValue}'` : whereValue;
                const offset = (page - 1) * limit;
                let query = `SELECT ${fields} FROM ${table} WHERE ${whereKey} = ${extractedValue} ORDER BY createdAt ${sort} LIMIT ${limit} OFFSET ${offset}`;
                if (getDeleted === false)
                    query = `SELECT ${fields} FROM ${table} WHERE ${whereKey} = ${extractedValue} AND isDeleted = ${false} ORDER BY createdAt ${sort} LIMIT ${limit} OFFSET ${offset}`;
                if (getDeleted === true)
                    query = `SELECT ${fields} FROM ${table} WHERE ${whereKey} = ${extractedValue} AND isDeleted = ${true} ORDER BY createdAt ${sort} LIMIT ${limit} OFFSET ${offset}`;
                const [result] = await db_1.default.query(query);
                return resolve(result);
            }
            catch (error) {
                return reject(error);
            }
        });
    }
    // get count of rows in a table
    async getCount(table, whereKey, whereValue, getDeleted) {
        return new Promise(async function (resolve, reject) {
            try {
                const extractedValue = typeof whereValue === "string" ? `'${whereValue}'` : whereValue;
                let query = `SELECT COUNT(*) AS totalCount FROM ${table} WHERE ${whereKey} = ${extractedValue}`;
                if (getDeleted === false)
                    query = `SELECT COUNT(*) AS totalCount FROM ${table} WHERE ${whereKey} = ${extractedValue} AND isDeleted = ${false}`;
                if (getDeleted === true)
                    query = `SELECT COUNT(*) AS totalCount FROM ${table} WHERE ${whereKey} = ${extractedValue} AND isDeleted = ${true}`;
                const [rows] = (await db_1.default.query(query));
                const totalCount = rows[0].totalCount;
                return resolve(totalCount);
            }
            catch (error) {
                return reject(error);
            }
        });
    }
    // common api service to get single( or can be multiple ) data dynamically from table with two OR conditions.
    async getDataWithOrWhere(table, conditions, // Array of conditions
    fields = "*", getDeleted) {
        return new Promise(async function (resolve, reject) {
            try {
                // Map over conditions and build dynamic OR clause
                const whereClause = conditions
                    .map(condition => {
                    const extractedValue = typeof condition.value === "string"
                        ? `'${condition.value}'`
                        : condition.value;
                    return `${condition.key} = ${extractedValue}`;
                })
                    .join(" OR ");
                // Build the main query
                let query = `SELECT ${fields} FROM ${table} WHERE ${whereClause}`;
                // Handle isDeleted condition
                if (getDeleted === false) {
                    query += " AND isDeleted = false";
                }
                else if (getDeleted === true) {
                    query += " AND isDeleted = true";
                }
                const [result] = await db_1.default.query(query);
                return resolve(result);
            }
            catch (error) {
                return reject(error);
            }
        });
    }
    // async getDataWithOrWhere<T>(
    //   table: string,
    //   whereKey: string,
    //   whereValue: T,
    //   orWhereKey: string,
    //   orWhereValue: T,
    //   fields = "*",
    //   getDeleted?: boolean
    // ): Promise<QueryResult | Error> {
    //   return new Promise(async function (resolve, reject) {
    //     try {
    //       const extractedWhereValue =
    //         typeof whereValue === "string" ? `'${whereValue}'` : whereValue;
    //       const extractedOrWhereValue =
    //         typeof orWhereValue === "string" ? `'${orWhereValue}'` : orWhereValue;
    //       let query = `SELECT ${fields} FROM ${table} WHERE ${whereKey} = ${extractedWhereValue} OR ${orWhereKey} = ${extractedOrWhereValue}`;
    //       if (getDeleted === false)
    //         query = `SELECT ${fields} FROM ${table} WHERE ${whereKey} = ${extractedWhereValue} OR ${orWhereKey} = ${extractedOrWhereValue} AND isDeleted = ${false}`;
    //       if (getDeleted === true)
    //         query = `SELECT ${fields} FROM ${table} WHERE ${whereKey} = ${extractedWhereValue} OR ${orWhereKey} = ${extractedOrWhereValue} AND isDeleted = ${true}`;
    //       const [result] = await db.query<QueryResult>(query);
    //       return resolve(result);
    //     } catch (error) {
    //       return reject(error);
    //     }
    //   });
    // }
    async softDelete(table, whereKey, whereValue) {
        return new Promise(async function (resolve, reject) {
            try {
                const value = typeof whereValue === "string" ? `${whereValue}` : whereValue;
                const query = `UPDATE ${table} SET isDeleted = ${true} WHERE ${whereKey} = ${value}`;
                const [result] = await db_1.default.query(query);
                return resolve(result);
            }
            catch (error) {
                return reject(error);
            }
        });
    }
    async permanentDelete(table, whereKey, whereValue) {
        return new Promise(async function (resolve, reject) {
            try {
                const value = typeof whereValue === "string" ? `'${whereValue}'` : whereValue;
                const query = `DELETE FROM ${table} WHERE ${whereKey} = ${value}`;
                const [result] = await db_1.default.query(query);
                return resolve(result);
            }
            catch (error) {
                return reject(error);
            }
        });
    }
    // async update<T>(
    //   table: string,
    //   updateKey: string,
    //   updateValue: T,
    //   whereKey: string,
    //   whereValue: T,
    //   secondUpdateKey?: string,
    //   secondUpdateValue?: T,
    //   thirdUpdateKey?: string,
    //   thirdUpdateValue?: T,
    //   fourthUpdateKey?: string,
    //   fourthUpdateValue?: T,
    // ): Promise<QueryResult | Error> {
    //   return new Promise(async function (resolve, reject) {
    //     try {
    //       const updateValueEscaped = typeof updateValue === "string" ? (updateValue as string).replace(/'/g, "\\'") : updateValue;
    //       let query = `UPDATE ${table} SET ${updateKey} = '${updateValueEscaped}' WHERE ${whereKey} = '${whereValue}'`;
    //       if (secondUpdateKey) {
    //         const secondUpdateValueEscaped = typeof secondUpdateValue === "string" ? (secondUpdateValue as string).replace(/'/g, "\\'") : secondUpdateValue;
    //         query = `UPDATE ${table} SET ${updateKey} = '${updateValueEscaped}', ${secondUpdateKey} = '${secondUpdateValueEscaped}'  WHERE ${whereKey} = '${whereValue}'`;
    //       }
    //       if (thirdUpdateKey) {
    //         const secondUpdateValueEscaped = typeof secondUpdateValue === "string" ? (secondUpdateValue as string).replace(/'/g, "\\'") : secondUpdateValue;
    //         const thirdUpdateValueEscaped = typeof thirdUpdateValue === "string" ? (thirdUpdateValue as string).replace(/'/g, "\\'") : thirdUpdateValue;
    //         query = `UPDATE ${table} SET ${updateKey} = '${updateValueEscaped}', ${secondUpdateKey} = '${secondUpdateValueEscaped}', ${thirdUpdateKey} = '${thirdUpdateValueEscaped}'  WHERE ${whereKey} = '${whereValue}'`;
    //       }
    //       if (fourthUpdateKey) {
    //         const secondUpdateValueEscaped = typeof secondUpdateValue === "string" ? (secondUpdateValue as string).replace(/'/g, "\\'") : secondUpdateValue;
    //         const thirdUpdateValueEscaped = typeof thirdUpdateValue === "string" ? (thirdUpdateValue as string).replace(/'/g, "\\'") : thirdUpdateValue;
    //         const fourthUpdateValueEscaped = typeof fourthUpdateValue === "string" ? (fourthUpdateValue as string).replace(/'/g, "\\'") : fourthUpdateValue;
    //         query = `UPDATE ${table} SET ${updateKey} = '${updateValueEscaped}', ${secondUpdateKey} = '${secondUpdateValueEscaped}', ${thirdUpdateKey} = '${thirdUpdateValueEscaped}', ${fourthUpdateKey} = '${fourthUpdateValueEscaped}'  WHERE ${whereKey} = '${whereValue}'`;
    //       }
    //       const [result] = await db.query(query);
    //       return resolve(result);
    //     } catch (error) {
    //       return reject(error);
    //     }
    //   });
    // }
    async update(table, updateValues, // Object containing columns and values to update
    whereKey, whereValue) {
        return new Promise(async function (resolve, reject) {
            try {
                // Construct the SET clause dynamically
                const setClause = Object.keys(updateValues)
                    .map(key => {
                    const value = updateValues[key];
                    const escapedValue = typeof value === "string" ? value.replace(/'/g, "\\'") : value;
                    return `${key} = '${escapedValue}'`;
                })
                    .join(", ");
                // Construct the full query
                const query = `UPDATE ${table} SET ${setClause} WHERE ${whereKey} = '${whereValue}'`;
                const [result] = await db_1.default.query(query);
                return resolve(result);
            }
            catch (error) {
                return reject(error);
            }
        });
    }
    streamData(table, whereKey, whereValue, res) {
        const extractedValue = typeof whereValue === "string" ? `'${whereValue}'` : whereValue;
        const query = `SELECT * FROM ${table} WHERE ${whereKey} = ${extractedValue}`;
        // Create a read stream from the database
        db_1.poolPromise.getConnection((err, connection) => {
            if (err) {
                console.error("Connection error:", err);
                res.status(500).json({ error: "Connection error" });
                return;
            }
            // Create a read stream from the query
            const stream = connection.query(query).stream();
            stream.on("data", (row) => {
                // Process each row as it arrives
                res.write(JSON.stringify(row) + "\n");
            });
            // Pipe the stream to the response
            stream.on("end", () => {
                res.end();
                connection.release(); // Release the connection back to the pool
            });
            stream.on("error", (err) => {
                console.error("Stream error:", err);
                res.status(500).json({ error: "Stream error" });
                connection.release(); // Ensure the connection is released even on error
            });
        });
        // const stream = connection.query(query).stream();
        // Handle data chunk by chunk
        // stream.on("data", <T>(row: T) => {
        //   // Process each row as it arrives
        //   res.write(JSON.stringify(row) + "\n");
        // });
        // stream.on("end", () => {
        //   // End the response when the stream ends
        //   res.end();
        // });
        // stream.on("error", (err: Error) => {
        //   // Handle any errors that occur during streaming
        //   console.error("Stream error:", err);
        //   res.status(500).json({ error: "Stream error" });
        // });
    }
}
exports.default = DatabaseService;
