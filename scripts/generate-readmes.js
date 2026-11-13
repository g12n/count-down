// Generates src/<component>/README.md from custom-elements.json.
// Run with `npm run readme` (also runs as part of `npm run cem`).
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import {
	getAllComponents,
	getComponentDetailsTemplate,
	getMainComponentDescription,
} from "@wc-toolkit/cem-utilities";
import { options } from "./readme-options.js";

const manifest = JSON.parse(readFileSync("custom-elements.json", "utf8"));
const pkg = JSON.parse(readFileSync("package.json", "utf8"));

// Map each tag name to the directory of the module that declares it.
const dirByTag = new Map();
for (const mod of manifest.modules) {
	for (const decl of mod.declarations ?? []) {
		if (decl.tagName) dirByTag.set(decl.tagName, dirname(mod.path));
	}
}

for (const component of getAllComponents(manifest)) {
	const dir = dirByTag.get(component.tagName);
	if (!dir) continue;

	// "./count-down" -> src/count-down/count-down.js, "./count-down/define" -> .../define.js
	const base = `./${dir.split("/").pop()}`;
	const classFile = Object.keys(pkg.exports).find((key) => key === base);
	const defineFile = Object.keys(pkg.exports).find((key) => key === `${base}/define`);

	const usage = [
		"## Usage",
		"",
		"```js",
		`import "${pkg.name}${defineFile?.slice(1) ?? ""}"; // registers <${component.tagName}>`,
		"```",
		"",
		"```html",
		`<${component.tagName}></${component.tagName}>`,
		"```",
		classFile ? `\nThe class is exported from \`${pkg.name}${classFile.slice(1)}\`.` : "",
	].join("\n");

	const body = getComponentDetailsTemplate(component, options)
		// the template repeats the main description at the top
		.replace(getMainComponentDescription(component) ?? "", "")
		.trim();

	const readme = [
		`# ${component.tagName}`,
		"",
		getMainComponentDescription(component),
		"",
		usage,
		"",
		body,
		"",
	].join("\n");

	writeFileSync(join(dir, "README.md"), readme);
	console.log(`wrote ${join(dir, "README.md")}`);
}
