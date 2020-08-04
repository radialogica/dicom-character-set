import { expect } from 'chai';
import { convertBytes, convertBytesPromise } from '../src/convert-bytes.js';
import { characterSets } from '../src/character-sets.js';

/* Use these instead of the above imports for testing in node.js:
var expect = require('chai').expect;
var convertBytes =  require('../dist/dicom-character-set.js').convertBytes;
var convertBytesPromise =  require('../dist/dicom-character-set.js').convertBytesPromise;
var characterSets = require('../dist/dicom-character-set.js').characterSets;
*/

const examples = {
    // Single byte (with/without extensions)
    'IR 6': {bytes: [0x7E, 0x20, 0x9, 0x21, 0x5C], value: '~ \t!\\'},
    'IR 100': {bytes: [0x83, 0xD8, 0xF7, 0xFF], value: 'ƒØ÷ÿ'},
    'IR 101': {bytes: [0xD8, 0xB8, 0xFF], value: 'Ř¸˙'},
    'IR 109': {bytes: [0xA7, 0xA1, 0xF5], value: '§Ħġ'},
    'IR 110': {bytes: [0xF1, 0xC6, 0xE6], value: 'ņÆæ'},
    'IR 144': {bytes: [0xB6, 0xFD, 0xFF], value: 'Ж§џ'},
    'IR 127': {bytes: [0xD4, 0xC1, 0xF2], value: 'شءْ'},
    'IR 126': {bytes: [0xA5, 0xD8, 0xFE], value: '₯Ψώ'},
    'IR 138': {bytes: [0xE4, 0xAE, 0xFA], value: 'ה®ת'},
    'IR 148': {bytes: [0xD0, 0xDE, 0xFE], value: 'ĞŞş'},
    'IR 13': {bytes: [0xA6, 0xDD, 0xDF, 0x5C, 0x7E], value: 'ｦﾝﾟ¥‾'}, // For Romaji: [0x5C, 0x7E] is '¥‾'
    'IR 166': {bytes: [0xA1, 0xDF, 0xFB], value: 'ก฿๛'},
    // Multi-byte without extensions
    'IR 192': {bytes: [0xF0, 0x9F, 0x87, 0xBA, 0xF0, 0x9F, 0x87, 0xB8, 0xF0, 0x9F, 0x9A, 0x80], value: '🇺🇸🚀'},
    'GB18030': {bytes: [0x81, 0x30, 0x8A, 0x30, 0xA8, 0xA2, 0xFE, 0x5F], value: 'ãá㥮'},
    'GBK': {bytes: [0xC3, 0xED, 0xBD, 0x6E], value: '庙絥'},
    // Multi-byte with extensions
    'IR 58': {bytes: [0xB5, 0xDA, 0xD2, 0xBB, 0xD0, 0xD0, 0xCE, 0xC4, 0xD7, 0xD6, 0xA1, 0xA3], value: '第一行文字。'},
    'IR 87': {bytes: [0x21, 0x38, 0x22, 0x76, 0x30, 0x21, 0x3B, 0x33, 0x45, 0x44], value: '仝♪亜山田'},
    'IR 149': {bytes: [0xD1, 0xCE, 0xD4, 0xD7], value: '吉洞'},
    'IR 159': {bytes: [0x32, 0x30, 0x6D, 0x60], value: '傺龡'},
};

function getDelimiterExpectedBytes(escapeSequence, value, delimiters) {
  let bytes = [];
  const delimiterArray = delimiters.split('');
  for (let delimiterIndex = 0; delimiterIndex < delimiterArray.length; delimiterIndex++) {
    const delimiter = delimiterArray[delimiterIndex];
    bytes = bytes.concat(escapeSequence.slice(0));
    bytes.push(value);
    bytes.push(delimiter.codePointAt(0));
    bytes.push(value);
  }
  return bytes;
}

function testSingleCharacterSet(characterSet) {
    // Arrange
    const example = examples[characterSet.replace('ISO_', '')];

    // Act
    const returnValue = convertBytes(characterSet, new Uint8Array(example.bytes));

    // Assert
    expect(returnValue).to.equal(example.value);
}

