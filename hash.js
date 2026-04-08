const bcrypt = require("bcryptjs");

const password = "12345678";

bcrypt.hash(password, 10, (err, hash) => {
    if (err) throw err;
    console.log("Hash:", hash);
});