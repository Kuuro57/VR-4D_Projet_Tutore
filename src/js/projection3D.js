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
     * @param {Sommet[]} sommets
     * @param {Arete[]} aretes
     * @param {FaceCarre[]} faces
     * @param {BABYLON.Camera} camera3D
     * @param {String} axe
     */
    constructor(nom, sommets, aretes, faces, camera3D, axe, recentre = false) {
        super(nom, sommets, aretes);
        this.faces = faces;
        this.camera3D = camera3D;
        this.axe = axe;
        this.recentre = recentre;
    }



    /**
     * Méthode qui met à jour la projection 3D en fonction de la forme 4D parente
     */
    update() {
        const focal = 1.0;

        // Position de la caméra sur l'axe de profondeur choisi
        const camPos = 2.0;

        // helper pour retrouver les sommets par leur nom
        const getS = (name) => this.sommets.find(s => s.name === name);

        const centre4D = this.recentre ? this.formeParente.getVectorCenter() : null;

        this.formeParente.sommets.forEach(s4 => {
            // Coordonnées 4D (centrées si demandé)
            const x = s4.vector.x - (centre4D?.x ?? 0);
            const y = s4.vector.y - (centre4D?.y ?? 0);
            const z = s4.vector.z - (centre4D?.z ?? 0);
            const w = s4.vector.w - (centre4D?.w ?? 0);

            // depth = coordonnée aplatie, et (a,b,c) = coordonnées gardées
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
            if (0 < denom && denom < 1e-6) {
                denom = 1e-6;
            } else if(-1e-6< denom && denom <0) {
                denom = -1e-6;
            }

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
    }


}



//Export
export { 
    Projection3D
};