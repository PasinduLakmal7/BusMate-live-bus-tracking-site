const { Model } = require('objection');

class User extends Model {

    static get tableName() {
        return 'users';
    }

    static get idColumn() {
        return 'id';
    }

    // Hide password when sending response
    $formatJson(json) {
        json = super.$formatJson(json);
        delete json.password;
        return json;
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['username', 'email', 'password'],
            properties: {
                id: { type: 'integer' },

                username: { type: 'string', minLength: 3, maxLength: 50 },

                email: { type: 'string', format: 'email', maxLength: 120 },

                password: { type: 'string', minLength: 6 },

                created_at: { type: ['string', 'null'] },
                updated_at: { type: ['string', 'null'] }
            }
        };
    }

    static get modifiers() {
        return {
            byEmail(query, email) {
                if (email) query.where('email', email);
            },
            byUsername(query, username) {
                if (username) query.where('username', username);
            }
        };
    }

}

module.exports = User;
