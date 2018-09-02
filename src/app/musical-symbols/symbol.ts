import { Point } from '../geometry/geometry';
import { Staff } from './StaffLine';
import {assertNumber} from '../../../node_modules/@angular/core/src/render3/assert';

export enum SymbolType {
  Note,
}

export class Symbol {
  readonly _type: SymbolType;
  private _staff: Staff;
  position: Point;

  static fromJSON(symbol, staff) {
    return new Symbol(symbol.type, staff, Point.fromJSON(symbol.position));
  }

  toJSON() {
    return {
      type: this._type,
      position: this.position
    };
  }

  constructor(type: SymbolType, staff: Staff, pos = new Point(0, 0)) {
    this._type = type;
    this.position = pos;
    this.staff = staff;
  }

  get staff() {
    return this._staff;
  }

  set staff(staff: Staff) {
    if (this._staff !== staff) {
      if (this._staff) {
        this._staff.symbolList.remove(this);
      }
      this._staff = staff;
      this._staff.symbolList.add(this);
    }
  }

  get type() {
    return this._type;
  }

}

export class SymbolList {
  readonly _symbols: Symbol[] = [];
  readonly _staff: Staff;

  fromJSON(symbolList) {
    this._symbols.splice(0, this._symbols.length);
    for (const symbol of symbolList.symbols) {
      this.add(Symbol.fromJSON(symbol, this._staff));
    }
  }

  toJSON() {
    return {symbols: this._symbols.map(function (symbol) {
      return symbol.toJSON();
    })};
  }

  constructor(staff: Staff) {
    this._staff = staff;
  }

  add(symbol: Symbol) {
    if (this._symbols.indexOf(symbol) < 0) {
      this._symbols.push(symbol);
      symbol.staff = this._staff;
    }
  }

  remove(symbol: Symbol): boolean {
    const idx = this._symbols.indexOf(symbol);
    if (idx < 0 ) {
      return false;
    }
    this._symbols.splice(idx, 1);
    return true;
  }

  filter(type: SymbolType): Symbol[] {
    return this._symbols.filter(function(symbol: Symbol): boolean {
      return symbol.type === type;
    });
  }

  get symbols() {
    return this._symbols;
  }
}