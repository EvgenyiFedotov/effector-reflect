import React, { FC, InputHTMLAttributes, ChangeEvent } from 'react';
import {
  createStore,
  createEvent,
  restore,
  createDomain,
  fork,
  allSettled,
} from 'effector';
import { Provider } from 'effector-react/ssr';

import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { reflect } from './index';

// Example1 (InputCustom)
const InputCustom: FC<{
  value: string | number | string[];
  onChange(value: string): void;
  testId: string;
  placeholder?: string;
}> = (props) => {
  return (
    <input
      data-testid={props.testId}
      placeholder={props.placeholder}
      value={props.value}
      onChange={(event) => props.onChange(event.currentTarget.value)}
    />
  );
};

test('InputCustom', async () => {
  const change = createEvent<string>();
  const $name = restore(change, '');

  const Name = reflect({
    view: InputCustom,
    bind: { value: $name, onChange: change },
  });

  const container = render(<Name testId="name" />);

  expect($name.getState()).toBe('');
  await userEvent.type(container.getByTestId('name'), 'Bob');
  expect($name.getState()).toBe('Bob');

  const inputName = container.container.firstChild as HTMLInputElement;
  expect(inputName.value).toBe('Bob');
});

test('InputCustom [replace value]', async () => {
  const change = createEvent<string>();
  const $name = createStore<string>('');

  $name.on(change, (_, next) => next);

  const Name = reflect({
    view: InputCustom,
    bind: { name: $name, onChange: change },
  });

  const container = render(<Name testId="name" value="Alise" />);

  expect($name.getState()).toBe('');
  await userEvent.type(container.getByTestId('name'), 'Bob');
  expect($name.getState()).toBe('Aliseb');

  const inputName = container.container.firstChild as HTMLInputElement;
  expect(inputName.value).toBe('Alise');
});

// Example 2 (InputBase)
const InputBase: FC<InputHTMLAttributes<HTMLInputElement>> = (props) => {
  return <input {...props} />;
};

test('InputBase', async () => {
  const changeName = createEvent<string>();
  const $name = restore(changeName, '');

  const inputChanged = (event: ChangeEvent<HTMLInputElement>) => {
    return event.currentTarget.value;
  };

  const Name = reflect({
    view: InputBase,
    bind: {
      value: $name,
      onChange: changeName.prepend(inputChanged),
    },
  });

  const changeAge = createEvent<number>();
  const $age = restore(changeAge, 0);
  const Age = reflect({
    view: InputBase,
    bind: {
      value: $age,
      onChange: changeAge.prepend(parseInt).prepend(inputChanged),
    },
  });

  const container = render(
    <>
      <Name data-testid="name" />
      <Age data-testid="age" />
    </>,
  );

  expect($name.getState()).toBe('');
  await userEvent.type(container.getByTestId('name'), 'Bob');
  expect($name.getState()).toBe('Bob');

  expect($age.getState()).toBe(0);
  await userEvent.type(container.getByTestId('age'), '25');
  expect($age.getState()).toBe(25);

  const inputName = container.getByTestId('name') as HTMLInputElement;
  expect(inputName.value).toBe('Bob');

  const inputAge = container.getByTestId('age') as HTMLInputElement;
  expect(inputAge.value).toBe('25');
});

test('component inside', async () => {
  const changeName = createEvent<string>();
  const $name = restore(changeName, '');

  const Name = reflect({
    view: (props: {
      value: string;
      onChange: (_event: ChangeEvent<HTMLInputElement>) => void;
    }) => {
      return (
        <input
          data-testid="name"
          value={props.value}
          onChange={props.onChange}
        />
      );
    },
    bind: {
      value: $name,
      onChange: changeName.prepend((event) => event.currentTarget.value),
    },
  });

  const container = render(<Name />);

  expect($name.getState()).toBe('');
  await userEvent.type(container.getByTestId('name'), 'Bob');
  expect($name.getState()).toBe('Bob');

  const inputName = container.getByTestId('name') as HTMLInputElement;
  expect(inputName.value).toBe('Bob');
});

test('with ssr bu for client', async () => {
  const app = createDomain();

  const changeName = app.createEvent<string>();
  const $name = restore(changeName, '');

  const Name = reflect({
    view: (props: {
      value: string;
      onChange: (_event: ChangeEvent<HTMLInputElement>) => void;
    }) => {
      return (
        <input
          data-testid="name"
          value={props.value}
          onChange={props.onChange}
        />
      );
    },
    bind: {
      value: $name,
      onChange: changeName.prepend((event) => event.currentTarget.value),
    },
  });

  const scope = fork(app);

  const container = render(
    <Provider value={scope}>
      <Name />
    </Provider>,
  );

  expect(scope.getState($name)).toBe('');
  expect($name.getState()).toBe('');
  await userEvent.type(container.getByTestId('name'), 'Bob');
  expect($name.getState()).toBe('Bob');
  expect(scope.getState($name)).toBe('Bob');

  // await allSettled(changeName, { scope, params: 'Bob' });

  const inputName = container.getByTestId('name') as HTMLInputElement;
  expect(inputName.value).toBe('Bob');
});
