import { Forme } from "../formes/forme.js";

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
     * @param {Sommet[]} sommets
     * @param {FaceCarre[]} faces
     * @param {Arete[]} aretes
     * @param {BABYLON.Camera} camera2D
     * @param {String} axe
     * @param {BABYLON.Vector3} initialPosition
     */
    constructor(nom, sommets, faces, aretes, camera2D, axe, initialPosition = null) {
        super(nom, sommets, aretes);
        this.faces = faces;
        this.camera2D = camera2D;
        this.axe = axe;
        this.initialPosition = initialPosition;

    }





    /**
     * Met à jour la forme (points et arêtes) dans l'espace 3D
     */
    update() {

        const centre3D = this.formeParente.getVectorCenter();
        
        const getS = (name) => this.sommets.find(s => s.name === name);

        // Calcule la taille actuelle de la forme parente
        let tailleActuelle = 0;
        this.formeParente.sommets.forEach(sommet => {
            const dist = Math.sqrt(
                Math.pow(sommet.vector.x - centre3D.x, 2) +
                Math.pow(sommet.vector.y - centre3D.y, 2) +
                Math.pow(sommet.vector.z - centre3D.z, 2)
            );
            tailleActuelle = Math.max(tailleActuelle, dist);
        });

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
        
        if (this.initialPosition) {
            this.moveCenterToInitialPosition();
        }

        // Mise à jour des arêtes
        this.sommets.forEach(s => s.update());
        this.aretes.forEach(a => a.update());
        this.faces.forEach(f => f.update?.());

    }


    /**
     * 
     * @param {*} position 
     */
    moveCenterToInitialPosition() {

        const offset = this.initialPosition.subtract(this.getVectorCenter());
        this.sommets.forEach(s => {
            s.vector.x += offset.x;
            s.vector.y += offset.y;
            s.vector.z += offset.z;
        });

    }

}



//Export
export { 
    Projection2D
};