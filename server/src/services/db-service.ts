import db from '../config/db';

export default class DatabaseService {
    async isUserExist(emailOrUsername: string) {
        return new Promise(async function (resolve, reject) {
            try {
                // const query = 'SELECT COUNT(*) as count FROM Users WHERE email = ? OR username = ?';
                const query = 'SELECT COUNT(*) as count FROM Users WHERE email = ?';
                const [rows] = await db.query(
                    query,
                    [emailOrUsername, emailOrUsername]
                );
                const count = (rows as any)[0].count;
                return resolve(count > 0);
            } catch (error) {
                return reject(error);
            }
        });
    }
}