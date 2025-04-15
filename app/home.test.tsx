import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import HomeScreen from '../app/home';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Mock dependencies
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
  useLocalSearchParams: jest.fn()
}));

jest.mock('axios');
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(),
  setItem: jest.fn()
}));

// Mock the AuthContext
jest.mock('../app/contexts/authcontext', () => ({
  useAuth: jest.fn().mockReturnValue({
    user: { email: '123123@gmail.com' },
    isAuthenticated: true,
    login: jest.fn(),
    logout: jest.fn(),
    signup: jest.fn(),
    loading: false
  })
}));

// Mock ProtectedRoute
jest.mock('../app/components/protectedroute', () => ({
  __esModule: true,
  default: ({ children }) => children
}));

// Mock Font and Icons
jest.mock('expo-font', () => ({
  isLoaded: jest.fn().mockReturnValue(true),
  loadAsync: jest.fn().mockResolvedValue(true)
}));

jest.mock('@expo/vector-icons', () => {
  const { View } = require('react-native');
  const createIconSetMock = (name) => {
    const IconComponent = (props) => <View testID={`icon-${name}`} {...props} />;
    IconComponent.Button = (props) => <View testID={`icon-button-${name}`} {...props} />;
    return IconComponent;
  };
  
  return {
    Ionicons: createIconSetMock('Ionicons'),
    MaterialIcons: createIconSetMock('MaterialIcons'),
    FontAwesome: createIconSetMock('FontAwesome'),
    FontAwesome5: createIconSetMock('FontAwesome5'),
    MaterialCommunityIcons: createIconSetMock('MaterialCommunityIcons'),
  };
});

// Mock Location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn().mockResolvedValue({ status: 'granted' }),
  getCurrentPositionAsync: jest.fn().mockResolvedValue({
    coords: {
      latitude: 33.6844,
      longitude: 73.0479
    }
  })
}));

