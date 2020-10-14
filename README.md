[![npm version](https://badge.fury.io/js/dicom-character-set.svg)](https://badge.fury.io/js/dicom-character-set) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![Build Status](https://travis-ci.org/radialogica/dicom-character-set.svg?branch=master)](https://travis-ci.org/radialogica/dicom-character-set)
[![Coverage Status](https://coveralls.io/repos/github/radialogica/dicom-character-set/badge.svg?branch=master)](https://coveralls.io/github/radialogica/dicom-character-set)

dicom-character-set
===================
Converts DICOM text (as bytes) to a JavaScript string. Handles multiple character sets (single-byte and multi-byte, with and without extensions) within a single block of text according to the DICOM standard. All encodings specified in the standard are currently supported. For a complete list of all encodings, see [here](http://dicom.nema.org/medical/dicom/current/output/chtml/part03/sect_C.12.html#sect_C.12.1.1.2).

Install
-------

Install via [NPM](https://www.npmjs.com/):

`npm install dicom-character-set`

Or get a packaged source file:

* [dicom-character-set.js](https://unpkg.com/dicom-character-set@latest/dist/dicom-character-set.js)
* [dicom-character-set.min.js](https://unpkg.com/dicom-character-set@latest/dist/dicom-character-set.min.js)

Usage
-----
Firefox/Chrome/Safari/Opera:
```
import { convertBytes } from 'dicom-character-set';
const str = convertBytes('ISO 2022 IR 149\\ISO 2022 IR 13', uint8ArrayBytes, {vr: 'LT'});
```
Backward compatibility (browsers that don't support TextDecoder, e.g. Internet Explorer and Edge) :
```
import { convertBytesPromise } from 'dicom-character-set';

convertBytesPromise('ISO 2022 IR 6\\ISO 2022 IR 13', uint8ArrayBytes, {vr: 'LT'}).then(str => {
    console.log(str);
});
```
Note: Make sure you're passing the text as a Uint8Array, not as a string. Also, only pass the bytes of the value you want converted, not the bytes for the entire DICOM file.

Arguments
-------
Both convertBytes and convertBytesPromise take the same arguments. They are, in order:
* Specific Character Set attribute value (0008,0005) from the DICOM file (either `string` or `undefined`)
* Text bytes as Uint8Array
* Options object (optional). Supported options are:
  * **vr** (string) : the value representation of the text being converted. Gives the decoder a hint for properly handling delimiters. If not specified, the decoder assumes backslash, carriage return, line feed, form feed, and tab all reset the active character set to the first one specified (see [the standard](http://dicom.nema.org/medical/dicom/current/output/html/part05.html#sect_6.1.2.5.3) for details).

Node.js
-------
This library can be used as-is on Node.js versions 11 and up.
You may need to use an ICU-enabled build of Node.js or else add the full-icu package to your app.

Differences from DICOM standard
-------------------------------
In the name of robustness, the behavior varies from the standard DICOM in the following ways:
* If one of the multi-byte character sets not supporting extensions (e.g. GBK) appears first, all following character sets will be ignored; if it appears after any other character set, it will be ignored.
* If multiple character sets are specified, the non-extension character sets are switched to their extension equivalents where applicable (i.e. "ISO_IR 100\ISO_IR 101" would become "ISO 2022 IR 100\ISO 2022 IR 101")
* Control characters (in the CL and CR planes) are allowed, though they probably won't print much
* A multi-byte character set supporting code extensions can be the first character set
* If the same character set appears multiple times, ignore any duplicate occurrences
* If a character is encountered in a code element that hasn't been assigned, it's printed using the currently active code element instead of throwing an error
