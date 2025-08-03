import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import os from 'os';

function getWiFiIP() {
  const interfaces = os.networkInterfaces();
  const wifiNames = ['Wi-Fi', 'en0', 'en1', 'wlan0', 'wlp2s0'];
  
  for (const name of wifiNames) {
    if (interfaces[name]) {
      const ipv4 = interfaces[name].find(addr => 
        addr.family === 'IPv4' && !addr.internal
      );
      if (ipv4) return ipv4.address;
    }
  }
  return '0.0.0.0';
}

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react(), tailwindcss()],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src"),
        },
    },
    server: {
        host: getWiFiIP(),
        port: 5173,
        proxy: {
            '/analyze': {
                target: 'http://localhost:5050',
                changeOrigin: true,
                secure: false,
            },
            '/analyze/export-tifs': {
                target: 'http://localhost:5050',
                changeOrigin: true,
                secure: false,
            }
            // Add any other backend endpoints
        }
    },
});