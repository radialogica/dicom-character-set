import characterSets from './character-sets.js';
// to suit node envionment
if (typeof window === 'undefined') {
  TextDecoder = require('util').TextDecoder
}

const ESCAPE_BYTE = 0x1B;

const CARRIAGE_RETURN = 0xA;
const LINE_FEED = 0xC;
const FORM_FEED = 0xD;
const TAB = 0x9;
// Aka yen symbol in Romaji
const BACKSLASH = 0x5C;
const EQUAL_SIGN = 0x3D;
const CARET = 0x5E;


function adjustShiftJISResult (str) {
  // browsers do strict ASCII for these characters, so to be compliant with Shift JIS we replace them
  return str.replace(/~/g, '‾').replace(/\\/g, '¥');
}

function appendRunWithoutPromise (output, byteRunCharacterSet, bytes, byteRunStart, byteRunEnd) {
  const oneRunBytes = preprocessBytes(byteRunCharacterSet, bytes, byteRunStart, byteRunEnd);

  return output + convertWithoutExtensions(byteRunCharacterSet.encoding, oneRunBytes);
}

function appendRunWithPromise (output, byteRunCharacterSet, bytes, byteRunStart, byteRunEnd) {
  const oneRunBytes = preprocessBytes(byteRunCharacterSet, bytes, byteRunStart, byteRunEnd);

  return (output === '' ? Promise.resolve('') : output).then((lhs) => convertWithoutExtensionsPromise(byteRunCharacterSet.encoding, oneRunBytes).then((rhs) => lhs + rhs));
}

function checkParameters (specificCharacterSet, bytes) {
  if (bytes && !(bytes instanceof Uint8Array)) {
    throw new Error('bytes must be a Uint8Array');
  }
  if (specificCharacterSet && (typeof specificCharacterSet !== 'string')) {
    throw new Error('specificCharacterSet must be a string');
  }
}

function convertBytesCore (withoutExtensionsFunc, appendFunc, specificCharacterSet, bytes, options) {
  checkParameters(specificCharacterSet, bytes);

  const characterSetStrings = getCharacterSetStrings(specificCharacterSet);

  if (characterSetStrings.length === 1 && !characterSetStrings[0].startsWith('ISO 2022')) {
    return withoutExtensionsFunc(characterSets[characterSetStrings[0]].encoding, bytes);
  }

  const checkedOptions = options || {};

  return convertWithExtensions(characterSetStrings.map((characterSet) => characterSets[characterSet]),
    bytes, getDelimitersForVR(checkedOptions.vr), appendFunc);
}

function convertWithExtensions (allowedCharacterSets, bytes, delimiters, appendRun) {
  let output = '';

  if (!bytes || bytes.length === 0) {
    return output;
  }

  const initialCharacterSets = {
    G0: allowedCharacterSets[0].elements.find((element) => element.codeElement === 'G0'),
    G1: allowedCharacterSets[0].elements.find((element) => element.codeElement === 'G1')
  };

  const activeCharacterSets = Object.assign({}, initialCharacterSets);
  let byteRunStart = 0;
  let byteRunCharacterSet;
  let nextSetIndex = 0;

  // Group bytes into runs based on their encoding so we don't have to use a different
  // decoder for each character. Note that G0 and G1 planes can be different encodings,
  // so we can't just group by character set.

  while (nextSetIndex < bytes.length) {
    if (!byteRunCharacterSet) {
      byteRunCharacterSet = getCharacterSet(bytes[byteRunStart], activeCharacterSets);
    }

    const next = findNextCharacterSet(bytes, byteRunStart, byteRunCharacterSet,
      activeCharacterSets, initialCharacterSets, delimiters);

    nextSetIndex = next.index;

    if (nextSetIndex > byteRunStart) {
      output = appendRun(output, byteRunCharacterSet, bytes, byteRunStart, nextSetIndex);
    }

    byteRunStart = nextSetIndex;
    byteRunCharacterSet = next.characterSet;

    if (next.escapeSequence) {
      const nextCharacterSet = readEscapeSequence(bytes, nextSetIndex, allowedCharacterSets);

      activeCharacterSets[nextCharacterSet.codeElement] = nextCharacterSet;
      byteRunStart += nextCharacterSet.escapeSequence.length;
    }
  }

  return output;
}

function convertWithoutExtensions (encoding, bytes) {
  const retVal = new TextDecoder(encoding).decode(bytes);


  return (encoding === 'shift-jis') ? adjustShiftJISResult(retVal) : retVal;
}

function convertWithoutExtensionsPromise (encoding, bytes) {
  return new Promise((resolve) => {
    const fileReader = new FileReader();

    if (encoding === 'shift-jis') {
      fileReader.onload = () => resolve(adjustShiftJISResult(fileReader.result));
    } else {
      fileReader.onload = () => resolve(fileReader.result);
    }

    const blob = new Blob([bytes]);

    fileReader.readAsText(blob, encoding);
  });
}

// Multibyte non-extension character sets must stand on their own or else be ignored. This method enforces that.
function filterMultiByteCharacterSetStrings (characterSetStrings) {
  const initialCharacterSet = characterSets[characterSetStrings[0]];

  if (initialCharacterSet.multiByte && !initialCharacterSet.extension) {
    return [characterSetStrings[0]];
  }

  return characterSetStrings.filter((str) => !characterSets[str].multiByte || characterSets[str].extension);
}

