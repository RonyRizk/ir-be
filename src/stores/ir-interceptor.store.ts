import { createStore } from '@stencil/store';

export type TIrInterceptorStatus = 'pending' | 'done' | null;

export interface IRequestStatus {
  [key: string]: TIrInterceptorStatus;
}

const initialState: IRequestStatus = {};

export const { state: interceptor_requests, onChange: onInterceptorStateChange } = createStore<IRequestStatus>(initialState);
export function isRequestPending(url: string): boolean {
  return interceptor_requests[url] === 'pending';
}

export default interceptor_requests;
