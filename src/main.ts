import { createApp } from "vue";
import { createPinia } from "pinia";
import Toast, { type PluginOptions, POSITION } from "vue-toastification";
import "vue-toastification/dist/index.css";
import router from "./router";
import App from "./App.vue";
import "./style.css";

// Import global components
import components from "./components";

// 🆕 Import auth store
import { useAuthStore } from "./store/authStore";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);

// 🆕 Initialize auth listener *after* using Pinia
const authStore = useAuthStore();
authStore.initAuthListener();

app.use(router);
app.use(components);
app.use(Toast, {
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
});

app.mount("#app");
