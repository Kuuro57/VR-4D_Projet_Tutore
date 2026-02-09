import {Forme} from "../formes/forme.js";

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
        const diff = sommet.vector.subtract(center);
        
        // forme 4D pas de scale de w
        if (sommet.vector.w !== undefined) {
            const scaledDiff = diff.scale(factor);
            sommet.vector.x = center.x + scaledDiff.x;
            sommet.vector.y = center.y + scaledDiff.y;
            sommet.vector.z = center.z + scaledDiff.z;
            // w reste inchangé : sommet.vector.w = sommet.vector.w
        } else {
            // Pour les formes 3D, homothétie normale
            sommet.vector = center.add(diff.scale(factor));
        }
        
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