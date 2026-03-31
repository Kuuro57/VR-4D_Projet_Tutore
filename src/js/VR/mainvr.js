import { Forme } from "../formes/forme.js";
import { Projection3D } from "../4D/projection3D.js";
import { linkControls } from "../controls.js";
import { createControlActions, initVRControlPanel3D, addVRControls } from "./vrcontrols.js";

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
  camera.setTarget(new BABYLON.Vector3(0, 1.6, 2));
  camera.attachControl(canvas, true);

  const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
  light.intensity = 0.9;

  const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);

  const forme4D = Forme.loadHyperCubeFromCenter("Cube", new BABYLON.Vector4(0, 1.6, 3, 0), 1);

  // Ajout des projections de la forme principale
  addProjection3D(forme4D, 'w', new BABYLON.Vector3(3, 1.6, 0), scene);
  addProjection3D(forme4D, 'x', new BABYLON.Vector3(-3, 1.6, 0), scene);
  addProjection3D(forme4D, 'y', new BABYLON.Vector3(0, 1.6, -3), scene);
  addProjection3D(forme4D, 'z', new BABYLON.Vector3(0, 1.6, 3), scene);

  const viewState     = { facesVisible: true, wireVisible: true };
  const controlActions = createControlActions(forme4D, viewState);
  const panelMesh      = initVRControlPanel3D(scene, controlActions);

  const xr = await scene.createDefaultXRExperienceAsync({
    floorMeshes: [ground],
  });

  if (xr.pointerSelection) {
    xr.pointerSelection.attach();
  }


  linkControls(forme4D);
  addVRControls(xr, scene, forme4D, viewState, panelMesh, controlActions);

  return scene;
};




/**
 * Créé une projection orthogonale de la forme4D sur le plan défini par axis
 * et place cette projection à la position donnée (Vector3)
 * @param {*} forme3D 
 * @param {*} axis 
 * @param {*} position 
 */
function addProjection3D(forme4D, axis, position) {

  const clone = forme4D.getClone();

  const maProjection = new Projection3D(
    `Projection3D-${axis}`,
    clone.sommets,
    clone.aretes,
    clone.faces,
    camera,
    axis,
    true,
    position
  );

  console.log(maProjection.sommets);

  maProjection.formeParente = forme4D;
  forme4D.projection3D.push(maProjection);

  maProjection.build(scene);

  addTextAboveMesh(position, axis);

}





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