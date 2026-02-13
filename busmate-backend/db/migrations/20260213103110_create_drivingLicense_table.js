/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('driving_licenses', (table) => {

        table.increments('license_id').primary();

        table.integer('driver_id')
            .unsigned()
            .notNullable()
            .references('driver_id')
            .inTable('drivers')
            .onDelete('CASCADE');

        table.string('license_number')
            .notNullable()
            .unique();

        table.date('expiry_date')
            .notNullable();

        table.string('photo_url');

        table.boolean('verified_status')
            .defaultTo(false);

        table.timestamp('created_at')
            .defaultTo(knex.fn.now());

    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('driving_licenses');
};
