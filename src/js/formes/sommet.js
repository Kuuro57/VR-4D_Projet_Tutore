/**
 * Classe représentant un sommet dans un espace de dimension n
 */
class Sommet {

    /**
     * @type {String} Nom du sommet
     */
    name;

    /**
     * @type {BABYLON.Vector} Position du sommet
     */
    vector;

    /**
     * @type {BABYLON.Mesh} 
     * Objet physique représentant l'arête dans l'espace
     */
    mesh;
    
    /**
     * @type {Number} 
     * Diamètre de la sphère représentant le sommet
     */
    baseDiameter = 0.2;

    /**
     * @type {Number} 
     * Taille du sommet
     */
    scale = 1.0;

    /**
     * @type {BABYLON.Vector}
     * Position initiale du sommet pour la réinitialisation
     */
    initialVector;


    /**
     * Constructeur de la classe Sommet
     * @param {String} n Nom du sommet
     * @param {BABYLON.Vector} v Position du sommet
     */
    constructor(n, v) {
        this.vector = v;
        this.initialVector = v.clone();
        this.name = n;
    }

    /**
     * Méthode qui construit le sommet dans la scène
     */
    build(scene) {
        // Création d'un mesh unique partagé pour tous les sommets, pour optimiser la mémoire et les performances
        if (!scene._sharedVertexMesh) {
            const mat = new BABYLON.StandardMaterial("_sharedVertexMat", scene);
            mat.diffuseColor = BABYLON.Color3.Red();
            
            const base = BABYLON.MeshBuilder.CreateSphere("_sharedVertex",
                { diameter: this.baseDiameter, segments: 4 }, scene);
            base.material = mat;
            base.setEnabled(false); // le mesh de base est invisible, seules les instances comptent
            scene._sharedVertexMesh = base;
        }

        this.mesh = scene._sharedVertexMesh.createInstance(`vi_${this.name}`);
        this.mesh.position.copyFrom(this.vector);
        this.mesh.scaling.setAll(this.scale);
    }

    /**
     * Met à jour la position du sommet dans l'espace
     */
    update() {
        if (this.mesh == null) return;

        this.mesh.position.copyFrom(this.vector);
        this.mesh.scaling.setAll(this.scale);
    }

}


// Export de la classe
export {
    Sommet
}