function findNextCharacterSet (bytes, start, currentCodeElement, activeCodeElements, initialCharacterSets, delimiters) {
  for (let i = start; i < bytes.length; i += currentCodeElement.bytesPerCodePoint) {
    if (bytes[i] === ESCAPE_BYTE) {
      return { escapeSequence: true,
        index: i };
    }
    if (currentCodeElement.bytesPerCodePoint === 1 && delimiters.includes(bytes[i])) {
      Object.assign(activeCodeElements, initialCharacterSets);
    }
    const nextCodeElement = getCharacterSet(bytes[i], activeCodeElements);

    if (currentCodeElement && nextCodeElement !== currentCodeElement) {
      return { characterSet: nextCodeElement,
        index: i };
    }
  }

  return { index: bytes.length };
}

function forceExtensionsIfApplicable (characterSetStrings) {
  const forceExtensions = (characterSetStrings.length > 1);

  const returnValue = [];

  for (const characterSetString of characterSetStrings) {
    if (!returnValue.includes(characterSetString)) {
      returnValue.push(forceExtensions ? characterSetString.replace('ISO_IR', 'ISO 2022 IR') : characterSetString);
    }
  }

  return returnValue;
}

function getCharacterSet (byte, activeCharacterSets) {
  if (byte > 0x7F && activeCharacterSets.G1) {
    return activeCharacterSets.G1;
  }
  if (activeCharacterSets.G0) {
    return activeCharacterSets.G0;
  }
  // for robustness if byte <= 0x7F, try to output using G1 if no G0 is selected
  if (activeCharacterSets.G1 && activeCharacterSets.G1.bytesPerCodePoint === 1) {
    return activeCharacterSets.G1;
  }
  // If G1 is multibyte, default to ASCII

  return characterSets['ISO 2022 IR 6'].elements[0];
}

function getCharacterSetStrings (specificCharacterSet) {
  let characterSetStrings = specificCharacterSet ? specificCharacterSet.split('\\').map((characterSet) => characterSet.trim().toUpperCase()) : [''];

  if (characterSetStrings[0] === '') {
    characterSetStrings[0] = (characterSetStrings.length > 1) ? 'ISO 2022 IR 6' : 'ISO_IR 6';
  }

  if (characterSetStrings.some((characterSet) => characterSets[characterSet] === undefined)) {
    throw new Error('Invalid specific character set specified.');
  }

  characterSetStrings = filterMultiByteCharacterSetStrings(characterSetStrings);

  return forceExtensionsIfApplicable(characterSetStrings);
}

function getDelimitersForVR (incomingVR) {
  const vr = (incomingVR || '').trim().toUpperCase();

  const delimiters = [CARRIAGE_RETURN, LINE_FEED, FORM_FEED, TAB];

  if (!['UT', 'ST', 'LT'].includes(vr)) {
    // for delimiting multi-valued items
    delimiters.push(BACKSLASH);
  }
  if (vr === 'PN') {
    delimiters.push(EQUAL_SIGN);
    delimiters.push(CARET);
  }

  return delimiters;
}

function preprocessBytes (characterSet, bytes, byteStart, byteEnd) {
  let oneEncodingBytes;

  if (characterSet.isJISX0212) {
    oneEncodingBytes = processJISX0212(bytes, byteStart, byteEnd);
  } else {
    oneEncodingBytes = bytes.slice(byteStart, byteEnd);
    if (characterSet.setHighBit) {
      setHighBit(oneEncodingBytes);
    }
  }

  return oneEncodingBytes;
}

function processJISX0212 (bytes, bytesStart, bytesEnd) {
  const length = bytesEnd - bytesStart;

  if (length % 2 !== 0) {
    throw new Error('JIS X string with a character not having exactly two bytes!');
  }

  const processedBytes = new Uint8Array(length + (length / 2));
  let outIndex = 0;

  for (let i = bytesStart; i < bytesEnd; i += 2) {
    processedBytes[outIndex++] = 0x8F;
    processedBytes[outIndex++] = bytes[i] | 0x80;
    processedBytes[outIndex++] = bytes[i + 1] | 0x80;
  }

  return processedBytes;
}

function escapeSequenceMatches (escapeSequence, bytes, startIndex) {
  for (let escapeByteIndex = 0; escapeByteIndex < escapeSequence.length; escapeByteIndex++) {
    if (startIndex + escapeByteIndex >= bytes.length) {
      return false;
    } else if (bytes[startIndex + escapeByteIndex] !== escapeSequence[escapeByteIndex]) {
      return false;
    }
  }

  return true;
}

function readEscapeSequence (bytes, start, extensionSets) {
  for (const extensionSet of extensionSets) {
    for (const element of extensionSet.elements) {
      if (escapeSequenceMatches(element.escapeSequence, bytes, start)) {
        return element;
      }
    }
  }

  throw new Error(`Unknown escape sequence encountered at byte ${start}`);
}

function setHighBit (bytes) {
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] |= 0x80;
  }
}

export function convertBytes (specificCharacterSet, bytes, options) {
  return convertBytesCore(convertWithoutExtensions, appendRunWithoutPromise, specificCharacterSet, bytes, options);
}

export function convertBytesPromise (specificCharacterSet, bytes, options) {
  return convertBytesCore(convertWithoutExtensionsPromise, appendRunWithPromise, specificCharacterSet, bytes, options);
}
