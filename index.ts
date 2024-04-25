import { Model } from './src/Model';
import { Collection } from './src/Collection';
import { Database } from './src/Database';

/**
 * Initialise the package.
 * @param options The nodequent options.
 * @return void
 */
const init = (options?: { database?: { host: string, user: string, password: string, database: string } }) => {
    require('dotenv').config();
    if (options && options.database) {
        Database.setOptions(options.database);
    }
};

module.exports = {
    init,
    Model,
    Collection
}