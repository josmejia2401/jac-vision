export default function AppLoader() {
    return (
        <div
            className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light"
        >
            <div
                className="spinner-border text-primary"
                role="status"
                style={{ width: '3.5rem', height: '3.5rem' }}
            >
                <span className="visually-hidden">Cargando...</span>
            </div>

            <div className="mt-3 text-center">
                <h2 className="fw-bold mb-1 text-primary letter-spacing">
                    Control<span className="text-dark">Med</span>
                </h2>
                <div className="w-bold mb-1 text-primary letter-spacing small">
                    Cargando...
                </div>
            </div>
        </div>
    );
}
