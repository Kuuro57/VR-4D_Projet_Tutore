import { Forme } from "../formes/forme.js";
import { createControlActions, initVRControlPanel3D, addVRControls } from "./vrcontrols.js";

const canvas = document.getElementById("renderCanvas3D");
const engine = new BABYLON.Engine(canvas, true);

const createScene = async () => {
  const scene = new BABYLON.Scene(engine);

  const camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 1.6, -3), scene);
  camera.setTarget(new BABYLON.Vector3(0, 1.6, 0));
  camera.attachControl(canvas, true);

  const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
  light.intensity = 0.9;

  const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);

  const forme3D = Forme.loadCubeFromCenter("Cube", new BABYLON.Vector3(0, 1.6, 1), 0.5);
  forme3D.build(scene);

  const viewState     = { facesVisible: true, wireVisible: true };
  const controlActions = createControlActions(forme3D, viewState);
  const panelMesh      = initVRControlPanel3D(scene, controlActions);

  const xr = await scene.createDefaultXRExperienceAsync({
    floorMeshes: [ground],
  });

  if (xr.pointerSelection) {
    xr.pointerSelection.attach();
  }

  addVRControls(xr, scene, forme3D, viewState, panelMesh, controlActions);

  return scene;
};

createScene().then((scene) => {
  engine.runRenderLoop(() => scene.render());
});

window.addEventListener("resize", () => engine.resize());