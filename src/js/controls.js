import {forme3D} from "./main.js";
import { rotation3D } from "./transformations/rotations.js";
import { translation3D } from "./transformations/translations.js";
import { homothetie3D } from "./transformations/homothetie.js";

// CONSTANTES
const timers = {
  x: null,
  y: null,
  z: null,
};

const translationTimers = {};
const STEP = 0.05;
const INTERVAL = 16;

var idIntervalHomothetie = null;

let facesVisible = true;
let wireVisible = true;

/**
 * Méthode qui active ou désactive la rotation de la forme
 * @param {*} axis Axe selon lequel on veut activer ou désactier la rotation de la forme
 * @param {*} btnId Id du bouton sur lequel on vient d'appuier
 * @returns 
 */
function toggleRotation(axis, btnId) {
    if (!forme3D) return;

    const btn = document.getElementById(btnId);

    // Si déjà en rotation => stop
    if (timers[axis] !== null) {
      
        clearInterval(timers[axis]);
        timers[axis] = null;
        btn.textContent = `Rotation ${axis.toUpperCase()}`;

    }
    // Sinon => start
    else {

        timers[axis] = setInterval(() => {
          
          rotation3D(forme3D, axis, 1);
        }, 10);
        btn.textContent = `Stop ${axis.toUpperCase()}`;
      
    }

  
}



/**
 * Méthode qui lance la translation de la forme
 * @param {*} axis Axe selon la forme se déplace
 * @param {*} direction Direction (droite ou gauche = "+" ou "-")
 * @returns 
 */
function startTranslation(axis, direction) {
    const key = axis + direction;
    if (translationTimers[key]) return;

    translationTimers[key] = setInterval(() => {
      if (!forme3D) return;

      const v = new BABYLON.Vector3(0, 0, 0);
      v[axis] = direction === "+" ? STEP : -STEP;

      translation3D(forme3D, v);
    }, INTERVAL);
}



/**
 * Méthode qui arrête la translation de la forme
 * @param {*} axis Axe sur lequel la forme se déplace
 * @param {*} direction Direction (droite ou gauche = "+" ou "-")
 */
function stopTranslation(axis, direction) {
  const key = axis + direction;
  clearInterval(translationTimers[key]);
  translationTimers[key] = null;
}







/**
 * Méthode qui lance l'opération d'homothétie sur la forme
 * @param {*} direction "+" => aggrandir / "-" => rapetissir
 * @returns 
 */
function startHomothetie(direction) {
    if (!forme3D) return;

    idIntervalHomothetie = setInterval(() => {
      let factor = direction === "+" ? 1.01 : 0.99;
        homothetie3D(forme3D, factor);
    }, INTERVAL);
}



/**
 * Méthode qui stop l'opération d'homothétie
 */
function stopHomothetie() {

    clearInterval(idIntervalHomothetie);
    idIntervalHomothetie = null;

}



/**
 * Méthode qui ajoute les listeners sur les boutons "+" et "-" de l'opération d'homothétie
 * @param {*} id Id du bouton "+" ou "-"
 * @param {*} direction +" => aggrandir / "-" => rapetissir
 */
function bindHomothetieButton(id, direction) {
  
    const btn = document.getElementById(id);
    let factor = direction === "+" ? 1.1 : 0.9;

    btn.addEventListener("mousedown", () => startHomothetie(direction));
    btn.addEventListener("mouseup", () => stopHomothetie());
    btn.addEventListener("mouseleave", () => stopHomothetie());

}

// On relie les boutons aux fonctions
bindHomothetieButton("homothetie-plus", "+");
bindHomothetieButton("homothetie-minus", "-");



/**
 * Méthode qui ajoute les listeners sur les boutons "+" et "-" de l'opération de translation
 * @param {*} id Id du bouton
 * @param {*} axis Axe sur lequel on translate
 * @param {*} dir Direction (droite ou gauche = "+" ou "-")
 */
function bindTranslationButton(id, axis, dir) {
  const btn = document.getElementById(id);

  btn.addEventListener("mousedown", () => startTranslation(axis, dir));
  btn.addEventListener("mouseup", () => stopTranslation(axis, dir));
  btn.addEventListener("mouseleave", () => stopTranslation(axis, dir));

}

// On relie les boutons aux fonctions
bindTranslationButton("tx-plus", "x", "+");
bindTranslationButton("tx-minus", "x", "-");
bindTranslationButton("ty-plus", "y", "+");
bindTranslationButton("ty-minus", "y", "-");
bindTranslationButton("tz-plus", "z", "+");
bindTranslationButton("tz-minus", "z", "-");




// Ajout des listeners pour les boutons qui permettent de tourner la forme
window.addEventListener("DOMContentLoaded", () => {
    document.getElementById("btn-rotation-x").addEventListener("click", () => {
        toggleRotation("x", "btn-rotation-x");
    });

    document.getElementById("btn-rotation-y").addEventListener("click", () => {
        toggleRotation("y", "btn-rotation-y");
    });

    document.getElementById("btn-rotation-z").addEventListener("click", () => {
        toggleRotation("z", "btn-rotation-z");
    });
});

// Ajout des listeners pour les boutons qui permettent d'afficher/cacher les faces et le fil de fer
window.addEventListener("DOMContentLoaded", () => {
  const btnFaces = document.getElementById("btn-faces-toggle");

  btnFaces.addEventListener("click", () => {
    if (!forme3D) return;

    facesVisible = !facesVisible;
    forme3D.toggleFaces(facesVisible);

    btnFaces.textContent = facesVisible ? "Cacher faces" : "Afficher faces";
  });
  document.getElementById("btn-wire-toggle").addEventListener("click", () => {
    if (!forme3D) return;

    wireVisible = !wireVisible;
    forme3D.toggleWireframe(wireVisible);

    const btn = document.getElementById("btn-wire-toggle");
    btn.textContent = wireVisible ? "Cacher sommets & arêtes" : "Afficher sommets & arêtes";
  });
});