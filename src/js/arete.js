import { Sommet } from "./sommet.js";

/**
 * Classe qui représente une arête d'une forme géométrique 3D
 */
class Arete {

    /**
     * Nom de l'arête (pour qu'elle soit retrouvée parmis les potentielles autres arêtes)
     */
    name;

    /**
     * Premier sommet de l'arête
     */
    sommet1;

    /**
     * Deuxième sommet de l'arête
     */
    sommet2;



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
            path: [this.sommet1.getVector(), this.sommet2.getVector()],
            updatable: true,
            radius: 0.03
        }

        // Construction de l'arête sur la scène Babylon
        const tube = BABYLON.MeshBuilder.CreateTube(`${this.name}_tube`, options, scene);
        tube.material = edgesMat;

    }

}


// Export de la classe
export {
    Arete
}