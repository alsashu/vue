import { createApp } from "vue";
import App from "./App.vue";
import ContactUs from "./components/ContactUs.vue";
import ButtonCounter from "./components/ButtonCounter.vue";
import ButtonDecrementCounter from "./components/ButtonDecrementCounter.vue";
import GloblaComponent from "./components/GloblaComponent.vue";

const app = createApp(App);

//global components
app.component("contact-us", ContactUs);
app.component("button-counter", ButtonCounter);
app.component("button-decrement-counter", ButtonDecrementCounter);
app.component("global-component", GloblaComponent);

app.mount("#app");
