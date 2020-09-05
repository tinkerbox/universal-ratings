const { BN, Long, units } = require('@zilliqa-js/util');
const { toBech32Address } = require('@zilliqa-js/crypto');

const { zilliqa, network, version } = require('./index');

const DEFAULT_GAS_LIMIT = 8000;

const Contracts = (deployments, { contracts }) => {
  const makeTransition = (contract, name, attributes = {}) => {
    return async (params, options = {}) => {
      const {
        amount = 0,
        gasPrice = (await zilliqa.blockchain.getMinimumGasPrice()).result,
        gasLimit = DEFAULT_GAS_LIMIT,
      } = options;

      const formattedParams = attributes.map((attribute) => {
        return { ...attribute, value: params[attribute.vname] };
      });

      console.log(`Calling transition ${name}() on contract ${toBech32Address(contract.address)}...`);

      const txn = await contract.call(
        name,
        formattedParams,
        {
          version,
          amount: new BN(units.toQa(amount, units.Units.Zil)),
          gasPrice: new BN(gasPrice),
          gasLimit: Long.fromNumber(gasLimit),
        },
      );

      if (txn.receipt) {
        const url = `https://viewblock.io/zilliqa/tx/${txn.id}${network.viewblockId ? `?network=${network.viewblockId}` : ''}`;
        if (txn.receipt.success) console.log(`Successully invoked transition (${url})`);
        else console.error(`Transition failed with: ${Object.values(txn.receipt.errors)} (${url})`);
        return txn;
      }

      const url = `https://viewblock.io/zilliqa/tx/${txn.TranID}${network.viewblockId ? `?network=${network.viewblockId}` : ''}`;
      await zilPay.wallet.observableTransaction(txn.TranID).subscribe(async ([txnHash]) => {
        const completedTxn = await zilliqa.blockchain.getTransaction(txnHash);
        console.log(`${txnHash[0]} is confirmed`, txn.receipt)
        return completedTxn;
      })
    };
  };

  const makeContract = (name) => {
    const config = contracts.find(e => e.name === name);
    return (address) => {
      const contract = zilliqa.contracts.at(address);

      const getState = () => contract.getState();
      const getInit = async () => {
        const values = await contract.getInit();
        return values
            .filter(({ vname }) => !vname.startsWith('_'))
            .reduce((acc, { vname, value }) => {
              acc[vname] = value;
              return acc;
            }, {});
      };

      const transitions = config.transitions.reduce((acc, e) => {
        acc[e.name] = makeTransition(contract, e.name, e.params);
        return acc;
      }, {});

      return {
        name,
        contract,
        getState,
        getInit,
        ...transitions,
      };
    };
  };

  return Object.keys(deployments).reduce((acc, key) => {
    const address = deployments[key];
    const constructor = makeContract(key);
    acc[key] = constructor(address);
    return acc;
  }, {});
};

module.exports = Contracts;
