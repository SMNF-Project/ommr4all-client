// Functions for xml to json conversion.
// Uses the x2js package.
const X2JS: any = require('x2js');
// const _x2js: any = require('x2js');
// import {X2JS} from 'x2js';
const xmlformatter: any = require('xml-formatter');

export function xml2json(xmlText: string) {
  // console.log(_x2js);
  // console.log(_x2js.X2JS);
  console.log(X2JS);
  // const x2js = new _x2js.X2JS();
  const x2js = new X2JS();
  const document = x2js.xml2js(xmlText);
  const json = JSON.stringify(document);
  return json;
}


export function json2xml(jsonText: string) {
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
