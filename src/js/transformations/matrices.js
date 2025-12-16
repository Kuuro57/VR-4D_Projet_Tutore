/**
 * Matrice de rotation sur l'axe X avec un angle donné
 * @param {Number} angle Angle (en radiant)
 * @returns Liste de liste représentant la matrice de rotation homogène
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
 * @param {Number} angle Angle (en radiant)
 * @returns Liste de liste représentant la matrice de rotation homogène
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
 * @param {Number} angle Angle (en radiant)
 * @returns Liste de liste représentant la matrice de rotation homogène
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



// Export
export {
    matriceRotationX,
    matriceRotationY,
    matriceRotationZ
}