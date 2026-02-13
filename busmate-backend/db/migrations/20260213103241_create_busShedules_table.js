/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('bus_schedules', (table) => {
        table.increments('schedule_id').primary();

        table.integer('bus_id')
            .unsigned()
            .notNullable()
            .references('bus_id')
            .inTable('buses')
            .onDelete('CASCADE');

        table.integer('route_id')
            .unsigned()
            .notNullable()
            .references('route_id')
            .inTable('routes')
            .onDelete('CASCADE');

        table.integer('driver_id')
            .unsigned()
            .notNullable()
            .references('driver_id')
            .inTable('drivers')
            .onDelete('RESTRICT');

        table.integer('conductor_id')
            .unsigned()
            .notNullable()
            .references('conductor_id')
            .inTable('conductors')
            .onDelete('RESTRICT');

        table.integer('trip_no').notNullable();

        table.time('start_time').notNullable();
        table.time('end_time').notNullable();

        table.timestamp('created_at').defaultTo(knex.fn.now());

        table.unique(['bus_id', 'route_id', 'trip_no']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('bus_schedules');
};
