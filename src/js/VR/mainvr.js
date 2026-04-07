import { Forme } from "../formes/forme.js";
import { linkControls } from "../controls.js";
import { initMenu } from "./vrcontrols.js";

var camera = null;
var scene = null;

const canvas = document.getElementById("renderCanvas3D");
const engine = new BABYLON.Engine(canvas, true);

const createScene = async () => {
  scene = new BABYLON.Scene(engine);

  // Caméra desktop (avant XR)
  camera = new BABYLON.FreeCamera(
    "camera1",
    new BABYLON.Vector3(0, 1.6, 0),
    scene
  );
  camera.setTarget(new BABYLON.Vector3(5, 1.6, 0));
  camera.attachControl(canvas, true);

  const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
  light.intensity = 0.9;

  const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);

  const forme4D = Forme.loadHyperCubeFromCenter("HyperCube", new BABYLON.Vector4(0, 1.6, 3, 0), 1);

  addTextAboveMesh(new BABYLON.Vector3(5, 1.6, 5), 'x');
  addTextAboveMesh(new BABYLON.Vector3(5, 1.6, 5 - (10 / 3)), 'y');
  addTextAboveMesh(new BABYLON.Vector3(5, 1.6, -5 + (10 / 3)), 'z');
  addTextAboveMesh(new BABYLON.Vector3(5, 1.6, -5), 'w');
  
  const xr = await scene.createDefaultXRExperienceAsync({
    floorMeshes: [ground],
  });

  if (xr.pointerSelection) {
    xr.pointerSelection.attach();
  }

  linkControls(forme4D);

  initMenu(xr, scene, camera, forme4D);

  return scene;
};





/**
 * Ajoute un texte au-dessus de la projection pour indiquer l'axe de projection
 * @param {*} position 
 * @param {*} axis 
 */
function addTextAboveMesh(position, axis) {

  // Support du texte
  const plane = BABYLON.MeshBuilder.CreatePlane("textPlane", { width: 1, height: 0.5 }, scene);
  plane.position = new BABYLON.Vector3(position.x, position.y + 1, position.z);
  
  plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

  // Configuration du GUI
  const advancedTexture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(plane, 1024, 512);
  
  // Le texte
  const textBlock = new BABYLON.GUI.TextBlock();
  textBlock.text = axis.toUpperCase();
  textBlock.color = "cyan";
  textBlock.fontSize = 200;
  textBlock.fontWeight = "bold";
  
  advancedTexture.addControl(textBlock);

}





createScene().then((scene) => {
  engine.runRenderLoop(() => scene.render());
});

window.addEventListener("resize", () => engine.resize());