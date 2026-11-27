// ============================================================
// DigDeep — Site Codex Enrichment Data
// Provides multi-plate watercolor galleries, fascinating facts,
// and chronological/field context for all 18 Atlas sites.
// ============================================================

import { PAINTINGS, type PaintingPlate } from '../assets/paintings';

export interface SiteFact {
  title: string;
  intuitive: string;
  deepDive: string;
}

export interface SiteCodexEntry {
  era: string;
  location: string;
  keyFigure: string;
  gallery: PaintingPlate[];
  facts: SiteFact[];
  highlights: string[];
}

const DEFAULT_ENTRY: SiteCodexEntry = {
  era: 'Ancient Horizon',
  location: 'Global Heritage Archive',
  keyFigure: 'Field Survey Teams',
  gallery: [
    {
      source: PAINTINGS.stratigraphy,
      plateNumber: 'Plate I',
      caption: 'Excavation Trench & Stratigraphic Profile',
      curatorNote: 'Every soil horizon preserves a sealed chapter of human activity.',
    },
    {
      source: PAINTINGS.amphora,
      plateNumber: 'Plate II',
      caption: 'Diagnostic Ceramic Sherd Study',
      curatorNote: 'Rim profiles and clay fabric reveal trade origin and firing temperature.',
    },
    {
      source: PAINTINGS.karshapanaCoin,
      plateNumber: 'Plate III',
      caption: 'Numismatic & Trade Weight Specimen',
      curatorNote: 'Coins anchor stratigraphic layers to datable political dynasties.',
    },
  ],
  facts: [
    {
      title: 'Context Is Everything',
      intuitive: 'An artifact’s exact resting spot in the soil often tells archaeologists more than the object itself.',
      deepDive: 'Provenience (3D coordinates + stratigraphic matrix) enables seriation, association dating, and behavioural reconstruction.',
    },
    {
      title: 'Pottery Never Truly Rots',
      intuitive: 'Fired clay sherds survive for millennia, making broken pots the backbone of archaeological dating.',
      deepDive: 'Thermoluminescence and typology of ceramic wares provide relative chronologies across non-literate horizons.',
    },
    {
      title: 'Microscopic Clues',
      intuitive: 'Pollen grains, starch, and charcoal specks stuck to ancient tools reveal what people cooked and farmed.',
      deepDive: 'Phytolith, lipid-residue GC-MS, and archaeobotanical flotation recover invisible subsistence economies.',
    },
  ],
  highlights: [
    'Multi-layer stratigraphic context preserved in situ',
    'Diagnostic material culture linking regional trade networks',
    'Cross-verified through scientific dating & archival typology',
  ],
};

