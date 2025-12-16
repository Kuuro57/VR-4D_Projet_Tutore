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

    document.getElementById("btn-translation").addEventListener("click", () => {
    if (!forme3D) return;
    translation3D(forme3D, new BABYLON.Vector3(0.1, 0, 0));
  });

    document.getElementById("btn-homothetie").addEventListener("click", () => {
    if (!forme3D) return;
    homothetie3D(forme3D, 1.1);
  });
});