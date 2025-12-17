import { Sommet } from "./sommet.js";
import { Arete } from "./arete.js";
import { translation3D } from "./transformations/translations.js";

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
     * @type {Forme}
     * Forme représentant la projection 2D de la forme
     */
    projection2D;

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
        return new Forme(name, sommets, aretes);
    }

    static loadHyperCubeFromCube(name,vector,size) {
        let cube = this.loadCubeFromCenter("cube", new BABYLON.Vector3(0,0,0), size);
        let hypercube = new Forme(name, [], []);
        cube.sommets.forEach(sommet => {
            let newSommet = new Sommet(sommet.name + "'", new BABYLON.Vector4(sommet.vector.x, sommet.vector.y, sommet.vector.z, -size/2));
            //sommet du cube original
            hypercube.sommets.push(new Sommet(sommet.name, new BABYLON.Vector4(sommet.vector.x, sommet.vector.y, sommet.vector.z, size/2)));
            //sommet miroir
            hypercube.sommets.push(newSommet);
        });

        // Helpers pour récupérer un sommet par nom
        let getS = (name) => hypercube.sommets.find(s => s.name === name);

        //arêtes originales du cube
        cube.aretes.forEach(arete => {
            hypercube.aretes.push(new Arete(arete.name, getS(arete.sommet1.name), getS(arete.sommet2.name)));
        });

        //relier chaque sommet à son miroir
        cube.sommets.forEach(sommet => {
            let sommetMiroir = getS(sommet.name + "'");

            if (!getS(sommet.name + "'")) {
                throw new Error("Sommet introuvable pour une arête du cube");
            }

            
            hypercube.aretes.push(new Arete(`${sommet.name}${sommetMiroir.name}`, getS(sommet.name), sommetMiroir));
        });

        //relier les arrêtes miroires
        cube.aretes.forEach(arete => {
            if (!getS(arete.sommet1.name) || !getS(arete.sommet2.name)) {
                throw new Error("Sommet introuvable pour une arête du cube");
            }

            let sommet1Miroir = getS(arete.sommet1.name + "'");
            let sommet2Miroir = getS(arete.sommet2.name + "'");

            hypercube.aretes.push(new Arete(`${arete.name}'`, sommet1Miroir, sommet2Miroir));
        });

        translation3D(hypercube,vector);

        return hypercube;
        
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
    }

    /**
     * Met à jour la forme (points et arêtes) dans l'espace 3D
     */
    update() {
        
        // Update de la forme
        this.sommets.forEach(sommet => {
            sommet.update();
        });
        this.aretes.forEach(arete => {
            arete.update();
        });

        // Update de la projection 2D
        if (this.projection2D != null) {
            this.projection2D.update();
        }

    }

    /**
     * Méthode qui supprime la forme
     */
    delete() {

        this.sommets.forEach(sommet => {
            sommet.mesh.dispose();
        });

        this.aretes.forEach(arete => {
            arete.mesh.dispose();
        });

    }

    /**
     * Méthode qui retourne une copie de la forme
     * @returns Une copie
     */
    getClone() {

        let getS = (name) => newListSommets.find(s => s.name === name);

        // Clone des sommets
        let newListSommets = [];
        this.sommets.forEach(sommet => {
            newListSommets.push(new Sommet(sommet.name, new BABYLON.Vector3(sommet.vector.x, sommet.vector.y, sommet.vector.z)));
        });

        // Clone des arêtes
        let newListAretes = [];
        this.aretes.forEach(arete => {
            newListAretes.push(new Arete(arete.name, 
                getS(arete.sommet1.name),
                getS(arete.sommet2.name)
            ));
        });

        // Création de la nouvelle forme clonée
        return new Forme(this.name + "_copy", newListSommets, newListAretes);

    }

}

//Export
export { 
    Forme 
};