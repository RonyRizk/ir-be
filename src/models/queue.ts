export class Queue<T> {
  private items: Record<number, T> = {};
  private rear = 0;
  private front = 0;

  enqueue(element: T): void {
    this.items[this.rear] = element;
    this.rear++;
  }

  dequeue(): T | undefined {
    if (this.isEmpty()) {
      return undefined;
    }
    const item = this.items[this.front];
    delete this.items[this.front];
    this.front++;
    if (this.isEmpty()) {
      this.rear = 0;
      this.front = 0;
    }
    return item;
  }

  isEmpty(): boolean {
    return this.rear === this.front;
  }

  peek(): T | undefined {
    return this.items[this.front];
  }

  size(): number {
    return this.rear - this.front;
  }

  print(): void {
    console.log(Object.values(this.items).slice(this.front, this.rear));
  }
}
