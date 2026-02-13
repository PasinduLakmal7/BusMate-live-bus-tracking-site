const { Model } = require('objection');

class Route extends Model {

    static get tableName() {
        return 'routes';
    }

    static get idColumn() {
        return 'route_id';
    }

    static get relationMappings() {

        const RouteStop = require('./RouteStop');
        const BusSchedule = require('./BusSchedule');

        return {

            // One route has many stops
            stops: {
                relation: Model.HasManyRelation,
                modelClass: RouteStop,
                join: {
                    from: 'routes.route_id',
                    to: 'route_stops.route_id'
                }
            },

            // One route has many schedules
            schedules: {
                relation: Model.HasManyRelation,
                modelClass: BusSchedule,
                join: {
                    from: 'routes.route_id',
                    to: 'bus_schedules.route_id'
                }
            }

        };
    }

}

module.exports = Route;