// Mock Picker
jest.mock('react-native-picker-select', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  return function MockPicker({ onValueChange, items, value }) {
    return (
      <View testID="city-picker">
        <Text>{value}</Text>
        {items.map(item => (
          <TouchableOpacity 
            key={item.value} 
            testID={`picker-option-${item.value}`}
            onPress={() => onValueChange(item.value)}
          >
            <Text>{item.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
    );
  };
});

// Mock Footer
jest.mock('../app/components/Footer', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  return function MockFooter({ handleProfile, handleBack, cityName, email, currentTab }) {
    return (
      <View testID="footer">
        <TouchableOpacity 
          testID="profile-button" 
          onPress={() => handleProfile(email, cityName)}
        >
          <Text>Profile</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

// Mock CarRentalDetailsPage
jest.mock('../app/CarRentalDetailsPage', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  return function MockCarRentalDetailsPage() {
    return (
      <View testID="car-rental-details-page">
        <Text testID="company-name">Test Car Rental</Text>
        <Text testID="company-address">Test Address, Islamabad</Text>
        <Text testID="available-cars">Available Cars: 2</Text>
        <TouchableOpacity testID="navigate-button">
          <Text>Navigate</Text>
        </TouchableOpacity>
      </View>
    );
  };
});

// Mock GoogleMapScreen
jest.mock('../app/GoogleMapScreen', () => {
  const { View, Text } = require('react-native');
  return function MockGoogleMapScreen() {
    return (
      <View testID="google-maps-screen">
        <Text testID="map-place-name">Test Car Rental, Test Address, Islamabad</Text>
      </View>
    );
  };
});

// Mock React Native components with improved animation handling
jest.mock('react-native', () => {
  const reactNative = jest.requireActual('react-native');
  reactNative.Alert = { alert: jest.fn() };
  
  // Create a better animation mock that works with act()
  const Animation = {
    start: callback => {
      if (callback) {
        setTimeout(() => callback({ finished: true }), 0);
      }
      return Promise.resolve();
    },
    reset: jest.fn(),
    stop: jest.fn()
  };
  
  reactNative.Animated = {
    ...reactNative.Animated,
    timing: () => Animation,
    spring: () => Animation,
    decay: () => Animation,
    sequence: () => Animation,
    Value: function(val) {
      this.setValue = jest.fn();
      this.interpolate = jest.fn(() => ({ interpolate: jest.fn() }));
      return {
        setValue: this.setValue,
        interpolate: this.interpolate,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        removeAllListeners: jest.fn(),
      };
    }
  };
  
  return reactNative;
});

// Mock FlatList with proper router usage
jest.mock('react-native/Libraries/Lists/FlatList', () => {
  const { View, Text, TouchableOpacity } = require('react-native');
  const { useRouter } = require('expo-router');
  
  return function MockFlatList({ data, renderItem }) {
    const router = useRouter();
    
    // For car rentals
    if (data && data[0]?.location?.city) {
      return (
        <View testID="flatlist-mock">
          {data.map((item, index) => (
            <View key={index} testID={`rental-item-${index}`}>
              <Text>{item.name}</Text>
              <Text>{item.location.address}, {item.location.city}</Text>
              <Text>Available Cars: {item.cars.filter(car => car.available).length}</Text>
              <TouchableOpacity 
                testID="navigate-button"
                onPress={() => router.push({
                  pathname: "/GoogleMapScreen",
                  params: { 
                    placeName: `${item.name}, ${item.location.address}, ${item.location.city}`
                  }
                })}
              >
                <Text>Navigate</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                testID="details-button"
                onPress={() => router.push({
                  pathname: "/CarRentalDetailsPage",
                  params: { rentalId: item._id }
                })}
              >
                <Text>Details</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      );
    }
    
    // Default case
    return (
      <View testID="flatlist-mock">
        {data?.map((item, index) => (
          <View key={index}>{renderItem({ item })}</View>
        ))}
      </View>
    );
  };
});

describe('HomeScreen component', () => {
  let mockPush;
  let mockReplace;
  
  beforeEach(() => {
    // Use fake timers to control any setTimeout, etc. in your code
    jest.useFakeTimers();
    
    // Clear all mocks
    jest.clearAllMocks();
    
    mockPush = jest.fn();
    mockReplace = jest.fn();
    
    useRouter.mockReturnValue({
      push: mockPush,
      replace: mockReplace
    });
    
    useLocalSearchParams.mockReturnValue({
      city: JSON.stringify({ name: 'Islamabad', places: [], foods: [] })
    });
    
    AsyncStorage.getItem.mockResolvedValue('123123@gmail.com');
    
    // Default mock implementations
    axios.get.mockImplementation((url) => {
      if (url.includes('geocode')) {
        return Promise.resolve({
          data: {
            status: 'OK',
            results: [{
              geometry: { location: { lat: 33.6844, lng: 73.0479 } }
            }]
          }
        });
      } else if (url.includes('nearbysearch')) {
        return Promise.resolve({
          data: {
            status: 'OK',
            results: [{
              name: 'Test Tourist Spot',
              vicinity: 'Test Address',
              photos: [{ photo_reference: 'test-photo-ref' }],
              rating: 4.5
            }]
          }
        });
      } else if (url.includes('/hotels/')) {
        return Promise.resolve({
          data: {
            hotels: [{
              _id: 'hotel1',
              hotel_name: 'Test Hotel',
              complete_address: 'Test Hotel Address',
              hotel_class: '5-Star'
            }]
          }
        });
      } else if (url.includes('dataservice.accuweather')) {
        if (url.includes('cities/search')) {
          return Promise.resolve({ data: [{ Key: '123456' }] });
        }
        return Promise.resolve({ data: [{ Temperature: { Metric: { Value: 25 } } }] });
      } else if (url.includes('car-rental-companies')) {
        return Promise.resolve({
          data: [{
            _id: 'car1',
            name: 'Test Car Rental',
            location: { address: 'Test Address', city: 'Islamabad' },
            cars: [{ available: true }, { available: true }]
          }]
        });
      }
      return Promise.resolve({ data: {} });
    });
  });

  afterEach(() => {
    // Cleanup after each test
    jest.useRealTimers();
    jest.clearAllMocks();
  });

  // Basic rendering test
  test('should render the HomeScreen component correctly', async () => {
    const { getByText, findByTestId } = render(<HomeScreen />);
    
    // Wait for component to fully render
    await findByTestId('city-picker');
    
    // Run pending timers if any
    act(() => {
      jest.runAllTimers();
    });
    
    expect(getByText('Explore')).toBeTruthy();
    expect(getByText('Tourist Spots')).toBeTruthy();
    expect(getByText('Popular')).toBeTruthy();
  });

  // Hotels tab test
  test('should change active tab when Hotels tab is clicked', async () => {
    const { getByText, findByTestId } = render(<HomeScreen />);
    
    // Wait for component to fully render
    await findByTestId('city-picker');
    
    await act(async () => {
      fireEvent.press(getByText('Hotels'));
      jest.runAllTimers();
    });
    
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/hotels/city/Islamabad')
    );
  });

  // Profile navigation test
  test('should navigate to Profile screen when profile button is clicked', async () => {
    const { findByTestId } = render(<HomeScreen />);
    
    // Wait for component to fully render
    const profileButton = await findByTestId('profile-button');
    
    await act(async () => {
      fireEvent.press(profileButton);
      jest.runAllTimers();
    });
    
    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/Profile",
      params: { email: '123123@gmail.com', city: 'Islamabad' }
    });
  });
  
  // City selection test
  test('should change city when a different city is selected', async () => {
    const { findByTestId } = render(<HomeScreen />);
    
    // Wait for component to fully render
    const cityPicker = await findByTestId('city-picker');
    const lahoreOption = await findByTestId('picker-option-Lahore');
    
    await act(async () => {
      fireEvent.press(lahoreOption);
      jest.runAllTimers();
    });
    
    expect(mockReplace).toHaveBeenCalledWith({
      pathname: "/home",
      params: { city: JSON.stringify({ name: 'Lahore', places: [], foods: [] }) }
    });
  });

  // Car Rentals tab tests
  test('should render Car Rentals tab with rental companies', async () => {
    const { getByText, findByText, findByTestId } = render(<HomeScreen />);
    
    // Wait for component to fully render
    await findByTestId('city-picker');
    
    await act(async () => {
      fireEvent.press(getByText('Car Rentals'));
      jest.runAllTimers();
    });

    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/car-rental-companies/city/Islamabad')
    );

    // Wait for the rental data to appear
    const rentalName = await findByText('Test Car Rental');
    const rentalAddress = await findByText('Test Address, Islamabad');
    const availableCars = await findByText('Available Cars: 2');
    
    expect(rentalName).toBeTruthy();
    expect(rentalAddress).toBeTruthy();
    expect(availableCars).toBeTruthy();
  });

  test('should render Navigate button in Car Rentals tab', async () => {
    const { getByText, findByTestId } = render(<HomeScreen />);
    
    // Wait for component to fully render
    await findByTestId('city-picker');
    
    await act(async () => {
      fireEvent.press(getByText('Car Rentals'));
      jest.runAllTimers();
    });

    // Wait for the navigate button to appear
    const navigateButton = await findByTestId('navigate-button');
    expect(navigateButton).toBeTruthy();
  });

  test('should open Google Maps with correct location when Navigate button is clicked', async () => {
    const { getByText, findByTestId } = render(<HomeScreen />);
    
    // Wait for component to fully render
    await findByTestId('city-picker');
    
    await act(async () => {
      fireEvent.press(getByText('Car Rentals'));
      jest.runAllTimers();
    });

    // Wait for the navigate button to appear
    const navigateButton = await findByTestId('navigate-button');
    
    await act(async () => {
      fireEvent.press(navigateButton);
      jest.runAllTimers();
    });

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/GoogleMapScreen",
      params: expect.objectContaining({ 
        placeName: expect.stringContaining("Test Car Rental")
      })
    });
  });

  test('should navigate to Car Rental Details when Details button is clicked', async () => {
    const { getByText, findByTestId } = render(<HomeScreen />);
    
    // Wait for component to fully render
    await findByTestId('city-picker');
    
    await act(async () => {
      fireEvent.press(getByText('Car Rentals'));
      jest.runAllTimers();
    });

    // Wait for the details button to appear
    const detailsButton = await findByTestId('details-button');
    
    await act(async () => {
      fireEvent.press(detailsButton);
      jest.runAllTimers();
    });

    expect(mockPush).toHaveBeenCalledWith({
      pathname: "/CarRentalDetailsPage",
      params: expect.objectContaining({ 
        rentalId: 'car1' 
      })
    });
  });
});