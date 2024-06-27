export class Countdown {
  private seconds: number;
  private isActive: boolean;
  private intervalRef: number | null = null;
  private onFinish: () => void;
  private format: 'days' | 'hours' | 'minutes';
  private subscribers: ((formattedTime: string) => void)[] = [];

  constructor(initialSeconds: number, onFinish?: () => void, autoStart: boolean = true, format: 'days' | 'hours' | 'minutes' = 'minutes') {
    this.seconds = initialSeconds;
    this.isActive = autoStart;
    this.onFinish = onFinish || (() => {});
    this.format = format;

    if (this.isActive) {
      this.start();
    }
  }

  private clearInterval() {
    if (this.intervalRef !== null) {
      clearInterval(this.intervalRef);
      this.intervalRef = null;
    }
  }

  start() {
    this.clearInterval();
    this.isActive = true;
    this.intervalRef = window.setInterval(() => {
      if (this.seconds > 0) {
        this.seconds -= 1;
        this.notifySubscribers();
      } else {
        this.clearInterval();
        this.isActive = false;
        this.notifySubscribers();
        this.onFinish();
      }
    }, 1000);
  }

  pause() {
    this.isActive = false;
    this.clearInterval();
  }

  reset(newSeconds: number = this.seconds) {
    this.pause();
    this.seconds = newSeconds;
    this.isActive = false;
    this.notifySubscribers();
  }

  private notifySubscribers() {
    const formattedTime = this.getFormattedTime();
    this.subscribers.forEach(callback => callback(formattedTime));
  }

  subscribe(callback: (formattedTime: string) => void) {
    this.subscribers.push(callback);
  }

  unsubscribe(callback: (formattedTime: string) => void) {
    this.subscribers = this.subscribers.filter(sub => sub !== callback);
  }

  getFormattedTime() {
    const d = Math.floor(this.seconds / (3600 * 24));
    const h = Math.floor((this.seconds % (3600 * 24)) / 3600);
    const m = Math.floor((this.seconds % 3600) / 60);
    const s = this.seconds % 60;

    switch (this.format) {
      case 'days':
        return `${String(d).padStart(2, '0')}:${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      case 'hours':
        return `${String(h + d * 24).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
      case 'minutes':
      default:
        return `${String(m + h * 60 + d * 1440).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    }
  }

  getSeconds() {
    return this.seconds;
  }

  isRunning() {
    return this.isActive;
  }
}
export function getDateDifference(date1: Date, date2: Date) {
  const diff = date2.getTime() - date1.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}
export function daysToSeconds(days: number) {
  return days * 86400;
}
