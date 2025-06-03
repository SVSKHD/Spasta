import { createApp } from 'vue'
import './style.css'
import {Quasar} from "quasar"
import App from './App.vue'

const spastaApp = createApp(App)

spastaApp.use(Quasar, {
    plugins:{}
}).mount('#app')
