import {Forme} from "../forme.js";

//TODO changement de l'épaisseur des projections

/**
 * Methode pour effectuer une homothétie sur une forme (peu importe la dimension)
 * 
 * @param {Forme} forme 
 * @param {Number} factor 
 * @returns 
 */
function homothetie (forme, factor) {

    //homothetie par rapport au centre de la forme
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
    homothetie
}