/**
 * Column class
 */
export class Column {

    public name: string;
    public type: string;
    public primaryKey: boolean = false;
    public uniqueKey: boolean = false;
    public autoIncrementing: boolean = false;
    public columnLength: number = null;
    public isNullable: boolean = false;

    /**
     * Create a new instance of the Column class.
     * @param name The name of the column.
     * @param type The type of the column.
     * @return void
     */

    constructor(name: string, type: string) {
        this.name = name;
        this.type = type;
    }

    /**
     * Set the column as the primary key.
     * @return Column
     */
    public primary(): this {
        this.primaryKey = true;
        return this;
    }

    /**
     * Set the column as unique.
     * @return Column
     */
    public unique(): this {
        if (this.primaryKey) return this;
        this.uniqueKey = true;
        return this;
    }

    /**
     * Set the column as auto incrementing.
     * @return Column
     */
    public autoIncrement(): this {
        this.autoIncrementing = true;
        return this;
    }

    /**
     * Set the column as nullable.
     * @return Column
     */
    public nullable(): this {
        this.isNullable = true;
        return this;
    }

    /**
     * Set the length of the column.
     * @param length The length of the column.
     * @return Column
     */
    public length(length: number): this {
        this.columnLength = length;
        return this;
    }
}