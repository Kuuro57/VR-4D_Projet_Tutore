import { Forme } from "./forme.js";
import { rotation3D } from "./transformations/rotations.js";
<<<<<<< HEAD
import { translation3D } from "./transformations/translations.js";
=======
import { homothetie3D } from "./transformations/homothetie.js";
>>>>>>> 153d9ad9e31166171d226f9af782bf6158c4e800

// Récupération du canvas
const canvas = document.getElementById("renderCanvas");

// Création du moteur Babylon
const engine = new BABYLON.Engine(canvas, true);



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



/**
 * Fonction qui crée et retourne la scène
 */
const createScene = () => {

    // Initialisation de la scène
    const scene = new BABYLON.Scene(engine);
    initCamera(scene);

    // Chargement du cube depuis le fichier JSON

    // let cube = Forme.load('../data/cube.json').then(cube => {
    //     cube.build(scene);
    // });

    let cube = Forme.loadCubeFromCenter("CubeCenter", new BABYLON.Vector3(0,0,0), 1);
    cube.build(scene);
    let cube2 = Forme.loadCubeFromCenter("CubeCenter", new BABYLON.Vector3(0,0,0), 1);
    cube2.build(scene);
    rotation3D(cube, "x", 45);
    translation3D(cube, new BABYLON.Vector3(0,2,2));

    //rotation3D(cube, "x", 45);
    homothetie3D(cube, 10);

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