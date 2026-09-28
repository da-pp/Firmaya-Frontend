# PROMPT MAESTRO — GENERACIÓN COMPLETA DEL FRONTEND EN NEXT.JS + JAVASCRIPT

## OBJETIVO GENERAL

Debes implementar el frontend completo del sistema descrito en el DOCUMENTO FUNCIONAL ADJUNTO.

El frontend debe desarrollarse utilizando exclusivamente:

- Next.js
- React
- JavaScript
- JSX

NO utilizar TypeScript.

El DOCUMENTO FUNCIONAL ADJUNTO es la ÚNICA FUENTE DE VERDAD funcional para esta implementación.

Debes implementar exclusivamente las pantallas, funcionalidades, campos, botones, validaciones, mensajes, estados, roles, acciones, flujos y navegaciones que estén explícitamente contemplados en dicho documento.

NO debes agregar absolutamente ninguna funcionalidad que no esté definida en los casos de uso o en el mapa de navegación del documento.


==================================================
1. REGLA PRINCIPAL: NO INVENTAR
==================================================

La regla más importante de toda la implementación es:

NO INVENTAR FUNCIONALIDADES.

Cada elemento visible o interactivo de la aplicación debe poder responder a esta pregunta:

"¿En qué parte del documento funcional está definido?"

Si no puede justificarse mediante el documento, NO debe existir.

Esto aplica a:

- Pantallas.
- Secciones.
- Menús.
- Submenús.
- Campos.
- Botones.
- Links.
- Acciones.
- Modales.
- Tabs.
- Filtros.
- Buscadores.
- Tablas.
- Columnas.
- Estados.
- Roles.
- Validaciones.
- Mensajes.
- Indicadores.
- Widgets.
- Dashboards.
- Configuraciones.
- Navegaciones.
- Funcionalidades.

No agregar algo simplemente porque:

- sea habitual en este tipo de sistema;
- mejore la experiencia del usuario;
- sea una buena práctica;
- sea visualmente atractivo;
- sea técnicamente conveniente;
- parezca lógico;
- creas que falta;
- otros sistemas similares lo tengan.

Si no está definido en el documento:

NO SE IMPLEMENTA.


==================================================
2. STACK TECNOLÓGICO OBLIGATORIO
==================================================

El frontend debe desarrollarse utilizando:

- Next.js
- React
- JavaScript
- JSX

El lenguaje obligatorio es JAVASCRIPT.

NO UTILIZAR TYPESCRIPT.

Todo el código nuevo debe utilizar exclusivamente archivos:

.js
.jsx

Ejemplos válidos:

app/page.js
app/layout.js
components/ContractHeader.jsx
components/StatusBadge.jsx
components/ConfirmModal.jsx
lib/utils.js

Ejemplos NO permitidos:

app/page.tsx
app/layout.tsx
components/ContractHeader.tsx
types/contract.ts
interfaces/User.ts

NO crear archivos:

.ts
.tsx

NO agregar TypeScript al proyecto.

NO instalar:

typescript
@types/node
@types/react
@types/react-dom

NO crear:

tsconfig.json

NO utilizar:

interfaces de TypeScript;
type;
enum de TypeScript;
generics de TypeScript;
anotaciones de tipos;
tipado propio de TypeScript.

Todos los componentes React nuevos deben implementarse utilizando JavaScript y JSX.

Si el proyecto existente contiene archivos TypeScript:

1. NO realices una migración completa.
2. NO elimines archivos existentes únicamente por ser TypeScript.
3. NO conviertas todo el proyecto.
4. Mantén intacto lo existente salvo que sea estrictamente necesario modificarlo.
5. TODO archivo nuevo creado para esta implementación debe ser JavaScript o JSX.

Si el proyecto todavía debe ser inicializado:

crear Next.js utilizando JavaScript.

Si el asistente de creación pregunta:

TypeScript?

Seleccionar:

No.


==================================================
3. ANTES DE ESCRIBIR CÓDIGO
==================================================

Antes de modificar cualquier archivo debes inspeccionar completamente el repositorio existente.

Determina:

- versión de Next.js;
- versión de React;
- si utiliza App Router o Pages Router;
- estructura de carpetas;
- sistema de estilos;
- componentes existentes;
- layouts existentes;
- dependencias existentes;
- convenciones de nombres;
- estructura de rutas;
- utilidades disponibles;
- librerías ya instaladas.

