exports.up = function (knex) {
    return knex.schema.createTable('pending_registrations', (table) => {

        table.increments('pending_id').primary();

        // Driver Info
        table.string('full_name').notNullable();
        table.string('phone').notNullable().unique();
        table.string('nic').notNullable().unique();
        table.string('password_hash').notNullable();
        table.string('driver_photo_url');

        // License Info
        table.string('license_number').notNullable();
        table.date('license_expiry').notNullable();
        table.string('license_photo_url');

        // Bus Info
        table.string('bus_number').notNullable();
        table.string('bus_type');
        table.string('depot_name');

        // Conductor Info
        table.string('conductor_name');
        table.string('conductor_nic');
        table.string('conductor_phone');
        table.string('conductor_photo_url');

        // Route Info
        table.string('route_number');
        table.string('route_name');

        // Trips
        table.json('trips_json');

        // Approval Status
        table.string('status')
            .defaultTo('pending');  // pending / approved / rejected

        table.timestamp('created_at')
            .defaultTo(knex.fn.now());
    });
};

exports.down = function (knex) {
    return knex.schema.dropTableIfExists('pending_registrations');
};
