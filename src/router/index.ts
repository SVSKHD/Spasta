import { createMemoryHistory, createRouter } from "vue-router";

import HomeView from "../pages/homeview.vue";
import layout from "../layouts/commonLayout/layout.vue";

const routes = [
  {
    name: "layout",
    path: "/layout",
    component: layout,
    children: [{ path: "/", component: HomeView }],
  },
];

const router = createRouter({
  history: createMemoryHistory(),
  routes,
});

export default router;
