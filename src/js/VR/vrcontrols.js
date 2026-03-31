import { translation } from "../transformations/translations.js";
import { rotation3D } from "../transformations/rotations.js";
import { homothetie } from "../transformations/homothetie.js";

function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}

export function createControlActions(forme3D, viewState) {
  const translationStep = 0.15;
  const rotationState = { x: false, y: false, z: false };

  function tickRotations() {
    if (rotationState.x) rotation3D(forme3D, "x");
    if (rotationState.y) rotation3D(forme3D, "y");
    if (rotationState.z) rotation3D(forme3D, "z");
  }

  return {
    tickRotations,

    translateXPlus:  () => translation(forme3D, new BABYLON.Vector4( translationStep, 0, 0, 0)),
    translateXMinus: () => translation(forme3D, new BABYLON.Vector4(-translationStep, 0, 0, 0)),
    translateYPlus:  () => translation(forme3D, new BABYLON.Vector4(0,  translationStep, 0, 0)),
    translateYMinus: () => translation(forme3D, new BABYLON.Vector4(0, -translationStep, 0, 0)),
    translateZPlus:  () => translation(forme3D, new BABYLON.Vector4(0, 0,  translationStep, 0)),
    translateZMinus: () => translation(forme3D, new BABYLON.Vector4(0, 0, -translationStep, 0)),

    rotateX: () => { rotationState.x = !rotationState.x; },
    rotateY: () => { rotationState.y = !rotationState.y; },
    rotateZ: () => { rotationState.z = !rotationState.z; },

    scaleUp:   () => homothetie(forme3D, 1.02),
    scaleDown: () => homothetie(forme3D, 0.98),

    toggleFaces: () => {
      viewState.facesVisible = !viewState.facesVisible;
      forme3D.toggleFaces(viewState.facesVisible);
    },
    toggleWireframe: () => {
      viewState.wireVisible = !viewState.wireVisible;
      forme3D.toggleWireframe(viewState.wireVisible);
    },
    reset: () => {
      forme3D.reset();
      rotationState.x = false;
      rotationState.y = false;
      rotationState.z = false;
      viewState.facesVisible = true;
      viewState.wireVisible  = true;
      forme3D.toggleFaces(true);
      forme3D.toggleWireframe(true);
    },
  };
}

export function initVRControlPanel3D(scene, actions) {
  const panelMesh = BABYLON.MeshBuilder.CreatePlane(
    "vr-controls-panel",
    { width: 0.4, height: 0.2625, sideOrientation: BABYLON.Mesh.FRONTSIDE },
    scene
  );

  panelMesh.billboardMode  = BABYLON.Mesh.BILLBOARDMODE_ALL;
  panelMesh.isPickable     = true;
  panelMesh.isNearPickable = true;
  panelMesh.setEnabled(false);

  const texture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(
    panelMesh, 1200, 580, false
  );

  const root = new BABYLON.GUI.Rectangle("panel-root");
  root.width        = "100%";
  root.height       = "100%";
  root.thickness    = 2;
  root.color        = "#A0A0A0";
  root.cornerRadius = 16;
  root.background   = "#151515DD";
  texture.addControl(root);

  const layout = new BABYLON.GUI.StackPanel("panel-stack");
  layout.width   = "97%";
  layout.height  = "95%";
  layout.spacing = 10;
  root.addControl(layout);

  const title = new BABYLON.GUI.TextBlock("panel-title", "Interactions VR");
  title.height    = "44px";
  title.color     = "white";
  title.fontSize  = 30;
  title.fontStyle = "bold";
  title.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  layout.addControl(title);

  const holdIntervals = new Map();

  const addRepeatableButton = (parent, col, label, action) => {
    const button = BABYLON.GUI.Button.CreateSimpleButton(label, label);
    button.height       = "52px";
    button.width        = "95%";
    button.cornerRadius = 10;
    button.thickness    = 1;
    button.background   = "#2A2A2A";
    button.color        = "white";
    button.fontSize     = 20;

    button.onPointerDownObservable.add(() => {
      action();
      const id = setInterval(() => action(), 100);
      holdIntervals.set(label, id);
    });
    button.onPointerUpObservable.add(() => {
      clearInterval(holdIntervals.get(label));
      holdIntervals.delete(label);
    });

    parent.addControl(button, 0, col);
  };

  const addToggleButton = (parent, col, label, action) => {
    const button = BABYLON.GUI.Button.CreateSimpleButton(label, label);
    button.height       = "52px";
    button.width        = "95%";
    button.cornerRadius = 10;
    button.thickness    = 1;
    button.background   = "#2A2A2A";
    button.color        = "white";
    button.fontSize     = 20;

    let active = false;
    button.onPointerUpObservable.add(() => {
      action();
      active = !active;
      button.background = active ? "#1a6b3a" : "#2A2A2A";
    });

    parent.addControl(button, 0, col);
  };

  const addSimpleButton = (parent, col, label, action) => {
    const button = BABYLON.GUI.Button.CreateSimpleButton(label, label);
    button.height       = "52px";
    button.width        = "95%";
    button.cornerRadius = 10;
    button.thickness    = 1;
    button.background   = "#2A2A2A";
    button.color        = "white";
    button.fontSize     = 20;
    button.onPointerUpObservable.add(() => action());
    parent.addControl(button, 0, col);
  };

  const addRow = (label, entries) => {
    const row = new BABYLON.GUI.Grid();
    row.height = "70px";
    row.addColumnDefinition(0.24);
    row.addColumnDefinition(0.19);
    row.addColumnDefinition(0.19);
    row.addColumnDefinition(0.19);
    row.addColumnDefinition(0.19);

    const labelBlock = new BABYLON.GUI.TextBlock(`${label}-lbl`, label);
    labelBlock.color    = "#F0F0F0";
    labelBlock.fontSize = 22;
    labelBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    row.addControl(labelBlock, 0, 0);

    entries.forEach((entry, i) => {
      if (!entry) return;
      if (entry.type === "toggle")       addToggleButton(row, i + 1, entry.text, entry.action);
      else if (entry.type === "simple")  addSimpleButton(row, i + 1, entry.text, entry.action);
      else                               addRepeatableButton(row, i + 1, entry.text, entry.action);
    });

    layout.addControl(row);
  };

  addRow("Translation", [
    { text: "X+", action: actions.translateXPlus  },
    { text: "X-", action: actions.translateXMinus },
    { text: "Y+", action: actions.translateYPlus  },
    { text: "Y-", action: actions.translateYMinus },
  ]);
  addRow("Translation", [
    { text: "Z+", action: actions.translateZPlus  },
    { text: "Z-", action: actions.translateZMinus },
  ]);
  addRow("Rotation", [
    { text: "X", action: actions.rotateX, type: "toggle" },
    { text: "Y", action: actions.rotateY, type: "toggle" },
    { text: "Z", action: actions.rotateZ, type: "toggle" },
  ]);
  addRow("Homothetie", [
    { text: "+", action: actions.scaleUp   },
    { text: "-", action: actions.scaleDown },
  ]);
  addRow("Affichage", [
    { text: "Faces",     action: actions.toggleFaces,     type: "simple" },
    { text: "Wireframe", action: actions.toggleWireframe, type: "simple" },
    { text: "Reset",     action: actions.reset,           type: "simple" },
  ]);

  return panelMesh;
}

