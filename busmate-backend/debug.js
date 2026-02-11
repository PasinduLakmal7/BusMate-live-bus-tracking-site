try {
    require('./db/knexfile');
    console.log("knexfile loaded successfully");
} catch (error) {
    const fs = require('fs');
    fs.writeFileSync('error_log.txt', error.stack);
    console.log("Error written to error_log.txt");
}
