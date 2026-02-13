/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('conductors', (table) => {

        table.increments('conductor_id').primary();

        table.string('full_name')
            .notNullable();

        table.string('nic')
            .notNullable()
            .unique();

        table.string('phone')
            .notNullable()
            .unique();

        table.string('photo_url');

        table.string('status')
            .defaultTo('active');

        table.timestamp('created_at')
            .defaultTo(knex.fn.now());

    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('conductors');
};
