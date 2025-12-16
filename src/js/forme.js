import { Sommet } from "./sommet.js";
import { Arete } from "./arete.js";

/**
 * Classe représentant une forme en 3D
 */
class Forme {


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
     * Constructeur de la forme
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
     * Constructeur de la forme à partir d'un fichier json
     * @param {String} fichierData 
     */
    static load(fichierData) {
        let forme = fetch(fichierData).then(response => response.json()).then(data => {
            let name = data.name;
            let sommets = data.sommets.map(s => new Sommet(s.name, new BABYLON.Vector3(s.position.x, s.position.y, s.position.z)));
            let aretes = data.aretes.map(a => {
                const sommet1 = sommets.find(s => s.name === a.sommet1);
                const sommet2 = sommets.find(s => s.name === a.sommet2);
                return new Arete(a.name, sommet1, sommet2);
            });
            return new Forme(name, sommets, aretes);
        });

        return forme;
        
    }

    /**
     * Methode d'affichage de la forme dans la scène
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
    Forme 
};