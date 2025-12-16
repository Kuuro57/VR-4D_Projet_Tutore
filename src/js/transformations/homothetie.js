import {Forme} from "../forme.js";

/**
 * Methode pour effectuer une homothétie sur une forme 3D
 * 
 * @param {Forme} forme 
 * @param {Number} factor 
 * @returns 
 */
function homothetie3D (forme, factor) {

    // Pour chaque sommet de la forme, on applique l'homothétie
    forme.sommets.forEach(sommet => {
        // On multiplie chaque coordonnée par le facteur
        sommet.vector.x *= factor;
        sommet.vector.y *= factor;
        sommet.vector.z *= factor;
    });

    // On met à jour la forme

    forme.update();

}


// Export
export {
    homothetie3D
}