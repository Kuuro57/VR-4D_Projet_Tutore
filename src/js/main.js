import { Arete } from "./arete.js";

// Récupération du canvas
const canvas = document.getElementById("renderCanvas");

// Création du moteur Babylon
const engine = new BABYLON.Engine(canvas, true);

// Référence du cube qui doit tourner
let rotatingCubeRoot = null;

/**
 * Crée un cube "filaire" (tubes + sphères) regroupé sous un TransformNode
 */
function createWireCube(scene, name, position) {
  const root = new BABYLON.TransformNode(name, scene);
  root.position = position.clone ? position.clone() : new BABYLON.Vector3(position.x, position.y, position.z);

  // Matériau des arêtes
  const edgesMat = new BABYLON.StandardMaterial(`${name}_edgesMat`, scene);
  edgesMat.diffuseColor = BABYLON.Color3.Blue();

  // Points des carrés (faces Z=0 et Z=1)
  const carre = [
    new BABYLON.Vector3(0, 0, 0),
    new BABYLON.Vector3(1, 0, 0),
    new BABYLON.Vector3(1, 1, 0),
    new BABYLON.Vector3(0, 1, 0),
    new BABYLON.Vector3(0, 0, 0),
  ];
  const carre2 = carre.map(v => v.add(new BABYLON.Vector3(0, 0, 1)));

  var arrete1 = new Arete("a1", new BABYLON.Vector3(0, 0, 0), new BABYLON.Vector3(1, 0, 0));
  arrete1.build(scene);

  // Coins (8 sommets)
  const positions = [
    [0, 0, 0], [0, 0, 1],
    [0, 1, 0], [0, 1, 1],
    [1, 0, 0], [1, 0, 1],
    [1, 1, 0], [1, 1, 1],
  ];

  // Couleur "par face" (priorité Z > Y > X)
  const colorFor = (x, y, z) => {
    if (z === 0) return BABYLON.Color3.Red();      // face avant
    if (z === 1) return BABYLON.Color3.Green();    // face arrière
    if (y === 0) return BABYLON.Color3.Blue();     // bas
    if (y === 1) return BABYLON.Color3.Yellow();   // haut
    if (x === 0) return BABYLON.Color3.Magenta();  // gauche
    if (x === 1) return BABYLON.Color3.Cyan();     // droite
    return BABYLON.Color3.White();
  };

  positions.forEach((pos, i) => {
    const sphere = BABYLON.MeshBuilder.CreateSphere(`${name}_sphere${i}`, { diameter: 0.2, segments: 32 }, scene);
    sphere.position.set(pos[0], pos[1], pos[2]);

    const mat = new BABYLON.StandardMaterial(`${name}_sphereMat${i}`, scene);
    mat.diffuseColor = colorFor(pos[0], pos[1], pos[2]);

    sphere.material = mat;
    sphere.parent = root;
  });

  return root;
}

// Fonction qui crée et retourne la scène
const createScene = () => {
  const scene = new BABYLON.Scene(engine);

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

  // --- Deux cubes côte à côte ---
  const cube1 = createWireCube(scene, "cube1", new BABYLON.Vector3(0, 0, 0));
  const cube2 = createWireCube(scene, "cube2", new BABYLON.Vector3(2.5, 0, 0));

  // Celui qui tourne = cube1
  rotatingCubeRoot = cube1;

  return scene;
};

// Création de la scène
const scene = createScene();

// Bouton : rotation uniquement du cube1
let rotating = false;
document.getElementById("rotateBtn").addEventListener("click", () => {
  if (!rotatingCubeRoot || rotating) return;
  rotating = true;

  const step = Math.PI / 2; // 90°
  const fps = 60;
  const durationFrames = 20;

  const anim = new BABYLON.Animation(
    "cubeRotY",
    "rotation.y",
    fps,
    BABYLON.Animation.ANIMATIONTYPE_FLOAT,
    BABYLON.Animation.ANIMATIONLOOPMODE_CONSTANT
  );
  
  const from = rotatingCubeRoot.rotation.y;
  const to = from + step;

  anim.setKeys([
    { frame: 0, value: from },
    { frame: durationFrames, value: to },
  ]);

  const animatable = scene.beginDirectAnimation(rotatingCubeRoot, [anim], 0, durationFrames, false);
  animatable.onAnimationEnd = () => { rotating = false; };
});

// Boucle de rendu
engine.runRenderLoop(() => {
  scene.render();
});

// Redimensionnement
window.addEventListener("resize", () => {
  engine.resize();
});