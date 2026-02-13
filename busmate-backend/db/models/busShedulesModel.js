const { Model } = require('objection');

class BusSchedule extends Model {
    static get tableName() {
        return 'bus_schedules';
    }

    static get idColumn() {
        return 'schedule_id';
    }

    static get relationMappings() {
        const Bus = require('./Bus');
        const Route = require('./Route');
        const Driver = require('./Driver');
        const Conductor = require('./Conductor');

        return {
            // Each schedule belongs to one bus
            bus: {
                relation: Model.BelongsToOneRelation,
                modelClass: Bus,
                join: {
                    from: 'bus_schedules.bus_id',
                    to: 'buses.bus_id',
                },
            },

            // Each schedule belongs to one route
            route: {
                relation: Model.BelongsToOneRelation,
                modelClass: Route,
                join: {
                    from: 'bus_schedules.route_id',
                    to: 'routes.route_id',
                },
            },

            // Each schedule belongs to one driver
            driver: {
                relation: Model.BelongsToOneRelation,
                modelClass: Driver,
                join: {
                    from: 'bus_schedules.driver_id',
                    to: 'drivers.driver_id',
                },
            },

            // Each schedule belongs to one conductor
            conductor: {
                relation: Model.BelongsToOneRelation,
                modelClass: Conductor,
                join: {
                    from: 'bus_schedules.conductor_id',
                    to: 'conductors.conductor_id',
                },
            },
        };
    }
}

module.exports = BusSchedule;
