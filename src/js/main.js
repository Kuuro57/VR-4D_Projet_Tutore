import { Forme } from "./forme.js";
import { Projection2D } from "./projection2D.js";
import { projection2D, projection3D } from "./projection/projections.js";
import { initControls } from "./controls.js";


// Récupération des canvas
const canvas3D = document.getElementById("renderCanvas3D");
const canvas2D = document.getElementById("renderCanvas2D");

// Création des moteurs Babylon
const engine3D = new BABYLON.Engine(canvas3D, true);
const engine2D = new BABYLON.Engine(canvas2D, true);

// Variable globale pour la forme 3D et la camera
// Scene
let scene;
let scene2D;

// Cameras
let camera3D;
let camera2D;

// Formes
let forme3D;
let forme4D;


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
function initCamera2D(scene) {
  camera2D = new BABYLON.FreeCamera(
    "Camera2D",
    new BABYLON.Vector3(0, 0, -10),
    scene
  );
  camera2D.mode = BABYLON.Camera.ORTHOGRAPHIC_CAMERA;
  camera2D.setTarget(BABYLON.Vector3.Zero());

  updateOrthoCamera(camera2D, canvas2D);

  new BABYLON.HemisphericLight(
    "light2D",
    new BABYLON.Vector3(5, 5, -10),
    scene
  );
}

/**
 * Méthode qui met à jour les paramètres de la caméra orthographique
 * @param {BABYLON.Camera} camera 
 * @param {HTMLCanvasElement} canvas 
 * @param {number} d 
 */
function updateOrthoCamera(camera, canvas, d = 1) {
  const ratio = canvas.clientWidth / canvas.clientHeight;

  camera.orthoLeft   = -d * ratio;
  camera.orthoRight  =  d * ratio;
  camera.orthoTop    =  d;
  camera.orthoBottom = -d;
}

/**
 * Fonction qui crée et retourne la scène
 */
function createScene() {

        // --- SCENE 3D ---
    scene = new BABYLON.Scene(engine3D);
    initCamera3D(scene);

    forme3D = Forme.loadCubeFromCenter("Cube", BABYLON.Vector3.Zero(), 1);
    forme4D = Forme.loadHyperCubeFromCenter("Hypercube", BABYLON.Vector4.Zero(), 1);
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

    initControls({
      forme3D,
      forme4D,
      camera3D,
      camera2D,
      scene3D: scene,
      scene2D
    });


    return scene;

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

  if (camera2D) {
    updateOrthoCamera(camera2D, canvas2D);
  }
});


//Exports
export {
  forme3D,
  forme4D,
  scene,
  camera3D,
  camera2D,
  scene2D
};