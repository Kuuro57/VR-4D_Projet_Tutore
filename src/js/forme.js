import { Sommet } from "./sommet.js";
import { Arete } from "./arete.js";
import { FaceCarre } from "./faceCarre.js";

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
    * @type {FaceCarre[]}
    */
    faces = [];


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
     * méthode statique qui permet de créer une forme de cube à partir du centre, de la taille et du nom
     * 
     * @param {String} name nom du cube
     * @param {BABYLON.Vector3} vector coordonnées du centre du cube
     * @param {Number} size  taille du cube
     * @returns 
     */
    static loadCubeFromCenter(name,vector,size) {
        const halfSize = size / 2;
        const sommets = [
            new Sommet("A", new BABYLON.Vector3(vector.x - halfSize, vector.y - halfSize, vector.z - halfSize)),
            new Sommet("B", new BABYLON.Vector3(vector.x + halfSize, vector.y - halfSize, vector.z - halfSize)),
            new Sommet("C", new BABYLON.Vector3(vector.x + halfSize, vector.y + halfSize, vector.z - halfSize)),
            new Sommet("D", new BABYLON.Vector3(vector.x - halfSize, vector.y + halfSize, vector.z - halfSize)),
            new Sommet("E", new BABYLON.Vector3(vector.x - halfSize, vector.y - halfSize, vector.z + halfSize)),
            new Sommet("F", new BABYLON.Vector3(vector.x + halfSize, vector.y - halfSize, vector.z + halfSize)),
            new Sommet("G", new BABYLON.Vector3(vector.x + halfSize, vector.y + halfSize, vector.z + halfSize)),
            new Sommet("H", new BABYLON.Vector3(vector.x - halfSize, vector.y + halfSize, vector.z + halfSize))
        ];
        const aretes = [
            // Arêtes du bas
            new Arete("AB", sommets[0], sommets[1]),
            new Arete("BC", sommets[1], sommets[2]),
            new Arete("CD", sommets[2], sommets[3]),
            new Arete("DA", sommets[3], sommets[0]),
            
            // Arêtes du haut
            new Arete("EF", sommets[4], sommets[5]),
            new Arete("FG", sommets[5], sommets[6]),
            new Arete("GH", sommets[6], sommets[7]),
            new Arete("HE", sommets[7], sommets[4]),

            // Arêtes verticales
            new Arete("AE", sommets[0], sommets[4]),
            new Arete("BF", sommets[1], sommets[5]),
            new Arete("CG", sommets[2], sommets[6]),
            new Arete("DH", sommets[3], sommets[7])
        ];
        const faces = [
            // Bas
            new FaceCarre("ABCD", sommets[0], sommets[1], sommets[2], sommets[3]),
            // Haut
            new FaceCarre("EFGH", sommets[4], sommets[5], sommets[6], sommets[7]),

            // Faces latérales
            new FaceCarre("ABFE", sommets[0], sommets[1], sommets[5], sommets[4]),
            new FaceCarre("BCGF", sommets[1], sommets[2], sommets[6], sommets[5]),
            new FaceCarre("CDHG", sommets[2], sommets[3], sommets[7], sommets[6]),
            new FaceCarre("DAHE", sommets[3], sommets[0], sommets[4], sommets[7]),
        ];

        const forme = new Forme(name, sommets, aretes);
        forme.faces = faces;
        return forme;
    }

    toggleFaces(visible) {

        this.faces.forEach(face => {
            if (face.mesh) {
                face.mesh.isVisible = visible;
            }
        });
        
    }

    toggleWireframe(visible) {

        // Sommets (sphères)
        this.sommets.forEach(sommet => {
            if (sommet.mesh) {
                sommet.mesh.isVisible = visible;
            }
        });

        // Arêtes (tubes)
        this.aretes.forEach(arete => {
            if (arete.mesh) {
                arete.mesh.isVisible = visible;
            }
        });

    }
    
    /**
     * Méthode qui calcule et retourne le centre de la forme sous forme d'un vecteur
     * @returns Le vecteur représentant le centre de la forme
     */
    getVectorCenter() {

        let sumX = 0;
        let sumY = 0;
        let sumZ = 0;

        this.sommets.forEach(sommet => {
            sumX += sommet.vector.x;
            sumY += sommet.vector.y;
            sumZ += sommet.vector.z;
        });

        return new BABYLON.Vector3(sumX / this.sommets.length, sumY / this.sommets.length, sumZ / this.sommets.length);

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
        this.faces.forEach(face => {
            face.build(scene);
        });
    }

    /**
     * Met à jour la forme (points et arêtes) dans l'espace 3D
     */
    update() {
        this.sommets.forEach(sommet => {
            sommet.update();
        });
        this.aretes.forEach(arete => {
            arete.update();
        });
        this.faces.forEach(face => {
            face.update();
        });
    }

}

//Export
export { 
    Forme 
};