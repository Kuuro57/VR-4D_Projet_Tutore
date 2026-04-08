import { translation } from "../transformations/translations.js";
import { rotation3D, rotation4D } from "../transformations/rotations.js";
import { homothetie } from "../transformations/homothetie.js";
import { Forme } from "../formes/forme.js";
import { Projection3D } from "../4D/projection3D.js";
import { Projection2D } from "../3D/projection2D.js";


// Dimension de la forme (3D ou 4D)
var is4D;

// Menu de contrôle VR (GUI 3D)
var globalPanelMesh;

// Scène (monde VR)
var globalScene;

// Liste contenant toutes les actions possibles
export var globalActions;

// Forme actuellement affichée
var globalForme;

// Expérience XR
var globalXR;

// État d'affichage partagé
var globalViewState;

// Côté d'attachement du menu
var globalMenuSide = "right";

// Camera principale
var globalCamera;

// Mesh des mains
var globalRightMesh;
var globalLeftMesh;

// Liste des états des rotations (active ou inactive)
var globalRotation3DState;
var globalRotation4DState;





/**
 * Restreint une valeur entre a et b.
 * @param {number} v - Valeur à contraindre
 * @param {number} a - Borne inférieure
 * @param {number} b - Borne supérieure
 * @returns {number}
 */
function clamp(v, a, b) {
  return Math.max(a, Math.min(b, v));
}





/**
 * Créé une projection orthogonale de la forme4D sur le plan défini par axis
 * et place cette projection à la position donnée (Vector3)
 * @param {*} forme3D 
 * @param {*} axis 
 * @param {*} position 
 */
function addProjection3D(forme4D, axis, position, scene) {

  const clone = forme4D.getClone();

  const maProjection = new Projection3D(
    `Projection3D-${axis}`,
    clone.sommets,
    clone.aretes,
    clone.faces,
    globalCamera,
    axis,
    true,
    position
  );

  maProjection.formeParente = forme4D;
  forme4D.projection3D.push(maProjection);

  maProjection.build(scene);
  maProjection.update();

}


/**
 * Créé une projection orthogonale de la forme3D sur le plan défini par axis
 * et place cette projection à la position donnée (Vector3)
 * @param {*} forme3D 
 * @param {*} axis 
 * @param {*} position 
 */
function addProjection2D(forme3D, axis, position, scene) {

  const clone = forme3D.getClone();

  const maProjection = new Projection2D(
    `Projection2D-${axis}`,
    clone.sommets,
    clone.faces,
    clone.aretes,
    globalCamera,
    axis,
    position
  );

  maProjection.formeParente = forme3D;
  forme3D.projection2D.push(maProjection);

  maProjection.build(scene);
  maProjection.update();

  console.log(`Projection 2D ajoutée sur l'axe ${axis} :`, maProjection);

}





/**
 * Crée les actions de manipulation applicables à une forme (translations, rotations, échelle, affichage).
 * Retourne un objet dont chaque méthode déclenche une transformation.
 * tickRotations() doit être appelée à chaque frame pour faire avancer les rotations actives.
 * @param {Forme} forme - La forme à manipuler
 * @returns {Object} L'objet contenant toutes les actions
 */
