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
  let origin = new BABYLON.Vector4(0, 0, 0, 0);
  let forme4D = Forme.loadHyperSphereFromCenter("Sphere", origin, 2, 8);
  let clone = forme4D.getClone();
  projection3D = new Projection3D(
    "Projection3D",
    clone.sommets,
    clone.aretes,
    [],
    camera3D,
    'w'
  );
  projection3D.formeParente = forme4D;
  forme4D.projection3D = [projection3D];
  projection3D.build(scene);
  projection3D.update();
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
      clone.faces,
      localCamera2D,
      axe
    );

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