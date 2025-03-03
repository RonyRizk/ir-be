import axios from 'axios';
import app_store from '@/stores/app.store';
import localizedWords from '@/stores/localization.store';

export class CommonService {
  public async getCurrencies() {
    const { data } = await axios.post(`/Get_Exposed_Currencies`, {});
    app_store.currencies = [...data['My_Result']];
    return data['My_Result'];
  }
  public async getExposedLanguages() {
    const { data } = await axios.post(`/Get_Exposed_Languages`, {});
    app_store.languages = [...data.My_Result];
    return data['My_Result'];
  }
  public async getCountries(language: string) {
    const { data } = await axios.post(`/Get_Exposed_Countries`, {
      language,
    });
    if (data.ExceptionMsg !== '') {
      throw new Error(data.ExceptionMsg);
    }
    return data.My_Result;
  }
  public async getUserDefaultCountry(params: { id: string; aname: string; perma_link: string }) {
    try {
      const { data } = await axios.post(`/Get_Country_By_IP`, {
        IP: '',
        ...params,
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
  public async getExposedCountryByIp(params: { id: string; aname: string; perma_link: string }) {
    try {
      const { data } = await axios.post(`/Get_Exposed_Country_By_IP`, {
        IP: '',
        lang: 'en',
        ...params,
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
      const { data } = await axios.post(`/Get_Exposed_Language`, { code: app_store.userPreferences.language_id, sections: ['_BE_FRONT'] });
      if (data.ExceptionMsg !== '') {
        throw new Error(data.ExceptionMsg);
      }
      let entries = this.transformArrayToObject(data.My_Result.entries);
      localizedWords.entries = { ...localizedWords.entries, ...entries };
      localizedWords.direction = data.My_Result.direction;
      return { entries, direction: data.My_Result.direction };
    } catch (error) {
      console.error(error);
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
