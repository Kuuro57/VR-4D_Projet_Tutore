import { Forme } from "./forme.js";

/**
 * Classe représentant une projection 2D d'une forme 3D
 */
class Projection2D extends Forme {

    /**
     * @type {Forme}
     * Forme qui correspond à la forme 3D dont on a fait la projection en 2D
     */
    formeParente;
    camera2D;
    
    /**
     * Constructeur de la forme
     * @param {String} nom
     * @param {Sommet[]} sommetsParameters 
     * @param {Arete[]} aretesParameters 
     */
    constructor(nom, sommets, aretes, camera2D) {
    super(nom, sommets, aretes);
    this.camera2D = camera2D;
  }

    /**
     * Met à jour la forme (points et arêtes) dans l'espace 3D
     */
    update() {
        const baseScale = 1;
        const depthScale = 0.2;

        let getS = (name) => this.sommets.find(s => s.name === name);
        
        // moyenne des Z pour stabiliser
        let avgZ = 0;
        this.formeParente.sommets.forEach(s => avgZ += s.vector.z);
        avgZ /= this.formeParente.sommets.length;

        let scale = baseScale - avgZ * depthScale;

        // éviter les échelles négatives ou nulles
        scale = Math.max(0.1, scale);

        this.formeParente.sommets.forEach(sommet => {

            // Calcul de la position relative du sommet par rapport à la caméra
            let relativeX = sommet.vector.x - this.camera2D.position.x;
            let relativeY = sommet.vector.y - this.camera2D.position.y;
            
            // Application de la projection
            let x2D = (relativeX * scale);
            let y2D = (relativeY * scale);

            let s2D = getS(sommet.name);
            s2D.vector.set(x2D, y2D, 0);

            // Update des sommets
            s2D.update();
        });

        // Update des arêtes
        this.aretes.forEach(a => a.update())
    }

}



//Export
export { 
    Projection2D
};