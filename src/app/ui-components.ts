export interface IonicComponentDoc {
  slug: string;
  name: string;
  description: string;
  category: string;
}

export const IONIC_COMPONENTS: IonicComponentDoc[] = [
  { slug: 'ion-button', name: 'IonButton', description: 'Botones para ejecutar acciones y enviar formularios.', category: 'Acciones' },
  { slug: 'ion-card', name: 'IonCard', description: 'Contenedor para agrupar información relacionada.', category: 'Contenido' },
  { slug: 'ion-checkbox', name: 'IonCheckbox', description: 'Control para seleccionar una o varias opciones.', category: 'Formularios' },
  { slug: 'ion-chip', name: 'IonChip', description: 'Elemento compacto para mostrar etiquetas o filtros.', category: 'Contenido' },
  { slug: 'ion-content', name: 'IonContent', description: 'Contenedor principal con desplazamiento para una página.', category: 'Layout' },
  { slug: 'ion-item', name: 'IonItem', description: 'Fila adaptable para organizar texto, controles e iconos.', category: 'Layout' },
  { slug: 'ion-list', name: 'IonList', description: 'Lista vertical para presentar filas de información.', category: 'Contenido' },
  { slug: 'ion-input', name: 'IonInput', description: 'Campo de entrada de texto con estilos de Ionic.', category: 'Formularios' },
  { slug: 'ion-label', name: 'IonLabel', description: 'Etiqueta de texto para describir otros elementos.', category: 'Contenido' },
  { slug: 'ion-modal', name: 'IonModal', description: 'Ventana superpuesta para mostrar contenido temporal.', category: 'Navegación' },
  { slug: 'ion-alert', name: 'IonAlert', description: 'Diálogo para informar, confirmar o pedir una decisión.', category: 'Feedback' },
  { slug: 'ion-toast', name: 'IonToast', description: 'Mensaje breve que aparece sobre la interfaz.', category: 'Feedback' },
  { slug: 'ion-spinner', name: 'IonSpinner', description: 'Indicador visual para procesos en curso.', category: 'Feedback' },
  { slug: 'ion-progress-bar', name: 'IonProgressBar', description: 'Barra que comunica el avance de una tarea.', category: 'Feedback' },
  { slug: 'ion-range', name: 'IonRange', description: 'Control deslizante para escoger un valor numérico.', category: 'Formularios' },
  { slug: 'ion-select', name: 'IonSelect', description: 'Selector para escoger una opción de un conjunto.', category: 'Formularios' },
  { slug: 'ion-toggle', name: 'IonToggle', description: 'Interruptor para activar o desactivar una preferencia.', category: 'Formularios' },
  { slug: 'ion-segment', name: 'IonSegment', description: 'Control para cambiar entre vistas relacionadas.', category: 'Navegación' },
  { slug: 'ion-fab', name: 'IonFab', description: 'Botón de acción flotante para la acción principal.', category: 'Acciones' },
  { slug: 'ion-badge', name: 'IonBadge', description: 'Pequeña etiqueta para mostrar estados o cantidades.', category: 'Contenido' },
];