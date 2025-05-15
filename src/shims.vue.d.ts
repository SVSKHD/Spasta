// filepath: c:\Users\hithesh_sunkara\Desktop\personal\Spasta\src\shims-vue.d.ts
declare module "*.vue" {
  import { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}