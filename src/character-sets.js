const asciiElement = { codeElement: 'G0',
  escapeSequence: [0x1B, 0x28, 0x42],
  encoding: 'windows-1252',
  isASCII: true,
  bytesPerCodePoint: 1 };

export const characterSets = {

  /** ********************************
   * Single-byte without extensions *
   **********************************/

  // Default
  'ISO_IR 6': { encoding: 'utf-8' },

  // Latin alphabet No. 1
  'ISO_IR 100': { encoding: 'windows-1252' },

  // Latin alphabet No. 2
  'ISO_IR 101': { encoding: 'iso-8859-2' },

  // Latin alphabet No. 3
  'ISO_IR 109': { encoding: 'iso-8859-3' },

  // Latin alphabet No. 4
  'ISO_IR 110': { encoding: 'iso-8859-4' },

  // Cyrillic
  'ISO_IR 144': { encoding: 'iso-8859-5' },

  // Arabic
  'ISO_IR 127': { encoding: 'iso-8859-6' },

  // Greek
  'ISO_IR 126': { encoding: 'iso-8859-7' },

  // Hebrew
  'ISO_IR 138': { encoding: 'iso-8859-8' },

  // Latin alphabet No. 5
  'ISO_IR 148': { encoding: 'windows-1254' },

  // Japanese
  'ISO_IR 13': { encoding: 'shift-jis' },

  // Thai
  'ISO_IR 166': { encoding: 'tis-620' },

  /** *****************************
   * Single-byte with extensions *
   *******************************/

  // Default
  'ISO 2022 IR 6': {
    extension: true,
    elements: [asciiElement]
  },

  // Latin alphabet No. 1
  'ISO 2022 IR 100': {
    extension: true,
    elements: [asciiElement, { codeElement: 'G1',
      escapeSequence: [0x1B, 0x2D, 0x41],
      encoding: 'windows-1252',
      bytesPerCodePoint: 1 }]
  },

  // Latin alphabet No. 2
  'ISO 2022 IR 101': {
    extension: true,
    elements: [asciiElement, { codeElement: 'G1',
      escapeSequence: [0x1B, 0x2D, 0x42],
      encoding: 'iso-8859-2',
      bytesPerCodePoint: 1 }]
  },

  // Latin alphabet No. 3
  'ISO 2022 IR 109': {
    extension: true,
    elements: [asciiElement, { codeElement: 'G1',
      escapeSequence: [0x1B, 0x2D, 0x43],
      encoding: 'iso-8859-3',
      bytesPerCodePoint: 1 }]
  },

  // Latin alphabet No. 4
  'ISO 2022 IR 110': {
    extension: true,
    elements: [asciiElement, { codeElement: 'G1',
      escapeSequence: [0x1B, 0x2D, 0x44],
      encoding: 'iso-8859-4',
      bytesPerCodePoint: 1 }]
  },

  // Cyrillic
  'ISO 2022 IR 144': {
    extension: true,
    elements: [asciiElement, { codeElement: 'G1',
      escapeSequence: [0x1B, 0x2D, 0x4C],
      encoding: 'iso-8859-5',
      bytesPerCodePoint: 1 }]
  },

  // Arabic
  'ISO 2022 IR 127': {
    extension: true,
    elements: [asciiElement, { codeElement: 'G1',
      escapeSequence: [0x1B, 0x2D, 0x47],
      encoding: 'iso-8859-6',
      bytesPerCodePoint: 1 }]
  },

  // Greek
  'ISO 2022 IR 126': {
    extension: true,
    elements: [asciiElement, { codeElement: 'G1',
      escapeSequence: [0x1B, 0x2D, 0x46],
      encoding: 'iso-8859-7',
      bytesPerCodePoint: 1 }]
  },

  // Hebrew
  'ISO 2022 IR 138': {
    extension: true,
    elements: [asciiElement, { codeElement: 'G1',
      escapeSequence: [0x1B, 0x2D, 0x48],
      encoding: 'iso-8859-8',
      bytesPerCodePoint: 1 }]
  },

  // Latin alphabet No. 5
  'ISO 2022 IR 148': {
    extension: true,
    elements: [asciiElement, { codeElement: 'G1',
      escapeSequence: [0x1B, 0x2D, 0x4D],
      encoding: 'windows-1254',
      bytesPerCodePoint: 1 }]
  },

  // Japanese
  'ISO 2022 IR 13': {
    extension: true,
    elements: [{ codeElement: 'G0',
      escapeSequence: [0x1B, 0x28, 0x4A],
      encoding: 'shift-jis',
      bytesPerCodePoint: 1 },
    { codeElement: 'G1',
      escapeSequence: [0x1B, 0x29, 0x49],
      encoding: 'shift-jis',
      bytesPerCodePoint: 1 }]
  },

  // Thai
  'ISO 2022 IR 166': {
    extension: true,
    elements: [asciiElement, { codeElement: 'G1',
      escapeSequence: [0x1B, 0x2D, 0x54],
      encoding: 'tis-620',
      bytesPerCodePoint: 1 }]
  },

  /** ****************************
   * Multi-byte with extensions *
   ******************************/

  // Japanese
  'ISO 2022 IR 87': {
    extension: true,
    multiByte: true,
    elements: [{ codeElement: 'G0',
      escapeSequence: [0x1B, 0x24, 0x42],
      encoding: 'euc-jp',
      setHighBit: true,
      bytesPerCodePoint: 2 }]
  },

  'ISO 2022 IR 159': {
    extension: true,
    multiByte: true,
    elements: [{ codeElement: 'G0',
      escapeSequence: [0x1B, 0x24, 0x28, 0x44],
      encoding: 'euc-jp',
      isJISX0212: true,
      bytesPerCodePoint: 2 }]
  },

  // Korean
  'ISO 2022 IR 149': {
    extension: true,
    multiByte: true,
    elements: [{ codeElement: 'G1',
      escapeSequence: [0x1B, 0x24, 0x29, 0x43],
      encoding: 'euc-kr',
      bytesPerCodePoint: 2 }]
  },

  // Simplified Chinese
  'ISO 2022 IR 58': {
    extension: true,
    multiByte: true,
    elements: [{ codeElement: 'G1',
      escapeSequence: [0x1B, 0x24, 0x29, 0x41],
      encoding: 'gb18030',
      bytesPerCodePoint: 2 }]
  },

  /** *******************************
   * Multi-byte without extensions *
   *********************************/

  'ISO_IR 192': { encoding: 'utf-8',
    multiByte: true },

  GB18030: { encoding: 'gb18030',
    multiByte: true },

  GBK: { encoding: 'gbk',
    multiByte: true }
};
