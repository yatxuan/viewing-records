import { createApp, h } from "vue";
import { dateZhCN, NConfigProvider, zhCN } from "naive-ui";
import "vfonts/Lato.css";
import "vfonts/FiraCode.css";
import "./styles.css";

export function mountPage(rootComponent) {
  const app = createApp({
    render() {
      return h(NConfigProvider, { locale: zhCN, dateLocale: dateZhCN }, { default: () => h(rootComponent) });
    },
  });
  app.mount("#app");
}
