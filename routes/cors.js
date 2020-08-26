const cors = require('cors');

const whitelist = ['http://localhost:3000', 'https://localhost:3443'];
const corsOptionsDelegate = (req, callback) => {
    let corsOptions;
    console.log(req.header('Origin'));
    if(whitelist.indexOf(req.header('Origin')) !== -1) {
        corsOptions = { origin: true };
    } else {
        corsOptions = { origin: false };
    }
    callback(null, corsOptions);
};

exports.cors = cors(); //middleware that makes header "access control allow origin"
exports.corsWithOptions = cors(corsOptionsDelegate); //middleware that checks if origin is in whitelist. If it does, sense back same header as above. If not, does not include cors header in response