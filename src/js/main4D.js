import { Forme } from "./forme.js";
import { Projection3D } from "./projection3D.js";
import { FaceCarre } from "./faceCarre.js";
import { initControls, registerProjection } from "./controls4D.js";


// Récupération des canvas
const canvas3D = document.getElementById("renderCanvas3D");
const containerCanvas = document.getElementById("container");

// Création des moteurs Babylon
const engine3D = new BABYLON.Engine(canvas3D, true);

// Variable globale pour la forme 3D et la camera
// Scene
let scene;

// Cameras
let camera3D;
let camera2D;

// Formes
let forme4D;
let projection3D;

let nbProjections = 0;
let canvasCamera = new Map();

let projections = [];






/**
 * Méthode qui initialise la caméra 3D (orbitale) et la lumière
 * @param {BABYLON.Scene} scene 
 */
function initCamera3D(scene) {
  camera3D = new BABYLON.ArcRotateCamera(
    "Camera3D",
    -Math.PI / 2,
    Math.PI / 2,
    8,
    BABYLON.Vector3.Zero(),
    scene
  );

  camera3D.attachControl(canvas3D, true);
  new BABYLON.HemisphericLight("light3D", new BABYLON.Vector3(1, 1, 0), scene);
}






/**
 * Méthode qui initialise la caméra 2D (orthographique) et la lumière
 * @param {BABYLON.Scene} scene 
 */
function initCamera2D(scene, axe) {

  let v;
  let l;
  switch (axe) {
    case 'x': v = new BABYLON.Vector3(-10, 0, 0); l = new BABYLON.Vector3(-10, 5, 5); break;
    case 'y': v = new BABYLON.Vector3(0, -10, 0); l = new BABYLON.Vector3(5, -10, 5); break;
    case 'z': v = new BABYLON.Vector3(0, 0, -10); l = new BABYLON.Vector3(5, 5, -10); break;
    case 'w': v = new BABYLON.Vector3(-10, 0, 0); l = new BABYLON.Vector3(-10, 5, 5); break;
  }

  camera2D = new BABYLON.FreeCamera(
    "Camera2D",
    v,
    scene
  );
  camera2D.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
  camera2D.setTarget(BABYLON.Vector3.Zero());

  updateOrthoCamera();

  new BABYLON.HemisphericLight(
    "light2D",
    l,
    scene
  );

  return camera2D;

}






/**
 * Méthode qui met à jour les paramètres de la caméra orthographique
 */
function updateOrthoCamera() {

  for (const [key, value] of canvasCamera) {

    let canvas = key;
    let camera = value;

    const ratio = canvas.clientWidth / canvas.clientHeight;

    camera.orthoLeft   = -ratio;
    camera.orthoRight  =  ratio;
    camera.orthoTop    =  1;
    camera.orthoBottom = -1;

  }
}






/**
 * Fonction qui crée et retourne la scène
 */
function createScene() {
    scene = new BABYLON.Scene(engine3D);
    initCamera3D(scene);

    forme4D = Forme.loadHyperCubeFromCenter("Hypercube", BABYLON.Vector4.Zero(), 1);

  let clone = forme4D.getClone();
  projection3D = new Projection3D("Projection3D-Main", clone.sommets, clone.aretes, camera3D, 'w');

  addFaces(projection3D);
  addCells(projection3D);

  // lien parent
  projection3D.formeParente = forme4D;

  // build + première mise à jour
  projection3D.build(scene);
  projection3D.update();

  // (optionnel mais recommandé si vos contrôles attendent un register)
  registerProjection(projection3D);
  projections.push(projection3D);


  addProjection3D(forme4D, 'z');
  addProjection3D(forme4D, 'y');
  addProjection3D(forme4D, 'x');
  addProjection3D(forme4D, 'w');
}






/**
 * Méthde qui créé et affiche une nouvelle projection 2D d'une forme 3D sur un axe donné
 * @param {Forme} forme3D Forme 3D dont on veut afficher une projection 2D
 * @param {String} axe x, y, z ou w  
 */
