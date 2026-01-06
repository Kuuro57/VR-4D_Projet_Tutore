/**
 * Classe contenant des matrices de transformation
 */

/**
 * Angle en radians pour les matrices de rotation (rotation de ANGLE radians par rotation)
 * avec 1 degré (modifiable)
 */
const ANGLE = 1 * (Math.PI / 180);


/**
 * Matrice de rotation 4D sur le plan XY avec un angle donné
 */
var matriceRotationXY = BABYLON.Matrix.FromArray([
    Math.cos(ANGLE), -Math.sin(ANGLE), 0, 0,
    Math.sin(ANGLE), Math.cos(ANGLE), 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1,
]);

/**
 * Matrice de rotation 4D sur le plan XZ avec un angle donné
 */
var matriceRotationXZ = BABYLON.Matrix.FromArray([
    Math.cos(ANGLE), 0, -Math.sin(ANGLE), 0,
    0, 1, 0, 0,
    Math.sin(ANGLE), 0, Math.cos(ANGLE), 0,
    0, 0, 0, 1
]);

/**
 * Matrice de rotation 4D sur le plan XW avec un angle donné
 */
var matriceRotationXW = BABYLON.Matrix.FromArray([
    Math.cos(ANGLE), 0, 0, -Math.sin(ANGLE),
    0, 1, 0, 0,
    0, 0, 1, 0,
    Math.sin(ANGLE), 0, 0, Math.cos(ANGLE)
]);

/**
 * Matrice de rotation 4D sur le plan YZ avec un angle donné
 */
var matriceRotationYZ = BABYLON.Matrix.FromArray([
    1, 0, 0, 0,
    0, Math.cos(ANGLE), -Math.sin(ANGLE), 0,
    0, Math.sin(ANGLE), Math.cos(ANGLE), 0,
    0, 0, 0, 1
]);

/**
 * Matrice de rotation 4D sur le plan YW avec un angle donné
 */
var matriceRotationYW = BABYLON.Matrix.FromArray([
    1, 0, 0, 0,
    0, Math.cos(ANGLE), 0, -Math.sin(ANGLE),
    0, 0, 1, 0,
    0, Math.sin(ANGLE), 0, Math.cos(ANGLE)
]);

/**
 * Matrice de rotation 4D sur le plan ZW avec un angle donné
 */
var matriceRotationZW = BABYLON.Matrix.FromArray([
    1, 0, 0, 0,
    0, 1, 0, 0,
    0, 0, Math.cos(ANGLE), -Math.sin(ANGLE),
    0, 0, Math.sin(ANGLE), Math.cos(ANGLE)
]);


// Export
export {
    matriceRotationXY,
    matriceRotationXZ,
    matriceRotationXW,
    matriceRotationYZ,
    matriceRotationYW,
    matriceRotationZW
}