function createControlActions() {

  // Détermine si la forme est en 3D ou 4D
  if (globalForme.sommets[0].vector instanceof BABYLON.Vector4) { is4D = true; }
  else { is4D = false; }

  const translationStep = 0.15;
  globalRotation3DState = { x: false, y: false, z: false };
  globalRotation4DState = { xy: false, xz: false, xw: false, yz: false, yw: false, zw: false };

  // Permet de suivre l'échelle actuelle pour pouvoir la réinitialiser correctement
  let currentScale = 1.0;

  /**
   * Appelée à chaque frame dans la boucle de rendu. Applique rotation3D sur les axes dont le flag est true dans rotationState.
   */
  function tickRotations() {
    if (globalRotation3DState.x) rotation3D(globalForme, "x");
    if (globalRotation3DState.y) rotation3D(globalForme, "y");
    if (globalRotation3DState.z) rotation3D(globalForme, "z");

    if (globalRotation4DState.xy) rotation4D(globalForme, "xy");
    if (globalRotation4DState.xz) rotation4D(globalForme, "xz");
    if (globalRotation4DState.xw) rotation4D(globalForme, "xw");
    if (globalRotation4DState.yz) rotation4D(globalForme, "yz");
    if (globalRotation4DState.yw) rotation4D(globalForme, "yw");
    if (globalRotation4DState.zw) rotation4D(globalForme, "zw");
  }

  return {
    tickRotations,

    // Rotations 3D : chaque méthode toggle un flag dans rotation3DState qui fait tourner la forme sur l'axe correspondant dans tickRotations()
    rotateX: () => { globalRotation3DState.x = !globalRotation3DState.x; },
    rotateY: () => { globalRotation3DState.y = !globalRotation3DState.y; },
    rotateZ: () => { globalRotation3DState.z = !globalRotation3DState.z; },

    // Rotations 4D : chaque méthode toggle un flag dans rotation4DState qui fait tourner la forme sur le plan correspondant dans tickRotations()
    rotateXY: () => { globalRotation4DState.xy = !globalRotation4DState.xy; },
    rotateXZ: () => { globalRotation4DState.xz = !globalRotation4DState.xz; },
    rotateXW: () => { globalRotation4DState.xw = !globalRotation4DState.xw; },
    rotateYZ: () => { globalRotation4DState.yz = !globalRotation4DState.yz; },
    rotateYW: () => { globalRotation4DState.yw = !globalRotation4DState.yw; },
    rotateZW: () => { globalRotation4DState.zw = !globalRotation4DState.zw; },

    // Homothéties : scaleUp multiplie l'échelle par 1.02, scaleDown la multiplie par 0.98
    scaleUp:   () => { homothetie(globalForme, 1.02); currentScale *= 1.02; },
    scaleDown: () => { homothetie(globalForme, 0.98); currentScale *= 0.98; },

    // Affiche/masque les faces (on peut toggle)
    toggleFaces: () => {
      globalViewState.facesVisible = !globalViewState.facesVisible;
      globalForme.toggleFaces(globalViewState.facesVisible);
    },
    // Affiche/masque le wireframe (on peut toggle)
    toggleWireframe: () => {
      globalViewState.wireVisible = !globalViewState.wireVisible;
      globalForme.toggleWireframe(globalViewState.wireVisible);
    },
    // Réinitialise la forme à son état d'origine (position, rotation, échelle) et réactive les faces et le wireframe
    reset: () => {
      if (currentScale !== 1.0) {
        homothetie(globalForme, 1.0 / currentScale);
        currentScale = 1.0;
      }

      globalForme.reset();
      Object.keys(globalRotation3DState).forEach(axis => globalRotation3DState[axis] = false);
      Object.keys(globalRotation4DState).forEach(plane => globalRotation4DState[plane] = false);
      globalViewState.facesVisible = true;
      globalViewState.wireVisible  = true;
      globalForme.toggleFaces(true);
      globalForme.toggleWireframe(true);
    },
    // Change la forme active et recréé le menu
    switchForme: async (name) => {
      
      if (globalForme.name === name) return;

      globalForme.delete();
      globalRotation3DState = { x: false, y: false, z: false };
      globalRotation4DState = { xy: false, xz: false, xw: false, yz: false, yw: false, zw: false };

      var newForme;
      switch (name) {
        case "HyperCube": 
          newForme = Forme.loadHyperCubeFromCenter("HyperCube", new BABYLON.Vector4(0, 0, 0, 0), 1);
          is4D = true; 
          break;
        case "Cube": 
          newForme = Forme.loadCubeFromCenter("Cube", new BABYLON.Vector3(0, 0, 0), 1); 
          is4D = false;
          break;
        case "HyperSphere":
          newForme = Forme.loadHyperSphereFromCenter("HyperSphere", new BABYLON.Vector4(0, 1.6, 3, 0), 4, 5);
          is4D = true;
          break;
        case "Pentachore":
          newForme = Forme.loadPentatopeFromCenter("Pentachore", new BABYLON.Vector4(0, 1.6, 3, 0), 1);
          is4D = true;
          break;
        case "Croix 4D":
          try {
            const response = fetch("../data/croix4D.ply"); 
            newForme = await Forme.loadVoxel4DFromPLY(response);
            newForme.name = name;
            is4D = true;
          } catch (error) {
            console.error("Erreur de chargement PLY:", error);
            return;
          }
          break;
      }

      // Ajout des projections de la forme principale
      if (is4D) {
          addProjection3D(newForme, 'x', new BABYLON.Vector3(5, 1.6, 5), globalScene);
          addProjection3D(newForme, 'y', new BABYLON.Vector3(5, 1.6, 5 - (10 / 3)), globalScene);
          addProjection3D(newForme, 'z', new BABYLON.Vector3(5, 1.6, -5 + (10 / 3)), globalScene);
          addProjection3D(newForme, 'w', new BABYLON.Vector3(5, 1.6, -5), globalScene);
      }
      else {
        addProjection2D(newForme, 'x', new BABYLON.Vector3(5, 1.6, 5), globalScene);
        addProjection2D(newForme, 'y', new BABYLON.Vector3(5, 1.6, 5 - (10 / 3)), globalScene);
        addProjection2D(newForme, 'z', new BABYLON.Vector3(5, 1.6, -5 + (10 / 3)), globalScene);
      }

      globalPanelMesh.dispose();
      initMenu(globalXR, globalScene, globalCamera, newForme, false);

    },
  };
}





