import { useState, useCallback, createContext, useContext } from 'react';
import './ConfirmDialog.css';

interface ConfirmOptions {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    danger?: boolean;
}

interface ConfirmContextType {
    confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | null>(null);

export function useConfirm() {
    const ctx = useContext(ConfirmContext);
    if (!ctx) throw new Error('useConfirm must be inside ConfirmProvider');
    return ctx.confirm;
}

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<{
        options: ConfirmOptions;
        resolve: (v: boolean) => void;
    } | null>(null);

    const confirm = useCallback((options: ConfirmOptions) => {
        return new Promise<boolean>((resolve) => {
            setState({ options, resolve });
        });
    }, []);

    const handleConfirm = () => { state?.resolve(true); setState(null); };
    const handleCancel = () => { state?.resolve(false); setState(null); };

    return (
        <ConfirmContext.Provider value={{ confirm }}>
            {children}
            {state && (
                <div className="confirm-overlay" onClick={handleCancel}>
                    <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
                        <h3>{state.options.title}</h3>
                        <p>{state.options.message}</p>
                        <div className="confirm-actions">
                            <button className="confirm-cancel" onClick={handleCancel}>
                                {state.options.cancelText || 'Cancelar'}
                            </button>
                            <button
                                className={`confirm-ok ${state.options.danger ? 'danger' : ''}`}
                                onClick={handleConfirm}
                            >
                                {state.options.confirmText || 'Confirmar'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </ConfirmContext.Provider>
    );
}
