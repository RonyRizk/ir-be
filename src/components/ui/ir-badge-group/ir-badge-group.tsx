import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';

@Component({
  tag: 'ir-badge-group',
  styleUrl: 'ir-badge-group.css',
  shadow: true,
})
export class IrBadgeGroup {
  @Prop() badge = '';
  @Prop() message = '';
  @Prop() variant: 'error' | 'succes' | 'primary' | 'secondary' = 'primary';
  @Prop() clickable: boolean;
  @Prop() messagePosition: 'default' | 'center' = 'default';

  @Event() badgeClick: EventEmitter<MouseEvent>;

  render() {
    return (
      <div
        class={`badge-group ${this.variant} position-${this.messagePosition} ${this.clickable ? 'clickable' : ''}`}
        onClick={e => {
          if (this.clickable) {
            this.badgeClick.emit(e);
          }
        }}
      >
        <p class="badge">{this.badge}</p>
        <p class="message">{this.message}</p>
        {this.clickable && (
          <button
            onClick={e => {
              if (this.clickable) {
                this.badgeClick.emit(e);
              }
            }}
          >
            <ir-icons name="arrow_right"></ir-icons>
          </button>
        )}
      </div>
    );
  }
}
