// Datos de demostración. Solo contienen conceptos definidos en los casos de uso
// y en el diagrama de clases del documento funcional (Usuario, Plantilla, Contrato, Auditoría).

import { sha256 } from "@/lib/hash";

const DEMO_PASSWORD = "Firmaya#2026";
const MOCK_IP = "181.44.10.20";

function at(daysAgo, hours = 10, minutes = 0, seconds = 0) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(hours, minutes, seconds, 0);
  return d.toISOString();
}

function dateOnly(daysFromToday) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromToday);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

const defaultPreferences = () => ({
  eventos: {
    nuevaVersion: true,
    firmaRecibida: true,
    listoParaFirmar: true,
    nuevoComentario: true,
    cambioEstado: true,
    proximoAVencer: false,
  },
  canales: ["Correo Electrónico", "Notificación de Plataforma"],
});

const users = [
  { id: "u1", nombre: "Daniel", apellido: "Pérez", email: "daniel@mail.com", rol: "Administrador", estado: "Activo" },
  { id: "u2", nombre: "María", apellido: "Gómez", email: "maria@mail.com", rol: "Abogado", estado: "Activo" },
  { id: "u3", nombre: "Martín", apellido: "López", email: "martin@mail.com", rol: "Agente Inmobiliario", estado: "Activo" },
  { id: "u4", nombre: "Laura", apellido: "Díaz", email: "laura@mail.com", rol: "Agente Inmobiliario", estado: "Inactivo" },
].map((u) => ({
  ...u,
  password: DEMO_PASSWORD,
  intentosFallidos: 0,
  bloqueadoHasta: null,
  preferenciasNotificacion: defaultPreferences(),
}));

const templates = [
  {
    id: "p1",
    nombre: "Locación vivienda",
    tipo: "Arrendamiento",
    descripcion: "Contrato de locación de inmueble destinado a vivienda.",
    estado: "Activa",
    version: 1,
    cuerpo:
      "CONTRATO DE LOCACIÓN\n\n{{nombre_contrato}}\n\nEntre las partes {{partes}}, se celebra el presente contrato de locación sujeto a las siguientes cláusulas.\n\nPRIMERA: El inmueble objeto del presente contrato es: {{descripcion_propiedad}}.\n\nSEGUNDA: La vigencia del contrato comienza el {{fecha_inicio}} y finaliza el {{fecha_expiracion}}.\n\nTERCERA: Las partes dejan constancia de que el presente documento será firmado mediante mecanismo de verificación OTP y registro de integridad por hash.",
  },
  {
    id: "p2",
    nombre: "Compraventa inmueble",
    tipo: "Venta",
    descripcion: "Boleto de compraventa de inmueble.",
    estado: "Activa",
    version: 2,
    cuerpo:
      "BOLETO DE COMPRAVENTA\n\n{{nombre_contrato}}\n\nEntre {{partes}} se celebra el presente boleto de compraventa.\n\nPRIMERA: El inmueble objeto de la operación es: {{descripcion_propiedad}}.\n\nSEGUNDA: La operación rige a partir del {{fecha_inicio}}.\n\nTERCERA: Las partes firmarán el presente documento mediante verificación OTP.",
  },
  {
    id: "p3",
    nombre: "Mandato administración",
    tipo: "Mandato",
    descripcion: "Mandato de administración de inmueble.",
    estado: "Activa",
    version: 1,
    cuerpo:
      "CONTRATO DE MANDATO\n\n{{nombre_contrato}}\n\nEntre {{partes}} se acuerda el presente mandato de administración.\n\nPRIMERA: El inmueble a administrar es: {{descripcion_propiedad}}.\n\nSEGUNDA: El mandato rige desde el {{fecha_inicio}} hasta el {{fecha_expiracion}}.",
  },
  {
    id: "p4",
    nombre: "Modelo general",
    tipo: "Otro",
    descripcion: "",
    estado: "Inactiva",
    version: 1,
    cuerpo: "CONTRATO\n\n{{nombre_contrato}}\n\nEntre {{partes}} se celebra el presente contrato a partir del {{fecha_inicio}}.",
  },
];

const corrientesV1 =
  "CONTRATO DE LOCACIÓN\n\nEntre el Sr./Sra. Juan Pérez, en adelante \"EL LOCADOR\", y la Sra. Ana Martínez, en adelante \"LA LOCATARIA\", acuerdan celebrar el presente contrato de locación.\n\nEl inmueble objeto del presente se encuentra ubicado en Av. Corrientes 1240, Ciudad Autónoma de Buenos Aires.\n\nEl contrato tendrá una duración de 12 meses a partir de la fecha de inicio indicada por las partes.";
