export default function Loader({ message = 'Cargando...' }) {
    return (
        <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{
                zIndex: 1300,
                backdropFilter: 'blur(10px)',
                backgroundColor: 'rgba(255, 255, 255, 0.55)'
            }}
        >
            <div
                className="text-center p-4 rounded"
                style={{
                    background: 'rgba(255,255,255,0.65)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
                }}
            >
                {/* Spinner */}
                <div
                    className="spinner-border"
                    role="status"
                    style={{
                        width: '3rem',
                        height: '3rem'
                    }}
                >
                    <span className="visually-hidden">Loading...</span>
                </div>

                {/* Message */}
                <div className="mt-3 fw-medium">
                    {message}
                </div>
            </div>
        </div>
    );
}
