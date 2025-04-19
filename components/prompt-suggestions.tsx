"use client"

import { PromptSuggestionCard, type PromptSuggestion } from "./prompt-suggestion-card"

// Detailed Indian mythology prompt suggestions with expanded information
const DETAILED_SUGGESTIONS: PromptSuggestion[] = [
  {
    title: "Arjuna's Dilemma",
    description: "The moment of truth at Kurukshetra as Arjuna faces his moral dilemma before the great battle.",
    characters: [
      "Arjuna - The skilled archer and Pandava prince facing an ethical crisis",
      "Krishna - Divine guide and charioteer offering wisdom",
      "Opposing warriors - Family members and teachers Arjuna must fight",
    ],
    setting: "The battlefield of Kurukshetra, with armies assembled on both sides, chariots ready for war.",
    storyboard: [
      "Arjuna and Krishna arrive at the battlefield in a magnificent chariot",
      "Arjuna sees his relatives, teachers, and friends in the opposing army",
      "Overwhelmed by grief, Arjuna drops his bow and refuses to fight",
      "Krishna begins to impart the wisdom of the Bhagavad Gita",
    ],
    fullPrompt:
      "Arjuna drawing his bow during the battle of Kurukshetra as Krishna guides him, their chariot positioned between the two armies as Arjuna faces his moral dilemma.",
  },
  {
    title: "Hanuman's Leap",
    description:
      "The mighty Hanuman's legendary leap across the ocean to Lanka, carrying the mountain with life-saving herbs.",
    characters: [
      "Hanuman - The powerful monkey god with extraordinary abilities",
      "Jambavan - The wise bear king who reminds Hanuman of his powers",
      "Injured Vanaras - Monkey warriors waiting for healing herbs",
    ],
    setting:
      "The southern tip of India, with the vast ocean stretching before Hanuman, and the distant island of Lanka.",
    storyboard: [
      "Hanuman prepares to leap from a mountain peak, expanding his size",
      "He soars through the sky, facing obstacles from celestial beings",
      "Upon reaching the Himalayas, he lifts an entire mountain of herbs",
      "Hanuman returns triumphantly with the mountain in his hand",
    ],
    fullPrompt:
      "Hanuman leaping across the ocean with the Sanjeevani mountain in his hand, his form silhouetted against the moon as he carries hope for the wounded army.",
  },
  {
    title: "Durga's Victory",
    description: "The powerful goddess Durga riding her lion into battle against the buffalo demon Mahishasura.",
    characters: [
      "Goddess Durga - The ten-armed embodiment of Shakti, divine feminine power",
      "Mahishasura - The shape-shifting buffalo demon who threatens the cosmos",
      "The lion - Durga's fierce mount and companion",
    ],
    setting:
      "A cosmic battlefield with mountains and clouds, divine light illuminating the scene of the ultimate confrontation.",
    storyboard: [
      "The gods combine their powers to create Durga, gifting her weapons",
      "Durga rides her lion toward the demon's fortress",
      "Mahishasura transforms between human and buffalo forms during battle",
      "Durga pierces the demon with her trident in the climactic moment",
    ],
    fullPrompt:
      "Goddess Durga riding her lion, wielding weapons in her multiple arms, her face serene yet determined as she confronts the buffalo demon Mahishasura amid a divine battlefield.",
  },
  {
    title: "Shiva's Tandava",
    description: "The cosmic dance of Lord Shiva that creates, preserves, and destroys the universe in endless cycles.",
    characters: [
      "Lord Shiva - The destroyer and transformer in his Nataraja form",
      "Goddess Parvati - Witness to the cosmic dance",
      "Celestial beings - Gods and goddesses watching in awe",
    ],
    setting: "The cosmic void, with stars, planets, and galaxies forming and dissolving around Shiva's dancing form.",
    storyboard: [
      "Shiva begins his dance within a circle of cosmic flames",
      "As he dances, worlds are born and destroyed with each movement",
      "His four arms demonstrate creation, preservation, destruction, and liberation",
      "Time itself bends to the rhythm of his damaru drum",
    ],
    fullPrompt:
      "Lord Shiva performing the cosmic dance of Tandava as the universe transforms, his four arms in precise mudras, surrounded by a ring of fire as creation and destruction occur simultaneously.",
  },
  {
    title: "The Churning Ocean",
    description: "Devas and Asuras cooperating to churn the cosmic ocean to obtain the nectar of immortality.",
    characters: [
      "Lord Vishnu - In his Kurma (turtle) avatar supporting Mount Mandara",
      "Devas - The gods pulling from one side",
      "Asuras - The demons pulling from the opposite side",
      "Vasuki - The serpent king used as the churning rope",
    ],
    setting:
      "The cosmic ocean of milk, with Mount Mandara as the churning rod and various divine beings positioned around it.",
    storyboard: [
      "Gods and demons arrange themselves on opposite sides of the serpent",
      "The mountain begins to rotate, churning the cosmic ocean",
      "Various treasures emerge, including deadly poison that Shiva consumes",
      "Finally, Dhanvantari appears with the pot of amrita (nectar of immortality)",
    ],
    fullPrompt:
      "The churning of the ocean (Samudra Manthan) by devas and asuras, with Mount Mandara rotating in the cosmic ocean, Vasuki the serpent stretched between the two groups, and Lord Vishnu in turtle form supporting the mountain.",
  },
]

interface PromptSuggestionsProps {
  onSelectPrompt: (prompt: string) => void
  selectedPrompt: string
  onOpenModal: (suggestion: PromptSuggestion) => void
}

export function PromptSuggestions({ onSelectPrompt, selectedPrompt, onOpenModal }: PromptSuggestionsProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-sm font-medium text-white/90">Story Inspirations</h2>
        <p className="text-xs text-white/60">Click for details</p>
      </div>
      <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
        {DETAILED_SUGGESTIONS.map((suggestion, index) => (
          <PromptSuggestionCard
            key={index}
            suggestion={suggestion}
            onClick={() => onOpenModal(suggestion)}
            isSelected={selectedPrompt === suggestion.fullPrompt}
          />
        ))}
      </div>
    </div>
  )
}

export { DETAILED_SUGGESTIONS }
