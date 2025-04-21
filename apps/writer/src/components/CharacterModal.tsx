import {
  charactersState,
  updateCharacterProperty,
  setSelectedCharacterId,
} from "../lib/stores/characters";
import { FileSelector } from "./FileSelector";
import { ColorPicker, HAIR_COLORS } from "./ColorPicker";
import { treeState } from "../lib/stores/tree";
import { scenesState } from "../lib/stores/scenes";
import { getOrderedSceneIds } from "../lib/selectors/orderedSceneIds";
import { CharacterSelect } from "./CharacterSelect";
import type { Character } from "@writer/shared";
import { getAllCharacterVersions } from "../lib/utils/character-versions";
import { CharacterTimeline } from "./CharacterTimeline";
import { useAi } from "../lib/use-ai";
import { createEffect, createSignal } from "solid-js";
import { addNotification } from "../lib/stores/notifications";

const EYE_COLORS = [
  { name: "Brown", value: "#694731" },
  { name: "Blue", value: "#0066CC" },
  { name: "Green", value: "#006633" },
  { name: "Hazel", value: "#9E6B4C" },
  { name: "Grey", value: "#999999" },
  { name: "Amber", value: "#FFA000" },
] as const;

const HEIGHT_HINTS = [
  { age: "3mo", height: 60 },
  { age: "6mo", height: 67 },
  { age: "1y", height: 75 },
  { age: 2, height: 85 },
  { age: 4, height: 100 },
  { age: 6, height: 115 },
  { age: 8, height: 130 },
  { age: 10, height: 140 },
  { age: 12, height: 150 },
  { age: 14, height: 160 },
  { age: 16, height: 170 },
  { age: "Adult", height: 170 },
] as const;

const GENDER_OPTIONS = [
  "Male",
  "Female",
  "Non-binary",
  "Genderfluid",
  "Agender",
  "Transgender",
  "Genderqueer",
  "Other",
] as const;

const ORIENTATION_OPTIONS = [
  {
    value: "Straight",
    label: "Straight",
    description: "Attracted to the opposite gender",
  },
  {
    value: "Gay",
    label: "Gay",
    description: "Attracted to the same gender (typically used for men)",
  },
  {
    value: "Lesbian",
    label: "Lesbian",
    description: "Attracted to the same gender (women)",
  },
  {
    value: "Bisexual",
    label: "Bisexual",
    description: "Attracted to both same and opposite genders",
  },
  {
    value: "Pansexual",
    label: "Pansexual",
    description: "Attracted to people regardless of gender",
  },
  {
    value: "Asexual",
    label: "Asexual",
    description: "Experiences little to no sexual attraction",
  },
  {
    value: "Demisexual",
    label: "Demisexual",
    description:
      "Only experiences sexual attraction after forming emotional bonds",
  },
  {
    value: "Other",
    label: "Other",
    description: "Another orientation not listed here",
  },
] as const;

