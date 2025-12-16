import {Forme} from "../forme.js";

/**
 * Methode pour effectuer une homothétie sur une forme 3D
 * 
 * @param {Forme} forme 
 * @param {Number} factor 
 * @returns 
 */
function homothetie3D (forme, factor) {

    // Pour chaque sommet de la forme, on applique l'homothétie
    forme.sommets.forEach(sommet => {
        // On multiplie chaque coordonnée par le facteur
        sommet.vector.x *= factor;
        sommet.vector.y *= factor;
        sommet.vector.z *= factor;
    });

    // On met à jour la forme

    forme.sommets.forEach(sommet => {
        if (sommet.mesh == null) return;

        sommet.mesh.position.copyFrom(sommet.vector);
        sommet.mesh.scaling = new BABYLON.Vector3(factor, factor, factor);
    });

    forme.aretes.forEach(arete => {
        const path = [arete.sommet1.vector, arete.sommet2.vector];

        if (arete.mesh) {
            arete.mesh.dispose();
        }

        //TODO methode pour recréer un mesh de tube

        // recréation avec nouveau radius
        arete.mesh = BABYLON.MeshBuilder.CreateTube(
        arete.name,
        { path, radius: 0.03 * factor },
        forme.scene
        );

        // remettre le matériau bleu par exemple
        const mat = new BABYLON.StandardMaterial(`mat_${arete.name}`, forme.scene);
        mat.diffuseColor = BABYLON.Color3.Blue();
        arete.mesh.material = mat;
    });

}


// Export
export {
    homothetie3D
}