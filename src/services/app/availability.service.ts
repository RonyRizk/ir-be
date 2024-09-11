import { RoomType } from '@/models/property';
import { Queue } from '@/models/queue';
import booking_store from '@/stores/booking';
import { io, Socket } from 'socket.io-client';
import { z } from 'zod';

interface IPAYLOAD {
  ROOM_CATEGORY_ID: number;
  ROOM_TYPE_ID: number;
  ADULTS_NBR: number;
  CHILD_NBR: number;
  ADULT_CHILD_OFFERING: string;
  TOTAL_BEFORE_DISCOUNT: string;
  ALLOT_RATE_V: number;
  ALLOT_RATE_V_GROSS: number;
  DISCOUNTED_ALLOTMENT_RATE: string;
  DISCOUNT: number;
  NIGHTS_NBR: number;
  AMOUNT_PER_NIGHT: string;
  AMOUNT_PER_NIGHT_VAL: number;
  CURRENCY_SYMBOL: string;
  IS_LMD: boolean;
  IS_CALCULATED: boolean;
  IS_MLS_VIOLATED: boolean;
  MLS_ALERT: string | null;
  MLS_ALERT_VALUE: string | null;
}

class SocketManager {
  private static instance: SocketManager;
  public socket: Socket;
  public isConnected: boolean = false;

  private constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    this.socket = io('https://realtime.igloorooms.com/', {
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    this.socket.on('connect', () => {
      console.log('Connected to the socket server');
      this.isConnected = true;
    });

    this.socket.on('connect_error', error => {
      console.error('Connection error:', error);
    });

    this.socket.on('disconnect', reason => {
      console.log('Disconnected:', reason);
      this.isConnected = false;
      // this.reconnect();
    });
  }

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  public reconnect() {
    console.log('Attempting to reconnect...');
    this.initializeSocket();
  }

  public close() {
    this.socket.close();
  }
}

export default SocketManager;

export class AvailabiltyService {
  private socketManager: SocketManager;
  private queue = new Queue<string>();
  private intervalId: NodeJS.Timeout | null = null;
  private readonly PROCESSING_INTERVAL = 400;
  private subscribers: ((b: boolean) => void)[] = [];
  private roomTypes: RoomType[] = [];
  // private variationSorter = new VariationSorter();
  constructor() {
    this.socketManager = SocketManager.getInstance();
  }

  public subscribe(callback: (b: boolean) => void) {
    this.subscribers.push(callback);
  }

