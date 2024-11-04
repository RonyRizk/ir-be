import { Component, h, State, Element, Fragment, Event, EventEmitter, Prop, Watch } from '@stencil/core';
import { createPopper } from '@popperjs/core';
import localization_store from '@/stores/app.store';
import { CommonService } from '@/services/api/common.service';
import app_store from '@/stores/app.store';
import { ICountry } from '@/models/common';
import { updateUserFormData } from '@/stores/checkout.store';
import localizedWords from '@/stores/localization.store';
import phone_input_store from './phone.store';

@Component({
  tag: 'ir-phone-input',
  styleUrl: 'ir-phone-input.css',
  shadow: true,
})
export class IrPhoneInput {
  @Prop() error: boolean;
  @Prop() mobile_number: string;
  @Prop() country_phone_prefix: string;
  @Prop() country_code: number;
  @Prop() mode: 'prefix_only' | 'country_code_and_prefix' = 'country_code_and_prefix';

  @State() isVisible: boolean = false;
  @State() currentHighlightedIndex: number = -1;
  @State() selectedItem: ICountry;
  @State() filteredCountries: ICountry[] = [];
  @State() inputValue: string = '';

  @Element() el: HTMLElement;

  private popoverInstance = null;
  private triggerElement: HTMLElement;
  private contentElement: HTMLElement;
  private debounceTimeout: NodeJS.Timeout;

  private commonService = new CommonService();

  @Event() textChange: EventEmitter<{ phone_prefix: string; mobile: string }>;
  @Event() phoneInputBlur: EventEmitter<FocusEvent>;
  @Event() phoneInputFocus: EventEmitter<FocusEvent>;

  private user_country;
  searchInput: HTMLInputElement;
  phoneInput: HTMLInputElement;

  async componentWillLoad() {
    await this.initializeCountries();
    this.inputValue = this.mobile_number;
  }
  componentDidLoad() {
    this.initializePopover();
  }
  async initializeCountries() {
    if (phone_input_store.countries.length === 0) {
      const requests = [this.commonService.getCountries(app_store.userPreferences.language_id)];
      if (!this.country_code) {
        requests.push(this.setUpUserDefaultCountry());
      }
      const [countries] = await Promise.all(requests);
      phone_input_store.countries = countries;
    }
    if (this.user_country) {
      this.selectCountryByProperty('id', this.user_country.COUNTRY_ID);
    } else if (this.country_code && this.mode === 'country_code_and_prefix') {
      this.selectCountryByProperty('id', this.country_code.toString());
    } else if (this.mode === 'prefix_only' && this.country_phone_prefix) {
      this.selectCountryByProperty('phone_prefix', this.country_phone_prefix.toString());
    }
    this.filteredCountries = phone_input_store.countries;
  }

  @Watch('country_code')
  handleCountryCodeChange(newValue: number, oldValue: number) {
    if (newValue !== oldValue && this.mode === 'country_code_and_prefix') {
      this.selectCountryByProperty('id', this.country_code.toString());
    }
  }
  @Watch('country_phone_prefix')
  handleCountryPhonePrefixChange(newValue: number, oldValue: number) {
    if (newValue !== oldValue && this.mode === 'prefix_only') {
      this.selectCountryByProperty('phone_prefix', this.country_phone_prefix.toString());
    }
  }
  @Watch('mobile_number')
  handleMobileNumberChange(newValue: string, oldValue: string) {
    if (newValue !== oldValue && newValue !== this.inputValue) {
      this.inputValue = newValue;
    }
  }

  selectCountryByProperty(property, value) {
    const selectedCountry = phone_input_store.countries.find(c => c[property].toString() === value.toString());
    if (selectedCountry) {
      if (this.mode === 'country_code_and_prefix') {
        updateUserFormData('country_id', selectedCountry.id);
      }
      updateUserFormData('country_phone_prefix', selectedCountry.phone_prefix);
      this.selectedItem = selectedCountry;
      if (!this.mobile_number) {
        this.textChange.emit({
          phone_prefix: selectedCountry.phone_prefix.toString(),
          mobile: '',
        });
      }
    }
  }

  async setUpUserDefaultCountry() {
    this.user_country = await this.commonService.getUserDefaultCountry({
      id: app_store.app_data?.property_id?.toString(),
      aname: app_store.app_data?.aName,
      perma_link: app_store.app_data?.perma_link,
    });
  }

