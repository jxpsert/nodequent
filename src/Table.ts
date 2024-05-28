import { Database } from './Database';
import { Column } from './Column';
const db = new Database();

/**
 * Table class
 * Comparable to a Schema in Laravel migrations
 */
export class Table {
    private tableName: string;
    private columns: Column[] = [];

    private columnsThatNeedLength = ['varchar'];
    private columnsThatCanAutoIncrement = ['integer'];

    /**
     * Create a new instance of the Table class.
     * @param tableName The name of the table.
     * @return void
     */
    constructor(tableName: string) {
        this.tableName = tableName;
    }

    /**
     * Add a string column to the table.
     * @param name The name of the column.
     */
    public string(name: string, length: number = 255): Column {
        const column = new Column(name, 'VARCHAR');
        column.length(length);
        this.columns.push(column);
        return column;
    }

    /**
     * Add an integer column to the table.
     * @param name The name of the column.
     */
    public integer(name: string): Column {
        const column = new Column(name, 'INTEGER');
        this.columns.push(column);
        return column;
    }


    /**
     * Create the query to create the table.
     * @returns 
     */
    private createQuery(): string {
        let query = `CREATE TABLE IF NOT EXISTS ${this.tableName} (`;
        let primaryKey = null;

        this.columns.forEach((column, index) => {
            query += `\`${column.name}\` ${column.type}`;

            if (this.columnsThatNeedLength.includes(column.type.toLowerCase()) && column.columnLength) {
                query += `(${column.columnLength})`;
            }

            if (this.columnsThatCanAutoIncrement.includes(column.type.toLowerCase()) && column.autoIncrementing) {
                query += ' AUTO_INCREMENT';
            }

            if (column.uniqueKey) {
                query += ' UNIQUE';
            }

            if (!column.isNullable && !column.primaryKey) {
                query += ' NOT NULL';
            }

            if (index < this.columns.length - 1) {
                query += ', ';
            }

            if (column.primaryKey) {
                primaryKey = column.name;
            }
        });

        if (primaryKey) {
            query += `, PRIMARY KEY (\`${primaryKey}\`)`;
        }

        query += ')';

        return query;
    }

    /**
     * Create the table in the database
     */
    public create() {
        const query = this.createQuery();

        try {
            db.query(query);
        } catch (error) {
            throw new Error(error);
        }
    }

    /**
     * Create the table in the database, dropping the table if it exists
     * Dangerous!
     */
    public forceCreate() {
        const dropQuery = `DROP TABLE IF EXISTS ${this.tableName}`;
        try {
            db.query(dropQuery);
        } catch (error) {
            throw new Error(error);
        }

        const query = this.createQuery().replace('IF NOT EXISTS', '');
        try {
            db.query(query);
        } catch (error) {
            throw new Error(error);
        }
    }

    /**
     * Drop the table from the database
     */
    public drop() {
        const query = `DROP TABLE IF EXISTS ${this.tableName}`;
        try {
            db.query(query);
        } catch (error) {
            throw new Error(error);
        }
    }

    /**
     * Find a table by name; returns null if not found
     * @param name 
     */
    public static find(name: string): Promise<Table | null> {
        return db.query(`SELECT * FROM information_schema.tables WHERE table_name = '${name}'`).then((result: any) => {
            if (result.length) {
                return new Table(name);
            }
            return null;
        });
    }

}