export function addVRControls(xr, scene, forme3D, viewState, panelMesh, controlActions) {
  const moveSpeed = 0.04;
  const buttonLatch = new Map();

  function getPressedOnce(ctrlId, buttonIndex, isPressedNow) {
    const key  = `${ctrlId}:${buttonIndex}`;
    const prev = buttonLatch.get(key) || false;
    buttonLatch.set(key, isPressedNow);
    return isPressedNow && !prev;
  }

  const controllers = { left: null, right: null };

  xr.input.onControllerAddedObservable.add((xrController) => {
    xrController.onMotionControllerInitObservable.add((motionController) => {
      const handness = motionController.handedness;

      if (handness === "left") {
        controllers.left = motionController;
      }

      if (handness === "right") {
        controllers.right = motionController;

        const rightMesh = xrController.gripTransform
                       ?? xrController.grip
                       ?? xrController.pointer;

        panelMesh.parent   = rightMesh;
        panelMesh.position = new BABYLON.Vector3(0, 0.0, -0.07);
        panelMesh.rotation = new BABYLON.Vector3(0, 0, 0);
        panelMesh.setEnabled(true);
      }
    });
  });

  scene.onBeforeRenderObservable.add(() => {
    forme3D.update();
    controlActions.tickRotations();

    const left = controllers.left;
    if (left) {
      const stick = left.getComponent("xr-standard-thumbstick");
      if (stick?.axes) {
        const x = clamp(stick.axes.x, -1, 1);
        const y = clamp(stick.axes.y, -1, 1);
        if (Math.abs(x) > 0.15) translation(forme3D, new BABYLON.Vector4( x * moveSpeed, 0, 0, 0));
        if (Math.abs(y) > 0.15) translation(forme3D, new BABYLON.Vector4(0, 0, -y * moveSpeed, 0));
      }
      const a = left.getComponent("x-button") || left.getComponent("a-button");
      const b = left.getComponent("y-button") || left.getComponent("b-button");
      if (a && getPressedOnce(left.uniqueId, 100, !!a.pressed)) {
        viewState.facesVisible = !viewState.facesVisible;
        forme3D.toggleFaces(viewState.facesVisible);
      }
      if (b && getPressedOnce(left.uniqueId, 101, !!b.pressed)) {
        viewState.wireVisible = !viewState.wireVisible;
        forme3D.toggleWireframe(viewState.wireVisible);
      }
    }

    const right = controllers.right;
    if (right) {
      const stick = right.getComponent("xr-standard-thumbstick");
      if (stick?.axes) {
        const x = clamp(stick.axes.x, -1, 1);
        const y = clamp(stick.axes.y, -1, 1);
        if (Math.abs(x) > 0.15) {
          const steps = Math.ceil(Math.abs(x) * 3);
          for (let i = 0; i < steps; i++) rotation3D(forme3D, "y");
        }
        if (Math.abs(y) > 0.15) {
          const steps = Math.ceil(Math.abs(y) * 3);
          for (let i = 0; i < steps; i++) rotation3D(forme3D, "x");
        }
      }
      const trigger = right.getComponent("xr-standard-trigger");
      if (trigger?.value > 0.2) homothetie(forme3D, 1 + trigger.value * 0.01);
    }
  });
}