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

    /**
     * @type {BABYLON.Camera}
     * Camera qui visualise la projection
     */
    camera2D;

    /**
     * @type {String}
     * Axe que l'on applatit pour projeter la forme 3D en 2D
     */
    axe;
    




    /**
     * Constructeur de la forme
     * @param {String} nom
     * @param {Sommet[]} sommetsParameters 
     * @param {Arete[]} aretesParameters
     * @param {String} axe
     */
    constructor(nom, sommets, aretes, camera2D, axe) {
        super(nom, sommets, aretes);
        this.camera2D = camera2D;
        this.axe = axe;
    }





    /**
     * Met à jour la forme (points et arêtes) dans l'espace 3D
     */
    update() {

        const centre3D = this.formeParente.getVectorCenter();
        
        const getS = (name) => this.sommets.find(s => s.name === name);

        this.formeParente.sommets.forEach(sommet => {

            // Calcul des nouvelles coordonnées
            let localX = sommet.vector.x - centre3D.x;
            let localY = sommet.vector.y - centre3D.y;
            let localZ = sommet.vector.z - centre3D.z;

            const s2D = getS(sommet.name);

            switch(this.axe) {
                case 'x': 
                    s2D.vector.set(0, localY, localZ); 
                    break;
                case 'y': 
                    s2D.vector.set(localX, 0, localZ); 
                    break;
                case 'z': 
                    s2D.vector.set(localX, localY, 0); 
                    break;
            }

            // Mise à jour du sommet
            s2D.update();
        });

        // Mise à jour des arêtes
        this.aretes.forEach(a => a.update());
    }
}



//Export
export { 
    Projection2D
};