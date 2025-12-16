import {forme3D} from "./main.js";
import { Forme } from "./forme.js";
import { rotation3D } from "./transformations/rotations.js";
import { translation3D } from "./transformations/translations.js";
import { homothetie3D } from "./transformations/homothetie.js";

const timers = {
  x: null,
  y: null,
  z: null,
};

function toggleRotation(axis, btnId) {
  const btn = document.getElementById(btnId);

  // si déjà en rotation => stop
  if (timers[axis] !== null) {
    clearInterval(timers[axis]);
    timers[axis] = null;
    btn.textContent = `Rotation ${axis.toUpperCase()}`;
    return;
  }

  // sinon => start
  btn.textContent = `Stop ${axis.toUpperCase()}`;
  timers[axis] = setInterval(() => {
    if (!forme3D) return;
    rotation3D(forme3D, axis, 1);
  }, 10);
}

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

const translationTimers = {};
const STEP = 0.05;
const INTERVAL = 16;

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

function stopTranslation(axis, direction) {
  const key = axis + direction;
  clearInterval(translationTimers[key]);
  translationTimers[key] = null;
}

function bindTranslationButton(id, axis, dir) {
  const btn = document.getElementById(id);

  btn.addEventListener("mousedown", () => startTranslation(axis, dir));
  btn.addEventListener("mouseup", () => stopTranslation(axis, dir));
  btn.addEventListener("mouseleave", () => stopTranslation(axis, dir));

}

bindTranslationButton("tx-plus", "x", "+");
bindTranslationButton("tx-minus", "x", "-");
bindTranslationButton("ty-plus", "y", "+");
bindTranslationButton("ty-minus", "y", "-");
bindTranslationButton("tz-plus", "z", "+");
bindTranslationButton("tz-minus", "z", "-");




var idIntervalHomothetie = null;

function startHomothetie(direction) {
    if (!forme3D) return;

    idIntervalHomothetie = setInterval(() => {
      let factor = direction === "+" ? 1.01 : 0.99;
        homothetie3D(forme3D, factor);
    }, 16);
}

function stopHomothetie() {
  clearInterval(idIntervalHomothetie);
  idIntervalHomothetie = null;
}

function bindHomothetieButton(id, direction) {
  const btn = document.getElementById(id);
  let factor = direction === "+" ? 1.1 : 0.9;

  btn.addEventListener("mousedown", () => startHomothetie(direction));
  btn.addEventListener("mouseup", () => stopHomothetie());
  btn.addEventListener("mouseleave", () => stopHomothetie());
  btn.addEventListener("click", () => {
    if (!forme3D) return;
    homothetie3D(forme3D, factor);
  });

}

bindHomothetieButton("homothetie-plus", "+");
bindHomothetieButton("homothetie-minus", "-");