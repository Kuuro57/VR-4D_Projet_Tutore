/**
 * Classe représentant un sommet dans un espace 3D
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
     * Objet physique représentant l'arête dans l'espace 3D
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
     * Constructeur de la classe Sommet
     * @param {String} n Nom du sommet
     * @param {BABYLON.Vector} v Position du sommet
     */
    constructor(n, v) {
        this.vector = v;
        this.name = n;
    }



    /**
     * Méthode qui construit le sommet dans la scène
     */
    build(scene) {
    const redMat = new BABYLON.StandardMaterial("redMat", scene);
    redMat.diffuseColor = BABYLON.Color3.Red();

    const sphere = BABYLON.MeshBuilder.CreateSphere(
        `sphere${this.name}`,
        { diameter: this.baseDiameter, segments: 32 },
        scene
    );

    sphere.position.copyFrom(this.vector);
    sphere.scaling.setAll(this.scale);
    sphere.material = redMat;

    this.mesh = sphere;
    }




    /**
     * Met à jour la position du sommet dans l'espace 3D
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