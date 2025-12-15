/**
 * Classe représentant un sommet dans un espace 3D
 */
class Sommet {

    /**
     * @type {String} Nom du sommet
     */
    name;

    /**
     * @type {BABYLON.Vector3} Position du sommet
     */
    vector;

    /**
     * Constructeur de la classe Sommet
     * @param {String} n Nom du sommet
     * @param {BABYLON.Vector3} v Position du sommet
     */
    constructor(n, v) {
        this.vector = v;
        this.name = n;
    }

    /**
     * Méthode qui construit le sommet dans la scène
     * @param {BABYLON.Scene} scene
     */
    build(scene) {
        const redMat = new BABYLON.StandardMaterial("redMat", scene);
        redMat.diffuseColor = BABYLON.Color3.Red();

        const sphere = BABYLON.MeshBuilder.CreateSphere(`sphere${name}`, { diameter: 0.2, segments: 32 }, scene);
        sphere.position.set(this.vector.x, this.vector.y, this.vector.z);
        sphere.material = redMat;
    }

    /**
     * Méthode qui retourne la position du sommet
     * @returns {BABYLON.Vector3} Position du sommet
     */
    getVector() {
        return this.vector;
    }
}

// Export de la classe
export {
    Sommet
}