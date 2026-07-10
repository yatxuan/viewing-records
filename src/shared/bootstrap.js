import { createApp } from "vue";
import "vfonts/Lato.css";
import "vfonts/FiraCode.css";
import "./styles.css";

export function mountPage(rootComponent) {
  const app = createApp(rootComponent);
  app.mount("#app");
}
