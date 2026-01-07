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
     * @type {Number}
     * Taille de référence pour normaliser la projection (pour ne pas être affecté par l'homothétie)
     */
    tailleReference;

    /**
     * @type {Boolean}
     * Indique si cette projection est la projection principale (non normalisée) ou secondaire (normalisée)
     */
    isPrincipale;

    /**
     * Constructeur de la forme
     * @param {String} nom
     * @param {Sommet[]} sommets
     * @param {Arete[]} aretes
     * @param {FaceCarre[]} faces
     * @param {BABYLON.Camera} camera3D
     * @param {String} axe
     * @param {Boolean} isPrincipale Indique si c'est la projection principale (true) ou secondaire (false)
     */
    constructor(nom, sommets, aretes, faces, camera3D, axe, isPrincipale = false) {
        super(nom, sommets, aretes);
        this.faces = faces;
        this.camera3D = camera3D;
        this.axe = axe;
        this.isPrincipale = isPrincipale;
        this.tailleReference = null;
    }



    /**
     * Méthode qui met à jour la projection 3D en fonction de la forme 4D parente
     */
    update() {
        const focal = 1.0;

        // Position de la caméra sur l'axe de profondeur choisi
        const camPos = 2.0;

        // Variables pour la normalisation (seulement pour les projections secondaires)
        let centre4D, tailleActuelle, facteurNormalisation;

        // Si c'est une projection secondaire, on normalise pour annuler translations et homothéties
        if (!this.isPrincipale) {
            // Calcul du centre de la forme parente 4D
            centre4D = this.formeParente.getVectorCenter();

            // Calcule la taille actuelle de la forme parente
            tailleActuelle = 0;
            this.formeParente.sommets.forEach(sommet => {
                const dist = Math.sqrt(
                    Math.pow(sommet.vector.x - centre4D.x, 2) +
                    Math.pow(sommet.vector.y - centre4D.y, 2) +
                    Math.pow(sommet.vector.z - centre4D.z, 2) +
                    Math.pow(sommet.vector.w - centre4D.w, 2)
                );
                tailleActuelle = Math.max(tailleActuelle, dist);
            });

            // Initialise la taille de référence au premier update
            if (this.tailleReference === null) {
                this.tailleReference = tailleActuelle;
            }

            // Calcule le facteur de normalisation pour annuler l'homothétie (protection contre division par 0)
            facteurNormalisation = (tailleActuelle > 0.0001) ? (this.tailleReference / tailleActuelle) : 1.0;
        }

        // helper pour retrouver les sommets par leur nom
        const getS = (name) => this.sommets.find(s => s.name === name);

        this.formeParente.sommets.forEach(s4 => {
            let x, y, z, w;

            // Pour les projections secondaires : utiliser coordonnées locales normalisées
            // Pour la projection principale : utiliser coordonnées brutes
            if (!this.isPrincipale) {
                // Coordonnées 4D en coordonnées locales par rapport au centre
                let localX = s4.vector.x - centre4D.x;
                let localY = s4.vector.y - centre4D.y;
                let localZ = s4.vector.z - centre4D.z;
                let localW = s4.vector.w - centre4D.w;

                // Normalise pour garder la même taille visuelle
                x = localX * facteurNormalisation;
                y = localY * facteurNormalisation;
                z = localZ * facteurNormalisation;
                w = localW * facteurNormalisation;
            } else {
                // Projection principale : coordonnées brutes (affectée par les transformations)
                x = s4.vector.x;
                y = s4.vector.y;
                z = s4.vector.z;
                w = s4.vector.w;
            }

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

            // Pour les projections secondaires, ignore l'homothétie sur les sommets
            if (!this.isPrincipale) {
                s3.scale = 1.0;
            }

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