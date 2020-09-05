require('dotenv').config();
const { units } = require('@zilliqa-js/util');

module.exports = {
  contracts: [
    {
      name: 'GoFundMi',
      init: [
        {
          vname: 'owner',
          type: 'ByStr20',
          value: process.env.OWNER_ADDRESS,
        },
      ],
      transitions: [
        {
          name: 'AddNode',
          params: [
            { vname: 'address', type: 'ByStr20' },
          ],
        },
        {
          name: 'AddNode',
          params: [
            { vname: 'address', type: 'ByStr20' },
          ],
        },
        {
          name: 'UpdateOrCreateRatings',
          params: [
            { vname: 'target', type: 'String' },
            { vname: 'ratingType', type: 'String' },
            { vname: 'ratingValue', type: 'String' },
          ],
        },
      ],
    },
  ],
};
