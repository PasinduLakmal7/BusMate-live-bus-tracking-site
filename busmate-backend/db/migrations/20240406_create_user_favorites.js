exports.up = function(knex) {
  return knex.schema.createTable('user_favorites', table => {
    table.increments('id').primary();
    table.integer('user_id').unsigned().references('id').inTable('users').onDelete('CASCADE');
    table.string('item_type'); // 'bus' or 'stop'
    table.string('item_id');   // the bus code or stop id
    table.string('item_name').nullable(); // optional name cache
    table.timestamp('created_at').defaultTo(knex.fn.now());
    
    // Ensure no duplicate favorites for the same user
    table.unique(['user_id', 'item_type', 'item_id']);
  });
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists('user_favorites');
};
