import { ReactNode } from 'react';
import { HOC } from '../common/hoc';

export type BaseProps = HOC & {
  RBAC?: never;
  showIf?: never;
};

