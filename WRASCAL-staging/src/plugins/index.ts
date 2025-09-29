/**
 * plugins/index.ts
 *
 * Automatically included in `./src/main.ts`
 */

// Plugins
import { loadFonts } from './webfontloader'
import vuetify from './vuetify'
import router from '../router'
import pinia from "@/plugins/pinia";
import LoadScript from 'vue-plugin-load-script';

// Types
import type { App } from 'vue'
import {createMetaManager} from "vue-meta";

export function registerPlugins (app: App) {
  loadFonts()
  app
    .use(vuetify)
    .use(router)
    .use(pinia)
    .use(LoadScript)
    .use(createMetaManager())
}
