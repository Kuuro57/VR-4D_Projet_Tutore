import {forme3D, forme4D} from "./main.js";
import { rotation3D } from "./transformations/rotations.js";
import { translation } from "./transformations/translations.js";
import { homothetie } from "./transformations/homothetie.js";
import { Projection2D } from "./projection2D.js";
import { projection2D, projection3D } from "./projection/projections.js";



/**
 * Variables pour l'affichage de la forme
 */
var facesVisible = false;
var wireVisible = false;


/**
 * 
 * @param {*} forme 
 */
function initControls({ forme3D, forme4D, camera3D, camera2D, scene3D, scene2D }) {

    let forme = forme3D;

    document.getElementById("btn-rotation-x").addEventListener("click", () => toggleRotation(forme, "x", "btn-rotation-x"));
    document.getElementById("btn-rotation-y").addEventListener("click", () => toggleRotation(forme, "y", "btn-rotation-y"));
    document.getElementById("btn-rotation-z").addEventListener("click", () => toggleRotation(forme, "z", "btn-rotation-z"));

    document.getElementById("tx-plus").addEventListener("mousedown", () => toggleTranslation(forme, "x", "+"));
    document.getElementById("tx-plus").addEventListener("mouseup", () => toggleTranslation(forme, "x", "+"));
    document.getElementById("tx-plus").addEventListener("mouseleave", () => stopTranslation("x", "+"));

    document.getElementById("tx-minus").addEventListener("mousedown", () => toggleTranslation(forme, "x", "-"));
    document.getElementById("tx-minus").addEventListener("mouseup", () => toggleTranslation(forme, "x", "-"));
    document.getElementById("tx-minus").addEventListener("mouseleave", () => stopTranslation("x", "-"));

    document.getElementById("ty-plus").addEventListener("mousedown", () => toggleTranslation(forme, "y", "+"));
    document.getElementById("ty-plus").addEventListener("mouseup", () => toggleTranslation(forme, "y", "+"));
    document.getElementById("ty-plus").addEventListener("mouseleave", () => stopTranslation("y", "+"));

    document.getElementById("ty-minus").addEventListener("mousedown", () => toggleTranslation(forme, "y", "-"));
    document.getElementById("ty-minus").addEventListener("mouseup", () => toggleTranslation(forme, "y", "-"));
    document.getElementById("ty-minus").addEventListener("mouseleave", () => stopTranslation("y", "-"));

    document.getElementById("tz-plus").addEventListener("mousedown", () => toggleTranslation(forme, "z", "+"));
    document.getElementById("tz-plus").addEventListener("mouseup", () => toggleTranslation(forme, "z", "+"));
    document.getElementById("tz-plus").addEventListener("mouseleave", () => stopTranslation("z", "+"));

    document.getElementById("tz-minus").addEventListener("mousedown", () => toggleTranslation(forme, "z", "-"));
    document.getElementById("tz-minus").addEventListener("mouseup", () => toggleTranslation(forme, "z", "-"));
    document.getElementById("tz-minus").addEventListener("mouseleave", () => stopTranslation("z", "-"));

    document.getElementById("homothetie-plus").addEventListener("mousedown", () => { startHomothetie(forme, "+");});
    document.getElementById("homothetie-plus").addEventListener("mouseup", () => { stopHomothetie("+");});
    document.getElementById("homothetie-plus").addEventListener("mouseleave", () => { stopHomothetie("+");});

    document.getElementById("homothetie-minus").addEventListener("mousedown", () => { startHomothetie(forme, "-");});
    document.getElementById("homothetie-minus").addEventListener("mouseup", () => { stopHomothetie("-");});
    document.getElementById("homothetie-minus").addEventListener("mouseleave", () => { stopHomothetie("-");});


    // arrêt de toutes les translations/homothéties si mouseup en dehors
    window.addEventListener("mouseup", () => {
      stopTranslation("x", "+");
      stopTranslation("x", "-");
      stopTranslation("y", "+");
      stopTranslation("y", "-");
      stopTranslation("z", "+");
      stopTranslation("z", "-");
      stopHomothetie("+");
      stopHomothetie("-");
    });

    document.getElementById("btn-faces-toggle").addEventListener("click", (event) => {
      
      forme.toggleFaces(facesVisible);

      if (facesVisible) event.target.textContent = "Cacher les faces";
      else event.target.textContent = "Afficher les faces";
      facesVisible = !facesVisible;
      
    });

    document.getElementById("btn-wire-toggle").addEventListener("click", (event) => {
      
      forme.toggleWireframe(wireVisible);

      if (wireVisible) event.target.textContent = "Cacher la vue fil de fer";
      else event.target.textContent = "Afficher la vue fil de fer";
      wireVisible = !wireVisible;

    });

    addEventListener("keypress", (event) => {
      if (event.key === "p") {
        forme.delete?.();

        // projection3D au centre
        const proj3D = projection3D(forme4D, camera3D, scene3D);

        // projection2D dans le coin
        projection2D(proj3D, camera2D, scene2D);

        forme = proj3D;
      }

      else if (event.key === "o") {
        forme.delete?.();

        // forme3D au centre
        forme = forme3D;
        forme.build(scene3D);

        // projection2D dans le coin
        projection2D(forme3D, camera2D, scene2D);
      }
    });

};





