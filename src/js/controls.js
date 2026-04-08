import { homothetie } from "./transformations/homothetie.js";
import { rotation3D, rotation4D } from "./transformations/rotations.js";
import { translation } from "./transformations/translations.js";
import { globalActions } from "./VR/vrcontrols.js";



/**
 * Méthode qui lie les contrôles (touches) à la forme
 * @param {Forme} forme 
 */
function linkControls (forme) {

    var faceIsVisible = true;
    var wireIsVisible = true;
    
    document.addEventListener('keydown', (event) => {

        const key = event.key;

        // Rotations 4D
        if (forme.sommets[0].vector instanceof BABYLON.Vector4) {
            switch (key) {
                case 'w':
                    rotation4D(forme, 'xy');
                    break;
                case 'x':
                    rotation4D(forme, 'xz');
                    break;
                case 'c':
                    rotation4D(forme, 'xw');
                    break;
                case 'v':
                    rotation4D(forme, 'yz');
                    break;
                case 'b':
                    rotation4D(forme, 'yw');
                    break;
                case 'n':
                    rotation4D(forme, 'zw');
                    break;

            }
        }


        // Rotations 3D
        else if (forme.sommets[0].vector instanceof BABYLON.Vector3) {
            switch (key) {

                // Rotations 3D
                case 'w':
                    rotation3D(forme, 'x');
                    break;
                case 'x':
                    rotation3D(forme, 'y');
                    break;
                case 'c':
                    rotation3D(forme, 'z');
                    break;
                case 'v':
                    rotation3D(forme, 'w');
                    break;
            }
        }


        switch (key) {

            // Translations
            case 'u':
                translation(forme, new BABYLON.Vector4(1, 0, 0, 0));
                break
            case 'i':
                translation(forme, new BABYLON.Vector4(0, 1, 0, 0));
                break;
            case 'o':
                translation(forme, new BABYLON.Vector4(0, 0, 1, 0));
                break;
            case 'p':
                translation(forme, new BABYLON.Vector4(0, 0, 0, 1));
                break;
            case 'j':
                translation(forme, new BABYLON.Vector4(-1, 0, 0, 0));
                break
            case 'k':
                translation(forme, new BABYLON.Vector4(0, -1, 0, 0));
                break;
            case 'l':
                translation(forme, new BABYLON.Vector4(0, 0, -1, 0));
                break;
            case 'm':
                translation(forme, new BABYLON.Vector4(0, 0, 0, -1));
                break;

            // Homotéties
            case 'Dead':
                homothetie(forme, 1.01);
                break;
            case 'ù':
                homothetie(forme, 0.99);
                break;

            // Toggle faces
            case '&':
                faceIsVisible = !faceIsVisible;
                forme.toggleFaces(faceIsVisible);
                break;

            // Toggle wireframe
            case 'é':
                wireIsVisible = !wireIsVisible;
                forme.toggleWireframe(wireIsVisible);
                break;
                
            // Reset form to initial position
            case 'r':
                forme.reset();
                break;

            case 'g':
                const blob = forme.saveToPLY();
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'forme.ply';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
                break;

            case 't':
                globalActions.switchForme("HyperSphere");
                break;
        };
        
    });

}



// Export
export { 
    linkControls
};