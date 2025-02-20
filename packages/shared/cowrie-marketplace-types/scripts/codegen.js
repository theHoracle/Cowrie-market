const codegen = require('@cosmwasm/ts-codegen').default;

codegen({
  contracts: [
    {
      name: 'cowrie-marketplace',
      dir: './contracts/'
    },
  ],
  outPath: './src/',
  options: {
    bundle: {
      bundleFile: 'index.ts',
      scope: 'contracts'
    },
    messageComposer: {
      enabled: true
    },
    useContractsHooks: {
      enabled: false // if you enable this, add react!
    },
    reactQuery: {
      enabled: true,
      version: "v4",
      queryKeys: true,
      mutations: true,
    }
  }
}).then(() => {
  console.log('✨ all done!');
});
