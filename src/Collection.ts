import { Model } from "./Model";

/**
 * A collection class that extends the Array class.
 * Mostly for convenience.
 * @extends Array
 */
export class Collection extends Array {
    constructor(...args) {
        super(...args);
    }

    /**
     * Get the first (x) item(s) from the collection.
     * @param amount The amount of items to get. Optional.
     * @returns any
     */
    public first(amount?: number): any {
        if (!amount)
            return this.length > 0 ? this[0] : null;

        return this.slice(0, amount);
    }

    /**
     * Get the last (x) item(s) from the collection.
     * @param amount The amount of items to get. Optional.
     * @returns any
     */
    public last(amount?: number): any {
        if (!amount)
            return this.length > 0 ? this[this.length - 1] : null;

        return this.slice(this.length - amount, this.length);
    }

    /**
     * Get a pseudo-random item from the collection.
     * @returns any
     */
    public random(): any {
        return this[Math.floor(Math.random() * this.length)];
    }

    /**
     * Return the number of items in the collection. To stay in the Laravel spirit.
     * @returns The length of the collection
     */
    public count(): number {
        return this.length;
    }

    /**
     * Return only unique items from the collection.
     * @returns Collection
     */
    public unique(): Collection {
        return new Collection([...new Set(this)]);
    }

    /**
     * Delete all models in the collection.
     * @returns void
     */
    public delete(): void {
        for (let i = 0; i < this.length; i++) {
            if (this[i] instanceof Model)
                this[i].delete();
        }
    }

    /**
     * Convert the collection to an array.
     * @returns The collection as an array
     * @since 1.0.6
     */
    public toArray(): any[] {
        const arr = [];
        for (let i = 0; i < this.length; i++) {
            if (this[i] instanceof Model)
                arr.push(this[i].toArray());
            else
                arr.push(this[i]);
        }

        return arr;
    }

    /**
     * Call a function on each item in the collection.
     * @param callback The function to call
     * @returns void
     * @since 1.0.6
     */
    public each(callback: (value: any, index: number) => void): void {
        this.forEach(callback);
    }

    /**
     * Merge another collection into this collection and return a new collection.
     * @param collection The collection to merge
     * @returns void
     * @since 1.0.6
     */
    public merge(collection: Collection): Collection {
        return new Collection([...this, ...collection]);
    }

    /**
     * Get the sum of all items in the collection.
     * @returns The sum of all items
     * @since 1.0.6
     */
    public sum(): number {
        return this.reduce((acc, val) => acc + val, 0);
    }

    /**
     * Get the average of all items in the collection.
     * @returns The average of all items
     * @since 1.0.6
     */
    public avg(): number {
        return this.sum() / this.length;
    }

    /**
     * Get the max value in the collection.
     * @returns The max value
     * @since 1.0.6
     */
    public max(): number {
        return Math.max(...this);
    }

    /**
     * Get the min value in the collection.
     * @returns The min value
     * @since 1.0.6
     */
    public min(): number {
        return Math.min(...this);
    }

    /**
     * Pluck a specific attribute from the collection.
     * @param $attribute The attribute to pluck
     * @returns Collection
     * @since 1.0.6
     */
    public pluck($attribute: string) {
        return this.map((item) => item[$attribute]);
    }
}