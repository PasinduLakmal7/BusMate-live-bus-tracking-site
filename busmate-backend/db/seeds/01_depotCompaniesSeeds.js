/**
 * @param {import("knex").Knex} knex
 */
exports.seed = async function (knex) {

  await knex.raw('TRUNCATE TABLE depot_companies RESTART IDENTITY CASCADE');

  const depots = [
    { name: 'Central Bus Stand (Pettah)', address: 'Pettah, Colombo 11', contact_number: '0112328081', created_at: new Date() },
    { name: 'Maharagama Depot', address: 'High Level Rd, Maharagama', contact_number: '0112850262', created_at: new Date() },
    { name: 'Kandy Goods Shed', address: 'William Gopallawa Mawatha, Kandy', contact_number: '0812232222', created_at: new Date() },
    { name: 'Galle Bus Stand', address: 'Galle Face Green, Galle', contact_number: '0912234242', created_at: new Date() },
    { name: 'Matara Depot', address: 'Beach Road, Matara', contact_number: '0412222222', created_at: new Date() },
    { name: 'Negombo Depot', address: 'Negombo Road, Negombo', contact_number: '0312222222', created_at: new Date() },
    { name: 'Kurunegala Depot', address: 'Colombo Road, Kurunegala', contact_number: '0372222222', created_at: new Date() },
    { name: 'Anuradhapura Depot', address: 'New Town, Anuradhapura', contact_number: '0252222222', created_at: new Date() },
    { name: 'Panadura Depot', address: 'Galle Road, Panadura', contact_number: '0382222222', created_at: new Date() },
    { name: 'Kalutara Depot', address: 'Galle Road, Kalutara', contact_number: '0342222222', created_at: new Date() }
  ];

  await knex('depot_companies').insert(depots);
};

