import { cn } from '@/utils/utils';
import { Component, Event, EventEmitter, h, Prop } from '@stencil/core';
import { v4 } from 'uuid';

@Component({
  tag: 'ir-select',
  styleUrl: 'ir-select.css',
  scoped: true,
})
export class IrSelect {
  @Prop() label: string;
  @Prop() icon: boolean;

  @Prop() value: string | number;
  @Prop() data: { id: string | number; value: string; disabled?: boolean; html?: boolean }[];

  @Prop() select_id = v4();
  @Prop() variant: 'double-line' | 'default' = 'default';

  @Prop() customStyles: string = '';
  @Prop() containerStyle: string = '';

  @Event() valueChange: EventEmitter<string | number>;

  render() {
    return (
      <div class={`selected-trigger ${this.containerStyle}`}>
        {this.variant === 'double-line' && (
          <label
            htmlFor={this.select_id}
            class={cn('select-label pointer-events-none absolute  px-[0.3rem] pt-1 text-xs text-[#667085]', {
              'ps-9': this.icon,
            })}
          >
            {this.label}
          </label>
        )}
        {this.icon && (
          <div class="pointer-events-none absolute inset-y-0 start-2 flex  items-center">
            <slot name="icon"></slot>
          </div>
        )}
        <select
          onInput={e => this.valueChange.emit((e.target as HTMLSelectElement).value)}
          id={this.select_id}
          data-stid={this.select_id}
          class={`select-el ${this.variant} ${this.customStyles} ${this.icon ? 'icon' : ''}`}
        >
          {this.data?.map(d => {
            if (d.html) {
              return <option innerHTML={d.value} value={d.id} disabled={d.disabled} selected={d.id === this.value}></option>;
            }
            return (
              <option value={d.id} disabled={d.disabled} selected={d.id === this.value}>
                {d.value}
              </option>
            );
          })}
        </select>
        <span data-variant={this.variant} class="pointer-events-none absolute inset-y-0 end-1 flex  items-center">
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819C5.10753 6.24392 5.39245 6.24392 5.56819 6.06819L7.49999 4.13638L9.43179 6.06819C9.60753 6.24392 9.89245 6.24392 10.0682 6.06819C10.2439 5.89245 10.2439 5.60753 10.0682 5.43179L7.81819 3.18179C7.73379 3.0974 7.61933 3.04999 7.49999 3.04999C7.38064 3.04999 7.26618 3.0974 7.18179 3.18179L4.93179 5.43179ZM10.0682 9.56819C10.2439 9.39245 10.2439 9.10753 10.0682 8.93179C9.89245 8.75606 9.60753 8.75606 9.43179 8.93179L7.49999 10.8636L5.56819 8.93179C5.39245 8.75606 5.10753 8.75606 4.93179 8.93179C4.75605 9.10753 4.75605 9.39245 4.93179 9.56819L7.18179 11.8182C7.35753 11.9939 7.64245 11.9939 7.81819 11.8182L10.0682 9.56819Z"
              fill="currentColor"
              fill-rule="evenodd"
              clip-rule="evenodd"
            ></path>
          </svg>
        </span>
        <div class="sr-only" aria-hidden="true">
          {this.label}
        </div>
      </div>
    );
  }
}
