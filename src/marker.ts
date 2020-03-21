// username -> {color, cursors}
const colors = [
  'BurlyWood', 'PowderBlue', 'Violet', 'GreenYellow',
  'Red', 'LimeGreen', 'DarkViolet', 'GhostWhite',
  'OrangeRed', 'HotPink'
];

const MAX_COLORS = 10;

export interface Cursor{
  row: number, column: number
}

export interface MarkerCursor{
  [username:string]:{color:string, cursor?:Cursor, selection?: any}
}

export class Marker{

  cursors: MarkerCursor = {}
  session: any

  constructor(ace:any){
    this.session = ace.session;
    this.session.addDynamicMarker(this, true);
  }

  update(html:string[], markerLayer:any, session:any, config:any) {
    const start = config.firstRow;
    const end = config.lastRow;
    const cursors = this.cursors;

    for (const property in cursors) {
      // for (var i = 0; i < cursors.length; i++) {
      if ('cursor' in this.cursors[property]) {
        const pos = this.cursors[property].cursor;
        if (pos.row > end) {
          break;
        }
        if (pos.row >= start) {
          // compute cursor position on screen
          // this code is based on ace/layer/marker.js
          const screenPos = session.documentToScreenPosition(pos);

          const height = config.lineHeight;
          const width = config.characterWidth;
          const top = markerLayer.$getTop(screenPos.row, config);
          const left = markerLayer.$padding + (screenPos.column * width);
          // can add any html here
          html.push(
            "<div style='",
            'position: absolute;',
            `border-left: 2px solid ${this.cursors[property].color};`,
            'height:', height, 'px;',
            'top:', top, 'px;',
            'left:', left, 'px; width:', width, "px'></div>",
          );
        }
      }
    }
  };

  redraw() {
    this.session._signal('changeFrontMarker');
  };

  addUser(userName:string, data: Partial<MarkerCursor>){
    this.cursors[userName] = {
      ...data,
      color: colors[Math.floor(Math.random() * MAX_COLORS)],
    };
    this.redraw();
  }

  removeUser(userName:string){
    if (!(userName in this.cursors)) return

    delete this.cursors[userName];
    this.redraw()
  }

  updateCursor(userName:string, cursor:Cursor){
    this.cursors[userName] = Object.assign(
      {}, this.cursors[userName], {cursor}
    )
    this.redraw();
  }

  updateSelection(userName:string, selection){
    this.cursors[userName] = Object.assign(
      {}, this.cursors[userName], {selection}
    )
    this.redraw();
  }
}
