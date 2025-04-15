import React from 'react';
import renderer from 'react-test-renderer';
import Index from './index';
import { Text, TouchableOpacity } from 'react-native';

// Mock the `useRouter` hook from `expo-router`
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

describe('<Index />', () => {
  it('renders correctly', () => {
    const tree = renderer.create(<Index />).toJSON();
    expect(tree).toMatchSnapshot(); // Save a snapshot
  });

  it('has correct texts rendered', () => {
    const tree = renderer.create(<Index />).root;

    const header = tree.findAllByType(Text).find((node) => node.props.children === 'MANZIL');
    expect(header).toBeTruthy();

    const loginButton = tree.findAllByType(TouchableOpacity).find((node) =>
      node.findByType(Text).props.children === 'Login'
    );
    expect(loginButton).toBeTruthy();

    const signUpButton = tree.findAllByType(TouchableOpacity).find((node) =>
      node.findByType(Text).props.children === 'Sign Up'
    );
    expect(signUpButton).toBeTruthy();
  });

  it('contains two buttons', () => {
    const tree = renderer.create(<Index />).root;
    const buttons = tree.findAllByType(TouchableOpacity);
    expect(buttons.length).toBe(2);
  });
});
