import { createApp } from "vue";

import { Quasar } from "quasar";
import "@quasar/extras/material-icons/material-icons.css";
import "@quasar/extras/material-icons-outlined/material-icons-outlined.css";
import "@quasar/extras/ionicons-v4/ionicons-v4.css";
import "@quasar/extras/eva-icons/eva-icons.css";
import "@quasar/extras/themify/themify.css";

// Import Quasar css
import "quasar/src/css/index.sass";
import "./style.css";
import App from "./App.vue";
import AppRegistry from "./components";
import router from "./router/index";

const spastaApp = createApp(App);
AppRegistry(spastaApp);
spastaApp
  .use(Quasar, {
    plugins: {},
  })
  .use(router)
  .mount("#app");
