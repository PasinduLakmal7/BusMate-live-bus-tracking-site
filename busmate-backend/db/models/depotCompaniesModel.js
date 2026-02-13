const { Model } = require('objection');

class DepotCompany extends Model {

    static get tableName() {
        return 'depot_companies';
    }

    static get idColumn() {
        return 'depot_id';
    }

    static get relationMappings() {

        const Bus = require('./Bus');

        return {

            // One depot has many buses
            buses: {
                relation: Model.HasManyRelation,
                modelClass: Bus,
                join: {
                    from: 'depot_companies.depot_id',
                    to: 'buses.depot_id'
                }
            }

        };
    }

}

module.exports = DepotCompany;
