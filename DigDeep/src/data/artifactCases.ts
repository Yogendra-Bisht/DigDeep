// ============================================================
// DigDeep — 3 Artifact Detective Cases Dataset (FR3B)
// ============================================================
import { ArtifactCase } from '../types';

export const ARTIFACT_CASES: Record<string, ArtifactCase> = {
  'case-amphora-01': {
    id: 'case-amphora-01',
    title: 'Roman Dressel 2-4 Amphora Sherd',
    provenance: 'Arikamedu (Puducherry Coast, India)',
    period: '1st Century BCE – 1st Century CE',
    material: 'Coarse Micaceous Terracotta (Campanian clay fabric)',
    emoji: '🏺',
    description: 'A double-handled neck fragment of a Mediterranean storage vessel excavated from coastal port silt on the Bay of Bengal.',
    hotspots: [
      {
        id: 'spot-amphora-rim',
        title: 'Rim & Double-Rod Handle',
        xPercent: 50,
        yPercent: 25,
        observationIntuitive: 'Two cylindrical clay coils fused together forming a bifid handle. This specific joint design was only practiced in Italian and Aegean workshops.',
        observationDeepDive: 'Diagnostic Dressel 2-4 handle morphology imitating Koan prototypes. Petrographic examination reveals volcanic augite and quartz sands distinct to the Bay of Naples.',
        clueBadge: 'Italian Workshop Design',
      },
      {
        id: 'spot-amphora-resin',
        title: 'Internal Resin Coating',
        xPercent: 42,
        yPercent: 62,
        observationIntuitive: 'A dark, aromatic glossy glaze lines the inside. Why coat the inside of porous clay?',
        observationDeepDive: 'Gas Chromatography-Mass Spectrometry (GC-MS) isolates abietic acid residues, proving pine pitch coating used to seal porous earthenware against Mediterranean wine evaporation.',
        clueBadge: 'Organic Residue: Wine Resin',
      },
      {
        id: 'spot-amphora-graffito',
        title: 'Incised Tamil-Brahmi Graffito',
        xPercent: 65,
        yPercent: 78,
        observationIntuitive: 'Scratched post-firing into the clay is a short mark in an ancient Indian script.',
        observationDeepDive: 'Post-firing merchant mark reading "Korran" or "Athan" inscribed in archaic Tamil-Brahmi characters, indicating secondary ownership by local Tamil trading guilds.',
        clueBadge: 'Tamil Merchant Mark',
      },
    ],
    hypothesisQuestions: [
      {
        id: 'hyp-origin',
        question: 'Where was this clay vessel manufactured?',
        options: [
          {
            id: 'opt-local',
            text: 'Locally in Southern India along the Coromandel coast',
            isCorrect: false,
            explanation: 'Coromandel clays do not contain the volcanic augite and micaceous sands found in this fabric.',
          },
          {
            id: 'opt-med',
            text: 'In the Mediterranean (Roman Italy or Aegean workshops)',
            isCorrect: true,
            explanation: 'Correct! The bifid double-rod handle and volcanic sand temper uniquely match Roman Dressel 2-4 amphorae from central Italy.',
          },
          {
            id: 'opt-china',
            text: 'In Han Dynasty Southern China kiln networks',
            isCorrect: false,
            explanation: 'Han ceramics were high-fired stoneware or porcelain, distinct from coarse low-fired micaceous terracotta amphorae.',
          },
        ],
      },
      {
        id: 'hyp-cargo',
        question: 'What cargo did this vessel transport across the Indian Ocean?',
        options: [
          {
            id: 'opt-grain',
            text: 'Bulk cereal grain and legumes',
            isCorrect: false,
            explanation: 'Internal pitch lining was unnecessary for dry grain; it was designed specifically to prevent liquid seepage.',
          },
          {
            id: 'opt-wine',
            text: 'Campanian vintage wine or Mediterranean olive oil',
            isCorrect: true,
            explanation: 'Correct! The pine resin coating preserved wine during the 4,000-mile monsoon voyage from Roman Egypt ports (Berenike) to Arikamedu.',
          },
          {
            id: 'opt-perfume',
            text: 'Precious liquid perfumes and ointments',
            isCorrect: false,
            explanation: 'Perfumes were transported in small alabaster or glass unguentaria, not heavy 25-liter storage jars.',
          },
        ],
      },
      {
        id: 'hyp-trade',
        question: 'What was exchanged in return for Mediterranean imports at Arikamedu?',
        options: [
          {
            id: 'opt-spices-textiles',
            text: 'Black pepper, fine muslin textiles, beryl gems, and tortoise shell',
            isCorrect: true,
            explanation: 'Spot on! Classical sources like the Periplus of the Erythraean Sea record Roman bullion and wine traded for Malabar pepper and Gangetic muslins.',
          },
          {
            id: 'opt-horses',
            text: 'Arabian war horses and military chariot axles',
            isCorrect: false,
            explanation: 'Horse trade across the western coast accelerated much later during the medieval Sultanate and Vijayanagara eras.',
          },
          {
            id: 'opt-marble',
            text: 'Raw Italian Carrara marble blocks',
            isCorrect: false,
            explanation: 'Carrara marble was quarried for Roman imperial domestic building, not shipped outbound.',
          },
        ],
      },
    ],
    deductionSummary: {
      title: 'Arikamedu: Maritime Gateway of the Indo-Roman Trade Network',
      bodyIntuitive: 'This amphora confirms that over 2,000 years ago, Greek and Roman merchant navigators sailed the southwest monsoon winds across the Arabian Sea, rounding Cape Comorin to exchange vintage wine and glassware for South Indian spices, pearls, and jewels.',
      bodyDeepDive: 'The stratified combination of Dressel 2-4 sherds, Arretine red-gloss ware, and Roman intaglio gems at Arikamedu excavated by Sir Mortimer Wheeler and Vimala Begley provides empirical chronology (1st c. BCE - 2nd c. CE) linking Sangam port emporiums directly to Alexandria and the Red Sea.',
      significancePoints: [
        'Monsoon sailing navigation enabled round-trip voyage within one calendar year.',
        'Local Tamil-Brahmi graffiti shows Indian merchants catalogued and managed foreign imports.',
        'Resin chemistry proves preservation technology for high-value maritime cargo.',
      ],
    },
  },

  'case-seal-01': {
    id: 'case-seal-01',
    title: 'Indus Unicorn Steatite Seal',
    provenance: 'Harappa (Ravi Basin, Punjab)',
    period: 'Mature Harappan Phase (c. 2600 – 1900 BCE)',
    material: 'Alkaline-glazed and fired Talc / Steatite (Soapstone)',
    emoji: '🪬',
    description: 'A square stamp seal with a prominent profile of a single-horned bovine standing before a ritual stand, crowned by five pictographic signs.',
    hotspots: [
      {
        id: 'spot-seal-script',
        title: 'Inscribed Script Characters',
        xPercent: 50,
        yPercent: 15,
        observationIntuitive: 'A sequence of symbols running across the top. The signs are carved in reverse (mirrored) so they stamp clearly into damp clay.',
        observationDeepDive: 'Standardized intaglio characters displaying boustrophedon or right-to-left orientation, likely identifying the merchant, clan affiliation, or cargo endorsement.',
        clueBadge: 'Reversed Intaglio Script',
      },
      {
        id: 'spot-seal-motif',
        title: 'Single-Horned Bovine ("Unicorn")',
        xPercent: 46,
        yPercent: 52,
        observationIntuitive: 'An animal in profile with one curved horn extending forward and an ornate saddle blanket.',
        observationDeepDive: 'Over 60% of all Indus seals depict this mythical or stylized single-horned bull, suggesting it served as the dominant administrative badge of the merchant class.',
        clueBadge: 'Dominant Administrative Badge',
      },
      {
        id: 'spot-seal-stand',
        title: 'Ritual Filtration Stand',
        xPercent: 78,
        yPercent: 72,
        observationIntuitive: 'A two-tiered object standing directly beneath the creature’s snout. The upper vessel resembles a perforated colander.',
        observationDeepDive: 'Interpreted by Possehl and Kenoyer as a sacred ritual standard or purification apparatus for brewing sacred fermented plant extracts.',
        clueBadge: 'Ritual Stand Device',
      },
    ],
    hypothesisQuestions: [
      {
        id: 'hyp-seal-purpose',
        question: 'What was the functional purpose of this intaglio stone seal?',
        options: [
          {
            id: 'opt-currency',
            text: 'Used as standard coin currency for daily market purchases',
            isCorrect: false,
            explanation: 'Indus economics operated through regulated stone weights (chert cubical weights) and commodity bartering, not stamped coinage.',
          },
          {
            id: 'opt-sealing',
            text: 'Pressing signatures onto wet clay sealings attached to trade bundles',
            isCorrect: true,
            explanation: 'Correct! Baked clay sealings ("seal impressions") found in Lothal docks preserve reed-mat impressions on the back and seal stamps on the front.',
          },
          {
            id: 'opt-amulet-only',
            text: 'Solely an ornamental bead worn around the wrist',
            isCorrect: false,
            explanation: 'While seals had pierced bosses on the back for cord suspension, their mirror-carved intaglio proves their primary function was mechanical stamping.',
          },
        ],
      },
      {
        id: 'hyp-seal-pyro',
        question: 'How did Harappan artisans achieve the hard, durable white surface?',
        options: [
          {
            id: 'opt-pyro',
            text: 'Carving soft talc stone, coating with alkali slurry, then firing over 900°C',
            isCorrect: true,
            explanation: 'Spot on! Steatite is easily carved with bronze chisels when raw (Mohs hardness 1), but firing transforms it to enstatite (Mohs 5.5-6), creating a glass-hard white surface.',
          },
          {
            id: 'opt-plaster',
            text: 'Molding lime plaster mixed with animal fat without kiln firing',
            isCorrect: false,
            explanation: 'Molded plaster would dissolve in moist riverbed soil. X-ray diffraction confirms high-temperature mineral phase transformation.',
          },
          {
            id: 'opt-ivory',
            text: 'Polishing elephant tusks with silica abrasives',
            isCorrect: false,
            explanation: 'Ivory softens and chars at high temperatures and lacks the crystalline silicate structure of steatite.',
          },
        ],
      },
      {
        id: 'hyp-seal-reach',
        question: 'Where outside the Indus Valley have identical Harappan seals been excavated?',
        options: [
          {
            id: 'opt-meso',
            text: 'Ur, Kish, and Susa in ancient Mesopotamia and Dilmun (Bahrain)',
            isCorrect: true,
            explanation: 'Exact match! Cuneiform texts in Mesopotamia speak of trade with "Meluhha" (the Indus region), confirmed by Indus seals found in Persian Gulf ports.',
          },
          {
            id: 'opt-greece',
            text: 'Mycenaean citadels in mainland Greece',
            isCorrect: false,
            explanation: 'No direct bronze-age Indus contact existed with the Aegean world.',
          },
          {
            id: 'opt-egypt',
            text: 'The Valley of the Kings tombs in Luxor',
            isCorrect: false,
            explanation: 'There is no archaeological evidence of direct Indus seal usage in New Kingdom Egypt.',
          },
        ],
      },
    ],
    deductionSummary: {
      title: 'Harappan Administration: Standardized Commerce Without Kings',
      bodyIntuitive: 'This seal demonstrates that the Indus civilization invented standardized commercial security. A merchant could seal bales of cotton or carnelian beads in Harappa, and a customer in Mesopotamia could verify the shipment hadn’t been opened in transit.',
      bodyDeepDive: 'The uniform dimensions, standardized iconographic motifs, and controlled distribution of steatite seals across 1.5 million square kilometers indicate centralized guild authorities or civic magistracies capable of enforcing uniform weights and economic seals without monumental palaces or royal statues.',
      significancePoints: [
        'Steatite pyrotechnology reveals sophisticated ceramic-mineral metallurgy.',
        'Found in Mesopotamian stratigraphy, giving cross-dating synchronism (Akkadian period).',
        'Demonstrates an early form of brand authenticity and package security seals.',
      ],
    },
  },

  'case-coin-01': {
    id: 'case-coin-01',
    title: 'Punch-Marked Silver Karshapana',
    provenance: 'Taxila Hoard (Bhir Mound, Gandhara)',
    period: 'Maurya Empire (c. 3rd Century BCE)',
    material: 'Debased Fine Silver alloy (~75-80% Ag, Cu balance)',
    emoji: '🪙',
    description: 'An irregularly clipped rectangular planchet of hammered silver stamped with five distinct punch symbols on the obverse.',
    hotspots: [
      {
        id: 'spot-coin-sun',
        title: 'Solar Radiate Symbol',
        xPercent: 32,
        yPercent: 30,
        observationIntuitive: 'A geometric sunburst with alternating rays and arrows. The clearest mark on the coin face.',
        observationDeepDive: 'The imperial sun motif (Suryamukha) is universally present on Magadha-Maurya imperial series karshapanas as the paramount dynastic signifier.',
        clueBadge: 'Imperial Sun Mark',
      },
      {
        id: 'spot-coin-arched',
        title: 'Six-Arched Hill with Crescent',
        xPercent: 68,
        yPercent: 42,
        observationIntuitive: 'Three to six stacked domes or hill arches with a curved crescent above.',
        observationDeepDive: 'The chaitya or six-arched hill (meru) symbol, widely linked to Emperor Chandragupta or Ashoka, symbolizing Buddhist/Jain cosmological sacred mountains.',
        clueBadge: 'Six-Arched Hill (Meru)',
      },
      {
        id: 'spot-coin-clip',
        title: 'Clipped Planchet Corner',
        xPercent: 88,
        yPercent: 78,
        observationIntuitive: 'The edges are clipped with metal snips instead of being struck into a round die.',
        observationDeepDive: 'Weight adjustment clipping: ancient mint masters trimmed corners with shears until the sheet matched the exact canonical 32-ratti standard (approx. 3.4 grams).',
        clueBadge: '32-Ratti Weight Regulation',
      },
    ],
    hypothesisQuestions: [
      {
        id: 'hyp-coin-tech',
        question: 'Why are the symbols punched separately rather than struck from a single coin die?',
        options: [
          {
            id: 'opt-dies',
            text: 'Separate administrative punches authorized by multiple guilds and imperial mint masters',
            isCorrect: true,
            explanation: 'Correct! Unlike Greek double-die coins, Indian punch-marked series used independent punches: 3 state marks + 2 local mint/treasurer marks.',
          },
          {
            id: 'opt-careless',
            text: 'They lacked metal smelting technology to forge circular coin dies',
            isCorrect: false,
            explanation: 'Indian metallurgical casting and die-cutting technology was world-renowned (e.g. crucible steel and intricate bronze work).',
          },
          {
            id: 'opt-child',
            text: 'These were experimental classroom practice blanks made by students',
            isCorrect: false,
            explanation: 'Millions of identical karshapanas circulate across all Indian states, proving mass imperial standardization.',
          },
        ],
      },
      {
        id: 'hyp-coin-weight',
        question: 'What botanical seed defined the ancient Indian standard for silver weight?',
        options: [
          {
            id: 'opt-ratti',
            text: 'Gunja / Ratti seed (Abrus precatorius) averaging ~0.11 grams',
            isCorrect: true,
            explanation: 'Spot on! The Arthashastra mandates 1 Karshapana = 32 ratti (~3.5g). These seeds maintain an astonishingly consistent weight in nature.',
          },
          {
            id: 'opt-mustard',
            text: 'Black mustard seeds (Sarshapa)',
            isCorrect: false,
            explanation: 'Mustard seeds were used for micro-weight subdivisions of gold dust, not the primary silver karshapana standard.',
          },
          {
            id: 'opt-paddy',
            text: 'Hulled grain of long-grain rice (Tandula)',
            isCorrect: false,
            explanation: 'Rice varies drastically based on moisture content; Ratti seeds were the undisputed pan-Indian gem and silver standard.',
          },
        ],
      },
      {
        id: 'hyp-coin-arthashastra',
        question: 'Which ancient political treatise details the exact office of the State Mint Master (Lakshanadhyaksha)?',
        options: [
          {
            id: 'opt-artha',
            text: 'The Arthashastra of Kautilya (Chanakya)',
            isCorrect: true,
            explanation: 'Correct! Kautilya outlines strict alloy purity: 11 parts silver, 4 parts copper, and 1 part hardening metal, audited by the Rupadarshaka.',
          },
          {
            id: 'opt-kama',
            text: 'The Kamasutra of Vatsyayana',
            isCorrect: false,
            explanation: 'The Kamasutra is a treatise on aesthetics, love, and courtly life, not imperial fiscal regulation.',
          },
          {
            id: 'opt-manu',
            text: 'The Natyashastra of Bharata Muni',
            isCorrect: false,
            explanation: 'The Natyashastra governs classical dance, drama, and performance poetics.',
          },
        ],
      },
    ],
    deductionSummary: {
      title: 'Monetary Unification of the Subcontinent Under the Mauryas',
      bodyIntuitive: 'This clipped piece of silver proved that 2,300 years ago, an empire spanning from Afghanistan to the borders of Karnataka was unified under a single currency standard. A merchant from Pataliputra could pay a craftsman in Taxila without exchanging currency.',
      bodyDeepDive: 'The Taxila hoards recovered by John Marshall contain thousands of punch-marked silver coins displaying consistent trace metallurgical signatures (lead isotope ratios indicating Zawar silver-lead zinc mines in Rajasthan). This reveals organized state mining monopolies described in Ashokan edicts and Kautilyan manuals.',
      significancePoints: [
        'Demonstrates state-regulated fiscal policy governed by Arthashastra standards.',
        'Zawar mine lead isotopes prove indigenous Indian silver extraction in 4th c. BCE.',
        'Punch marks act as early security watermarks certifying metallurgical purity.',
      ],
    },
  },
};
