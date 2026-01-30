import { Component, Host, h, Element, Listen, State, Method, Event, EventEmitter, Prop, Watch } from '@stencil/core';
import { autoUpdate, computePosition, flip, offset, shift, arrow as floatingArrow, type Placement, type Strategy, size } from '@floating-ui/dom';
import { ClickOutside } from '@/decorators/ClickOutside';

@Component({
  tag: 'ir-popup',
  styleUrl: 'ir-popup.css',
  shadow: true,
})
export class IrPopup {
  private static zIndexSeed = 1000;
  private static idSeed = 0;
  @Element() host: HTMLElement;

  /** Distance between the anchor and popup in pixels (used when offsetDistance is not provided). */
  @Prop() distance: number;

  /** Popper placement, e.g. "bottom-start". */
  @Prop() placement: Placement = 'bottom-start';

  /** Positioning strategy ("absolute" or "fixed"). */
  @Prop() strategy: Strategy = 'absolute';

  /** Offset skid in pixels along the reference element. */
  @Prop() offsetSkid: number = 0;

  /** Offset distance in pixels away from the reference element. */
  @Prop() offsetDistance?: number;

  /** Enable or disable flip behavior. */
  @Prop() allowFlip: boolean = true;

  /** Comma-separated list of fallback placements used when flipping. */
  @Prop() fallbackPlacements: string = 'top-start,bottom-end,top-end,right,left';

  /** Padding for the preventOverflow modifier. */
  @Prop() overflowPadding: number = 8;

  /** Enable or disable the arrow element. */
  @Prop() withArrow: boolean = true;

  /** Syncs the popup's width or height to that of the anchor element. */
  @Prop() sync: 'width' | 'height' | 'both';

  // /** Optional aria-label for the dialog. */
  // @Prop() ariaLabel?: string;

  // /** Optional aria-labelledby id for the dialog. */
  // @Prop() ariaLabelledby?: string;

  // /** Optional aria-describedby id for the dialog. */
  // @Prop() ariaDescribedby?: string;

  /** Whether this dialog is modal. */
  @Prop({ reflect: true }) modal: boolean = false;

  @State() isOpen: boolean = false;

  @Event() opened: EventEmitter<void>;
  @Event() closed: EventEmitter<void>;

  private dialogRef: HTMLDialogElement;
  private anchorElement: HTMLElement;
  private contentElement: HTMLDivElement;
  private cleanupAutoUpdate?: () => void;
  private zIndex: number;
  private arrow: HTMLDivElement;
  private dialogId = `ir-popup-${IrPopup.idSeed++}`;
  popperInstance: any;

  componentDidLoad() {
    this.syncAnchorFromSlot();
  }

  disconnectedCallback() {
    this.destroyPopperInstance();
    this.removeAnchorListener();
  }

  @Listen('keydown', { target: 'window' })
  handleKeyDown(event: KeyboardEvent) {
    // Only handle Escape if this is the topmost open dialog
    if (event.key === 'Escape' && this.isOpen && this.dialogRef) {
      // Check if this dialog has the highest z-index among open dialogs
      const allDialogs = document.querySelectorAll('ir-popup');
      let isTopmost = true;
      allDialogs.forEach((popup: any) => {
        if (popup !== this.host && popup.shadowRoot) {
          const dialog = popup.shadowRoot.querySelector('dialog');
          if (dialog?.open) {
            const otherZIndex = parseInt(dialog.style.zIndex || '0', 10);
            if (otherZIndex > this.zIndex) {
              isTopmost = false;
            }
          }
        }
      });

      if (isTopmost) {
        event.stopPropagation();
        this.close();
      }
    }
  }

  private getDirectAnchorElement() {
    return Array.from(this.host.children).find(child => child.getAttribute('slot') === 'anchor') as HTMLElement;
  }

  private syncAnchorFromSlot() {
    const nextAnchor = this.getDirectAnchorElement();
    if (nextAnchor !== this.anchorElement) {
      this.removeAnchorListener();
      this.anchorElement = nextAnchor;
      if (this.anchorElement) {
        this.anchorElement.setAttribute('aria-haspopup', 'dialog');
        this.anchorElement.setAttribute('aria-expanded', String(this.isOpen));
        this.anchorElement.setAttribute('aria-controls', this.dialogId);
      }
      this.addAnchorListener();
      if (this.popperInstance) {
        this.destroyPopperInstance();
      }
      if (this.isOpen) {
        this.createPopperInstance();
      }
    }
  }

  private handleAnchorSlotChange = () => {
    // Don't stop propagation - let it bubble for nested components
    this.syncAnchorFromSlot();
  };

  private addAnchorListener() {
    if (this.anchorElement) {
      this.anchorElement.addEventListener('click', this.handleAnchorClick);
    }
  }

  private removeAnchorListener() {
    if (this.anchorElement) {
      this.anchorElement.removeEventListener('click', this.handleAnchorClick);
    }
  }

  private handleAnchorClick = (event: Event) => {
    // Stop the click from bubbling to prevent parent popups from closing
    event.stopPropagation();
    this.toggleDialog();
  };