/**
 * Construit le panneau de contrôle GUI 3D qui flottera devant la manette droite en VR.
 * Le panneau est désactivé par défaut / addVRControls() l'active et le parenté à la manette.
 * @returns {BABYLON.Mesh} Le mesh du panneau à passer à addVRControls()
 */
function initVRControlPanel3D() {

  const textureW   = 1200;
  const textureH   = 544;
  const meshHeight = 0.4 * (textureH / textureW);

  var panelMesh = BABYLON.MeshBuilder.CreatePlane(
    "vr-controls-panel",
    { width: 0.4, height: meshHeight, sideOrientation: BABYLON.Mesh.FRONTSIDE },
    globalScene
  );

  panelMesh.billboardMode  = BABYLON.Mesh.BILLBOARDMODE_ALL;
  panelMesh.isPickable     = true;
  panelMesh.isNearPickable = true;
  panelMesh.setEnabled(false);

  const texture = BABYLON.GUI.AdvancedDynamicTexture.CreateForMesh(
    panelMesh, textureW, textureH, false
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
  const toggleVisualResets = [];

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

  const addToggleButton = (parent, col, label, action, initActive) => {
    const button = BABYLON.GUI.Button.CreateSimpleButton(label, label);
    button.height       = "52px";
    button.width        = "95%";
    button.cornerRadius = 10;
    button.thickness    = 1;
    button.background   = initActive ? "#1a6b3a" : "#2A2A2A";
    button.color        = "white";
    button.fontSize     = 20;

    let active = initActive;
    button.onPointerUpObservable.add(() => {
      action();
      active = !active;
      button.background = active ? "#1a6b3a" : "#2A2A2A";
    });

    toggleVisualResets.push(() => {
      active = initActive;
      button.background = initActive ? "#1a6b3a" : "#2A2A2A";
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
    row.addColumnDefinition(0.20);
    row.addColumnDefinition(0.16);
    row.addColumnDefinition(0.16);
    row.addColumnDefinition(0.16);
    row.addColumnDefinition(0.16);
    row.addColumnDefinition(0.16);

    const labelBlock = new BABYLON.GUI.TextBlock(`${label}-lbl`, label);
    labelBlock.color    = "#F0F0F0";
    labelBlock.fontSize = 22;
    labelBlock.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
    row.addControl(labelBlock, 0, 0);

    entries.forEach((entry, i) => {
      if (!entry) return;
      if (entry.type === "toggleActive")         addToggleButton(row, i + 1, entry.text, entry.action, true);
      else if (entry.type === "toggleDesactive") addToggleButton(row, i + 1, entry.text, entry.action, false);
      else if (entry.type === "simple")          addSimpleButton(row, i + 1, entry.text, entry.action);
      else                                       addRepeatableButton(row, i + 1, entry.text, entry.action);
    });

    layout.addControl(row);
    return row; // ← permet de récupérer la référence pour modifier isVisible et height
  };

  // Ligne rotation 3D — visible uniquement si la forme est en 3D
  const rowRot3D = addRow("Rotations", [
    { text: "X",  action: globalActions.rotateX, type: "toggleDesactive" },
    { text: "Y",  action: globalActions.rotateY, type: "toggleDesactive" },
    { text: "Z",  action: globalActions.rotateZ, type: "toggleDesactive" },
  ]);
  rowRot3D.isVisible = !is4D;
  rowRot3D.height    = is4D ? "0px" : "70px";

  // Ligne rotation 4D n°1 — visible uniquement si la forme est en 4D
  const rowRot4D_1 = addRow("Rotations", [
    { text: "XY", action: globalActions.rotateXY, type: "toggleDesactive" },
    { text: "XZ", action: globalActions.rotateXZ, type: "toggleDesactive" },
    { text: "XW", action: globalActions.rotateXW, type: "toggleDesactive" },
  ]);
  rowRot4D_1.isVisible = is4D;
  rowRot4D_1.height    = is4D ? "70px" : "0px";

  // Ligne rotation 4D n°2 — visible uniquement si la forme est en 4D
  const rowRot4D_2 = addRow("Rotations", [
    { text: "YZ", action: globalActions.rotateYZ, type: "toggleDesactive" },
    { text: "YW", action: globalActions.rotateYW, type: "toggleDesactive" },
    { text: "ZW", action: globalActions.rotateZW, type: "toggleDesactive" },
  ]);
  rowRot4D_2.isVisible = is4D;
  rowRot4D_2.height    = is4D ? "70px" : "0px";

  addRow("Homothetie", [
    { text: "+", action: globalActions.scaleUp   },
    { text: "-", action: globalActions.scaleDown },
  ]);

  addRow("Affichage", [
    { text: "Faces",     action: globalActions.toggleFaces,     type: "toggleActive" },
    { text: "Wireframe", action: globalActions.toggleWireframe, type: "toggleActive" },
    { text: "Reset",     action: () => {
        globalActions.reset();
        toggleVisualResets.forEach(resetUI => resetUI());
    }, type: "simple" },
  ]);

  addRow("Formes", [
    { text: "Cube",        action: () => { globalActions.switchForme("Cube");        }, type: "simple" },
    { text: "HyperCube",   action: () => { globalActions.switchForme("HyperCube");   }, type: "simple" },
    { text: "HyperSphere", action: () => { globalActions.switchForme("HyperSphere"); }, type: "simple" },
    { text: "Pentachore",  action: () => { globalActions.switchForme("Pentachore");  }, type: "simple" },
    { text: "Croix 4D",    action: () => { globalActions.switchForme("Croix 4D");    }, type: "simple" },
  ]);

  const rowMain = new BABYLON.GUI.Grid();
  rowMain.height = "70px";
  rowMain.addColumnDefinition(0.20);
  rowMain.addColumnDefinition(0.16);
  rowMain.addColumnDefinition(0.16);
  rowMain.addColumnDefinition(0.16);
  rowMain.addColumnDefinition(0.16);
  rowMain.addColumnDefinition(0.16);

  const labelMain = new BABYLON.GUI.TextBlock("main-lbl", "Main");
  labelMain.color     = "#F0F0F0";
  labelMain.fontSize  = 22;
  labelMain.textHorizontalAlignment = BABYLON.GUI.Control.HORIZONTAL_ALIGNMENT_LEFT;
  rowMain.addControl(labelMain, 0, 0);

  const btnMain = BABYLON.GUI.Button.CreateSimpleButton("btn-main", globalMenuSide === "right" ? "Droite" : "Gauche");
  btnMain.height       = "52px";
  btnMain.width        = "95%";
  btnMain.cornerRadius = 10;
  btnMain.thickness    = 1;
  btnMain.background   = "#1a3a6b";
  btnMain.color        = "white";
  btnMain.fontSize     = 20;
  btnMain.onPointerUpObservable.add(() => {
    globalMenuSide = globalMenuSide === "right" ? "left" : "right";
    btnMain.textBlock.text = globalMenuSide === "right" ? "Droite" : "Gauche";
    attachMenuToHand(globalMenuSide);
  });
  rowMain.addControl(btnMain, 0, 1);

  layout.addControl(rowMain);

  return panelMesh;
}





/**
 * Connecte les mains aux actions de la forme et au panneau GUI.
 * - Main gauche  :  translation XZ, boutons X/Y -> toggle faces/wireframe
 * - Main droite  :  rotation X/Y, grip -> support du panneau GUI
 */
function addVRControls() {
  const moveSpeed = 0.04;
  const buttonLatch = new Map();

  /**
   * Détecte le front montant d'un bouton : retourne true seulement à la première frame où il passe à « pressé », pas tant qu'il reste enfoncé.
   * Utilise buttonLatch (Map) pour mémoriser l'état précédent de chaque bouton.
  * @param {number} ctrlId - Identifiant unique du contrôleur
  * @param {number} buttonIndex - Index arbitraire identifiant le bouton sur ce contrôleur
  * @param {boolean} isPressedNow - État actuel du bouton à cette frame
  * @returns {boolean} true uniquement sur le front montant (première frame pressée)
  */
  function getPressedOnce(ctrlId, buttonIndex, isPressedNow) {
    const key  = `${ctrlId}:${buttonIndex}`;
    const prev = buttonLatch.get(key) || false;
    buttonLatch.set(key, isPressedNow);
    return isPressedNow && !prev;
  }

  const controllers = { left: null, right: null };

  globalXR.input.onControllerAddedObservable.add((xrController) => {
    xrController.onMotionControllerInitObservable.add((motionController) => {
      const handness = motionController.handedness;

      if (handness === "left") {
        controllers.left = motionController;
        globalLeftMesh = xrController.gripTransform
                      ?? xrController.grip
                      ?? xrController.pointer;
      }

      if (handness === "right") {
        controllers.right = motionController;

        globalRightMesh = xrController.gripTransform
                       ?? xrController.grip
                       ?? xrController.pointer;

        attachMenuToHand();
      }
    });
  });

  globalScene.onBeforeRenderObservable.add(() => {
    globalActions.tickRotations();

    const left = controllers.left;
    if (left) {
      const stick = left.getComponent("xr-standard-thumbstick");
      if (stick?.axes) {
        const x = clamp(stick.axes.x, -1, 1);
        const y = clamp(stick.axes.y, -1, 1);
        if (Math.abs(x) > 0.15) translation(globalForme, new BABYLON.Vector4( x * moveSpeed, 0, 0, 0));
        if (Math.abs(y) > 0.15) translation(globalForme, new BABYLON.Vector4(0, 0, -y * moveSpeed, 0));
      }
      const a = left.getComponent("x-button") || left.getComponent("a-button");
      const b = left.getComponent("y-button") || left.getComponent("b-button");
      if (a && getPressedOnce(left.uniqueId, 100, !!a.pressed)) {
        globalViewState.facesVisible = !globalViewState.facesVisible;
        globalForme.toggleFaces(globalViewState.facesVisible);
      }
      if (b && getPressedOnce(left.uniqueId, 101, !!b.pressed)) {
        globalViewState.wireVisible = !globalViewState.wireVisible;
        globalForme.toggleWireframe(globalViewState.wireVisible);
      }
    }
  });
}





/**
 * Attache le menu de contrôle à la main droite
 */
function attachMenuToHand() {
  const targetMesh = globalMenuSide === "left" ? globalLeftMesh : globalRightMesh;
  if (!targetMesh) return;

  globalPanelMesh.parent   = targetMesh;
  globalPanelMesh.position = new BABYLON.Vector3(
    globalMenuSide === "left" ? 0.02 : -0.02,
    0.02,
    globalMenuSide === "left" ? -0.025 : 0.035
  );
  globalPanelMesh.rotation = new BABYLON.Vector3(0, 0, 0);
  globalPanelMesh.setEnabled(true);
}





/**
 * Initialise le menu VR
 * @param {*} xr 
 * @param {*} scene 
 * @param {*} forme 
 */
export function initMenu(xr, scene, camera, forme, isFirstInit = true) {

  globalForme = forme;
  globalXR = xr;
  globalScene = scene;
  globalCamera = camera;
  globalViewState = { facesVisible: true, wireVisible: true };

  globalActions = createControlActions();
  globalPanelMesh = initVRControlPanel3D();

  if (isFirstInit) { addVRControls(); }
  else { 
    globalPanelMesh.setEnabled(true);
    attachMenuToHand(); 
  }

}