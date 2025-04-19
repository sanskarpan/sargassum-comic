import { NextResponse } from "next/server"
import { createServerSupabaseClient } from "@/lib/supabase"

// Sample story data for seeding
const SAMPLE_STORY = {
  version: "1.0.0",
  generated_at: new Date().toISOString(),
  request_spec: {
    audience: "all ages",
    genre: "fantasy",
    tone: "adventurous",
    length_words: 1500,
    theme: "A journey to find a magical artifact",
  },
  title: "The Crystal of Echoes",
  tagline: "Some journeys change more than just the traveler",
  summary:
    "When a mysterious map leads young Elara to search for the legendary Crystal of Echoes, she discovers that the true magic lies not in the artifact itself, but in the journey and the companions she finds along the way.",
  characters: [
    {
      id: "character1",
      name: "Elara",
      role: "protagonist",
      arc: "from cautious to courageous",
      traits: ["curious", "loyal", "resourceful"],
    },
    {
      id: "character2",
      name: "Thorne",
      role: "deuteragonist",
      arc: "from selfish to selfless",
      traits: ["witty", "skilled", "guarded"],
    },
    {
      id: "character3",
      name: "Maevis",
      role: "mentor",
      arc: "from isolated to connected",
      traits: ["wise", "eccentric", "mysterious"],
    },
  ],
  outline: [
    {
      beat: 1,
      type: "setup",
      description: "Elara discovers an ancient map in her grandmother's attic",
    },
    {
      beat: 2,
      type: "inciting_incident",
      description: "The map begins to glow, revealing hidden markings",
    },
    {
      beat: 3,
      type: "rising_action",
      description: "Elara meets Thorne and Maevis on her journey to find the Crystal",
    },
    {
      beat: 4,
      type: "climax",
      description: "The trio faces a guardian spirit that tests their true intentions",
    },
    {
      beat: 5,
      type: "resolution",
      description: "They discover the Crystal's true purpose is to reveal one's inner magic",
    },
  ],
  scenes: [
    {
      beat: 1,
      title: "The Dusty Discovery",
      setting: "A cluttered attic filled with forgotten treasures",
      pov: "Elara",
      conflict: "Elara must decide whether to follow the map or ignore it",
    },
    {
      beat: 2,
      title: "Midnight Revelations",
      setting: "Elara's bedroom under moonlight",
      pov: "Elara",
      conflict: "The map reveals more than expected, challenging Elara's understanding of her family history",
    },
    {
      beat: 3,
      title: "Unlikely Companions",
      setting: "The Whispering Woods",
      pov: "Elara",
      conflict:
        "Trust issues arise as Elara meets Thorne and Maevis, each with their own reasons for seeking the Crystal",
    },
    {
      beat: 4,
      title: "The Guardian's Test",
      setting: "Ancient temple ruins",
      pov: "Elara",
      conflict: "The guardian forces each character to confront their deepest fears and true motivations",
    },
    {
      beat: 5,
      title: "Reflections",
      setting: "The Crystal Chamber",
      pov: "Elara",
      conflict: "The trio must accept what the Crystal reveals about themselves",
    },
  ],
  story: [
    {
      beat: 1,
      paragraphs: [
        "Dust motes danced in the slanting afternoon light as Elara pushed open the creaking attic door. Her grandmother's passing had left the old house silent, filled with memories and secrets waiting to be discovered. 'Just one afternoon to find those old photo albums,' her mother had said. But Elara knew attics had a way of telling their own stories.",

        "Boxes upon boxes of forgotten treasures lined the walls, each one a mystery. Elara moved carefully between stacks of leather-bound books and tarnished picture frames. A peculiar cedar chest caught her eye—intricate carvings adorned its surface, depicting forests and mountains unlike any she had seen before.",

        "'I don't remember this,' she whispered, running her fingers along the detailed patterns. The lock clicked open at her touch, as if it had been waiting for her. Inside, nestled among silk cloths that had somehow resisted the decay of time, lay a rolled parchment sealed with wax bearing an unfamiliar symbol.",

        "Curiosity overcame caution. Elara broke the seal, and as the map unfurled in her hands, she felt a strange tingling in her fingertips. The map showed lands that existed in no geography book—the Whispering Woods, the Mirrored Lakes, and at the journey's end, a temple marked with a single word: *Echoes*.",
      ],
    },
    {
      beat: 2,
      paragraphs: [
        "That night, unable to sleep, Elara sat cross-legged on her bed with the map spread before her. The full moon cast silver light through her window, and as it touched the parchment, something extraordinary happened. Faint lines began to appear, glowing with a soft blue luminescence, revealing paths and markings previously invisible.",

        '"What in the world?" Elara gasped, watching as words in an ancient script materialized along the borders. Though she couldn\'t read them, she somehow understood their meaning: *The Crystal awaits the one who seeks not power, but truth.*',

        'Her grandmother\'s voice seemed to whisper from her memories: *"Some maps lead to places, others lead to destiny."* Had she known about this? Was this mysterious map her final gift—or perhaps her final request?',

        "As dawn approached, Elara made her decision. She packed a small bag with essentials, left a note for her parents claiming a spontaneous camping trip with friends, and slipped the map into her jacket pocket. The first landmark—the Sentinel Oak at the edge of the Whispering Woods—was only a day's journey away. Whatever this Crystal of Echoes was, something deep within told her she was meant to find it.",
      ],
    },
    {
      beat: 3,
      paragraphs: [
        "The Whispering Woods earned their name. As Elara followed the path marked on her map, the leaves seemed to murmur secrets in a language just beyond understanding. She had been walking for hours when a voice—a human one—startled her.",

        '"That\'s an interesting map you\'ve got there." A young man leaned against a tree, arms crossed, with a knowing smirk that immediately irritated Elara. "Especially considering it shouldn\'t exist."',

        '"Who are you?" Elara demanded, quickly folding the map.',

        '"Name\'s Thorne. Expert in rare artifacts, at your service." He gave an exaggerated bow. "And you\'re heading toward the Crystal of Echoes, which makes you either very brave or very foolish."',

        'Before Elara could respond, another voice joined them—older, raspier. "Or perhaps she\'s the one we\'ve been waiting for." An elderly woman emerged from between the trees, leaning on a staff adorned with crystals and feathers. "I am Maevis, keeper of forest lore."',

        'Suspicion flared in Elara. "You\'ve both been looking for the Crystal too?"',

        "Thorne shrugged. \"For different reasons, I'd wager. I'm interested in its value.\"",

        '"And I," said Maevis, "in its power to reveal what has been lost."',

        '"Why should I trust either of you?" Elara challenged.',

        'Maevis smiled. "You shouldn\'t. Not yet. But the path ahead holds dangers no one should face alone, and the map chose you for a reason."',

        "Reluctantly, Elara agreed to travel together—at least until she had reason not to. As they made camp that night, she couldn't help but wonder: what were the real motives of her new companions, and would their presence help or hinder her mysterious quest?",
      ],
    },
    {
      beat: 4,
      paragraphs: [
        "After days of travel, overcoming obstacles that tested their growing bonds, the trio finally stood before the ancient temple ruins. Weathered stone columns reached toward the sky like grasping fingers, and symbols similar to those on Elara's map covered the archway entrance.",

        '"This is it," whispered Maevis, her eyes wide with wonder. "The Temple of Echoes."',

        'Thorne stepped forward confidently. "Let\'s find this Crystal and—"',

        '"Wait!" Elara grabbed his arm. "The map mentioned a guardian."',

        "As if summoned by her words, the air before them shimmered and coalesced into a translucent figure—neither male nor female, young nor old, but somehow all of these at once. Its voice resonated not in their ears but in their minds.",

        '**"Seekers of the Crystal, you must be worthy. Each shall face what lies within."**',

        "Before they could react, the world around them dissolved. Elara found herself alone in a void that slowly transformed into her grandmother's attic. But this time, her grandmother sat waiting, disappointment etched on her face.",

        '"*You abandoned your family for a treasure hunt,*" the apparition said. "*Is this truly who you are?*"',

        'Elara\'s heart raced. "No—I came because I felt called. Because I believed there was something important I needed to discover, not just for me, but for everyone."',

        "Meanwhile, Thorne faced his own vision—surrounded by wealth but utterly alone, the treasures he'd accumulated meaningless without anyone to share them with. And Maevis confronted her fear of having wasted her life seeking knowledge that would die with her.",

        "In that moment of truth, each realized what truly mattered to them. When the visions faded and they found themselves reunited in the temple's central chamber, something had changed in all of them. They looked at each other with new understanding.",

        '"We passed," Maevis said softly.',

        "Before them, a pedestal held a crystal that seemed to contain galaxies within its facets. The Crystal of Echoes awaited.",
      ],
    },
    {
      beat: 5,
      paragraphs: [
        "The Crystal pulsed with inner light as they approached, reflecting not just their physical forms but something deeper—their true selves, their potential, their connected destinies.",

        '"All this time," Elara breathed, "I thought we were searching for a magical object, but..."',

        '"It\'s a mirror," Thorne finished, his usual bravado subdued. "Not of what we are, but what we could be."',

        'Maevis nodded, tears in her eyes. "The greatest magic has always been within us. The Crystal merely helps us see it—and see each other."',

        'As they stood transfixed, the guardian\'s voice spoke one final time: **"The Crystal remains here, but its echo goes with you. You came seeking an artifact but found something greater—truth, connection, and the magic of your own becoming."**',

        "They left the temple changed, carrying not a physical treasure but something far more valuable. Elara understood now why her grandmother had left her the map—not to find an object of power, but to discover her own inner strength and the importance of connection.",

        "As they journeyed back together, plans already forming for new adventures, Elara realized that some quests never truly end. The Crystal of Echoes had changed them all, its magic continuing to resonate in their newfound friendship and purpose.",

        "And sometimes, in quiet moments, Elara could still hear the whispers of the Crystal, reminding her that the most powerful magic was not found in artifacts, but in the human heart.",
      ],
    },
  ],
  metadata: {
    word_count: 1487,
    read_time_minutes: 7,
  },
}

export async function GET() {
  try {
    const supabase = createServerSupabaseClient()

    // Check if we already have stories
    const { count, error: countError } = await supabase.from("stories").select("*", { count: "exact", head: true })

    if (countError) {
      console.error("Error checking stories count:", countError)
      return NextResponse.json({ error: "Failed to check stories count" }, { status: 500 })
    }

    // If we already have stories, don't seed
    if (count && count > 0) {
      return NextResponse.json({ message: "Database already has stories, skipping seed" })
    }

    // Insert sample story
    const { data: newStory, error: storyError } = await supabase
      .from("stories")
      .insert({
        title: SAMPLE_STORY.title,
        initial_prompt: SAMPLE_STORY.request_spec.theme,
        story_data: SAMPLE_STORY,
      })
      .select()
      .single()

    if (storyError) {
      console.error("Error creating sample story:", storyError)
      return NextResponse.json({ error: "Failed to create sample story" }, { status: 500 })
    }

    return NextResponse.json({
      message: "Database seeded successfully with sample story",
      story: newStory,
    })
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
