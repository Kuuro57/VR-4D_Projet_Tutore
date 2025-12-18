import { Forme } from "./forme.js";
import { camera } from "./main.js";

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
    constructor(nom, sommetsParameters, aretesParameters) {
        super(nom, sommetsParameters, aretesParameters);
    }



    /**
     * Met à jour la forme (points et arêtes) dans l'espace 3D
     */
    update() {
        const focal = 1.0;
        const wCam  = 2.0;      // IMPORTANT : > max(|w|)
        const getS = (name) => this.sommets.find(s => s.name === name);

        this.formeParente.sommets.forEach(s4 => {
            const denom = (wCam - s4.vector.w);
            const scale = focal / denom;

            const s3 = getS(s4.name);
            s3.vector.x = s4.vector.x * scale;
            s3.vector.y = s4.vector.y * scale;
            s3.vector.z = s4.vector.z * scale;
            s3.update();
        });

        this.aretes.forEach(a => a.update());
        this.faces.forEach(f => f.update?.());
    }


}



//Export
export { 
    Projection3D
};