function testCharacterSetExtensions(characterSetStrings, byteOffset) {
    // Arrange
    let bytes = [];
    let expectedValue = '';
    for (let i = 0; i < characterSetStrings.length; i++) {
        const characterSet = characterSetStrings[i].replace('ISO_', 'ISO 2022 ');
        const exampleName = characterSet.replace('ISO 2022 ', '');
        const elements = characterSets[characterSet].elements;
        let escape = [];
        if (i > 0) {
          for (let sequenceIndex = 0; sequenceIndex < elements.length; sequenceIndex++) {
            if (!elements[sequenceIndex].isASCII)
              escape = escape.concat(elements[sequenceIndex].escapeSequence);
          }
        }
        bytes = bytes.concat(escape).concat(examples[exampleName].bytes);
        expectedValue += examples[exampleName].value;
    }

    if (byteOffset) {
      bytes = new Array(byteOffset).concat(bytes);
    }

    // Act
    const returnValue = convertBytes(characterSetStrings.join('\\'), new Uint8Array(new Uint8Array(bytes).buffer, byteOffset), {vr: 'LT'});

    // Assert
    expect(returnValue).to.equal(expectedValue);
}

describe('convertBytes', () => {

  describe('single byte without extensions', () => {

      it('should properly convert ISO_IR 6', () => {
        testSingleCharacterSet('ISO_IR 6');
      });

      it('should properly convert ISO_IR 100', () => {
        testSingleCharacterSet('ISO_IR 100');
      });

      it('should properly convert ISO_IR 101', () => {
        testSingleCharacterSet('ISO_IR 101');
      });

      it('should properly convert ISO_IR 109', () => {
        testSingleCharacterSet('ISO_IR 109');
      });

      it('should properly convert ISO_IR 110', () => {
        testSingleCharacterSet('ISO_IR 110');
      });

      it('should properly convert ISO_IR 144', () => {
        testSingleCharacterSet('ISO_IR 144');
      });

      it('should properly convert ISO_IR 127', () => {
        testSingleCharacterSet('ISO_IR 127');
      });

      it('should properly convert ISO_IR 126', () => {
        testSingleCharacterSet('ISO_IR 126');
      });

      it('should properly convert ISO_IR 138', () => {
        testSingleCharacterSet('ISO_IR 138');
      });

      it('should properly convert ISO_IR 148', () => {
        testSingleCharacterSet('ISO_IR 148');
      });

      it('should properly convert ISO_IR 13', () => {
        testSingleCharacterSet('ISO_IR 13');
      });

      it('should properly convert ISO_IR 166', () => {
        testSingleCharacterSet('ISO_IR 166');
      });

      it('should properly convert ISO_IR 192', () => {
        testSingleCharacterSet('ISO_IR 192');
      });

      it('should properly convert ISO_IR 192 with byteOffset', () => {
        // Arrange
        const example = examples['IR 192'];
        const buffer = new Uint8Array([1, 2, 3].concat(example.bytes)).buffer;

        // Act
        const returnValue = convertBytes('ISO_IR 192', new Uint8Array(buffer, 3));

        // Assert
        expect(returnValue).to.equal(example.value);
      });

      it('should properly convert GB18030', () => {
        testSingleCharacterSet('GB18030');
      });

      it('should properly convert GBK', () => {
        testSingleCharacterSet('GBK');
      });

      it('should properly convert GBK with promises', () => {
        // Arrange
        const example = examples['GBK'];

        // Act
        return convertBytesPromise('GBK', new Uint8Array(example.bytes)).then(returnValue => {
          expect(returnValue).to.equal(example.value);
        });
      });
  });

  describe('single byte with extensions', () => {
    it('should properly convert ISO 2022 IR 100', () => {
        testCharacterSetExtensions(['ISO 2022 IR 6', 'ISO 2022 IR 100']);
      });

    it('should properly convert from ISO 2022 IR 100', () => {
        testCharacterSetExtensions(['ISO 2022 IR 100', 'ISO 2022 IR 6']);
      });

    it('should properly convert to ISO 2022 IR 101', () => {
        testCharacterSetExtensions(['ISO 2022 IR 6', 'ISO 2022 IR 101']);
      });

    it('should properly convert to ISO 2022 IR 109', () => {
        testCharacterSetExtensions(['ISO 2022 IR 6', 'ISO 2022 IR 109']);
      });

    it('should properly convert to ISO 2022 IR 110', () => {
        testCharacterSetExtensions(['ISO 2022 IR 6', 'ISO 2022 IR 110']);
      });

    it('should properly convert to ISO 2022 IR 144', () => {
        testCharacterSetExtensions(['ISO 2022 IR 6', 'ISO 2022 IR 144']);
      });

    it('should properly convert to ISO 2022 IR 127', () => {
        testCharacterSetExtensions(['ISO 2022 IR 6', 'ISO 2022 IR 127']);
      });

    it('should properly convert to ISO 2022 IR 126', () => {
        testCharacterSetExtensions(['ISO 2022 IR 6', 'ISO 2022 IR 126']);
      });

    it('should properly convert to ISO 2022 IR 138', () => {
        testCharacterSetExtensions(['ISO 2022 IR 6', 'ISO 2022 IR 138']);
      });

    it('should properly convert to ISO 2022 IR 148', () => {
        testCharacterSetExtensions(['ISO 2022 IR 6', 'ISO 2022 IR 148']);
      });

    it('should properly convert ISO 2022 IR 13', () => { // this test ensures both code elements get selected
      // Arrange
      const bytes = examples['IR 6'].bytes.concat(characterSets['ISO 2022 IR 13'].elements[0].escapeSequence).concat(characterSets['ISO 2022 IR 13'].elements[1].escapeSequence).concat(examples['IR 13'].bytes);
      const expectedValue = examples['IR 6'].value + examples['IR 13'].value;
      
      // Act
      const returnValue = convertBytes("ISO 2022 IR 6\\ISO 2022 IR 13", new Uint8Array(bytes), {vr: 'LT'});

      // Assert
      expect(returnValue).to.equal(expectedValue);
    });

    it('should properly convert to ISO 2022 IR 166', () => {
        testCharacterSetExtensions(['ISO 2022 IR 6', 'ISO 2022 IR 166']);
      });

    it('should properly convert to ISO 2022 IR 87', () => {
        testCharacterSetExtensions(['ISO 2022 IR 6', 'ISO 2022 IR 87']);
      });

    it('should properly convert to ISO 2022 IR 159', () => {
        testCharacterSetExtensions(['ISO 2022 IR 6', 'ISO 2022 IR 159']);
      });

    it('should properly convert to ISO 2022 IR 149', () => {
        testCharacterSetExtensions(['ISO 2022 IR 6', 'ISO 2022 IR 149']);
      });

    it('should properly convert to ISO 2022 IR 58', () => {
        testCharacterSetExtensions(['ISO 2022 IR 6', 'ISO 2022 IR 58']);
      });

    it('should properly convert ISO 2022 IR 58 with a byteOffset', () => {
        testCharacterSetExtensions(['ISO 2022 IR 6', 'ISO 2022 IR 58'], 3);
    });

    it('should properly convert ISO 2022 IR 87 with ISO 2022 IR 149 (separate active code elements)', () => {
      // Since these exist in different code elements, they can be activated simultaneously and not need an escape sequence to switch back
      // Arrange
      const bytes = characterSets['ISO 2022 IR 149'].elements[0].escapeSequence.concat(examples['IR 149'].bytes).concat(examples['IR 87'].bytes);
      const expectedValue = examples['IR 149'].value + examples['IR 87'].value;
      
      // Act
      const returnValue = convertBytes("ISO 2022 IR 87\\ISO 2022 IR 149", new Uint8Array(bytes));

      // Assert
      expect(returnValue).to.equal(expectedValue);
    });

    it('should properly convert to ISO 2022 IR 13 with promises', () => {
        // Arrange
        const prependBytes = [1, 2, 3];
        const offset = prependBytes.length;
        const bytes = prependBytes.concat(examples['IR 6'].bytes).concat(characterSets['ISO 2022 IR 13'].elements[0].escapeSequence).concat(examples['IR 13'].bytes);
        const expectedValue = examples['IR 6'].value + examples['IR 13'].value;

        // Act
        return convertBytesPromise('ISO 2022 IR 6\\ISO 2022 IR 13', new Uint8Array(new Uint8Array(bytes).buffer, offset), {vr: 'LT'}).then(returnValue => {
          expect(returnValue).to.equal(expectedValue);
        });
      });
  });

  describe('robustness', () => {
    it('works when ending with an escape sequence', () => {
      // Arrange
      const bytes = examples['IR 6'].bytes.concat(characterSets['ISO 2022 IR 100'].elements[1].escapeSequence);
      const expectedValue = examples['IR 6'].value;
      
      // Act
      const returnValue = convertBytes('ISO 2022 IR 6\\ISO 2022 IR 100', new Uint8Array(bytes));

      // Assert
      expect(returnValue).to.equal(expectedValue);
    });

    it('should print ASCII characters with only ISO 2022 IR 149 selected', () => {
      // Arrange
      const bytes = examples['IR 6'].bytes;
      const expectedValue = examples['IR 6'].value;
      
      // Act
      const returnValue = convertBytes('ISO 2022 IR 149', new Uint8Array(bytes));

      // Assert
      expect(returnValue).to.equal(expectedValue);
    });

     it('should print characters with only ISO 2022 IR 13 selected', () => {
      // Arrange
      const bytes = characterSets['ISO 2022 IR 13'].elements[1].escapeSequence.concat(examples['IR 13'].bytes);
      const expectedValue = examples['IR 13'].value;
      
      // Act
      const returnValue = convertBytes('ISO 2022 IR 149\\ISO 2022 IR 13', new Uint8Array(bytes), {vr: 'LT'});

      // Assert
      expect(returnValue).to.equal(expectedValue);
    });

    it('should print ASCII characters with only ISO 2022 IR 58 selected', () => {
      // Arrange
      const bytes = examples['IR 6'].bytes;
      const expectedValue = examples['IR 6'].value;
      
      // Act
      const returnValue = convertBytes('ISO 2022 IR 58', new Uint8Array(bytes));

      // Assert
      expect(returnValue).to.equal(expectedValue);
    });

    it('should ignore any character sets after a multi-byte non-extension character set', () => {
      // Arrange
      const bytes = examples['IR 192'].bytes.concat([0xC2, 0xA9]);
      const expectedValue = examples['IR 192'].value + '©';
      
      // Act
      const returnValue = convertBytes('ISO_IR 192\\ISO 2022 IR 58', new Uint8Array(bytes));

      // Assert
      expect(returnValue).to.equal(expectedValue);
    });

    it('should ignore any multi-byte non-extension character sets that are not first', () => {
      // Arrange
      const bytes = examples['IR 58'].bytes;
      const expectedValue = examples['IR 58'].value;
      
      // Act
      const returnValue = convertBytes('ISO 2022 IR 58\\ISO_IR 192', new Uint8Array(bytes));

      // Assert
      expect(returnValue).to.equal(expectedValue);
    });

    it('should convert control characters', () => {
      // Arrange
      const bytes = [0x0, 0x1, 0x2, 0x3, 0x4, 0x5, 0x6, 0x7, 0x8, 0xB, 0xE, 0xF];
      const expectedValue = '\u0000\u0001\u0002\u0003\u0004\u0005\u0006\u0007\u0008\u000B\u000E\u000F';
      
      // Act
      const returnValue = convertBytes('ISO 2022 IR 6', new Uint8Array(bytes));

      // Assert
      expect(returnValue).to.equal(expectedValue);
    });

    it('should only use the first occurrence of a character set', () => {
        testCharacterSetExtensions(['ISO 2022 IR 6', 'ISO 2022 IR 127', 'ISO 2022 IR 6']);
    });

    it('should switch to code extensions when multiple non-extension character sets are found', () => {
        testCharacterSetExtensions(['ISO_IR 6', 'ISO_IR 13']);
    });

    it('should allow ISO 2022 IR 87 to be the first character set', () => {
        testCharacterSetExtensions(['ISO 2022 IR 87']);
      });

    it('should allow ISO 2022 IR 159 to be the first character set', () => {
        testCharacterSetExtensions(['ISO 2022 IR 159']);
      });

    it('should allow ISO 2022 IR 149 to be the first character set', () => {
        testCharacterSetExtensions(['ISO 2022 IR 149']);
      });

    it('should allow ISO 2022 IR 58 to be the first character set (defaults to ASCII in G0)', () => {
        testCharacterSetExtensions(['ISO 2022 IR 58', 'ISO 2022 IR 166']);
        // Arrange
      const bytes = examples['IR 6'].bytes.concat(examples['IR 58'].bytes).concat(characterSets['ISO 2022 IR 166'].elements[1].escapeSequence).concat(examples['IR 166'].bytes);
      const expectedValue = examples['IR 6'].value + examples['IR 58'].value + examples['IR 166'].value;
      
      // Act
      const returnValue = convertBytes("ISO 2022 IR 58\\ISO 2022 IR 166", new Uint8Array(bytes));

      // Assert
      expect(returnValue).to.equal(expectedValue);
    });

    it('LT VR resets to the first character set after control characters', () => {
        // Arrange
        const bytes = getDelimiterExpectedBytes([0x1B, 0x28, 0x4A], 0x5C, '\r\n\f\t^=');
        const expectedValue = '¥\r\\¥\n\\¥\f\\¥\t\\¥^¥¥=¥';

        // Act
        const returnValue = convertBytes('ISO 2022 IR 149\\ISO 2022 IR 13', new Uint8Array(bytes), {vr: 'LT'});

        // Assert
        expect(returnValue).to.equal(expectedValue);
    });

    it('PN VR resets to the first character set after delimiters', () => {
        // Arrange
        const bytes = getDelimiterExpectedBytes([0x1B, 0x2D, 0x54], 0xFB, '\r\n\f\t^=\\');
        const expectedValue = '๛\rû๛\nû๛\fû๛\tû๛^û๛=û๛\\û';

        // Act
        const returnValue = convertBytes('\\ISO 2022 IR 166', new Uint8Array(bytes), {vr: 'PN'});

        // Assert
        expect(returnValue).to.equal(expectedValue);
    });

    it('unspecified VR resets to the first character set after delimiters', () => {
        // Arrange
        const bytes = getDelimiterExpectedBytes([0x1B, 0x2D, 0x54], 0xFB, '\r\n\f\t^=\\');
        const expectedValue = '๛\rû๛\nû๛\fû๛\tû๛^๛๛=๛๛\\û'; // This test verifies that ^= aren't treated as delimeters

        // Act
        const returnValue = convertBytes('\\ISO 2022 IR 166', new Uint8Array(bytes));

        // Assert
        expect(returnValue).to.equal(expectedValue);
    });

    it('handles empty character set', () => {
        // Act
        const returnValue = convertBytes('', new Uint8Array(examples['IR 6'].bytes));

        // Assert
        expect(returnValue).to.equal(examples['IR 6'].value);
    });

    it('handles empty bytes for non-extension character sets', () => {
        // Act
        const returnValue = convertBytes('ISO_IR 166');

        // Assert
        expect(returnValue).to.equal('');
    });

    it('handles empty bytes for extension character sets', () => {
        // Act
        const returnValue = convertBytes('ISO 2022 IR 166');

        // Assert
        expect(returnValue).to.equal('');
    });
  });

  describe('should throw an exception when', () => {
    it('an unknown specific character set is given', () => {
        expect(() => convertBytes('foo')).to.throw('Invalid specific character set');
    });

    it('bytes is not a typed array', () => {
        expect(() => convertBytes('ISO_IR 6', {})).to.throw('bytes must be a Uint8Array');
    });

    it('specificCharacterSet is not a string', () => {
        expect(() => convertBytes({})).to.throw('specificCharacterSet must be a string');
    });

    it('unknown escape sequence encountered', () => {
        expect(() => convertBytes('ISO 2022 IR 6', new Uint8Array([0x1B, 0x01]))).to.throw('Unknown escape sequence');
    });

    it('not enough bytes remain to read an escape sequence', () => {
        expect(() => convertBytes('ISO 2022 IR 100', new Uint8Array([0x1B, 0x2D]))).to.throw('Unknown escape sequence');
    });

    it('not enough bytes for a single JIS X character exist', () => {
        expect(() => convertBytes('ISO 2022 IR 159', new Uint8Array([0x03]))).to.throw('JIS X string');
    });
  });


  describe('DICOM standard examples (from PS 3.5)', () => {
    it('H.3-1', () => {
        // Arrange
        const bytes = [0x59, 0x61, 0x6D, 0x61, 0x64, 0x61, 0x5E, 0x54, 0x61, 0x72, 0x6F, 0x75, 0x3D, 0x1B, 0x24, 0x42, 0x3B, 0x33, 0x45, 0x44, 0x1B, 0x28, 0x42, 0x5E, 0x1B, 0x24, 0x42, 0x42, 0x40, 0x4F, 0x3A, 0x1B, 0x28, 0x42, 0x3D, 0x1B, 0x24, 0x42, 0x24, 0x64, 0x24, 0x5E, 0x24, 0x40, 0x1B, 0x28, 0x42, 0x5E, 0x1B, 0x24, 0x42, 0x24, 0x3F, 0x24, 0x6D, 0x24, 0x26, 0x1B, 0x28, 0x42];
        const expectedValue = 'Yamada^Tarou=山田^太郎=やまだ^たろう';
        const characterSet = '\\ISO 2022 IR 87';

        // Act
        const returnValue = convertBytes(characterSet, new Uint8Array(bytes));

        // Assert
        expect(returnValue).to.equal(expectedValue);
    });

    // Note: The Japanese decoders for JIS X 0201 supported by browsers (shift-jis and euc-jp) both return the katakana
    // as half-width characters, but the DICOM standard's example has full width characters. Therefore the IR 13 characters
    // in expectedValue don't match the Unicode of the standard for this example, even though they conceptually represent the
    // same character, just half width.
    it('H.3-2', () => {
        // Arrange
        const bytes = [0xD4, 0xCF, 0xC0, 0xDE, 0x5E, 0xC0, 0xDB, 0xB3, 0x3D, 0x1B, 0x24, 0x42, 0x3B, 0x33, 0x45, 0x44, 0x1B, 0x28, 0x4A, 0x5E, 0x1B, 0x24, 0x42, 0x42, 0x40, 0x4F, 0x3A, 0x1B, 0x28, 0x4A, 0x3D, 0x1B, 0x24, 0x42, 0x24, 0x64, 0x24, 0x5E, 0x24, 0x40, 0x1B, 0x28, 0x4A, 0x5E, 0x1B, 0x24, 0x42, 0x24, 0x3F, 0x24, 0x6D, 0x24, 0x26, 0x1B, 0x28, 0x4A];
        const expectedValue = 'ﾔﾏﾀﾞ^ﾀﾛｳ=山田^太郎=やまだ^たろう';
        const characterSet = 'ISO 2022 IR 13\\ISO 2022 IR 87';

        // Act
        const returnValue = convertBytes(characterSet, new Uint8Array(bytes));

        // Assert
        expect(returnValue).to.equal(expectedValue);
    });

    it('I.2-1', () => {
        // Arrange
        const bytes = [0x48, 0x6F, 0x6E, 0x67, 0x5E, 0x47, 0x69, 0x6C, 0x64, 0x6F, 0x6E, 0x67, 0x3D, 0x1B, 0x24, 0x29, 0x43, 0xFB, 0xF3, 0x5E, 0x1B, 0x24, 0x29, 0x43, 0xD1, 0xCE, 0xD4, 0xD7, 0x3D, 0x1B, 0x24, 0x29, 0x43, 0xC8, 0xAB, 0x5E, 0x1B, 0x24, 0x29, 0x43, 0xB1, 0xE6, 0xB5, 0xBF];
        const expectedValue = 'Hong^Gildong=洪^吉洞=홍^길동';
        const characterSet = '\\ISO 2022 IR 149';

        // Act
        const returnValue = convertBytes(characterSet, new Uint8Array(bytes));

        // Assert
        expect(returnValue).to.equal(expectedValue);
    });

    it('I.3-1', () => {
        // Arrange
        const bytes = [0x1B, 0x24, 0x29, 0x43, 0x54, 0x68, 0x65, 0x20, 0x66, 0x69, 0x72, 0x73, 0x74, 0x20, 0x6c, 0x69, 0x6e, 0x65, 0x20, 0x69, 0x6e, 0x63, 0x6c, 0x75, 0x64, 0x65, 0x73, 0x20, 0xC7, 0xD1, 0xB1, 0xDB, 0x20, 0x2e, 0xa, 0xa, 0x1B, 0x24, 0x29, 0x43, 0x54, 0x68, 0x65, 0x20, 0x73, 0x65, 0x63, 0x6f, 0x6e, 0x64, 0x20, 0x6c, 0x69, 0x6e, 0x65, 0x20, 0x69, 0x6e, 0x63, 0x6c, 0x75, 0x64, 0x65, 0x73, 0x20, 0xC7, 0xD1, 0xB1, 0xDB, 0x20, 0x2c, 0x20, 0x74, 0x6f, 0x6f, 0x2e, 0xa, 0xa, 0x54, 0x68, 0x65, 0x20, 0x74, 0x68, 0x69, 0x72, 0x64, 0x20, 0x6c, 0x69, 0x6e, 0x65];
        const expectedValue = `The first line includes 한글 .\n\nThe second line includes 한글 , too.\n\nThe third line`;

        const characterSet = '\\ISO 2022 IR 149';

        // Act
        const returnValue = convertBytes(characterSet, new Uint8Array(bytes));

        // Assert
        expect(returnValue).to.equal(expectedValue);
    });

    it('J.1-1', () => {
        // Arrange
        const bytes = [0x57, 0x61, 0x6e, 0x67, 0x5e, 0x58, 0x69, 0x61, 0x6f, 0x44, 0x6f, 0x6e, 0x67, 0x3d, 0xe7, 0x8e, 0x8b, 0x5e, 0xe5, 0xb0, 0x8f, 0xe6, 0x9d, 0xb1, 0x3d];
        const expectedValue = 'Wang^XiaoDong=王^小東=';

        const characterSet = 'ISO_IR 192';

        // Act
        const returnValue = convertBytes(characterSet, new Uint8Array(bytes));

        // Assert
        expect(returnValue).to.equal(expectedValue);
    });

    it('J.2-1', () => {
        // Arrange
        const bytes = [0x54, 0x68, 0x65, 0x20, 0x66, 0x69, 0x72, 0x73, 0x74, 0x20, 0x6c, 0x69, 0x6e, 0x65, 0x20, 0x69, 0x6e, 0x63, 0x6c, 0x75, 0x64, 0x65, 0x73, 0x20, 0xe4, 0xb8, 0xad, 0xe6, 0x96, 0x87, 0x2e, 0x0d, 0x0a, 0x54, 0x68, 0x65, 0x20, 0x73, 0x65, 0x63, 0x6f, 0x6e, 0x64, 0x20, 0x6c, 0x69, 0x6e, 0x65, 0x20, 0x69, 0x6e, 0x63, 0x6c, 0x75, 0x64, 0x65, 0x73, 0x20, 0xe4, 0xb8, 0xad, 0xe6, 0x96, 0x87, 0x2c, 0x20, 0x74, 0x6f, 0x6f, 0x2e, 0x0d, 0x0a, 0x54, 0x68, 0x65, 0x20, 0x74, 0x68, 0x69, 0x72, 0x64, 0x20, 0x6c, 0x69, 0x6e, 0x65, 0x2e, 0x0d, 0x0a];
        const expectedValue = `The first line includes 中文.\r\nThe second line includes 中文, too.\r\nThe third line.\r\n`;

        const characterSet = 'ISO_IR 192';

        // Act
        const returnValue = convertBytes(characterSet, new Uint8Array(bytes));

        // Assert
        expect(returnValue).to.equal(expectedValue);
    });

    it('J.3-1', () => {
        // Arrange
        const bytes = [0x57, 0x61, 0x6e, 0x67, 0x5e, 0x58, 0x69, 0x61, 0x6f, 0x44, 0x6f, 0x6e, 0x67, 0x3d, 0xcd, 0xf5, 0x5e, 0xd0, 0xa1, 0xb6, 0xab, 0x3d];
        const expectedValue = `Wang^XiaoDong=王^小东=`;

        const characterSet = 'GB18030';

        // Act
        const returnValue = convertBytes(characterSet, new Uint8Array(bytes));

        // Assert
        expect(returnValue).to.equal(expectedValue);
    });

    it('J.4-1', () => {
        // Arrange
        const bytes = [0x54, 0x68, 0x65, 0x20, 0x66, 0x69, 0x72, 0x73, 0x74, 0x20, 0x6c, 0x69, 0x6e, 0x65, 0x20, 0x69, 0x6e, 0x63, 0x6c, 0x75, 0x64, 0x65, 0x73, 0x20, 0xd6, 0xd0, 0xce, 0xc4, 0x2e, 0x0d, 0x0a, 0x54, 0x68, 0x65, 0x20, 0x73, 0x65, 0x63, 0x6f, 0x6e, 0x64, 0x20, 0x6c, 0x69, 0x6e, 0x65, 0x20, 0x69, 0x6e, 0x63, 0x6c, 0x75, 0x64, 0x65, 0x73, 0x20, 0xd6, 0xd0, 0xce, 0xc4, 0x2c, 0x20, 0x74, 0x6f, 0x6f, 0x2e, 0x0d, 0x0a, 0x54, 0x68, 0x65, 0x20, 0x74, 0x68, 0x69, 0x72, 0x64, 0x20, 0x6c, 0x69, 0x6e, 0x65, 0x2e, 0x0d, 0x0a];
        const expectedValue = `The first line includes 中文.\r\nThe second line includes 中文, too.\r\nThe third line.\r\n`;

        const characterSet = 'GB18030';

        // Act
        const returnValue = convertBytes(characterSet, new Uint8Array(bytes));

        // Assert
        expect(returnValue).to.equal(expectedValue);
    });

    it('K.2-1', () => {
        // Arrange
        const bytes = [0x5A, 0x68, 0x61, 0x6E, 0x67, 0x5E, 0x58, 0x69, 0x61, 0x6F, 0x44, 0x6F, 0x6E, 0x67, 0x3D, 0x1B, 0x24, 0x29, 0x41, 0xD5, 0xC5, 0x5E, 0x1B, 0x24, 0x29, 0x41, 0xD0, 0xA1, 0xB6, 0xAB, 0x3D, 0x20];
        const expectedValue = `Zhang^XiaoDong=张^小东= `;

        const characterSet = '\\ISO 2022 IR 58';

        // Act
        const returnValue = convertBytes(characterSet, new Uint8Array(bytes));

        // Assert
        expect(returnValue).to.equal(expectedValue);
    });

    it('K.3-1', () => {
        // Arrange
        const bytes = [0x31, 0x29, 0x20, 0x1B, 0x24, 0x29, 0x41, 0xB5, 0xDA, 0xD2, 0xBB, 0xD0, 0xD0, 0xCE, 0xC4, 0xD7, 0xD6, 0xA1, 0xA3, 0x0D, 0x0A, 0x32, 0x29, 0x20, 0x1B, 0x24, 0x29, 0x41, 0xB5, 0xDA, 0xB6, 0xFE, 0xD0, 0xD0, 0xCE, 0xC4, 0xD7, 0xD6, 0xA1, 0xA3, 0x0D, 0x0A, 0x33, 0x29, 0x20, 0x1B, 0x24, 0x29, 0x41, 0xB5, 0xDA, 0xC8, 0xFD, 0xD0, 0xD0, 0xCE, 0xC4, 0xD7, 0xD6, 0xA1, 0xA3, 0x0D, 0x0A];
        const expectedValue = `1) 第一行文字。\r\n2) 第二行文字。\r\n3) 第三行文字。\r\n`;

        const characterSet = '\\ISO 2022 IR 58';

        // Act
        const returnValue = convertBytes(characterSet, new Uint8Array(bytes));

        // Assert
        expect(returnValue).to.equal(expectedValue);
    });
  });

  it('all extensions', () => {
    const characterSets = ['ISO 2022 IR 6','ISO 2022 IR 100','ISO 2022 IR 101','ISO 2022 IR 109','ISO 2022 IR 110','ISO 2022 IR 144','ISO 2022 IR 127','ISO 2022 IR 126','ISO 2022 IR 138','ISO 2022 IR 148','ISO 2022 IR 13','ISO 2022 IR 166','ISO 2022 IR 58','ISO 2022 IR 87','ISO 2022 IR 149','ISO 2022 IR 159'];
    testCharacterSetExtensions(characterSets);
  });

  describe('exceptions', () => {
    it('should throw when ', () => {
        testCharacterSetExtensions(['ISO 2022 IR 6', 'ISO 2022 IR 100']);
      });
  });

});
