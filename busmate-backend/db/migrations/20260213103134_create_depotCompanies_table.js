/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('depot_companies', (table) => {

        table.increments('depot_id').primary();  // PK

        table.string('name')
            .notNullable();

        table.string('address')
            .notNullable();

        table.string('contact_number')
            .notNullable();

        table.timestamp('created_at')
            .defaultTo(knex.fn.now());

    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('depot_companies');
};
