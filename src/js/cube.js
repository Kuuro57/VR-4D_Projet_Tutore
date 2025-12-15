import { Sommet } from "./sommet.js";
import { Arete } from "./arete.js";

/**
 * Classe représentant un cube en 3D
 */
class Cube {


    /**
     * @type {String} Nom du sommet
     */
    name;

    /**
     * @type {Sommet[]}
     * Liste des sommets définis dans sommet.js
     */
    sommets;

    /**
     * @type {Arete[]}
     * Liste des arêtes définies dans arete.js
     */
    aretes;

    /**
     * Constructeur du cube
     * @param {String} nom
     * @param {Sommet[]} sommetsParameters 
     * @param {Arete[]} aretesParameters 
     */
    constructor(nom,sommetsParameters, aretesParameters) {
        this.name = nom;
        this.sommets = sommetsParameters;
        this.aretes = aretesParameters;
    }

    /**
     * Constructeur du cube à partir d'un fichier json
     * @param {String} fichierData 
     */
    static load(fichierData) {
        let cube = fetch(fichierData).then(response => response.json()).then(data => {
            let name = data.name;
            let sommets = data.sommets.map(s => new Sommet(s.name, new BABYLON.Vector3(s.position.x, s.position.y, s.position.z)));
            let aretes = data.aretes.map(a => {
                const sommet1 = sommets.find(s => s.name === a.sommet1);
                const sommet2 = sommets.find(s => s.name === a.sommet2);
                return new Arete(a.name, sommet1, sommet2);
            });
            return new Cube(name, sommets, aretes);
        });

        return cube;
        
    }

    /**
     * Methode d'affichage du cube dans la scène
     * @param {BABYLON.Scene} scene 
     */
    build(scene) {
        this.sommets.forEach(sommet => {
            sommet.build(scene);
        });
        this.aretes.forEach(arete => {
            arete.build(scene);
        });
    }

}

//Export
export { 
    Cube 
};