import { rotation3D } from "./transformations/rotations.js";
import { translation } from "./transformations/translations.js";
import { homothetie } from "./transformations/homothetie.js";




// --- CONFIGURATION & ETAT ---
const CONFIG = {
    STEP: 0.05,
    INTERVAL: 16,
    ROT_INTERVAL: 10,
    SCALE_PLUS: 1.01,
    SCALE_MINUS: 0.99
};




// On stocke l'état ici pour y accéder depuis les événements DOM
const state = {
    formeActive: null,
    forme4D: null,
    camera3D: null,
    scene3D: null,
    projections: [], 
    facesVisible: false,
    wireVisible: false
};




const timers = {
    rotation: { x: null, y: null, z: null },
    translation: {}, // ex: { "x+": id }
    homothetie: { "+": null, "-": null }
};




/**
 * Initialise les références et les événements (A APPELER UNE SEULE FOIS)
 */
export function initControls({ forme3D, forme4D, camera3D, scene3D }) {
    state.formeActive = forme3D;
    state.forme4D = forme4D;
    state.camera3D = camera3D;
    state.scene3D = scene3D;

    setupEventListeners();
}




/**
 * Enregistre une nouvelle projection 2D pour qu'elle soit mise à jour
 */
export function registerProjection(projection) {
    state.projections.push(projection);
}




// --- LOGIQUE DE TRANSFORMATION ---

function applyToAll(transformFn) {
    if (!state.formeActive) return;
    
    // Appliquer à la forme principale
    transformFn(state.formeActive);

    // Mettre à jour toutes les projections 2D
    state.projections.forEach(proj => {
        proj.update(); 
    });
}



function toggleRotation(axis, btnId) {
    const btn = document.getElementById(btnId);

    if (timers.rotation[axis]) {
        clearInterval(timers.rotation[axis]);
        timers.rotation[axis] = null;
        btn.textContent = `Rotation ${axis.toUpperCase()}`;
    } else {
        timers.rotation[axis] = setInterval(() => {
            applyToAll((f) => rotation3D(f, axis));
        }, CONFIG.ROT_INTERVAL);
        btn.textContent = `Stop ${axis.toUpperCase()}`;
    }
}



function handleTranslation(axis, direction, start = true) {
    const key = axis + direction;
    if (!start) {
        clearInterval(timers.translation[key]);
        timers.translation[key] = null;
        return;
    }

    if (timers.translation[key]) return;

    timers.translation[key] = setInterval(() => {
        applyToAll((f) => {
            const target = f.formeParente ?? f;
            const v0 = target.sommets?.[0]?.vector;
            const v = (v0 instanceof BABYLON.Vector4)
                ? new BABYLON.Vector4(0, 0, 0, 0)
                : new BABYLON.Vector3(0, 0, 0);
            
            v[axis] = direction === "+" ? CONFIG.STEP : -CONFIG.STEP;
            translation(target, v);
        });
    }, CONFIG.INTERVAL);
}



function handleScale(direction, start = true) {
    if (!start) {
        clearInterval(timers.homothetie[direction]);
        timers.homothetie[direction] = null;
        return;
    }

    if (timers.homothetie[direction]) return;

    timers.homothetie[direction] = setInterval(() => {
        const factor = direction === "+" ? CONFIG.SCALE_PLUS : CONFIG.SCALE_MINUS;
        applyToAll((f) => homothetie(f.formeParente ?? f, factor));
    }, CONFIG.INTERVAL);
}




// --- EVENEMENTS ---

function setupEventListeners() {
    // Rotations
    ["x", "y", "z"].forEach(axis => {
        document.getElementById(`btn-rotation-${axis}`).onclick = () => toggleRotation(axis, `btn-rotation-${axis}`);
    });

    // Translations
    ["x", "y", "z"].forEach(axis => {
        ["plus", "minus"].forEach(dir => {
            const btn = document.getElementById(`t${axis}-${dir}`);
            const symbol = dir === "plus" ? "+" : "-";
            btn.onmousedown = () => handleTranslation(axis, symbol, true);
            btn.onmouseup = btn.onmouseleave = () => handleTranslation(axis, symbol, false);
        });
    });

    // Homothétie
    ["plus", "minus"].forEach(dir => {
        const btn = document.getElementById(`homothetie-${dir}`);
        const symbol = dir === "plus" ? "+" : "-";
        btn.onmousedown = () => handleScale(symbol, true);
        btn.onmouseup = btn.onmouseleave = () => handleScale(symbol, false);
    });

    // Toggles Visuels
    document.getElementById("btn-faces-toggle").onclick = (e) => {
        state.facesVisible = !state.facesVisible;
        state.formeActive.toggleFaces?.(state.facesVisible);
        e.target.textContent = state.facesVisible ? "Cacher les faces" : "Afficher les faces";
    };

    document.getElementById("btn-wire-toggle").onclick = (e) => {
        state.wireVisible = !state.wireVisible;
        state.formeActive.toggleWireframe?.(state.wireVisible);
        e.target.textContent = state.wireVisible ? "Cacher fil de fer" : "Afficher fil de fer";
    };

    // Global stop
    window.onmouseup = () => {
        Object.keys(timers.translation).forEach(k => handleTranslation(k[0], k[1], false));
        handleScale("+", false);
        handleScale("-", false);
    };
}