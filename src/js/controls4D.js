import { rotation4D } from "./transformations/rotations.js";
import { translation } from "./transformations/translations.js";
import { homothetie } from "./transformations/homothetie.js";

const REGLAGES = {
  vitesseDeplacement: 0.05,
  vitesseRafraichissement: 16,
  vitesseRotation: 10,
  grossissement: 1.01,
  retrait: 0.99,
};

// Plans de rotation en 4D
const PLANS_4D = ["xy", "xz", "xw", "yz", "yw", "zw"];

const memoire = {
  formePrincipale: null, // ici : forme 4D (ou éventuellement une projection qui a formeParente)
  listeDesProjections2D: [],
  facesVisibles: true,
  filDeFerVisible: true,
};

// Stockage des chronomètres
const chronos = {
  rotation: Object.fromEntries(PLANS_4D.map((p) => [p, null])),
  translation: {},
  homothetie: { "+": null, "-": null },
};

/**
 * Configure les formes de départ et active les boutons du HTML
 */
export function initControls({ forme3D, forme4D, projectionPrincipale, camera3D, scene3D }) {
  // Version 4D : on pilote la forme 4D via sa projection principale (qui porte les meshes visibles)
  memoire.formePrincipale = projectionPrincipale ?? forme4D;
  activerBoutons();
}

/**
 * Ajoute une vue 2D (ou toute projection) à la liste pour qu'elle puisse réagir aux transformations
 */
export function registerProjection(projection) {
  memoire.listeDesProjections2D.push(projection);
}

/**
 * Applique une rotation 4D selon un plan donné, puis rafraîchit toutes les projections
 */
function rotationSelonPlan(plan) {
  if (!memoire.formePrincipale) return;

  // Si on pilote une projection, on remonte à la forme 4D parente si dispo
  const cible = memoire.formePrincipale.formeParente ?? memoire.formePrincipale;

  rotation4D(cible, plan);

  // Mise à jour des projections
  memoire.listeDesProjections2D.forEach((proj) => proj.update());
}

/**
 * Applique une transformation (translation / homothétie) sur la forme principale,
 * puis rafraîchit toutes les projections
 */
function transformation(transformationFn) {
  if (!memoire.formePrincipale) return;

  transformationFn(memoire.formePrincipale);

  memoire.listeDesProjections2D.forEach((proj) => proj.update());
}

function gererRotation(plan, idBouton) {
  const bouton = document.getElementById(idBouton);

  if (chronos.rotation[plan]) {
    clearInterval(chronos.rotation[plan]);
    chronos.rotation[plan] = null;
    bouton.textContent = `Rotation ${plan.toUpperCase()}`;
  } else {
    chronos.rotation[plan] = setInterval(() => {
      rotationSelonPlan(plan);
    }, REGLAGES.vitesseRotation);
    bouton.textContent = `Stop ${plan.toUpperCase()}`;
  }
}

function gererDeplacement(axe, direction, demarrer) {
  const clef = axe + direction;

  if (!demarrer) {
    clearInterval(chronos.translation[clef]);
    chronos.translation[clef] = null;
    return;
  }

  if (chronos.translation[clef]) return;

  chronos.translation[clef] = setInterval(() => {
    transformation((f) => {
      // si f est une projection, on translate la parente (forme 4D) si elle existe
      const cible = f.formeParente ?? f;

      // 4D => Vector4 (on garde un fallback Vector3 au cas où)
      const v0 = cible.sommets?.[0]?.vector;
      const vecteur =
        v0 instanceof BABYLON.Vector4
          ? new BABYLON.Vector4(0, 0, 0, 0)
          : new BABYLON.Vector3(0, 0, 0);

      vecteur[axe] =
        direction === "+" ? REGLAGES.vitesseDeplacement : -REGLAGES.vitesseDeplacement;

      translation(cible, vecteur);
    });
  }, REGLAGES.vitesseRafraichissement);
}

function gererHomotethie(direction, demarrer) {
  if (!demarrer) {
    clearInterval(chronos.homothetie[direction]);
    chronos.homothetie[direction] = null;
    return;
  }

  if (chronos.homothetie[direction]) return;

  chronos.homothetie[direction] = setInterval(() => {
    const force = direction === "+" ? REGLAGES.grossissement : REGLAGES.retrait;

    transformation((f) => {
      const cible = f.formeParente ?? f;
      homothetie(cible, force);
    });
  }, REGLAGES.vitesseRafraichissement);
}

function activerBoutons() {
  // Boutons de rotation 4D
  // IDs attendus : btn-rotation-xy, btn-rotation-xz, ..., btn-rotation-zw
  PLANS_4D.forEach((plan) => {
    const id = `btn-rotation-${plan}`;
    const btn = document.getElementById(id);
    if (!btn) return;
    btn.onclick = () => gererRotation(plan, id);
  });

  // Boutons de déplacement 4D
  // IDs attendus : tx-plus / tx-minus, ..., tw-plus / tw-minus
  ["x", "y", "z", "w"].forEach((axe) => {
    ["plus", "minus"].forEach((dir) => {
      const btn = document.getElementById(`t${axe}-${dir}`);
      if (!btn) return;

      const signe = dir === "plus" ? "+" : "-";
      btn.onmousedown = () => gererDeplacement(axe, signe, true);
      btn.onmouseup = btn.onmouseleave = () => gererDeplacement(axe, signe, false);
    });
  });

  // Boutons de zoom (homothétie)
  ["plus", "minus"].forEach((dir) => {
    const btn = document.getElementById(`homothetie-${dir}`);
    if (!btn) return;

    const signe = dir === "plus" ? "+" : "-";
    btn.onmousedown = () => gererHomotethie(signe, true);
    btn.onmouseup = btn.onmouseleave = () => gererHomotethie(signe, false);
  });

  // Boutons d'affichage (Faces et Fil de fer)
  document.getElementById("btn-faces-toggle")?.addEventListener("click", (e) => {
    memoire.facesVisibles = !memoire.facesVisibles;

    // Propage sur la forme principale + toutes les projections enregistrées
    getTargets().forEach((cible) => cible?.toggleFaces?.(memoire.facesVisibles));

    e.target.textContent = memoire.facesVisibles ? "Cacher les faces" : "Afficher les faces";
  });

  document.getElementById("btn-wire-toggle")?.addEventListener("click", (e) => {
    memoire.filDeFerVisible = !memoire.filDeFerVisible;

    getTargets().forEach((cible) => cible?.toggleWireframe?.(memoire.filDeFerVisible));

    e.target.textContent = memoire.filDeFerVisible ? "Cacher fil de fer" : "Afficher fil de fer";
  });

  // Sécurité : relâchement souris => stop déplacements + zoom
  window.onmouseup = () => {
    Object.keys(chronos.translation).forEach((k) => gererDeplacement(k[0], k[1], false));
    gererHomotethie("+", false);
    gererHomotethie("-", false);
  };
}

// Retourne l'ensemble des formes sur lesquelles appliquer l'affichage (projection principale + projections enregistrées)
function getTargets() {
  const candidates = [memoire.formePrincipale, memoire.formePrincipale?.formeParente, ...memoire.listeDesProjections2D];
  return Array.from(new Set(candidates.filter(Boolean)));
}
