// import { createLinter } from "textlint/lib/src/index";

export let linter: ReturnType<typeof createLinter> | undefined;
const initLinter = async () => {
  console.log("initializing linter");
  try {
    console.log("import roas");
    const rossau = moduleInterop(
      //@ts-expect-error: no ts definition
      (await import("textlint-rule-rousseau")).default,
    );

    const customDescriptor = new TextlintKernelDescriptor({
      plugins: [
        {
          pluginId: "textlint-rule-rousseau",

          plugin: rossau,
        },
      ],
      rules: [],
      filterRules: [],
    });
    linter = createLinter({
      // merge customDescriptor and textlintrcDescriptor
      // if same ruleId or pluginId, customDescriptor is used.
      descriptor: customDescriptor,
    });
  } catch (error) {
    console.error(error);
  }
};
// initLinter().catch((error) => {
//   console.error(error);
// });
