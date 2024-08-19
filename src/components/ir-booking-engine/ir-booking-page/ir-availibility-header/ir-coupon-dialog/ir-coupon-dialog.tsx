import app_store from '@/stores/app.store';
import booking_store, { modifyBookingStore } from '@/stores/booking';
import localizedWords from '@/stores/localization.store';
import { cn, validateCoupon } from '@/utils/utils';
import { Component, Fragment, h, State, Event, EventEmitter } from '@stencil/core';

@Component({
  tag: 'ir-coupon-dialog',
  styleUrl: 'ir-coupon-dialog.css',
  shadow: true,
})
export class IrCouponDialog {
  @State() coupon: string;
  @State() validationMessage: { error: boolean; message: string };
  @State() isValid = false;

  @Event() resetBooking: EventEmitter<string>;

  dialogRef: HTMLIrDialogElement;

  activateCoupon() {
    this.validationMessage = null;
    if (!validateCoupon(this.coupon)) {
      return (this.validationMessage = { error: true, message: 'Invalid coupon' });
    }
    this.isValid = true;
    this.validationMessage = { error: false, message: this.coupon };
    this.resetBooking.emit('discountOnly');
    this.coupon = null;
    this.dialogRef.closeModal();
  }

  removeCoupon() {
    this.isValid = false;
    this.validationMessage = null;
    modifyBookingStore('bookingAvailabilityParams', {
      ...booking_store.bookingAvailabilityParams,
      coupon: null,
      loyalty: false,
    });
    this.resetBooking.emit('discountOnly');
  }

  render() {
    const showCoupon = app_store.property?.promotions?.some(p => p.key !== '');
    if (!showCoupon || booking_store.bookingAvailabilityParams.loyalty) {
      return null;
    }
    return (
      <Fragment>
        <div class="coupon-container">
          <ir-button
            class={cn('coupon-button', {
              'coupon-button-wide': !!booking_store.bookingAvailabilityParams.coupon,
            })}
            onButtonClick={() => this.dialogRef.openModal()}
            variants="outline"
            label={localizedWords.entries.Lcz_HaveCoupon}
            haveLeftIcon
          >
            <ir-icons slot="left-icon" name="coupon"></ir-icons>
          </ir-button>
          {!!booking_store.bookingAvailabilityParams.coupon && (
            <div class="coupon-applied">
              <p onClick={this.removeCoupon.bind(this)}>{localizedWords.entries.Lcz_DiscountApplied}</p>
              <ir-button
                aria-label="remove coupon"
                iconName="xmark"
                variants="icon"
                class="icon-remove"
                svgClassName="text-[hsl(var(--brand-600))]"
                onButtonClick={this.removeCoupon.bind(this)}
              >
                {/* <ir-icons slot="btn-icon" title="remove coupon" name="xmark" ></ir-icons> */}
              </ir-button>
            </div>
          )}
        </div>

        <ir-dialog
          ref={el => (this.dialogRef = el)}
          onOpenChange={e => {
            e.stopImmediatePropagation();
            e.stopPropagation();
            if (!e.detail) {
              this.coupon = '';
            }
          }}
        >
          <form
            onSubmit={e => {
              e.preventDefault();
              this.activateCoupon();
            }}
            class="coupon-form"
            slot="modal-body"
          >
            <h1 class="title">{localizedWords.entries.Lcz_HaveCoupon}</h1>
            <ir-input
              error={this.validationMessage?.error}
              onTextChanged={e => (this.coupon = e.detail)}
              autofocus
              inputId="booking_code"
              placeholder={localizedWords.entries.Lcz_EnterYourCouponCode}
              value={this.coupon}
              mode="default"
            ></ir-input>
            {this.validationMessage?.error && <p class="error-message">{this.validationMessage.message}</p>}
            <div class="footer-buttons">
              <ir-button
                size="md"
                onButtonClick={() => {
                  this.dialogRef.closeModal();
                  this.coupon = '';
                }}
                variants="outline"
                label={localizedWords.entries.Lcz_Cancel}
                class="button-cancel"
                type="button"
              ></ir-button>
              <ir-button type="submit" size="md" label={localizedWords.entries.Lcz_Apply} class="button-apply"></ir-button>
            </div>
          </form>
        </ir-dialog>
      </Fragment>
    );
  }
}