export const SITE_CODEX_DATA: Record<string, SiteCodexEntry> = {
  'arch-cases-04': {
    era: 'c. 2580 – 2510 BCE (Old Kingdom, 4th Dynasty)',
    location: 'Giza Plateau, Lower Egypt',
    keyFigure: 'Hemiunu (Vizier) · Mark Lehner · Pierre Tallet',
    gallery: [
      {
        source: PAINTINGS.gizaPyramids,
        plateNumber: 'Plate I',
        caption: 'Great Pyramid of Khufu & Sphinx Profile at Giza',
        curatorNote: 'Originally clad in gleaming white Tura limestone casing blocks.',
      },
      {
        source: PAINTINGS.tutankhamunTomb,
        plateNumber: 'Plate II',
        caption: 'Egyptian Royal Funerary Art & Mineral Pigments',
        curatorNote: 'Lapis lazuli, ochre, and synthetic Egyptian blue adorned royal chambers.',
      },
      {
        source: PAINTINGS.stratigraphy,
        plateNumber: 'Plate III',
        caption: 'Heit el-Ghurab Workers’ City Stratigraphy',
        curatorNote: 'Bakeries and cattle bone middens proved 20,000+ skilled artisans lived here.',
      },
    ],
    facts: [
      {
        title: 'True North Within 0.05°',
        intuitive: 'The Great Pyramid faces true north more accurately than the Greenwich Observatory building in London.',
        deepDive: 'Aligning to circumpolar stars ("stretching the cord") yielded an azimuth error of just 3.4 arc-minutes.',
      },
      {
        title: 'Built by Paid Artisans, Not Slaves',
        intuitive: 'Excavations uncovered bakeries, medical care, and prime beef rations for rotating teams of skilled builders.',
        deepDive: 'Zooarchaeological data from Heit el-Ghurab shows high-protein cattle, sheep, and goat consumption.',
      },
      {
        title: 'World’s Oldest Papyrus Logbook',
        intuitive: 'In 2013, archaeologists found a 4,500-year-old diary written by a stone-boat captain hauling limestone to Giza.',
        deepDive: 'The Wadi al-Jarf papyri (Logbook of Inspector Merer) record daily Nile barge shipments from Tura quarries.',
      },
      {
        title: '2.3 Million Blocks in ~20 Years',
        intuitive: 'That means workers set roughly one massive 2.5-ton stone block in place every few minutes during daylight.',
        deepDive: 'Gypsum mortar acted as both binder and lubricant for sliding blocks along mud-brick construction ramps.',
      },
    ],
    highlights: [
      'Flooded Nile perimeter trenches leveled the 230m base to within 2 cm',
      'Relieving chambers above the King’s Chamber bear red-ochre gang graffiti',
      'Wadi al-Jarf papyri confirm state-organized Nile maritime logistics',
    ],
  },
  'arch-mysteries-04': {
    era: 'c. 1550 – 1070 BCE (New Kingdom, 18th–20th Dynasties)',
    location: 'West Bank of Luxor (Thebes), Egypt',
    keyFigure: 'Howard Carter · Zahi Hawass',
    gallery: [
      {
        source: PAINTINGS.tutankhamunTomb,
        plateNumber: 'Plate I',
        caption: 'KV62 Burial Chamber — Funerary Mask & Canopic Jars',
        curatorNote: 'Over 5,000 artifacts were cataloged inside four compact rock-cut rooms.',
      },
      {
        source: PAINTINGS.gizaPyramids,
        plateNumber: 'Plate II',
        caption: 'From Old Kingdom Pyramids to Hidden Cliff Tombs',
        curatorNote: 'Pharaohs abandoned visible pyramids to thwart ancient tomb robbers.',
      },
      {
        source: PAINTINGS.stratigraphy,
        plateNumber: 'Plate III',
        caption: 'Sealed Context Beneath Later Workers’ Huts',
        curatorNote: '20th-Dynasty stone huts accidentally hid KV62’s entrance for 3,300 years.',
      },
    ],
    facts: [
      {
        title: 'A Dagger Forged From a Meteorite',
        intuitive: 'Tutankhamun was buried with an iron dagger whose metal literally fell from outer space.',
        deepDive: 'Portable XRF spectrometry measured 10.8% nickel and 0.58% cobalt—the unmistakable signature of an iron meteorite.',
      },
      {
        title: 'World’s First Synthetic Pigment',
        intuitive: 'Tomb painters cooked sand, copper, and natron in kilns to invent "Egyptian Blue" over 4,500 years ago.',
        deepDive: 'Calcium copper silicate (CaCuSi4O10) glows under infrared luminescence, letting modern scanners trace faded art.',
      },
      {
        title: 'CT Scans Rewrote His Death',
        intuitive: 'Forensic CT imaging proved he wasn’t murdered by a head blow—he suffered a severe broken leg and malaria.',
        deepDive: '2005 multi-slice CT and 2010 aDNA PCR identified Plasmodium falciparum and avascular bone necrosis.',
      },
      {
        title: 'Ancient Mold Preserved in Paint',
        intuitive: 'Dark brown spots on the tomb walls are dead microbes that died because the tomb was sealed while plaster was still damp.',
        deepDive: 'Micro-FTIR analysis showed the fungal spots were inactive for millennia, proving the burial was rushed.',
      },
    ],
    highlights: [
      'KV62 yielded 5,398 cataloged objects over a 10-year excavation',
      'Non-invasive CT & aDNA forensics solved century-old royal mysteries',
      'Meteoritic iron & synthetic pigments showcase Bronze Age chemistry',
    ],
  },
  'arch-cases-05': {
    era: 'c. 1450 – 1532 CE (Late Horizon Inca Empire)',
    location: 'Urubamba Ridge, Cusco Region, Peru (2,430 m)',
    keyFigure: 'Emperor Pachacuti · Hiram Bingham · Kenneth Wright',
    gallery: [
      {
        source: PAINTINGS.machuPicchu,
        plateNumber: 'Plate I',
        caption: 'Machu Picchu Citadel & Dry-Stone Terraces',
        curatorNote: '700+ terraces stabilize the ridge against monsoon landslides.',
      },
      {
        source: PAINTINGS.stepwell,
        plateNumber: 'Plate II',
        caption: 'Comparative Ancient Hydraulic Engineering',
        curatorNote: 'Like Indian stepwells, Inca engineers mastered subsurface water control.',
      },
      {
        source: PAINTINGS.stratigraphy,
        plateNumber: 'Plate III',
        caption: 'Subsurface Gravel, Sand & Drainage Strata',
        curatorNote: 'The visible grass terraces hide 3 meters of engineered drainage layers.',
      },
    ],
    facts: [
      {
        title: 'Earthquake-Proof "Dancing" Stones',
        intuitive: 'Without a single drop of mortar, Inca walls rattle during earthquakes and settle right back into place.',
        deepDive: 'Polygonal ashlar blocks with 5–8° inward batter dissipate seismic shear waves without fracturing.',
      },
      {
        title: '60% of the Engineering Is Underground',
        intuitive: 'Most of the work at Machu Picchu is invisible—deep stone drains and crushed-rock layers carry away torrential rain.',
        deepDive: 'Hydrological studies show 16 sequential stone fountains fed by a 749-meter spring canal.',
      },
      {
        title: 'Carved With Stone Hammers',
        intuitive: 'The Incas had no iron or steel chisels—they shaped hard granite using river cobbles and sand abrasives.',
        deepDive: 'Pounding with quartzite and hematite hammerstones created micro-fractured ashlar faces that fit tighter than a knife blade.',
      },
      {
        title: 'Never Found by Conquistadors',
        intuitive: 'Abandoned during the 1530s turmoil, the cloud-forest citadel remained hidden from Spanish colonial armies.',
        deepDive: 'AMS radiocarbon dating places peak occupation between 1420 and 1530 CE.',
      },
    ],
    highlights: [
      'Zero-mortar polygonal ashlar masonry built for high-seismic zones',
      '16 stone fountains delivering 749 L/min via spring-fed aqueducts',
      'Intihuatana stone aligned with solstice & equinox solar shadows',
    ],
  },
  'arch-fieldwork-04': {
    era: 'c. 2500 – 1900 BCE (Mature Harappan Phase)',
    location: 'Larkana District, Sindh (Lower Indus Basin)',
    keyFigure: 'R.D. Banerji · John Marshall · Ernest Mackay',
    gallery: [
      {
        source: PAINTINGS.mohenjoDaro,
        plateNumber: 'Plate I',
        caption: 'The Great Bath & Corbelled Brick Drain at Mohenjo-daro',
        curatorNote: 'Sawn baked bricks bonded with gypsum mortar & sealed with natural bitumen.',
      },
      {
        source: PAINTINGS.indusSeal,
        plateNumber: 'Plate II',
        caption: 'Steatite Unicorn Seal From Citadel Workshops',
        curatorNote: 'Used to stamp clay tags on traded bales and storeroom doors.',
      },
      {
        source: PAINTINGS.stepwell,
        plateNumber: 'Plate III',
        caption: 'South Asian Civic Water Architecture Tradition',
        curatorNote: 'Harappan wells & baths pioneered subcontinent hydraulic masonry.',
      },
    ],
    facts: [
      {
        title: 'Indoor Plumbing 4,500 Years Ago',
        intuitive: 'Nearly every house had a brick bathing platform and terracotta pipes draining into covered street sewers.',
        deepDive: 'Vertical chute pipes from upper stories emptied into brick-lined inspection sumps along cardinal streets.',
      },
      {
        title: '700+ Brick-Lined Wells',
        intuitive: 'Mohenjo-daro had the highest density of private and public wells of any Bronze Age city on Earth.',
        deepDive: 'Wedge-shaped radial bricks prevented well shafts from collapsing under lateral groundwater pressure.',
      },
      {
        title: '1:2:4 Standardized Bricks Everywhere',
        intuitive: 'Across a million square kilometers, Indus cities baked bricks to the exact same 1:2:4 height-width-length ratio.',
        deepDive: 'Standardized English-bond bricklaying maximized structural strength without central imperial palaces.',
      },
      {
        title: 'No Palaces, No Giant Statues of Kings',
        intuitive: 'Unlike Egypt or Mesopotamia, Mohenjo-daro invested in public baths, granaries, and clean streets instead of royal tombs.',
        deepDive: 'Absence of monumental ruler iconography points to merchant-guild or civic-council governance.',
      },
    ],
    highlights: [
      'Great Bath waterproofed with a 2.5 cm natural bitumen membrane',
      'Orthogonal street grid with covered corbelled brick drainage',
      'Binary/decimal chert weight system standardized across 1,000+ km',
    ],
  },
  'arch-cases-06': {
    era: 'c. 4th Century BCE – 106 CE (Nabataean Kingdom)',
    location: 'Ma’an Governorate, Southern Jordan',
    keyFigure: 'Johann Ludwig Burckhardt · Nabataean Hydraulic Guilds',
    gallery: [
      {
        source: PAINTINGS.petraTreasury,
        plateNumber: 'Plate I',
        caption: 'Al-Khazneh (The Treasury) Framed by the Siq Canyon',
        curatorNote: 'Carved from the cliff top downward using horizontal rock ledges.',
      },
      {
        source: PAINTINGS.stepwell,
        plateNumber: 'Plate II',
        caption: 'Rock-Cut Cisterns & Water Harvesting Channels',
        curatorNote: 'Every drop of winter rain was captured into 200+ hidden reservoirs.',
      },
      {
        source: PAINTINGS.amphora,
        plateNumber: 'Plate III',
        caption: 'Incense & Wine Trade Connections Across Arabia & Rome',
        curatorNote: 'Petra linked Indian Ocean spices with Mediterranean ports.',
      },
    ],
    facts: [
      {
        title: 'Carved From the Roof Down',
        intuitive: 'Instead of building wooden scaffolding 40 meters high, Nabataean masons carved palaces starting at the top urn and working down.',
        deepDive: 'Horizontal footholds cut into the sandstone cliff allowed top-down relief sculpting with 45° tooth chisels.',
      },
      {
        title: 'Pressurized Ceramic Pipelines',
        intuitive: 'Clay pipes tucked inside the canyon walls carried fresh spring water miles into the desert city under steady pressure.',
        deepDive: 'Bell-and-spigot terracotta conduits sealed with lime mortar minimized evaporation and siltation.',
      },
      {
        title: 'Flash-Flood Taming Dams',
        intuitive: 'An 88-meter tunnel blasted through solid rock diverted deadly winter flash floods away from Petra’s entrance.',
        deepDive: 'Check-dams across tributary wadis slowed runoff and recharged subterranean rock-cut cisterns.',
      },
      {
        title: '85% of Petra Is Still Unexcavated',
        intuitive: 'Most of the ancient city remains buried beneath desert sand and alluvial silt.',
        deepDive: 'Satellite LiDAR and ground-penetrating radar continue to map buried colonnades and gardens.',
      },
    ],
    highlights: [
      'Top-down sandstone facade carving with 45° diagonal chisel marks',
      '200+ rock-cut cisterns & 88m flood-diversion tunnel',
      'Key caravan hub linking Indian Ocean & Mediterranean trade',
    ],
  },
  'arch-mysteries-05': {
    era: 'c. 9600 – 8200 BCE (Pre-Pottery Neolithic A/B)',
    location: 'Şanlıurfa Province, Southeastern Anatolia',
    keyFigure: 'Klaus Schmidt · Lee Clare',
    gallery: [
      {
        source: PAINTINGS.stratigraphy,
        plateNumber: 'Plate I',
        caption: 'Deep Neolithic Enclosure Trench & Stone Pillars',
        curatorNote: 'Intentional backfilling preserved carved reliefs for 11,500 years.',
      },
      {
        source: PAINTINGS.stepwell,
        plateNumber: 'Plate II',
        caption: 'Monumental Cut-Stone Architecture Before Metal Tools',
        curatorNote: '16-ton limestone blocks quarried using only flint picks and stone mauls.',
      },
      {
        source: PAINTINGS.indusSeal,
        plateNumber: 'Plate III',
        caption: 'Comparative Symbolic Animal Reliefs Across Millennia',
        curatorNote: 'Foxes, scorpions, and bulls encoded mythic cosmology in stone.',
      },
    ],
    facts: [
      {
        title: '6,000 Years Older Than Stonehenge',
        intuitive: 'When Stonehenge was built, Göbekli Tepe was already older to its builders than Stonehenge is to us today.',
        deepDive: '14C dates on pedogenic carbonate coatings place Enclosure D at c. 9600–9000 BCE.',
      },
      {
        title: 'Built Before Pottery or Metal',
        intuitive: 'Carvers shaped 16-ton limestone pillars using nothing harder than flint blades and basalt hammers.',
        deepDive: 'Chisel-scarred quarry beds on the surrounding limestone plateau show unfinished 7m pillars still attached to bedrock.',
      },
      {
        title: 'Stone Vats for Ancient Feasts',
        intuitive: 'Carved stone troughs held 160 liters of wild-grain fermented porridge for massive seasonal gatherings.',
        deepDive: 'Calcium-oxalate residues and phytoliths confirm large-scale wild cereal processing.',
      },
      {
        title: 'Intentionally Buried by Its Builders',
        intuitive: 'After centuries of use, Neolithic bands carefully buried the stone circles under tons of rubble and gazelle bones.',
        deepDive: 'Deliberate anthropogenic backfill sealed the reliefs from wind erosion.',
      },
    ],
    highlights: [
      'Oldest known monumental megalithic enclosures (c. 9600 BCE)',
      'Challenged the "farming first, monuments later" theory of civilization',
      '100,000+ wild gazelle & aurochs bones point to hunter-gatherer feasts',
    ],
  },
  'arch-mysteries-01': {
    era: 'c. 2600 – 1900 BCE (Mature Harappan)',
    location: 'Indus & Ghaggar-Hakra Basins',
    keyFigure: 'Iravatham Mahadevan · Asko Parpola',
    gallery: [
      {
        source: PAINTINGS.indusSeal,
        plateNumber: 'Plate I',
        caption: 'Steatite Unicorn Seal & Incised Indus Script',
        curatorNote: 'Over 4,000 inscribed seals and tablets have been cataloged.',
      },
      {
        source: PAINTINGS.mohenjoDaro,
        plateNumber: 'Plate II',
        caption: 'Urban Context of Mohenjo-daro’s Citadel',
        curatorNote: 'Seals appear along trade streets, granaries, and harbour warehouses.',
      },
      {
        source: PAINTINGS.karshapanaCoin,
        plateNumber: 'Plate III',
        caption: 'Later South Asian Symbolic Stamping Tradition',
        curatorNote: 'Compare Harappan seal motifs with early Mauryan punch symbols.',
      },
    ],
    facts: [
      {
        title: 'Shorter Than a Tweet',
        intuitive: 'The average Indus inscription is just 4.6 signs long—and the longest ever found has only 34 characters.',
        deepDive: 'Absence of long royal decrees or bilingual Rosetta-Stone texts makes full phonetic decipherment elusive.',
      },
      {
        title: 'Baked White in Kilns',
        intuitive: 'Soft steatite soapstone was carved, coated in alkali glaze, and fired at 900°C to turn it glass-hard and ivory white.',
        deepDive: 'Pyrotechnological firing converted magnesium silicate into hard enstatite.',
      },
      {
        title: 'Found All the Way in Iraq',
        intuitive: 'Indus seals turned up in Mesopotamian cities like Ur and Susa—proof of Bronze Age sea trade.',
        deepDive: 'Akkadian cuneiform records mention ships arriving from "Meluhha" carrying carnelian and timber.',
      },
    ],
    highlights: [
      '400+ distinct signs combining logosyllabic & determinative glyphs',
      'Written predominantly right-to-left (mirror-carved on seal faces)',
      'Markov-chain entropy studies confirm structured linguistic syntax',
    ],
  },
  'arch-mysteries-02': {
    era: 'c. 300 BCE – 300 CE (Sangam Period)',
    location: 'Cauvery Delta, Tamil Nadu Coast',
    keyFigure: 'S.R. Rao · NIO Marine Archaeology Team',
    gallery: [
      {
        source: PAINTINGS.maritime,
        plateNumber: 'Plate I',
        caption: 'Ancient Coromandel Wharf & Stitched-Plank Merchantman',
        curatorNote: 'Submerged brick piers & stone anchors mapped 5 km offshore.',
      },
      {
        source: PAINTINGS.amphora,
        plateNumber: 'Plate II',
        caption: 'Mediterranean Wine Amphorae From Coastal Trade',
        curatorNote: 'Roman & Red Sea vessels rode the southwest monsoon to Tamil ports.',
      },
      {
        source: PAINTINGS.stratigraphy,
        plateNumber: 'Plate III',
        caption: 'Coastal Silt & Marine Trench Cross-Section',
        curatorNote: 'Side-scan sonar reveals submerged U-shaped structures at 23m depth.',
      },
    ],
    facts: [
      {
        title: 'Ships Sewn With Coconut Rope',
        intuitive: 'Ancient Indian ocean-going ships used coir rope instead of iron nails so hulls flexed safely over coral reefs.',
        deepDive: 'Stitched-plank construction resisted saltwater corrosion along the Coromandel shoals.',
      },
      {
        title: 'Sangam Poetry Matches Sonar Maps',
        intuitive: '1,800-year-old Tamil poems describe Poompuhar’s tall lighthouses and harbour warehouses before the sea swallowed them.',
        deepDive: 'Silappathikaram & Pattinappalai align with NIO side-scan sonar anomalies 5 km offshore.',
      },
    ],
    highlights: [
      'Submerged brick wharf excavated at Vanagiri coastal trench',
      'Monsoon trade nexus linking Southeast Asia & Rome',
      'Corroborated by marine sonar & Sangam literary corpus',
    ],
  },
  'arch-mysteries-03': {
    era: 'c. 2800 – 2000 BCE',
    location: 'Hisar District, Haryana',
    keyFigure: 'Vasant Shinde · Niraj Rai · David Reich',
    gallery: [
      {
        source: PAINTINGS.stratigraphy,
        plateNumber: 'Plate I',
        caption: 'Rakhigarhi Mound 7 Burial & Stratigraphic Matrix',
        curatorNote: 'Sealed alluvial deposits preserved petrous temporal bone collagen.',
      },
      {
        source: PAINTINGS.mohenjoDaro,
        plateNumber: 'Plate II',
        caption: 'Sister Metropolis in the Ghaggar-Hakra Plain',
        curatorNote: 'Rakhigarhi spans over 350 hectares—rivaling Mohenjo-daro in scale.',
      },
      {
        source: PAINTINGS.indusSeal,
        plateNumber: 'Plate III',
        caption: 'Harappan Craft & Script Artifacts From Rakhigarhi',
        curatorNote: 'Steatite seals, faience bangles, and copper implements.',
      },
    ],
    facts: [
      {
        title: 'DNA From Inside the Inner Ear',
        intuitive: 'Hot climates destroy ancient DNA—except inside the rock-hard petrous bone behind the ear.',
        deepDive: 'Over 100 failed extractions preceded the successful sequencing of individual I6113.',
      },
      {
        title: 'Largest Known Indus City',
        intuitive: 'Covering 350+ hectares across 11 mounds, Rakhigarhi is even larger than Mohenjo-daro.',
        deepDive: 'Magnetometry & trenching confirm planned baked-brick streets and drainage.',
      },
    ],
    highlights: [
      'First peer-reviewed Harappan whole-genome sequence (2019)',
      'Showed independent South Asian hunter-gatherer + Iranian-related ancestry',
      '11 habitation mounds spanning Early to Mature Harappan phases',
    ],
  },
  'arch-sciences-01': {
    era: 'Universal Method (1669 – Present)',
    location: 'Global Field Methodology',
    keyFigure: 'Nicolas Steno · Mortimer Wheeler',
    gallery: [
      {
        source: PAINTINGS.stratigraphy,
        plateNumber: 'Plate I',
        caption: 'Trench Baulk Profile & Harris Matrix Horizons',
        curatorNote: 'Deeper undisturbed strata are older than the layers above them.',
      },
      {
        source: PAINTINGS.mohenjoDaro,
        plateNumber: 'Plate II',
        caption: 'Urban Brick Stratigraphy & Foundation Cuts',
        curatorNote: 'Watch for robber trenches and pits that cut through older floors.',
      },
    ],
    facts: [
      {
        title: 'The Wheeler Grid System',
        intuitive: 'Archaeologists leave narrow 1-meter dirt walls ("baulks") standing between squares so they can read the soil’s vertical story.',
        deepDive: 'Mortimer Wheeler popularized the box-grid method at Taxila, Arikamedu, and Harappa.',
      },
      {
        title: 'Watch Out for Burrowing Animals',
        intuitive: 'A single gopher or tree root can drag a modern coin down into a 3,000-year-old ash layer.',
        deepDive: 'Bioturbation and intrusive pits are tracked via soil-color Munsell charts and Harris Matrices.',
      },
    ],
    highlights: [
      'Law of Superposition anchors relative chronology',
      'Harris Matrix maps every cut, fill, and structural interface',
      'In-situ baulk profiles preserve a verifiable visual record',
    ],
  },
  'arch-sciences-02': {
    era: '50,000 Years BP – Present',
    location: 'AMS Radiocarbon Laboratories',
    keyFigure: 'Willard Libby (1949 Nobel Laureate)',
    gallery: [
      {
        source: PAINTINGS.stratigraphy,
        plateNumber: 'Plate I',
        caption: 'Charcoal & Charred Seed Extraction From Ash Layer',
        curatorNote: 'Short-lived seeds give tighter dates than old heartwood beams.',
      },
      {
        source: PAINTINGS.stepwell,
        plateNumber: 'Plate II',
        caption: 'Organic Mortar & Timber Contexts',
        curatorNote: 'Avoid "old wood effect" by sampling outer bark or charred grain.',
      },
    ],
    facts: [
      {
        title: '1 Grain of Rice Is Enough',
        intuitive: 'Modern AMS machines count individual carbon-14 atoms from a sample smaller than a single charred seed.',
        deepDive: 'Accelerator Mass Spectrometry requires < 1 mg of pure carbon.',
      },
      {
        title: 'Tree Rings Calibrate the Clock',
        intuitive: 'Because solar flares change C-14 levels in the sky, scientists calibrate radiocarbon dates against 14,000-year-old tree rings.',
        deepDive: 'IntCal20 dendrochronological curves convert 14C BP into true calendar BCE/CE ranges.',
      },
    ],
    highlights: [
      'C-14 half-life of 5,730 years dates organics up to ~50,000 years',
      'AMS counts atoms directly instead of waiting for beta decay',
      'IntCal20 tree-ring calibration corrects atmospheric fluctuations',
    ],
  },
  'arch-sciences-03': {
    era: 'c. 3rd Century BCE – 5th Century CE',
    location: 'Indian Subcontinent & Gandhara',
    keyFigure: 'James Prinsep (1837)',
    gallery: [
      {
        source: PAINTINGS.indusSeal,
        plateNumber: 'Plate I',
        caption: 'Lapidary Carving & Early Epigraphic Letterforms',
        curatorNote: 'Compare Indus geometric signs with Ashokan Brahmi’s crisp verticals.',
      },
      {
        source: PAINTINGS.karshapanaCoin,
        plateNumber: 'Plate II',
        caption: 'Bilingual Coins That Unlocked Kharosthi',
        curatorNote: 'Indo-Greek coins carried Greek on one side and Prakrit on the back.',
      },
    ],
    facts: [
      {
        title: 'Cracked in a Single Decade',
        intuitive: 'James Prinsep decoded forgotten Brahmi by spotting the two-letter word "danam" (gift) at the end of dozens of short donations.',
        deepDive: 'Frequency matching on Sanchi stupa rail inscriptions unlocked the vowel-diacritic abugida system.',
      },
      {
        title: 'Kharosthi Reads Right-to-Left',
        intuitive: 'While Brahmi ran left-to-right like modern Hindi and Tamil, northwest Kharosthi ran right-to-left like Aramaic.',
        deepDive: 'Bilingual Indo-Greek drachms provided the exact phonetic key.',
      },
    ],
    highlights: [
      'Brahmi became the mother script of modern South & Southeast Asian scripts',
      'Abugida system attaches vowel diacritics directly to consonant stems',
      'Tamil-Brahmi sherds at Keezhadi pushed literacy back to 6th c. BCE',
    ],
  },
  'arch-cases-01': {
    era: 'c. 6th Century BCE – 1st Century CE',
    location: 'Sivaganga District, Vaigai River Valley, Tamil Nadu',
    keyFigure: 'Amarnath Ramakrishna · Tamil Nadu Archaeology Dept.',
    gallery: [
      {
        source: PAINTINGS.amphora,
        plateNumber: 'Plate I',
        caption: 'Fine Burnished Pottery & Inscribed Rim Sherds',
        curatorNote: 'Post-firing Tamil-Brahmi names scratched by everyday potters & owners.',
      },
      {
        source: PAINTINGS.stratigraphy,
        plateNumber: 'Plate II',
        caption: 'Vaigai Floodplain Brick & Ring-Well Horizons',
        curatorNote: 'Terracotta ring-wells and agate bead workshops preserved in silt.',
      },
    ],
    facts: [
      {
        title: 'Everyday Names on Kitchen Pots',
        intuitive: 'Over 1,000 sherds carry personal names like "Kuviran-atan" scratched by ordinary people—proof of widespread literacy.',
        deepDive: 'AMS dates from Beta Analytic placed Tamil-Brahmi strata at c. 580 BCE.',
      },
      {
        title: 'No Temples Found—Only Homes & Workshops',
        intuitive: 'Keezhadi revealed brick dyeing vats, crystal ear-ornaments, and bone dice rather than royal monuments.',
        deepDive: 'Industrial textile-dyeing vats and glass-bead furnaces indicate an urban craft economy.',
      },
    ],
    highlights: [
      'AMS radiocarbon dates push Vaigai urbanism to 6th century BCE',
      '1,000+ graffiti & Tamil-Brahmi inscribed sherds',
      'Brick-lined drains, ring-wells, and semi-precious bead industry',
    ],
  },
  'arch-cases-02': {
    era: 'c. 800 BCE – Present (2,800+ Years Continuous)',
    location: 'Mehsana District, North Gujarat',
    keyFigure: 'ASI Excavation Branch V · IIT Kharagpur',
    gallery: [
      {
        source: PAINTINGS.stepwell,
        plateNumber: 'Plate I',
        caption: 'Multi-Period Stone Waterworks & Urban Architecture',
        curatorNote: 'Seven distinct cultural periods stacked 20 meters deep.',
      },
      {
        source: PAINTINGS.stratigraphy,
        plateNumber: 'Plate II',
        caption: '20-Meter Deep Mound Stratigraphic Section',
        curatorNote: 'From Northern Black Polished Ware up through Solanki & Mughal horizons.',
      },
    ],
    facts: [
      {
        title: '7 Cities Stacked Under One Town',
        intuitive: 'Digging down 20 meters at Vadnagar passes through 2,800 years of unbroken urban life.',
        deepDive: 'Seven cultural periods span Pre-Rampart, Mauryan, Kshatrapa, Maitraka, Solanki, Sultanate, and Gaekwad eras.',
      },
      {
        title: 'Shell Bangles & Monastery Remains',
        intuitive: 'Workshops carved marine conch shells into bangles, alongside a monumental Buddhist monastery.',
        deepDive: 'Xuanzang’s 7th-century travelogue ("Anandapura") matches the excavated vihara.',
      },
    ],
    highlights: [
      '20-meter unbroken urban stratigraphy spanning 2,800 years',
      'Shell-working craft quarters & brick fortification walls',
      'Multi-era water harvesting & stepwell reservoir systems',
    ],
  },
  'arch-cases-03': {
    era: 'c. 2nd Century BCE – 2nd Century CE',
    location: 'Ariyankuppam River Mouth, Puducherry',
    keyFigure: 'Mortimer Wheeler (1945) · Vimala Begley',
    gallery: [
      {
        source: PAINTINGS.amphora,
        plateNumber: 'Plate I',
        caption: 'Roman Dressel 2-4 Wine Amphora Sherd',
        curatorNote: 'Double-rod handles & pine-pitch resin lining identify Mediterranean wine.',
      },
      {
        source: PAINTINGS.maritime,
        plateNumber: 'Plate II',
        caption: 'Indo-Roman Maritime Wharf & Monsoon Anchorage',
        curatorNote: 'Known as "Poduke" in the 1st-century Periplus of the Erythraean Sea.',
      },
    ],
    facts: [
      {
        title: 'Roman Wine Sealed With Pine Tar',
        intuitive: 'Roman potters lined porous clay jars with pine-tree resin so wine wouldn’t leak out during the 4,000-mile voyage.',
        deepDive: 'GC-MS chemical residue analysis detects abietic acid from Mediterranean Pinaceae resin.',
      },
      {
        title: 'First Scientific Grid Dig in India',
        intuitive: 'In 1945, Mortimer Wheeler used Arikamedu to train a whole generation of Indian field archaeologists.',
        deepDive: 'Arretine sigillata stamps and dated Roman amphorae anchored South Indian pottery chronologies.',
      },
    ],
    highlights: [
      'Identified as "Poduke" in Greco-Roman maritime logs',
      'Mediterranean amphorae & Arretine ware dated via kiln stamps',
      'Glass-bead & textile dyeing workshops exported across the Indian Ocean',
    ],
  },
  'arch-fieldwork-01': {
    era: 'Indus – Medieval Periods',
    location: 'Field Survey Methodology',
    keyFigure: 'Architectural Typology Surveys',
    gallery: [
      {
        source: PAINTINGS.stepwell,
        plateNumber: 'Plate I',
        caption: 'Sandstone Ashlar, Corbelled Arches & Dressed Masonry',
        curatorNote: 'Compare dry-stone dressing with lime-surkhi mortar joints.',
      },
      {
        source: PAINTINGS.mohenjoDaro,
        plateNumber: 'Plate II',
        caption: 'Kiln-Fired Brick Ratios & English Bond Courses',
        curatorNote: 'Measure L:W:T ratios to estimate construction era in the field.',
      },
    ],
    facts: [
      {
        title: 'Bricks Shrink Over the Centuries',
        intuitive: 'Mauryan and Kushan bricks are giant slabs (up to 45 cm long), while Mughal Lakhori bricks are thin, flat wafers.',
        deepDive: 'Metric brick typology offers a fast non-destructive chronological clue on surface surveys.',
      },
      {
        title: 'True Arch vs. Corbelled Arch',
        intuitive: 'Older Indian temples stacked horizontal stones inward ("corbelling"), while later domes used wedge-shaped keystones.',
        deepDive: 'Load paths shift from vertical compression (corbel) to lateral thrust (voussoir true arch).',
      },
    ],
    highlights: [
      'Brick dimensions & mortar chemistry act as chronological markers',
      'Chisel marks distinguish hand-dressed ashlar from later cut stone',
      'Lime-surkhi (crushed brick) mortar hardened underwater',
    ],
  },
  'arch-fieldwork-02': {
    era: 'c. 300 CE – 18th Century CE',
    location: 'Gujarat, Rajasthan & Deccan Plateaus',
    keyFigure: 'Rani ki Vav & Adalaj Guilds',
    gallery: [
      {
        source: PAINTINGS.stepwell,
        plateNumber: 'Plate I',
        caption: 'Subterranean Stepped Tank & Scalloped Sandstone Galleries',
        curatorNote: 'Multi-story stone pavilions brace the earth against monsoon pressure.',
      },
      {
        source: PAINTINGS.mohenjoDaro,
        plateNumber: 'Plate II',
        caption: 'Early Bronze Age Bathing & Well Precursors',
        curatorNote: 'From Harappan Great Bath to medieval 7-story baoris.',
      },
    ],
    facts: [
      {
        title: 'Built Upside-Down Like an Underground Temple',
        intuitive: 'Builders dug a massive trench down to the water table and built ornate carved pavilions upward to hold back the soil.',
        deepDive: 'Stepped galleries act as lateral retaining buttresses against hydrostatic soil pressure.',
      },
      {
        title: '5°C Cooler at the Bottom',
        intuitive: 'Even in 45°C desert summers, the shaded lowest steps stayed cool enough for travelers to rest.',
        deepDive: 'Evaporative cooling and thermal mass of sandstone galleries created a natural microclimate.',
      },
    ],
    highlights: [
      'Dual-purpose monsoon recharge wells & cool subterranean sanctuaries',
      'Over 3,000 historic stepwells documented across western India',
      'Rani ki Vav (Patan) descends 7 stories with 500+ principal sculptures',
    ],
  },
  'arch-fieldwork-03': {
    era: 'c. 6th – 2nd Century BCE (Mahajanapadas & Mauryas)',
    location: 'Taxila, Magadha & Subcontinental Trade Routes',
    keyFigure: 'D.D. Kosambi · P.L. Gupta',
    gallery: [
      {
        source: PAINTINGS.karshapanaCoin,
        plateNumber: 'Plate I',
        caption: 'Clipped Silver Karshapana With 5 Imperial Punches',
        curatorNote: 'Corners were snipped with metal shears to match 32-ratti weight.',
      },
      {
        source: PAINTINGS.indusSeal,
        plateNumber: 'Plate II',
        caption: 'Symbolic Continuity From Seals to Coin Punches',
        curatorNote: 'Solar discs, arched hills, and bulls served as mint & guild marks.',
      },
    ],
    facts: [
      {
        title: 'Weighed Against Scarlet Jungle Seeds',
        intuitive: 'Every silver Karshapana was clipped until it balanced exactly 32 bright red "ratti" seeds (~3.4 grams).',
        deepDive: 'Abrus precatorius seeds have remarkably uniform dry weight (~0.105 g).',
      },
      {
        title: 'Bankers’ Marks on the Back',
        intuitive: 'Tiny extra punches on the reverse were "shroff marks" stamped by moneychangers who tested the silver purity.',
        deepDive: 'Numismatists use overlapping punch sequences to reconstruct royal mint chronologies.',
      },
    ],
    highlights: [
      'Earliest minted silver coinage of South Asia (6th c. BCE)',
      '5 obverse imperial punches + reverse moneychanger shroff marks',
      'Alloy recipe recorded in Kautilya’s Arthashastra',
    ],
  },
};

export function getSiteCodexEntry(nodeId: string): SiteCodexEntry {
  return SITE_CODEX_DATA[nodeId] || DEFAULT_ENTRY;
}
