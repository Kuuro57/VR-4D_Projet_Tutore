/**
 * Translation des sommets dans un espace de dimension n selon un vecteur de dimension n
 * @param {Forme} forme
 * @param {BABYLON.Vector} translation 
 */
function translation(forme, translation) {

    forme.sommets.forEach(sommet => {
        sommet.vector.addInPlace(translation);
    });

    forme.update();
}

// Export
export {
    translation
}