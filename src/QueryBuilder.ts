const { Model } = require('./Model');
const { Database } = require('./Database');
const { Collection } = require('./Collection');
const { Helper } = require('./Helper');

/**
 * Builds SQL queries for models.
 */
export class QueryBuilder {
    private model: typeof Model;
    private columns: string[] = [];
    private whereClauses: { column: string; operator: string; value: any }[] = [];
    private orderByClause: { column: string, direction: string } = { column: '', direction: '' };
    private connection: any;

    constructor(model: any) {
        this.model = model;
        this.orderByClause = { column: this.model.primaryKey, direction: 'ASC' };
        this.connection = new Database();
    }

    /**
     * Select columns
     * @param columns Columns to select.
     * @returns QueryBuilder
     */
    public select(...columns: string[]): this {
        this.columns.push(...columns);
        return this;
    }

    /**
     * Add a WHERE clause to the query.
     * @param column The column to check on
     * @param [operator] The operator to use
     * @param value The value to check against
     * @returns QueryBuilder
     */
    public where(column: string, operator: any, value?: any): this {
        if (!value && operator) {
            value = operator;
            operator = '=';
        }

        if ((['IN']).includes(operator)) {
            // Nothing
        } else if (value) {
            value = `'${value}'`;
        } else {
            value = 'IS NULL';
        }

        this.whereClauses.push({ column, operator, value });

        return this;
    }

    /**
     * Where clause to check for null values
     * @param column The column to check on
     * @returns QueryBuilder
     */
    public whereNull(column: string): this {
        return this.where(column, null);
    }

    /**
     * Convenience method for the inverse of where()
     * @param column The column to check on
     * @param value The value to check against
     * @returns QueryBuilder
     */
    public whereNot(column: string, value: any): this {
        return this.where(column, '<>', `'${value}'`);
    }

    /**
     * Convenience method for where(column, 'IN', values)
     * @param column The column to check on
     * @param values The values to check against
     * @returns QueryBuilder
     */
    public whereIn(column: string, values: any[]): this {
        values.map(value => `'${value}'`);
        return this.where(column, 'IN', `(${values.join(', ')})`);
    }

    /**
     * 
     * @param column The column to order by
     * @param direction The direction to order in
     * @returns QueryBuilder
     */
    public orderBy(column: string, direction: string = 'asc'): this {
        if (!['asc', 'desc'].includes(direction.toLowerCase())) throw new Error('Invalid ordering direction');

        this.orderByClause = { column, direction };
        return this;
    }

    public get(): Promise<typeof Collection> {
        return new Promise((resolve, reject) => {
            if (!this.columns.length) this.columns.push('*');
            let sql = `SELECT ${this.columns.join(', ')} FROM ${this.model.getTable()}`;

            if (this.model.softDeletes) {
                this.whereNull('deleted_at');
            }

            if (this.whereClauses.length) {
                sql += ' WHERE ' + this.whereClauses.map(clause => {
                    return `\`${clause.column}\` ${clause.operator ?? ''} ${clause.value}`;
                }).join(' AND ');
            }

            sql += ` ORDER BY ${this.orderByClause.column} ${this.orderByClause.direction}`;

            this.connection.query(sql).then((result: any) => {
                let models = new Collection();
                result.forEach((row: any) => {
                    let attributes = {};

                    attributes[this.model.primaryKey] = row[this.model.primaryKey]; // Always pass primary key

                    Object.keys(row).forEach((key: any) => {
                        if (this.model.fillable.indexOf(key) != -1) {
                            attributes[key] = row[key];
                        }
                    });

                    if (row.hasOwnProperty('created_at'))
                        attributes['created_at'] = Helper.dateTimeFormat(row['created_at']);

                    if (row.hasOwnProperty('updated_at'))
                        attributes['updated_at'] = Helper.dateTimeFormat(row['updated_at']);

                    models.push(this.model.constructor.newInstance(attributes));
                });

                resolve(models);

            }).catch((err: any) => {
                reject(err);
                throw new Error(err);
            });
        });
    }
}