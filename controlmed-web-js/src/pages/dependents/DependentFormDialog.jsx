import { useEffect, useState } from 'react';
import AppSnackbar from '../../components/AppSnackbar';
import DependentsService from '../../services/dependents.service';
import Loader from '../../components/Loader';

const RELATIONSHIPS = [
  { code: "SON", label: "Hijo" },
  { code: "DAUGHTER", label: "Hija" },
  { code: "HUSBAND", label: "Esposo" },
  { code: "WIFE", label: "Esposa" },
  { code: "FATHER", label: "Padre" },
  { code: "MOTHER", label: "Madre" },
  { code: "BROTHER", label: "Hermano" },
  { code: "SISTER", label: "Hermana" },
  { code: "OTHER", label: "Otro" }
];

const DOCUMENT_TYPES = ["CC", "TI", "RC", "CE", "PA", "Otro"];
const GENDERS = ["MA", "FE", "OT", "PNS"];
const BLOOD_TYPES = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Desconocido"];

const EMPTY_FORM = {
  _id: undefined,
  userId: '',
  firstName: '',
  lastName: '',
  documentType: '',
  documentNumber: '',
  genderCode: '',
  birthDate: '',
  relationshipCode: '',
  bloodType: 'Desconocido',
  phone: '',
  email: '',
  address: '',
  allergies: [],
  chronicConditions: [],
  medications: [],
  eps: '',
  healthNotes: ''
};

