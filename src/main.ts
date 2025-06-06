import { createApp } from "vue";
import { createPinia } from "pinia";

import { Quasar, Notify } from "quasar";
// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/material-icons-outlined/material-icons-outlined.css'
import '@quasar/extras/material-icons-round/material-icons-round.css'
import '@quasar/extras/material-icons-sharp/material-icons-sharp.css'
import '@quasar/extras/material-symbols-outlined/material-symbols-outlined.css'
import '@quasar/extras/material-symbols-rounded/material-symbols-rounded.css'
import '@quasar/extras/material-symbols-sharp/material-symbols-sharp.css'
import '@quasar/extras/mdi-v7/mdi-v7.css'
import '@quasar/extras/fontawesome-v5/fontawesome-v5.css'
import '@quasar/extras/fontawesome-v6/fontawesome-v6.css'
import '@quasar/extras/ionicons-v4/ionicons-v4.css'
import '@quasar/extras/eva-icons/eva-icons.css'
import '@quasar/extras/themify/themify.css'
import '@quasar/extras/line-awesome/line-awesome.css'
import '@quasar/extras/bootstrap-icons/bootstrap-icons.css'

// Import Quasar css
import "quasar/src/css/index.sass";
import "./style.css";
import App from "./App.vue";
import AppRegistry from "./components";
import router from "./router/index";


const spastaApp = createApp(App);
const pinia = createPinia();


AppRegistry(spastaApp);
spastaApp
  .use(Quasar, {
    plugins: {
      Notify
    },
    config: {
      notify: {
        /* optional global config like position, color, timeout */
        position: 'top',
        timeout: 2500,
        textColor: 'white',
        actions: [{ icon: 'close', color: 'white' }]
      }
    }
  })
  .use(pinia)
  .use(router)
  .mount("#app");

