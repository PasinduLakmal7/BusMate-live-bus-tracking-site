/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('buses', (table) => {

        table.increments('bus_id').primary();

        table.string('bus_number')
            .notNullable()
            .unique();

        table.string('bus_type')
            .notNullable();

        table.integer('depot_id')
            .unsigned()
            .notNullable()
            .references('depot_id')
            .inTable('depot_companies')
            .onDelete('CASCADE');

        table.timestamp('created_at')
            .defaultTo(knex.fn.now());

    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('buses');
};
