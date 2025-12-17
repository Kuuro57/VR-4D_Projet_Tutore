import { Sommet } from "./sommet.js";

/**
 * Classe qui représente une face carrée d'une forme géométrique 3D
 */
class FaceCarre {

    /**
     * @type {String}
     * Nom de la face carrée (pour qu'elle soit retrouvée parmis les potentielles autres faces carrées)
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
     * @type {Sommet}
     * Troisième sommet de l'arête
     */
    sommet3;
    
    /**
     * @type {Sommet}
     * Quatrième sommet de l'arête
     */
    sommet4;

    /**
     * @type {*} ???
     */
    mesh;

    radius = 0.03;
    scene = null;



    /**
     * Constructeur de la classe qui initialise une face carrée
     * @param {String} n Nom de la face carrée
     * @param {Sommet} s1 Sommet qui représente le premier point de la face carrée
     * @param {Sommet} s2 Sommet qui représente le deuxième point de la face carrée
     * @param {Sommet} s3 Sommet qui représente le troisième point de la face carrée
     * @param {Sommet} s4 Sommet qui représente le quatrième point de la face carrée
     */
    constructor(n, s1, s2, s3, s4) {
        this.name = n;
        this.sommet1 = s1;
        this.sommet2 = s2;
        this.sommet3 = s3;
        this.sommet4 = s4;
    }

    /**
     * Méthode qui permet de construire la face carrée sur la scène
     * @param {BABYLON.Scene} scene Scène sur laquelle on veut construire la face carrée
     */
    build(scene) {

        this.scene = scene;

        const mesh = new BABYLON.Mesh(this.name, scene);

        // Matériau
        const mat = new BABYLON.StandardMaterial(`${this.name}_mat`, scene);
        mat.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8);
        mat.backFaceCulling = false; // = sideOrientation double side (2 cotes visibles)
        mesh.material = mat;

        this.mesh = mesh;

        this._updateVertexData();

    }

    /**
     * Met à jour la position de la face carrée dans l'espace 3D
     */
    update() {

        if (!this.mesh) return;
        this._updateVertexData();

    }


    /**
     * Mise à jour interne du VertexData
     */
    _updateVertexData() {

        const positions = [
            this.sommet1.vector.x, this.sommet1.vector.y, this.sommet1.vector.z,
            this.sommet2.vector.x, this.sommet2.vector.y, this.sommet2.vector.z,
            this.sommet3.vector.x, this.sommet3.vector.y, this.sommet3.vector.z,
            this.sommet4.vector.x, this.sommet4.vector.y, this.sommet4.vector.z,
        ];

        // Deux triangles pour faire le carré
        const indices = [
            0, 1, 2, // ◿
            0, 2, 3 // ◸
        ];

        const normals = [];
        BABYLON.VertexData.ComputeNormals(positions, indices, normals);

        const vertexData = new BABYLON.VertexData();
        vertexData.positions = positions;
        vertexData.indices = indices;
        vertexData.normals = normals;

        vertexData.applyToMesh(this.mesh, true);
    }
}


// Export de la classe
export {
    FaceCarre
}