function addProjection3D(forme4D, axe) {

    const sidebar = document.getElementById("sidebar-2d");
    let newCanvas = document.createElement("canvas");
    newCanvas.id = `renderCanvas2D-${++nbProjections}`;
    newCanvas.className = "canvas2D";
    sidebar.appendChild(newCanvas);
    
    // Initialisation du moteur
    let engine2D = new BABYLON.Engine(newCanvas, true);
    let scene2D = new BABYLON.Scene(engine2D);
    
    engine2D.resize();

    let localCamera2D = initCamera2D(scene2D, axe);
    
    // Mise à jour de la caméra visualisant la projection
    const ratio = newCanvas.clientWidth / newCanvas.clientHeight;
    localCamera2D.orthoLeft = -ratio;
    localCamera2D.orthoRight = ratio;
    localCamera2D.orthoTop = 1;
    localCamera2D.orthoBottom = -1;

    canvasCamera.set(newCanvas, localCamera2D);

    const clone = forme4D.getClone();
    const maProjection = new Projection3D(
      `Projection3D-${axe}`,
      clone.sommets,
      clone.aretes,
      localCamera2D,
      axe
    );

    addFaces(maProjection);
    addCells(maProjection);

    maProjection.formeParente = forme4D;
    maProjection.build(scene2D);
    
    registerProjection(maProjection);
    projections.push(maProjection);

    engine2D.runRenderLoop(() => {
  maProjection.update();   // applique la projection avant rendu
  scene2D.render();
});


    window.addEventListener("resize", () => {
        engine2D.resize();
        const r = newCanvas.clientWidth / newCanvas.clientHeight;
        localCamera2D.orthoLeft = -r;
        localCamera2D.orthoRight = r;
    });
}


/**
 * Méthode qui créé et affiche les faces des cubes 4D
 * @param {Projection3D} projection projection sur laquelle iront les faces
 * @returns 
 */
function addFaces(projection) {
  if (!projection || (projection.faces && projection.faces.length > 0)) return;

  const facesName = new Map(projection.sommets.map((s) => [s.name, s]));
  projection.faces = projection.faces || [];

  // cubes à projeter
  const cubes = [
    ["A", "B", "C", "D", "E", "F", "G", "H"], // cube de base
    ["A'", "B'", "C'", "D'", "E'", "F'", "G'", "H'"] // cube 4D
  ];

  // créé une face à partir de noms des sommets
  const createQuad = (s1Name, s2Name, s3Name, s4Name) => {
    return new FaceCarre(
      `${s1Name}${s2Name}${s3Name}${s4Name}`,
      facesName.get(s1Name),
      facesName.get(s2Name),
      facesName.get(s3Name),
      facesName.get(s4Name)
    );
  };

  // pour chaque cube de base et 4D
  cubes.forEach((vertexNames) => {
    // on vérifie que tous les sommets existent
    if (!vertexNames.every((name) => facesName.has(name))) return;

    // on assigne des noms aux sommets
    const [A, B, C, D, E, F, G, H] = vertexNames;

    // face bas
    projection.faces.push(createQuad(A, B, C, D));
    // face haut
    projection.faces.push(createQuad(E, F, G, H));

    // faces sur les côtés
    projection.faces.push(createQuad(A, B, F, E));
    projection.faces.push(createQuad(B, C, G, F));
    projection.faces.push(createQuad(C, D, H, G));
    projection.faces.push(createQuad(D, A, E, H));
  });
}

/**
 * Méthode qui créé et affiche les fils des cubes 4D
 * @param {Projection3D} projection projection sur laquelle iront les fils
 * @returns 
 */
function addCells(projection) {
  if (!projection) return;

  projection.faces = projection.faces || [];
  // on associe les noms des sommets à leurs objets
  const facesName = new Map(projection.sommets.map((s) => [s.name, s]));

  // faces du cubes
  const baseFaces = [
    ["A", "B", "C", "D"],
    ["E", "F", "G", "H"],
    ["A", "B", "F", "E"],
    ["B", "C", "G", "F"],
    ["C", "D", "H", "G"],
    ["D", "A", "E", "H"],
  ];

  const allHave = (names) => names.every((n) => facesName.has(n));

  // créé une face à partir de noms des sommets
  const quad = (n1, n2, n3, n4, name) => new FaceCarre(name, facesName.get(n1), facesName.get(n2), facesName.get(n3), facesName.get(n4));

  baseFaces.forEach((face) => {
    // faces du cube 4D
    const primes = face.map((n) => `${n}'`);
    if (!allHave([...face, ...primes])) return;

    const [a, b, c, d] = face;
    const [ap, bp, cp, dp] = primes;

    // création des faces sur les côtés de l'hypercube
    projection.faces.push(
      quad(a, ap, bp, b, `${a}${ap}${bp}${b}`),
      quad(b, bp, cp, c, `${b}${bp}${cp}${c}`),
      quad(c, cp, dp, d, `${c}${cp}${dp}${d}`),
      quad(d, dp, ap, a, `${d}${dp}${ap}${a}`)
    );
  });
}






// Création de la scène
createScene();
initControls({ forme4D, projectionPrincipale: projection3D, camera3D, scene3D: scene });

// Boucle de rendu 3D
engine3D.runRenderLoop(() => {
  scene.render();
});






export {
  forme4D,
};