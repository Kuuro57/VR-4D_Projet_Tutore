/**
 * Classe contenant des matrices de transformation pour la 3D
 */

/**
 * Angle en radians pour les matrices de rotation (rotation de ANGLE radians par rotation)
 * avec 1 degré (modifiable)
 */
const ANGLE = 1 * (Math.PI / 180);


/**
 * Matrice de rotation 3D sur l'axe X avec un angle donné
 */
var matriceRotationX = BABYLON.Matrix.FromArray([
    1, 0, 0, 0,
    0, Math.cos(ANGLE), -Math.sin(ANGLE), 0,
    0, Math.sin(ANGLE), Math.cos(ANGLE), 0,
    0, 0, 0, 1
]);


/**
 * Matrice de rotation 3D sur l'axe Y avec un angle donné
 */
var matriceRotationY = BABYLON.Matrix.FromArray([
    Math.cos(ANGLE), 0, Math.sin(ANGLE), 0,
    0, 1, 0, 0,
    -Math.sin(ANGLE), 0, Math.cos(ANGLE), 0,
    0, 0, 0, 1
]);


/**
 * Matrice de rotation 3D sur l'axe Z avec un angle donné
 */
var matriceRotationZ = BABYLON.Matrix.FromArray([
    Math.cos(ANGLE), -Math.sin(ANGLE), 0, 0,
    Math.sin(ANGLE), Math.cos(ANGLE), 0, 0,
    0, 0, 1, 0,
    0, 0, 0, 1
]);



// Export
export {
    matriceRotationX,
    matriceRotationY,
    matriceRotationZ
}