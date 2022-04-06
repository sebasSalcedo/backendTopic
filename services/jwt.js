'use strict'

const jwt = require('jwt-simple');
const moment = require('moment');


const keySecret = 'V@sT!@ñ.1590_S@lc3D0';

exports.createToken = function (user) {
  
       
    var payload = {
        sub: user._id,
        name: user.name,
        surname: user.surname,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(30,'days').unix,
    }
  
    return jwt.encode(payload, keySecret);

    
}