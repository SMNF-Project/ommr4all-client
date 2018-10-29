import {Command} from './commands';
import {Point, PolyLine} from '../../geometry/geometry';

export class CommandChangePoint extends Command {
  constructor(
    private point: Point,
    private from: Point,
    private to: Point,
  ) { super(); this.from = this.from.copy(); this.to = this.to.copy(); }

  do() { this.point.copyFrom(this.to); }
  undo() { this.point.copyFrom(this.from); }
  isIdentity() { return this.to.equals(this.from); }
}

export class CommandChangePolyLine extends Command {
  constructor(
    private polyLine: PolyLine,
    private from: PolyLine,
    private to: PolyLine,
    private callback: (PolyLine) => void = null,
  ) {
    super();
    this.from = new PolyLine(from.points);
    this.to = new PolyLine(to.points);
  }

  do() { this.polyLine.moveRef(this.to); if (this.callback) { this.callback(this.polyLine); }}
  undo() { this.polyLine.moveRef(this.from); if (this.callback) { this.callback(this.polyLine); }}
  isIdentity() { return this.to.equals(this.from); }
}
