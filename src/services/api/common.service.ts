import axios from 'axios';
import { MissingTokenError, Token } from '../../models/Token';
import app_store from '@/stores/app.store';
import localizedWords from '@/stores/localization.store';

export class CommonService extends Token {
  public async getCurrencies() {
    const token = this.getToken();
    if (!token) {
      throw new MissingTokenError();
    }
    const { data } = await axios.post(`/Get_Exposed_Currencies?Ticket=${token}`);
    app_store.currencies = [...data['My_Result']];
    return data['My_Result'];
  }
  public async getExposedLanguages() {
    const token = this.getToken();
    if (!token) {
      throw new MissingTokenError();
    }
    const { data } = await axios.post(`/Get_Exposed_Languages?Ticket=${token}`);
    app_store.languages = [...data.My_Result];
    return data['My_Result'];
  }
  public async getCountries(language: string) {
    try {
      const token = this.getToken();
      if (token) {
        const { data } = await axios.post(`/Get_Exposed_Countries?Ticket=${token}`, {
          language,
        });
        if (data.ExceptionMsg !== '') {
          throw new Error(data.ExceptionMsg);
        }
        return data.My_Result;
      }
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }
  public async getUserDefaultCountry() {
    try {
      const token = this.getToken();
      if (!token) {
        throw new MissingTokenError();
      }
      const { data } = await axios.post(`/Get_Country_By_IP?Ticket=${token}`, {
        IP: '',
      });
      if (data.ExceptionMsg !== '') {
        throw new Error(data.ExceptionMsg);
      }
      return data['My_Result'];
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }
  public async getExposedCountryByIp() {
    try {
      const token = this.getToken();
      if (!token) {
        throw new MissingTokenError();
      }

      const { data } = await axios.post(`/Get_Exposed_Country_By_IP?Ticket=${token}`, {
        IP: '',
        lang: 'en',
      });
      if (data.ExceptionMsg !== '') {
        throw new Error(data.ExceptionMsg);
      }
      app_store.userDefaultCountry = data['My_Result'];
      return data['My_Result'];
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }
  public async getBEToken() {
    try {
      const { data } = await axios.post(`/Get_BE_Token`, {});
      if (data.ExceptionMsg !== '') {
        throw new Error(data.ExceptionMsg);
      }
      return data['My_Result'];
    } catch (error) {
      console.error(error);
      throw new Error(error);
    }
  }
  public async getExposedLanguage() {
    try {
      const token = this.getToken();
      if (!token) {
        throw new MissingTokenError();
      }
      const { data } = await axios.post(`/Get_Exposed_Language?Ticket=${token}`, { code: app_store.userPreferences.language_id, sections: ['_BE_FRONT'] });
      if (data.ExceptionMsg !== '') {
        throw new Error(data.ExceptionMsg);
      }
      let entries = this.transformArrayToObject(data.My_Result.entries);
      localizedWords.entries = { ...localizedWords.entries, ...entries };
      localizedWords.direction = data.My_Result.direction;
      return { entries, direction: data.My_Result.direction };
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  }
  public checkUserAuthState() {
    const anchor = JSON.parse(sessionStorage.getItem('anchor'));
    if (anchor) {
      if (anchor.login) {
        app_store.is_signed_in = true;
      }
      return anchor.login || null;
    }
    return null;
  }
  private transformArrayToObject(data: any) {
    let object: any = {};
    for (const d of data) {
      object[d.code] = `${d.description}`;
    }
    return object;
  }
}
