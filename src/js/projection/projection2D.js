/**
 * Projette une forme 3D dans un espace 2D
 * @param {Forme} forme3D 
 * @param {BABYLON.Camera} camera
 * @param {Number} focal Distance focale
 */
function projection2D(forme3D, camera, focal = 4) {
    
    let forme2D = forme3D.getClone();

    forme2D.sommets.forEach(sommet => {

        // Calcul de la position relative du sommet par rapport à la caméra
        let relativeX = sommet.vector.x - camera.position.x;
        let relativeY = sommet.vector.y - camera.position.y;
        let relativeZ = sommet.vector.z - camera.position.z;

        // Empêcher la division par zéro
        if (relativeZ <= 0.1) relativeZ = 0.1; 

        // Application de la projection
        let x2D = (relativeX / relativeZ) * focal;
        let y2D = (relativeY / relativeZ) * focal;

        sommet.vector = new BABYLON.Vector3(x2D, y2D, 0);

    });

    forme2D.build();
    forme3D.projection2D = forme2D;

}


// Export
export {
    projection2D
}