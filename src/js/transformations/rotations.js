import { Forme } from "../forme.js";
import { matriceRotationX, matriceRotationY, matriceRotationZ } from "./matrices.js";

/**
 * Fonction qui pivote une forme 3D sur un axe donné selon un angle donné
 * @param {Forme} forme Forme 3D sur laquelle on veut appliquer la rotation
 * @param {String} axe Axe selon lequelle on va faire pivoter la forme
 * @param {Number} angle Angle (en degrés)
 */
function rotation3D (forme, axe, angle) {

    // On transforme l'unité de l'angle en radiant
    angle = angle * (Math.PI / 180);

    // Récupère la bonne matrice de rotation
    var rotationMatrix = null;
    switch (axe) {
        case "x" : rotationMatrix = matriceRotationX(angle); break;
        case "y" : rotationMatrix = matriceRotationY(angle); break;
        case "z" : rotationMatrix = matriceRotationZ(angle); break;
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



// Export
export {
    rotation3D
}