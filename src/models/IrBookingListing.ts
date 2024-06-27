import { Identifier } from './common';

export interface IExposedBookingsCriteria {
  channels: ICriteriaChannel[];
  settlement_methods: ISettlementMethods[];
  statuses: ICriteriaStatuses[];
  types: ICriteriaTypes[];
}
export interface ICriteriaChannel {
  is_direct: boolean;
  name: string;
}
export interface ISettlementMethods extends Identifier {}
export interface ICriteriaStatuses extends Identifier {}
export interface ICriteriaTypes {
  id: number;
  name: string;
}
