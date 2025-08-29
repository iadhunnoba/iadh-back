const bcrypt = require("bcryptjs");

const password = "admin1";

bcrypt.hash(password, 10, (err, hash) => {
    if (err) throw err;
    console.log("Hash:", hash);
});