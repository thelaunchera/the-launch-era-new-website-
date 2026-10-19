export const industries = {
  cleaning: {
    id: 'cleaning', label: { en: 'Cleaning', es: 'Limpieza' }, icon: 'spark',
    intro: { en: 'A cleaner home or workplace, with the details in one place.', es: 'Un hogar o espacio de trabajo más limpio, con los detalles en un solo lugar.' },
    services: [
      { id: 'standard', en: 'Standard home cleaning', es: 'Limpieza regular del hogar', note: { en: 'Routine home upkeep', es: 'Mantenimiento habitual del hogar' } },
      { id: 'deep', en: 'Deep cleaning', es: 'Limpieza profunda', note: { en: 'A detailed top-to-bottom visit', es: 'Una visita detallada de arriba abajo' } },
      { id: 'move', en: 'Move-in / move-out', es: 'Limpieza de mudanza', note: { en: 'A fresh start for a new space', es: 'Un nuevo comienzo para tu espacio' } }
    ],
    details: [
      { id: 'property', label: { en: 'What kind of space?', es: '¿Qué tipo de espacio?' }, type: 'select', options: [{ en: 'House', es: 'Casa' }, { en: 'Apartment or condo', es: 'Apartamento o condominio' }, { en: 'Office or commercial space', es: 'Oficina o espacio comercial' }] },
      { id: 'size', label: { en: 'How many bedrooms?', es: '¿Cuántas habitaciones?' }, type: 'select', options: [{ en: 'Studio / 1', es: 'Estudio / 1' }, { en: '2 bedrooms', es: '2 habitaciones' }, { en: '3 bedrooms', es: '3 habitaciones' }, { en: '4 or more', es: '4 o más' }] },
      { id: 'notes', label: { en: 'Anything else we should know?', es: '¿Algo más que debamos saber?' }, type: 'textarea', placeholder: { en: 'Share sample details only', es: 'Escribe solo datos de ejemplo' } }
    ]
  },
  detailing: {
    id: 'detailing', label: { en: 'Car detailing', es: 'Detailing de autos' }, icon: 'car',
    intro: { en: 'A polished vehicle-service request, from package to location.', es: 'Una solicitud de cuidado automotriz, del paquete a la ubicación.' },
    services: [
      { id: 'interior', en: 'Interior refresh', es: 'Renovación interior', note: { en: 'A cleaner cabin, inside and out', es: 'Un interior más limpio y cuidado' } },
      { id: 'complete', en: 'Full detail', es: 'Detailing completo', note: { en: 'Interior and exterior care', es: 'Cuidado interior y exterior' } },
      { id: 'fleet', en: 'Fleet service', es: 'Servicio para flotas', note: { en: 'For a work or business vehicle', es: 'Para vehículos de trabajo o negocio' } }
    ],
    details: [
      { id: 'vehicle', label: { en: 'What type of vehicle?', es: '¿Qué tipo de vehículo?' }, type: 'select', options: [{ en: 'Car or sedan', es: 'Auto o sedán' }, { en: 'SUV or crossover', es: 'SUV o crossover' }, { en: 'Truck or van', es: 'Camioneta o van' }] },
      { id: 'location', label: { en: 'Where would service take place?', es: '¿Dónde se realizaría el servicio?' }, type: 'select', options: [{ en: 'At my home', es: 'En mi casa' }, { en: 'At my workplace', es: 'En mi trabajo' }, { en: 'I can bring the vehicle', es: 'Puedo llevar el vehículo' }] },
      { id: 'notes', label: { en: 'Any priority areas?', es: '¿Alguna zona prioritaria?' }, type: 'textarea', placeholder: { en: 'Use sample details only', es: 'Usa solo datos de ejemplo' } }
    ]
  },
  landscaping: {
    id: 'landscaping', label: { en: 'Landscaping', es: 'Jardinería' }, icon: 'leaf',
    intro: { en: 'Outdoor work scoped around the property and season.', es: 'Trabajo exterior según la propiedad y la temporada.' },
    services: [
      { id: 'lawn', en: 'Lawn maintenance', es: 'Mantenimiento del césped', note: { en: 'Regular care for a tidy yard', es: 'Cuidado habitual para un jardín ordenado' } },
      { id: 'garden', en: 'Garden refresh', es: 'Renovación del jardín', note: { en: 'Planting and garden-bed care', es: 'Plantación y cuidado de canteros' } },
      { id: 'seasonal', en: 'Seasonal cleanup', es: 'Limpieza de temporada', note: { en: 'A reset for the changing season', es: 'Preparación para el cambio de temporada' } }
    ],
    details: [
      { id: 'property', label: { en: 'What area needs attention?', es: '¿Qué área necesita atención?' }, type: 'select', options: [{ en: 'Front yard', es: 'Jardín delantero' }, { en: 'Backyard', es: 'Patio trasero' }, { en: 'Full property', es: 'Toda la propiedad' }] },
      { id: 'size', label: { en: 'Approximate project size', es: 'Tamaño aproximado del proyecto' }, type: 'select', options: [{ en: 'Small', es: 'Pequeño' }, { en: 'Medium', es: 'Mediano' }, { en: 'Large', es: 'Grande' }, { en: 'Not sure yet', es: 'Aún no estoy seguro' }] },
      { id: 'notes', label: { en: 'What would you like done?', es: '¿Qué te gustaría hacer?' }, type: 'textarea', placeholder: { en: 'Use sample details only', es: 'Usa solo datos de ejemplo' } }
    ]
  },
  pressure: {
    id: 'pressure', label: { en: 'Pressure washing', es: 'Lavado a presión' }, icon: 'water',
    intro: { en: 'A clearer estimate starts with the surface and scope.', es: 'Un presupuesto más claro comienza con la superficie y el alcance.' },
    services: [
      { id: 'driveway', en: 'Driveway wash', es: 'Lavado de entrada', note: { en: 'Concrete and paved surfaces', es: 'Superficies de concreto y pavimento' } },
      { id: 'exterior', en: 'House exterior wash', es: 'Lavado exterior de la casa', note: { en: 'Exterior siding and walls', es: 'Revestimiento y paredes exteriores' } },
      { id: 'patio', en: 'Patio or deck wash', es: 'Lavado de patio o terraza', note: { en: 'Outdoor living surfaces', es: 'Superficies para disfrutar al aire libre' } }
    ],
    details: [
      { id: 'surface', label: { en: 'Which surface?', es: '¿Qué superficie?' }, type: 'select', options: [{ en: 'Concrete', es: 'Concreto' }, { en: 'Siding', es: 'Revestimiento exterior' }, { en: 'Wood deck', es: 'Terraza de madera' }, { en: 'Other', es: 'Otra' }] },
      { id: 'condition', label: { en: 'Current condition', es: 'Estado actual' }, type: 'select', options: [{ en: 'Light dirt', es: 'Suciedad ligera' }, { en: 'Stains or buildup', es: 'Manchas o acumulación' }, { en: 'Not sure', es: 'No estoy seguro' }] },
      { id: 'notes', label: { en: 'Anything to add?', es: '¿Algo más que quieras agregar?' }, type: 'textarea', placeholder: { en: 'Use sample details only', es: 'Usa solo datos de ejemplo' } }
    ]
  },
  home: {
    id: 'home', label: { en: 'Home services', es: 'Servicios para el hogar' }, icon: 'home',
    intro: { en: 'Repair and maintenance requests with the scope made clear.', es: 'Solicitudes de reparación y mantenimiento con un alcance claro.' },
    services: [
      { id: 'repair', en: 'Home repair', es: 'Reparación del hogar', note: { en: 'A repair that needs a closer look', es: 'Una reparación que requiere revisión' } },
      { id: 'seasonal', en: 'Seasonal maintenance', es: 'Mantenimiento de temporada', note: { en: 'Helpful upkeep around the home', es: 'Mantenimiento útil para el hogar' } },
      { id: 'install', en: 'Installation or assembly', es: 'Instalación o armado', note: { en: 'Set up a fixture or household item', es: 'Instala un accesorio o artículo del hogar' } }
    ],
    details: [
      { id: 'project', label: { en: 'What kind of project?', es: '¿Qué tipo de proyecto?' }, type: 'select', options: [{ en: 'Repair', es: 'Reparación' }, { en: 'Maintenance', es: 'Mantenimiento' }, { en: 'Installation', es: 'Instalación' }] },
      { id: 'priority', label: { en: 'How urgent is it?', es: '¿Qué tan urgente es?' }, type: 'select', options: [{ en: 'Flexible timing', es: 'Horario flexible' }, { en: 'Soon, if available', es: 'Pronto, si hay disponibilidad' }, { en: 'I need advice first', es: 'Primero necesito orientación' }] },
      { id: 'notes', label: { en: 'Briefly describe the work', es: 'Describe brevemente el trabajo' }, type: 'textarea', placeholder: { en: 'Use sample details only', es: 'Usa solo datos de ejemplo' } }
    ]
  },
  beauty: {
    id: 'beauty', label: { en: 'Beauty & appointments', es: 'Belleza y citas' }, icon: 'flower',
    intro: { en: 'Appointment requests that make the next step feel easy.', es: 'Solicitudes de citas que facilitan el siguiente paso.' },
    services: [
      { id: 'hair', en: 'Hair styling', es: 'Peinado', note: { en: 'A style or refresh appointment', es: 'Una cita de estilo o renovación' } },
      { id: 'facial', en: 'Facial appointment', es: 'Cita para tratamiento facial', note: { en: 'A moment set aside for care', es: 'Un momento dedicado al cuidado' } },
      { id: 'nails', en: 'Nail service', es: 'Servicio de uñas', note: { en: 'A manicure or nail appointment', es: 'Una cita de manicura o uñas' } }
    ],
    details: [
      { id: 'appointment', label: { en: 'What service are you looking for?', es: '¿Qué servicio buscas?' }, type: 'select', options: [{ en: 'New service', es: 'Servicio nuevo' }, { en: 'Returning appointment', es: 'Cita de seguimiento' }, { en: 'Not sure yet', es: 'Aún no estoy segura' }] },
      { id: 'length', label: { en: 'Preferred appointment length', es: 'Duración preferida de la cita' }, type: 'select', options: [{ en: 'About 30 minutes', es: 'Unos 30 minutos' }, { en: 'About 60 minutes', es: 'Unos 60 minutos' }, { en: 'Please advise', es: 'Necesito orientación' }] },
      { id: 'notes', label: { en: 'Any preferences to share?', es: '¿Alguna preferencia que quieras compartir?' }, type: 'textarea', placeholder: { en: 'Use sample details only', es: 'Usa solo datos de ejemplo' } }
    ]
  }
};

