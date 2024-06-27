import { createStore } from '@stencil/store';

const { state, onChange } = createStore({
  activeOverlays: 0,
});

const addOverlay = () => {
  state.activeOverlays++;
};

const removeOverlay = () => {
  state.activeOverlays = Math.max(0, state.activeOverlays - 1);
};

onChange('activeOverlays', value => {
  document.body.style.overflow = value > 0 ? 'hidden' : '';
});

export { addOverlay, removeOverlay };
