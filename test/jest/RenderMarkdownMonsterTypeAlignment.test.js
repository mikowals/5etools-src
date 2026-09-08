import "../../js/parser.js";
import "../../js/utils.js";
import "../../js/render.js";
import "../../js/render-markdown.js";
import "../../js/utils-config.js";

/**
 * `Parser.monTypeToFullObj` returns `asText` as a string, so the separator check in
 * `_getCommonMdParts_sizeTypeAlignment` must read `asText`, not `asText.asText`.
 *
 * The separator is a semicolon where the rendered type text itself contains a comma
 * -- e.g. "Celestial, Fey, or Fiend" -- so that the alignment stays legible.
 *
 * `_getCommonMdParts_sizeTypeAlignment` lives on the shared base class, so both the
 * classic and one ("2024") bestiary renderers are covered.
 */

const getSizeTypeAlignmentLine = ({mon, styleHint}) => {
	VetoolsConfig.set("styleSwitcher", "style", styleHint);
	return RendererMarkdown.monster
		.getCompactRenderedString(mon, {meta: {depth: 0, _typeStack: []}})
		.split("\n")
		.find(it => it.startsWith(">*"));
};

describe.each(["classic", "one"])("Markdown monster size/type/alignment (%s)", (styleHint) => {
	it("Should separate a comma-free type from the alignment with a comma", () => {
		expect(
			getSizeTypeAlignmentLine({
				styleHint,
				mon: {
					name: "Test Elemental",
					size: ["M"],
					type: "elemental",
					alignment: ["N"],
				},
			}),
		).toBe(">*Medium Elemental, Neutral*");
	});

	it("Should separate a type containing a comma from the alignment with a semicolon", () => {
		expect(
			getSizeTypeAlignmentLine({
				styleHint,
				mon: {
					name: "Test Steed",
					size: ["L"],
					type: {type: {choose: ["celestial", "fey", "fiend"]}},
					alignment: ["N"],
				},
			}),
		).toBe(">*Large Celestial, Fey, or Fiend; Neutral*");
	});

	it("Should render a tagged type", () => {
		expect(
			getSizeTypeAlignmentLine({
				styleHint,
				mon: {
					name: "Test Wizard",
					size: ["M"],
					type: {type: "undead", tags: ["wizard"]},
					alignment: ["L", "E"],
				},
			}),
		).toBe(">*Medium Undead (Wizard), Lawful Evil*");
	});
});
