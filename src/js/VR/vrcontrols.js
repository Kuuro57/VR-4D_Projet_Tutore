import { translation } from "../transformations/translations.js";
import { rotation3D, rotation4D } from "../transformations/rotations.js";
import { homothetie } from "../transformations/homothetie.js";

// Dimension de la forme (3D ou 4D)
var is4D;

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
 * @param {Forme} forme - La forme à manipuler
 * @param {{ facesVisible: boolean, wireVisible: boolean }} viewState - État d'affichage partagé
 * @returns {Object} L'objet contenant toutes les actions
 */
export function createControlActions(forme, viewState) {
  
  // Détermine si la forme est en 3D ou 4D
  if (forme.sommets[0].vector instanceof BABYLON.Vector4) { is4D = true; }
  else { is4D = false; }

  console.log(is4D);

  const translationStep = 0.15;
  const rotation3DState = { x: false, y: false, z: false };
  const rotation4DState = { xy: false, xz: false, xw: false, yz: false, yw: false, zw: false };
  
  // Permet de suivre l'échelle actuelle pour pouvoir la réinitialiser correctement
  let currentScale = 1.0;

  /**
   * Appelée à chaque frame dans la boucle de rendu. Applique rotation3D sur les axes dont le flag est true dans rotationState.
   */
  function tickRotations() {
    if (rotation3DState.x) rotation3D(forme, "x");
    if (rotation3DState.y) rotation3D(forme, "y");
    if (rotation3DState.z) rotation3D(forme, "z");

    if (rotation4DState.xy) rotation4D(forme, "xy");
    if (rotation4DState.xz) rotation4D(forme, "xz");
    if (rotation4DState.xw) rotation4D(forme, "xw");
    if (rotation4DState.yz) rotation4D(forme, "yz");
    if (rotation4DState.yw) rotation4D(forme, "yw");
    if (rotation4DState.zw) rotation4D(forme, "zw");
  }

  return {
    tickRotations,

    // Rotations 3D : chaque méthode toggle un flag dans rotation3DState qui fait tourner la forme sur l'axe correspondant dans tickRotations()
    rotateX: () => { rotation3DState.x = !rotation3DState.x; },
    rotateY: () => { rotation3DState.y = !rotation3DState.y; },
    rotateZ: () => { rotation3DState.z = !rotation3DState.z; },

    // Rotations 4D : chaque méthode toggle un flag dans rotation4DState qui fait tourner la forme sur le plan correspondant dans tickRotations()
    rotateXY: () => { rotation4DState.xy = !rotation4DState.xy; },
    rotateXZ: () => { rotation4DState.xz = !rotation4DState.xz; },
    rotateXW: () => { rotation4DState.xw = !rotation4DState.xw; },
    rotateYZ: () => { rotation4DState.yz = !rotation4DState.yz; },
    rotateYW: () => { rotation4DState.yw = !rotation4DState.yw; },
    rotateZW: () => { rotation4DState.zw = !rotation4DState.zw; },

    // Homothéties : scaleUp multiplie l'échelle par 1.02, scaleDown la multiplie par 0.98, applyScale la multiplie par le facteur donné
    scaleUp:   () => { homothetie(forme, 1.02); currentScale *= 1.02; },
    scaleDown: () => { homothetie(forme, 0.98); currentScale *= 0.98; },
    applyScale: (factor) => { homothetie(forme, factor); currentScale *= factor; },

    // Affiche/masque les faces (on peut toggle)
    toggleFaces: () => {
      viewState.facesVisible = !viewState.facesVisible;
      forme.toggleFaces(viewState.facesVisible);
    },
    // Affiche/masque le wireframe (on peut toggle)
    toggleWireframe: () => {
      viewState.wireVisible = !viewState.wireVisible;
      forme.toggleWireframe(viewState.wireVisible);
    },
    // Réinitialise la forme à son état d'origine (position, rotation, échelle) et réactive les faces et le wireframe
    reset: () => {
      if (currentScale !== 1.0) {
        homothetie(forme, 1.0 / currentScale);
        currentScale = 1.0;
      }

      forme.reset();
      Object.keys(rotation3DState).forEach(axis => rotation3DState[axis] = false);
      Object.keys(rotation4DState).forEach(plane => rotation4DState[plane] = false);
      viewState.facesVisible = true;
      viewState.wireVisible  = true;
      forme.toggleFaces(true);
      forme.toggleWireframe(true);
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

  if (!is4D) {
    addRow("Rotations", [
      { text: "X", action: actions.rotateX, type: "toggleDesactive" },
      { text: "Y", action: actions.rotateY, type: "toggleDesactive" },
      { text: "Z", action: actions.rotateZ, type: "toggleDesactive" },
    ]);
  }
  else {
    addRow("Rotations", [
      { text: "XY", action: actions.rotateXY, type: "toggleDesactive" },
      { text: "XZ", action: actions.rotateXZ, type: "toggleDesactive" },
      { text: "XW", action: actions.rotateXW, type: "toggleDesactive" },
    ]);
    addRow("Rotations", [
      { text: "YZ", action: actions.rotateYZ, type: "toggleDesactive" },
      { text: "YW", action: actions.rotateYW, type: "toggleDesactive" },
      { text: "ZW", action: actions.rotateZW, type: "toggleDesactive" },
    ])
  }

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
 * La main droite ne peut PAS interagir avec le panneau de contrôle.
 * Ceci est obtenu via deux mécanismes complémentaires :
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


  // Référence à l'inputSource WebXR de la main droite.
  // Alimentée dès que le contrôleur droit est initialisé.
  // Utilisée dans meshSelectionPredicate pour identifier quel contrôleur effectue le pick.
  let rightInputSource = null;
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

  if (xr.pointerSelection) {
    xr.pointerSelection.meshSelectionPredicate = (mesh) => {
      // Bloque la main droite sur le panneau
      if (mesh.metadata?.vrControlPanel) {
        // Récupère l'inputSource actif au moment du pick
        const activeSource = xr.pointerSelection._currentController?.inputSource
                          ?? xr.pointerSelection._controllers?.[xr.pointerSelection._controllers?.length - 1]?.xrController?.inputSource;
        // Si on a identifié la main droite, on compare
        if (rightInputSource && activeSource === rightInputSource) {
          return false;
        }
        // Fallback : si l'inputSource actif a directement handedness "right"
        if (activeSource?.handedness === "right") {
          return false;
        }
      }
      // Comportement par défaut de Babylon
      return mesh.isEnabled() && mesh.isVisible && mesh.isPickable;
    };
  }

  xr.input.onControllerAddedObservable.add((xrController) => {
    xrController.onMotionControllerInitObservable.add((motionController) => {
      const handness = motionController.handedness;

      if (handness === "left") {
        controllers.left = motionController;
      }

      if (handness === "right") {
        controllers.right = motionController;
        // Mémorise l'inputSource WebXR de la main droite pour le predicate ci-dessus
        rightInputSource = xrController.inputSource;
        const rightMesh = xrController.gripTransform
                       ?? xrController.grip
                       ?? xrController.pointer;

        panelMesh.parent   = rightMesh;
        panelMesh.position = new BABYLON.Vector3(0, 0.0, -0.07);
        panelMesh.rotation = new BABYLON.Vector3(0, 0, 0);
        panelMesh.setEnabled(true);
        panelMesh.isNearPickable = false;
      }
    });
    // Nettoie la référence si le contrôleur droit est déconnecté (ex : batterie)
    xrController.onDisposeObservable.add(() => {
      if (xrController.inputSource === rightInputSource) {
        rightInputSource = null;
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