  initializePopover() {
    if (this.triggerElement && this.contentElement) {
      this.popoverInstance = createPopper(this.triggerElement, this.contentElement, {
        placement: localization_store.dir === 'LTR' ? 'auto-start' : 'auto-end',
        modifiers: [
          {
            name: 'offset',
            options: {
              offset: [0, 2],
            },
          },
        ],
      });
    }
  }
  adjustPopoverPlacement() {
    requestAnimationFrame(() => {
      const rect = this.contentElement.getBoundingClientRect();
      if (rect.bottom > window.innerHeight) {
        this.popoverInstance.setOptions({
          placement: 'top-end',
        });
      } else if (rect.top < 0) {
        this.popoverInstance.setOptions({
          placement: 'bottom-end',
        });
      }
      this.popoverInstance.update();
    });
  }
  handleOutsideClick = (event: MouseEvent) => {
    const outsideClick = typeof event.composedPath === 'function' && !event.composedPath().includes(this.el);
    if (outsideClick && this.isVisible) {
      this.toggleVisibility();
    }
  };
  handleKeyboardPress = (e: KeyboardEvent) => {
    if (!this.isVisible) {
      return;
    }
    if (e.key === 'Escape') {
      this.toggleVisibility();
    }
    return;
  };
  async toggleVisibility() {
    this.isVisible = !this.isVisible;
    this.filteredCountries = phone_input_store.countries;
    if (this.isVisible && this.popoverInstance) {
      setTimeout(() => this.searchInput.focus(), 20);
      this.adjustPopoverPlacement();
      const currentDir = localization_store.dir.toLowerCase() || 'ltr';
      if (
        (this.popoverInstance.state.options.placement === 'bottom-start' && currentDir === 'rtl') ||
        (this.popoverInstance.state.options.placement === 'bottom-end' && currentDir === 'ltr')
      ) {
        let newPlacement = this.popoverInstance.state.options.placement;
        if (currentDir === 'rtl') {
          newPlacement = newPlacement.replace('bottom-start', 'bottom-end');
        } else {
          newPlacement = newPlacement.replace('bottom-end', 'bottom-start');
        }
        this.popoverInstance
          .setOptions({
            placement: newPlacement,
          })
          .then(() => {
            this.popoverInstance.update();
          });
      } else {
        this.popoverInstance.update();
      }
    }
    if (this.isVisible) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('click', this.handleOutsideClick, true);
      document.addEventListener('keydown', this.handleKeyboardPress, true);
    } else {
      document.body.style.overflow = 'visible';
      document.removeEventListener('click', this.handleOutsideClick, true);
      document.removeEventListener('keydown', this.handleKeyboardPress, true);
    }
  }
  disconnectedCallback() {
    document.removeEventListener('click', this.handleOutsideClick, true);
    document.removeEventListener('keydown', this.handleKeyboardPress, true);
    if (this.popoverInstance) {
      this.popoverInstance.destroy();
    }
  }
  synchroniseSuggestionsBox() {
    const item = this.el.shadowRoot?.querySelector(`li:nth-of-type(${this.currentHighlightedIndex + 1})`) as HTMLLIElement;
    item?.scrollIntoView({ block: 'center' });
  }
  handleAutoCompleteKeyDown(e: KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.currentHighlightedIndex = (this.currentHighlightedIndex + 1 + this.filteredCountries.length) % this.filteredCountries.length;
      this.synchroniseSuggestionsBox();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.currentHighlightedIndex = (this.currentHighlightedIndex - 1 + this.filteredCountries.length) % this.filteredCountries.length;
      this.synchroniseSuggestionsBox();
    } else if (e.key === 'Enter') {
      this.selectItem(this.currentHighlightedIndex);
    }
  }
  selectItem(index: number) {
    this.currentHighlightedIndex = index;
    this.selectedItem = this.filteredCountries[index];
    this.filteredCountries = phone_input_store.countries;
    this.phoneInput.focus();
    this.toggleVisibility();
    this.textChange.emit({
      phone_prefix: this.selectedItem.phone_prefix.toString(),
      mobile: this.mobile_number,
    });
  }
  filterData(str: string) {
    if (str === '') {
      return (this.filteredCountries = [...phone_input_store.countries]);
    }
    this.filteredCountries = [...phone_input_store.countries.filter(d => d.name.toLowerCase().startsWith(str.trim()))];
  }
  handleFilterInputChange(e: InputEvent) {
    e.stopPropagation();
    const value = (e.target as HTMLInputElement).value;
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
    this.debounceTimeout = setTimeout(() => {
      this.filterData(value);
    }, 300);
  }
  handleInputChange(e: InputEvent) {
    let inputElement = e.target as HTMLInputElement;
    let inputValue = inputElement.value;
    inputValue = inputValue.replace(/[^+\d]+/g, '');
    inputElement.value = inputValue;
    this.inputValue = inputValue;
    this.textChange.emit({ phone_prefix: this.selectedItem?.id.toString(), mobile: this.inputValue });
  }
  render() {
    return (
      <div ref={el => (this.triggerElement = el)} class="phone-input-container">
        <div class={`input-trigger ${this.error ? 'error' : ''}`}>
          <div class="input-section">
            <label htmlFor="country_picker">{localizedWords.entries.Lcz_Country}</label>
            <div
              id="country_picker"
              onClick={() => {
                this.toggleVisibility();
              }}
              class="input-subtrigger"
            >
              {this.selectedItem ? (
                <Fragment>
                  <img loading="lazy" src={this.selectedItem?.flag} alt={this.selectedItem?.name} class="flag-icon" />
                  <span>{this.selectedItem?.phone_prefix}</span>
                </Fragment>
              ) : (
                <span>Select</span>
              )}

              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819C5.10753 6.24392 5.39245 6.24392 5.56819 6.06819L7.49999 4.13638L9.43179 6.06819C9.60753 6.24392 9.89245 6.24392 10.0682 6.06819C10.2439 5.89245 10.2439 5.60753 10.0682 5.43179L7.81819 3.18179C7.73379 3.0974 7.61933 3.04999 7.49999 3.04999C7.38064 3.04999 7.26618 3.0974 7.18179 3.18179L4.93179 5.43179ZM10.0682 9.56819C10.2439 9.39245 10.2439 9.10753 10.0682 8.93179C9.89245 8.75606 9.60753 8.75606 9.43179 8.93179L7.49999 10.8636L5.56819 8.93179C5.39245 8.75606 5.10753 8.75606 4.93179 8.93179C4.75605 9.10753 4.75605 9.39245 4.93179 9.56819L7.18179 11.8182C7.35753 11.9939 7.64245 11.9939 7.81819 11.8182L10.0682 9.56819Z"
                  fill="currentColor"
                  fill-rule="evenodd"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </div>
          </div>
          <div class="input-section">
            <label htmlFor="phone_number">{localizedWords.entries.Lcz_MobileNumber}</label>
            <input
              type="phone"
              ref={el => (this.phoneInput = el)}
              onBlur={e => this.phoneInputBlur.emit(e)}
              onFocus={e => this.phoneInputFocus.emit(e)}
              onInput={e => this.handleInputChange(e)}
              id="phone_number"
              value={this.inputValue}
              class="input-subtrigger"
            />
          </div>
        </div>

        <div ref={el => (this.contentElement = el)} class="dropdown-container">
          {this.isVisible && (
            <ul class="dropdown-content">
              <li class="filter-container">
                <ir-icons name="search" svgClassName="filter-icon"></ir-icons>
                <input
                  placeholder={localizedWords.entries.Lcz_Search}
                  ref={el => (this.searchInput = el)}
                  type="text"
                  onInput={this.handleFilterInputChange.bind(this)}
                  class="filter-input"
                  onKeyDown={this.handleAutoCompleteKeyDown.bind(this)}
                />
              </li>
              {this.filteredCountries.map((value, index) => (
                <li
                  data-state={this.currentHighlightedIndex === index ? 'checked' : 'unchecked'}
                  data-highlighted={this.currentHighlightedIndex === index ? 'true' : 'false'}
                  class="combobox-item"
                  key={index}
                  role="option"
                  onClick={() => {
                    this.selectItem(index);
                  }}
                  onMouseOver={() => {
                    this.currentHighlightedIndex = index;
                  }}
                >
                  <div class="combobox-item-content">
                    <img loading="lazy" src={value.flag} alt={value.name} class="flag-icon" />
                    <span>{value.name}</span>
                    <span>({value.phone_prefix})</span>
                  </div>
                  {this.selectedItem && this.selectedItem.id === value.id && <ir-icons name="check" svgClassName="check-icon"></ir-icons>}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }
}
