// ============================================================
// DigDeep — Illuminated Manuscript Painting Registry
// Maps Archaeology Nodes & Artifact Cases to hand-painted
// 19th-century field-notebook watercolor plates.
// ============================================================

import type { ImageSourcePropType } from 'react-native';

export interface PaintingPlate {
  source: ImageSourcePropType;
  plateNumber: string;
  caption: string;
  curatorNote: string;
}

export const PAINTINGS = {
  amphora: require('../../assets/paintings/amphora.jpg'),
  indusSeal: require('../../assets/paintings/indus_seal.jpg'),
  karshapanaCoin: require('../../assets/paintings/karshapana_coin.jpg'),
  stratigraphy: require('../../assets/paintings/stratigraphy_plate.jpg'),
  stepwell: require('../../assets/paintings/stepwell_plate.jpg'),
  maritime: require('../../assets/paintings/maritime_plate.jpg'),
  gizaPyramids: require('../../assets/paintings/giza_pyramids.jpg'),
  tutankhamunTomb: require('../../assets/paintings/tutankhamun_tomb.jpg'),
  machuPicchu: require('../../assets/paintings/machu_picchu.jpg'),
  mohenjoDaro: require('../../assets/paintings/mohenjo_daro.jpg'),
  petraTreasury: require('../../assets/paintings/petra_treasury.jpg'),
} as const;

export const CASE_PAINTINGS: Record<string, PaintingPlate> = {
  'case-amphora-01': {
    source: PAINTINGS.amphora,
    plateNumber: 'Plate I',
    caption: 'Fig. 1 — Roman Dressel 2-4 Amphora Sherd & Double-Rod Handle',
    curatorNote: 'Note the dark pine-pitch resin lining inside the neck.',
  },
  'case-seal-01': {
    source: PAINTINGS.indusSeal,
    plateNumber: 'Plate II',
    caption: 'Fig. 2 — Harappan Steatite Unicorn Seal & Ritual Brazier',
    curatorNote: 'Five incised script signs above the horned bovine motif.',
  },
  'case-coin-01': {
    source: PAINTINGS.karshapanaCoin,
    plateNumber: 'Plate III',
    caption: 'Fig. 3 — Mauryan Punch-Marked Silver Karshapana',
    curatorNote: 'Clipped corner to calibrate to 32-ratti standard weight.',
  },
};

export const NODE_PAINTINGS: Record<string, PaintingPlate> = {
  'arch-mysteries-01': {
    source: PAINTINGS.indusSeal,
    plateNumber: 'Folio I',
    caption: 'Indus Steatite Seal — Un-deciphered Sign Sequence',
    curatorNote: 'Observe the left-to-right or boustrophedon carving.',
  },
  'arch-mysteries-02': {
    source: PAINTINGS.maritime,
    plateNumber: 'Folio II',
    caption: 'Submerged Sangam Port & Ancient Brick Wharf',
    curatorNote: 'Submerged piers charted 5 km off the Coromandel coast.',
  },
  'arch-mysteries-03': {
    source: PAINTINGS.stratigraphy,
    plateNumber: 'Folio III',
    caption: 'Rakhigarhi Excavation Trench & Stratigraphic Horizon',
    curatorNote: 'Skeletal & ceramic context sealed beneath alluvial silt.',
  },
  'arch-sciences-01': {
    source: PAINTINGS.stratigraphy,
    plateNumber: 'Folio IV',
    caption: 'Law of Superposition — Trench Cross-Section',
    curatorNote: 'Deeper strata preserve older cultural horizons.',
  },
  'arch-sciences-02': {
    source: PAINTINGS.stratigraphy,
    plateNumber: 'Folio V',
    caption: 'Charcoal & Organic Horizon Sampling for C-14',
    curatorNote: 'Avoid modern rootlet contamination during extraction.',
  },
  'arch-sciences-03': {
    source: PAINTINGS.indusSeal,
    plateNumber: 'Folio VI',
    caption: 'Early Epigraphic & Seal Script Evolution',
    curatorNote: 'Compare lapidary strokes on steatite and stone.',
  },
  'arch-cases-01': {
    source: PAINTINGS.amphora,
    plateNumber: 'Folio VII',
    caption: 'Keezhadi Fine Ware & Inscribed Pottery Sherds',
    curatorNote: 'Graffiti marks scratched post-firing on rim.',
  },
  'arch-cases-02': {
    source: PAINTINGS.stepwell,
    plateNumber: 'Folio VIII',
    caption: 'Vadnagar Stacked Urban Masonry & Waterworks',
    curatorNote: 'Seven superimposed habitation periods spanning 2,500 yrs.',
  },
  'arch-cases-03': {
    source: PAINTINGS.amphora,
    plateNumber: 'Folio IX',
    caption: 'Arikamedu Indo-Roman Maritime Amphora Fragment',
    curatorNote: 'Mediterranean wine jars carried across the Monsoon.',
  },
  'arch-fieldwork-01': {
    source: PAINTINGS.stepwell,
    plateNumber: 'Folio X',
    caption: 'Historical Brick & Sandstone Masonry Typology',
    curatorNote: 'Measure brick ratios (L:W:T) to date the wall.',
  },
  'arch-fieldwork-02': {
    source: PAINTINGS.stepwell,
    plateNumber: 'Folio XI',
    caption: 'Stepped Tank & Subterranean Hydraulic Architecture',
    curatorNote: 'Stepped galleries cool water & stabilize earth pressure.',
  },
  'arch-fieldwork-03': {
    source: PAINTINGS.karshapanaCoin,
    plateNumber: 'Folio XII',
    caption: 'Silver Karshapana — Five-Symbol Imperial Punching',
    curatorNote: 'Individual punches struck separately on heated silver.',
  },
  'arch-cases-04': {
    source: PAINTINGS.gizaPyramids,
    plateNumber: 'Folio XIII',
    caption: 'Giza Plateau — Khufu Pyramid & Great Sphinx Survey',
    curatorNote: 'Base leveled to 2 cm via flooded Nile perimeter trenches.',
  },
  'arch-mysteries-04': {
    source: PAINTINGS.tutankhamunTomb,
    plateNumber: 'Folio XIV',
    caption: 'Valley of the Kings (KV62) — Funerary Mask & Canopic Jars',
    curatorNote: 'Synthetic Egyptian blue pigment & sealed 18th-Dynasty context.',
  },
  'arch-cases-05': {
    source: PAINTINGS.machuPicchu,
    plateNumber: 'Folio XV',
    caption: 'Machu Picchu — Dry-Stone Ashlar Terraces & Cloud Citadel',
    curatorNote: 'Mortar-free interlocking granite blocks engineered for quakes.',
  },
  'arch-fieldwork-04': {
    source: PAINTINGS.mohenjoDaro,
    plateNumber: 'Folio XVI',
    caption: 'Mohenjo-daro — The Great Bath & Corbelled Brick Drain',
    curatorNote: '2.5 cm natural bitumen waterproofing behind sawn baked brick.',
  },
  'arch-cases-06': {
    source: PAINTINGS.petraTreasury,
    plateNumber: 'Folio XVII',
    caption: 'Petra — Al-Khazneh Sandstone Facade & Siq Water Conduits',
    curatorNote: 'Carved top-down with 45° Nabataean tooth-chisel dressing.',
  },
  'arch-mysteries-05': {
    source: PAINTINGS.stratigraphy,
    plateNumber: 'Folio XVIII',
    caption: 'Göbekli Tepe — Pre-Pottery Neolithic Stone Enclosure Trench',
    curatorNote: 'Intentionally backfilled 11,500 years ago, sealing T-pillars.',
  },
};
