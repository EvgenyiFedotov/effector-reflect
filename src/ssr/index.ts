import { useStore, useEvent } from 'effector-react/ssr';
import { createReflectCreator, reflectCreator } from '../core';

export const reflect = reflectCreator({ useStore, useEvent });
export const createReflect = createReflectCreator({ useStore, useEvent });
