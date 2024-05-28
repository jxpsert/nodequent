import { Model } from './src/Model';
import { Collection } from './src/Collection';
import { Database } from './src/Database';
import { Table } from './src/Table';

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

    console.info('Nodequent initialised');
};

module.exports = {
    init,
    Model,
    Collection,
    Table
}