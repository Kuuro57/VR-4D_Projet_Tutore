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

        let center = this.formeParente.getVectorCenter();
        let getS = (name) => this.sommets.find(s => s.name === name);
        
        // calcul du rayon max (taille actuelle de la forme)
        let maxRadius = 0;
        this.formeParente.sommets.forEach(s => {
            const dx = s.vector.x - center.x;
            const dy = s.vector.y - center.y;
            const dz = s.vector.z - center.z;
            const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
            maxRadius = Math.max(maxRadius, dist);
        });


        // éviter les échelles négatives ou nulles
        if (maxRadius === 0) maxRadius = 1;

        // projection normalisée
       this.formeParente.sommets.forEach(sommet3D => {

            // Calcul de la position relative du sommet par rapport à la caméra
            let localX = (sommet3D.vector.x - center.x) / maxRadius;
            let localY = (sommet3D.vector.y - center.y) / maxRadius;
            
            // Application de la projection
            const s2D = getS(sommet3D.name);
            s2D.vector.set(
                localX * baseScale,
                localY * baseScale,
                0
            );

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