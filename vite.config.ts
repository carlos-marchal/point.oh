import path from "path";
import { UserConfig } from "vite";

const config: UserConfig = {
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/mod.ts"),
      name: "point.oh",
    },
    outDir: "build",
    sourcemap: true,
  },
};

export default config;
