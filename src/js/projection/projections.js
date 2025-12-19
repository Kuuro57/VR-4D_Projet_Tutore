import { Projection2D } from "../projection2D.js";
import { Projection3D } from "../projection3D.js";
import { Sommet } from "../sommet.js";
import { Arete } from "../arete.js";

/**
 * Projette une forme 3D dans un espace 2D
 * @param {Forme} forme3D 
 * @param {BABYLON.Camera} camera
 * @param {Number} focal Distance focale
 */
function projection2D(forme3D, camera2D, scene2D) {

  // nettoie l'ancienne si elle existe
  if (forme3D.projection2D) {
    forme3D.projection2D.delete?.();
    forme3D.projection2D = null;
  }

  const clone = forme3D.getClone();

  // IMPORTANT : on passe bien camera2D + on build dans scene2D
  const proj2D = new Projection2D(`${forme3D.name}_2D`, clone.sommets, clone.aretes, camera2D);
  proj2D.formeParente = forme3D;

  forme3D.projection2D = proj2D;

  proj2D.build(scene2D);
  proj2D.update();

  return proj2D;
}


function projection3D(forme4D, camera3D, scene3D) {

  // nettoie l'ancienne si elle existe
  if (forme4D.projection3D) {
    forme4D.projection3D.delete?.();
    forme4D.projection3D = null;
  }

  const clone = forme4D.getClone();

  // IMPORTANT : la projection 3D doit avoir des Vector3 (Babylon tubes/spheres)
  const sommets3D = clone.sommets.map(s => new Sommet(s.name, new BABYLON.Vector3(0, 0, 0)));
  const getS = (name) => sommets3D.find(s => s.name === name);
  const aretes3D = clone.aretes.map(a => new Arete(a.name, getS(a.sommet1.name), getS(a.sommet2.name)));

  const proj3D = new Projection3D(`${forme4D.name}_3D`, sommets3D, aretes3D, camera3D);
  proj3D.formeParente = forme4D;

  forme4D.projection3D = proj3D;

  proj3D.build(scene3D);
  proj3D.update();

  return proj3D;
}




// Export
export {
    projection2D, projection3D
}