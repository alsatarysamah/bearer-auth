'use strict';

const bcrypt = require('bcrypt');
const jwt=require('jsonwebtoken')
require("dotenv").config();

const userSchema = (sequelize, DataTypes) => {
  const model = sequelize.define('tamara', {
    password: { type: DataTypes.STRING, allowNull: false},
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    
    token: {
      type: DataTypes.VIRTUAL,
      get() {
        return jwt.sign({ username: this.username },process.env.SECRET,{
          expiresIn: "15m"}
          );
      }
    }
  });

  model.beforeCreate(async (user) => {
    let hashedPass = bcrypt.hash(user.password, 10);
    user.password = hashedPass;
  });

  // Basic AUTH: Validating strings (username, password) 
  model.authenticateBasic = async function (username, password) {
  
    const user = await this.findOne({ where: { username: username } })
    console.log(user);
    const valid = await bcrypt.compare(password, user.password)
    console.log("valid",valid);
    
    if (valid) {

      let newToken = jwt.sign({ username: user.username },process.env.SECRET,{
        expiresIn: "15m"});
        // console.log('************************', newToken);
        user.token = newToken;
       return user; 
      }
   
    throw new Error('Invalid User');
  }
 
  // Bearer AUTH: Validating a token
  model.authenticateToken = async function (token) {
    try {
      const parsedToken = jwt.verify(token, process.env.SECRET);
      const user =await this.findOne({ username: parsedToken.username })
      if (user.username) { return user; }
      throw new Error("User Not Found");
    } catch (e) {
      console.log(e)
      throw new Error(e.message)
    }
  }

  return model;
}

module.exports = userSchema;
