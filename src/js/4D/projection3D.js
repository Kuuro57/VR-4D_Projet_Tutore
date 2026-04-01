import { Forme } from "../formes/forme.js";

/**
 * Classe représentant une projection 3D d'une forme 4D
 */
class Projection3D extends Forme {

    /**
     * @type {Forme}
     * Forme qui correspond à la forme 4D dont on a fait la projection en 3D
     */
    formeParente;

    /**
     * @type {BABYLON.Camera}
     * Camera qui visualise la projection
     */
    camera3D;

    /**
     * @type {String}
     * Axe que l'on applatit pour projeter la forme 4D en 3D
     */
    axe;

    /**
     * Constructeur de la forme
     * @param {String} nom
     * @param {Sommet[]} sommets
     * @param {Arete[]} aretes
     * @param {FaceCarre[]} faces
     * @param {BABYLON.Camera} camera3D
     * @param {String} axe
     */
    constructor(nom, sommets, aretes, faces, camera3D, axe, recentre = false, initialPosition = null) {
        super(nom, sommets, aretes);
        this.faces = faces;
        this.camera3D = camera3D;
        this.axe = axe;
        this.recentre = recentre;
        this.initialPosition = initialPosition;

        this.focal = 1.0;
        this.camPadding = 1; // marge de sécurité
        this.camPos = 2.0;     // Position de la caméra sur l'axe de profondeur choisi
    }





    /**
     * 
     * @param {*} position 
     */
    moveCenterToInitialPosition() {
    
        const offset = this.initialPosition.subtract(this.getVectorCenter());
        this.sommets.forEach(s => {
            s.vector.x += offset.x;
            s.vector.y += offset.y;
            s.vector.z += offset.z;
        });
    
    }





    /**
     * Méthode qui met à jour la projection 3D en fonction de la forme 4D parente
     */
    update() {

        // helper pour retrouver les sommets par leur nom
        const getS = (name) => this.sommets.find(s => s.name === name);

        const centre4D = this.recentre ? this.formeParente.getVectorCenter() : null;

        // --- 1) Calcul de la profondeur max pour reculer la caméra si besoin ---
        let maxDepth = -Infinity;
        let minDepth = Infinity;

        this.formeParente.sommets.forEach(s4 => {
            const x = s4.vector.x - (centre4D?.x ?? 0);
            const y = s4.vector.y - (centre4D?.y ?? 0);
            const z = s4.vector.z - (centre4D?.z ?? 0);
            const w = s4.vector.w - (centre4D?.w ?? 0);

            let depth;
            switch (this.axe) {
                case 'x': depth = x; break;
                case 'y': depth = y; break;
                case 'z': depth = z; break;
                default:  depth = w; break;
            }

            if (depth > maxDepth) maxDepth = depth;
            if (depth < minDepth) minDepth = depth;
        });

        // Padding proportionnel à la profondeur de l'objet
        const range = maxDepth - minDepth;
        this.camPos = maxDepth + Math.max(range * 0.5, 1.0);

        this.camPos = maxDepth + this.camPadding;


        this.formeParente.sommets.forEach(s4 => {
            // Coordonnées 4D (centrées si demandé)
            const x = s4.vector.x - (centre4D?.x ?? 0);
            const y = s4.vector.y - (centre4D?.y ?? 0);
            const z = s4.vector.z - (centre4D?.z ?? 0);
            const w = s4.vector.w - (centre4D?.w ?? 0);

            // depth = coordonnée aplatie, et (a,b,c) = coordonnées gardées
            let depth, a, b, c;

            switch (this.axe) {
                case 'x': // on "aplatit" X => on garde (Y,Z,W) -> (X,Y,Z)
                    depth = x; a = y; b = z; c = w;
                    break;

                case 'y': // on "aplatit" Y => on garde (X,Z,W)
                    depth = y; a = x; b = z; c = w;
                    break;

                case 'z': // on "aplatit" Z => on garde (X,Y,W)
                    depth = z; a = x; b = y; c = w;
                    break;

                case 'w':
                default:  // cas standard : on "aplatit" W => on garde (X,Y,Z)
                    depth = w; a = x; b = y; c = z;
                    break;
            }

            // Projection perspective le long de l'axe choisi
            const denom = (this.camPos - depth);
            const scale = this.focal / denom;


            const s3 = getS(s4.name);
            s3.vector.x = a * scale;
            s3.vector.y = b * scale;
            s3.vector.z = c * scale;
            s3.update();
        });

        if (this.initialPosition) {
            this.moveCenterToInitialPosition();
        }

        // mise à jour des sommets, arêtes et faces
        this.sommets.forEach(s => s.update());
        this.aretes.forEach(a => a.update());

        // Mise à jour des faces : batch ou individuel
        if (this._facesMesh && this._facesPositions) {
            let i = 0;
            this.faces.forEach(face => {
                const verts = face.sommet4
                    ? [face.sommet1, face.sommet2, face.sommet3, face.sommet4]
                    : [face.sommet1, face.sommet2, face.sommet3];
                verts.forEach(s => {
                    this._facesPositions[i++] = s.vector.x;
                    this._facesPositions[i++] = s.vector.y;
                    this._facesPositions[i++] = s.vector.z;
                });
            });
            this._facesMesh.updateVerticesData(
                BABYLON.VertexBuffer.PositionKind, this._facesPositions);
            const normals = new Float32Array(this._facesPositions.length);
            BABYLON.VertexData.ComputeNormals(
                this._facesPositions, this._facesIndices, normals);
            this._facesMesh.updateVerticesData(
                BABYLON.VertexBuffer.NormalKind, normals);
        } else {
            this.faces.forEach(f => f.update?.());
        }
    }


}



//Export
export { 
    Projection3D
};