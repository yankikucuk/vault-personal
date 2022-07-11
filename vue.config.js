module.exports = {
  productionSourceMap: false,
  pluginOptions: {
    electronBuilder: {
      customFileProtocol: "./",
      nodeIntegration: true,
      experimentalNativeDepCheck: true,
      builderOptions: {
        productName: "Vault: Personal",
        appId: "playerberry.vault.personal",
        asar: false,
        win: {
          icon: "public/logo.ico",
          publish: {
            provider: "github",
          },
        },
        nsis: {
          deleteAppDataOnUninstall: true,
        },
      },
    },
  },
};
