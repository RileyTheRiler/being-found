/* Locations: layouts, interactive objects, seats and lights. Chapter scripts decide what each object offers. */
'use strict';
BF.locations = (() => {
  const L = {};
  const {P, face} = BF.iso;

  /* ===== Linden Row: the street ===== */
  L.street = {
    type: 'exterior', w: 34, d: 13, wallH: 13, road: [5.6, 10.6], park: [24.2, 34], crossing: 20.5, cam: 'follow', edge: true, camLift: 150,
    items: [
      {type: 'building', x: 0, y: 0, w: 7.5, d: 2.5, h: 10, color: '#a6573f', brick: true, trim: '#e9dfcf',
        windows: [{u: .8, v: 4.6}, {u: 3.1, v: 4.6}, {u: 5.4, v: 4.6, plant: 1}, {u: .8, v: 7.4}, {u: 3.1, v: 7.4, curtain: '#7a9e9f'}, {u: 5.4, v: 7.4}],
        doors: [{u: 5.4, w: 1.5, h: 3.2, color: '#2c4a3b'}], shop: {u: .3, w: 4.8, h: 3.3, name: 'Launderette', fascia: '#2c4a3b', kind: 'laundry'}},
      {type: 'building', x: 7.5, y: 0, w: 10, d: 2.5, h: 12.6, color: '#dcc8a6', trim: '#f4ede0',
        windows: [
          {u: .8, v: 1.1}, {u: 2.7, v: 1.1}, {u: 7.6, v: 1.1, plant: 1},
          {u: .8, v: 4.1, curtain: '#b56576'}, {u: 2.7, v: 4.1}, {u: 6.2, v: 4.1, plant: 1}, {u: 8.2, v: 4.1, curtain: '#3d5a80'},
          {u: .8, v: 7.1}, {u: 2.7, v: 7.1, curtain: '#e9c46a'}, {id: 'win2B', u: 6.2, v: 7.1, curtain: '#c96f4a', open: .8, plant: 1}, {id: 'win2C', u: 8.2, v: 7.1, curtain: '#6b5b7a', open: .2},
          {u: .8, v: 10.1}, {u: 2.7, v: 10.1}, {u: 6.2, v: 10.1, curtain: '#81b29a'}, {u: 8.2, v: 10.1}],
        doors: [{u: 4.4, w: 1.8, h: 3.4, color: '#2f4858', number: '14'}]},
      {type: 'building', x: 17.5, y: 0, w: 6.5, d: 2.5, h: 9.8, color: '#7f958b', trim: '#f2ece0',
        windows: [{u: .7, v: 5.1}, {u: 2.7, v: 5.1, curtain: '#e07a5f'}, {u: 4.7, v: 5.1}, {u: .7, v: 7.8, plant: 1}, {u: 2.7, v: 7.8}, {u: 4.7, v: 7.8}],
        shop: {u: .25, w: 6, h: 3.6, name: 'Ferro’s Bakery', fascia: '#1d2b3a', kind: 'bakery'}, awning: {u: .25, w: 6, z: 3.9, color: '#b5482e'}},
      {type: 'planter', x: 8.1, y: 2.6, w: 2.4, d: .7}, {type: 'planter', x: 14.4, y: 2.6, w: 2.4, d: .7},
      {type: 'aboard', x: 19.2, y: 3.3, w: 1.2, d: .6, id: 'aboard'},
      {type: 'tree', x: 5.6, y: 4.3, size: 1}, {type: 'tree', x: 16.6, y: 4.3, size: 1.05}, {type: 'tree', x: 28.4, y: 1.2, size: 1.35}, {type: 'tree', x: 32, y: 3.6, size: 1.1},
      {type: 'lamppost', x: 3.2, y: 5.05, w: .2, d: .2}, {type: 'lamppost', x: 13.2, y: 5.05, w: .2, d: .2}, {type: 'lamppost', x: 23.6, y: 5.05, w: .2, d: .2},
      {type: 'bin', x: 11.3, y: 4.6, w: .7, d: .7}, {type: 'rack', x: 1.2, y: 3.8, w: 1.6, d: .8, bike: '#3a7ca5'},
      {type: 'busstop', x: 24.6, y: 3.4, w: 3.2, d: 1.1},
      {type: 'bench', x: 29.5, y: 2, w: 2.6, d: .9, back: true, color: '#8a5b3a'},
      {type: 'fence', x: 24.2, y: .3, w: 9.6, d: .1, block: false},
      {type: 'flowers', x: 25, y: .6, w: 3, d: 1.2, block: false},
      {type: 'car', x: 2, y: 6.1, w: 4.4, d: 1.9, color: '#8a3b3b'}, {type: 'car', x: 30, y: 8.4, w: 4, d: 1.9, color: '#3b6e8a'},
      {id: 'bus', type: 'bus', x: -12, y: 6.2, w: 8, d: 2, block: false, hidden: true},
    ],
    blocks: [[0, 5.3, 34, 13]],
    objects: {
      door14: {name: 'Front door, No. 14', box: [11.9, 2.3, 13.7, 2.6, 0, 3.4], spot: [12.8, 3.4], face: 'br'},
      bakery: {name: 'Ferro’s Bakery', box: [17.8, 2.3, 23.8, 3.2, 0, 3.6], spot: [21.6, 3.8], face: 'br'},
      lettering: {name: 'The window lettering', box: [18.3, 2.3, 21.6, 2.7, 1.4, 3.4], spot: [19.9, 4.2], face: 'br'},
      aboard: {name: 'Chalkboard', box: [19.2, 3.3, 20.4, 3.9, 0, 2.2], spot: [19.6, 4.5], face: 'br'},
      busstop: {name: 'Bus stop', box: [24.6, 3.4, 27.8, 4.5, 0, 4.4], spot: [26.2, 4.9], face: 'br'},
      bench: {name: 'Park bench', box: [29.5, 2, 32.1, 2.9, 0, 2], spot: [30.8, 3.6], face: 'br'},
      tree: {name: 'Plane tree', box: [28, 1, 29.6, 2.4, 0, 6], spot: [28.8, 3.4], face: 'br'},
      bike: {name: 'Bike rack', box: [1.2, 3.2, 2.8, 4.6, 0, 1.8], spot: [2.2, 4.9], face: 'br'},
    },
    seats: {bench: {x: 30.4, y: 2.55, dir: 'fl', seat: 30}, bench2: {x: 31.3, y: 2.55, dir: 'fl', seat: 30}, busBench: {x: 26, y: 3.75, dir: 'fl', seat: 29}},
    lights: [
      {x: 3.7, y: 5.1, z: 0, r: 4, color: '#ffd28a', i: .85, night: true, bulb: 1.4, bz: 6.3, flat: true},
      {x: 13.7, y: 5.1, z: 0, r: 4, color: '#ffd28a', i: .85, night: true, bulb: 1.4, bz: 6.3, flat: true},
      {x: 24.1, y: 5.1, z: 0, r: 4, color: '#ffd28a', i: .85, night: true, bulb: 1.4, bz: 6.3, flat: true},
      {x: 20.5, y: 3.4, z: 0, r: 4.5, color: '#ffbe73', i: .7, night: true, flat: true, when: W => (W.state.bakery || {}).lit !== false},
      {x: 13.7, y: 2.8, z: 8, r: 3.2, color: '#ffd28a', i: .6, night: true, when: W => (W.state.win2B || {}).lit !== false},
      {x: 15.7, y: 2.8, z: 8, r: 3.2, color: '#ffd28a', i: .6, night: true, when: W => (W.state.win2C || {}).lit},
    ],
    tick(W, dt) {
      const bus = W.items.find(i => i.id === 'bus');
      if (bus && !bus.hidden) { bus.x += (bus.speed || 0) * dt; if (bus.x > 40) bus.hidden = true; }
      if (W.light.rain) for (let i = 0; i < 4; i++) W.emit('rain', Math.random() * 34, Math.random() * 13, 9, 1, {vz: -9, life: 1.2});
      if (!W.light.night && Math.random() < dt * .3) W.emit('leaf', 28 + Math.random() * 4, 1 + Math.random() * 3, 5, 1, {vz: -.8, vx: .4, life: 6, color: BF.u.pick(['#5f9152', '#76a35e'])});
    },
  };

  /* ===== Noor's flat, 2B ===== */
  L.noorFlat = {
    w: 12, d: 9, wallH: 5.4, slab: '#4a3c46',
    floor: {type: 'planks', color: '#b8875c', zones: [{type: 'tiles', color: '#ece6da', alt: '#d9cfbf', x: 0, y: 0, w: 4.4, d: 2.4}]},
    wall: {color: '#ead9c2', cap: '#6b5a60'}, wallL: {color: '#dcc8ae', cap: '#6b5a60'},
    walls: [
      {type: 'cabinets', wall: 'R', at: .3, w: 3.8, z: 3.3, h: 1.25, color: '#7fa7a0'}, {type: 'splash', wall: 'R', at: .3, w: 3.8, z: 2.25, h: 1},
      {type: 'window', id: 'window', wall: 'R', at: 5.2, w: 2.6, z: 1.9, h: 2.7, curtain: '#c96f4a', view: 'street', open: .45},
      {type: 'clock', wall: 'R', at: 4.3, z: 3.9},
      {type: 'frame', wall: 'R', at: 9.6, w: 1.6, z: 2.5, h: 1.2, art: 'landscape'},
      {type: 'frame', wall: 'R', at: 8.2, w: .8, z: 2.9, h: 1, art: 'abstract', palette: ['#2a9d8f', '#264653', '#e9c46a', '#f4a261']},
      {type: 'shelf', wall: 'L', at: .4, w: 1.6, z: 3.3, things: 'jars,mugs'},
      {type: 'hooks', wall: 'L', at: 6.3, w: .8, z: 3.6, coats: ['#c96f4a'], keys: true},
      {type: 'door', id: 'door', wall: 'L', at: 7, w: 1.8, beyond: '#4b3f49'},
      {type: 'switch', wall: 'L', at: 6.6, z: 2.1},
    ],
    items: [
      {type: 'counter', x: .3, y: .3, w: 4, d: 1.2, color: '#efe9de', top: '#3a3940', parts: [{kind: 'stove', at: .15, id: 'stove'}, {kind: 'pan', at: .25, id: 'pan'}, {kind: 'kettle', at: 1.75, id: 'kettle'}, {kind: 'sink', at: 2.5}]},
      {type: 'fridge', x: .3, y: 2.3, w: 1.3, d: 1.3, face: 'E', magnets: ['#e07a5f', '#81b29a', '#f2cc8f']},
      {type: 'plant', x: 4.35, y: .35, size: 1.6, kind: 'tall', w: .8, d: .8},
      {id: 'easel', type: 'easel', x: 4.5, y: 2.2, w: 1.4, d: .9},
      {type: 'sidetable', x: 8.2, y: .4, w: .8, d: .8, h: 1.1},
      {id: 'bed', type: 'bed', x: 9.2, y: .3, w: 2.5, d: 4, duvet: '#e9a27c', frame: '#8a6447', unmade: true},
      {type: 'bookshelf', x: .3, y: 4, w: 1, d: 2.2, face: 'E'},
      {type: 'table', x: 3, y: 4.3, w: 2, d: 1.5},
      {type: 'chair', x: 2.1, y: 4.6, face: 'E', cushion: '#e9c46a'}, {type: 'chair', x: 5.1, y: 4.6, face: 'W'},
      {type: 'rug', x: 5.6, y: 5.2, w: 3.9, d: 3, color: '#3d5a80', trim: '#e0c068', pattern: true},
      {type: 'armchair', x: 9.6, y: 5.3, w: 2, d: 1.8, color: '#a65e46', face: 'S', throw: '#e9c46a'},
      {id: 'lamp', type: 'lamp', x: 8.8, y: 7.6, w: .6, d: .6, h: 3.8},
      {id: 'record', type: 'crate', x: 6.2, y: 7.7, w: 1.1, d: .9, h: 1.2, record: true, records: true},
      {type: 'plant', x: 11.2, y: 7.8, size: 1.2, w: .8, d: .8},
      {id: 'signItem', type: 'prop', x: .35, y: 6.2, w: .25, d: .7, draw(ctx, W) { if ((W.state.sign || {}).gone) return; face(ctx, [.45, 6.95, 1.5], [0, -1, 0], [.12, 0, -1], c => { c.fillStyle = '#c9b18a'; c.fillRect(0, 0, .8, 1.5); c.strokeStyle = '#8a6a4a'; c.lineWidth = .04; c.beginPath(); c.moveTo(.4, 0); c.lineTo(.4, 1.5); c.moveTo(0, .75); c.lineTo(.8, .75); c.stroke(); }); }},
      {id: 'props', type: 'prop', x: 3, y: 4.3, w: 2, d: 1.5, z: 1.56, layer: 1, block: false, draw(ctx, W) {
        const s = W.state; if ((s.tea || {}).made) BF.art.prop.cup(ctx, 3.6, 4.8, 1.56, '#f2efe8', {full: !(s.tea || {}).drunk});
        if ((s.breakfast || {}).made) BF.art.prop.plate(ctx, 4.3, 4.9, 1.56, !(s.breakfast || {}).eaten);
        if (!(s.books || {}).taken) BF.art.prop.books(ctx, 3.3, 5.1, 1.56, 2);
      }},
      {id: 'nightProps', type: 'prop', x: 8.2, y: .4, w: .8, d: .8, z: 1.1, layer: 1, block: false, draw(ctx, W) { if (!(W.state.phone || {}).taken) BF.art.prop.phone(ctx, 8.45, .55, 1.12); }},
    ],
    objects: {
      window: {name: 'Window', box: [5.2, 0, 7.8, .3, 1.9, 4.6], spot: [6.6, 1.2], face: 'br'},
      easel: {name: 'Painting', box: [4.4, 2.1, 6, 3.1, 0, 4.4], spot: [6.3, 3.6], face: 'bl'},
      kettle: {name: 'Kettle', box: [1.9, .4, 2.7, 1.2, 1.8, 2.5], spot: [2.3, 2.0], face: 'br'},
      stove: {name: 'Stove', box: [.4, .4, 1.8, 1.5, 1.7, 2.1], spot: [1.3, 1.85], face: 'br'},
      sink: {name: 'Sink', box: [2.8, .4, 4.1, 1.5, 1.6, 2.2], spot: [3.5, 2.0], face: 'br'},
      fridge: {name: 'Fridge', box: [.3, 2.3, 1.6, 3.6, 0, 4], spot: [2.3, 3.0], face: 'bl'},
      table: {name: 'Table', box: [3, 4.3, 5, 5.8, 0, 1.7], spot: [2.55, 5.05], face: 'fr'},
      phone: {name: 'Phone', box: [8.2, .4, 9, 1.2, 1.1, 1.5], spot: [8.6, 1.75], face: 'br', pri: 1},
      bed: {name: 'Bed', box: [9.2, .3, 11.7, 4.3, 0, 1.6], spot: [8.75, 2.6], face: 'fr'},
      books: {name: 'Bookshelf', box: [.3, 4, 1.3, 6.2, 0, 4.2], spot: [1.9, 5.95], face: 'bl'},
      sign: {name: 'The wrapped sign', box: [.3, 6.2, .7, 7, 0, 1.6], spot: [1.4, 6.6], face: 'bl', pri: 1},
      record: {name: 'Record player', box: [6.2, 7.7, 7.3, 8.6, 0, 1.6], spot: [6.75, 7.05], face: 'fl'},
      armchair: {name: 'Armchair', box: [9.6, 5.3, 11.6, 7.1, 0, 1.8], spot: [10.6, 7.6], face: 'bl'},
      plants: {name: 'Plant', box: [4.3, .3, 5.2, 1.1, 0, 3.4], spot: [4.9, 1.6], face: 'br'},
      door: {name: 'Front door', box: [0, 7, .3, 8.8, 0, 4.2], spot: [1.0, 7.9], face: 'bl'},
    },
    seats: {table: {x: 2.55, y: 5.05, dir: 'fr', seat: 30}, armchair: {x: 10.6, y: 6.35, dir: 'fl', seat: 32}, bedEdge: {x: 9.45, y: 2.6, dir: 'fr', seat: 30}},
    lights: [
      {kind: 'window', x: 5.2, w: 2.6, len: 6.5, when: W => ((W.state.window || {}).open ?? .45) > .3},
      {x: 6.5, y: 1.5, z: 0, r: 3.5, color: '#ffeacc', i: .35, day: true},
      {x: 9.1, y: 7.9, z: 3, r: 4.6, color: '#ffcf8a', i: .9, when: W => (W.state.lamp || {}).on, bulb: 1.6, bz: 3.3},
      {x: 2, y: .9, z: 3, r: 3, color: '#fff2dc', i: .3},
    ],
    tick(W, dt) {
      if (!W.light.night && Math.random() < dt * 6) W.emit('dust', 5.4 + Math.random() * 3.5, .5 + Math.random() * 4.5, Math.random() * 3.5, 1, {vz: .02, vx: .04, life: 4});
      const k = W.state.kettle || {}; if (k.boiling && Math.random() < dt * 14) W.emit('steam', 2.3, .9, 2.45, 1, {vz: .7, life: 1.6});
      const t = W.state.tea || {}; if (t.made && !t.drunk && Math.random() < dt * 3) W.emit('steam', 3.6, 4.8, 1.9, 1, {vz: .35, life: 1.4, size: .5});
      const p = W.state.pan || {}; if (p.cooking && Math.random() < dt * 10) W.emit('steam', .9, 1.3, 2, 1, {vz: .6, life: 1.2, size: .7});
      const r = W.state.record || {}; if (r.on && Math.random() < dt * 1.2) W.emit('note', 6.7, 8.1, 1.9, 1, {vz: .5, vx: .1, life: 2});
    },
  };

  /* ===== The second-floor landing ===== */
  L.hallway = {
    w: 13, d: 5.4, wallH: 5.2, slab: '#3c3340',
    floor: {type: 'planks', color: '#8a6a50'},
    wall: {color: '#c9b79a', cap: '#5a4a50', wainscot: '#7d6a5a'}, wallL: {color: '#bba98c', cap: '#5a4a50', wainscot: '#7d6a5a'},
    walls: [
      {type: 'door', id: 'door2B', wall: 'R', at: 1.2, w: 1.8, label: '2B', color: '#6f4e3a', peephole: true},
      {type: 'door', id: 'door2C', wall: 'R', at: 8, w: 1.8, label: '2C', color: '#4e5a6a', peephole: true, lightUnder: true},
      {type: 'radiator', wall: 'R', at: 4.2, w: 1.6, z: .3, h: 1.1},
      {type: 'board', wall: 'R', at: 4.4, w: 1.8, z: 2.6, h: 1.3, notes: [{x: .2, y: .2, c: '#fffaf0'}, {x: .9, y: .3, c: '#f2cc8f', w: .6}, {x: .3, y: .75, c: '#d9ecf2', w: .45, h: .4}]},
      {type: 'window', wall: 'L', at: 1.2, w: 2.2, z: 2, h: 2.4, view: 'roofs', frame: '#e8e0d0'},
      {type: 'frame', wall: 'R', at: 10.8, w: 1, z: 2.6, h: 1.2, art: 'landscape'},
    ],
    items: [
      {type: 'rug', x: .6, y: 2, w: 9.8, d: 1.8, color: '#7a3b3b', trim: '#d9b45a'},
      {id: 'bikeH', type: 'bike', x: 6.1, y: .25, w: .4, d: 2.4, color: '#3a7ca5', flat: true},
      {type: 'plant', x: 3.8, y: .35, size: 1, kind: 'dry', w: .6, d: .6},
      {id: 'stairs', type: 'prop', x: 10.9, y: .3, w: 2, d: 4.6, draw(ctx) { for (let i = 0; i < 6; i++) BF.iso.box(ctx, 11 + i * .33, .4, -i * .3, 2, 4.4, .3, i % 2 ? '#7a5a42' : '#86664c', {hi: false}); BF.iso.box(ctx, 10.9, .3, 0, .15, .15, 3.2, '#5a3f2d'); BF.iso.box(ctx, 10.9, 4.75, 0, .15, .15, 3.2, '#5a3f2d'); BF.iso.box(ctx, 10.9, .3, 3.1, .15, 4.6, .15, '#5a3f2d'); }, block: false},
      {id: 'hallProps', type: 'prop', x: 8, y: .3, w: 1.8, d: .8, block: false, draw(ctx, W) { const s = W.state; if ((s.hallBag || {}).here) BF.art.prop.bag(ctx, 9.3, .6, 0); if ((s.hallNote || {}).here) BF.art.prop.note(ctx, 8.6, .4, 0); }},
    ],
    objects: {
      door2B: {name: 'Door 2B', box: [1.2, 0, 3, .3, 0, 4.1], spot: [2.1, 1.3], face: 'br'},
      door2C: {name: 'Door 2C', box: [8, 0, 9.8, .3, 0, 4.1], spot: [8.9, 1.4], face: 'br'},
      bike: {name: 'Bike', box: [6, .2, 6.7, 2.7, 0, 1.9], spot: [6.4, 3.3], face: 'br'},
      board: {name: 'Noticeboard', box: [4.4, 0, 6.2, .2, 2.6, 3.9], spot: [5.2, 2.2], face: 'br'},
      stairs: {name: 'Stairs down', box: [10.9, .3, 13, 4.9, -1.5, 1], spot: [10.5, 2.7], face: 'fr'},
    },
    blocks: [[10.9, .3, 13, 5.4]],
    lights: [{x: 5, y: 1.5, z: 4, r: 5, color: '#ffd9a0', i: .55, bulb: 1.4, bz: 4.6}, {x: 8.9, y: .5, z: 0, r: 1.4, color: '#ffd88a', i: .6, flat: true}],
  };

  /* ===== Dele's flat, 2C ===== */
  L.deleFlat = {
    w: 11, d: 9, wallH: 5.4, slab: '#3a3340',
    floor: {type: 'planks', color: '#9a7a5e'},
    wall: {color: '#cfc3b4', cap: '#544550', pattern: 'stripe'}, wallL: {color: '#c2b4a3', cap: '#544550', pattern: 'stripe'},
    walls: [
      {type: 'window', id: 'curtains', wall: 'R', at: 3.4, w: 2.6, z: 1.9, h: 2.7, curtain: '#6b5b7a', view: 'street', open: .12},
      {type: 'cabinets', wall: 'R', at: 7.2, w: 3.4, z: 3.3, h: 1.2, color: '#9aa5a8'}, {type: 'splash', wall: 'R', at: 7.2, w: 3.4, z: 2.25, h: 1, color: '#dfe3e2'},
      {type: 'frame', wall: 'L', at: 1.6, w: 1.6, z: 2.7, h: 1, art: 'lettering', text: 'Ferro’s', frame: '#3a2a20', mat: false},
      {type: 'shelf', wall: 'L', at: 3.6, w: 1.8, z: 3.4, things: 'radio,books'},
      {type: 'hooks', wall: 'L', at: 6, w: .7, z: 3.6, coats: ['#3b4a5a'], keys: true},
      {type: 'door', id: 'door', wall: 'L', at: 6.9, w: 1.8, beyond: '#6a5a50', peephole: true},
      {type: 'frame', wall: 'R', at: 1.2, w: 1, z: 2.8, h: 1.3, art: 'photo', people: ['#2a9d8f', '#d4a12a', '#c4573a']},
    ],
    items: [
      {type: 'counter', x: 7.2, y: .3, w: 3.5, d: 1.2, color: '#d8d6d0', top: '#4a4448', parts: [{kind: 'kettle', at: .3, id: 'kettle', color: '#b9b6b0'}, {kind: 'sink', at: 1.1}, {kind: 'mugs', at: 2.5, n: 3}]},
      {type: 'fridge', x: 9.5, y: 1.8, w: 1.2, d: 1.2, face: 'S', magnets: ['#b5482e']},
      {id: 'sofa', type: 'sofa', x: .3, y: 1.4, w: 1.9, d: 4, color: '#56627a', face: 'E', throw: '#8c7a9b', blanket: '#8c7a9b'},
      {id: 'winlamp', type: 'lamp', x: .5, y: .5, w: .6, d: .6, h: 3.8},
      {type: 'table', x: 3, y: 2.6, w: 1.8, d: 1.5, h: 1, color: '#6f5743'},
      {type: 'chair', x: 5.4, y: 2.9, face: 'W', color: '#6a4f3a'},
      {id: 'case', type: 'case', x: 5.6, y: 6.6, w: 1.6, d: .9},
      {id: 'board', type: 'board', x: 7.6, y: 6.4, w: 2.2, d: .4, h: 1.7, text: 'Ferro’s', sub: 'BAKERY'},
      {type: 'plant', x: 2.6, y: .4, size: 1, kind: 'dry', w: .6, d: .6},
      {type: 'basket', x: 9.4, y: 4.2, w: .8, d: .8, inner: '#55617a'},
      {type: 'pile', x: 1.2, y: 8, n: 7, w: .6, d: .5, block: false},
      {type: 'box', x: 3.4, y: 7.6, w: 1.1, d: .9, h: .7, color: '#b99a72', tape: true},
      {id: 'dProps', type: 'prop', x: 3, y: 2.6, w: 1.8, d: 1.5, z: 1.01, layer: 1, block: false, draw(ctx, W) {
        const s = W.state; BF.art.prop.cup(ctx, 3.4, 3.0, 1.01, '#e07a5f'); BF.art.prop.cup(ctx, 3.7, 3.6, 1.01, '#81b29a');
        if (!(s.dphone || {}).taken) BF.art.prop.phone(ctx, 4.2, 3.1, 1.01, true);
        if ((s.leftCup || {}).here) BF.art.prop.cup(ctx, 4.3, 3.8, 1.01, '#f2efe8', {full: !(s.leftCup || {}).drunk});
        if ((s.pastryBag || {}).here) BF.art.prop.bag(ctx, 3.25, 3.6, 1.01);
        if ((s.note || {}).table) BF.art.prop.note(ctx, 4.1, 2.75, 1.01);
      }},
      {id: 'floorNote', type: 'prop', x: .4, y: 7.4, w: .5, d: .5, block: false, draw(ctx, W) { if ((W.state.note || {}).floor) BF.art.prop.note(ctx, .5, 7.5, 0); }},
    ],
    objects: {
      door: {name: 'Front door', box: [0, 6.9, .3, 8.7, 0, 4.2], spot: [1.0, 7.8], face: 'bl'},
      keys: {name: 'Keys', box: [0, 6, .3, 6.7, 2.6, 3.8], spot: [1.0, 6.4], face: 'bl'},
      sofa: {name: 'Sofa', box: [.3, 1.4, 2.2, 5.4, 0, 1.7], spot: [2.6, 4.6], face: 'bl'},
      table: {name: 'Coffee table', box: [3, 2.6, 4.8, 4.1, 0, 1.2], spot: [3.9, 4.6], face: 'br'},
      phone: {name: 'Phone', box: [4, 2.9, 4.6, 3.5, .9, 1.3], spot: [3.9, 4.6], face: 'br', pri: 2},
      kettle: {name: 'Kettle', box: [7.4, .4, 8.2, 1.2, 1.8, 2.5], spot: [7.9, 2.0], face: 'br'},
      mugs: {name: 'Mugs by the sink', box: [9.6, .4, 10.7, 1.2, 1.8, 2.3], spot: [8.9, 2.0], face: 'br'},
      fridge: {name: 'Fridge', box: [9.5, 1.8, 10.7, 3, 0, 4], spot: [9.1, 3.6], face: 'fr'},
      curtains: {name: 'Curtains', box: [3.4, 0, 6, .3, 1.9, 4.6], spot: [4.7, 1.3], face: 'br'},
      lamp: {name: 'Lamp', box: [.4, .4, 1.2, 1.2, 0, 3.8], spot: [1.4, 1.25], face: 'bl'},
      case: {name: 'Sign-writing case', box: [5.6, 6.6, 7.2, 7.5, 0, .9], spot: [6.4, 6.0], face: 'fl'},
      board: {name: 'Practice board', box: [7.6, 6.4, 9.8, 6.9, 0, 1.8], spot: [8.7, 5.8], face: 'fl'},
      mail: {name: 'Post', box: [1, 7.8, 2, 8.6, 0, .4], spot: [1.6, 7.3], face: 'fl'},
      shelf: {name: 'Shelf and radio', box: [0, 3.6, .3, 5.4, 3, 4.1], spot: [2.6, 4.6], face: 'bl'},
      photo: {name: 'Photograph', box: [1.2, 0, 2.2, .2, 2.8, 4.1], spot: [1.7, 1.2], face: 'br'},
      lettering: {name: 'Framed lettering', box: [0, 1.6, .2, 3.2, 2.7, 3.7], spot: [2.6, 2.4], face: 'bl'},
    },
    seats: {sofa: {x: 1.45, y: 3.4, dir: 'fr', seat: 32}, chair: {x: 5.85, y: 3.35, dir: 'bl', seat: 30}},
    lights: [
      {x: .8, y: .8, z: 3.2, r: 5, color: '#ffc77a', i: .95, when: W => (W.state.winlamp || {}).on !== false, bulb: 1.8, bz: 3.4},
      {kind: 'window', x: 3.4, w: 2.6, len: 5, when: W => ((W.state.curtains || {}).open ?? .12) > .3},
      {x: 4.7, y: .4, z: 2.5, r: 1.6, color: '#d9e2ef', i: .35, when: W => ((W.state.curtains || {}).open ?? .12) <= .3 && !W.light.night},
      {x: 8.8, y: 1, z: 3.5, r: 3, color: '#f2efe8', i: .25, when: W => (W.state.kitchenLight || {}).on},
      {x: .6, y: 7.8, z: 2, r: 3, color: '#ffe2b0', i: .6, when: W => (W.state.door || {}).open},
    ],
    tick(W, dt) {
      const k = W.state.kettle || {}; if (k.boiling && Math.random() < dt * 14) W.emit('steam', 7.7, .9, 2.45, 1, {vz: .7, life: 1.6});
      const c = W.state.leftCup || {}; if (c.here && c.warm && Math.random() < dt * 2.5) W.emit('steam', 4.3, 3.8, 1.35, 1, {vz: .3, life: 1.3, size: .5});
    },
  };

  /* ===== Linden Community Library ===== */
  L.library = {
    w: 14, d: 10, wallH: 6, slab: '#3d3440',
    floor: {type: 'planks', color: '#a9805b', zones: [{type: 'carpet', color: '#6a7f6a', x: 0, y: 4.6, w: 5.2, d: 5.4}]},
    wall: {color: '#e3d7bf', cap: '#5a4a50', wainscot: '#8a6a4e'}, wallL: {color: '#d6c8ad', cap: '#5a4a50', wainscot: '#8a6a4e'},
    walls: [
      {type: 'window', id: 'libWindow', wall: 'R', at: 6.2, w: 3.4, z: 1.8, h: 3.3, view: 'trees', frame: '#efe6d4'},
      {type: 'board', id: 'notice', wall: 'R', at: 10.8, w: 2.4, z: 2.4, h: 1.6, notes: [{x: .15, y: .15, c: '#fffaf0'}, {x: .75, y: .2, c: '#f2cc8f', w: .6}, {x: 1.45, y: .15, c: '#d9ecf2', w: .7, h: .55}, {x: .3, y: .9, c: '#e8f0d8', w: .7, h: .5}, {x: 1.3, y: .85, c: '#fbd1c7', w: .55, h: .55}]},
      {type: 'clock', wall: 'R', at: 9.9, z: 4.9, seconds: true},
      {type: 'calendar', wall: 'R', at: 13.3, w: .6, z: 2.9, h: .9, color: '#2f4858'},
      {type: 'sign', id: 'rcSign', wall: 'L', at: 5.6, w: 2.2, z: 3.2, h: 1.1, text: 'READING CORNER', bg: '#24476b', fg: '#f2c14e'},
      {type: 'door', id: 'libDoor', wall: 'L', at: 8.2, w: 1.8, color: '#5a6b4a', beyond: '#c9d6c2'},
    ],
    items: [
      {type: 'shelves', x: .3, y: .3, w: 5.6, d: 1, h: 4.8, face: 'S'},
      {type: 'shelves', x: .3, y: 1.6, w: 1, d: 2.8, h: 4.8, face: 'E'},
      {type: 'shelves', x: 3.2, y: 2.4, w: 2.6, d: .9, h: 3.2, face: 'S', books: ['#c0533c', '#e2b04a', '#5b8c5a', '#3e6e8e']},
      {type: 'bench', x: .4, y: 5.3, w: 1.1, d: 2.8, face: 'E', back: true, color: '#b0844f', plaque: true},
      {type: 'rug', x: 1.8, y: 5.4, w: 3, d: 3, round: true, color: '#c98b5e', trim: '#8a4f30'},
      {type: 'armchair', x: 3.2, y: 7.8, w: 1.8, d: 1.8, color: '#7a5a8a', face: 'S'},
      {type: 'sidetable', x: 2, y: 8.6, w: .8, d: .8},
      {id: 'desk', type: 'libdesk', x: 8.4, y: 4.6, w: 4.4, d: 1.3},
      {id: 'cart', type: 'cart', x: 6, y: 7.2, w: 2, d: 1},
      {type: 'plant', x: 12.8, y: .4, size: 1.6, kind: 'tall', w: .8, d: .8},
      {type: 'plant', x: 5.4, y: 4.4, size: 1, w: .6, d: .6},
      {type: 'drawers', x: 12.9, y: 2.2, w: .8, d: 1.6, h: 1.8, face: 'E', color: '#7a5538'},
      {id: 'deskProps', type: 'prop', x: 8.4, y: 4.6, w: 4.4, d: 1.3, z: 2.22, layer: 1, block: false, draw(ctx, W) { const s = W.state; BF.art.prop.books(ctx, 9.2, 4.8, 2.22, 2); if (!(s.lphone || {}).taken) BF.art.prop.phone(ctx, 11.2, 5.4, 2.22); BF.iso.box(ctx, 10, 5.1, 2.22, .8, .55, .12, '#2f4858'); if ((s.signLean || {}).here) BF.art.prop.sign(ctx, 8.2, 6.2, 0, false); }},
    ],
    objects: {
      cart: {name: 'Returns cart', box: [6, 7.2, 8, 8.2, 0, 2], spot: [7, 6.6], face: 'fl'},
      planner: {name: 'Your planner', box: [9.9, 5, 10.9, 5.7, 2.1, 2.5], spot: [10.4, 4.1], face: 'fl', pri: 2},
      phone: {name: 'Phone', box: [11, 5.2, 11.6, 5.9, 2.1, 2.5], spot: [11.3, 4.1], face: 'fl', pri: 2},
      calendar: {name: 'Events calendar', box: [13.3, 0, 13.9, .2, 2, 2.9], spot: [13.3, 1.3], face: 'br'},
      notice: {name: 'Noticeboard', box: [10.8, 0, 13.2, .2, 2.4, 4], spot: [12, 1.4], face: 'br'},
      bench: {name: 'Wooden bench', box: [.4, 5.3, 1.5, 8.1, 0, 2], spot: [2.1, 6.7], face: 'bl'},
      window: {name: 'Window', box: [6.2, 0, 9.6, .3, 1.8, 5.1], spot: [7.9, 1.4], face: 'br'},
      shelves: {name: 'Fiction shelves', box: [3.2, 2.4, 5.8, 3.3, 0, 3.2], spot: [4.5, 3.9], face: 'br'},
      armchair: {name: 'Armchair', box: [3.2, 7.8, 5, 9.6, 0, 1.7], spot: [5.5, 7.6], face: 'bl', pri: -1},
      door: {name: 'Library door', box: [0, 8.2, .3, 10, 0, 4.2], spot: [1.2, 9.1], face: 'bl'},
      signSpot: {name: 'Reading-corner wall', box: [0, 5.6, .3, 7.8, 3, 4.4], spot: [2.2, 6.6], face: 'bl'},
    },
    seats: {bench: {x: 1, y: 6.7, dir: 'fr', seat: 30}, armchair: {x: 4.1, y: 8.8, dir: 'fl', seat: 32}},
    lights: [
      {kind: 'window', x: 6.2, w: 3.4, len: 8},
      {x: 8, y: 1.6, z: 0, r: 4, color: '#ffe0b0', i: .35, day: true},
      {x: 3, y: 6.5, z: 4, r: 5, color: '#ffd9a0', i: .5, bulb: 1.6, bz: 5.4},
      {x: 10.5, y: 4, z: 4, r: 4, color: '#fff0d8', i: .3},
    ],
    tick(W, dt) { if (!W.light.night && Math.random() < dt * 7) W.emit('dust', 6.5 + Math.random() * 5, .8 + Math.random() * 6, Math.random() * 4, 1, {vz: .02, vx: -.04, life: 4.5}); },
  };

  /* ===== Walt and June's house ===== */
  L.waltHouse = {
    w: 15, d: 9, wallH: 5.4, slab: '#3d3440',
    floor: {type: 'planks', color: '#b39070', zones: [{type: 'tiles', color: '#e8dcc6', alt: '#cdbd9f', x: 0, y: 0, w: 5.2, d: 3}, {type: 'concrete', color: '#a7a29a', x: 10.2, y: 0, w: 4.8, d: 9}]},
    wall: {color: '#e8dcc0', cap: '#5a4a50', pattern: 'dots'}, wallL: {color: '#dacdb0', cap: '#5a4a50', pattern: 'dots'},
    walls: [
      {type: 'cabinets', wall: 'R', at: .3, w: 4.6, z: 3.3, h: 1.2, color: '#c6b48f'}, {type: 'splash', wall: 'R', at: .3, w: 4.6, z: 2.25, h: 1, color: '#e6ece6'},
      {type: 'window', wall: 'R', at: 5.4, w: 2.4, z: 1.9, h: 2.5, view: 'trees', curtain: '#a8c3a0', open: .7},
      {type: 'calendar', id: 'calendar', wall: 'R', at: 8.3, w: .9, z: 2.6, h: 1.2, color: '#3c5f8a', marks: [{d: 6, r: 2, c: '#c0392b'}, {d: 3, r: 1, c: '#3c5f8a'}]},
      {type: 'frame', wall: 'R', at: 8.1, w: 1.2, z: 4.1, h: .8, art: 'child', mat: false, frame: '#f0d9a8'},
      {type: 'pegboard', wall: 'R', at: 10.6, w: 4, z: 2.4, h: 2.4},
      {type: 'frame', wall: 'L', at: 2.2, w: 1.6, z: 2.8, h: 1.1, art: 'photo', people: ['#3c5f8a', '#8a7bb0', '#e07a5f', '#5b8c5a']},
      {type: 'hooks', wall: 'L', at: 5.7, w: 1, z: 3.6, coats: ['#8a7bb0', '#5a4a3a']},
      {type: 'door', id: 'frontDoor', wall: 'L', at: 6.9, w: 1.8, color: '#3c5f8a', beyond: '#b7d0b0'},
    ],
    items: [
      {type: 'counter', x: .3, y: .3, w: 4.7, d: 1.2, color: '#e9e2d2', top: '#7a5a42', parts: [{kind: 'kettle', at: .4, id: 'kettle', color: '#c0392b'}, {kind: 'sink', at: 1.4}, {kind: 'radio', at: 3.1}, {kind: 'fruit', at: 4}]},
      {id: 'drawers', type: 'drawers', x: .3, y: 2.6, w: .9, d: 1.8, h: 1.8, face: 'E', color: '#8a6447'},
      {type: 'table', x: 3, y: 3.9, w: 2.2, d: 1.6, color: '#9b6b45', cloth: '#e9c46a'},
      {type: 'chair', x: 2.1, y: 4.25, face: 'E', cushion: '#a33b2e'}, {type: 'chair', x: 5.3, y: 4.25, face: 'W'},
      {type: 'rug', x: 5.6, y: 5.6, w: 3.8, d: 2.6, color: '#8a5a4a', trim: '#e0c068'},
      {type: 'armchair', x: 7.2, y: 5.7, w: 1.9, d: 1.8, color: '#6b8f71', face: 'S'},
      {type: 'sidetable', x: 9.3, y: 6, w: .7, d: .7},
      {type: 'cane', x: .35, y: 5.6, w: .1, d: .1, block: false},
      {type: 'workbench', x: 10.8, y: .4, w: 3.8, d: 1.3},
      {id: 'rocker', type: 'rocker', x: 11.8, y: 3.2, w: 1.4, d: 1.1},
      {type: 'wood', x: 13.2, y: 5.4, w: 1.6, d: 1.2},
      {type: 'shavings', x: 10.6, y: 1.8, w: 4, d: 3.2},
      {type: 'stool', x: 10.9, y: 2.3, w: .7, d: .7},
      {id: 'wProps', type: 'prop', x: 3, y: 3.9, w: 2.2, d: 1.6, z: 1.56, layer: 1, block: false, draw(ctx, W) { const s = W.state; BF.art.prop.cup(ctx, 3.4, 4.3, 1.56, '#f2efe8', {full: true}); if ((s.tea2 || {}).here) BF.art.prop.cup(ctx, 4.6, 4.6, 1.56, '#81b29a', {full: true}); if ((s.paper || {}).here) BF.art.prop.note(ctx, 3.9, 4.7, 1.56); if ((s.cards || {}).out) BF.art.prop.cards(ctx, 4.5, 4.1, 1.56); }},
    ],
    objects: {
      walt: {name: 'Walt', actor: 'walt', box: [2.1, 4.25, 3, 5.15, 0, 3.2], spot: [5.75, 4.7], face: 'bl', pri: 3},
      june: {name: 'June', actor: 'june', box: [0, 0, 0, 0, 0, 0], spot: [0, 0], hidden: true},
      kettle: {name: 'Kettle', box: [.6, .4, 1.4, 1.2, 1.8, 2.5], spot: [1.0, 2.0], face: 'br'},
      calendar: {name: 'Calendar', box: [8.3, 0, 9.2, .2, 2.6, 3.8], spot: [8.8, 1.3], face: 'br'},
      drawer: {name: 'Drawer', box: [.3, 2.6, 1.2, 4.4, 0, 1.9], spot: [1.9, 3.4], face: 'bl'},
      photo: {name: 'Family photo', box: [0, 2.2, .2, 3.8, 2.8, 3.9], spot: [1.9, 3.0], face: 'bl'},
      rocker: {name: 'Small rocking chair', box: [11.8, 3.2, 13.2, 4.3, 0, 2.1], spot: [12.5, 4.9], face: 'br'},
      bench: {name: 'Workbench', box: [10.8, .4, 14.6, 1.7, 0, 2.4], spot: [12.6, 2.4], face: 'br'},
      pegboard: {name: 'Tools', box: [10.6, 0, 14.6, .2, 2.4, 4.8], spot: [11.6, 2.3], face: 'br'},
      door: {name: 'Front door', box: [0, 6.9, .3, 8.7, 0, 4.2], spot: [1.0, 7.8], face: 'bl'},
      window: {name: 'Window', box: [5.4, 0, 7.8, .3, 1.9, 4.4], spot: [6.6, 1.3], face: 'br'},
    },
    seats: {walt: {x: 2.55, y: 4.7, dir: 'fr', seat: 30}, mara: {x: 5.75, y: 4.7, dir: 'bl', seat: 30}, stool: {x: 11.25, y: 2.65, dir: 'fr', seat: 34}, armchair: {x: 8.15, y: 6.85, dir: 'fl', seat: 32}},
    lights: [
      {kind: 'window', x: 5.4, w: 2.4, len: 6},
      {x: 6.5, y: 1.6, z: 0, r: 3.5, color: '#fff0d6', i: .3, day: true},
      {x: 12.6, y: 2, z: 4, r: 5, color: '#fff3dc', i: .45, bulb: 1.2, bz: 5.2},
      {x: 4, y: 4.5, z: 4, r: 4, color: '#ffe2b8', i: .35, bulb: 1, bz: 5},
    ],
    tick(W, dt) { const k = W.state.kettle || {}; if (k.boiling && Math.random() < dt * 14) W.emit('steam', 1.0, .9, 2.45, 1, {vz: .7, life: 1.6}); const s = W.state.sanding || {}; if (s.on && Math.random() < dt * 12) W.emit('shaving', 12.5, 3.6, 1.4, 1, {vz: .2, vx: (Math.random() - .5) * .6, vy: .4, life: 1}); },
  };
  return L;
})();
