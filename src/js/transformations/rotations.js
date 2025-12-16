/**
 * Matrice de rotation sur l'axe X avec un angle donné
 * @param {*} angle Angle (en degrés)
 * @returns Liste de liste représentant la matrice de rotation
 */
var matriceRotationX = (angle) => {
    var matrix = [
        [1, 0, 0],
        [0, Math.cos(angle), -Math.sin(angle)],
        [0, Math.sin(angle), Math.cos(angle)]
    ];
    return BABYLON.Matrix.FromArray([
        ...matrix[0], 0,
        ...matrix[1], 0,
        ...matrix[2], 0,
        0, 0, 0, 1
    ]);
};


/**
 * Matrice de rotation sur l'axe Y avec un angle donné
 * @param {*} angle Angle (en degrés)
 * @returns Liste de liste représentant la matrice de rotation
 */
var matriceRotationY = (angle) => {
    var matrix = [
        [Math.cos(angle), 0, Math.sin(angle)],
        [0, 1, 0],
        [-Math.sin(angle), 0, Math.cos(angle)]
    ];
    return BABYLON.Matrix.FromArray([
        ...matrix[0], 0,
        ...matrix[1], 0,
        ...matrix[2], 0,
        0, 0, 0, 1
    ]);
};


/**
 * Matrice de rotation sur l'axe Z avec un angle donné
 * @param {*} angle Angle (en degrés)
 * @returns Liste de liste représentant la matrice de rotation
 */
var matriceRotationZ = (angle) => {
    var matrix = [
        [Math.cos(angle), -Math.sin(angle), 0],
        [Math.sin(angle), Math.cos(angle), 0],
        [0, 0, 1]
    ];
    return BABYLON.Matrix.FromArray([
        ...matrix[0], 0,
        ...matrix[1], 0,
        ...matrix[2], 0,
        0, 0, 0, 1
    ]);
};



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

    forme.sommets.forEach(sommet => {
        
        var vectorSommet = sommet.vector;
        var matrixSommet = BABYLON.Matrix.FromArray([
            [vectorSommet.x],
            [vectorSommet.y],
            [vectorSommet.z],
            1
        ]);
        var newMatrix = matrixSommet.multiply(rotationMatrix).toArray();

        sommet.vector = new BABYLON.Vector3(newMatrix[0], newMatrix[1], newMatrix[2]);

    });

    forme.update();

}



// Export
export {
    rotation3D
}