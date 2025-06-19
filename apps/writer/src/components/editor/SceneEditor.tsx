import { createEffect, onCleanup, createSignal } from "solid-js";
import { EditorState, TextSelection } from "prosemirror-state";
import { EditorView } from "prosemirror-view";
import { undo, redo, history } from "prosemirror-history";
import { keymap } from "prosemirror-keymap";
import { baseKeymap, toggleMark } from "prosemirror-commands";
import {
    inputRules,
    emDash,
    smartQuotes,
    ellipsis,
} from "prosemirror-inputrules";
import shortUUID from "short-uuid";

import { contentSchema } from "./schema";
import { inlineMenuPlugin } from "./plugins/inline-menu";
import { assignIdPlugin } from "./plugins/assign-id";
import "./scene-editor.css";
import { createSuggestionsPlugin } from "./plugins/suggestions";
import { createParagraphActionsPlugin } from "./plugins/paragraph-actions";
import { createParagraphStatePlugin } from "./plugins/paragraph-state";
import { createActiveParagraphPlugin } from "./plugins/active-paragraph";
import {
    sceneParagraphsToDoc,
    docToSceneParagraphs,
    getParagraphIdAtPos,
    getParagraphRange,
} from "./utils/paragraph-conversion";

import type { Scene, SceneParagraph } from "@writer/shared";
import {
    updateSceneParagraphData,
    createSceneParagraph,
    moveParagraphUp,
    moveParagraphDown,
    removeSceneParagraph,
    updateSceneSelectedParagraph,
    scenesState,
    splitScene,
} from "../../lib/stores/scenes";
import { useAi } from "../../lib/use-ai";
import { contentSchemaToText } from "../../lib/persistence/content-schema-to-html";
import { charactersState } from "../../lib/stores/characters";
import { locationsState } from "../../lib/stores/locations";
import { findPathToNode } from "../../lib/stores/tree";

// Import the SolidJS UI components
import { InventoryActions } from "../InventoryActions";
import { PlotpointActions } from "../PlotPointActions";
import { AudioButton } from "../AudioButton";
import { setUIState, uiState } from "../../lib/stores/ui";

const italic = toggleMark(contentSchema.marks.em);

