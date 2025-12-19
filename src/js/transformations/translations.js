/**
 * Translation des sommets dans un espace de dimension n selon un vecteur de dimension n
 * @param {Forme} forme
 * @param {BABYLON.Vector} translation 
 */
function translation(forme, translation) {

    // Translation de chaque sommet
    forme.sommets.forEach(sommet => {
        sommet.vector.addInPlace(translation);
    });

    // Mise à jour de la forme
    forme.update();
}

// Export
export {
    translation
}