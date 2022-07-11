module.exports = {
  pluginOptions: {
    electronBuilder: {
      customFileProtocol: "./",
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
      nodeIntegration: true,
      experimentalNativeDepCheck: true,
    },
  },
  productionSourceMap: false,
};
