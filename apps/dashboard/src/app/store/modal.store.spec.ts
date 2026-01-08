import { TestBed } from '@angular/core/testing';
import { ModalStore } from './modal.store';

describe('ModalStore', () => {
  let store: ModalStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ModalStore],
    });
    store = TestBed.inject(ModalStore);
    // Reset document body overflow
    document.body.style.overflow = 'unset';
  });

  afterEach(() => {
    // Clean up
    store.setModal('');
    document.body.style.overflow = 'unset';
  });

  it('should be created', () => {
    expect(store).toBeTruthy();
  });

  it('should have initial empty modal state', () => {
    expect(store.modal()).toBe('');
    expect(store.onModalClose()).toBeNull();
  });

  describe('setModal', () => {
    it('should set modal type', () => {
      store.setModal('create-task');
      expect(store.modal()).toBe('create-task');
    });

    it('should set body overflow to hidden when opening modal', () => {
      store.setModal('settings');
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('should reset body overflow when closing modal', () => {
      store.setModal('settings');
      expect(document.body.style.overflow).toBe('hidden');
      
      store.setModal('');
      expect(document.body.style.overflow).toBe('unset');
    });

    it('should call onModalClose callback when closing modal', () => {
      const callback = jest.fn();
      store.setModal('create-task', callback);
      expect(store.onModalClose()).toBe(callback);

      store.setModal('');
      expect(callback).toHaveBeenCalled();
      expect(store.onModalClose()).toBeNull();
    });

    it('should handle null modal type', () => {
      store.setModal('create-task');
      store.setModal(null);
      expect(store.modal()).toBe('');
    });

    it('should not call callback if modal is opened with different type', () => {
      const callback = jest.fn();
      store.setModal('create-task', callback);
      
      store.setModal('settings');
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('setOnModalClose', () => {
    it('should set onModalClose callback', () => {
      const callback = jest.fn();
      store.setOnModalClose(callback);
      expect(store.onModalClose()).toBe(callback);
    });

    it('should allow setting callback to null', () => {
      const callback = jest.fn();
      store.setOnModalClose(callback);
      expect(store.onModalClose()).toBe(callback);
      
      store.setOnModalClose(null);
      expect(store.onModalClose()).toBeNull();
    });
  });
});

