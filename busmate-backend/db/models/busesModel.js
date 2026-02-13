const { Model } = require('objection');

class Bus extends Model {
    static get tableName() {
        return 'buses';
    }

    static get idColumn() {
        return 'bus_id';
    }

    static get relationMappings() {
        const DepotCompany = require('./DepotCompany');
        const BusSchedule = require('./BusSchedule');
        const BusLocation = require('./BusLocation');

        return {

            // Each bus belongs to one depot
            depot: {
                relation: Model.BelongsToOneRelation,
                modelClass: DepotCompany,
                join: {
                    from: 'buses.depot_id',
                    to: 'depot_companies.depot_id'
                }
            },

            // Bus has many schedules
            schedules: {
                relation: Model.HasManyRelation,
                modelClass: BusSchedule,
                join: {
                    from: 'buses.bus_id',
                    to: 'bus_schedules.bus_id'
                }
            },

            // Bus has many location records
            locations: {
                relation: Model.HasManyRelation,
                modelClass: BusLocation,
                join: {
                    from: 'buses.bus_id',
                    to: 'bus_locations.bus_id'
                }
            }

        };
    }
}

module.exports = Bus;