export const CharacterModal = (props: {
  onClose: () => void;
}) => {
  const [generating, setGenerating] = createSignal(false)
  // Add effect to migrate summary to personality if needed
  createEffect(() => {
    const character = charactersState.selectedCharacter;
    if (character?.summary && !character.personality) {
      updateCharacterProperty(
        charactersState.selectedCharacterId,
        "personality",
        character.summary
      );
      updateCharacterProperty(
        charactersState.selectedCharacterId,
        "summary",
        ""
      )
    }
  });

  return (
    <div
      class="modal modal-open"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          props.onClose();
        }
      }}
    >
      <div class="modal-box w-11/12 max-w-full">
        <h3 class="font-bold text-lg">
          Character{" "}
          {charactersState.selectedCharacter?.firstName ??
            charactersState.selectedCharacter?.id}
        </h3>
        <div class="py-4 grid grid-cols-2 gap-4">
          {/* Left Column */}
          <div class="space-y-4">
            {/* Name Fields in a single row */}
            <div class="grid grid-cols-3 gap-2">
              <div class="form-control">
                <label class="label" for="firstName">
                  <span class="label-text">First Name</span>
                </label>
                <input
                  id="firstName"
                  type="text"
                  class="input input-bordered"
                  value={charactersState.selectedCharacter?.firstName ?? ""}
                  onInput={(e) => {
                    updateCharacterProperty(
                      charactersState.selectedCharacterId,
                      "firstName",
                      e.currentTarget.value,
                    );
                  }}
                />
              </div>

              <div class="form-control">
                <label class="label" for="middleName">
                  <span class="label-text">Middle Name</span>
                </label>
                <input
                  id="middleName"
                  type="text"
                  class="input input-bordered"
                  value={charactersState.selectedCharacter?.middleName ?? ""}
                  onInput={(e) => {
                    updateCharacterProperty(
                      charactersState.selectedCharacterId,
                      "middleName",
                      e.currentTarget.value,
                    );
                  }}
                />
              </div>

              <div class="form-control">
                <label class="label" for="lastName">
                  <span class="label-text">Last Name</span>
                </label>
                <input
                  id="lastName"
                  type="text"
                  class="input input-bordered"
                  value={charactersState.selectedCharacter?.lastName ?? ""}
                  onInput={(e) => {
                    updateCharacterProperty(
                      charactersState.selectedCharacterId,
                      "lastName",
                      e.currentTarget.value,
                    );
                  }}
                />
              </div>
            </div>

            <div class="form-control">
              <label class="label" for="nickname">
                <span class="label-text">Nickname</span>
              </label>
              <input
                id="nickname"
                type="text"
                class="input input-bordered"
                value={charactersState.selectedCharacter?.nickname ?? ""}
                onInput={(e) => {
                  updateCharacterProperty(
                    charactersState.selectedCharacterId,
                    "nickname",
                    e.currentTarget.value,
                  );
                }}
              />
            </div>

            <div class="form-control">
              <label class="label" for="picture">
                <span class="label-text">Picture</span>
              </label>
              <FileSelector
                name={charactersState.selectedCharacter?.firstName ?? ""}
                value={charactersState.selectedCharacter?.picture ?? ""}
                onChange={(file) => {
                  updateCharacterProperty(
                    charactersState.selectedCharacterId,
                    "picture",
                    file,
                  );
                }}
              />
            </div>

            <div class="form-control">
              <label class="label" for="personality">
                <span class="label-text">Personality</span>
              </label>
              <textarea
                id="personality"
                class="textarea textarea-bordered"
                rows={5}
                value={charactersState.selectedCharacter?.personality ?? ""}
                onInput={(e) => {
                  updateCharacterProperty(
                    charactersState.selectedCharacterId,
                    "personality",
                    e.currentTarget.value,
                  );
                }}
                placeholder="Describe the character's personality, traits, and behavioral patterns."
              />
            </div>

            <div class="form-control">
              <label class="label" for="background">
                <span class="label-text">Background</span>
              </label>
              <textarea
                id="background"
                class="textarea textarea-bordered"
                rows={5}
                value={charactersState.selectedCharacter?.background ?? ""}
                onInput={(e) => {
                  updateCharacterProperty(
                    charactersState.selectedCharacterId,
                    "background",
                    e.currentTarget.value,
                  );
                }}
                placeholder="Describe the character's history, upbringing, and significant past events."
              />
            </div>

            <div class="form-control">
              <label class="label" for="writingStyle">
                <span class="label-text">Writing Style</span>
                <button
                  type="button"
                  class="btn btn-xs btn-ghost"
                  onClick={async () => {
                    const character = charactersState.selectedCharacter;
                    if (!character) return;

                    try {
                      const prompt = `Based on the following character information, generate a writing style description that would be appropriate for this character. The writing style should reflect their personality, background, and distinguishing features.

Name: ${character.firstName} ${character.lastName || ""}
Personality: ${character.personality || "Not provided"}
Background: ${character.background || "Not provided"}
Distinguishing Features: ${character.distinguishingFeatures || "Not provided"}
Personality Quirks: ${character.personalityQuirks || "Not provided"}
Gender: ${character.gender || "Not provided"}
Age: ${character.age || "Not provided"}
Sexual Orientation: ${character.sexualOrientation || "Not provided"}
Likes: ${character.likes || "Not provided"}
Dislikes: ${character.dislikes || "Not provided"}

Please provide a concise description of how this character should be written, including:
1. Tone and voice
2. Vocabulary level and style
3. Any specific quirks or patterns in their speech or thoughts
4. Emotional expression style

Format as a clear, concise paragraph.`;

                      const result = await useAi("free", [{
                        text: prompt,
                        canCache: false
                      }], true);

                      updateCharacterProperty(
                        charactersState.selectedCharacterId,
                        "writingStyle",
                        result
                      );
                    } catch (e) {
                      console.error("Failed to generate writing style", e);
                    }
                  }}
                >
                  Auto-fill
                </button>
              </label>
              <textarea
                id="writingStyle"
                class="textarea textarea-bordered"
                rows={5}
                value={charactersState.selectedCharacter?.writingStyle ?? ""}
                onInput={(e) => {
                  updateCharacterProperty(
                    charactersState.selectedCharacterId,
                    "writingStyle",
                    e.currentTarget.value,
                  );
                }}
                placeholder="Describe how this character should be written, including tone, vocabulary, speech patterns, and emotional expression style."
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Age</span>
                <span class="label-text-alt">
                  {charactersState.selectedCharacter?.age ?? 0} years
                </span>
              </label>
              <input
                type="range"
                min="0"
                max="120"
                class="range"
                step="1"
                value={charactersState.selectedCharacter?.age ?? "0"}
                onInput={(e) => {
                  updateCharacterProperty(
                    charactersState.selectedCharacterId,
                    "age",
                    e.currentTarget.value,
                  );
                }}
              />
              <div class="w-full flex justify-between text-xs px-2 mt-1">
                <span>0</span>
                <span>60</span>
                <span>120</span>
              </div>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Gender</span>
              </label>
              <select
                class="select select-bordered"
                value={charactersState.selectedCharacter?.gender ?? ""}
                onChange={(e) => {
                  updateCharacterProperty(
                    charactersState.selectedCharacterId,
                    "gender",
                    e.currentTarget.value,
                  );
                }}
              >
                <option value="">Select gender...</option>
                {GENDER_OPTIONS.map((option) => (
                  <option value={option}>{option}</option>
                ))}
              </select>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Sexual Orientation</span>
              </label>
              <select
                class="select select-bordered"
                value={
                  charactersState.selectedCharacter?.sexualOrientation ?? ""
                }
                onChange={(e) => {
                  updateCharacterProperty(
                    charactersState.selectedCharacterId,
                    "sexualOrientation",
                    e.currentTarget.value,
                  );
                }}
              >
                <option value="">Select orientation...</option>
                {ORIENTATION_OPTIONS.map((option) => (
                  <option value={option.value} title={option.description}>
                    {option.label}
                  </option>
                ))}
              </select>
              {charactersState.selectedCharacter?.sexualOrientation && (
                <label class="label">
                  <span class="label-text-alt">
                    {
                      ORIENTATION_OPTIONS.find(
                        (o) =>
                          o.value ===
                          charactersState.selectedCharacter?.sexualOrientation,
                      )?.description
                    }
                  </span>
                </label>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div class="space-y-4">
            <div class="form-control">
              <label class="label cursor-pointer">
                <span class="label-text">Main Character</span>
                <input
                  type="checkbox"
                  class="checkbox"
                  checked={
                    charactersState.selectedCharacter?.isMainCharacter ?? true
                  }
                  onChange={(e) => {
                    updateCharacterProperty(
                      charactersState.selectedCharacterId,
                      "isMainCharacter",
                      e.currentTarget.checked,
                    );
                  }}
                />
              </label>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Later Version Of</span>
              </label>
              <CharacterSelect
                placeholder="Select earlier version..."
                value={charactersState.selectedCharacter?.laterVersionOf}
                onChange={(characterId: string | null) => {
                  updateCharacterProperty(
                    charactersState.selectedCharacterId,
                    "laterVersionOf",
                    characterId || undefined,
                  );
                }}
                filter={(char) =>
                  // Don't show the current character
                  char.id !== charactersState.selectedCharacterId &&
                  // Don't show characters that are later versions of this character (to avoid cycles)
                  char.laterVersionOf !== charactersState.selectedCharacterId
                }
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Height (cm)</span>
                <span class="label-text-alt">
                  {charactersState.selectedCharacter?.height ?? 170}cm
                </span>
              </label>
              <div class="text-sm text-gray-500 mb-2">
                Average heights:{" "}
                {HEIGHT_HINTS.map((hint, i) => (
                  <>
                    {i > 0 && " • "}
                    {hint.age} y/o: {hint.height}cm
                  </>
                ))}
              </div>
              <input
                type="range"
                min="40"
                max="220"
                class="range"
                step="1"
                value={charactersState.selectedCharacter?.height ?? 170}
                onInput={(e) => {
                  updateCharacterProperty(
                    charactersState.selectedCharacterId,
                    "height",
                    parseInt(e.currentTarget.value),
                  );
                }}
              />
              <div class="w-full flex justify-between text-xs px-2 mt-1">
                <span>40cm</span>
                <span>130cm</span>
                <span>220cm</span>
              </div>
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Hair Color</span>
              </label>
              <ColorPicker
                value={charactersState.selectedCharacter?.hairColor ?? ""}
                onChange={(color) => {
                  updateCharacterProperty(
                    charactersState.selectedCharacterId,
                    "hairColor",
                    color,
                  );
                }}
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Eye Color</span>
              </label>
              <ColorPicker
                value={charactersState.selectedCharacter?.eyeColor ?? ""}
                onChange={(color) => {
                  updateCharacterProperty(
                    charactersState.selectedCharacterId,
                    "eyeColor",
                    color,
                  );
                }}
                colors={EYE_COLORS}
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Distinguishing Features</span>
              </label>
              <textarea
                class="textarea textarea-bordered"
                rows={5}
                value={
                  charactersState.selectedCharacter?.distinguishingFeatures ??
                  ""
                }
                onInput={(e) => {
                  updateCharacterProperty(
                    charactersState.selectedCharacterId,
                    "distinguishingFeatures",
                    e.currentTarget.value,
                  );
                }}
                placeholder="Scars, tattoos, birthmarks, etc."
              />
            </div>
            <div class="form-control">
              <label class="label" for="personalityQuirks">
                <span class="label-text">Personality Quirks</span>
              </label>
              <textarea
                id="personalityQuirks"
                class="textarea textarea-bordered"
                rows={3}
                value={charactersState.selectedCharacter?.personalityQuirks ?? ""}
                onInput={(e) => {
                  updateCharacterProperty(
                    charactersState.selectedCharacterId,
                    "personalityQuirks",
                    e.currentTarget.value,
                  );
                }}
                placeholder="List the character's unique quirks, habits, or eccentricities that make them distinctive."
              />
            </div>

            <div class="form-control">
              <label class="label" for="likes">
                <span class="label-text">Likes</span>
              </label>
              <textarea
                id="likes"
                class="textarea textarea-bordered"
                rows={3}
                value={charactersState.selectedCharacter?.likes ?? ""}
                onInput={(e) => {
                  updateCharacterProperty(
                    charactersState.selectedCharacterId,
                    "likes",
                    e.currentTarget.value,
                  );
                }}
                placeholder="List the character's likes, preferences, and things they enjoy."
              />
            </div>

            <div class="form-control">
              <label class="label" for="dislikes">
                <span class="label-text">Dislikes</span>
              </label>
              <textarea
                id="dislikes"
                class="textarea textarea-bordered"
                rows={3}
                value={charactersState.selectedCharacter?.dislikes ?? ""}
                onInput={(e) => {
                  updateCharacterProperty(
                    charactersState.selectedCharacterId,
                    "dislikes",
                    e.currentTarget.value,
                  );
                }}
                placeholder="List the character's dislikes, aversions, and things they avoid."
              />
            </div>
          </div>
        </div>

        {/* Significant Actions Section */}
        <CharacterTimeline
          versions={getAllCharacterVersions(
            charactersState.selectedCharacterId,
            charactersState.characters
          )}
          onRemoveAction={(character, timestamp) => {
            const significantActions = [
              ...(character.significantActions || []),
            ].filter(a => a.timestamp !== timestamp);
            updateCharacterProperty(
              character.id,
              "significantActions",
              significantActions,
            );
          }}
        />

        <div class="modal-action">
          <button
            type="button"
            class="btn btn-secondary"
            onClick={async () => {
              const character = charactersState.selectedCharacter;
              if (!character || !character.firstName) {
                alert("Please enter a first name first");
                return;
              }

              // Random values for simple fields
              if (!character.gender) {
                updateCharacterProperty(
                  charactersState.selectedCharacterId,
                  "gender",
                  GENDER_OPTIONS[Math.floor(Math.random() * GENDER_OPTIONS.length)]
                );
              }

              if (!character.sexualOrientation) {
                updateCharacterProperty(
                  charactersState.selectedCharacterId,
                  "sexualOrientation",
                  ORIENTATION_OPTIONS[Math.floor(Math.random() * ORIENTATION_OPTIONS.length)].value
                );
              }

              if (!character.height) {
                updateCharacterProperty(
                  charactersState.selectedCharacterId,
                  "height",
                  Math.floor(Math.random() * (190 - 150 + 1)) + 150
                );
              }

              if (!character.age) {
                updateCharacterProperty(
                  charactersState.selectedCharacterId,
                  "age",
                  (Math.floor(Math.random() * (65 - 18 + 1)) + 18).toString()
                );
              }

              if (!character.eyeColor) {
                updateCharacterProperty(
                  charactersState.selectedCharacterId,
                  "eyeColor",
                  EYE_COLORS[Math.floor(Math.random() * EYE_COLORS.length)].name
                );
              }

              if (!character.hairColor) {
                updateCharacterProperty(
                  charactersState.selectedCharacterId,
                  "hairColor",
                  HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)].name
                );
              }

              // Use AI for complex fields
              if (!character.summary || !character.distinguishingFeatures || !character.writingStyle || !character.personality || !character.personalityQuirks || !character.background || !character.likes || !character.dislikes) {
                try {
                  const characterProperties = [];
                  if (character.gender) characterProperties.push(`Gender: ${character.gender}`);
                  if (character.age) characterProperties.push(`Age: ${character.age} years old`);
                  if (character.height) characterProperties.push(`Height: ${character.height}cm`);
                  if (character.hairColor) characterProperties.push(`Hair color: ${character.hairColor}`);
                  if (character.eyeColor) {
                    const eyeColor = EYE_COLORS.find(c => c.value === character.eyeColor)?.name || character.eyeColor;
                    characterProperties.push(`Eye color: ${eyeColor}`);
                  }
                  if (character.sexualOrientation) characterProperties.push(`Sexual orientation: ${character.sexualOrientation}`);
                  if (character.personality) characterProperties.push(`Personality: ${character.personality}`);
                  if (character.personalityQuirks) characterProperties.push(`Personality quirks: ${character.personalityQuirks}`);
                  if (character.background) characterProperties.push(`Background: ${character.background}`);
                  if (character.writingStyle) characterProperties.push(`Writing style: ${character.writingStyle}`);
                  if (character.likes) characterProperties.push(`Likes: ${character.likes}`);
                  if (character.dislikes) characterProperties.push(`Dislikes: ${character.dislikes}`);

                  const prompt = `Create a character profile for ${character.firstName} ${character.lastName || ""}. 
${characterProperties.length > 0 ? `\nExisting characteristics:\n${characterProperties.join('\n')}` : ''}

Please provide:
1. ${!character.distinguishingFeatures ? "Their distinguishing physical features (2-3 notable characteristics that match their existing physical traits)" : "Skip distinguishing features as they already exist"}
2. ${!character.writingStyle ? "A writing style description including tone, vocabulary level, speech patterns, and emotional expression style" : "Skip writing style as it already exists"}
3. ${!character.personality ? "A detailed description of their personality, traits, and behavioral patterns. This should be a concise paragraph that captures the essence of who they are." : "Skip personality as it already exists"}
4. ${!character.personalityQuirks ? "A list of 3-5 unique quirks, habits, or eccentricities that make this character distinctive" : "Skip personality quirks as they already exist"}
5. ${!character.background ? "A brief background including their history, upbringing, and significant past events" : "Skip background as it already exists"}
6. ${!character.likes ? "A list of 3-5 things this character likes, enjoys, or prefers" : "Skip likes as they already exist"}
7. ${!character.dislikes ? "A list of 3-5 things this character dislikes, avoids, or has an aversion to" : "Skip dislikes as they already exist"}

Format the response as JSON with these fields:
{
  ${!character.distinguishingFeatures ? '"distinguishingFeatures": "...",' : ''}
  ${!character.writingStyle ? '"writingStyle": "...",' : ''}
  ${!character.personality ? '"personality": "...",' : ''}
  ${!character.personalityQuirks ? '"personalityQuirks": "...",' : ''}
  ${!character.background ? '"background": "...",' : ''}
  ${!character.likes ? '"likes": "...",' : ''}
  ${!character.dislikes ? '"dislikes": "..."' : ''}
}`;

                  setGenerating(true);
                  const result = await useAi("free", [{
                    text: prompt,
                    canCache: false
                  }], false);


                  try {
                    const parsed = JSON.parse(result);
                    if (!character.summary && parsed.summary) {
                      updateCharacterProperty(
                        charactersState.selectedCharacterId,
                        "summary",
                        parsed.summary
                      );
                    }
                    if (!character.distinguishingFeatures && parsed.distinguishingFeatures) {
                      updateCharacterProperty(
                        charactersState.selectedCharacterId,
                        "distinguishingFeatures",
                        parsed.distinguishingFeatures
                      );
                    }
                    if (!character.writingStyle && parsed.writingStyle) {
                      updateCharacterProperty(
                        charactersState.selectedCharacterId,
                        "writingStyle",
                        parsed.writingStyle
                      );
                    }
                    if (!character.personality && parsed.personality) {
                      updateCharacterProperty(
                        charactersState.selectedCharacterId,
                        "personality",
                        parsed.personality
                      );
                    }
                    if (!character.personalityQuirks && parsed.personalityQuirks) {
                      updateCharacterProperty(
                        charactersState.selectedCharacterId,
                        "personalityQuirks",
                        typeof parsed.personalityQuirks === "string" ? parsed.personalityQuirks : Array.isArray(parsed.personalityQuirks) ? parsed.personalityQuirks.join(", ") : ""
                      );
                    }
                    if (!character.background && parsed.background) {
                      updateCharacterProperty(
                        charactersState.selectedCharacterId,
                        "background",
                        parsed.background
                      );
                    }
                    if (!character.likes && parsed.likes) {
                      updateCharacterProperty(
                        charactersState.selectedCharacterId,
                        "likes",
                        typeof parsed.likes === "string" ? parsed.likes : Array.isArray(parsed.likes) ? parsed.likes.join(", ") : ""
                      );
                    }
                    if (!character.dislikes && parsed.dislikes) {
                      updateCharacterProperty(
                        charactersState.selectedCharacterId,
                        "dislikes",
                        typeof parsed.dislikes === "string" ? parsed.dislikes : Array.isArray(parsed.dislikes) ? parsed.dislikes.join(", ") : ""
                      );
                    }
                  } catch (e) {
                    console.error("Failed to parse AI response", e, result);
                    addNotification({
                      type: "error",
                      title: "Failed to parse AI response",
                      message: result,
                    });
                  }
                  setGenerating(false);
                } catch (e) {
                  console.error("Failed to generate character profile", e);
                }
              }
            }}
          >
            {generating() ? "Generating..." : "Auto-fill Empty Fields"}
          </button>
          <button type="button" class="btn" onClick={props.onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
