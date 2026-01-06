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
     * @type {BABYLON.Camera}
     * Camera qui visualise la projection
     */
    camera3D;

    /**
     * @type {String}
     * Axe que l'on applatit pour projeter la forme 4D en 3D
     */
    axe;

    /**
     * Constructeur de la forme
     * @param {String} nom
     * @param {Sommet[]} sommetsParameters 
     * @param {Arete[]} aretesParameters 
     * @param {BABYLON.Camera} camera3D
     * @param {String} axe
     */
    constructor(nom, sommets, aretes, camera3D, axe) {
        super(nom, sommets, aretes);
        this.camera3D = camera3D;
        this.axe = axe;
    }



    /**
     * Méthode qui met à jour la projection 3D en fonction de la forme 4D parente
     */
    update() {
        const focal = 1.0;

        // Position de la caméra sur l'axe de profondeur choisi
        const camPos = 2.0;

        const EPS = 1e-6;

        // helper pour retrouver les sommets par leur nom
        const getS = (name) => this.sommets.find(s => s.name === name);

        this.formeParente.sommets.forEach(s4 => {
            // Coordonnées 4D
            const x = s4.vector.x;
            const y = s4.vector.y;
            const z = s4.vector.z;
            const w = s4.vector.w;

            // depth = coordonnée "aplaties"/profondeur, et (a,b,c) = coordonnées gardées
            let depth, a, b, c;

            switch (this.axe) {
                case 'x': // on "aplatit" X => on garde (Y,Z,W) -> (X,Y,Z)
                    depth = x; a = y; b = z; c = w;
                    break;

                case 'y': // on "aplatit" Y => on garde (X,Z,W)
                    depth = y; a = x; b = z; c = w;
                    break;

                case 'z': // on "aplatit" Z => on garde (X,Y,W)
                    depth = z; a = x; b = y; c = w;
                    break;

                case 'w':
                default:  // cas standard : on "aplatit" W => on garde (X,Y,Z)
                    depth = w; a = x; b = y; c = z;
                    break;
            }

            // Projection perspective le long de l'axe choisi
            let denom = (camPos - depth);
            if (Math.abs(denom) < EPS) denom = (denom >= 0 ? EPS : -EPS);

            const scale = focal / denom;

            const s3 = getS(s4.name);
            s3.vector.x = a * scale;
            s3.vector.y = b * scale;
            s3.vector.z = c * scale;
            s3.update();
        });

        // mise à jour des arêtes et faces
        this.aretes.forEach(a => a.update());
        this.faces.forEach(f => f.update?.());

        // mise à jour récursive des projections
        //if (this.projection2D) this.projection2D.update();
    }


}



//Export
export { 
    Projection3D
};