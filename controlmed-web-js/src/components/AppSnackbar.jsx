import { useEffect, useRef } from 'react';

const SEVERITY_MAP = {
    success: 'success',
    error: 'danger',
    warning: 'warning',
    info: 'primary'
};

export default function AppSnackbar({
    open,
    message,
    severity = 'info',
    onClose,
    autoHideDuration = 4000
}) {
    const toastRef = useRef(null);

    useEffect(() => {
        if (!toastRef.current) return;

        const toastEl = toastRef.current;
        const toast = new window.bootstrap.Toast(toastEl, {
            autohide: true,
            delay: autoHideDuration
        });

        if (open) {
            toast.show();

            const timer = setTimeout(() => {
                onClose?.();
            }, autoHideDuration);

            return () => clearTimeout(timer);
        }
    }, [open, autoHideDuration, onClose]);

    if (!open) return null;

    return (
        <div
            className="toast-container position-fixed top-0 start-50 translate-middle-x p-3"
            style={{ zIndex: 1080 }}
        >
            <div
                ref={toastRef}
                className={`toast text-white bg-${SEVERITY_MAP[severity]} border-0`}
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
            >
                <div className="d-flex">
                    <div className="toast-body fw-semibold">
                        {message}
                    </div>
                    <button
                        type="button"
                        className="btn-close btn-close-white me-2 m-auto"
                        aria-label="Close"
                        onClick={onClose}
                    />
                </div>
            </div>
        </div>
    );
}
