# nodequent

Use Laravel's Eloquent functionality from the comfort of your own Node.js environment.

## Installation

``npm install --save nodequent``

## Usage

```JS
// index.js
require('nodequent').init();
const { User } = require('./models/User');

(async () => {
    let users = await User.all();
    console.log(users);
})();

// models/User.js
const { Model } = require('nodequent');

class User extends Model {
    table = 'users';
    fillable = ['name', 'email', 'password'];
    softDeletes = true;
}

module.exports = { User };
```
```bash
Collection(2) [
  User {
    primaryKey: 'id',
    keyType: 'int',
    fillable: [ 'name', 'email', 'password' ],
    incrementing: true,
    softDeletes: true,
    attributes: {
      id: 1,
      name: 'Jane Doe',
      email: 'jane@doe.com',
      password: null,
      created_at: '2024-04-23 14:37:40',
      updated_at: '2024-04-23 14:37:40'
    },
    table: 'users'
  },
  User {
    primaryKey: 'id',
    keyType: 'int',
    fillable: [ 'name', 'email', 'password' ],
    incrementing: true,
    softDeletes: true,
    attributes: {
      id: 2,
      name: 'John Doe',
      email: 'john@doe.com',
      password: null,
      created_at: '2024-04-23 14:37:39',
      updated_at: '2024-04-23 14:37:39'
    },
    table: 'users'
  }
]
```

### Database without .env
```JS
require('nodequent').init({
    database: {
        host: 'localhost',
        database: 'nodequent',
        user: 'nodequent-user',
        password: 'password123',
    }
});
```

## Contributing

Contributions are always appreciated in the form of pull requests.
