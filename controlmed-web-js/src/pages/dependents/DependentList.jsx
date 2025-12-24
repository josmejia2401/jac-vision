import { useEffect, useState, useRef } from 'react';

import DependentsService from '../../services/dependents.service';
import DependentFormDialog from './DependentFormDialog';
import Loader from '../../components/Loader';
import AppSnackbar from '../../components/AppSnackbar';

const RELATIONSHIP_LABELS = {
  SON: 'Hijo',
  DAUGHTER: 'Hija',
  HUSBAND: 'Esposo',
  WIFE: 'Esposa',
  FATHER: 'Padre',
  MOTHER: 'Madre',
  BROTHER: 'Hermano',
  SISTER: 'Hermana',
  OTHER: 'Otro'
};

const GENDER_LABELS = {
  MA: 'Masculino',
  FE: 'Femenino',
  OT: 'Otro',
  PNS: 'No especificado'
};

export default function DependentList() {
  const [items, setItems] = useState([]);
  const [selected, setSelected] = useState(null);
  const [openForm, setOpenForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const didFetch = useRef(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  const showSnackbar = (message, severity = 'info') =>
    setSnackbar({ open: true, message, severity });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await DependentsService.getAll();
      setItems(res.data);
    } catch {
      showSnackbar('Error al cargar los dependientes', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (didFetch.current) return;
    didFetch.current = true;
    loadData();
  }, []);

  const handleDelete = async id => {
    if (!window.confirm('¿Deseas eliminar este dependiente?')) return;
    try {
      await DependentsService.remove(id);
      showSnackbar('Dependiente eliminado', 'success');
      loadData();
    } catch {
      showSnackbar('No fue posible eliminar el dependiente', 'danger');
    }
  };

  return (
    <>
      {loading && <Loader message="Cargando dependientes..." />}

      <div className="card shadow-sm border-0 rounded-4">
        <div className="card-body border-bottom d-flex justify-content-between align-items-center">
          <div>
            <h5 className="fw-bold mb-1">Dependientes</h5>
            <small className="text-muted">
              Administración de dependientes registrados
            </small>
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-primary d-flex align-items-center gap-2"
              onClick={() => setOpenForm(true)}
            >
              <i className="bi bi-plus-lg"></i>
              Nuevo dependiente
            </button>

            <button
              className="btn btn-secondary d-flex align-items-center gap-2"
              onClick={loadData}
            >
              <i className="bi bi-arrow-clockwise"></i>
              Refrescar
            </button>
          </div>

        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Nombre</th>
                <th>Documento</th>
                <th>Parentesco</th>
                <th>Género</th>
                <th>Tipo Sangre</th>
                <th>Contacto</th>
                <th className="text-end">Acciones</th>
              </tr>
            </thead>

            <tbody>
              {items.map(d => (
                <tr key={d._id}>
                  <td className="fw-medium">{d.firstName} {d.lastName}</td>

                  <td className="text-muted">
                    {d.documentType}-{d.documentNumber}
                  </td>

                  <td>
                    <span className="badge rounded-pill text-bg-light border">
                      {RELATIONSHIP_LABELS[d.relationshipCode] || 'Otro'}
                    </span>
                  </td>

                  <td>{GENDER_LABELS[d.genderCode] || 'No especificado'}</td>

                  <td>{d.bloodType || 'Desconocido'}</td>

                  <td>
                    {d.email && <div><i className="bi bi-envelope me-1"></i>{d.email}</div>}
                    {d.phone && <div><i className="bi bi-telephone me-1"></i>{d.phone}</div>}
                  </td>

                  <td className="text-end">
                    <button
                      className="btn btn-sm btn-outline-secondary me-2"
                      title="Editar"
                      onClick={() => {
                        setSelected(d);
                        setOpenForm(true);
                      }}
                    >
                      <i className="bi bi-pencil"></i>
                    </button>

                    <button
                      className="btn btn-sm btn-outline-danger"
                      title="Eliminar"
                      onClick={() => handleDelete(d._id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}

              {!items.length && (
                <tr>
                  <td colSpan={7} className="text-center py-4 text-muted">
                    No hay dependientes registrados
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <DependentFormDialog
        open={openForm}
        initialData={selected}
        loading={loading}
        onClose={(updated) => {
          setOpenForm(false);
          setSelected(null);
          if (updated) loadData();
        }}
      />

      <AppSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      />
    </>
  );
}
