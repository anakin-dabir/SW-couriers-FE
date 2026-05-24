import type { AddressFields, GeneralSettingsState, PickupAddress } from './types';

export function resolveEffectiveTradingAddress(state: GeneralSettingsState): AddressFields {
  return state.tradingAddressSameAsRegistered ? state.registeredAddress : state.tradingAddress;
}

export function resolveEffectiveTradingCoordinates(state: GeneralSettingsState): {
  latitude: number | null;
  longitude: number | null;
} {
  if (state.tradingAddressSameAsRegistered) {
    return {
      latitude: state.registeredLatitude,
      longitude: state.registeredLongitude,
    };
  }
  return {
    latitude: state.tradingLatitude,
    longitude: state.tradingLongitude,
  };
}

export function resolveEffectivePickupAddress(
  pickup: PickupAddress,
  state: GeneralSettingsState
): AddressFields {
  if (pickup.sameAsRegistered) {
    return state.registeredAddress;
  }
  if (pickup.sameAsTrading) {
    return resolveEffectiveTradingAddress(state);
  }
  return pickup;
}
