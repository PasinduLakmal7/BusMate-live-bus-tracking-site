const { Model } = require('objection');

class RouteStop extends Model {

    static get tableName() {
        return 'route_stops';
    }

    static get idColumn() {
        return 'stop_id';
    }

    // Default ordering (very useful)
    static get modifiers() {
        return {
            orderByStop(query) {
                query.orderBy('stop_order');
            }
        };
    }

    // Validation schema
    static get jsonSchema() {
        return {
            type: 'object',
            required: ['route_id', 'stop_name', 'stop_order'],
            properties: {
                stop_id: { type: 'integer' },

                route_id: { type: 'integer' },

                stop_name: { type: 'string', minLength: 2, maxLength: 150 },

                stop_order: { type: 'integer', minimum: 1 },

                latitude: { type: ['number', 'null'] },
                longitude: { type: ['number', 'null'] },

                created_at: { type: ['string', 'null'] }
            }
        };
    }

    static get relationMappings() {

        const Route = require('./Route');

        return {

            // Each stop belongs to one route
            route: {
                relation: Model.BelongsToOneRelation,
                modelClass: Route,
                join: {
                    from: 'route_stops.route_id',
                    to: 'routes.route_id'
                }
            }

        };
    }

}

module.exports = RouteStop;
