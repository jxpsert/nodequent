import { QueryBuilder } from './QueryBuilder';
import { Database } from './Database';
import { Collection } from './Collection';

/**
 * Base class for all models.
 */
export class Model {

    /**
     * @var string The table associated with the model.
     */
    protected table: string;

    /**
     * @var string The primary key for the model.
     */
    protected primaryKey: string = 'id';

    /**
     * @var string The type of the primary key.
     */
    protected keyType: string = 'int';

    /**
     * @var string[] The attributes that are mass assignable.
     */
    protected fillable: string[] = [];

    /**
     * @var bool Indicates if the IDs are auto-incrementing.
     */
    public incrementing: boolean = true;

    /**
     * @var bool Whether or not soft deletes are enabled.
     */
    public softDeletes: boolean = false;

    /**
     * @var object The model's attributes.
     */
    private attributes = {};

    constructor(attributes: any = {}) {
        if (attributes) {
            this.attributes = attributes;
            this.registerAttributes(attributes);
        }

        this.registerAttributes(this.fillable);
    }

    /**
     * Register getters and setters for the model's attributes.
     * @param attributes The attributes to register.
     */
    private registerAttributes(attributes: any = {}) {
        Object.keys(attributes).forEach((key) => {
            if (this.hasOwnProperty(key)) {
                return;
            }
            Object.defineProperty(this, key, {
                get() {
                    return this.attributes[key];
                },
                set(value) {
                    this.attributes[key] = value;
                }
            });
        });
    }

    /**
     * Clear the model's attributes.
     */
    private clearAttributes() {
        Object.keys(this.attributes).forEach((key) => {
            if (this.fillable.indexOf(key) === -1)
                return delete this.attributes[key];

            this.attributes[key] = null;
        });
    }

    /**
     * Get the table name
     * @returns The table name
     */
    public getTable(): string {
        return this.table;
    }

    /**
     * Get the value of the primary key
     * @returns The primary key
     */
    public getKey(): any {
        return this.attributes[this.primaryKey];
    }

    /**
     * Find a model by its primary key.
     * @param id The primary key value of the model to find
     * @returns Promise<Model>
     */
    public static async find(id: any): Promise<Model> {
        const model = new this();
        const result = await (model.constructor as typeof Model).query().where(model.primaryKey, id).get();
        return result.first();
    }

    /**
     * Find a model by its primary key, and throw an error if not found.
     * @param id The primary key value of the model to find
     * @returns Promise<Model>
     */
    public static async findOrFail(id: any): Promise<Model> {
        const model = await this.find(id);
        if (!model) {
            throw new Error('Model not found');
        }
        return model;
    }

    /**
     * Save the model to the database
     * @returns void
     */
    public save() {
        const db = new Database();
        let sql = '';

        const attributes = {};

        Object.keys(this.attributes).forEach(key => {
            if (this.fillable.indexOf(key) === -1)
                return;

            if (this.attributes[key] === null)
                return attributes[key] = 'NULL';

            attributes[key] = `'${this.attributes[key]}'`;
        });

        attributes['updated_at'] = 'NOW()';

        if (this.attributes[this.primaryKey]) {
            sql = `UPDATE ${this.table} SET ${Object.keys(attributes).map(key => `${key} = ${attributes[key]}`).join(', ')} WHERE ${this.primaryKey} = ${this.attributes[this.primaryKey]}`;
        } else {
            sql = `INSERT INTO ${this.table} (${Object.keys(attributes).join(', ')}) VALUES (${Object.values(this.attributes).join('\', \'')})`;
        }

        return db.query(sql);
    }

    /**
     * Update the model's attributes
     * @param attributes The attributes to update
     * @returns void
     */
    public update(attributes: any) {
        Object.keys(attributes).forEach(key => {
            this.attributes[key] = attributes[key];
        });

        return this.save();
    }

    /**
     * Find a model by the given search criteria and update it, or create a new one with the given attributes.
     * @param search The search criteria
     * @param attributes The attributes to be updated or inserted
     * @returns Promise<Model>
     */
    public static async updateOrCreate(search: {}, attributes: {}): Promise<Model> {
        return new Promise(async (resolve) => {
            const model = new this();
            const query = (model.constructor as typeof Model).query();
            Object.keys(search).forEach(key => {
                query.where(key, search[key]);
            });
            const result = await query.get();
            if (result.length) {
                const user = result.first()
                user.update(attributes);

                resolve(user);
            } else {
                const user = (this.constructor as typeof Model).newInstance(attributes);
                user.save();
                resolve(user);
            }
        });
    }

