import { Sommet } from "./sommet.js";

/**
 * Classe qui représente une arête d'une forme géométrique 3D
 */
class Arete {

    /**
     * @type {String}
     * Nom de l'arête (pour qu'elle soit retrouvée parmis les potentielles autres arêtes)
     */
    name;

    /**
     * @type {Sommet}
     * Premier sommet de l'arête
     */
    sommet1;

    /**
     * @type {Sommet}
     * Deuxième sommet de l'arête
     */
    sommet2;

    /**
     * @type {BABYLON.Mesh} 
     * Objet physique représentant l'arête dans l'espace 3D
     */
    mesh;

    /**
     * @type {Number} 
     * Rayon du tube représentant l'arête dans l'espace 3D
     */
    radius = 0.03;



    /**
     * Constructeur de la classe qui initialise une arête
     * @param {String} n Nom de l'arête
     * @param {Sommet} s1 Sommet qui représente le premier point de l'arête
     * @param {Sommet} s2 Sommet qui représente le deuxième point de l'arête
     */
    constructor(n, s1, s2) {
        this.name = n;
        this.sommet1 = s1;
        this.sommet2 = s2;
    }



    /**
     * Méthode qui permet de construire l'arête sur la scène
     */
    build(scene) {

    const edgesMat = new BABYLON.StandardMaterial(`${this.name}_edgesMat`, scene);
    edgesMat.diffuseColor = BABYLON.Color3.Blue();

    const options = {
        path: [this.sommet1.vector, this.sommet2.vector],
        updatable: true,
        radius: this.radius
    };

    const tube = BABYLON.MeshBuilder.CreateTube(
        `${this.name}_tube`,
        options,
        scene
    );

    tube.material = edgesMat;
    this.mesh = tube;
}


    /**
     * Met à jour la position de l'arête dans l'espace 3D
     */
    update(scene) {
    if (!this.mesh) return;

    const path = [this.sommet1.vector, this.sommet2.vector];
    BABYLON.MeshBuilder.CreateTube(
        this.name,
        { path, instance: this.mesh, radius: this.radius },
        scene
    );
}


}


// Export de la classe
export {
    Arete
}