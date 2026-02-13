/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('bus_locations', (table) => {

        table.increments('location_id').primary();

        table.integer('bus_id')
            .unsigned()
            .notNullable()
            .references('bus_id')
            .inTable('buses')
            .onDelete('CASCADE');

        table.decimal('latitude', 10, 8)
            .notNullable();

        table.decimal('longitude', 11, 8)
            .notNullable();

        table.float('speed');

        table.timestamp('recorded_at')
            .defaultTo(knex.fn.now());

    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('bus_locations');
};
