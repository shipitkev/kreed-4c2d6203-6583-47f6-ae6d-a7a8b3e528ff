import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

type ModalState = {
  modal: string;
  onModalClose: (() => void) | null;
};

const initialState: ModalState = {
  modal: '',
  onModalClose: null,
};

export const ModalStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withMethods((store) => ({
    setModal(modalType: string | null = '', onClose?: (() => void) | null) {
      // If modal is being closed, call onModalClose callback
      if ((modalType === '' || modalType === null) && store.onModalClose()) {
        store.onModalClose()?.();
        patchState(store, { modal: '', onModalClose: null });
        document.body.style.overflow = 'unset';
      } else {
        patchState(store, { 
          modal: modalType || '', 
          onModalClose: onClose || null 
        });
        if (modalType && modalType !== '') {
          document.body.style.overflow = 'hidden';
        }
      }
    },
    setOnModalClose(callback: (() => void) | null) {
      patchState(store, { onModalClose: callback });
    }
  }))
);

