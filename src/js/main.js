import { Forme } from "./forme.js";
import { Projection2D } from "./projection2D.js";


// Récupération des canvas
const canvas3D = document.getElementById("renderCanvas3D");
const canvas2D = document.getElementById("renderCanvas2D");

// Création des moteurs Babylon
const engine3D = new BABYLON.Engine(canvas3D, true);
const engine2D = new BABYLON.Engine(canvas2D, true);

//Variables globales
// Scenes
let scene;
let scene2D;

// Cameras
let camera;
let camera2D;

// Formes
let forme3D;


/**
 * Fonction qui initialise une caméra mobile et la lumière dans l'espace Babylon
 * @param {BABYLON.Scene} scene Scène sur laquelle on veut initialiser la caméra
 */
function initCamera(scene) {
    
    // --- CAMERA & LUMIÈRE ---
    camera = new BABYLON.ArcRotateCamera(
        "Camera",
        -Math.PI / 2,
        Math.PI / 2,
        8,
        new BABYLON.Vector3(1.5, 0.5, 0.5), // vise entre les 2 cubes
        scene
    );
    camera.attachControl(canvas, true);

    new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);
}



/**
 * Fonction qui initialise une caméra fixe et la lumière dans l'espace Babylon
 * @param {BABYLON.Scene} scene Scène sur laquelle on veut initialiser la caméra
 */
function initCameraFixed(scene) {
  
  camera = new BABYLON.FreeCamera(
    "FixedCamera",
    new BABYLON.Vector3(-3, 2, -5),
    scene
  );
  camera.setTarget(new BABYLON.Vector3(0, 0, 0));

  new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);
}

function initCamera3D(scene) {
  camera = new BABYLON.ArcRotateCamera(
    "Camera3D",
    -Math.PI / 2,
    Math.PI / 2,
    8,
    BABYLON.Vector3.Zero(),
    scene
  );

  camera.attachControl(canvas3D, true);
  new BABYLON.HemisphericLight("light3D", new BABYLON.Vector3(1, 1, 0), scene);
}

function initCamera2D(scene) {
  camera2D = new BABYLON.FreeCamera(
    "Camera2D",
    new BABYLON.Vector3(0, 0, -10),
    scene
  );
  camera2D.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;

  const d = 5;
  camera2D.orthoLeft = -d;
  camera2D.orthoRight = d;
  camera2D.orthoTop = d;
  camera2D.orthoBottom = -d;

  camera2D.setTarget(BABYLON.Vector3.Zero());
}


/**
 * Fonction qui crée et retourne la scène
 */
function createScene() {

        // --- SCENE 3D ---
    scene = new BABYLON.Scene(engine3D);
    initCamera3D(scene);

    forme3D = Forme.loadCubeFromCenter("Cube", BABYLON.Vector3.Zero(), 1);
    forme3D.build(scene);

    // --- SCENE 2D ---
    scene2D = new BABYLON.Scene(engine2D);
    initCamera2D(scene2D);

    // --- PROJECTION 2D ---
    const clone = forme3D.getClone();

    forme3D.projection2D = new Projection2D(
      "Cube2D",
      clone.sommets,
      clone.aretes,
      camera2D
    );

    forme3D.projection2D.formeParente = forme3D;
    forme3D.projection2D.build(scene2D);

};

// Création de la scène
createScene();

// Boucle de rendu 3D
engine3D.runRenderLoop(() => {
  scene.render();
});

// Boucle de rendu 2D
engine2D.runRenderLoop(() => {
  scene2D.render();
});

// Redimensionnement
window.addEventListener("resize", () => {
  engine3D.resize();
  engine2D.resize();
});



export {
  forme3D,
  camera,
  scene
};