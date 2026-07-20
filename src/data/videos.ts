export type Comment = {
  id: string;
  user: string;
  text: string;
};

export type Video = {
  id: string;
  user: string;
  handle: string;
  description: string;
  hashtags: string[];
  music: string;
  gradient: string;
  category: string;
  likes: number;
  comments: Comment[];
  videoUrl?: string;
  userId?: string;
  views?: number;
};

export const SEED_VIDEOS: Video[] = [
  {
    id: "1",
    user: "Yael Cohen",
    handle: "@yael_cohen",
    description:
      "Encendiendo las velas de Shabat con mi abuela 🕯️ una tradición que pasa de generación en generación",
    hashtags: ["#Shabat", "#Tradicion", "#Familia"],
    music: "Sonido original - Yael Cohen",
    gradient: "from-blue-950 via-slate-900 to-amber-900",
    category: "Tradición",
    likes: 1243,
    comments: [
      { id: "c1", user: "David M.", text: "Qué hermoso, Shabat Shalom! 🕯️" },
      { id: "c2", user: "Rivka L.", text: "Me hizo acordar a mi bobe ❤️" },
      { id: "c3", user: "Moshe A.", text: "La mejor tradición de todas" },
    ],
  },
  {
    id: "2",
    user: "Ari Levin",
    handle: "@ari_levin",
    description:
      "3 chistes judíos que mi zeide me contaba en el Shabat 😂 el último te va a matar",
    hashtags: ["#HumorJudio", "#Zeide", "#Risas"],
    music: "Klezmer remix - DJ Menorah",
    gradient: "from-amber-900 via-neutral-900 to-blue-950",
    category: "Humor",
    likes: 8452,
    comments: [
      { id: "c1", user: "Sara K.", text: "JAJAJA el tercero es igual al que cuenta mi tío" },
      { id: "c2", user: "Itzik B.", text: "Más, más!! 🤣" },
    ],
  },
  {
    id: "3",
    user: "Rivka Levy",
    handle: "@rivka_cocina",
    description:
      "Receta rápida de knishes de papa 🥔 kosher y deliciosos, apta para Pesaj",
    hashtags: ["#CocinaKosher", "#Knishes", "#Receta"],
    music: "Sonido original - Rivka Levy",
    gradient: "from-blue-900 via-slate-950 to-amber-800",
    category: "Cocina",
    likes: 3021,
    comments: [
      { id: "c1", user: "Hannah G.", text: "Se ven increíbles, los hago hoy!" },
      { id: "c2", user: "Noam S.", text: "¿Se puede congelar la masa?" },
    ],
  },
  {
    id: "4",
    user: "Klezmer Beat",
    handle: "@klezmerbeat",
    description:
      "Clarinete + violín = magia pura 🎻🎶 así suena la música klezmer moderna",
    hashtags: ["#Klezmer", "#Musica", "#Israel"],
    music: "Freilaj moderno - Klezmer Beat",
    gradient: "from-amber-800 via-neutral-950 to-blue-900",
    category: "Música",
    likes: 5678,
    comments: [
      { id: "c1", user: "Talia R.", text: "Se me eriza la piel cada vez 🎻" },
    ],
  },
  {
    id: "5",
    user: "Historia Judía",
    handle: "@historia_judia",
    description:
      "¿Sabías esto sobre la fundación del Estado de Israel en 1948? 🇮🇱 Hilo completo en comentarios",
    hashtags: ["#Israel", "#Historia", "#Aprende"],
    music: "Hatikva instrumental",
    gradient: "from-blue-950 via-neutral-900 to-amber-700",
    category: "Historia",
    likes: 12034,
    comments: [
      { id: "c1", user: "Eitan P.", text: "No lo sabía, gracias por compartir!" },
      { id: "c2", user: "Miriam D.", text: "Excelente resumen 👏" },
    ],
  },
  {
    id: "6",
    user: "Rab. Shlomo",
    handle: "@rab_shlomo",
    description:
      "Un pequeño mensaje de la Torá para empezar la semana con fuerza 📖✨",
    hashtags: ["#Torah", "#Reflexion", "#Fe"],
    music: "Niggun tradicional",
    gradient: "from-amber-900 via-neutral-950 to-blue-950",
    category: "Torá",
    likes: 4290,
    comments: [
      { id: "c1", user: "Yosef T.", text: "Justo lo que necesitaba escuchar hoy" },
    ],
  },
  {
    id: "7",
    user: "Hora Dance Crew",
    handle: "@hora.crew",
    description:
      "¡Aprendé los pasos básicos de la Hora en 30 segundos! 💃🕺 etiquetá a tu compañero de baile",
    hashtags: ["#Hora", "#Baile", "#Boda"],
    music: "Hava Nagila remix",
    gradient: "from-blue-900 via-slate-900 to-amber-900",
    category: "Danza",
    likes: 9876,
    comments: [
      { id: "c1", user: "Dana F.", text: "Lo voy a usar en mi casamiento!!" },
      { id: "c2", user: "Uri N.", text: "Los pasos más fáciles que vi" },
    ],
  },
  {
    id: "8",
    user: "Arte & Cultura",
    handle: "@arte.judio",
    description:
      "Como se hace un Janukiá artesanal paso a paso 🕎 arte judío contemporáneo",
    hashtags: ["#Januka", "#Arte", "#Artesania"],
    music: "Sonido original - Arte & Cultura",
    gradient: "from-amber-800 via-neutral-900 to-blue-800",
    category: "Cultura",
    likes: 2765,
    comments: [
      { id: "c1", user: "Liora V.", text: "Qué belleza de trabajo 😍" },
    ],
  },
];