export const industryOrder = ['cleaning', 'detailing', 'landscaping', 'pressure', 'home', 'beauty'];

export const iconMarkup = (name) => {
  const paths = {
    spark: '<path d="m12 2 1.5 7 7 3-7 1.5-1.5 7-1.5-7-7-1.5 7-3L12 2Z"/><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z"/>',
    car: '<path d="m5 11 1.5-4h11L19 11l1.5 2v6h-2v-2H5v2H3v-6l2-2Z"/><path d="M6.5 14h.1m10.8 0h.1M3 13h18M7 7l1-3h8l1 3"/>',
    leaf: '<path d="M20 4C10 4 4 8 4 15a5 5 0 0 0 5 5c7 0 11-6 11-16Z"/><path d="M4 20c3-5 7-8 12-11"/>',
    water: '<path d="M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11Z"/><path d="M9 15a3 3 0 0 0 3 3"/>',
    home: '<path d="m3 11 9-8 9 8v9h-6v-6H9v6H3v-9Z"/><path d="M8 11h.1M16 11h.1"/>',
    flower: '<circle cx="12" cy="12" r="2"/><path d="M12 10C9 4 12 2 14 5c1 2 0 4-2 5Zm2 2c6-3 8 0 5 2-2 1-4 0-5-2Zm-2 2c3 6 0 8-2 5-1-2 0-4 2-5Zm-2-2c-6 3-8 0-5-2 2-1 4 0 5 2Z"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M8 14h2M14 14h2M8 17h2"/>',
    message: '<path d="M20 11.5a7.5 7.5 0 0 1-7.5 7.5H6l-3 2v-5.5A7.5 7.5 0 1 1 20 11.5Z"/><path d="M8 11h8M8 14h5"/>',
    grid: '<rect x="3" y="3" width="8" height="8" rx="2"/><rect x="13" y="3" width="8" height="5" rx="2"/><rect x="13" y="10" width="8" height="11" rx="2"/><rect x="3" y="13" width="8" height="8" rx="2"/>'
  };
  return `<svg class="icon trade-icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.spark}</svg>`;
};
