// Functions for xml to json conversion.
// Uses the x2js package.
const X2JS: any = require('x2js');
// const _x2js: any = require('x2js');
// import {X2JS} from 'x2js';

// const process = require('process');
// console.log('Process versions:');
// console.log(process.versions);
// process.versions.node = '12.16.2';
//
// const libxmljs: any = require('libxmljs');
const xmlformatter: any = require('xml-formatter');

export function xml2json(xmlText: string): string {
  // console.log(_x2js);
  // console.log(_x2js.X2JS);
  console.log(X2JS);
  // const x2js = new _x2js.X2JS();
  const x2js = new X2JS();
  const document = x2js.xml2js(xmlText);
  const json = JSON.stringify(document);
  return json;
}


export function json2xml(jsonText: string): string {
  // console.log(_x2js);
  // console.log(_x2js.X2JS);
  console.log(X2JS);
  const json = JSON.parse(jsonText);
  // const x2js = new _x2js.X2JS();
  const x2js = new X2JS();
  const xml = xmlformatter(x2js.js2xml(json),
    { indentation: '  ',
      lineSeparator: '\n',
    });
  return xml;
}

export function xmlToBase64(xmlText: string): string {
  return b64EncodeUnicode(xmlText);
}

export function base64ToXml(base64Text: string): string {
  const xmlText = b64DecodeUnicode(base64Text);
  if (!isSyntacticallyValidXML(xmlText)) {
    throw Error('Decoding XML from base64: resulting string is not valid XML.');
  }
  return xmlText;
}

function b64EncodeUnicode(str: string): string {
  // first we use encodeURIComponent to get percent-encoded UTF-8,
  // then we convert the percent encodings into raw bytes which
  // can be fed into btoa.
  return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
    function toSolidBytes(match, p1) {
      return String.fromCharCode(Number('0x' + p1));
    }));
}

function b64DecodeUnicode(str) {
  // Going backwards: from bytestream, to percent-encoding, to original string.
  return decodeURIComponent(atob(str).split('').map(function(c) {
    return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
  }).join(''));
}


export function isSyntacticallyValidXML(xmlText: string): boolean {
  try {
    console.log('...'); // libxmljs.parseXmlString(xmlText);
  } catch (e) {
    return false;
  }
  return true;
}
