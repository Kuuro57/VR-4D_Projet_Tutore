import { homothetie } from "./transformations/homothetie.js";
import { rotation4D } from "./transformations/rotations.js";
import { translation } from "./transformations/translations.js";



/**
 * Méthode qui lie les contrôles (touches) à la forme
 * @param {Forme} forme 
 */
function linkControls (forme) {
    
    document.addEventListener('keydown', (event) => {

        const key = event.key;

        switch (key) {
            // Rotations 4D
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
        };
        
    });

}



// Export
export { 
    linkControls
};