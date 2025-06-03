import { createApp } from 'vue'
import './style.css'
import {Quasar} from "quasar"
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/material-icons-outlined/material-icons-outlined.css'
import '@quasar/extras/ionicons-v4/ionicons-v4.css'
import '@quasar/extras/eva-icons/eva-icons.css'
import '@quasar/extras/themify/themify.css'

// Import Quasar css
import 'quasar/src/css/index.sass'
import App from './App.vue'
import AppRegistry from './components'

const spastaApp = createApp(App)
AppRegistry(spastaApp)
spastaApp.use(Quasar, {
    plugins:{}
}).mount('#app')
