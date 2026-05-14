export type Language = 'es' | 'en'

export const translations = {
  es: {
    // Navigation
    nav: {
      dashboard: 'Dashboard',
      proposals: 'Propuestas',
      analytics: 'Analítica',
      settings: 'Configuración',
      signOut: 'Cerrar sesión',
    },
    // Dashboard
    dashboard: {
      title: 'Mis Propuestas',
      subtitle: 'Gestiona y envía tus propuestas comerciales.',
      newProposal: 'Nueva Propuesta',
      noProposals: 'Sin propuestas',
      noProposalsDesc: 'Crea tu primera propuesta para comenzar.',
      edit: 'Editar',
      view: 'Ver',
      draft: 'Borrador',
      published: 'Publicada',
    },
    // Create Proposal
    createProposal: {
      title: 'Crear Nueva Propuesta',
      subtitle: 'Cuéntanos sobre tu proyecto y te ayudaremos a estructurarlo.',
      titleLabel: 'Título de la Propuesta',
      titlePlaceholder: 'Ej: Rediseño de sitio web para Acme Co.',
      briefLabel: 'Descripción del Proyecto',
      briefPlaceholder: 'Describe el proyecto en detalle:\n- ¿Sobre qué trata?\n- ¿Cuáles son los objetivos principales?\n- ¿Quién es el cliente?\n- ¿Qué timeline tienes en mente?\n- ¿Requisitos o restricciones específicas?',
      generateWithAI: 'Generar con IA',
      generateWithAIDesc: 'Nuestra IA estructurará automáticamente tu brief en alcance, entregables, timeline y precios.',
      createButton: 'Crear Propuesta',
      creating: 'Creando...',
      generating: 'Generando...',
      cancel: 'Cancelar',
      characters: 'caracteres',
    },
    // Edit Proposal
    editProposal: {
      title: 'Editar Propuesta',
      subtitle: 'Ajusta tu propuesta antes de publicar',
      preview: 'Vista Previa',
      scope: 'Alcance del Proyecto',
      scopePlaceholder: 'Describe el alcance del proyecto...',
      deliverables: 'Entregables',
      add: 'Agregar',
      timeline: 'Timeline',
      addPhase: 'Agregar Fase',
      phaseName: 'Nombre de la fase',
      duration: 'Duración (ej: 2 semanas)',
      phaseDescription: '¿Qué se hará en esta fase?',
      investment: 'Inversión',
      totalAmount: 'Monto Total',
      currency: 'Moneda',
      costBreakdown: 'Desglose de Costos (opcional)',
      costBreakdownPlaceholder: '¿Cómo se distribuye el precio?',
      saveDraft: 'Guardar Borrador',
      publishProposal: 'Publicar Propuesta',
      saving: 'Guardando...',
      publishing: 'Publicando...',
      backToDashboard: 'Volver al Dashboard',
    },
  },
  en: {
    // Navigation
    nav: {
      dashboard: 'Dashboard',
      proposals: 'Proposals',
      analytics: 'Analytics',
      settings: 'Settings',
      signOut: 'Sign Out',
    },
    // Dashboard
    dashboard: {
      title: 'My Proposals',
      subtitle: 'Manage and send your commercial proposals.',
      newProposal: 'New Proposal',
      noProposals: 'No proposals yet',
      noProposalsDesc: 'Create your first proposal to get started.',
      edit: 'Edit',
      view: 'View',
      draft: 'Draft',
      published: 'Published',
    },
    // Create Proposal
    createProposal: {
      title: 'Create New Proposal',
      subtitle: 'Tell us about your project and we\'ll help structure it.',
      titleLabel: 'Proposal Title',
      titlePlaceholder: 'e.g. Website redesign for Acme Co.',
      briefLabel: 'Project Brief',
      briefPlaceholder: 'Describe the project in detail:\n- What is the project about?\n- What are the main goals?\n- Who is the client?\n- What timeline are you thinking?\n- Any specific requirements or constraints?',
      generateWithAI: 'Generate with AI',
      generateWithAIDesc: 'Our AI will automatically structure your brief into scope, deliverables, timeline, and pricing.',
      createButton: 'Create Proposal',
      creating: 'Creating...',
      generating: 'Generating...',
      cancel: 'Cancel',
      characters: 'characters',
    },
    // Edit Proposal
    editProposal: {
      title: 'Edit Proposal',
      subtitle: 'Edit your proposal before publishing',
      preview: 'Preview',
      scope: 'Project Scope',
      scopePlaceholder: 'Describe the project scope...',
      deliverables: 'Deliverables',
      add: 'Add',
      timeline: 'Timeline',
      addPhase: 'Add Phase',
      phaseName: 'Phase name',
      duration: 'Duration (e.g., 2 weeks)',
      phaseDescription: 'What will be done in this phase?',
      investment: 'Investment',
      totalAmount: 'Total Amount',
      currency: 'Currency',
      costBreakdown: 'Cost Breakdown (optional)',
      costBreakdownPlaceholder: 'How is the price distributed?',
      saveDraft: 'Save Draft',
      publishProposal: 'Publish Proposal',
      saving: 'Saving...',
      publishing: 'Publishing...',
      backToDashboard: 'Back to Dashboard',
    },
  },
}

export function getTranslation(lang: Language) {
  return translations[lang]
}
