import { createApp } from "vue";
import { createPinia } from "pinia";
import Toast, { type PluginOptions, POSITION } from "vue-toastification";
import "vue-toastification/dist/index.css";
import router from "./router";
import App from "./App.vue";
import "./style.css";

// Import global components
import components from "./components";

const pinia = createPinia();
const app = createApp(App);

const toastOptions: PluginOptions = {
  position: POSITION.BOTTOM_RIGHT,
  timeout: 3000,
  closeOnClick: true,
  pauseOnFocusLoss: true,
  pauseOnHover: true,
  draggable: true,
  draggablePercent: 0.6,
  showCloseButtonOnHover: true,
  hideProgressBar: false,
  closeButton: "button",
  icon: true,
  rtl: false,
  transition: "Vue-Toastification__bounce",
  maxToasts: 5,
  newestOnTop: true,
  toastClassName: "spasta-toast",
  bodyClassName: ["spasta-toast-body"],
  containerClassName: "spasta-toast-container",
};

app.use(pinia);
app.use(router);
app.use(components);
app.use(Toast, toastOptions);
app.mount("#app");