  public unsubscribe(callback: (b: boolean) => void) {
    this.subscribers = this.subscribers.filter(sub => sub !== callback);
  }
  public disconnectSocket() {
    this.socketManager.socket.on('disconnect', reason => {
      console.log('Disconnected:', reason);
      if (this.intervalId) {
        clearInterval(this.intervalId);
      }
    });
    this.socketManager.socket.close();
  }
  public initSocket(id?: string, view: boolean = false): void {
    if (!this.socketManager.isConnected) {
      this.socketManager.reconnect();
    }
    if (!view) {
      this.resetVariations();
    }

    this.socketManager.socket.on('MSG', (msg: string) => {
      try {
        const message_obj = JSON.parse(msg);
        if (message_obj && message_obj.KEY && message_obj.KEY.toString() === id) {
          if (view) {
            return console.log(JSON.parse(message_obj.PAYLOAD));
          }
          // console.log(currentTime - this.duration);

          this.notifySubscribers();
          this.queue.enqueue(message_obj.PAYLOAD);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    });
    this.startProcessingQueue();
  }

  private startProcessingQueue(): void {
    this.intervalId = setInterval(() => this.processQueue(), this.PROCESSING_INTERVAL);
  }

  private async processQueue(): Promise<void> {
    const payloads: IPAYLOAD[] = [];

    while (!this.queue.isEmpty()) {
      const payload = this.queue.dequeue();
      if (payload) {
        payloads.push(JSON.parse(payload));
      }
    }

    if (payloads.length > 0) {
      await this.processPayloads(payloads);
    }
  }
  private notifySubscribers() {
    this.subscribers.forEach(callback => callback(false));
  }
  private resetVariations() {
    booking_store.resetBooking = true;
    this.roomTypes = [...booking_store.roomTypes];
    this.roomTypes = this.roomTypes.map(rt => {
      return {
        ...rt,
        rateplans: rt.rateplans.map(rp => ({
          ...rp,
          variations: [],
        })),
      };
    });
  }
  private validateNumberString(input: string): number {
    const schema = z.string().refine(
      val => {
        const numberString = val.replace(/,/g, '');
        return !isNaN(Number(numberString));
      },
      {
        message: 'Invalid number format',
      },
    );
    const result = schema.safeParse(input);
    if (!result.success) {
      throw new Error(`${input} is an invalid number format`);
    }
    return Number(result.data.replace(/,/g, ''));
  }

  private async processPayloads(payloads: IPAYLOAD[]): Promise<void> {
    try {
      console.log('payload', payloads);
      if (!booking_store.enableBooking) {
        booking_store.enableBooking = true;
      }

      payloads.forEach(payload => {
        if (payload.ROOM_CATEGORY_ID === 2345) {
          console.log(payload);
        }
        const selectedRoomTypeIndex = this.roomTypes.findIndex(rt => rt.id === payload.ROOM_CATEGORY_ID);
        if (selectedRoomTypeIndex === -1) {
          console.error('Invalid room type');
          return;
        }
        let roomType = this.roomTypes[selectedRoomTypeIndex];
        const selectedRatePlanIndex = roomType.rateplans.findIndex(rp => rp.id === payload.ROOM_TYPE_ID);
        if (selectedRatePlanIndex === -1) {
          // console.error('Invalid rate plan');
          return;
        }
        let rateplan = roomType.rateplans[selectedRatePlanIndex];
        let oldVariation = rateplan.variations || [];
        console.log(payload);
        const variation = {
          adult_child_offering: payload.ADULT_CHILD_OFFERING,
          adult_nbr: Number(payload.ADULTS_NBR ?? 0),
          amount: (() => {
            const amount = this.validateNumberString((payload.ALLOT_RATE_V ?? 0)?.toString()) ?? 0;
            return amount === 0 ? null : amount;
          })(),
          amount_gross: (() => {
            const amount = this.validateNumberString((payload.ALLOT_RATE_V_GROSS ?? 0)?.toString()) ?? 0;
            return amount === 0 ? null : amount;
          })(),
          child_nbr: Number(payload.CHILD_NBR ?? 0),
          amount_per_night: this.validateNumberString((payload.AMOUNT_PER_NIGHT_VAL ?? 0)?.toString() ?? '').toString() ?? '',
          discount_pct: this.validateNumberString((payload.DISCOUNT ?? 0)?.toString()) ?? 0,
          is_lmd: payload.IS_LMD,
          nights_nbr: this.validateNumberString((payload.NIGHTS_NBR ?? 0)?.toString()) ?? 0,
          total_before_discount: this.validateNumberString((payload.TOTAL_BEFORE_DISCOUNT ?? 0)?.toString()) ?? 0,
          is_calculated: payload.IS_CALCULATED,
          MLS_ALERT: payload.MLS_ALERT,
          IS_MLS_VIOLATED: payload.IS_MLS_VIOLATED,
          MLS_ALERT_VALUE: payload.MLS_ALERT_VALUE,
        };
        const variationIndex = oldVariation.findIndex(v => v.adult_child_offering === payload.ADULT_CHILD_OFFERING);

        if (variationIndex === -1) {
          oldVariation.push(variation);
        } else {
          oldVariation[variationIndex] = variation;
        }

        oldVariation = oldVariation.filter(
          v => Number(v.adult_nbr) <= Number(booking_store.bookingAvailabilityParams.adult_nbr) && Number(v.child_nbr) <= Number(booking_store.bookingAvailabilityParams.child_nbr),
        );

        rateplan = { ...rateplan, variations: oldVariation };
        roomType.rateplans[selectedRatePlanIndex] = rateplan;

        this.roomTypes[selectedRoomTypeIndex] = { ...roomType, inventory: 1 };
      });
      booking_store.resetBooking = true;
      booking_store.roomTypes = [...this.roomTypes];
    } catch (error) {
      console.error('Error processing payloads:', error);
    }
  }
}