export default function DependentFormDialog({ open, onClose, initialData, loading }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  // Estado para snackbar local
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const showSnackbar = (message, severity = 'info') =>
    setSnackbar({ open: true, message, severity });

  useEffect(() => {
    if (initialData) {
      setForm({
        ...EMPTY_FORM,
        ...initialData,
        birthDate: initialData.birthDate?.slice(0, 10) ?? ''
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
    setTouched({});
    setSubmitted(false);
  }, [initialData, open]);

  /* ===============================
     VALIDACIÓN DE CAMPOS
     =============================== */
  const validateField = (field, value) => {
    switch (field) {
      case 'firstName':
        if (!value?.trim()) return 'El nombre es obligatorio';
        if (value.length < 2) return 'El nombre debe tener al menos 2 caracteres';
        if (value.length > 100) return 'El nombre no puede superar los 100 caracteres';
        break;
      case 'lastName':
        if (!value?.trim()) return 'El apellido es obligatorio';
        if (value.length < 2) return 'El apellido debe tener al menos 2 caracteres';
        if (value.length > 100) return 'El apellido no puede superar los 100 caracteres';
        break;
      case 'documentType':
        if (!value) return 'El tipo de documento es obligatorio';
        if (!DOCUMENT_TYPES.includes(value)) return 'Tipo de documento inválido';
        break;
      case 'documentNumber':
        if (!value?.trim()) return 'El número de documento es obligatorio';
        if (value.length < 5) return 'El número de documento debe tener al menos 5 caracteres';
        if (value.length > 20) return 'El número de documento no puede superar los 20 caracteres';
        if (!/^[0-9A-Za-z-]+$/.test(value)) return 'El número de documento solo puede contener letras, números y guiones';
        break;
      case 'genderCode':
        if (!value) return 'El género es obligatorio';
        if (!GENDERS.includes(value)) return 'Género inválido';
        break;
      case 'birthDate':
        if (!value) return 'La fecha de nacimiento es obligatoria';
        break;
      case 'relationshipCode':
        if (!value) return 'El parentesco es obligatorio';
        if (!RELATIONSHIPS.map(r => r.code).includes(value)) return 'Parentesco inválido';
        break;
      case 'bloodType':
        if (!BLOOD_TYPES.includes(value)) return 'Tipo de sangre inválido';
        break;
      case 'email':
        if (value && !/^\S+@\S+\.\S+$/.test(value)) return 'El correo electrónico no tiene un formato válido';
        break;
      default:
        break;
    }
    return null;
  };

  /* ===============================
     onChange con validación en tiempo real
     =============================== */
  const handleChange = field => e => {
    const value = e.target.value;
    setForm(prev => ({ ...prev, [field]: value }));
    setTouched(prev => ({ ...prev, [field]: true }));
    setErrors(prev => ({ ...prev, [field]: validateField(field, value) }));
  };

  /* ===============================
     VALIDACIÓN FINAL
     =============================== */
  const validateForm = () => {
    const newErrors = {};
    Object.keys(form).forEach(field => {
      const err = validateField(field, form[field]);
      if (err) newErrors[field] = err;
    });
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) {
      showSnackbar('Por favor corrige los errores del formulario', 'warning');
      return false;
    }
    return true;
  };


  const handleSave = async () => {
    setSubmitted(true);
    if (!validateForm()) return;
    try {
      delete form["isActive"];
      delete form["createdAt"];
      delete form["created_at"];
      delete form["updated_at"];

      if (form?._id) {
        await DependentsService.update(form._id, form);
        showSnackbar('Dependiente actualizado correctamente', 'success');
      } else {
        await DependentsService.create(form);
        showSnackbar('Dependiente creado correctamente', 'success');
      }
      setSubmittedSuccess(true);
    } catch (error) {
      console.error(error);
      showSnackbar('No fue posible guardar el dependiente', 'error');
    } finally {
      setSubmitted(false);
    }
  };

  const onCloseNow = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setTouched({});
    setSubmitted(false);
    setSubmittedSuccess(false);
    setSnackbar({
      open: false,
      message: '',
      severity: 'info'
    });

    onClose(submittedSuccess);
  }

  const isEdit = Boolean(initialData?._id);
  if (!open) return null;

  return (
    <>
      {submitted && <Loader message="Guardando dependiente..." />}
      <div className="modal-backdrop fade show"></div>
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content border-0 rounded-4 shadow">
            {/* Header */}
            <div className="modal-header border-bottom">
              <div className="d-flex align-items-center gap-2">
                <div className="bg-primary-subtle text-primary rounded-circle p-2">
                  <i className="bi bi-person-fill"></i>
                </div>
                <div>
                  <h5 className="modal-title fw-bold mb-0">
                    {isEdit ? 'Editar dependiente' : 'Nuevo dependiente'}
                  </h5>
                  <small className="text-muted">
                    {isEdit ? 'Actualiza la información del dependiente' : 'Registra un nuevo dependiente'}
                  </small>
                </div>
              </div>
              <button type="button" className="btn-close" onClick={onCloseNow} disabled={loading} />
            </div>

            {/* Body */}
            <div className="modal-body p-4">
              <div className="row g-3">

                {/* Nombre */}
                <div className="col-12 col-md-6">
                  <label className="form-label">Nombre *</label>
                  <input
                    type="text"
                    className={`form-control ${(touched.firstName || submitted) && errors.firstName ? 'is-invalid' : ''}`}
                    value={form.firstName}
                    onChange={handleChange('firstName')}
                  />
                  <div className="invalid-feedback">{errors.firstName}</div>
                </div>

                {/* Apellido */}
                <div className="col-12 col-md-6">
                  <label className="form-label">Apellido *</label>
                  <input
                    type="text"
                    className={`form-control ${(touched.lastName || submitted) && errors.lastName ? 'is-invalid' : ''}`}
                    value={form.lastName}
                    onChange={handleChange('lastName')}
                  />
                  <div className="invalid-feedback">{errors.lastName}</div>
                </div>

                {/* Tipo Documento */}
                <div className="col-12 col-md-6">
                  <label className="form-label">Tipo Documento *</label>
                  <select
                    className={`form-select ${(touched.documentType || submitted) && errors.documentType ? 'is-invalid' : ''}`}
                    value={form.documentType}
                    onChange={handleChange('documentType')}
                  >
                    <option value="">Seleccionar</option>
                    {DOCUMENT_TYPES.map(dt => <option key={dt} value={dt}>{dt}</option>)}
                  </select>
                  <div className="invalid-feedback">{errors.documentType}</div>
                </div>

                {/* Número Documento */}
                <div className="col-12 col-md-6">
                  <label className="form-label">Número Documento *</label>
                  <input
                    type="text"
                    className={`form-control ${(touched.documentNumber || submitted) && errors.documentNumber ? 'is-invalid' : ''}`}
                    value={form.documentNumber}
                    onChange={handleChange('documentNumber')}
                  />
                  <div className="invalid-feedback">{errors.documentNumber}</div>
                </div>

                {/* Género */}
                <div className="col-12 col-md-6">
                  <label className="form-label">Género *</label>
                  <select
                    className={`form-select ${(touched.genderCode || submitted) && errors.genderCode ? 'is-invalid' : ''}`}
                    value={form.genderCode}
                    onChange={handleChange('genderCode')}
                  >
                    <option value="">Seleccionar</option>
                    {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                  <div className="invalid-feedback">{errors.genderCode}</div>
                </div>

                {/* Parentesco */}
                <div className="col-12 col-md-6">
                  <label className="form-label">Parentesco *</label>
                  <select
                    className={`form-select ${(touched.relationshipCode || submitted) && errors.relationshipCode ? 'is-invalid' : ''}`}
                    value={form.relationshipCode}
                    onChange={handleChange('relationshipCode')}
                  >
                    <option value="">Seleccionar</option>
                    {RELATIONSHIPS.map(r => <option key={r.code} value={r.code}>{r.label}</option>)}
                  </select>
                  <div className="invalid-feedback">{errors.relationshipCode}</div>
                </div>

                {/* Fecha Nacimiento */}
                <div className="col-12 col-md-6">
                  <label className="form-label">Fecha de nacimiento *</label>
                  <input
                    type="date"
                    className={`form-control ${(touched.birthDate || submitted) && errors.birthDate ? 'is-invalid' : ''}`}
                    value={form.birthDate}
                    onChange={handleChange('birthDate')}
                  />
                  <div className="invalid-feedback">{errors.birthDate}</div>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">Tipo de sangre</label>
                  <select
                    className={`form-select ${(touched.bloodType || submitted) && errors.bloodType ? 'is-invalid' : ''}`}
                    value={form.bloodType}
                    onChange={handleChange('bloodType')}
                  >
                    {BLOOD_TYPES.map(bt => <option key={bt} value={bt}>{bt}</option>)}
                  </select>
                  <div className="invalid-feedback">{errors.bloodType}</div>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">Teléfono</label>
                  <input
                    type="text"
                    className={`form-control ${(touched.phone || submitted) && errors.phone ? 'is-invalid' : ''}`}
                    value={form.phone}
                    onChange={handleChange('phone')}
                  />
                  <div className="invalid-feedback">{errors.phone}</div>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className={`form-control ${(touched.email || submitted) && errors.email ? 'is-invalid' : ''}`}
                    value={form.email}
                    onChange={handleChange('email')}
                  />
                  <div className="invalid-feedback">{errors.email}</div>
                </div>

                <div className="col-12">
                  <label className="form-label">Dirección</label>
                  <input
                    type="text"
                    className={`form-control ${(touched.address || submitted) && errors.address ? 'is-invalid' : ''}`}
                    value={form.address}
                    onChange={handleChange('address')}
                  />
                  <div className="invalid-feedback">{errors.address}</div>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label">EPS</label>
                  <input
                    type="text"
                    className={`form-control ${(touched.eps || submitted) && errors.eps ? 'is-invalid' : ''}`}
                    value={form.eps}
                    onChange={handleChange('eps')}
                  />
                  <div className="invalid-feedback">{errors.eps}</div>
                </div>

                <div className="col-12">
                  <label className="form-label">Notas de salud</label>
                  <textarea
                    className={`form-control ${(touched.healthNotes || submitted) && errors.healthNotes ? 'is-invalid' : ''}`}
                    value={form.healthNotes}
                    onChange={handleChange('healthNotes')}
                    rows={3}
                  />
                  <div className="invalid-feedback">{errors.healthNotes}</div>
                </div>

                <div className="col-12">
                  <label className="form-label">Alergias (separadas por coma)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.allergies.join(', ')}
                    onChange={e => setForm(prev => ({ ...prev, allergies: e.target.value.split(',').map(a => a.trim()) }))}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label">Condiciones crónicas (separadas por coma)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={form.chronicConditions.join(', ')}
                    onChange={e => setForm(prev => ({ ...prev, chronicConditions: e.target.value.split(',').map(c => c.trim()) }))}
                  />
                </div>

                {/* ===============================
   Medicamentos
   =============================== */}
                <div className="col-12">
                  <label className="form-label">Medicamentos</label>
                  {form.medications.map((med, index) => (
                    <div key={index} className="row g-2 mb-2 align-items-center">
                      <div className="col-4">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Nombre"
                          value={med.name}
                          onChange={e => {
                            const newMeds = [...form.medications];
                            newMeds[index].name = e.target.value;
                            setForm(prev => ({ ...prev, medications: newMeds }));
                          }}
                        />
                      </div>
                      <div className="col-3">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Dosis"
                          value={med.dosage || ''}
                          onChange={e => {
                            const newMeds = [...form.medications];
                            newMeds[index].dosage = e.target.value;
                            setForm(prev => ({ ...prev, medications: newMeds }));
                          }}
                        />
                      </div>
                      <div className="col-3">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Frecuencia"
                          value={med.frequency || ''}
                          onChange={e => {
                            const newMeds = [...form.medications];
                            newMeds[index].frequency = e.target.value;
                            setForm(prev => ({ ...prev, medications: newMeds }));
                          }}
                        />
                      </div>
                      <div className="col-2 d-flex">
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => {
                            const newMeds = [...form.medications];
                            newMeds.splice(index, 1);
                            setForm(prev => ({ ...prev, medications: newMeds }));
                          }}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="button"
                    className="btn btn-outline-primary btn-sm mt-2"
                    onClick={() => setForm(prev => ({
                      ...prev,
                      medications: [...prev.medications, { name: '', dosage: '', frequency: '' }]
                    }))}
                  >
                    <i className="bi bi-plus-lg ml-2"></i> Agregar medicamento
                  </button>
                </div>



              </div>
            </div>

            {/* Footer */}
            <div className="modal-footer border-top px-4 py-3">
              <button type="button" className="btn btn-outline-secondary" onClick={onCloseNow} disabled={loading}>
                Cancelar
              </button>
              <button type="button" className="btn btn-primary" onClick={handleSave} disabled={loading}>
                {loading && <span className="spinner-border spinner-border-sm me-2" />}
                {isEdit ? 'Guardar cambios' : 'Crear dependiente'}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Snackbar */}
      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      />
    </>
  );
}
