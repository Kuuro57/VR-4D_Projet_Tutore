import { Forme } from "./forme.js";
import { rotation3D } from "./transformations/rotations.js";
import { translation3D } from "./transformations/translations.js";
import { homothetie3D } from "./transformations/homothetie.js";


// Récupération du canvas
const canvas = document.getElementById("renderCanvas");

// Création du moteur Babylon
const engine = new BABYLON.Engine(canvas, true);

var forme3D; // Variable globale pour la forme 3D

/**
 * Fonction qui initialise la caméra et la lumière dans l'espace Babylon
 * @param {BABYLON.Scene} scene Scène sur laquelle on veut initialiser la caméra
 */
function initCamera(scene) {
    
    // --- CAMERA & LUMIÈRE ---
    const camera = new BABYLON.ArcRotateCamera(
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


function initCameraFixed(scene) {
  // Caméra fixe
  const camera = new BABYLON.FreeCamera(
    "FixedCamera",
    new BABYLON.Vector3(3, 3, -6),  // position (à ajuster)
    scene
  );

  // Elle regarde le centre de votre cube
  camera.setTarget(new BABYLON.Vector3(0.5, 0.5, 0.5));

  // Important : ne pas attacher de contrôles => caméra non déplaçable
  // camera.attachControl(canvas, true); // <-- surtout pas

  // Lumière
  new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);
}



/**
 * Fonction qui crée et retourne la scène
 */
const createScene = () => {

    // Initialisation de la scène
    const scene = new BABYLON.Scene(engine);
    initCameraFixed(scene);

    // Chargement du cube depuis le fichier JSON

    // let cube = Forme.load('../data/cube.json').then(cube => {
    //     cube.build(scene);
    // });

    forme3D = Forme.loadCubeFromCenter("CubeCenter", new BABYLON.Vector3(0,0,0), 1);
    forme3D.build(scene);

    return scene;

};

// Création de la scène
const scene = createScene();

// Boucle de rendu
engine.runRenderLoop(() => {
  scene.render();
});

// Redimensionnement
window.addEventListener("resize", () => {
  engine.resize();
});


export {forme3D};