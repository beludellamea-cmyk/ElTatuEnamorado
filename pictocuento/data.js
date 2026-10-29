// Escenas, textos, imágenes y pictogramas ARASAAC (IDs verificados en api.arasaac.org)
const P = (id, palabra) => ({ id, palabra, src: `img/picto/${id}.png` });
const CUENTO = {
  titulo: "EL TATÚ ENAMORADO",
  portadaImg: "img/escenas/portada.jpg",
  escenas: [
    { titulo: "EL TATÚ ENAMORADO", img: "img/escenas/01_El_tatu_enamorado.jpg",
      alt: "Un tatú cerca del río mira a la iguana",
      oraciones: ["CERCA DEL RÍO PARANÁ VIVÍA UN TATÚ.", "EL TATÚ ESTABA ENAMORADO DE LA IGUANA."],
      pictos: [P(2811,"RÍO"), P(8031,"TATÚ"), P(30389,"ENAMORADO"), P(26134,"IGUANA")] },
    { titulo: "LA IGUANA", img: "img/escenas/02_La_iguana.jpg",
      alt: "La iguana",
      oraciones: ["LA IGUANA QUERÍA UN NOVIO MUY VALIENTE.", "EL TATÚ QUERÍA LLAMAR SU ATENCIÓN."],
      pictos: [P(26134,"IGUANA"), P(38939,"NOVIO"), P(36163,"VALIENTE"), P(8031,"TATÚ"), P(2474,"MIRAR")] },
    { titulo: "EL TATÚ LLAMA LA ATENCIÓN", img: "img/escenas/03_El_tatu_llama_la_atencion.jpg",
      alt: "El tatú canta y hace piruetas",
      oraciones: ["EL TATÚ CANTABA Y HACÍA PIRUETAS.", "PERO LA IGUANA NO LE PRESTABA ATENCIÓN."],
      pictos: [P(8031,"TATÚ"), P(2315,"CANTAR"), P(39713,"GIRAR"), P(26134,"IGUANA"), P(2474,"MIRAR")] },
    { titulo: "LAS RANAS AYUDAN", img: "img/escenas/04_Las_ranas_ayudan.jpg",
      alt: "El tatú junto a las ranas en la laguna",
      oraciones: ["EL TATÚ FUE A LA LAGUNA.", "LES PIDIÓ AYUDA A LAS RANAS PARA HACER RUIDOS FUERTES."],
      pictos: [P(8031,"TATÚ"), P(6022,"LAGUNA"), P(2543,"RANAS"), P(32648,"AYUDAR"), P(7157,"RUIDO")] },
    { titulo: "LOS ANIMALES SE ASUSTAN", img: "img/escenas/05_Los_animales_se_asustan.jpg",
      alt: "El mono, el zorro y el tigre se asustan",
      oraciones: ["EL MONO, EL ZORRO Y EL TIGRE ESCUCHARON LOS RUIDOS.", "TODOS SE ASUSTARON Y SE FUERON."],
      pictos: [P(2477,"MONO"), P(2623,"ZORRO"), P(2590,"TIGRE"), P(2381,"ESCUCHAR"), P(35535,"MIEDO"), P(31015,"IRSE")] },
    { titulo: "EL TATÚ TOCA LA FLAUTA", img: "img/escenas/06_El_tatu_toca_la_flauta.jpg",
      alt: "El tatú toca la flauta y toma agua",
      oraciones: ["EL TATÚ TOCÓ SU FLAUTA.", "LAS RANAS DEJARON DE HACER RUIDO Y EL TATÚ TOMÓ AGUA."],
      pictos: [P(8031,"TATÚ"), P(2396,"FLAUTA"), P(2543,"RANAS"), P(5936,"SILENCIO"), P(2276,"BEBER"), P(2248,"AGUA")] },
    { titulo: "UNA FLOR PARA LA IGUANA", img: "img/escenas/07_Una_flor_para_la_iguana.jpg",
      alt: "El tatú le regala una flor a la iguana",
      oraciones: ["EL TATÚ INVITÓ A LA IGUANA A TOMAR AGUA.", "DESPUÉS LE REGALÓ UNA FLOR."],
      pictos: [P(8031,"TATÚ"), P(26134,"IGUANA"), P(2276,"BEBER"), P(2248,"AGUA"), P(16025,"REGALAR"), P(3102,"FLOR")] },
    { titulo: "UN FINAL FELIZ", img: "img/escenas/08_Un_final_feliz.jpg",
      alt: "El tatú y la iguana, felices",
      oraciones: ["EL TATÚ LE CONTÓ SU TRUCO A LA IGUANA.", "ELLA PRIMERO SE ENOJÓ, PERO DESPUÉS SE RECONCILIARON Y SE HICIERON NOVIOS."],
      pictos: [P(3345,"HABLAR"), P(2374,"ENOJADO"), P(6023,"ABRAZAR"), P(8020,"AMOR"), P(9907,"FELIZ")] }
  ]
};

// Palabra del texto en la que se ilumina cada pictograma durante la lectura (mismo orden que "pictos")
const CLAVES = [
  ["RÍO", "TATÚ", "ENAMORADO", "IGUANA"],
  ["IGUANA", "NOVIO", "VALIENTE", "TATÚ", "ATENCIÓN"],
  ["TATÚ", "CANTABA", "PIRUETAS", "IGUANA", "ATENCIÓN"],
  ["TATÚ", "LAGUNA", "RANAS", "AYUDA", "RUIDOS"],
  ["MONO", "ZORRO", "TIGRE", "ESCUCHARON", "ASUSTARON", "FUERON"],
  ["TATÚ", "FLAUTA", "RANAS", "DEJARON", "TOMÓ", "AGUA"],
  ["TATÚ", "IGUANA", "TOMAR", "AGUA", "REGALÓ", "FLOR"],
  ["CONTÓ", "ENOJÓ", "RECONCILIARON", "HICIERON", "NOVIOS"]
];
CUENTO.escenas.forEach((e, i) => e.pictos.forEach((p, j) => { p.clave = CLAVES[i][j]; }));
