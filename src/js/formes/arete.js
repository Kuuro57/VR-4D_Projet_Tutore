import { Sommet } from "./sommet.js";

/**
 * Classe qui représente une arête d'une forme géométrique dans une dimension n
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
     * Objet physique représentant l'arête dans l'espace
     */
    mesh;

    /**
     * @type {Number} 
     * Rayon du tube représentant l'arête dans l'espace
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
     * Méthode qui construit l'arête dans la scène
     * @param {BABYLON.Scene} scene 
     */
    build(scene) {
        this.mesh = BABYLON.MeshBuilder.CreateLines(
            `${this.name}_line`,
            {
                points: [this.sommet1.vector.clone(), this.sommet2.vector.clone()],
                updatable: true
            },
            scene
        );
        this.mesh.color = new BABYLON.Color3(0.1, 0.4, 0.9);
    }

    /**
     * Met à jour la position de l'arête dans l'espace
     */
    update() {
        if (!this.mesh) return;

        BABYLON.MeshBuilder.CreateLines(this.mesh.name, {
            points: [this.sommet1.vector.clone(), this.sommet2.vector.clone()],
            instance: this.mesh
        });
    }
}


// Export de la classe
export {
    Arete
}