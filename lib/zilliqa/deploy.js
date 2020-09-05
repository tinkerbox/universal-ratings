require('dotenv').config();

const fs = require('fs');
const path = require('path');
const util = require('util');
const { BN, Long } = require('@zilliqa-js/util');
const { toBech32Address } = require('@zilliqa-js/crypto');

const { zilliqa, network, version } = require('./index');
const { contracts } = require('../../contracts/config');

const CONTRACTS_DIR = './contracts/';
const DEV_DIR = './.dev/';
const GAS_LIMIT = process.env.GAS_LIMIT || 3000;

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const deployments = {};

const deployContract = async (code, init) => {
  init.unshift({
    vname: '_scilla_version',
    type: 'Uint32',
    value: '0',
  });

  const contract = zilliqa.contracts.new(code, init);

  const minGasPrice = await zilliqa.blockchain.getMinimumGasPrice();
  const params = {
    version,
    gasPrice: new BN(minGasPrice.result),
    gasLimit: Long.fromNumber(GAS_LIMIT),
  };

  const [txn] = await contract.deploy(params);

  return { contract, txn };
};

const deploys = contracts.map((config) => {
  console.log(`Deploying contract ${config.name} to ${network.name}...`);

  const filename = path.join(CONTRACTS_DIR, `${config.name}.scilla`);
  return readFile(filename, 'utf-8')
    .then(content => deployContract(content, config.init))
    .then(({ contract }) => {
      deployments[config.name] = contract.address;
      const url = `https://viewblock.io/zilliqa/address/${toBech32Address(contract.address)}${network.viewblockId ? `?network=${network.viewblockId}` : ''}`;
      console.log(`Successfully deployed at ${contract.address} (${url})`);
    });
});

Promise.all(deploys)
  .then(() => {
    if (!fs.existsSync(DEV_DIR)) fs.mkdirSync(DEV_DIR);

    const content = JSON.stringify(deployments);
    const filename = path.join(DEV_DIR, 'deployments.json');

    writeFile(filename, content, 'utf-8').then(() => {
      console.log(`Deployment manifest saved to ${filename}`);
    });
  })
  .catch((err) => {
    console.error(`One or more errors during deployment, no manifest file saved: ${err}`);
  })
