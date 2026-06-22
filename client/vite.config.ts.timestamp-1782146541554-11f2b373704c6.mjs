// vite.config.ts
import { defineConfig } from "file:///C:/Users/Cliente/Desktop/joas/app-agendamento/client/node_modules/vite/dist/node/index.js";
import vue from "file:///C:/Users/Cliente/Desktop/joas/app-agendamento/client/node_modules/@vitejs/plugin-vue/dist/index.mjs";
import { fileURLToPath, URL } from "node:url";
var __vite_injected_original_import_meta_url = "file:///C:/Users/Cliente/Desktop/joas/app-agendamento/client/vite.config.ts";
var vite_config_default = defineConfig({
  plugins: [vue()],
  // .env centralizado em server/ — o Vite lê as VITE_* de lá.
  envDir: fileURLToPath(new URL("../server", __vite_injected_original_import_meta_url)),
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", __vite_injected_original_import_meta_url))
    }
  },
  server: {
    port: 5173,
    // Em dev, encaminha /api para a API local (porta 3000). Assim o front
    // usa "/api" relativo igual em produção — funciona em localhost e na rede.
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true
      }
    }
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxDbGllbnRlXFxcXERlc2t0b3BcXFxcam9hc1xcXFxhcHAtYWdlbmRhbWVudG9cXFxcY2xpZW50XCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxDbGllbnRlXFxcXERlc2t0b3BcXFxcam9hc1xcXFxhcHAtYWdlbmRhbWVudG9cXFxcY2xpZW50XFxcXHZpdGUuY29uZmlnLnRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9DbGllbnRlL0Rlc2t0b3Avam9hcy9hcHAtYWdlbmRhbWVudG8vY2xpZW50L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgdnVlIGZyb20gJ0B2aXRlanMvcGx1Z2luLXZ1ZSc7XG5pbXBvcnQgeyBmaWxlVVJMVG9QYXRoLCBVUkwgfSBmcm9tICdub2RlOnVybCc7XG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyh7XG4gIHBsdWdpbnM6IFt2dWUoKV0sXG4gIC8vIC5lbnYgY2VudHJhbGl6YWRvIGVtIHNlcnZlci8gXHUyMDE0IG8gVml0ZSBsXHUwMEVBIGFzIFZJVEVfKiBkZSBsXHUwMEUxLlxuICBlbnZEaXI6IGZpbGVVUkxUb1BhdGgobmV3IFVSTCgnLi4vc2VydmVyJywgaW1wb3J0Lm1ldGEudXJsKSksXG4gIHJlc29sdmU6IHtcbiAgICBhbGlhczoge1xuICAgICAgJ0AnOiBmaWxlVVJMVG9QYXRoKG5ldyBVUkwoJy4vc3JjJywgaW1wb3J0Lm1ldGEudXJsKSksXG4gICAgfSxcbiAgfSxcbiAgc2VydmVyOiB7XG4gICAgcG9ydDogNTE3MyxcbiAgICAvLyBFbSBkZXYsIGVuY2FtaW5oYSAvYXBpIHBhcmEgYSBBUEkgbG9jYWwgKHBvcnRhIDMwMDApLiBBc3NpbSBvIGZyb250XG4gICAgLy8gdXNhIFwiL2FwaVwiIHJlbGF0aXZvIGlndWFsIGVtIHByb2R1XHUwMEU3XHUwMEUzbyBcdTIwMTQgZnVuY2lvbmEgZW0gbG9jYWxob3N0IGUgbmEgcmVkZS5cbiAgICBwcm94eToge1xuICAgICAgJy9hcGknOiB7XG4gICAgICAgIHRhcmdldDogJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCcsXG4gICAgICAgIGNoYW5nZU9yaWdpbjogdHJ1ZSxcbiAgICAgIH0sXG4gICAgfSxcbiAgfSxcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUE0VixTQUFTLG9CQUFvQjtBQUN6WCxPQUFPLFNBQVM7QUFDaEIsU0FBUyxlQUFlLFdBQVc7QUFGMEwsSUFBTSwyQ0FBMkM7QUFJOVEsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUyxDQUFDLElBQUksQ0FBQztBQUFBO0FBQUEsRUFFZixRQUFRLGNBQWMsSUFBSSxJQUFJLGFBQWEsd0NBQWUsQ0FBQztBQUFBLEVBQzNELFNBQVM7QUFBQSxJQUNQLE9BQU87QUFBQSxNQUNMLEtBQUssY0FBYyxJQUFJLElBQUksU0FBUyx3Q0FBZSxDQUFDO0FBQUEsSUFDdEQ7QUFBQSxFQUNGO0FBQUEsRUFDQSxRQUFRO0FBQUEsSUFDTixNQUFNO0FBQUE7QUFBQTtBQUFBLElBR04sT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLE1BQ2hCO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
