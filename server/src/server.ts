import app from './app';
import db from './config/db';

(function server() {
    const port = process.env['SERVER_PORT'] || 4002;
    app.listen(port, async () => {
        try {
            console.log(`Node server running on port ${port}`);
            await db.getConnection();
            // const query = `
            // DESCRIBE Users`;
            // const res = await db.query(query);
            // console.log(res);
            console.log('Database connection succeeded');
        } catch (error) {
            console.log('Error connecting to mysql database', error);
        }
    });
})();