// CONSTANTES
const timersRotation = {
  x: null,
  y: null,
  z: null,
};

function startHomothetie(forme, direction) {
  if (!forme) return;
  if (timersHomothetie[direction]) return;

  const target = getTransformTarget(forme);

  timersHomothetie[direction] = setInterval(() => {
    const factor = direction === "+" ? 1.01 : 0.99;
    homothetie(target, factor);
  }, INTERVAL);
}


/**
 * Méthode qui active ou désactive la rotation de la forme
 * @param {Forme} forme Forme que l'on veut tourner 
 * @param {*} axis Axe selon lequel on veut activer ou désactier la rotation de la forme
 * @param {*} btnId Id du bouton sur lequel on vient d'appuier
 * @returns 
 */
function toggleRotation(forme, axis, btnId) {
    if (!forme) return;

    const btn = document.getElementById(btnId);

    // Si déjà en rotation => stop
    if (timersRotation[axis] !== null) {
      
        clearInterval(timersRotation[axis]);
        timersRotation[axis] = null;
        btn.textContent = `Rotation ${axis.toUpperCase()}`;

    }
    // Sinon => start
    else {

        timersRotation[axis] = setInterval(() => {
          rotation3D(forme, axis);
        }, 10);
        btn.textContent = `Stop ${axis.toUpperCase()}`;
      
    }

  
}





// CONSTANTES
const timersTranslation = {
  "x+": null,
  "x-": null,
  "y+": null,
  "y-": null,
  "z+": null,
  "z-": null
};
const STEP = 0.05;
const INTERVAL = 16;

/**
 * Méthode qui lance ou arrête la translation de la forme
 * @param {*} axis Axe selon la forme se déplace
 * @param {*} direction Direction (droite ou gauche = "+" ou "-")
 * @returns 
 */
function toggleTranslation(forme, axis, direction) {
  if (!forme) return;

  const target = getTransformTarget(forme);

  let key = axis + direction;
  if (timersTranslation[key]) {
    clearInterval(timersTranslation[key]);
    timersTranslation[key] = null;
  } else {
    timersTranslation[key] = setInterval(() => {

      // vecteur de translation compatible Vector3 / Vector4
      const v0 = target.sommets?.[0]?.vector;
      const v = (v0 instanceof BABYLON.Vector4)
        ? new BABYLON.Vector4(0, 0, 0, 0)
        : new BABYLON.Vector3(0, 0, 0);

      v[axis] = direction === "+" ? STEP : -STEP;

      translation(target, v);

    }, INTERVAL);
  }
}

/**
 * Fonction helper pour arrêter une translation sans la toggler
 * @param {*} axis 
 * @param {*} direction 
 */
function stopTranslation(axis, direction) {
  let key = axis + direction;
  if (timersTranslation[key]) {
    clearInterval(timersTranslation[key]);
    timersTranslation[key] = null;
  }
}




// CONSTANTES
const timersHomothetie = {
  "+": null,
  "-": null
};

/**
 * Méthode qui lance ou arrête l'opération d'homotéthie
 * @param {*} forme Forme sur laquelle on veut appliquer l'homothétie
 * @param {*} direction "+" => aggrandir, "-" => rapetissir
 * @returns 
 */
function toggleHomotethie(forme, direction) {
  if (!forme) return;

  const target = getTransformTarget(forme);

  if (timersHomotethie[direction]) {
    clearInterval(timersHomotethie[direction]);
    timersHomotethie[direction] = null;
  } else {
    timersHomotethie[direction] = setInterval(() => {
      const factor = direction === "+" ? 1.01 : 0.99;
      homothetie(target, factor);
    }, INTERVAL);
  }
}

/**
 * Fonction helper pour arrêter une homothétie sans la toggler
 * @param {*} direction 
 */
function stopHomothetie(direction) {
  if (timersHomothetie[direction]) {
    clearInterval(timersHomothetie[direction]);
    timersHomothetie[direction] = null;
  }
}

/**
 * Helper pour récupérer la bonne forme à transformer
 * (forme4D si on essaie de tourner sa projection3D)
 * @param {*} forme 
 * @returns 
 */
function getTransformTarget(forme) {
  return forme?.formeParente ?? forme;
}




export {
  initControls
}