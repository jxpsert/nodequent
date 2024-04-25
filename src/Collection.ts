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

}