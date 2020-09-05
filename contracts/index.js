const Contracts = require('../lib/zilliqa/contracts');

const deployments = require('../.dev/deployments.json'); // TODO: find some way to load production addresses
const config = require('./config');

module.exports = (() => new Contracts(deployments, config))();
