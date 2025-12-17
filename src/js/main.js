import { Forme } from "./forme.js";
import { projection2D, projection3D } from "./projection/projections.js";


// Récupération du canvas
const canvas = document.getElementById("renderCanvas");

// Création du moteur Babylon
const engine = new BABYLON.Engine(canvas, true);

// Variable globale pour la forme 3D et la camera
var forme4D
var forme3D;
var camera;
var scene;



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
 * Fonction qui crée et retourne la scène
 */
const createScene = () => {

    // Initialisation de la scène
    scene = new BABYLON.Scene(engine);
    initCameraFixed(scene);

    // Chargement du cube depuis le fichier JSON

    // let cube = Forme.load('../data/cube.json').then(cube => {
    //     cube.build(scene);
    // });

    forme3D = Forme.loadCubeFromCenter("CubeCenter", new BABYLON.Vector3(0,0,0), 1);
    forme3D.build(scene);
    projection2D(forme3D, camera);

    //forme4D = Forme.loadHyperCubeFromCube("Hypercube", new BABYLON.Vector4(0,0,0,0), 1);
    //projection3D(forme4D, camera);
    //console.log(forme4D);

    return scene;

};

// Création de la scène
scene = createScene();

// Boucle de rendu
engine.runRenderLoop(() => {
  scene.render();
});

// Redimensionnement
window.addEventListener("resize", () => {
  engine.resize();
});



// Export
export {
  forme3D,
  camera,
  scene
};