NO crees un nuevo proyecto Next.js si ya existe uno.

NO reemplaces package.json.

NO cambies la versión de Next.js.

NO cambies la versión de React.

NO cambies el sistema de rutas existente salvo necesidad técnica real.

NO reemplaces la arquitectura existente.

NO agregues nuevas dependencias si el proyecto ya posee una alternativa adecuada.

Reutiliza primero todo lo existente que sea compatible con los requerimientos.


==================================================
4. DOCUMENTO FUNCIONAL — FUENTE DE VERDAD
==================================================

Antes de implementar las pantallas debes leer COMPLETAMENTE el documento adjunto.

NO debes limitarte a leer el nombre de los casos de uso.

Para cada Caso de Uso analiza:

- Identificación.
- ID.
- Nombre.
- Descripción.
- Precondiciones.
- Postcondiciones.
- Actores primarios.
- Actores secundarios.
- Eventos disparadores.
- Escenario principal de éxito.
- Campos.
- Tipos de campos.
- Campos obligatorios.
- Campos opcionales.
- Longitudes máximas.
- Formatos.
- Valores permitidos.
- Estados.
- Roles.
- Validaciones.
- Mensajes.
- Helpers.
- Confirmaciones.
- Modales.
- Caminos alternativos.
- Errores.
- Restricciones.
- Navegaciones.
- Relación con otros casos de uso.
- Prototipo de interfaz.
- Diagrama de secuencia cuando ayude a interpretar el comportamiento.

No utilices conocimiento externo para completar huecos del documento.

Si algo no está definido, no lo inventes.


==================================================
5. ORDEN DE PRIORIDAD DEL DOCUMENTO
==================================================

Si necesitas resolver cómo debe funcionar una pantalla, utiliza este orden de prioridad:

PRIORIDAD 1:
Descripción textual del Caso de Uso.

PRIORIDAD 2:
Escenario principal de éxito.

PRIORIDAD 3:
Caminos alternativos.

PRIORIDAD 4:
Campos, validaciones, roles, estados y restricciones.

PRIORIDAD 5:
Mapa de navegación.

PRIORIDAD 6:
Prototipo de interfaz de usuario.

PRIORIDAD 7:
Diagrama de secuencia.

Los prototipos deben utilizarse como referencia visual.

Los Casos de Uso determinan el comportamiento funcional.

Si existe una contradicción entre el texto y el prototipo:

NO inventes una solución.

Implementa según el comportamiento descrito en el Caso de Uso y registra la inconsistencia en el informe final.


==================================================
6. ALCANCE FUNCIONAL
==================================================

Debes implementar los siguientes 21 Casos de Uso:

CU-01 — Crear contrato desde plantilla

CU-02 — Editar contrato en línea

CU-03 — Invitar a las partes al contrato

CU-04 — Ver contrato como parte invitada

CU-05 — Cambiar estado del contrato

CU-06 — Añadir comentarios y observaciones

CU-07 — Solicitar firma de las partes

CU-08 — Firmar contrato vía OTP

CU-09 — Consultar estado de firmas pendientes

CU-10 — Descargar contrato firmado en PDF

CU-11 — Ver historial de versiones

CU-12 — Comparar versiones de contrato

CU-13 — Verificar integridad por hash

CU-14 — Restaurar una versión anterior

CU-15 — Gestionar usuarios y roles

CU-16 — Gestionar plantillas de contrato

CU-17 — Ver Panel de Actividad Global

CU-18 — Registro de acciones de auditoría

CU-19 — Iniciar Sesión

CU-20 — Configurar notificaciones

CU-21 — Recuperar Contraseña

TODOS deben quedar representados correctamente en el frontend.

No debe omitirse ninguno.

No debes agregar un CU-22 ni ningún flujo funcional adicional.


==================================================
7. MAPA DE NAVEGACIÓN
==================================================

La navegación debe respetar el mapa de navegación del documento.

Implementa únicamente las áreas contempladas en dicho mapa.

Entre los conceptos definidos se encuentran:

- Iniciar sesión.
- Panel principal.
- Contrato.
- Mi perfil.
- BackOffice.
- Acceso externo.
- Ver / firmar contrato.
- Usuarios.
- Plantillas.
- Actividad.
- Auditoría.
- Versiones.
- Firmas.
- Estado.
- Integridad.
- Comparación.
- Restauración.

