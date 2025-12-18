import { rotation3D } from "./transformations/rotations.js";
import { translation } from "./transformations/translations.js";
import { homothetie3D } from "./transformations/homothetie.js";






var facesVisible = false;
var wireVisible = false;



/**
 * 
 * @param {*} forme 
 */
function initControls(forme) {

    document.getElementById("btn-rotation-x").addEventListener("click", () => toggleRotation(forme, "x", "btn-rotation-x"));
    document.getElementById("btn-rotation-y").addEventListener("click", () => toggleRotation(forme, "y", "btn-rotation-y"));
    document.getElementById("btn-rotation-z").addEventListener("click", () => toggleRotation(forme, "z", "btn-rotation-z"));

    document.getElementById("tx-plus").addEventListener("mousedown", () => toggleTranslation(forme, "x", "+"));
    document.getElementById("tx-plus").addEventListener("mouseup", () => toggleTranslation(forme, "x", "+"));

    document.getElementById("tx-minus").addEventListener("mousedown", () => toggleTranslation(forme, "x", "-"));
    document.getElementById("tx-minus").addEventListener("mouseup", () => toggleTranslation(forme, "x", "-"));

    document.getElementById("ty-plus").addEventListener("mousedown", () => toggleTranslation(forme, "y", "+"));
    document.getElementById("ty-plus").addEventListener("mouseup", () => toggleTranslation(forme, "y", "+"));

    document.getElementById("ty-minus").addEventListener("mousedown", () => toggleTranslation(forme, "y", "-"));
    document.getElementById("ty-minus").addEventListener("mouseup", () => toggleTranslation(forme, "y", "-"));

    document.getElementById("tz-plus").addEventListener("mousedown", () => toggleTranslation(forme, "z", "+"));
    document.getElementById("tz-plus").addEventListener("mouseup", () => toggleTranslation(forme, "z", "+"));

    document.getElementById("homothetie-plus").addEventListener("mousedown", () => toggleHomotethie(forme, "+"));
    document.getElementById("homothetie-plus").addEventListener("mouseup", () => toggleTranslation(forme, "+"));

    document.getElementById("homothetie-minus").addEventListener("mousedown", () => toggleHomotethie(forme, "-"));
    document.getElementById("homothetie-minus").addEventListener("mouseup", () => toggleHomotethie(forme, "-"));

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

};









// CONSTANTES
const timersRotation = {
  x: null,
  y: null,
  z: null,
};

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

    let key = axis + direction;

    if (timersTranslation[key]) {

      clearInterval(timersTranslation[key]);
      timersTranslation[key] = null;

    }

    else {

      timersTranslation[key] = setInterval(() => {

          const v = new BABYLON.Vector3(0, 0, 0);
          v[axis] = direction === "+" ? STEP : -STEP;

          translation(forme, v);

      }, INTERVAL);

    }

}







// CONSTANTES
const timersHomotethie = {
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

    if (timersHomotethie[direction]) {

      clearInterval(timersHomotethie[direction]);
      timersHomotethie[direction] = null;      

    }

    else {

      timersHomotethie[direction] = setInterval(() => {
        
        let factor = direction === "+" ? 1.01 : 0.99;
        homothetie3D(forme, factor);

      }, INTERVAL);

    }

}



export {
  initControls
}