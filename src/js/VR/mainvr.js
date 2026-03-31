// ../js/4D/mainvr.js
import { Forme } from "../formes/forme.js";
import { translation } from "../transformations/translations.js";
import { rotation3D } from "../transformations/rotations.js";
import { homothetie } from "../transformations/homothetie.js";
import { Projection3D } from "../4D/projection3D.js";
import { linkControls } from "../controls.js";

const canvas = document.getElementById("renderCanvas3D");
const engine = new BABYLON.Engine(canvas, true);

var camera = null;
var scene = null;





function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}





function addVRControls(xr, scene, forme3D) {
  // Réglages (à ajuster)
  const moveSpeed = 0.04;     // translation par frame (m)
  const rotSpeed  = 0.02;     // rotation par frame (rad-ish selon votre implémentation)
  const scaleUp   = 1.01;
  const scaleDown = 0.99;

  let faceIsVisible = true;
  let wireIsVisible = true;

  // Anti-spam toggle boutons
  const buttonLatch = new Map(); // key: uniqueId+buttonIndex => bool

  function getPressedOnce(ctrlId, buttonIndex, isPressedNow) {
    const key = `${ctrlId}:${buttonIndex}`;
    const prev = buttonLatch.get(key) || false;
    buttonLatch.set(key, isPressedNow);
    return isPressedNow && !prev;
  }

  // Pour distinguer main gauche/droite
  const controllers = {
    left: null,
    right: null,
  };

  xr.input.onControllerAddedObservable.add((xrController) => {
    // On écoute quand le gamepad est prêt
    xrController.onMotionControllerInitObservable.add((motionController) => {
      const handness = motionController.handedness; // "left" | "right"
      if (handness === "left") controllers.left = motionController;
      if (handness === "right") controllers.right = motionController;

      console.log("Motion controller:", handness, motionController);
    });
  });

  // Lecture des inputs à chaque frame
  scene.onBeforeRenderObservable.add(() => {
    // ✅ Toujours mettre à jour la forme
    forme3D.update();

    // ---------- LEFT (translation + quelques boutons) ----------
    const left = controllers.left;
    if (left) {
      // Axes du thumbstick (nom standard "xr-standard-thumbstick")
      const stick = left.getComponent("xr-standard-thumbstick");
      if (stick && stick.axes) {
        // axes: x = gauche/droite, y = haut/bas (souvent inversé selon device)
        const x = clamp(stick.axes.x, -1, 1);
        const y = clamp(stick.axes.y, -1, 1);

        // translation en X/Z (dans VOTRE repère)
        // y du stick: pousser vers l’avant => y négatif souvent, d’où le -y
        if (Math.abs(x) > 0.15) translation(forme3D, new BABYLON.Vector4(x * moveSpeed, 0, 0, 0));
        if (Math.abs(y) > 0.15) translation(forme3D, new BABYLON.Vector4(0, 0, -y * moveSpeed, 0));
      }

      // Boutons : A/X (selon main) / B/Y
      // Selon contrôleurs, ces composants existent : "a-button", "b-button", "x-button", "y-button"
      const a = left.getComponent("x-button") || left.getComponent("a-button");
      const b = left.getComponent("y-button") || left.getComponent("b-button");

      if (a) {
        const once = getPressedOnce(left.uniqueId, 100, !!a.pressed); // index virtuel 100
        if (once) {
          faceIsVisible = !faceIsVisible;
          forme3D.toggleFaces(faceIsVisible);
        }
      }
      if (b) {
        const once = getPressedOnce(left.uniqueId, 101, !!b.pressed);
        if (once) {
          wireIsVisible = !wireIsVisible;
          forme3D.toggleWireframe(wireIsVisible);
        }
      }
    }

    // ---------- RIGHT (rotation + scale via trigger/grip) ----------
    const right = controllers.right;
    if (right) {
      const stick = right.getComponent("xr-standard-thumbstick");
      if (stick && stick.axes) {
        const x = clamp(stick.axes.x, -1, 1);
        const y = clamp(stick.axes.y, -1, 1);

        // rotation simple 3D
        // stick.x => yaw (autour Y)
        if (Math.abs(x) > 0.15) {
          // Votre rotation3D(forme, 'y') applique un petit pas fixe.
          // On la répète selon l’intensité. Simple et efficace.
          const steps = Math.ceil(Math.abs(x) * 3);
          for (let i = 0; i < steps; i++) rotation3D(forme3D, "y");
        }

        // stick.y => pitch (autour X)
        if (Math.abs(y) > 0.15) {
          const steps = Math.ceil(Math.abs(y) * 3);
          for (let i = 0; i < steps; i++) rotation3D(forme3D, "x");
        }
      }

      // Trigger / Grip
      const trigger = right.getComponent("xr-standard-trigger");
      const squeeze = right.getComponent("xr-standard-squeeze");

      // trigger.value / squeeze.value existent souvent en [0..1]
      if (trigger && trigger.value > 0.2) {
        // agrandir proportionnellement
        const k = 1 + (trigger.value * 0.01);
        homothetie(forme3D, k);
      }
      if (squeeze && squeeze.value > 0.2) {
        const k = 1 - (squeeze.value * 0.01);
        homothetie(forme3D, k);
      }

      // Fallback si pas de value mais pressed
      if (trigger && trigger.pressed && !("value" in trigger)) homothetie(forme3D, scaleUp);
      if (squeeze && squeeze.pressed && !("value" in squeeze)) homothetie(forme3D, scaleDown);
    }
  });
}





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

  // Lumière
  const light = new BABYLON.HemisphericLight(
    "light1",
    new BABYLON.Vector3(0, 1, 0),
    scene
  );
  light.intensity = 0.9;

  // Sol + axes
  const ground = BABYLON.MeshBuilder.CreateGround("ground", { width: 10, height: 10 }, scene);

  // ✅ Votre forme
  const forme4D = Forme.loadHyperCubeFromCenter("Cube", new BABYLON.Vector4(0, 1.6, 3, 0), 1);

  // Ajout des projections de la forme principale
  addProjection3D(forme4D, 'w', new BABYLON.Vector3(3, 1.6, 0), scene);
  addProjection3D(forme4D, 'x', new BABYLON.Vector3(-3, 1.6, 0), scene);
  addProjection3D(forme4D, 'y', new BABYLON.Vector3(0, 1.6, -3), scene);
  addProjection3D(forme4D, 'z', new BABYLON.Vector3(0, 1.6, 3), scene);

  // XR
  const xr = await scene.createDefaultXRExperienceAsync({
    floorMeshes: [ground],
  });

  console.log("XR ready:", xr);

  // ✅ Contrôles VR
  addVRControls(xr, scene, forme4D);
  linkControls(forme4D);

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