No agregues módulos de navegación adicionales.

No agregues secciones porque consideres que serían convenientes.


==================================================
8. DISEÑO DE LAS PANTALLAS
==================================================

Utiliza como referencia los prototipos incluidos en el documento.

El objetivo NO es rediseñar el producto.

El objetivo es transformar los prototipos y casos de uso en una aplicación Next.js funcional y consistente.

Debes conservar en lo posible:

- distribución general;
- jerarquía visual;
- estructura de paneles;
- formularios;
- tablas;
- encabezados;
- tarjetas;
- botones;
- etiquetas de estados;
- paneles laterales;
- mensajes;
- modales;
- diálogos;
- indicadores;
- áreas de contenido.

Puedes realizar ajustes técnicos necesarios para:

- responsive;
- accesibilidad básica;
- reutilización de componentes;
- adaptación al framework.

Pero NO debes modificar el concepto funcional de la pantalla.


==================================================
9. NO AGREGAR FUNCIONALIDADES
==================================================

A menos que estén explícitamente definidas en el documento, NO agregues:

- buscadores;
- filtros adicionales;
- ordenamiento de tablas;
- paginaciones diferentes a las documentadas;
- favoritos;
- etiquetas personalizadas;
- dashboards extra;
- gráficas extra;
- KPIs extra;
- widgets;
- notificaciones push;
- chat;
- mensajería adicional;
- autenticación social;
- login con Google;
- login con Microsoft;
- biometría;
- Firma Digital adicional;
- blockchain;
- IA;
- OCR;
- reconocimiento facial;
- firma manuscrita;
- perfiles de usuario adicionales;
- roles adicionales;
- exportaciones adicionales;
- importaciones;
- configuraciones extra;
- temas visuales;
- modo oscuro;
- preferencias adicionales;
- funcionalidades de colaboración no documentadas;
- drag and drop;
- atajos de teclado;
- autosave si no está documentado;
- funcionalidades administrativas adicionales.


==================================================
10. FORMULARIOS
==================================================

Cada formulario debe contener EXACTAMENTE los campos definidos por su Caso de Uso.

Respeta:

- Nombre.
- Label.
- Tipo.
- Placeholder cuando esté definido.
- Obligatorio/opcional.
- Longitud máxima.
- Formato.
- Estado editable.
- Estado solo lectura.
- Valores posibles.
- Restricciones.
- Helpers.
- Mensajes de validación.

NO agregues campos.

NO elimines campos.

NO cambies el significado del campo.

NO cambies las opciones disponibles de:

- dropdown;
- radio button;
- checkbox;
- toggle;
- selector de estados.

Los valores deben provenir exclusivamente de lo indicado en el documento.


==================================================
11. VALIDACIONES
==================================================

Implementa TODAS las validaciones de frontend expresamente indicadas en los casos de uso.

Por ejemplo, cuando corresponda:

- campos obligatorios;
- longitudes máximas;
- formato de email;
- fechas válidas;
- fecha actual;
- comparación entre fechas;
- contenido mínimo;
- longitud de contenido;
- OTP numérico;
- OTP de 6 dígitos;
- hash SHA-256;
- hash de 64 caracteres;
- valores obligatorios;
- transiciones de estados;
- confirmación de contraseña;
- requisitos de contraseña;
- permisos según rol.

Los textos de error deben respetar los definidos en el documento.

NO agregues reglas de validación de negocio no documentadas.


==================================================
12. MENSAJES
==================================================

Cuando el documento especifica un mensaje exacto:

UTILIZA ESE MENSAJE.

Esto incluye:

- mensajes de éxito;
- errores;
- helpers;
- advertencias;
- confirmaciones;
- mensajes informativos;
- bloqueos;
- estados vacíos.

No reemplaces los textos documentados por mensajes genéricos.

No inventes mensajes funcionales adicionales.


==================================================
13. CAMINOS ALTERNATIVOS
==================================================

No debes implementar solamente el camino feliz.

Debes contemplar TODOS los caminos alternativos definidos para CU-01 a CU-21.

Cuando corresponda debes representar:

