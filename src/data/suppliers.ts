export interface Supplier {
  id: string;
  name: string;
  logoUrl?: string;
  repName: string;
  phone: string;
  b2bUrl: string;
  creditDays: number;
  minimumOrder: string;
  deliveryDays: string;
  bankAccount: string;
  b2bUser?: string;
  email?: string;
  notes: string;
  tags: string[];
}

export const suppliers: Supplier[] = [
  {
    id: "sifluss",
    name: "Sifluss / Solvex",
    logoUrl: "https://http2.mlstatic.com/D_NQ_NP_602146-MLM75225141071_032024-O.webp",
    repName: "Carlos Gómez",
    phone: "525555555555",
    b2bUrl: "https://b2b.sifluss.com.mx",
    creditDays: 30,
    minimumOrder: "$50,000 MXN",
    deliveryDays: "Jueves",
    bankAccount: "BBVA: 0123456789",
    notes: "Pedir siempre las mezcladoras Fonthy por caja cerrada (10 pzas).",
    tags: ["Grifería", "Plomería"]
  },
  {
    id: "truper",
    name: "Truper",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/cd/Logo_Truper.svg/2560px-Logo_Truper.svg.png",
    repName: "Gloria López Juárez",
    phone: "2221401035",
    email: "glopezj@truper.com",
    b2bUrl: "https://www.truperenlinea.com/reng/index.jsp?sch=ssl&idpc=1782502575414",
    b2bUser: "423233",
    creditDays: 30,
    minimumOrder: "$8,120 MXN",
    deliveryDays: "Lunes",
    bankAccount: "Por definir",
    notes: "Contraseña en Bitwarden (9Alondra8%). Hacer pedidos temprano.",
    tags: ["Herramientas", "Ferretería"]
  },
  {
    id: "pintumex",
    name: "Pintumex",
    logoUrl: "https://pintumex.com.mx/cdn/shop/files/Logo_Pintumex.png?v=1613518290",
    repName: "Roberto Sánchez",
    phone: "525555555555",
    b2bUrl: "https://pedidos.pintumex.com.mx",
    creditDays: 15,
    minimumOrder: "$30,000 MXN",
    deliveryDays: "Martes y Viernes",
    bankAccount: "Santander: 1111222233",
    notes: "El blanco ostión siempre se acaba rápido, pedir doble en temporada de lluvias.",
    tags: ["Pinturas", "Impermeabilizantes"]
  }
];
