const nodequent = require('../dist/index');

nodequent.init({
    database: {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: null,
        database: 'nodequent'
    }
});

const userTable = new nodequent.Table('users');
userTable.integer('id').primary().autoIncrement();
userTable.string('name').nullable();
userTable.string('email').nullable().unique();
userTable.string('password').nullable();
userTable.create();

const secondUserTable = new nodequent.Table('users');
secondUserTable.integer('id').primary().autoIncrement();
secondUserTable.string('name').nullable();
secondUserTable.string('email').nullable().unique();
secondUserTable.string('password').nullable();
secondUserTable.string('role').nullable();
secondUserTable.forceCreate();
