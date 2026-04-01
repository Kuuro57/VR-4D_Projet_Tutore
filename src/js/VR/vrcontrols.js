import { translation } from "../transformations/translations.js";
import { rotation3D } from "../transformations/rotations.js";
import { homothetie } from "../transformations/homothetie.js";

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
 * Crée les actions de manipulation applicables à une forme (translations, rotations, échelle, affichage).
 * Retourne un objet dont chaque méthode déclenche une transformation.
 * tickRotations() doit être appelée à chaque frame pour faire avancer les rotations actives.
 * @param {Forme} forme3D - La forme à manipuler
 * @param {{ facesVisible: boolean, wireVisible: boolean }} viewState - État d'affichage partagé
 * @returns {Object} L'objet contenant toutes les actions
 */
export function createControlActions(forme3D, viewState) {
  const translationStep = 0.15;
  const rotationState = { x: false, y: false, z: false };
  // Permet de suivre l'échelle actuelle pour pouvoir la réinitialiser correctement
  let currentScale = 1.0;

  /**
   * Appelée à chaque frame dans la boucle de rendu. Applique rotation3D sur les axes dont le flag est true dans rotationState.
   */
  function tickRotations() {
    if (rotationState.x) rotation3D(forme3D, "x");
    if (rotationState.y) rotation3D(forme3D, "y");
    if (rotationState.z) rotation3D(forme3D, "z");
  }

  return {
    tickRotations,

    // Translations : chaque méthode applique une translation dans la direction correspondante
    translateXPlus:  () => translation(forme3D, new BABYLON.Vector4( translationStep, 0, 0, 0)),
    translateXMinus: () => translation(forme3D, new BABYLON.Vector4(-translationStep, 0, 0, 0)),
    translateYPlus:  () => translation(forme3D, new BABYLON.Vector4(0,  translationStep, 0, 0)),
    translateYMinus: () => translation(forme3D, new BABYLON.Vector4(0, -translationStep, 0, 0)),
    translateZPlus:  () => translation(forme3D, new BABYLON.Vector4(0, 0,  translationStep, 0)),
    translateZMinus: () => translation(forme3D, new BABYLON.Vector4(0, 0, -translationStep, 0)),

    // Rotations 3D : chaque méthode toggle un flag dans rotationState qui fait tourner la forme sur l'axe correspondant dans tickRotations()
    rotateX: () => { rotationState.x = !rotationState.x; },
    rotateY: () => { rotationState.y = !rotationState.y; },
    rotateZ: () => { rotationState.z = !rotationState.z; },

    // Homothéties : scaleUp multiplie l'échelle par 1.02, scaleDown la multiplie par 0.98, applyScale la multiplie par le facteur donné
    scaleUp:   () => { homothetie(forme3D, 1.02); currentScale *= 1.02; },
    scaleDown: () => { homothetie(forme3D, 0.98); currentScale *= 0.98; },
    applyScale: (factor) => { homothetie(forme3D, factor); currentScale *= factor; },

    // Affiche/masque les faces (on peut toggle)
    toggleFaces: () => {
      viewState.facesVisible = !viewState.facesVisible;
      forme3D.toggleFaces(viewState.facesVisible);
    },
    // Affiche/masque le wireframe (on peut toggle)
    toggleWireframe: () => {
      viewState.wireVisible = !viewState.wireVisible;
      forme3D.toggleWireframe(viewState.wireVisible);
    },
    // Réinitialise la forme à son état d'origine (position, rotation, échelle) et réactive les faces et le wireframe
    reset: () => {
      if (currentScale !== 1.0) {
        homothetie(forme3D, 1.0 / currentScale);
        currentScale = 1.0;
      }

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

/**
 * Construit le panneau de contrôle GUI 3D qui flottera devant la manette droite en VR.
 * Le panneau est désactivé par défaut / addVRControls() l'active et le parenté à la manette.
 * @param {BABYLON.Scene} scene - La scène Babylon
 * @param {Object} actions - L'objet d'actions retourné par createControlActions()
 * @returns {BABYLON.Mesh} Le mesh du panneau à passer à addVRControls()
 */
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
    panelMesh, 1200, 400, false
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
  
  /**
  * Crée un bouton qui déclenche l'action immédiatement au pointerDown,
  * puis la répète toutes les 100 ms tant qu'il est maintenu.
  * Utilisé pour les translations et l'échelle.
  * @param {BABYLON.GUI.Grid} parent - Conteneur Grid auquel ajouter le bouton
  * @param {number} col - Index de colonne dans le Grid parent
  * @param {string} label - Texte affiché sur le bouton
  * @param {function} action - Callback déclenché en boucle tant que le bouton est maintenu
  */
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

  /**
   * Crée un bouton qui change de couleur à chaque clic (vert actif / gris inactif).
   * Son état visuel est mémorisé dans toggleVisualResets pour être remis à zéro par le bouton Reset.
   * @param {BABYLON.GUI.Grid} parent - Conteneur Grid auquel ajouter le bouton
   * @param {number} col - Index de colonne dans le Grid parent
   * @param {string} label - Texte affiché sur le bouton
   * @param {function} action - Callback déclenché au clic
   * @param {boolean} initActive - État visuel initial (true = vert, false = gris)
   */
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

  /**
   * Crée un bouton classique à action unique au pointerUp.
   * @param {BABYLON.GUI.Grid} parent - Conteneur Grid auquel ajouter le bouton
   * @param {number} col - Index de colonne dans le Grid parent
   * @param {string} label - Texte affiché sur le bouton
   * @param {function} action - Callback déclenché au relâchement du bouton
   */
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

  /**
  * Construit une ligne du panneau avec un label à gauche et jusqu'à 4 boutons à droite.
  * Chaque entrée précise son type et l'action associée.
  * @param {string} label - Texte affiché à gauche de la ligne
  * @param {Array<{text: string, action: function, type?: string}>} entries - Boutons à créer (type : "toggleActive" | "toggleDesactive" | "simple" | undefined pour répétable)
  */
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
      if (entry.type === "toggleActive")           addToggleButton(row, i + 1, entry.text, entry.action, true);
      else if (entry.type === "toggleDesactive")   addToggleButton(row, i + 1, entry.text, entry.action, false);
      else if (entry.type === "simple")            addSimpleButton(row, i + 1, entry.text, entry.action);
      else                                         addRepeatableButton(row, i + 1, entry.text, entry.action);
    });

    layout.addControl(row);
  };

  addRow("Rotation", [
    { text: "X", action: actions.rotateX, type: "toggleDesactive" },
    { text: "Y", action: actions.rotateY, type: "toggleDesactive" },
    { text: "Z", action: actions.rotateZ, type: "toggleDesactive" },
  ]);
  addRow("Homothetie", [
    { text: "+", action: actions.scaleUp   },
    { text: "-", action: actions.scaleDown },
  ]);
  addRow("Affichage", [
    { text: "Faces",     action: actions.toggleFaces,     type: "toggleActive" },
    { text: "Wireframe", action: actions.toggleWireframe, type: "toggleActive" },
    { text: "Reset",     action: () => {
        actions.reset();
        toggleVisualResets.forEach(resetUI => resetUI());
    }, type: "simple" },
  ]);

  return panelMesh;
}

/**
 * Connecte les mains aux actions de la forme et au panneau GUI.
 * - Main gauche  :  translation XZ, boutons X/Y -> toggle faces/wireframe
 * - Main droite  :  rotation X/Y, grip -> support du panneau GUI
 * @param {BABYLON.WebXRDefaultExperience} xr - L'expérience XR
 * @param {BABYLON.Scene} scene - La scène Babylon
 * @param {Forme} forme3D - La forme à manipuler
 * @param {{ facesVisible: boolean, wireVisible: boolean }} viewState - État d'affichage partagé
 * @param {BABYLON.Mesh} panelMesh - Le mesh panneau retourné par initVRControlPanel3D()
 * @param {Object} controlActions - L'objet d'actions retourné par createControlActions()
 */
export function addVRControls(xr, scene, forme3D, viewState, panelMesh, controlActions) {
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
    }
  });
}