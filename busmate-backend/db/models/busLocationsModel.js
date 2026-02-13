const { Model } = require('objection');

class BusLocation extends Model {
    static get tableName() {
        return 'bus_locations';
    }

    static get idColumn() {
        return 'location_id';
    }

    static get jsonSchema() {
        return {
            type: 'object',
            required: ['bus_id', 'latitude', 'longitude'],
            properties: {
                location_id: { type: 'integer' },

                bus_id: { type: 'integer' },

                latitude: { type: 'number', minimum: -90, maximum: 90 },
                longitude: { type: 'number', minimum: -180, maximum: 180 },

                speed: { type: ['number', 'null'], minimum: 0 },

                recorded_at: { type: ['string', 'null'] }
            }
        };
    }

    static get modifiers() {
        return {
            latest(query) {
                query.orderBy('recorded_at', 'desc').limit(1);
            },
            byBus(query, busId) {
                if (busId) query.where('bus_id', busId);
            },
            between(query, from, to) {
                if (from) query.where('recorded_at', '>=', from);
                if (to) query.where('recorded_at', '<=', to);
            }
        };
    }

    static get relationMappings() {
        const Bus = require('./Bus');

        return {
            // Each location belongs to one bus
            bus: {
                relation: Model.BelongsToOneRelation,
                modelClass: Bus,
                join: {
                    from: 'bus_locations.bus_id',
                    to: 'buses.bus_id'
                }
            }
        };
    }
}

module.exports = BusLocation;
