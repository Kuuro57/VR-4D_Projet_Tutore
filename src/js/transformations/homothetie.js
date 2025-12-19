import {Forme} from "../forme.js";

//TODO changement de l'épaisseur des projections

/**
 * Methode pour effectuer une homothétie sur une forme 3D
 * 
 * @param {Forme} forme 
 * @param {Number} factor 
 * @returns 
 */
function homothetie3D (forme, factor) {

    const center = forme.getVectorCenter();

    // Sommets : position + taille
    forme.sommets.forEach((sommet) => {
        sommet.vector = center.add(sommet.vector.subtract(center).scale(factor));
        sommet.scale *= factor;
    });

    // Epaisseur des arêtes
    forme.aretes.forEach((arete) => {
        arete.radius *= factor;
    });

    // On met à jour la forme
    forme.update();

}


// Export
export {
    homothetie3D
}