  private toggleDialog() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
  @Method()
  async open() {
    if (!this.dialogRef) {
      return;
    }
    if (!this.zIndex) {
      IrPopup.zIndexSeed += 1;
      this.zIndex = IrPopup.zIndexSeed;
    }
    if (this.dialogRef) {
      this.dialogRef.style.zIndex = String(this.zIndex);
    }
    if (this.contentElement) {
      this.contentElement.style.zIndex = String(this.zIndex);
    }
    if (!this.dialogRef.open) {
      if (this.modal && this.dialogRef.showModal) {
        this.dialogRef.showModal();
      } else {
        this.dialogRef.show();
      }
    }
    this.isOpen = true;
    this.opened.emit();
    this.anchorElement?.setAttribute('aria-expanded', 'true');
    // Use a slight delay to ensure DOM is ready
    if (!this.modal) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          this.createPopperInstance();
          this.dialogRef.focus();
        });
      });
    }
  }
  @ClickOutside()
  @Method()
  async close() {
    if (this.dialogRef?.open) {
      this.dialogRef.close();
    }
    this.isOpen = false;
    this.closed.emit();
    this.anchorElement?.setAttribute('aria-expanded', 'false');
    this.destroyPopperInstance();
  }

  @Watch('placement')
  @Watch('strategy')
  @Watch('offsetSkid')
  @Watch('offsetDistance')
  @Watch('allowFlip')
  @Watch('fallbackPlacements')
  @Watch('overflowPadding')
  @Watch('withArrow')
  handlePopperPropsChange() {
    if (this.cleanupAutoUpdate) {
      this.updatePosition();
    }
  }

  private getFloatingOptions() {
    const effectiveDistance = this.offsetDistance ?? this.distance ?? 3;
    const fallbackPlacements = this.fallbackPlacements
      .split(',')
      .map(value => value.trim())
      .filter(Boolean) as Placement[];

    const middleware = [
      offset({
        mainAxis: effectiveDistance,
        crossAxis: this.offsetSkid || 0,
      }),
      ...(this.allowFlip ? [flip({ fallbackPlacements })] : []),
      shift({
        padding: this.overflowPadding,
        crossAxis: true,
      }),
    ];

    if (this.withArrow && this.arrow) {
      middleware.push(
        floatingArrow({
          element: this.arrow,
        }),
      );
    }
    if (this.sync) {
      middleware.push(
        size({
          apply: ({ rects }) => {
            const syncWidth = this.sync === 'width' || this.sync === 'both';
            const syncHeight = this.sync === 'height' || this.sync === 'both';
            this.contentElement.style.width = syncWidth ? `${rects.reference.width}px` : '';
            this.contentElement.style.height = syncHeight ? `${rects.reference.height}px` : '';
          },
        }),
      );
    } else {
      // Cleanup styles if we're not matching width/height
      this.contentElement.style.width = '';
      this.contentElement.style.height = '';
    }

    return {
      placement: this.placement,
      strategy: this.strategy,
      middleware,
    };
  }

  private async updatePosition() {
    if (!this.anchorElement || !this.contentElement) {
      return;
    }

    const { placement, strategy, middleware } = this.getFloatingOptions();

    const {
      x,
      y,
      placement: computedPlacement,
      middlewareData,
    } = await computePosition(this.anchorElement, this.contentElement, {
      placement,
      strategy,
      middleware,
    });

    Object.assign(this.contentElement.style, {
      left: `${x}px`,
      top: `${y}px`,
      position: strategy,
    });

    if (this.withArrow && this.arrow) {
      const arrowData = middlewareData.arrow as { x?: number; y?: number } | undefined;
      const basePlacement = computedPlacement.split('-')[0] as 'top' | 'right' | 'bottom' | 'left';
      const staticSide = {
        top: 'bottom',
        right: 'left',
        bottom: 'top',
        left: 'right',
      }[basePlacement];

      Object.assign(this.arrow.style, {
        left: arrowData?.x != null ? `${arrowData.x}px` : '',
        top: arrowData?.y != null ? `${arrowData.y}px` : '',
        right: '',
        bottom: '',
        position: 'absolute',
        [staticSide]: `calc(-1 * var(--arrow-diagonal-size))`,
      });
    }
  }

  private createPopperInstance() {
    if (!this.anchorElement || !this.contentElement) {
      return;
    }
    this.destroyPopperInstance();
    this.updatePosition();
    this.cleanupAutoUpdate = autoUpdate(this.anchorElement, this.contentElement, () => {
      this.updatePosition();
    });
  }

  private destroyPopperInstance() {
    if (this.cleanupAutoUpdate) {
      this.cleanupAutoUpdate();
      this.cleanupAutoUpdate = undefined;
    }
  }

  render() {
    return (
      <Host>
        <slot name="anchor" onSlotchange={this.handleAnchorSlotChange}></slot>
        <dialog
          id={this.dialogId}
          class="dialog"
          role="dialog"
          aria-modal={this.modal ? 'true' : 'false'}
          // aria-label={this.ariaLabel}
          // aria-labelledby={this.ariaLabelledby}
          // aria-describedby={this.ariaDescribedby}
          ref={el => (this.dialogRef = el)}
        >
          <div class="popup-content" part="content" ref={el => (this.contentElement = el)}>
            {this.withArrow && <div part="arrow" class="arrow" role="presentation"></div>}
            <div class={'body'} part="body">
              <slot></slot>
            </div>
          </div>
        </dialog>
      </Host>
    );
  }
}
