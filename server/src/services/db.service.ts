import { QueryResult } from "mysql2";

import db, { poolPromise } from "../config/db";
import { Response } from "express";
import { Connection } from "mysql2/typings/mysql/lib/Connection";

export default class DatabaseService {
  // SQL injection risk in this function
  async insertData<T>(
    data: { [key: string]: T },
    table: string
  ): Promise<QueryResult | Error> {
    return new Promise(async function (resolve, reject) {
      try {
        //* Getting all the keys to insert as fields into table
        if (!data || typeof data !== "object") {
          return reject("Invalid data provided");
        }
        const keys = Object.keys(data).map((key) => {
          if (
            !data[key] ||
            data[key] === "" ||
            (typeof data[key] === "string" &&
              (data[key] as string).trim() === "")
          ) {
            return null;
          }
          return key;
        });

        //* Getting all the values to insert as values into table
        const values = Object.values(data)
          .map((value) => (typeof value === "string" ? `'${value}'` : value))
          .join(", ");
        // const placeholders = keys.map(() => '?').join(', ');
        const query = `INSERT INTO ${table} (${keys.join(
          ", "
        )}) VALUES (${values})`;
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
  async getAll(
    table: string,
    fields = "*",
    page = 1,
    limit = 1000,
    sort = "ASC",
    getDeleted?: boolean
  ): Promise<QueryResult | Error> {
    return new Promise(async function (resolve, reject) {
      try {
        const offset = (page - 1) * limit;
        let query = `SELECT ${fields} FROM ${table} ORDER BY createdAt ${sort} LIMIT ${limit} OFFSET ${offset}`;
        if (getDeleted === false)
          query = `SELECT ${fields} FROM ${table} WHERE isDeleted = ${false} ORDER BY createdAt ${sort} LIMIT ${limit} OFFSET ${offset}`;
        if (getDeleted)
          query = `SELECT ${fields} FROM ${table} WHERE isDeleted = ${true} ORDER BY createdAt ${sort} LIMIT ${limit} OFFSET ${offset}`;
        const [result] = await db.query<QueryResult>(query);
        return resolve(result);
      } catch (error) {
        return reject(error);
      }
    });
  }

  // common api service to get single( or can be multiple ) data dynamically from table.
  async getData<T>(
    table: string,
    whereKey: string,
    whereValue: T,
    fields = "*",
    page = 1,
    limit = 1000,
    sort = "ASC",
    getDeleted?: boolean
  ): Promise<QueryResult | Error> {
    return new Promise(async function (resolve, reject) {
      try {
        const extractedValue =
          typeof whereValue === "string" ? `'${whereValue}'` : whereValue;
        const offset = (page - 1) * limit;
        let query = `SELECT ${fields} FROM ${table} WHERE ${whereKey} = ${extractedValue} ORDER BY createdAt ${sort} LIMIT ${limit} OFFSET ${offset}`;
        if (getDeleted === false)
          query = `SELECT ${fields} FROM ${table} WHERE ${whereKey} = ${extractedValue} AND isDeleted = ${false} ORDER BY createdAt ${sort} LIMIT ${limit} OFFSET ${offset}`;
        if (getDeleted === true)
          query = `SELECT ${fields} FROM ${table} WHERE ${whereKey} = ${extractedValue} AND isDeleted = ${true} ORDER BY createdAt ${sort} LIMIT ${limit} OFFSET ${offset}`;
        const [result] = await db.query<QueryResult>(query);
        return resolve(result);
      } catch (error) {
        return reject(error);
      }
    });
  }

  // get count of rows in a table
  async getCount<T>(
    table: string,
    whereKey: string,
    whereValue: T,
    getDeleted?: boolean
  ): Promise<number | Error> {
    return new Promise(async function (resolve, reject) {
      try {
        const extractedValue =
          typeof whereValue === "string" ? `'${whereValue}'` : whereValue;
        let query = `SELECT COUNT(*) AS totalCount FROM ${table} WHERE ${whereKey} = ${extractedValue}`;
        if (getDeleted === false)
          query = `SELECT COUNT(*) AS totalCount FROM ${table} WHERE ${whereKey} = ${extractedValue} AND isDeleted = ${false}`;
        if (getDeleted === true)
          query = `SELECT COUNT(*) AS totalCount FROM ${table} WHERE ${whereKey} = ${extractedValue} AND isDeleted = ${true}`;
        const [rows] = (await db.query(query)) as any[];
        const totalCount = (rows[0] as { totalCount: number }).totalCount;
        return resolve(totalCount);
      } catch (error) {
        return reject(error);
      }
    });
  }

  // common api service to get single( or can be multiple ) data dynamically from table with two OR conditions.
  async getDataWithOrWhere<T>(
    table: string,
    whereKey: string,
    whereValue: T,
    orWhereKey: string,
    orWhereValue: T,
    fields = "*",
    getDeleted?: boolean
  ): Promise<QueryResult | Error> {
    return new Promise(async function (resolve, reject) {
      try {
        const extractedValue =
          typeof whereValue === "string" ? `'${whereValue}'` : whereValue;
        let query = `SELECT ${fields} FROM ${table} WHERE ${whereKey} = ${extractedValue} OR ${orWhereKey} = ${extractedValue}`;
        if (getDeleted === false)
          query = `SELECT ${fields} FROM ${table} WHERE ${whereKey} = ${extractedValue} OR ${orWhereKey} = ${extractedValue} AND isDeleted = ${false}`;
        if (getDeleted === true)
          query = `SELECT ${fields} FROM ${table} WHERE ${whereKey} = ${extractedValue} OR ${orWhereKey} = ${extractedValue} AND isDeleted = ${true}`;
        const [result] = await db.query<QueryResult>(query);
        return resolve(result);
      } catch (error) {
        return reject(error);
      }
    });
  }

  async softDelete<T>(
    table: string,
    whereKey: string,
    whereValue: T
  ): Promise<QueryResult | Error> {
    return new Promise(async function (resolve, reject) {
      try {
        const value =
          typeof whereValue === "string" ? `${whereValue}` : whereValue;
        const query = `UPDATE ${table} SET isDeleted = ${true} WHERE ${whereKey} = ${value}`;
        const [result] = await db.query(query);
        return resolve(result);
      } catch (error) {
        return reject(error);
      }
    });
  }

  async permanentDelete<T>(
    table: string,
    whereKey: string,
    whereValue: T
  ): Promise<QueryResult | Error> {
    return new Promise(async function (resolve, reject) {
      try {
        const value =
          typeof whereValue === "string" ? `${whereValue}` : whereValue;
        const query = `DELETE FROM ${table} WHERE ${whereKey} = ${value}`;
        const [result] = await db.query(query);
        return resolve(result);
      } catch (error) {
        return reject(error);
      }
    });
  }

  async update<T>(
    table: string,
    updateKey: string,
    updateValue: T,
    whereKey: string,
    whereValue: T
  ): Promise<QueryResult | Error> {
    return new Promise(async function (resolve, reject) {
      try {
        // const whereType = typeof whereValue;
        // const updateType = typeof updateValue;
        // const wValue = whereType === 'string' || whereType === 'number' ? `${whereValue}` : whereValue;
        // const uValue = typeof updateValue === 'string'  || updateType === 'number'  ? `${updateValue}` : updateValue;
        const query = `UPDATE ${table} SET ${updateKey} = '${updateValue}' WHERE ${whereKey} = '${whereValue}'`;
        const [result] = await db.query(query);
        return resolve(result);
      } catch (error) {
        return reject(error);
      }
    });
  }

  streamData<T>(table: string, whereKey: string, whereValue: T, res: Response) {
    const extractedValue =
      typeof whereValue === "string" ? `'${whereValue}'` : whereValue;
    const query = `SELECT * FROM ${table} WHERE ${whereKey} = ${extractedValue}`;

    // Create a read stream from the database
    poolPromise.getConnection(
      (err: any, connection: any) => {
        if (err) {
          console.error("Connection error:", err);
          res.status(500).json({ error: "Connection error" });
          return;
        }

        // Create a read stream from the query
        const stream = connection.query(query).stream();
        stream.on("data", <T>(row: T) => {
          // Process each row as it arrives
          res.write(JSON.stringify(row) + "\n");
        });
        // Pipe the stream to the response

        stream.on("end", () => {
          res.end();
          connection.release(); // Release the connection back to the pool
        });

        stream.on("error", (err: Error) => {
          console.error("Stream error:", err);
          res.status(500).json({ error: "Stream error" });
          connection.release(); // Ensure the connection is released even on error
        });
      }
    );
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