export const SceneEditor = (props: {
    sceneId: string;
}) => {
    let containerRef: HTMLDivElement | undefined;
    let view: EditorView | undefined;
    const [lastKnownParagraphs, setLastKnownParagraphs] = createSignal<SceneParagraph[]>([]);
    let isInternalUpdate = false; // Flag to prevent circular updates

    // UI state signals
    const [currentParagraphId, setCurrentParagraphId] = createSignal<string | null>(null);
    const [showInventory, setShowInventory] = createSignal(false);
    const [showPlotpoint, setShowPlotpoint] = createSignal(false);
    const [rewriteModalOpen, setRewriteModalOpen] = createSignal(false);
    const [rewriteInstructions, setRewriteInstructions] = createSignal("");
    const [translationModalOpen, setTranslationModalOpen] = createSignal(false);
    const [translationText, setTranslationText] = createSignal("");
    const [generateBetweenModalOpen, setGenerateBetweenModalOpen] = createSignal(false);
    const [generateBetweenText, setGenerateBetweenText] = createSignal("");
    const [isGenerating, setIsGenerating] = createSignal(false);

    const scene = () => scenesState.scenes[props.sceneId];

    // Helper function to update paragraph attributes in the editor
    const updateParagraphAttrs = (paragraphId: string, attrs: { extra?: string | null; extraLoading?: boolean }) => {
        if (!view) {
            console.log('updateParagraphAttrs: no view available');
            return;
        }

        const tr = view.state.tr;
        let updated = false;

        view.state.doc.descendants((node, pos) => {
            if (node.type.name === "paragraph" && node.attrs.id === paragraphId) {
                const newAttrs = {
                    ...node.attrs,
                    extra: attrs.extra !== undefined ? attrs.extra : node.attrs.extra,
                    extraLoading: attrs.extraLoading !== undefined ? (attrs.extraLoading ? "true" : null) : node.attrs.extraLoading
                };
                console.log(`updateParagraphAttrs: updating paragraph ${paragraphId}`, { oldAttrs: node.attrs, newAttrs });
                tr.setNodeMarkup(pos, null, newAttrs);
                updated = true;
                return false; // Stop iteration
            }
        });

        if (updated) {
            console.log(`updateParagraphAttrs: dispatching transaction for paragraph ${paragraphId}`);
            view.dispatch(tr);
        } else {
            console.log(`updateParagraphAttrs: paragraph ${paragraphId} not found in document`);
        }
    };

    // Get current paragraph text for audio button
    const currentParagraphText = () => {
        const paragraphId = currentParagraphId();
        if (!paragraphId) return "";

        const currentScene = scene();
        const paragraph = currentScene?.paragraphs.find(p => p.id === paragraphId);
        if (!paragraph) return "";

        return typeof paragraph.text === "string"
            ? paragraph.text
            : contentSchemaToText(paragraph.text);
    };

    const help = async (helpKind: "rewrite_spelling" | "rewrite" | "snowflake_refine_scene_style" | "snowflake_convert_perspective" | "add_sensory_details", paragraphId: string, customInstructions?: string) => {
        const currentScene = scene();
        if (!currentScene) return;

        console.log(`Starting AI help: ${helpKind} for paragraph ${paragraphId}`);

        // Show loading state in store and document
        updateSceneParagraphData(props.sceneId, paragraphId, {
            extraLoading: true,
        });
        updateParagraphAttrs(paragraphId, { extraLoading: true });

        try {
            const currentParagraph = currentScene.paragraphs.find(p => p.id === paragraphId);
            if (!currentParagraph) return;

            const currentParagraphText = typeof currentParagraph.text === "string"
                ? currentParagraph.text
                : contentSchemaToText(currentParagraph.text);

            const currentParagraphIndex = currentScene.paragraphs.findIndex(p => p.id === paragraphId);

            // Get context paragraphs
            const previousParagraphs = [];
            for (let i = 1; i <= 5; i++) {
                const prevIndex = currentParagraphIndex - i;
                if (prevIndex >= 0) {
                    const prevParagraph = currentScene.paragraphs[prevIndex];
                    const prevContent = typeof prevParagraph.text === "string"
                        ? prevParagraph.text
                        : contentSchemaToText(prevParagraph.text);
                    previousParagraphs.push(prevContent);
                }
            }

            const nextParagraph = currentScene.paragraphs[currentParagraphIndex + 1];
            const nextParagraphContent = nextParagraph ?
                (typeof nextParagraph.text === "string" ?
                    nextParagraph.text :
                    contentSchemaToText(nextParagraph.text)) : "";

            // Build character context
            const characterLines: string[] = [];
            if (currentScene.protagonistId) {
                const protagonist = charactersState.characters[currentScene.protagonistId];
                if (protagonist) {
                    characterLines.push(
                        `<perspective>${protagonist.firstName}'s ${currentScene.perspective ?? "third"}-person perspective</perspective>`,
                    );

                    const protagonistDetails = [
                        `Name: ${protagonist.firstName} ${protagonist.lastName || ""}`,
                        `Personality: ${protagonist.personality || "Not provided"}`,
                        `Personality Quirks: ${protagonist.personalityQuirks || "Not provided"}`,
                        `Likes: ${protagonist.likes || "Not provided"}`,
                        `Dislikes: ${protagonist.dislikes || "Not provided"}`,
                        `Background: ${protagonist.background || "Not provided"}`,
                        `Distinguishing Features: ${protagonist.distinguishingFeatures || "Not provided"}`,
                        `Age: ${protagonist.age || "Not provided"}`,
                        `Gender: ${protagonist.gender || "Not provided"}`,
                        `Sexual Orientation: ${protagonist.sexualOrientation || "Not provided"}`
                    ].filter(line => !line.endsWith("Not provided")).join("\n");

                    if (protagonistDetails) {
                        characterLines.push(`<protagonist_details>${protagonistDetails}</protagonist_details>`);
                    }

                    if (protagonist.writingStyle) {
                        characterLines.push(`<protagonist_writing_style>${protagonist.writingStyle}</protagonist_writing_style>`);
                    }
                }
            }

            for (const charId of currentScene?.characterIds ?? []) {
                const char = charactersState.characters[charId];
                if (!char) continue;
                const charText = `${[char.firstName, char.middleName, char.lastName]
                    .filter(Boolean)
                    .join(" ")}: ${char.personality}`;
                characterLines.push(`<present_character>${charText}</present_character>`);
            }

            for (const charId of currentScene?.referredCharacterIds ?? []) {
                const char = charactersState.characters[charId];
                if (!char) continue;
                const charText = `${[char.firstName, char.middleName, char.lastName]
                    .filter(Boolean)
                    .join(" ")}: ${char.personality}`;
                characterLines.push(
                    `<referred_character>${charText}</referred_character>`,
                );
            }

            const previousParagraphsXml = previousParagraphs
                .map((content, index) => `<previous_paragraph_${index + 1}>${content}</previous_paragraph_${index + 1}>`)
                .join('\n');

            const characterContextXml = characterLines.join('\n');

            let formattedText = `<current_paragraph>${currentParagraphText}</current_paragraph>
<next_paragraph>${nextParagraphContent}</next_paragraph>`;

            // Add custom instructions if provided
            if (customInstructions) {
                formattedText += `\n<custom_instructions>${customInstructions}</custom_instructions>`;
            }

            const result = await useAi(helpKind, [{
                text: characterContextXml,
                canCache: characterContextXml.length > 0,
            }, {
                text: previousParagraphsXml,
                canCache: previousParagraphsXml.length > 0,
            }, {
                text: formattedText,
                canCache: false,
            }]);

            console.log(`AI help completed: ${helpKind}, result length: ${result?.length || 0}`);

            // Show suggestion in store and document
            updateSceneParagraphData(props.sceneId, paragraphId, {
                extra: result,
                extraLoading: false,
            });
            updateParagraphAttrs(paragraphId, { extra: result, extraLoading: false });
        } catch (error) {
            console.error(`Failed to ${helpKind}:`, error);
            updateSceneParagraphData(props.sceneId, paragraphId, {
                extraLoading: false,
            });
            updateParagraphAttrs(paragraphId, { extraLoading: false });
        }
    };

    // Custom rewrite handler
    const handleCustomRewrite = () => {
        const paragraphId = currentParagraphId();
        if (!paragraphId || !rewriteInstructions().trim()) return;

        help("rewrite", paragraphId, rewriteInstructions());
        setRewriteModalOpen(false);
        setRewriteInstructions("");
    };

    // Translation handler
    const handleSaveTranslation = () => {
        const paragraphId = currentParagraphId();
        if (!paragraphId) return;

        updateSceneParagraphData(props.sceneId, paragraphId, {
            translation: translationText(),
        });
        setTranslationModalOpen(false);
        setTranslationText("");
    };

    // Generate between handler
    const generateBetween = async () => {
        const paragraphId = currentParagraphId();
        const currentScene = scene();
        if (!paragraphId || !currentScene) return;

        // Store the generate text in UI state for reuse
        setUIState("generateBetweenText", generateBetweenText());

        const paragraphIndex = currentScene.paragraphs.findIndex(p => p.id === paragraphId);
        if (paragraphIndex === -1) return;

        // Get context from surrounding paragraphs
        const previousParagraphs = currentScene.paragraphs.slice(0, paragraphIndex + 1);
        const nextParagraphs = currentScene.paragraphs.slice(
            paragraphIndex + 1,
            paragraphIndex + 4,
        );

        // Build character and location context
        const characterLines: string[] = [];
        if (currentScene.protagonistId) {
            const protagonist = charactersState.characters[currentScene.protagonistId];
            if (protagonist) {
                characterLines.push(
                    `<perspective>${protagonist.firstName}'s ${currentScene.perspective ?? "third"} person perspective - ${protagonist.summary}</perspective>`,
                );
            }
        }
        for (const charId of currentScene?.characterIds ?? []) {
            const char = charactersState.characters[charId];
            if (!char) continue;
            const charText = `${[char.firstName, char.middleName, char.lastName]
                .filter(Boolean)
                .join(" ")}: ${char.summary}`;
            characterLines.push(`<present_character>${charText}</present_character>`);
        }
        for (const charId of currentScene?.referredCharacterIds ?? []) {
            const char = charactersState.characters[charId];
            if (!char) continue;
            const charText = `${[char.firstName, char.middleName, char.lastName]
                .filter(Boolean)
                .join(" ")}: ${char.summary}`;
            characterLines.push(
                `<referred_character>${charText}</referred_character>`,
            );
        }

        const locationLines: string[] = [];
        if (currentScene?.locationId) {
            locationLines.push(
                `<current_location>${locationsState.locations[currentScene.locationId].description}</current_location>`,
            );
        }

        // Get chapter context
        const [bookNode, arcNode, chapterNode] = findPathToNode(props.sceneId);
        const previousChapter =
            chapterNode?.children?.[0]?.id === currentScene.id
                ? arcNode?.children?.[
                arcNode.children.findIndex((c) => c.id === chapterNode.id) - 1
                ]
                : null;

        const chapterContext = [
            '<chapter_info>',
            `<current_chapter>${chapterNode.name}</current_chapter>`,
            previousChapter
                ? `<previous_chapter>${previousChapter.name}</previous_chapter>`
                : "",
            '</chapter_info>',
        ]
            .filter(Boolean)
            .join("\n");

        const sceneContext = {
            text: [
                chapterContext,
                "<scene_setup>",
                characterLines.join("\n"),
                locationLines.join("\n"),
                "</scene_setup>",
            ].join("\n"),
            canCache: true,
        };

        setIsGenerating(true);
        try {
            const result = await useAi("generate_between", [
                sceneContext,
                {
                    text: [
                        "<previous_content>",
                        previousParagraphs
                            .map((p) =>
                                typeof p.text === "string"
                                    ? p.text
                                    : contentSchemaToText(p.text),
                            )
                            .join("\n\n"),
                        "</previous_content>",
                        "<next_content>",
                        nextParagraphs
                            .map((p) =>
                                typeof p.text === "string"
                                    ? p.text
                                    : contentSchemaToText(p.text),
                            )
                            .join("\n\n"),
                        "</next_content>",
                    ].join("\n"),
                    canCache: false,
                },
                {
                    text: `<instructions>Write content that bridges these sections with the following happening: ${generateBetweenText()}</instructions>`,
                    canCache: false,
                },
            ]);

            const paragraphs = result.split("\n\n");
            let afterId = paragraphId;
            for (const paragraph of paragraphs) {
                const newId = shortUUID.generate();
                createSceneParagraph(
                    props.sceneId,
                    {
                        id: newId,
                        text: paragraph,
                        state: "ai",
                        comments: [],
                    },
                    afterId,
                );
                afterId = newId;
            }
            setGenerateBetweenModalOpen(false);
            setGenerateBetweenText("");

            // Force editor to update with new paragraphs
            if (view) {
                const currentView = view; // Capture view reference
                setTimeout(() => {
                    const updatedScene = scenesState.scenes[props.sceneId];
                    if (updatedScene && currentView) {
                        const newDoc = sceneParagraphsToDoc(updatedScene.paragraphs);
                        const newState = EditorState.create({
                            doc: newDoc,
                            schema: contentSchema,
                            plugins: currentView.state.plugins,
                        });
                        currentView.updateState(newState);
                        setLastKnownParagraphs(updatedScene.paragraphs);
                    }
                }, 100);
            }
        } finally {
            setIsGenerating(false);
        }
    };

    onCleanup(() => {
        if (view) {
            view.destroy();
        }
    });

    createEffect(() => {
        const currentScene = scene();
        if (!currentScene || !containerRef) return;



        // Initialize view if it doesn't exist
        if (!view) {
            const editorNode = document.createElement("div");
            editorNode.className = "scene-editor";
            editorNode.style.cssText = `
        min-height: 200px;
        padding: 16px;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        background: white;
        font-family: inherit;
        line-height: 1.6;
      `;
            containerRef.appendChild(editorNode);

            const doc = sceneParagraphsToDoc(currentScene.paragraphs);

            const state = EditorState.create({
                doc,
                schema: contentSchema,
                plugins: [
                    history(),
                    keymap({
                        "Mod-z": undo,
                        "Mod-y": redo,
                        "Mod-i": italic,
                        "Control-Enter": () => {
                            const selection = view?.state.selection;
                            if (selection && view) {
                                const paragraphId = getParagraphIdAtPos(view.state.doc, selection.from);
                                if (paragraphId) {
                                    createSceneParagraph(props.sceneId, {
                                        id: shortUUID.generate(),
                                        text: "",
                                        state: "draft",
                                        comments: [],
                                    }, paragraphId);
                                }
                            }
                            return true;
                        },
                        "Control-Backspace": () => {
                            const selection = view?.state.selection;
                            if (selection && view) {
                                const paragraphId = getParagraphIdAtPos(view.state.doc, selection.from);
                                if (paragraphId) {
                                    // Find the position of the previous paragraph before deletion
                                    const currentScene = scene();
                                    if (currentScene) {
                                        const currentParagraphs = currentScene.paragraphs;
                                        const currentIndex = currentParagraphs.findIndex(p => p.id === paragraphId);

                                        // Delete the paragraph
                                        removeSceneParagraph(props.sceneId, paragraphId);

                                        // Set cursor to end of previous paragraph if it exists
                                        if (currentIndex > 0) {
                                            const previousParagraphId = currentParagraphs[currentIndex - 1].id;
                                            // Use setTimeout to wait for the document to update
                                            setTimeout(() => {
                                                if (view) {
                                                    const previousRange = getParagraphRange(view.state.doc, previousParagraphId);
                                                    if (previousRange) {
                                                        // Position cursor at the end of the previous paragraph (before the closing tag)
                                                        const endPos = previousRange.to - 1;
                                                        const tr = view.state.tr.setSelection(
                                                            TextSelection.create(view.state.doc, endPos)
                                                        );
                                                        view.dispatch(tr);
                                                        view.focus();
                                                    }
                                                }
                                            }, 50);
                                        }
                                    }
                                }
                            }
                            return true;
                        },
                    }),
                    keymap(baseKeymap),
                    inlineMenuPlugin,
                    assignIdPlugin,
                    inputRules({ rules: smartQuotes.concat([emDash, ellipsis]) }),
                    createParagraphStatePlugin(() => scene()?.paragraphs || []),
                    createActiveParagraphPlugin(),
                    createSuggestionsPlugin(
                        (paragraphId: string, content: string) => {
                            // Accept suggestion
                            updateSceneParagraphData(props.sceneId, paragraphId, {
                                text: content,
                                extra: "",
                                extraLoading: false,
                            });
                            updateParagraphAttrs(paragraphId, { extra: null, extraLoading: false });
                        },
                        (paragraphId: string) => {
                            // Reject suggestion
                            updateSceneParagraphData(props.sceneId, paragraphId, {
                                extra: "",
                                extraLoading: false,
                            });
                            updateParagraphAttrs(paragraphId, { extra: null, extraLoading: false });
                        }
                    ),
                    createParagraphActionsPlugin({
                        onMoveUp: (paragraphId) => moveParagraphUp(props.sceneId, paragraphId),
                        onMoveDown: (paragraphId) => moveParagraphDown(props.sceneId, paragraphId),
                        onDelete: (paragraphId) => removeSceneParagraph(props.sceneId, paragraphId),
                        onAddAfter: (paragraphId) => createSceneParagraph(props.sceneId, {
                            id: shortUUID.generate(),
                            text: "",
                            state: "draft",
                            comments: [],
                        }, paragraphId),
                        onGenerateBetween: async (paragraphId) => {
                            setCurrentParagraphId(paragraphId);
                            // Load existing generate between text if available
                            if (uiState.generateBetweenText) {
                                setGenerateBetweenText(uiState.generateBetweenText);
                            }
                            setGenerateBetweenModalOpen(true);
                        },
                        onSpellCheck: (paragraphId) => help("rewrite_spelling", paragraphId),
                        onRewrite: (paragraphId) => help("rewrite", paragraphId),
                        onRefineStyle: (paragraphId) => help("snowflake_refine_scene_style", paragraphId),
                        onAddSensory: (paragraphId) => help("add_sensory_details", paragraphId),
                        onSetState: (paragraphId, state) => updateSceneParagraphData(props.sceneId, paragraphId, { state }),
                        isProtagonistSet: !!currentScene.protagonistId,
                        // New callbacks for SolidJS components
                        onToggleInventory: (paragraphId) => {
                            setCurrentParagraphId(paragraphId);
                            setShowInventory(prev => !prev);
                            setShowPlotpoint(false); // Close other popover
                        },
                        onTogglePlotpoint: (paragraphId) => {
                            setCurrentParagraphId(paragraphId);
                            setShowPlotpoint(prev => !prev);
                            setShowInventory(false); // Close other popover
                        },
                        onCustomRewrite: (paragraphId) => {
                            setCurrentParagraphId(paragraphId);
                            setRewriteModalOpen(true);
                        },
                        onTranslation: (paragraphId) => {
                            setCurrentParagraphId(paragraphId);
                            // Load existing translation if any
                            const currentScene = scene();
                            const paragraph = currentScene?.paragraphs.find(p => p.id === paragraphId);
                            if (paragraph?.translation) {
                                setTranslationText(paragraph.translation);
                            }
                            setTranslationModalOpen(true);
                        },
                        onConvertPerspective: (paragraphId) => help("snowflake_convert_perspective", paragraphId),
                        onSplitScene: (paragraphId) => splitScene(props.sceneId, paragraphId),
                    }),
                ],
            });

            view = new EditorView(editorNode, {
                state,
                dispatchTransaction(transaction) {
                    const newState = view!.state.apply(transaction);
                    view!.updateState(newState);

                    if (transaction.docChanged) {
                        // Set flag to prevent external updates while we're updating from editor
                        isInternalUpdate = true;

                        // Convert document back to paragraphs and update store
                        const { paragraphs, changedIds } = docToSceneParagraphs(newState.doc, lastKnownParagraphs());

                        // Update only changed paragraphs
                        for (const paragraphId of changedIds) {
                            const paragraph = paragraphs.find(p => p.id === paragraphId);
                            if (paragraph) {
                                updateSceneParagraphData(props.sceneId, paragraphId, { text: paragraph.text });
                            }
                        }

                        setLastKnownParagraphs(paragraphs);

                        // Reset flag after a short delay to allow store updates to complete
                        setTimeout(() => {
                            isInternalUpdate = false;
                        }, 0);
                    }

                    // Handle selection changes for paragraph tracking
                    if (transaction.selectionSet) {
                        const paragraphId = getParagraphIdAtPos(newState.doc, newState.selection.from);
                        if (paragraphId) {
                            setCurrentParagraphId(paragraphId);
                            updateSceneSelectedParagraph(props.sceneId, paragraphId);
                        }
                    }
                },
            });

            setLastKnownParagraphs(currentScene.paragraphs);
        } else {
            // Update existing view if paragraphs changed externally (not from editor input)
            if (!isInternalUpdate) {
                const currentParagraphs = currentScene.paragraphs;
                const lastParagraphs = lastKnownParagraphs();

                // Check if document structure changed (text content, not suggestion fields)
                const structureChanged = JSON.stringify(currentParagraphs.map(p => ({ id: p.id, text: p.text }))) !==
                    JSON.stringify(lastParagraphs.map(p => ({ id: p.id, text: p.text })));

                if (structureChanged) {
                    const newDoc = sceneParagraphsToDoc(currentParagraphs);
                    const newState = EditorState.create({
                        doc: newDoc,
                        schema: contentSchema,
                        plugins: view.state.plugins,
                    });
                    view.updateState(newState);
                    setLastKnownParagraphs(currentParagraphs);
                }
            }
        }
    });

    return (
        <div>
            <div ref={containerRef} />

            {/* Floating Inventory Actions */}
            {showInventory() && (
                <div class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-base-100 shadow-lg rounded-lg p-4 border border-gray-200">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="font-bold text-lg">Inventory Actions</h3>
                        <button
                            type="button"
                            class="btn btn-sm btn-ghost"
                            onClick={() => setShowInventory(false)}
                        >
                            ✕
                        </button>
                    </div>
                    <InventoryActions />
                </div>
            )}

            {/* Floating Plotpoint Actions */}
            {showPlotpoint() && (
                <div class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 bg-base-100 shadow-lg rounded-lg p-4 border border-gray-200">
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="font-bold text-lg">Plot Point Actions</h3>
                        <button
                            type="button"
                            class="btn btn-sm btn-ghost"
                            onClick={() => setShowPlotpoint(false)}
                        >
                            ✕
                        </button>
                    </div>
                    <PlotpointActions onClose={() => setShowPlotpoint(false)} />
                </div>
            )}

            {/* Audio Button - Fixed position when paragraph is selected */}
            {currentParagraphId() && currentParagraphText() && (
                <div class="fixed top-4 right-4 z-40">
                    <AudioButton text={currentParagraphText()} />
                </div>
            )}

            {/* Custom Rewrite Modal */}
            {rewriteModalOpen() && (
                <div class="modal modal-open">
                    <div class="modal-box">
                        <h3 class="font-bold text-lg">Custom Rewrite</h3>
                        <input
                            type="text"
                            value={rewriteInstructions()}
                            onInput={(e) => setRewriteInstructions(e.currentTarget.value)}
                            class="input input-bordered w-full mt-4"
                            placeholder="Enter rewrite instructions..."
                            onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                    handleCustomRewrite();
                                }
                            }}
                        />
                        <div class="modal-action">
                            <button
                                type="button"
                                class="btn btn-success"
                                onClick={handleCustomRewrite}
                                disabled={!rewriteInstructions().trim()}
                            >
                                Submit
                            </button>
                            <button
                                type="button"
                                class="btn"
                                onClick={() => {
                                    setRewriteModalOpen(false);
                                    setRewriteInstructions("");
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Translation Modal */}
            {translationModalOpen() && (
                <div class="modal modal-open">
                    <div class="modal-box">
                        <h3 class="font-bold text-lg">Translation</h3>
                        <input
                            type="text"
                            value={translationText()}
                            onInput={(e) => setTranslationText(e.currentTarget.value)}
                            class="input input-bordered w-full mt-4"
                            placeholder="Enter translation..."
                            onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                    handleSaveTranslation();
                                }
                            }}
                        />
                        <div class="modal-action">
                            <button
                                type="button"
                                class="btn btn-success"
                                onClick={handleSaveTranslation}
                            >
                                Save
                            </button>
                            <button
                                type="button"
                                class="btn"
                                onClick={() => {
                                    setTranslationModalOpen(false);
                                    setTranslationText("");
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Generate Between Modal */}
            {generateBetweenModalOpen() && (
                <div class="modal modal-open">
                    <div class="modal-box">
                        <h3 class="font-bold text-lg">Generate Content</h3>
                        <p class="py-4">What should happen in the generated content?</p>
                        <textarea
                            class="textarea textarea-bordered w-full"
                            rows={5}
                            value={generateBetweenText()}
                            onInput={(e) => setGenerateBetweenText(e.currentTarget.value)}
                            placeholder="Describe what should happen in this section..."
                        />
                        <div class="modal-action">
                            <button
                                type="button"
                                class="btn btn-primary"
                                onClick={generateBetween}
                                disabled={isGenerating() || !generateBetweenText().trim()}
                            >
                                {isGenerating() ? (
                                    <span class="loading loading-spinner" />
                                ) : (
                                    "Generate"
                                )}
                            </button>
                            <button
                                type="button"
                                class="btn"
                                onClick={() => {
                                    setGenerateBetweenModalOpen(false);
                                    setGenerateBetweenText("");
                                }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}; 