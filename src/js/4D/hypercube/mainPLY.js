import { Forme } from "../../formes/forme.js";
import { Projection3D } from "../projection3D.js";
import { linkControls } from "../../controls.js";

// Récupération des canvas
const canvas3D = document.getElementById("renderCanvas3D");

// Création du moteur Babylon
const engine3D = new BABYLON.Engine(canvas3D, true);

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
  new BABYLON.HemisphericLight("light2D", new BABYLON.Vector3(-0.5, -0.5, -0.5), scene);
  new BABYLON.HemisphericLight("light2D", new BABYLON.Vector3(0.5, 0.5, 0.5), scene);

}






/**
 * Méthode qui initialise la caméra 2D (orthographique) et la lumière
 * @param {BABYLON.Scene} scene 
 */
function initCamera2D(scene, axe) {

  let v;
  let l;
  switch (axe) {
    case 'x': v = new BABYLON.Vector3(-10, 0, 0); break;
    case 'y': v = new BABYLON.Vector3(0, -10, 0); break;
    case 'z': v = new BABYLON.Vector3(0, 0, -10); break;
    case 'w': v = new BABYLON.Vector3(-10, 0, 0); break;
  }

  camera2D = new BABYLON.FreeCamera(
    "Camera2D",
    v,
    scene
  );
  camera2D.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
  camera2D.setTarget(BABYLON.Vector3.Zero());

  updateOrthoCamera();

  new BABYLON.HemisphericLight("light2D", new BABYLON.Vector3(-0.5, -0.5, -0.5), scene);
  new BABYLON.HemisphericLight("light2D", new BABYLON.Vector3(0.5, 0.5, 0.5), scene);

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
async function createScene() {
    scene = new BABYLON.Scene(engine3D);
    initCamera3D(scene);

    let PLYfile = fetch("../data/croix4D.ply");
    Forme.loadVoxel4DFromPLY(PLYfile).then((data) => {
      console.log(data);
      forme4D = data;

      let clone = forme4D.getClone();

      // Projection principale : on ne recentre pas pour que les translations soient visibles
      projection3D = new Projection3D("Projection3D-Main", clone.sommets, clone.aretes, clone.faces, camera3D, 'w', false);

      // lien parent
      projection3D.formeParente = forme4D;

      // build + première mise à jour
      projection3D.build(scene);
      projection3D.update();

      projections.push(projection3D);


      addProjection3D(forme4D, 'z');
      addProjection3D(forme4D, 'y');
      addProjection3D(forme4D, 'x');
      addProjection3D(forme4D, 'w');

      linkControls(forme4D);

      // Boucle de rendu 3D
      engine3D.runRenderLoop(() => {
        projection3D.update();
        scene.render();
      });

      
    });

    
}



/**
 * Méthde qui créé et affiche une nouvelle projection 3D d'une forme 4D sur un axe donné
 * @param {Forme} forme4D Forme 4D dont on veut afficher une projection 3D
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
      axe,
      true
    );

    maProjection.formeParente = forme4D;
    forme4D.projection3D.push(maProjection);

    maProjection.build(scene2D);
    
    projections.push(maProjection);

    engine2D.runRenderLoop(() => {
      maProjection.update();
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






export {
  forme4D,
};