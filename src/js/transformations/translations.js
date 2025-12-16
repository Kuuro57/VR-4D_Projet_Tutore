/**
 * Translation des sommets dans un espace 3D selon un vecteur
 * @param {Forme} forme
 * @param {BABYLON.Vector3} translation 
 */
function translation3D(forme, translation) {

    forme.sommets.forEach(sommet => {
        sommet.vector.addInPlace(translation);
    });

    forme.update();
}

// Export
export {
    translation3D
}