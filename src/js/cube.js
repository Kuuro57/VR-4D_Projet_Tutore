import { Sommet } from "./sommet.js";
import { Arete } from "./arete.js";

/**
 * Classe représentant un cube en 3D
 */
class Cube {

    /**
     * Liste des sommets définis dans sommet.js
     */
    sommets;

    /**
     * Liste des arêtes définies dans arete.js
     */
    aretes;

    /**
     * Constructeur du cube
     * @param {Sommet[]} sommetsParameters 
     * @param {Arete[]} aretesParameters 
     */
    constructor(sommetsParameters, aretesParameters) {
        this.sommets = sommetsParameters;
        this.aretes = aretesParameters;
    }

    /**
     * Methode d'affichage du cube dans la scène
     * @param {BABYLON.Scene} scene 
     */
    build(scene) {
        this.sommets.forEach(sommet => {
            sommet.build(scene);
        });
        this.aretes.forEach(arete => {
            arete.build(scene);
        });
    }

}


// Export
export {
    Cube
}