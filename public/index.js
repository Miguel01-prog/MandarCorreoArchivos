document.addEventListener('DOMContentLoaded', () => {
  // Inputs y botones de oficina
  const pdfInput = document.getElementById('pdfInput');
  const fileName = document.getElementById('fileName');
  const browseBtn = document.getElementById('browseBtn');
  const submitBtn = document.getElementById('submitBtn');

  // Inputs y botones de patio
  const pdfInputPatio = document.getElementById('pdfInputPatio');
  const fileNamePatio = document.getElementById('fileNamePatio');
  const browseBtnPatio = document.getElementById('browseBtnPatio');
  const submitBtnPatio = document.getElementById('submitBtnPatio');

  // Mostrar botón "Enviar" si hay archivo seleccionado - oficina
  if (pdfInput) {
    pdfInput.addEventListener('change', () => {
      fileName.textContent = Array.from(pdfInput.files).map(f => f.name).join(', ');
      submitBtn.classList.toggle('hidden', pdfInput.files.length === 0);
    });
  }

  if (browseBtn && pdfInput) {
    browseBtn.addEventListener('click', () => pdfInput.click());
  }

  // Mostrar botón "Enviar" si hay archivo seleccionado - patio (máx 4 archivos)
  if (pdfInputPatio) {
    pdfInputPatio.addEventListener('change', () => {
      const files = Array.from(pdfInputPatio.files);
      if (files.length !== 4) {
        alert('Debes seleccionar exactamente 4 archivos PDF.');
        pdfInputPatio.value = '';
        fileNamePatio.textContent = '';
        submitBtnPatio.classList.add('hidden');
        return;
      }

      fileNamePatio.textContent = files.map(f => f.name).join(', ');
      submitBtnPatio.classList.remove('hidden');
    });
  }

  if (browseBtnPatio && pdfInputPatio) {
    browseBtnPatio.addEventListener('click', () => pdfInputPatio.click());
  }

  // Enviar formulario de oficina
  const visitaForm = document.getElementById('visitaForm');
  if (visitaForm) {
    visitaForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const empresa = document.getElementById('empresaVisita')?.value || '';
      const nombre = document.getElementById('nombreVisita')?.value || '';
      const fecha = document.getElementById('fechaVisita')?.value || '';

      const formData = new FormData(this);
      formData.append('empresa', empresa);
      formData.append('nombre', nombre);
      formData.append('fecha', fecha);
      formData.append('motivo', 'visita a oficina');

      fetch('http://localhost:3000/upload/oficina', {
        method: 'POST',
        body: formData,
      })
        .then(res => res.text())
        .then(msg => alert(msg))
        .catch(err => console.error('Error al enviar visita:', err));
    });
  }

  // Enviar formulario de patio
  const visitaFormPatio = document.getElementById('visitaFormPatio');
  if (visitaFormPatio) {
    visitaFormPatio.addEventListener('submit', function (e) {
      e.preventDefault();

      const files = pdfInputPatio.files;
      if (!files || files.length !== 4) {
        alert('Debes seleccionar exactamente 4 archivos PDF antes de enviar.');
        return;
      }

      const empresa = document.getElementById('empresaVisita')?.value || '';
      const nombre = document.getElementById('nombreVisita')?.value || '';
      const fecha = document.getElementById('fechaTrabajo')?.value || '';

      const formData = new FormData(this);
      formData.append('empresa', empresa);
      formData.append('nombre', nombre);
      formData.append('fecha', fecha);
      formData.append('motivo', 'Trabajo en patio');

      fetch('http://localhost:3000/upload/patio', {
        method: 'POST',
        body: formData,
      })
        .then(res => res.text())
        .then(msg => alert(msg))
        .catch(err => console.error('Error al enviar patio:', err));
    });
  }

  // Mostrar y ocultar formularios según selección principal
  const opcionPrincipal = document.getElementById('opcionPrincipal');
  const forAccesos = document.getElementById('forAccesos');
  const forDocumentos = document.getElementById('forDocumentos');
  const forTipoAcceso = document.getElementById('forTipoAcceso');
  const forTrabajo = document.getElementById('forTrabajo');

  if (opcionPrincipal) {
    opcionPrincipal.addEventListener('change', function () {
      forAccesos.classList.add('hidden');
      forDocumentos.classList.add('hidden');

      if (this.value === 'accesos') {
        forAccesos.classList.remove('hidden');
      } else if (this.value === 'documentos') {
        forDocumentos.classList.remove('hidden');
      }
    });
  }

  // Mostrar subformularios según checkbox seleccionado
  const checkVisita = document.getElementById('checkVisita');
  const checkTrabajo = document.getElementById('checkTrabajo');

  if (checkVisita && checkTrabajo) {
    checkVisita.addEventListener('change', () => {
      forTipoAcceso.classList.remove('hidden');
      forTrabajo.classList.add('hidden');
    });

    checkTrabajo.addEventListener('change', () => {
      forTipoAcceso.classList.add('hidden');
      forTrabajo.classList.remove('hidden');
    });
  }
});
