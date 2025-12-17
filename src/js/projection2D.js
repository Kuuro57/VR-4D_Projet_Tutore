import { Forme } from "./forme.js";
import { camera } from "./main.js";

/**
 * Classe représentant une projection 2D d'une forme 3D
 */
class Projection2D extends Forme {

    /**
     * @type {Forme}
     * Forme qui correspond à la forme 3D dont on a fait la projection en 2D
     */
    formeParente;

    /**
     * Constructeur de la forme
     * @param {String} nom
     * @param {Sommet[]} sommetsParameters 
     * @param {Arete[]} aretesParameters 
     */
    constructor(nom, sommetsParameters, aretesParameters) {
        super(nom, sommetsParameters, aretesParameters);
    }



    /**
     * Met à jour la forme (points et arêtes) dans l'espace 3D
     */
    update() {

        let focal = 4;
        let getS = (name) => this.sommets.find(s => s.name === name);
        
        this.formeParente.sommets.forEach(sommet => {

            // Calcul de la position relative du sommet par rapport à la caméra
            let relativeX = sommet.vector.x - camera.position.x;
            let relativeY = sommet.vector.y - camera.position.y;
            let relativeZ = sommet.vector.z - camera.position.z;

            // Empêcher la division par zéro
            if (relativeZ <= 0.1) relativeZ = 0.1; 

            // Application de la projection
            let x2D = (relativeX / relativeZ) * focal;
            let y2D = (relativeY / relativeZ) * focal;

            let sommetForme2D = getS(sommet.name);
            sommetForme2D.vector = new BABYLON.Vector3(x2D, y2D, 0);

            // Update des sommets
            sommetForme2D.update();

        });

        // Update des arêtes
        this.aretes.forEach(arete => {
            arete.update();
        });

    }

}



//Export
export { 
    Projection2D
};