    /**
     * Refresh the model from the database
     * @returns Model
     */
    public async refresh() {
        return new Promise(async (resolve) => {
            const model = await (this.constructor as typeof Model).find(this.attributes[this.primaryKey]);
            this.attributes = model.attributes;
            this.registerAttributes(this.attributes);
            resolve(this);
        });
    }

    /**
     * Touch the timestamps on the model
     * @returns void
     */
    public async touch() {
        const db = new Database();
        let sql = `UPDATE ${this.table} SET updated_at = NOW() WHERE ${this.primaryKey} = ${this.attributes[this.primaryKey]}`;

        return db.query(sql);
    }

    /**
     * Remove the model from the database
     * @returns void
     */
    public delete() {
        const db = new Database();
        let sql = '';
        if (this.softDeletes) {
            sql = `UPDATE ${this.table} SET deleted_at = NOW() WHERE ${this.primaryKey} = ${this.attributes[this.primaryKey]}`;
            this.touch();
        } else {
            return this.forceDelete();
        }

        return db.query(sql);
    }

    /**
    * Delete the model from the database, regardless of soft deletes.
    * @returns void
    */
    public forceDelete() {
        const db = new Database();
        let sql = `DELETE FROM ${this.table} WHERE ${this.primaryKey} = ${this.attributes[this.primaryKey]}`;
        this.clearAttributes();

        return db.query(sql);
    }

    /**
     * Destroy the models for the given primary keys.
     * @param ids An array of primary keys to destroy
     * @returns void
     */
    public static async destroy(ids: any[]) {
        const db = new Database();
        const model = new this();

        ids.map((id) => {
            return `'${id}'`;
        });

        let sql = '';
        if (model.softDeletes) {
            sql = `UPDATE ${model.getTable()} SET deleted_at = NOW() WHERE ${model.primaryKey} IN (${ids.join(', ')})`;
            const models = await this.query().whereIn(model.primaryKey, ids).get();

            models.forEach((model) => {
                model.touch();
            });
        } else {
            sql = `DELETE FROM ${model.getTable()} WHERE ${model.primaryKey} IN (${ids.join(', ')})`;
        }

        return db.query(sql);
    }

    /**
     * Restore a soft-deleted model. Only works if soft deletes are enabled.
     * @returns void
     */
    public restore() {
        if (!this.softDeletes)
            throw new Error('Cannot restore a model that does not use soft deletes');

        const db = new Database();
        let sql = `UPDATE ${this.table} SET deleted_at = NULL WHERE ${this.primaryKey} = ${this.attributes[this.primaryKey]}`;
        this.touch();

        return db.query(sql);
    }

    /**
     * Start a query against the model's table.
     * @return QueryBuilder
     */
    public static query() {
        const model = new this();
        return new QueryBuilder(model);
    }

    /**
     * Return all models from the table.
     * @returns Promise<Collection>
     */
    public static async all(): Promise<typeof Collection> {
        return await this.query().select('*').get();
    }

    /**
     * Create a new model instance.
     * @param attributes The attributes to create the model with.
     * @returns Model
     */
    public static newInstance(attributes: any = {}) {
        return new this(attributes);
    }

    /**
     * Return the model's attributes as a JSON string.
     * @returns The JSON string
     */
    public toJson(): string {
        return JSON.stringify(this.attributes, null, 2);
    }

    /**
     * Check if the model is the same as another model.
     * @param model The model to check against
     * @returns boolean
     */
    public is(model: Model): boolean {
        return (model !== null) && (this.getKey() == model.getKey()) && (this.getTable() == model.getTable());
    }

    /**
     * Check if the model is not the same as another model.
     * @param model The model to check against
     * @returns boolean
     */
    public isNot(model: Model): boolean {
        return !this.is(model);
    }

    /**
     * Check whether the model has been soft-deleted.
     * @returns boolean
     */
    public async trashed(): Promise<boolean> {
        const user = await (this.constructor as typeof Model).query().where(this.primaryKey, this.attributes[this.primaryKey]).whereNull('deleted_at').get();
        return user.count() === 0;
    }

}