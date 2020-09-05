const { Zilliqa } = require('@zilliqa-js/zilliqa');
const { bytes } = require('@zilliqa-js/util');

const networks = {
  testnet: {
    name: 'Zilliqa Testnet',
    id: 333,
    url: 'https://dev-api.zilliqa.com/',
    msgVersion: 1,
    viewblockId: 'testnet',
  },
  mainnet: {
    name: 'Zilliqa Mainnet',
    id: 1,
    url: 'https://api.zilliqa.com/',
    msgVersion: 1,
  },
};

const network = process.env.NETWORK ? networks[process.env.NETWORK] : networks.testnet;
const version = bytes.pack(network.id, network.msgVersion);

const zilliqa = (() => {
  if (typeof window!== 'undefined' && typeof window.zilPay !== 'undefined') {
    console.log('loading from ZilPay');
    return window.zilPay;
  }
  console.log('Loading custom instance');
  return new Zilliqa(network.url);
})();

if (process.env.PRIVATE_KEY) zilliqa.wallet.addByPrivateKey(process.env.PRIVATE_KEY);

module.exports = { zilliqa, network, version };
