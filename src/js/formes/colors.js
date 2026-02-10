const PALETTE = [
    BABYLON.Color3.Red(),
    BABYLON.Color3.Blue(),
    BABYLON.Color3.Green(),
    BABYLON.Color3.Yellow(),
    BABYLON.Color3.Magenta(),
    BABYLON.Color3.Gray(),
    BABYLON.Color3.Purple(),
    BABYLON.Color3.Teal(),
    BABYLON.Color3.White(),
    BABYLON.Color3.Black(),
    BABYLON.Color3.FromInts(0, 188, 212), // cyan
    BABYLON.Color3.FromInts(255, 153, 51), // orange
    BABYLON.Color3.FromInts(0, 128, 0), // vert foncé
    BABYLON.Color3.FromInts(143, 0, 255), // mauve
    BABYLON.Color3.FromInts(64, 224, 208), // turquoise
    BABYLON.Color3.FromInts(255, 215, 0), // or
    BABYLON.Color3.FromInts(105, 0, 14), // pourpre
    BABYLON.Color3.FromInts(166, 106, 13), // brun
    BABYLON.Color3.FromInts(94, 55, 0), // brun
    BABYLON.Color3.FromInts(108, 255, 82), // vert clair
    BABYLON.Color3.FromInts(255, 105, 180), // rose
    BABYLON.Color3.FromInts(115, 255, 234), // ciel
    BABYLON.Color3.FromInts(0, 0, 87), // bleu foncé
    BABYLON.Color3.FromInts(70, 0, 0), // pourpre
];

// On lie une couleur à une face dans l'ordre pour avoir toujours les mêmes couleurs associés aux mêmes faces
function deterministicIndex(name) {
    let sum = 0;
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return sum % PALETTE.length;
}

export function getFaceColor(name) {
    const idx = deterministicIndex(name);
    return PALETTE[idx];
}

// Expose les objets pour permettre la personnalisation depuis le code
export { PALETTE };
