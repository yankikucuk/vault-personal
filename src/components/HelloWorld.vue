<script>
import { ipcRenderer } from "electron";

export default {
  name: "HelloWorld",
  data() {
    return {
      updater: {
        status: null, // checking-for-update, update-available, update-not-available, error, download-progress, update-downloaded
        progress: null,
        scheduleId: null, // for 2h auto-updater
        version: null,
        path: null,
        releaseNotes: null,
      },
      isMac: process.platform === "darwin",
    };
  },
  mounted() {
    ipcRenderer.on("updaterHandler", (_event, status, arg) => {
      if (status === "checkForUpdates") {
        this.updater.version = arg.updateInfo.version;
        return;
      }
      this.updater.status = status;
      if (status === "download-progress") {
        this.updater.progress = Math.floor(arg.percent);
      }
      if (status === "update-available") {
        this.updater.path = `https://github.com/yankikucuk/vault-personal/releases/download/v${arg.version}/${arg.path}`;
        this.updater.releaseNotes = arg.releaseNotes || "";
      }
    });

    setTimeout(this.checkCompanionUpdates, 1000 * 3600 * 2);
  },
  methods: {
    checkCompanionUpdates() {
      ipcRenderer.invoke("checkUpdates", false);
      // check for app updates in 2 hours
      if (this.updater.scheduleId) clearTimeout(this.updater.scheduleId);
      this.updater.scheduleId = setTimeout(
        this.checkCompanionUpdates,
        1000 * 3600 * 2
      );
    },
    installUpdates() {
      ipcRenderer.invoke("installUpdates");
    },
  },
};
</script>

<template>
  <div>
    <h1>Vault: Personal</h1>
    <!--<a :href="updater.path" v-if="updater.status === 'update-available'"
      >yeni güncellemeyi indir</a
    >-->
    <br />
    <i v-if="updater.status === 'update-downloaded'" @click="installUpdates"
      >güncellemeyi yükle</i
    >
    <br />
    <div v-if="updater.status === 'checking-for-update'">Güncellemeler Kontrol Ediliyor...</div>
    <div v-if="updater.status === 'download-progress'">
      {{ updater.progress }}
    </div>
  </div>
</template>
