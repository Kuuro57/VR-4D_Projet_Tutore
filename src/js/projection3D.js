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
     * Méthode qui met à jour la projection 3D en fonction de la forme 4D parente
     */
    update() {
        const focal = 1.0;
        const wCam  = 2.0;

        //helper pour retrouver les sommets par leur nom
        const getS = (name) => this.sommets.find(s => s.name === name);

        // projection 4D -> 3D
        this.formeParente.sommets.forEach(s4 => {
            const denom = (wCam - s4.vector.w);
            const scale = focal / denom;

            const s3 = getS(s4.name);
            s3.vector.x = s4.vector.x * scale;
            s3.vector.y = s4.vector.y * scale;
            s3.vector.z = s4.vector.z * scale;
            s3.update();
        });

        // mise à jour des arêtes et faces
        this.aretes.forEach(a => a.update());
        this.faces.forEach(f => f.update?.());
        
        // mise à jour récursive des projections
        if (this.projection2D) this.projection2D.update();
    }


}



//Export
export { 
    Projection3D
};