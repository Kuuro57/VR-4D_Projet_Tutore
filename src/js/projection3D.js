import { Forme } from "./forme.js";

/**
 * Classe représentant une projection 3D d'une forme 4D
 */
class Projection3D extends Forme {

    /**
     * @type {Forme}
     * Forme qui correspond à la forme 4D dont on a fait la projection en 3D
     */
    formeParente;

    /**
     * Constructeur de la forme
     * @param {String} nom
     * @param {Sommet[]} sommetsParameters 
     * @param {Arete[]} aretesParameters 
     */
    constructor(nom, sommets, aretes, camera3D) {
    super(nom, sommets, aretes);
    this.camera3D = camera3D;
  }



    /**
     * Met à jour la forme (points et arêtes) dans l'espace 3D
     */
    update() {

        let focal = 4;
        let getS = (name) => this.sommets.find(s => s.name === name);
        
        this.formeParente.sommets.forEach(sommet => {

            // Calcul de la position relative du sommet par rapport à la caméra
            let relativeX = sommet.vector.x - this.camera3D.position.x;
            let relativeY = sommet.vector.y - this.camera3D.position.y;
            let relativeZ = sommet.vector.z - this.camera3D.position.z;
            let relativeW = sommet.vector.w - 0; // Supposons que la caméra est à w=0

            // Empêcher la division par zéro
            if (relativeW <= 0.1) relativeW = 0.1; 

            // Application de la projection
            let x3D = (relativeX / relativeW) * focal;
            let y3D = (relativeY / relativeW) * focal;
            let z3D = (relativeZ / relativeW) * focal;
            let sommetForme3D = getS(sommet.name);
            sommetForme3D.vector = new BABYLON.Vector3(x3D, y3D, z3D);

            // Update des sommets
            sommetForme3D.update();

        });

        // Update des arêtes
        this.aretes.forEach(arete => {
            arete.update();
        });

    }

}



//Export
export { 
    Projection3D
};