/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('routes', (table) => {

        table.increments('route_id').primary();

        table.string('route_number')
            .notNullable()
            .unique();

        table.string('start_location').notNullable();

        table.string('end_location').notNullable();

        table.boolean('active_status')
            .defaultTo(true);

        table.decimal('total_distance', 8, 2); // km

        table.integer('estimated_duration'); // minutes

        table.timestamp('created_at')
            .defaultTo(knex.fn.now());

    });
};


/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('routes');
};
