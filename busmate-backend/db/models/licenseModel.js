const { Model } = require('objection');

class DrivingLicense extends Model {

    static get tableName() {
        return 'driving_licenses';
    }

    static get idColumn() {
        return 'license_id';
    }

    static get relationMappings() {

        const Driver = require('./Driver');

        return {

            // Each license belongs to one driver
            driver: {
                relation: Model.BelongsToOneRelation,
                modelClass: Driver,
                join: {
                    from: 'driving_licenses.driver_id',
                    to: 'drivers.driver_id'
                }
            }

        };
    }

}

module.exports = DrivingLicense;
