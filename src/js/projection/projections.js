import { Projection2D } from "../projection2D.js";
import { Projection3D } from "../projection3D.js";

/**
 * Projette une forme 3D dans un espace 2D
 * @param {Forme} forme3D 
 * @param {BABYLON.Camera} camera
 * @param {Number} focal Distance focale
 */
function projection2D(forme3D, camera, focal = 4) {
    
    let forme3DClone = forme3D.getClone();
    let forme2D = new Projection2D(forme3DClone.name, forme3DClone.sommets, forme3DClone.aretes);

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
    forme2D.formeParente = forme3D;
    forme3D.projection2D = forme2D;

}

function projection3D(forme4D, camera, focal = 0.5) {
    let forme4DClone = forme4D.getClone();

    let forme3D = new Projection3D(forme4DClone.name, forme4DClone.sommets, forme4DClone.aretes);

    forme3D.sommets.forEach(sommet => {

        // Calcul de la position relative du sommet par rapport à la caméra
        let relativeX = sommet.vector.x - camera.position.x;
        let relativeY = sommet.vector.y - camera.position.y;
        let relativeZ = sommet.vector.z - camera.position.z;
        let relativeW = sommet.vector.w - 0; // Supposons que la caméra est à w=0

        // Empêcher la division par zéro
        if (relativeW <= 0.1) relativeW = 0.1;

        // Application de la projection
        let x3D = (relativeX / relativeW) * focal;
        let y3D = (relativeY / relativeW) * focal;
        let z3D = (relativeZ / relativeW) * focal;

        sommet.vector = new BABYLON.Vector3(x3D, y3D, z3D);

    });

    forme3D.build();
    forme3D.formeParente = forme4D;
    forme4D.projection3D = forme3D;
}



// Export
export {
    projection2D, projection3D
}