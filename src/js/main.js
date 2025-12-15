import { Arete } from "./arete.js";
import { Sommet } from "./sommet.js";
import { Cube } from "./cube.js";

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

    // Initialisation des sommets
    var sommets = [
        new Sommet("s1", new BABYLON.Vector3(0, 0, 0)),
        new Sommet("s2", new BABYLON.Vector3(0, 0, 1)),
        new Sommet("s3", new BABYLON.Vector3(0, 1, 0)),
        new Sommet("s4", new BABYLON.Vector3(0, 1, 1)),
        new Sommet("s5", new BABYLON.Vector3(1, 0, 0)),
        new Sommet("s6", new BABYLON.Vector3(1, 0, 1)),
        new Sommet("s7", new BABYLON.Vector3(1, 1, 0)),
        new Sommet("s8", new BABYLON.Vector3(1, 1, 1))
    ];
    
    // Initialisation des aretes (pour former un cube)
    var aretes = [
        new Arete("a1", sommets[0], sommets[1]),
        new Arete("a2", sommets[0], sommets[2]),
        new Arete("a3", sommets[0], sommets[4]),
        new Arete("a4", sommets[1], sommets[3]),
        new Arete("a5", sommets[1], sommets[5]),
        new Arete("a6", sommets[2], sommets[3]),
        new Arete("a7", sommets[2], sommets[6]),
        new Arete("a8", sommets[3], sommets[7]),
        new Arete("a9", sommets[4], sommets[5]),
        new Arete("a10", sommets[4], sommets[6]),
        new Arete("a11", sommets[5], sommets[7]),
        new Arete("a12", sommets[6], sommets[7]),
    ];

    // Création du cube
    var cube = new Cube(sommets, aretes);
    cube.build(scene);

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