const corrientesV2 = corrientesV1.replace("Buenos Aires.", "Buenos Aires, departamento 4B.");
const corrientesV3 = corrientesV2.replace("duración de 12 meses", "duración de 24 meses");
const corrientesV4 =
  corrientesV3 +
  "\n\nLas partes dejan constancia de que el presente documento será firmado mediante mecanismo de verificación OTP y registro de integridad por hash.";

const palermoV1 =
  "BOLETO DE COMPRAVENTA\n\nEntre Juan Pérez, en adelante \"EL VENDEDOR\", y Ana Martínez, en adelante \"LA COMPRADORA\", se celebra el presente boleto de compraventa del inmueble ubicado en el barrio de Palermo.\n\nEl precio y las condiciones de pago se detallan en el anexo acordado por las partes.";
const palermoV2 = palermoV1 + "\n\nLas partes firmarán el presente documento mediante verificación OTP.";

const centroV1 =
  "CONTRATO DE MANDATO\n\nEntre Pedro Sosa, en adelante \"EL MANDANTE\", y la inmobiliaria representada por Martín López, en adelante \"EL MANDATARIO\", se acuerda el mandato de administración del local ubicado en el Centro.\n\nEl mandato rige por el plazo acordado por las partes.";
const centroV2 = centroV1 + "\n\nEl mandatario rendirá cuentas mensualmente al mandante.";

const belgranoV1 =
  "CONTRATO DE LOCACIÓN\n\nEntre Sofía Ramos y Juan Pérez se celebra el presente contrato de locación del inmueble ubicado en Belgrano 2450, por el plazo de 24 meses a partir de la fecha de inicio.";

const norteV1 =
  "CONTRATO DE MANDATO\n\nEntre las partes intervinientes se acuerda el presente mandato para la administración de la oficina ubicada en la zona norte, conforme a las condiciones que se detallan a continuación.";

const caballitoV1 =
  "BOLETO DE COMPRAVENTA\n\nEntre las partes intervinientes se celebra el presente boleto de compraventa del inmueble ubicado en el barrio de Caballito, conforme a las condiciones acordadas.";

async function version(numero, contenido, autor, fecha, comentario) {
  return { numero, contenido, autor, fecha, comentario, hash: await sha256(contenido) };
}

function party(id, nombre, email, rol, estadoInvitacion, tokenAcceso, firma) {
  return {
    id,
    nombre,
    email,
    rol,
    mensaje: "",
    estadoInvitacion,
    tokenAcceso,
    notificaciones: true,
    firma: rol === "Firmante" ? { estado: "Pendiente", fechaEvento: null, ip: null, hash: null, tokenFirma: null, otp: null, bloqueado: false, ...firma } : null,
  };
}

