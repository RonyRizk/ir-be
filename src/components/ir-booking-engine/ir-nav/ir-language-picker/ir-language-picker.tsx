import { ICurrency, IExposedLanguages } from '@/models/commun';
import app_store, { changeLocale, onAppDataChange, updateUserPreference } from '@/stores/app.store';
import localizedWords from '@/stores/localization.store';
import { cn, matchLocale, modifyQueryParam } from '@/utils/utils';
import { Component, h, Event, EventEmitter, Prop, State } from '@stencil/core';

@Component({
  tag: 'ir-language-picker',
  styleUrl: 'ir-language-picker.css',
  shadow: true,
})
export class IrLanguagePicker {
  @Prop() currencies: ICurrency[];
  @Prop() languages: IExposedLanguages[];

  @State() selectedCurrency: ICurrency;
  @State() selectedLanguage: IExposedLanguages;

  @Event() closeDialog: EventEmitter<null>;
  @Event() resetBooking: EventEmitter<null>;
  @Event() languageChanged: EventEmitter<string>;

  private langEl: HTMLButtonElement[] = [];
  private selectedIndex: number = 0;

  async componentWillLoad() {
    this.init();
    onAppDataChange('userPreferences', newValue => {
      this.selectedLanguage = this.languages.find(l => l.code.toLowerCase() === newValue.language_id.toLowerCase());
      this.selectedCurrency = this.currencies.find(c => c.code.toLowerCase() === newValue.currency_id.toLowerCase());
      modifyQueryParam('lang', newValue.language_id.toLowerCase());
      modifyQueryParam('cur', newValue.currency_id.toLowerCase());
    });
  }

  componentDidLoad() {
    const index = this.languages.findIndex(l => l.code === this.selectedLanguage.code);
    if (index !== -1) {
      this.langEl[index]?.focus();
    }
  }

  init() {
    if (this.languages && this.currencies) {
      this.selectedLanguage = this.languages?.find(l => l.code.toLowerCase() === app_store.userPreferences.language_id.toLowerCase());
      this.selectedCurrency = this.currencies?.find(c => c.code.toLowerCase() === app_store.userPreferences.currency_id.toLowerCase());
    }
  }

  handleLanguageChange(id: string) {
    const selectedLanguage = this.languages.find(l => l.code === id);
    if (selectedLanguage) {
      this.selectedLanguage = selectedLanguage;
    }
  }

  handleCurrencyChange(e: CustomEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    const id = e.detail;
    const selectedCurrency = this.currencies.find(c => c.code === id);
    if (selectedCurrency) {
      this.selectedCurrency = selectedCurrency;
    }
  }

  handleConfirm(e: MouseEvent) {
    e.stopImmediatePropagation();
    e.stopPropagation();
    changeLocale(this.selectedLanguage.direction, matchLocale(this.selectedLanguage.code));
    updateUserPreference({
      currency_id: this.selectedCurrency.code,
      language_id: this.selectedLanguage.code,
    });
    localStorage.setItem(
      'user_preference',
      JSON.stringify({
        currency_id: this.selectedCurrency.code,
        language_id: this.selectedLanguage.code,
        direction: this.selectedLanguage.direction,
      }),
    );
    this.languageChanged.emit(this.selectedLanguage.code);
    if (app_store.currentPage === 'checkout') {
      this.resetBooking.emit(null);
    }
    this.closeDialog.emit(null);
  }

  handleKeyDown(e: KeyboardEvent) {
    const index = this.selectedIndex;
    const lastIndex = this.languages.length - 1;
    let itemsPerRow = 4;
    if (window.innerWidth < 640) {
      itemsPerRow = 3;
    }
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      const nextIndex = index === lastIndex ? 0 : index + 1;
      this.selectedIndex = nextIndex;
      this.langEl[nextIndex].focus();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      const prevIndex = index === 0 ? lastIndex : index - 1;
      this.selectedIndex = prevIndex;
      this.langEl[prevIndex].focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = index < itemsPerRow ? lastIndex - (itemsPerRow - 1 - index) : index - itemsPerRow;
      if (prevIndex >= 0 && prevIndex <= lastIndex) {
        this.selectedIndex = prevIndex;
        this.langEl[prevIndex].focus();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = index + itemsPerRow > lastIndex ? (index + itemsPerRow) % itemsPerRow : index + itemsPerRow;
      if (nextIndex >= 0 && nextIndex <= lastIndex) {
        this.selectedIndex = nextIndex;
        this.langEl[nextIndex].focus();
      }
    }
  }

  render() {
    return (
      <div class="picker-container">
        <p class="picker-title">{localizedWords.entries.Lcz_DisplaSettings}</p>
        <div role="radiogroup" aria-required="false" aria-label="booking engine language" onKeyDown={e => this.handleKeyDown(e)} class="language-grid" tabIndex={0}>
          {this.languages.map((language, i) => (
            <button
              ref={el => (this.langEl[i] = el)}
              type="button"
              role="radio"
              tabIndex={0}
              value={language.code}
              aria-labelledby={language.description}
              aria-checked={this.selectedLanguage?.code === language.code ? 'true' : 'false'}
              onClick={() => this.handleLanguageChange(language.code)}
              class={cn('language-button', {
                'language-button-selected': this.selectedLanguage?.code === language.code,
              })}
            >
              <img loading="lazy" src={language['flag']} alt={language.code} class="language-flag"></img>
              <span>{language.description}</span>
              <input type="radio" aria-hidden="true" tabIndex={-1} checked={this.selectedLanguage?.code === language.code} value={language.code} class="hidden-radio"></input>
            </button>
          ))}
        </div>

        <ir-select
          variant="double-line"
          value={this.selectedCurrency?.code}
          onValueChange={this.handleCurrencyChange.bind(this)}
          label={localizedWords.entries.Lcz_Currency}
          select_id="currency_selector"
          data={this.currencies.map(currency => ({
            id: currency.code,
            value: `${currency.code} ${(0).toLocaleString('en-US', { style: 'currency', currency: currency.code, minimumFractionDigits: 0, maximumFractionDigits: 0 }).replace(/\d/g, '').trim().replace(currency.code, '')}`,
          }))}
        ></ir-select>
        <div class="actions-container">
          <ir-button size="md" label={localizedWords.entries['Lcz_Confirm']} class="confirm-button" onClick={this.handleConfirm.bind(this)}></ir-button>
          <ir-button onButtonClick={() => this.closeDialog.emit(null)} size="md" label={localizedWords.entries.Lcz_Cancel} variants="outline" class="cancel-button"></ir-button>
        </div>
      </div>
    );
  }
}
