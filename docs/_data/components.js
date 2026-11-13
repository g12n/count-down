import { readFileSync, existsSync } from "node:fs";

import {
	getComponentDetailsTemplate,
	getComponentByTagName,
	getAllComponents,
} from "@wc-toolkit/cem-utilities";

import { options } from "../../scripts/readme-options.js";
import manifest from "../../custom-elements.json" with { type: "json" };

const components = getAllComponents(manifest);

export default function () {
	for (const index in components) {
		const component = components[index];

	

		components[index].componentDetails = getComponentDetailsTemplate(
			component,
			// the site renders each component under an h2, so its sections are h3
			{ ...options, sectionHeadingLevel: 3 },
		);

        components[index].examples = existsSync(`src/${component.tagName}/examples.md`)
			? readFileSync(`src/${component.tagName}/examples.md`, "utf8")
			: "";
	}
	return components;
}
