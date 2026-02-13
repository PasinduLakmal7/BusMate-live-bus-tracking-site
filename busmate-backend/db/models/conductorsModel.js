const { Model } = require('objection');

class Conductor extends Model {
    static get tableName() {
        return 'conductors';
    }

    static get idColumn() {
        return 'conductor_id';
    }

    static get relationMappings() {
        const BusSchedule = require('./BusSchedule');

        return {
            // One conductor can have many schedules
            schedules: {
                relation: Model.HasManyRelation,
                modelClass: BusSchedule,
                join: {
                    from: 'conductors.conductor_id',
                    to: 'bus_schedules.conductor_id',
                },
            },
        };
    }
}

module.exports = Conductor;