- campos obligatorios vacíos;
- formatos incorrectos;
- fechas inválidas;
- tokens inválidos;
- tokens expirados;
- sesión expirada;
- OTP incorrecto;
- OTP expirado;
- cantidad máxima de intentos;
- bloqueos;
- contratos no editables;
- permisos insuficientes;
- falta de participantes;
- falta de firmantes;
- transiciones no válidas;
- fallos de correo;
- fallos de notificación;
- reintentos;
- copiar enlace;
- cancelar acciones;
- confirmaciones;
- contenido insuficiente;
- listas vacías;
- versiones inexistentes;
- errores de restauración;
- errores de PDF;
- errores especificados en el documento.

NO inventes caminos alternativos que no estén documentados.


==================================================
14. ROLES
==================================================

Utiliza exclusivamente los roles contemplados en el documento.

Incluyendo, cuando corresponda:

- Administrador.
- Abogado.
- Agente Inmobiliario.
- Firmante.
- Revisor.
- Solo lectura.

Respeta exactamente las acciones disponibles para cada rol según los Casos de Uso.

Un botón o acción debe ocultarse o deshabilitarse cuando el Caso de Uso indique que el rol no posee permiso.

NO inventes:

- SuperAdmin;
- Owner;
- Manager;
- Editor;
- Auditor como rol;
- Operador;
- Soporte;
- cualquier otro rol no definido.


==================================================
15. ESTADOS DEL CONTRATO
==================================================

Respeta los estados definidos en el documento.

Incluyendo:

- Borrador.
- En Revisión.
- Listo para firmar.
- Firmado.
- Archivado.

Respeta las transiciones permitidas definidas por los casos de uso.

No agregues estados como:

- Cancelado.
- Eliminado.
- Suspendido.
- Vencido.
- Rechazado.

salvo que aparezcan explícitamente como estados en el documento.

También respeta los estados definidos para:

- invitaciones;
- firmas;
- usuarios;
- plantillas;

cuando estén expresamente definidos.


==================================================
16. NAVEGACIÓN ENTRE CASOS DE USO
==================================================

Las navegaciones entre pantallas deben derivarse de:

- mapa de navegación;
- evento disparador;
- flujo principal;
- caminos alternativos.

Cuando un Caso de Uso redirija explícitamente a otro Caso de Uso, debes implementar dicha navegación.

Ejemplos contemplados en el documento pueden incluir relaciones como:

CU-05 → CU-03

CU-07 → CU-03

CU-09 → CU-07

CU-11 → CU-12

CU-11 → CU-14

CU-19 → CU-21

No inventes navegaciones adicionales que modifiquen el flujo funcional.


==================================================
17. BACKOFFICE
==================================================

El BackOffice debe contener exclusivamente las funcionalidades documentadas.

Entre ellas:

CU-15 — Gestionar usuarios y roles.

CU-16 — Gestionar plantillas de contrato.

CU-17 — Ver Panel de Actividad Global.

CU-18 — Registro de acciones de auditoría.

NO agregar:

- configuración general;
- parámetros del sistema;
- configuración SMTP;
- mantenimiento;
- feature flags;
- permisos avanzados;
- configuración de infraestructura;
- logs técnicos;
- administración de sesiones;
- configuración de API;

salvo que aparezcan explícitamente en los casos de uso.


==================================================
18. COMPONENTES REUTILIZABLES
==================================================

Puedes crear componentes reutilizables cuando exista reutilización real.

Ejemplos posibles:

ContractHeader.jsx

ContractMetadata.jsx

StatusBadge.jsx

ConfirmModal.jsx

FormField.jsx

CommentsPanel.jsx

VersionTable.jsx

SignaturesTable.jsx

OtpInput.jsx

ErrorMessage.jsx

SuccessMessage.jsx

Pero solo debes crear estos componentes si son necesarios para representar funcionalidades documentadas.

La existencia de un componente técnico NO autoriza agregar nuevas funcionalidades.


==================================================
19. RESPONSIVE
==================================================

La aplicación debe funcionar correctamente principalmente en escritorio y adaptarse a resoluciones menores.

La adaptación responsive puede modificar:

- disposición;
- columnas;
- tamaño;
- espacios;
- comportamiento visual.

Pero NO puede:

- eliminar información funcional;
- eliminar botones necesarios;
- eliminar campos;
- modificar roles;
- modificar flujos;
- modificar estados;
- modificar comportamiento.


