/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('route_stops', (table) => {
        table.increments('stop_id').primary();

        table.integer('route_id')
            .unsigned()
            .notNullable()
            .references('route_id')
            .inTable('routes')
            .onDelete('CASCADE');

        table.string('stop_name').notNullable();

        table.integer('stop_order').notNullable();

        table.decimal('latitude', 10, 8);
        table.decimal('longitude', 11, 8);

        table.timestamp('created_at').defaultTo(knex.fn.now());

        table.unique(['route_id', 'stop_order']);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('route_stops');
};
