import crypto from "crypto";
import { v4 } from "uuid";

export default function generateObjectId() {
    return crypto.randomBytes(12).toString('hex');
}

export function generateUUID() {
    return v4();
}

// let id;
// let isUnique = false;
// while (!isUnique) {
//     id = generateUUID();
//     const [rows] = await db.query('SELECT COUNT(*) AS count FROM Messages WHERE id = ?', [id]);
//     if (rows[0].count === 0) {
//         isUnique = true;
//     }
// }