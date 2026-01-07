import { Sommet } from "./sommet.js";
import { Arete } from "./arete.js";
import { FaceCarre } from "./faceCarre.js";
import { translation } from "./transformations/translations.js";

/**
 * Classe représentant une forme 3D ou 4D
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
     * @type {Forme[]}
     * Forme représentant la projection 2D de la forme
     */
    projection2D = [];

    /**
     * @type {Forme[]}
     * Forme représentant la projection 3D de la forme (si en 4D)
     */
    projection3D = [];





    /**
     * Constructeur de la forme
     * @param {String} nom
     * @param {Sommet[]} sommetsParameters 
     * @param {Arete[]} aretesParameters 
     * @param {FaceCarre[]} facesParameters 
     */
    constructor(nom,sommetsParameters, aretesParameters, facesParameters=[]) {
        this.name = nom;
        this.sommets = sommetsParameters;
        this.aretes = aretesParameters;
        this.faces = facesParameters;
    }





    //TODO soit retirer, soit completer avec les faces
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
     * @returns La forme (cube)
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



    /**
     * méthode pour afficher ou cacher les faces de la forme
     * @param {Boolean} visible 
     */
    toggleFaces(visible) {

        this.faces.forEach(face => {
            if (face.mesh) {
                face.mesh.isVisible = visible;
            }
        });
        
    }



    /**
     * méthode qui permet d'afficher ou cacher les wireframes (sommets et arêtes) de la forme
     * @param {Boolean} visible 
     */
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
     * méthode pour créer un hypercube à partir d'un centre
     * @param {String} name nom de l'hypercube
     * @param {BABYLON.Vector4} vector coordonnées du centre de l'hypercube
     * @param {Number} size taille d'une arête de l'hypercube
     * @returns La forme (hypercube)
     */
    static loadHyperCubeFromCenter(name,vector,size) {

        //création du cube/hypercube au centre (0,0,0)
        let cube = this.loadCubeFromCenter("cube", new BABYLON.Vector3(0,0,0), size);
        let hypercube = new Forme(name, [], []);

        //ajout des sommets (original + miroir) dans l'hypercube
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

        //relier les arrêtes miroires entre elles
        //Si sommet A est relié à B dans le cube, alors A' est relié à B' dans l'hypercube
        cube.aretes.forEach(arete => {
            if (!getS(arete.sommet1.name) || !getS(arete.sommet2.name)) {
                throw new Error("Sommet introuvable pour une arête du cube");
            }

            let sommet1Miroir = getS(arete.sommet1.name + "'");
            let sommet2Miroir = getS(arete.sommet2.name + "'");

            hypercube.aretes.push(new Arete(`${arete.name}'`, sommet1Miroir, sommet2Miroir));
        });

        //translation du cube pour le mettre au bon endroit
        translation(hypercube,vector);


        // ajout des faces de l'hypercube
        const facesName = new Map(hypercube.sommets.map((s) => [s.name, s]));
        hypercube.faces = hypercube.faces || [];

        // cubes à projeter
        const cubes = [
            ["A", "B", "C", "D", "E", "F", "G", "H"], // cube de base
            ["A'", "B'", "C'", "D'", "E'", "F'", "G'", "H'"] // cube 4D
        ];

        // helper pour créer une face à partir de noms des sommets
        const createQuad = (s1Name, s2Name, s3Name, s4Name) => {
            return new FaceCarre(
            `${s1Name}${s2Name}${s3Name}${s4Name}`,
            facesName.get(s1Name),
            facesName.get(s2Name),
            facesName.get(s3Name),
            facesName.get(s4Name)
            );
        };

        //faces naturelles
        cubes.forEach((vertexNames) => {
            if (!vertexNames.every((name) => facesName.has(name))) return;

            // on assigne des noms aux sommets
            const [A, B, C, D, E, F, G, H] = vertexNames;

            // face bas
            hypercube.faces.push(createQuad(A, B, C, D));
            // face haut
            hypercube.faces.push(createQuad(E, F, G, H));

            // faces sur les côtés
            hypercube.faces.push(createQuad(A, B, F, E));
            hypercube.faces.push(createQuad(B, C, G, F));
            hypercube.faces.push(createQuad(C, D, H, G));
            hypercube.faces.push(createQuad(D, A, E, H));
        });
        
        //faces latérales entre les deux cubes
        // Si u est relié à v, alors la face est (u, v, v', u')
        cube.aretes.forEach((arete) => {
            const u = arete.sommet1.name;
            const v = arete.sommet2.name;
            const uP = `${u}'`;
            const vP = `${v}'`;

            hypercube.faces.push(createQuad(u, v, vP, uP));
        });

        return hypercube;
        
    }

    /**
     * méthode statique qui permet de créer une forme de sphère à partir du centre, du rayon et du nombre de segments
     * @param {String} name 
     * @param {BABYLON.Vector3} center 
     * @param {Number} radius 
     * @param {Number} segments 
     * @returns 
     */
    static loadSphereFromCenter(name, center, radius, segments) {
        const sommets = [];

        //de haut en bas (theta)
        for (let i = 0; i <= segments; i++) {
            const theta = i * Math.PI / segments;
            //autour du cercle (phi)
            for (let j = 0; j <= segments; j++) {
                const phi = j * 2 * Math.PI / segments;
                const x = center.x + radius * Math.sin(theta) * Math.cos(phi);
                const y = center.y + radius * Math.sin(theta) * Math.sin(phi);
                const z = center.z + radius * Math.cos(theta);
                sommets.push(new Sommet(`S_${i}${j}`, new BABYLON.Vector3(x, y, z)));
            }
        
        }
        const aretes = [];

        //arêtes entre un sommet et ses voisins directs (horizontales et verticales)
        for (let i = 0; i < segments; i++) {
            for (let j = 0; j < segments; j++) {
                const current = i * (segments + 1) + j;
                const next = current + 1;
                const nextRow = current + (segments + 1);
                aretes.push(new Arete(`A_${i}_${j}`, sommets[current], sommets[next]));
                aretes.push(new Arete(`B_${i}_${j}`, sommets[current], sommets[nextRow]));
            }
        }
        return new Forme(name, sommets, aretes);
    }

    /**
     * Méthode statique qui permet de créer une hypersphère à partir du centre, du rayon et du nombre de segments
     * @param {String} name 
     * @param {BABYLON.Vector4} center 
     * @param {Number} radius 
     * @param {Number} segments 
     * @returns la forme (l'hypersphère)
     */
    static loadHyperSphereFromCenter(name, center, radius, segments) {

        const hypersphere = new Forme(name, [], [], []);

        // helper pour stocker les sommets en grille 3D
        const grid = Array.from({ length: segments + 1 }, () =>
            Array.from({ length: segments + 1 }, () =>
            Array(segments + 1)
            )
        );

        // Sommets de l'hypersphère : x^2+y^2+z^2+w^2 = R^2
        //de l'avant vers l'arrière (chi)
        //revient à fixer w et calculer tous les points de la couche correspondante (sphère 3D)
        for (let k = 0; k <= segments; k++) {
            const chi = (k * Math.PI) / segments;
            const w   = radius * Math.cos(chi);
            const r3  = radius * Math.sin(chi); // rayon de la sphère 3D à cette couche

            //de haut en bas (theta)
            for (let i = 0; i <= segments; i++) {
            const theta = (i * Math.PI) / segments;

                //autour du cercle (phi)
                for (let j = 0; j <= segments; j++) {
                    const phi = (j * 2 * Math.PI) / segments;

                    const x = r3 * Math.sin(theta) * Math.cos(phi);
                    const y = r3 * Math.sin(theta) * Math.sin(phi);
                    const z = r3 * Math.cos(theta);

                    const s = new Sommet(`S_${k}_${i}_${j}`, new BABYLON.Vector4(x, y, z, w));
                    hypersphere.sommets.push(s);
                    grid[k][i][j] = s;
                }
            }
        }

        // Arêtes : voisins en chi / theta / phi
        for (let k = 0; k <= segments; k++) {
            for (let i = 0; i <= segments; i++) {
                for (let j = 0; j <= segments; j++) {
                    const a = grid[k][i][j];

                    // création de l'arête entre le sommet et ses voisins directs (latéral, vertical, profondeur)
                    if (j < segments) hypersphere.aretes.push(new Arete(`P_${k}_${i}_${j}`, a, grid[k][i][j + 1]));
                    if (i < segments) hypersphere.aretes.push(new Arete(`T_${k}_${i}_${j}`, a, grid[k][i + 1][j]));
                    if (k < segments) hypersphere.aretes.push(new Arete(`C_${k}_${i}_${j}`, a, grid[k + 1][i][j]));
                }
            }
        }

        translation(hypersphere, center);

        return hypersphere;
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

        // Gestion de la 4D avec un Vector4
        if(this.sommets[0].vector instanceof BABYLON.Vector4){
            let sumW = 0;
            this.sommets.forEach(sommet => {
                sumW += sommet.vector.w;
            });
            return new BABYLON.Vector4(sumX / this.sommets.length, sumY / this.sommets.length, sumZ / this.sommets.length, sumW / this.sommets.length);
        }

        return new BABYLON.Vector3(sumX / this.sommets.length, sumY / this.sommets.length, sumZ / this.sommets.length);

    }




    /**
     * Methode d'affichage de la forme dans la scène
     * @param {BABYLON.Scene} scene 
     */
    build(scene) {
        this.sommets.forEach(s => s.build(scene));
        this.aretes.forEach(a => a.build(scene));
        this.faces.forEach(f => f.build(scene));
    }




    /**
     * Met à jour la forme (points et arêtes) dans l'espace 3D
     */
    update() {
        this.sommets.forEach(s => s.update());
        this.aretes.forEach(a => a.update());
        this.faces.forEach(f => f.update());

        // Récursivité sur les projections
        this.projection2D.forEach(element => { element.update(); });
        this.projection3D.forEach(element => { element.update(); });
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
            if(sommet.vector instanceof BABYLON.Vector4){
                newListSommets.push(new Sommet(sommet.name, new BABYLON.Vector4(sommet.vector.x, sommet.vector.y, sommet.vector.z, sommet.vector.w)));
            } else {
                newListSommets.push(new Sommet(sommet.name, new BABYLON.Vector3(sommet.vector.x, sommet.vector.y, sommet.vector.z)));
            }
        });

        // Clone des arêtes
        let newListAretes = [];
        this.aretes.forEach(arete => {
            newListAretes.push(new Arete(arete.name, 
                getS(arete.sommet1.name),
                getS(arete.sommet2.name)
            ));
        });

        // Clone des faces
        let newListFaces = [];
        this.faces.forEach(face => {
            newListFaces.push(new FaceCarre(face.name,
                getS(face.sommet1.name),
                getS(face.sommet2.name),
                getS(face.sommet3.name),
                getS(face.sommet4.name)
            ));
        });

        // Création de la nouvelle forme clonée
        return new Forme(this.name + "_copy", newListSommets, newListAretes, newListFaces);

    }





    /**
     * Méthode qui supprime la forme
     */
    delete() {
        // Nettoyage des meshes associés aux sommets, arêtes et faces
        if(this.sommets){
            this.sommets.forEach(sommet => {
                if(sommet.mesh)
                    sommet.mesh.dispose();
            });
        }

        if(this.aretes){
        this.aretes.forEach(arete => {
                if(arete.mesh)
                    arete.mesh.dispose();
            });
        }

        if(this.faces){
            this.faces.forEach(face => {
                if(face.mesh)
                    face.mesh.dispose();
            });
        }

        // Suppression récursive des projections
        this.projection2D.forEach(element => { element.delete(); });
        this.projection3D.forEach(element => { element.delete(); });
    }

}





//Export
export { 
    Forme 
};