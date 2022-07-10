module.exports = {
  chainWebpack: (config) => {
    config.plugin("html").tap((args) => {
      args[0].filename = "index.html";
      args[0].template = "./src/index.ejs";
      return args;
    });
  },
  configureWebpack: {
    devtool: "source-map",
  },
  pluginOptions: {
    productionSourceMap: false,
    electronBuilder: {
      customFileProtocol: "./",
      nodeIntegration: true,
      experimentalNativeDepCheck: true,
      builderOptions: {
        productName: "Vault: Personal",
        appId: "playerberry.vault.personal",
        dmg: {
          contents: [
            {
              x: 410,
              y: 150,
              type: "link",
              path: "/Applications",
            },
            {
              x: 130,
              y: 150,
              type: "file",
            },
          ],
        },
        mac: {
          icon: "public/logo.icns",
          category: "Utility",
          extendInfo: {
            LSUIElement: 1,
          },
          target: {
            target: "default",
            arch: "universal",
          },
          asar: false,
          artifactName: "${productName}-${version}-${os}-${arch}.${ext}",
          asarUnpack: ["**/node_modules/sharp/**"],
        },
        win: {
          icon: "public/logo.ico",
          publish: {
            provider: "github",
          },
          extraResources: ["node_modules/regedit/vbs/*"],
        },
        nsis: {
          deleteAppDataOnUninstall: true,
        },
        protocols: [
          {
            name: "vault-personal",
            role: "Viewer",
            schemes: ["vault-personal"],
          },
        ],
      },
    },
  },
};
