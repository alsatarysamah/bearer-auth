'use strict';

const base64 = require('base-64');
const { users } = require('../models/index');

module.exports = async (req, res, next) => {
console.log("base");
let basicHeaderParts = req.headers.authorization.split(' ');  
let encodedString = basicHeaderParts.pop();  
let decodedString = base64.decode(encodedString);
let [username, password] = decodedString.split(':'); 
console.log(password);
  try {
    console.log("try");
    req.user = await users.authenticateBasic(username, password);
     console.log("after await");

    next();
  } catch (e) {
    console.error(e);
    res.status(403).send('Invalid Login');
  }

}
