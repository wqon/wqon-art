// @ts-check
import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  output: "static",
  trailingSlash: "ignore",

  server: {
    port: 6363,
  },

  integrations: [mdx()],
});
