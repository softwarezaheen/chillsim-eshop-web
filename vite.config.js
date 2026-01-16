import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { loadEnv } from "vite";
import fs from "fs";
import path from "path";
import crypto from "crypto";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  //EXPLANATION : remove console on qa env
  console.log(mode, "mmmmmmmmmmmmmmmmmmmm");

  let currentMode = mode === "dev" ? "development" : mode;
  let buildDrop =
    mode === "production" || mode === "sales" ? ["console", "debugger"] : [];

  const copyFile = (src, dest) => {
    if (!fs.existsSync(src)) {
      console.warn(`Skipping copy: Source file does not exist → ${src}`);
      return;
    }

    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
    console.log(`Copied ${src} → ${dest}`);
  };

  // Run the copy on config load
  copyFile(
    `./config/well-known/${currentMode}/accesslinks.json`,
    "./public/.well-known/assetlinks.json",
  );
  copyFile(
    `./config/well-known/${currentMode}/apple-app-site-association`,
    "./public/.well-known/apple-app-site-association",
  );
  // ⚠️ CRITICAL: Apple Pay domain verification file must NOT have .txt extension
  copyFile(
    `./config/well-known/${currentMode}/apple-developer-merchantid-domain-association`,
    "./public/.well-known/apple-developer-merchantid-domain-association",
  );

  return {
    base: "/",
    plugins: [
      react(),
      {
        name: "sw-env-replace",
        configureServer(server) {
          // Replace env variables during development
          server.middlewares.use((req, res, next) => {
            if (req.url === "/firebase-messaging-sw.js") {
              let swContent = fs.readFileSync(
                "./public/firebase-messaging-sw.js",
                "utf-8",
              );

              swContent = swContent
                .replace("__VITE_FIREBASE_API_KEY__", env.VITE_APP_API_KEY)
                .replace(
                  "__VITE_FIREBASE_AUTH_DOMAIN__",
                  env.VITE_APP_AUTH_DOMAIN,
                )
                .replace(
                  "__VITE_FIREBASE_PROJECT_ID__",
                  env.VITE_APP_PROJECT_ID,
                )
                .replace(
                  "__VITE_FIREBASE_STORAGE_BUCKET__",
                  env.VITE_APP_STORAGE_BUCKET,
                )
                .replace(
                  "__VITE_FIREBASE_MESSAGING_SENDER_ID__",
                  env.VITE_APP_MESSAGING_SENDER_ID,
                )
                .replace("__VITE_FIREBASE_APP_ID__", env.VITE_APP_APP_ID);

              res.setHeader("Content-Type", "application/javascript");
              res.end(swContent);
            } else {
              next();
            }
          });
        },
        buildStart() {
          console.log("🔍 buildStart hook called - generating version.json");
          
          // Generate version.json in PUBLIC folder so Vite copies it to dist
          const publicDir = "./public";
          
          // ✅ Generate version metadata for build tracking
          const buildHash = crypto.randomBytes(8).toString("hex");
          const versionData = {
            version: buildHash,
            timestamp: new Date().toISOString(),
            mode: currentMode,
          };

          fs.writeFileSync(
            `${publicDir}/version.json`,
            JSON.stringify(versionData, null, 2)
          );
          console.log(`✅ Build version generated: ${buildHash}`);
          console.log(`   Version file created in public/ (will be copied to dist/)`);
        },
        buildEnd() {
          console.log("🔍 buildEnd hook called");
          const publicDir = "./public";
          const distDir = "./dist";

          // Ensure dist directory exists
          if (!fs.existsSync(distDir)) {
            fs.mkdirSync(distDir, { recursive: true });
          }

          // Copy and process the service worker
          let swContent = fs.readFileSync(
            `${publicDir}/firebase-messaging-sw.js`,
            "utf-8",
          );

          swContent = swContent
            .replace("__VITE_FIREBASE_API_KEY__", env.VITE_APP_API_KEY)
            .replace("__VITE_FIREBASE_AUTH_DOMAIN__", env.VITE_APP_AUTH_DOMAIN)
            .replace("__VITE_FIREBASE_PROJECT_ID__", env.VITE_APP_PROJECT_ID)
            .replace(
              "__VITE_FIREBASE_STORAGE_BUCKET__",
              env.VITE_APP_STORAGE_BUCKET,
            )
            .replace(
              "__VITE_FIREBASE_MESSAGING_SENDER_ID__",
              env.VITE_APP_MESSAGING_SENDER_ID,
            )
            .replace("__VITE_FIREBASE_APP_ID__", env.VITE_APP_APP_ID);

          // Ensure the file is copied to dist
          fs.writeFileSync(`${distDir}/firebase-messaging-sw.js`, swContent);
          console.log("✅ Service worker copied to dist");
        },
      },
    ],
    test: {
      setupFiles: ["src/Tests/vitest.setup.js"],
      globals: true,
      environment: "jsdom",
      include: ["src/**/*.test.{js,jsx,ts,tsx}"], // ✅ This includes all test files
      coverage: {
        reporter: ["text", "lcov", "html"], // ✅ Add HTML report for nice visualization
        all: true,
        include: ["src/**/*.{js,jsx,ts,tsx}"], // ✅ Source files for coverage
        exclude: [
          "**/*.test.{js,jsx,ts,tsx}", // ✅ Don't include test files in coverage
          "**/node_modules/**",
          "**/mocks/**",
        ],
      },
    },
    esbuild: {
      drop: buildDrop,
    },
    build: {
      outDir: "dist",
      server: {
        historyApiFallback: true,
      },
      rollupOptions: {
        input: {
          app: "./index.html",
        },
        // NOTE: Manual chunking removed - was causing circular dependency issues
        // with store/auth/axios modules loading in wrong order.
        // React.lazy() route splitting still provides good code splitting.
      },
    },
  };
});
