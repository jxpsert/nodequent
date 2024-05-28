const mysql = require('mysql');
const Logger = require('./Logger');

/**
 * Database class to handle database connections and interactions.
 */
export class Database {
    private connection: any = null;

    private static dbSettings: { host: string, user: string, password: string, database: string };

    /**
     * Create a new instance of the Database class.
     * @param options The options to use for the database connection.
     * @return void
     */
    constructor(options?: any) {
        if ((options && !options.host) && !process.env.DB_HOST) {
            throw new Error('Database connection impossible: no host provided');
        }

        if (options) {
            this.connection = mysql.createConnection({
                host: options.host,
                user: options.user,
                password: options.password,
                database: options.database
            });
        }
    }

    /**
     * Set the default database options. Mainly for the init function.
     * @param options 
     */
    public static setOptions(options: { host: string, user: string, password: string, database: string }) {
        this.dbSettings = options;
    };

    /**
     * Connect to the database.
     * @return void
     */
    public connect() {
        if (this.connection == null) {
            if (Database.dbSettings) {
                this.connection = mysql.createConnection({
                    host: Database.dbSettings.host,
                    user: Database.dbSettings.user,
                    password: Database.dbSettings.password,
                    database: Database.dbSettings.database
                });
            } else {
                this.connection = mysql.createConnection({
                    host: process.env.DB_HOST,
                    user: process.env.DB_USER,
                    password: process.env.DB_PASS,
                    database: process.env.DB_NAME
                });
            }

            this.connection.connect((err: any) => {
                if (err) {
                    throw new Error(err);
                    return;
                }
            });
        }
    }

    /**
     * Disconnect from the database.
     * @return void
     */
    public disconnect() {
        this.connection.end();
    }

    public query(sql: string) {
        this.connect();

        return new Promise((resolve, reject) => {
            this.connection.query(sql, (err: any, result: any) => {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        });
    }
}