==================================================
20. DATOS DE DEMOSTRACIÓN
==================================================

Esta tarea corresponde principalmente al FRONTEND.

NO inventes endpoints.

NO inventes APIs.

NO inventes contratos de backend.

NO modifiques el backend.

NO crees tablas de base de datos.

NO crees entidades backend.

NO cambies reglas del dominio.

Si todavía no existe integración con backend puedes utilizar datos de demostración mínimos mediante:

- objetos JavaScript;
- arrays;
- estado local;
- archivos mock.

Los mocks deben utilizar EXCLUSIVAMENTE información y conceptos definidos en el documento.

Ejemplo válido:

const contract = {
  name: "...",
  status: "Borrador",
  version: 1
};

NO agregues propiedades funcionales que no estén contempladas en los Casos de Uso.

La capa de datos debe quedar suficientemente separada para poder conectarla posteriormente al backend sin tener que rediseñar las pantallas.


==================================================
21. NO INVENTAR ENDPOINTS
==================================================

No implementes fetch() contra rutas inventadas.

No inventes:

/api/contracts
/api/users
/api/signatures

si dichas APIs no existen actualmente en el proyecto.

Si ya existe un backend o contrato OpenAPI dentro del repositorio:

puedes inspeccionarlo.

Pero esta tarea NO autoriza modificar el backend.

En caso de no existir integración utiliza mocks locales.


==================================================
22. DEPENDENCIAS
==================================================

Evita agregar dependencias innecesarias.

NO agregues por defecto:

Redux
Zustand
MobX
React Query
TanStack Query
Formik
React Hook Form
Material UI
Ant Design
Chakra
Bootstrap

salvo que ya estén presentes o exista una razón técnica real.

Primero utiliza:

- React;
- Next.js;
- JavaScript;
- CSS existente;
- librerías ya presentes.

No sobreingenierizar.


==================================================
23. ESTRUCTURA DE CÓDIGO
==================================================

Mantén una estructura clara y simple.

Como referencia, si el proyecto utiliza App Router, puede organizarse mediante:

app/
components/
lib/
data/

Pero debes respetar primero la estructura ya existente.

NO reorganices todo el repositorio si no es necesario.


==================================================
24. MATRIZ DE TRAZABILIDAD
==================================================

ANTES DE IMPLEMENTAR, construye internamente una matriz de trazabilidad:

CASO DE USO
↓
PANTALLA
↓
ACTOR
↓
CAMPOS
↓
ACCIONES
↓
VALIDACIONES
↓
MENSAJES
↓
CAMINOS ALTERNATIVOS
↓
NAVEGACIONES
↓
COMPONENTES

Debes utilizar esta matriz como checklist de implementación.

No necesitas detenerte a pedirme aprobación de la matriz.

Utilízala para garantizar que ningún requisito sea omitido.


==================================================
25. ORDEN DE IMPLEMENTACIÓN
==================================================

Implementa los casos de uso en orden:

CU-01
CU-02
CU-03
CU-04
CU-05
CU-06
CU-07
CU-08
CU-09
CU-10
CU-11
CU-12
CU-13
CU-14
CU-15
CU-16
CU-17
CU-18
CU-19
CU-20
CU-21

Puedes reutilizar componentes creados previamente.


==================================================
26. PROHIBIDO REDISEÑAR EL PRODUCTO
==================================================

No debes interpretar esta tarea como:

"crear una plataforma moderna de contratos".

La tarea es:

"implementar fielmente el sistema definido en el documento".

No agregues funcionalidades basándote en productos como:

DocuSign;
Adobe Sign;
PandaDoc;
Dropbox Sign;
SignNow;
otros productos similares.

No copies características externas.


==================================================
27. CRITERIO DE ACEPTACIÓN POR CASO DE USO
==================================================

Después de implementar cada Caso de Uso comprueba:

[ ] Existe la interfaz necesaria.

[ ] Están todos los campos.

[ ] No existen campos adicionales.

[ ] Están todos los botones.

[ ] No existen botones adicionales.

[ ] Están todas las acciones.

[ ] Están todas las validaciones.

[ ] Están todos los mensajes.

[ ] Están los caminos alternativos.

[ ] Se respetan los roles.

[ ] Se respetan los estados.

[ ] Se respetan las restricciones.

