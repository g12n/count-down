// Shared formatting options for @wc-toolkit/cem-utilities.
// Used by scripts/generate-readmes.js and docs/_data/components.js so the
// READMEs and the docs site render the same sections.
// See https://wc-toolkit.com/cem-utilities/descriptions/

// Lifecycle callbacks and internals are not part of the public API.
const hiddenMethods = new Set([
	"attributeChangedCallback",
	"connectedCallback",
	"disconnectedCallback",
	"tick",
	"setExclusiveState",
]);
const hiddenProperties = new Set(["intervalId"]);

const text = (value) => (value ? ` ${value}`.replace(/\s+/g, " ") : "");

export const options = {
	order: ["attrsAndProps", "events", "slots", "methods", "cssProps", "cssParts", "cssState"],
	descriptionSrc: "description",
	sectionHeadingLevel: 2,
	apis: {
		attrsAndProps: {
			heading: "Attributes & Properties",
			description: "Set attributes in HTML or the matching properties in JavaScript.",
			template: (api) =>
				(api ?? [])
					.filter(
						(prop, _i, all) =>
							prop.attrName ||
							(!hiddenProperties.has(prop.propName) &&
								// the manifest does not link an attribute to its property; hide the duplicate
								!all.some((other) => other.attrName === prop.propName)),
					)
					.map((prop) => {
						const name =
							prop.attrName && prop.propName && prop.attrName !== prop.propName
								? `\`${prop.attrName}\` / \`${prop.propName}\``
								: `\`${prop.attrName ?? prop.propName}\``;
						const flags = `${prop.attrName ? "" : " (property only)"}${prop.readonly ? " (readonly)" : ""}`;
						const type = prop.type?.text ? `\n  - Type: \`${prop.type.text}\`` : "";
						return `- ${name}:${text(prop.description)}${flags}${type}`;
					})
					.join("\n"),
		},
		methods: {
			heading: "Methods",
			description: "Methods that can be called on the element.",
			template: (api) =>
				(api ?? [])
					.filter((method) => !hiddenMethods.has(method.name))
					.map((method) => `- \`${method.type?.text ?? method.name}\`${method.description ? `:${text(method.description)}` : ""}`)
					.join("\n"),
		},
		cssState: {
			heading: "CSS States",
			description: "Match these with the `:state()` pseudo-class.",
			template: (api) =>
				(api ?? [])
					.map((state) => `- \`:state(${state.name})\`:${text(state.description)}`)
					.join("\n"),
		},
	},
};
