export default class Stack<TData> {
  private _topNode: Node<TData> = undefined;
  private _count: number = 0;

  public count(): number {
    return this._count;
  }

  public isEmpty(): boolean {
    return this._topNode === undefined;
  }

  public push(value: TData): void {
    console.log(value);
    let node = new Node<TData>(value, this._topNode);
    this._topNode = node;
    this._count++;
  }

  public pop(): TData {
    let poppedNode = this._topNode;
    this._topNode = poppedNode.previous;
    this._count--;
    return poppedNode.data;
  }

  public peek(): TData {
    return this._topNode.data;
  }
}

class Node<T> {
  previous: Node<T>;
  data: T;

  constructor(data: T, previous: Node<T>) {
    this.previous = previous;
    this.data = data;
  }
}
