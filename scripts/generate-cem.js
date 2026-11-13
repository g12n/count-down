// Generates custom-elements.json from the JSDoc in src/. Run with `npm run cem`.
import { writeFileSync } from "node:fs";
import { generateCem } from "@wc-toolkit/cem-generator";

const manifest = generateCem({
	tsConfigPath: "tsconfig.json",
	include: ["src/**/*.js"],
});

writeFileSync("custom-elements.json", `${JSON.stringify(manifest, null, "\t")}\n`);
console.log("wrote custom-elements.json");
