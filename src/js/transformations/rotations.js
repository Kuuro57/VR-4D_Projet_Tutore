import { Forme } from "../formes/forme.js";
import { matriceRotationX, matriceRotationY, matriceRotationZ } from "./matrices3D.js";
import { matriceRotationXY, matriceRotationXZ, matriceRotationXW, 
    matriceRotationYZ, matriceRotationYW, matriceRotationZW } from "./matrices4D.js";

/**
 * Méthode qui applique une rotation 3D à une forme selon un axe donné
 *  (selon un angle fixe défini dans matrices.js)
 * @param {Forme} forme 
 * @param {String} axe 
 * @returns 
 */
function rotation3D (forme, axe) {

    // Récupère la bonne matrice de rotation
    var rotationMatrix = null;
    switch (axe) {
        case "x" : rotationMatrix = matriceRotationX; break;
        case "y" : rotationMatrix = matriceRotationY; break;
        case "z" : rotationMatrix = matriceRotationZ; break;
        default : console.error(`Axe invalide : ${axe}`); return null;
    }
    
    // On applique la rotation avec la matrice de rotation correspondante en partant du point (0, 0, 0)
    var vectorCentreForme = forme.getVectorCenter();

    // Matrice de translation vers (0, 0, 0) et matrice de translation inverse
    var matrixT = BABYLON.Matrix.FromArray([ -vectorCentreForme.x, -vectorCentreForme.y, -vectorCentreForme.z, 1 ]);
    var matrixT_Inv = BABYLON.Matrix.FromArray([ vectorCentreForme.x, vectorCentreForme.y, vectorCentreForme.z, 1 ]);

    // Pour chaque sommet
    forme.sommets.forEach(sommet => {

        let matrixSommet = new BABYLON.Matrix.FromArray([sommet.vector.x, sommet.vector.y, sommet.vector.z, 1]);

        // Translater le point avec la matrice de translation vers le centre
        let tmp1 = matrixT.add(matrixSommet);

        // Rotation du point
        let tmp2 = tmp1.multiply(rotationMatrix);

        // Translation inverse
        let newMatrix = matrixT_Inv.add(tmp2).toArray();

        sommet.vector = new BABYLON.Vector3(newMatrix[0], newMatrix[1], newMatrix[2]);

    });

    // Mise à jour de la forme dans l'espace 3D
    forme.update();

}


/**
 * Méthode qui applique une rotation 4D à une forme selon un plan donné
 *  (selon un angle fixe défini dans matrices.js)
 * @param {Forme} forme 
 * @param {String} plan 
 * @returns 
 */
function rotation4D (forme, plan) {

    // Récupère la bonne matrice de rotation
    var rotationMatrix = null;
    switch (plan.toLowerCase()) {
        case "xy" : rotationMatrix = matriceRotationXY; break;
        case "xz" : rotationMatrix = matriceRotationXZ; break;
        case "xw" : rotationMatrix = matriceRotationXW; break;
        case "yz" : rotationMatrix = matriceRotationYZ; break;
        case "yw" : rotationMatrix = matriceRotationYW; break;
        case "zw" : rotationMatrix = matriceRotationZW; break;
        default : console.error(`Plan invalide : ${plan}`); return null;
    }

    // On applique la rotation avec la matrice de rotation correspondante en partant du point (0, 0, 0)
    var vectorCentreForme = forme.getVectorCenter();

    // Matrice de translation vers (0, 0, 0) et matrice de translation inverse
    var matrixT = BABYLON.Matrix.FromArray([ -vectorCentreForme.x, -vectorCentreForme.y, -vectorCentreForme.z, -vectorCentreForme.w]);
    var matrixT_Inv = BABYLON.Matrix.FromArray([ vectorCentreForme.x, vectorCentreForme.y, vectorCentreForme.z, vectorCentreForme.w]);

    // Pour chaque sommet
    forme.sommets.forEach(sommet => {

        let matrixSommet = new BABYLON.Matrix.FromArray([sommet.vector.x, sommet.vector.y, sommet.vector.z, sommet.vector.w]);

        // Translater le point avec la matrice de translation vers le centre
        let tmp1 = matrixT.add(matrixSommet);

        // Rotation du point
        let tmp2 = tmp1.multiply(rotationMatrix);

        // Translation inverse
        let newMatrix = matrixT_Inv.add(tmp2).toArray();

        sommet.vector = new BABYLON.Vector4(newMatrix[0], newMatrix[1], newMatrix[2], newMatrix[3]);

    });

    // Mise à jour récursive de la projection de la forme 4D
    forme.update();

}


// Export
export {
    rotation3D,rotation4D
}