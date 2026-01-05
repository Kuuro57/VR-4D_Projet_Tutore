import { rotation3D } from "./transformations/rotations.js";
import { translation } from "./transformations/translations.js";
import { homothetie } from "./transformations/homothetie.js";

const REGLAGES = {
    vitesseDeplacement: 0.05,
    vitesseRafraichissement: 16,
    vitesseRotation: 10,
    grossissement: 1.01,
    retrait: 0.99
};

const memoire = {
    formePrincipale: null,
    listeDesProjections2D: [],
    facesVisibles: false,
    filDeFerVisible: false
};

// Stockage des chronomètres
const chronos = {
    rotation: { x: null, y: null, z: null },
    translation: {}, 
    homothetie: { plus: null, moins: null }
};





/**
 * Configure les formes de départ et active les boutons du HTML
 */
export function initControls({ forme3D, forme4D, camera3D, scene3D }) {
    memoire.formePrincipale = forme3D;
    activerBoutons();
}

/**
 * Ajoute une vue 2D à la liste pour qu'elle puisse réagir aux rotations
 */
export function registerProjection(projection) {
    memoire.listeDesProjections2D.push(projection);
}





/**
 * Applique une action (comme tourner) à tout le monde
 */
function rotationSelonAxe(axe) {
    if (!memoire.formePrincipale) return;

    // 1. On fait tourner la forme 3D
    rotation3D(memoire.formePrincipale, axe);

    // 2. On demande à chaque vue 2D de se mettre à jour
    memoire.listeDesProjections2D.forEach(proj => proj.update());
}

/**
 * Applique une action (bouger ou zoomer) uniquement sur la forme principale
 */
function transformation(transformationFn) {
    if (!memoire.formePrincipale) return;
    
    transformationFn(memoire.formePrincipale);

    // Rafraichissement des projections
    memoire.listeDesProjections2D.forEach(proj => proj.update());
}





function gererRotation(axe, idBouton) {
    const bouton = document.getElementById(idBouton);

    if (chronos.rotation[axe]) {
        // Si ça tourne déjà, on arrête
        clearInterval(chronos.rotation[axe]);
        chronos.rotation[axe] = null;
        bouton.textContent = `Rotation ${axe.toUpperCase()}`;
    } else {
        // Sinon, on lance le mouvement répétitif
        chronos.rotation[axe] = setInterval(() => {
            rotationSelonAxe(axe);
        }, REGLAGES.vitesseRotation);
        bouton.textContent = `Stop ${axe.toUpperCase()}`;
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
            const cible = f.formeParente ?? f;
            const v0 = cible.sommets?.[0]?.vector;
            const vecteur = (v0 instanceof BABYLON.Vector4)
                ? new BABYLON.Vector4(0, 0, 0, 0)
                : new BABYLON.Vector3(0, 0, 0);
            
            vecteur[axe] = (direction === "+") ? REGLAGES.vitesseDeplacement : -REGLAGES.vitesseDeplacement;
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
        const force = (direction === "+") ? REGLAGES.grossissement : REGLAGES.retrait;
        // Ici aussi, on ne change que la 3D
        transformation((f) => {
            homothetie(f.formeParente ?? f, force);
        });
    }, REGLAGES.vitesseRafraichissement);
}




function activerBoutons() {
    // Boutons de rotation
    ["x", "y", "z"].forEach(axe => {
        const id = `btn-rotation-${axe}`;
        document.getElementById(id).onclick = () => gererRotation(axe, id);
    });

    // Boutons de déplacement
    ["x", "y", "z"].forEach(axe => {
        ["plus", "minus"].forEach(dir => {
            const btn = document.getElementById(`t${axe}-${dir}`);
            const signe = (dir === "plus") ? "+" : "-";
            btn.onmousedown = () => gererDeplacement(axe, signe, true);
            btn.onmouseup = btn.onmouseleave = () => gererDeplacement(axe, signe, false);
        });
    });

    // Boutons de Zoom (homotéthie)
    ["plus", "minus"].forEach(dir => {
        const btn = document.getElementById(`homothetie-${dir}`);
        const signe = (dir === "plus") ? "+" : "-";
        btn.onmousedown = () => gererHomotethie(signe, true);
        btn.onmouseup = btn.onmouseleave = () => gererHomotethie(signe, false);
    });

    // Boutons d'affichage (Faces et Fil de fer)
    document.getElementById("btn-faces-toggle").onclick = (e) => {
        memoire.facesVisibles = !memoire.facesVisibles;
        memoire.formePrincipale.toggleFaces?.(memoire.facesVisibles);
        e.target.textContent = memoire.facesVisibles ? "Cacher les faces" : "Afficher les faces";
    };

    document.getElementById("btn-wire-toggle").onclick = (e) => {
        memoire.filDeFerVisible = !memoire.filDeFerVisible;
        memoire.formePrincipale.toggleWireframe?.(memoire.filDeFerVisible);
        e.target.textContent = memoire.filDeFerVisible ? "Cacher fil de fer" : "Afficher fil de fer";
    };

    window.onmouseup = () => {
        Object.keys(chronos.translation).forEach(k => gererDeplacement(k[0], k[1], false));
        gererHomotethie("+", false);
        gererHomotethie("-", false);
    };
}