export async function buildSeed() {
  const c1Versions = [
    await version(1, corrientesV1, "María Gómez", at(8, 9, 0), "Creación inicial"),
    await version(2, corrientesV2, "María Gómez", at(7, 12, 20), "Primera revisión"),
    await version(3, corrientesV3, "María Gómez", at(6, 18, 5), "Corrección de datos"),
    await version(4, corrientesV4, "María Gómez", at(5, 10, 42), "Ajuste de cláusula"),
  ];
  const c2Versions = [
    await version(1, palermoV1, "María Gómez", at(12, 9, 30), ""),
    await version(2, palermoV2, "María Gómez", at(10, 16, 0), "Se agrega cláusula de firma"),
  ];
  const c3Versions = [
    await version(1, centroV1, "Martín López", at(20, 11, 0), ""),
    await version(2, centroV2, "Martín López", at(18, 15, 10), "Rendición de cuentas"),
  ];
  const c4Versions = [await version(1, belgranoV1, "María Gómez", at(60, 10, 0), "")];
  const c5Versions = [await version(1, norteV1, "María Gómez", at(3, 14, 0), "")];
  const c6Versions = [await version(1, caballitoV1, "Martín López", at(1, 9, 15), "")];

  const juanHash = await sha256(`${c2Versions[1].hash}juan@mail.com${at(4, 11, 31)}`);
  const pedroHash = await sha256(`${c3Versions[1].hash}pedro@mail.com${at(15, 10, 50)}`);

  const contracts = [
    {
      id: "c1",
      nombre: "Locación - Av. Corrientes 1240",
      partes: "Juan Pérez (Locador) / Ana Martínez (Locataria)",
      fechaInicio: dateOnly(10),
      fechaExpiracion: dateOnly(740),
      descripcionPropiedad: "Av. Corrientes 1240, Ciudad Autónoma de Buenos Aires.",
      tipo: "Arrendamiento",
      plantillaId: "p1",
      estado: "En Revisión",
      creadorId: "u2",
      creadoEn: at(8, 9, 0),
      fechaModificacion: at(5, 10, 42),
      versiones: c1Versions,
      partesInvitadas: [
        party("pa1", "Ana Martínez", "ana@mail.com", "Firmante", "Invitación enviada", "acc-ana-corrientes"),
        party("pa2", "Carlos Ruiz", "carlos@mail.com", "Revisor", "Pendiente", "acc-carlos-corrientes"),
      ],
      solicitudFirma: null,
      comentarios: [
        {
          id: "cm1",
          autor: "María Gómez",
          fecha: at(5, 11, 10),
          texto: "Revisar el plazo antes de solicitar firma.",
          textoSeleccionado: "duración de 24 meses",
        },
      ],
      accesos: [],
    },
    {
      id: "c2",
      nombre: "Boleto de compraventa - Palermo",
      partes: "Juan Pérez (Vendedor) / Ana Martínez (Compradora)",
      fechaInicio: dateOnly(5),
      fechaExpiracion: null,
      descripcionPropiedad: "Inmueble ubicado en el barrio de Palermo.",
      tipo: "Venta",
      plantillaId: "p2",
      estado: "Listo para firmar",
      creadorId: "u2",
      creadoEn: at(12, 9, 30),
      fechaModificacion: at(4, 11, 31),
      versiones: c2Versions,
      partesInvitadas: [
        party("pb1", "Ana Martínez", "ana@mail.com", "Firmante", "Invitación enviada", "acc-ana-palermo", {
          estado: "Notificado",
          fechaEvento: at(4, 10, 50),
          tokenFirma: "fir-ana-palermo",
        }),
        party("pb2", "Juan Pérez", "juan@mail.com", "Firmante", "Invitación enviada", "acc-juan-palermo", {
          estado: "Firmado",
          fechaEvento: at(4, 11, 31),
          ip: MOCK_IP,
          hash: juanHash,
          tokenFirma: "fir-juan-palermo",
          versionFirmada: 2,
        }),
        party("pb3", "Lucía Fernández", "lucia@mail.com", "Solo lectura", "Invitación enviada", "acc-lucia-palermo"),
      ],
      solicitudFirma: { fecha: at(4, 10, 50), canal: "Correo electrónico", mensaje: "", fechaLimite: null },
      comentarios: [],
      accesos: [],
    },
    {
      id: "c3",
      nombre: "Mandato administración - Local Centro",
      partes: "Pedro Sosa (Mandante) / Martín López (Mandatario)",
      fechaInicio: dateOnly(-15),
      fechaExpiracion: dateOnly(5),
      descripcionPropiedad: "Local comercial ubicado en el Centro.",
      tipo: "Mandato",
      plantillaId: "p3",
      estado: "Firmado",
      creadorId: "u3",
      creadoEn: at(20, 11, 0),
      fechaModificacion: at(15, 10, 50),
      versiones: c3Versions,
      partesInvitadas: [
        party("pc1", "Pedro Sosa", "pedro@mail.com", "Firmante", "Invitación enviada", "acc-pedro-centro", {
          estado: "Firmado",
          fechaEvento: at(15, 10, 50),
          ip: "181.44.10.22",
          hash: pedroHash,
          tokenFirma: "fir-pedro-centro",
          versionFirmada: 2,
        }),
      ],
      solicitudFirma: { fecha: at(16, 9, 0), canal: "Correo electrónico", mensaje: "", fechaLimite: null },
      comentarios: [],
      accesos: [],
    },
    {
      id: "c4",
      nombre: "Locación - Belgrano 2450",
      partes: "Sofía Ramos / Juan Pérez",
      fechaInicio: dateOnly(-50),
      fechaExpiracion: dateOnly(680),
      descripcionPropiedad: "Belgrano 2450.",
      tipo: "Arrendamiento",
      plantillaId: "p1",
      estado: "Archivado",
      creadorId: "u2",
      creadoEn: at(60, 10, 0),
      fechaModificacion: at(45, 10, 0),
      versiones: c4Versions,
      partesInvitadas: [party("pd1", "Sofía Ramos", "sofia@mail.com", "Revisor", "Invitación enviada", "acc-sofia-belgrano")],
      solicitudFirma: null,
      comentarios: [],
      accesos: [],
    },
    {
      id: "c5",
      nombre: "Contrato de mandato - Oficina Norte",
      partes: "Partes a definir",
      fechaInicio: dateOnly(15),
      fechaExpiracion: null,
      descripcionPropiedad: "Oficina en zona norte.",
      tipo: "Mandato",
      plantillaId: "p3",
      estado: "En Revisión",
      creadorId: "u2",
      creadoEn: at(3, 14, 0),
      fechaModificacion: at(3, 14, 0),
      versiones: c5Versions,
      partesInvitadas: [],
      solicitudFirma: null,
      comentarios: [],
      accesos: [],
    },
    {
      id: "c6",
      nombre: "Venta - Caballito",
      partes: "Partes a definir",
      fechaInicio: dateOnly(20),
      fechaExpiracion: null,
      descripcionPropiedad: "Inmueble en Caballito.",
      tipo: "Venta",
      plantillaId: "p2",
      estado: "Borrador",
      creadorId: "u3",
      creadoEn: at(1, 9, 15),
      fechaModificacion: at(1, 9, 15),
      versiones: c6Versions,
      partesInvitadas: [],
      solicitudFirma: null,
      comentarios: [],
      accesos: [],
    },
  ];

  const audit = [
    { fecha: at(20, 11, 0, 12), usuario: "martin@mail.com", tipoAccion: "Creación", entidad: "Contrato", descripcion: "Creación del contrato \"Mandato administración - Local Centro\" (v1).", contratoId: "c3", contratoNombre: "Mandato administración - Local Centro", version: 1, hash: c3Versions[0].hash },
    { fecha: at(15, 10, 50, 8), usuario: "pedro@mail.com", tipoAccion: "Firma", entidad: "Contrato", descripcion: "Firma registrada por Pedro Sosa.", contratoId: "c3", contratoNombre: "Mandato administración - Local Centro", version: 2, hash: c3Versions[1].hash, ip: "181.44.10.22" },
    { fecha: at(15, 10, 50, 9), usuario: "Sistema", tipoAccion: "Cambio de estado", entidad: "Contrato", descripcion: "Cambio de estado de Listo para firmar a Firmado.", contratoId: "c3", contratoNombre: "Mandato administración - Local Centro", antes: "Listo para firmar", despues: "Firmado", version: 2, hash: c3Versions[1].hash },
    { fecha: at(12, 9, 30, 2), usuario: "maria@mail.com", tipoAccion: "Creación", entidad: "Contrato", descripcion: "Creación del contrato \"Boleto de compraventa - Palermo\" (v1).", contratoId: "c2", contratoNombre: "Boleto de compraventa - Palermo", version: 1, hash: c2Versions[0].hash },
    { fecha: at(8, 9, 0, 4), usuario: "maria@mail.com", tipoAccion: "Creación", entidad: "Contrato", descripcion: "Creación del contrato \"Locación - Av. Corrientes 1240\" (v1).", contratoId: "c1", contratoNombre: "Locación - Av. Corrientes 1240", version: 1, hash: c1Versions[0].hash },
    { fecha: at(6, 18, 5, 40), usuario: "maria@mail.com", tipoAccion: "Edición", entidad: "Contrato", descripcion: "Nueva versión v3 guardada.", contratoId: "c1", contratoNombre: "Locación - Av. Corrientes 1240", antes: "v2", despues: "v3", version: 3, hash: c1Versions[2].hash },
    { fecha: at(5, 10, 42, 15), usuario: "maria@mail.com", tipoAccion: "Edición", entidad: "Contrato", descripcion: "Nueva versión v4 guardada.", contratoId: "c1", contratoNombre: "Locación - Av. Corrientes 1240", antes: "v3", despues: "v4", version: 4, hash: c1Versions[3].hash },
    { fecha: at(4, 11, 31, 5), usuario: "juan@mail.com", tipoAccion: "Firma", entidad: "Contrato", descripcion: "Firma registrada por Juan Pérez.", contratoId: "c2", contratoNombre: "Boleto de compraventa - Palermo", version: 2, hash: c2Versions[1].hash },
    { fecha: at(3, 14, 0, 30), usuario: "maria@mail.com", tipoAccion: "Creación", entidad: "Contrato", descripcion: "Creación del contrato \"Contrato de mandato - Oficina Norte\" (v1).", contratoId: "c5", contratoNombre: "Contrato de mandato - Oficina Norte", version: 1, hash: c5Versions[0].hash },
    { fecha: at(1, 9, 15, 3), usuario: "martin@mail.com", tipoAccion: "Creación", entidad: "Contrato", descripcion: "Creación del contrato \"Venta - Caballito\" (v1).", contratoId: "c6", contratoNombre: "Venta - Caballito", version: 1, hash: c6Versions[0].hash },
  ].map((entry, index) => ({ id: `a${index + 1}`, ip: MOCK_IP, antes: null, despues: null, ...entry }));

  return { users, templates, contracts, audit, recoveryTokens: [] };
}

export { MOCK_IP, DEMO_PASSWORD };
