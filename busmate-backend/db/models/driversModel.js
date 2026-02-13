const { Model } = require('objection');

class Driver extends Model {

    static get tableName() {
        return 'drivers';
    }

    static get idColumn() {
        return 'driver_id';
    }

    // Hide password when returning JSON
    $formatJson(json) {
        json = super.$formatJson(json);
        delete json.password_hash;
        return json;
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['full_name', 'phone', 'nic', 'password_hash'],
            properties: {
                driver_id: { type: 'integer' },

                full_name: { type: 'string', minLength: 3, maxLength: 120 },

                phone: { type: 'string', minLength: 9, maxLength: 20 },

                nic: { type: 'string', minLength: 8, maxLength: 20 },

                photo_url: { type: ['string', 'null'], maxLength: 500 },

                password_hash: { type: 'string', minLength: 20 },

                created_at: { type: ['string', 'null'] }
            }
        };
    }

    static get relationMappings() {

        const DrivingLicense = require('./DrivingLicense');
        const BusSchedule = require('./BusSchedule');

        return {

            // One driver has one license
            license: {
                relation: Model.HasOneRelation,
                modelClass: DrivingLicense,
                join: {
                    from: 'drivers.driver_id',
                    to: 'driving_licenses.driver_id'
                }
            },

            // One driver has many schedules
            schedules: {
                relation: Model.HasManyRelation,
                modelClass: BusSchedule,
                join: {
                    from: 'drivers.driver_id',
                    to: 'bus_schedules.driver_id'
                }
            }

        };
    }

}

module.exports = Driver;
