import { Sommet } from "./sommet.js";

/**
 * Classe qui représente une face triangulaire d'une forme géométrique 3D
 */
class FaceTriangle {

    /**
     * @type {String}
     * Nom de la face triangulaire
     */
    name;

    /**
     * @type {Sommet}
     * Premier sommet
     */
    sommet1;

    /**
     * @type {Sommet}
     * Deuxième sommet
     */
    sommet2;

    /**
     * @type {Sommet}
     * Troisième sommet
     */
    sommet3;

    /**
     * @type {BABYLON.Mesh}
     * Objet physique représentant la face triangulaire dans l'espace
     */
    mesh;

    /**
     * @type {BABYLON.Scene}
     * Scène sur laquelle la face triangulaire est construite
     */
    scene = null;

    /**
     * Constructeur de la classe qui initialise une face triangulaire
     * @param {String} n Nom de la face triangulaire
     * @param {Sommet} s1 Premier point de la face triangulaire
     * @param {Sommet} s2 Deuxième point de la face triangulaire
     * @param {Sommet} s3 Troisième point de la face triangulaire
     */
    constructor(n, s1, s2, s3) {
        this.name = n;
        this.sommet1 = s1;
        this.sommet2 = s2;
        this.sommet3 = s3;
    }

    /**
     * Méthode qui permet de construire la face triangulaire sur la scène
     * @param {BABYLON.Scene} scene Scène sur laquelle on veut construire la face triangulaire
     */
    build(scene) {
        this.scene = scene;

        const mesh = new BABYLON.Mesh(this.name, scene);

        const mat = new BABYLON.StandardMaterial(`${this.name}_mat`, scene);
        mat.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.8);
        mat.alpha = 0.5;
        mat.backFaceCulling = false;
        mesh.material = mat;

        this.mesh = mesh;

        this.update(true);
    }

    /**
     * Met à jour la position de la face triangulaire dans l'espace 3D
     */
    update(isFirstTime = false) {
        if (!this.mesh) return;

        // Tableau des positions de chaque point (3 sommets)
        const positions = [
            this.sommet1.vector.x, this.sommet1.vector.y, this.sommet1.vector.z,
            this.sommet2.vector.x, this.sommet2.vector.y, this.sommet2.vector.z,
            this.sommet3.vector.x, this.sommet3.vector.y, this.sommet3.vector.z,
        ];

        if (isFirstTime) {
            // Un triangle -> un seul face (0,1,2)
            const indices = [0, 1, 2];

            const normals = [];
            BABYLON.VertexData.ComputeNormals(positions, indices, normals);

            const vertexData = new BABYLON.VertexData();
            vertexData.positions = positions;
            vertexData.indices = indices;
            vertexData.normals = normals;

            vertexData.applyToMesh(this.mesh, true);
        } else {
            // Mise à jour des positions
            this.mesh.updateVerticesData(
                BABYLON.VertexBuffer.PositionKind,
                new Float32Array(positions)
            );

            // Recalcul des normales
            const normals = [];
            BABYLON.VertexData.ComputeNormals(positions, [0, 1, 2], normals);

            this.mesh.updateVerticesData(
                BABYLON.VertexBuffer.NormalKind,
                new Float32Array(normals)
            );
        }
    }
}

// Export de la classe
export {
    FaceTriangle
};
