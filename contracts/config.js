require('dotenv').config();

module.exports = {
  contracts: [
    {
      name: 'RatingsNode',
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
            { vname: 'payload', type: 'List Rating' },
          ],
        },
      ],
    },
  ],
};
