import { ICountry } from '@/models/commun';
import { createStore } from '@stencil/store';
interface PhoneInputStore {
  countries: ICountry[];
}
const initialState: PhoneInputStore = {
  countries: [],
};

export const { state: phone_input_store } = createStore<PhoneInputStore>(initialState);

export default phone_input_store;
