const marker = {};
marker.cursors = {}; // username -> {color, cursors}

marker.init = function (ace) {
  marker.session = ace.session;
  marker.session.addDynamicMarker(marker, true);
};

marker.update = function (html, markerLayer, session, config) {
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
marker.redraw = function () {
  this.session._signal('changeFrontMarker');
};

export default marker;
