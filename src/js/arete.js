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
     * @type {*} ???
     */
    mesh;

    radius = 0.03;
    scene = null;



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
     * @param {BABYLON.Scene} scene Scène sur laquelle on veut construire l'arête
     */
    build(scene) {

        // Initialisation du matériau
        const edgesMat = new BABYLON.StandardMaterial(`${this.name}_edgesMat`, scene);
        edgesMat.diffuseColor = BABYLON.Color3.Blue();

        // Options d'affichage de l'arête
        var options = {
            path: [this.sommet1.vector, this.sommet2.vector],
            updatable: true,
            radius: this.radius
        }

        // Construction de l'arête sur la scène Babylon
        const tube = BABYLON.MeshBuilder.CreateTube(`${this.name}_tube`, options, scene);
        tube.material = edgesMat;

        this.mesh = tube;

    }

    /**
     * Met à jour la position de l'arête dans l'espace 3D
     */
    update() {
        if (this.mesh == null) return;

        const path = [this.sommet1.vector, this.sommet2.vector];
        BABYLON.MeshBuilder.CreateTube(this.name, { path, instance: this.mesh, radius: this.radius }, this.scene);
    }

}


// Export de la classe
export {
    Arete
}