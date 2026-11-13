// sleep: scene drawings, split across workers. Each part file does Object.assign(SC, { scene_id: (lt, D, on, t) => svg, ... }).
// Ranges (scene index in script.json): sc_A.js 0-14 (H2), sc_B.js 15-28 (H3), sc_C.js 29-42 (H4). Shared look lives in ../ink.js (H1).
const SC = {};
const SCENE_PARTS = ['sc_A.js', 'sc_B.js', 'sc_C.js'];