[ ] La navegación coincide con el documento.

[ ] La interfaz representa el prototipo cuando existe.

[ ] Todos los archivos nuevos son .js o .jsx.

[ ] No se utilizó TypeScript.


==================================================
28. AUDITORÍA FINAL DEL FRONTEND
==================================================

Una vez implementados los 21 Casos de Uso debes recorrer nuevamente:

CU-01
hasta
CU-21

y comparar el código contra el documento.

Busca especialmente funcionalidades inventadas.

Para cada elemento visible pregunta:

"¿Dónde está definido esto en el documento?"

Si no puedes responder:

ELIMÍNALO.

Realiza también una búsqueda completa en el proyecto de:

.ts
.tsx

No debes haber creado ningún archivo nuevo con dichas extensiones.

Comprueba también que no hayas agregado TypeScript como dependencia.


==================================================
29. NO DETENER LA IMPLEMENTACIÓN INNECESARIAMENTE
==================================================

Si el documento proporciona suficiente información para una pantalla:

IMPLEMENTA.

No me preguntes cuestiones de diseño que puedan resolverse mediante los prototipos del documento.

No me preguntes si quieres continuar después de cada Caso de Uso.

Continúa hasta completar todos los casos.

Solo detente si encuentras una contradicción que imposibilite técnicamente continuar sin inventar una regla de negocio.


==================================================
30. RESULTADO ESPERADO
==================================================

Al finalizar debe existir un frontend Next.js navegable que represente fielmente:

CU-01 hasta CU-21.

Debe utilizar exclusivamente:

Next.js
React
JavaScript
JSX

NO TypeScript.

Debe permitir demostrar:

- escenarios principales;
- validaciones;
- errores;
- caminos alternativos;
- diferentes estados;
- diferentes roles;

según lo definido en el documento.

NO debe contener funcionalidades adicionales.


==================================================
31. INFORME FINAL
==================================================

Al terminar entrega un informe en formato tabla:

| CU | Pantalla | Ruta | Archivo principal | Componentes | Validaciones | Caminos alternativos | Estado |
|----|----------|------|-------------------|-------------|--------------|----------------------|--------|

El estado solamente puede ser:

IMPLEMENTADO
PENDIENTE

Después incluye:

## ARCHIVOS CREADOS

Lista únicamente los archivos nuevos.

Debes confirmar que todos sean:

.js
.jsx
.css
u otros archivos estáticos necesarios.

No debe existir ningún archivo .ts o .tsx nuevo.


Después incluye:

## ELEMENTOS NO IMPLEMENTADOS POR NO ESTAR DEFINIDOS EN EL DOCUMENTO

Si no existe ninguno:

Ninguno.


Después incluye:

## INCONSISTENCIAS DETECTADAS EN EL DOCUMENTO

Indica cualquier contradicción encontrada entre:

- Caso de Uso;
- prototipo;
- mapa de navegación;
- diagrama de secuencia.

NO corrijas estas inconsistencias modificando el producto por tu cuenta.


==================================================
32. INSTRUCCIÓN FINAL
==================================================

Comienza ahora.

Orden obligatorio:

1. Inspecciona completamente el proyecto Next.js existente.
2. Lee completamente el documento funcional adjunto.
3. Identifica CU-01 a CU-21.
4. Analiza los prototipos asociados.
5. Construye internamente la matriz de trazabilidad.
6. Identifica qué componentes pueden reutilizarse.
7. Implementa CU-01 a CU-21.
8. Utiliza exclusivamente JavaScript/JSX.
9. No utilices TypeScript.
10. Ejecuta el proyecto.
11. Corrige errores de compilación.
12. Verifica la navegación.
13. Audita cada caso de uso contra el documento.
14. Elimina cualquier funcionalidad que no pueda justificarse con el documento.
15. Entrega el informe final.

RECUERDA:

EL DOCUMENTO ES LA ÚNICA FUENTE DE VERDAD.

NO INVENTAR.

NO AGREGAR FUNCIONALIDADES.

NO MODIFICAR EL ALCANCE.

NEXT.JS + REACT + JAVASCRIPT + JSX.

NO TYPESCRIPT.

TODO ELEMENTO DEL FRONTEND DEBE ESTAR RESPALDADO POR EL DOCUMENTO FUNCIONAL.