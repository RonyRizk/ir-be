import app_store from '@/stores/app.store';
import { checkout_store } from '@/stores/checkout.store';
import { Component, Host, h } from '@stencil/core';

@Component({
  tag: 'ir-user-avatar',
  styleUrl: 'ir-user-avatar.css',
  shadow: true,
})
export class IrUserAvatar {
  renderAvatar() {
    const { firstName, lastName } = checkout_store.userFormData;
    if (lastName && firstName) {
      return <p>{firstName[0].toUpperCase() + lastName[0].toUpperCase()}</p>;
    } else if (firstName) {
      return <p>{firstName[0].toUpperCase() + firstName[1].toUpperCase()}</p>;
    } else {
      return <ir-icons name="user" svgClassName="size-4"></ir-icons>;
    }
  }
  render() {
    if (!app_store.is_signed_in) {
      return null;
    }
    return (
      <Host>
        <div class="avatar">{this.renderAvatar()}</div>
      </Host>
    );
  }
}
