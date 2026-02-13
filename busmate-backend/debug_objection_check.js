const objection = require('objection');
console.log('Objection exports:', Object.keys(objection));
try {
    const { knexSnakecaseMappers } = objection;
    console.log('knexSnakecaseMappers type:', typeof knexSnakecaseMappers);
} catch (e) {
    console.error(e);
}
