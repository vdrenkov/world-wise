import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { readCities, saveCities, STORAGE_KEY } from "../services/cityStorage";
import { newCitySchema } from "../types";

import type { City, NewCity } from "../types";
import type { ReactNode } from "react";

interface CitiesState {
  cities: City[];
  selectedId?: string;
  error: string;
  unreadable: boolean;
}

interface CitiesValue {
  cities: City[];
  currentCity?: City;
  error: string;
  unreadable: boolean;
  createCity: (city: NewCity) => boolean;
  getCity: (id: string) => void;
  deleteCity: (id: string) => boolean;
  reloadCities: () => void;
  resetCities: () => void;
}

const CitiesContext = createContext<CitiesValue | undefined>(undefined);
const LOAD_ERROR =
  "Your saved journal could not be read. Its original data has not been changed.";

function loadState(): CitiesState {
  try {
    return { cities: readCities(), error: "", unreadable: false };
  } catch {
    return { cities: [], error: LOAD_ERROR, unreadable: true };
  }
}

function CitiesProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState(loadState);

  const createCity = useCallback((newCity: NewCity) => {
    try {
      const city = { ...newCitySchema.parse(newCity), id: crypto.randomUUID() };
      const cities = [...readCities(), city];
      saveCities(cities);
      setState({ cities, selectedId: city.id, error: "", unreadable: false });
      return true;
    } catch {
      setState((previous) => ({
        ...previous,
        error:
          "Your trip could not be saved. Check browser storage permissions or available space and try again.",
      }));
      return false;
    }
  }, []);

  const getCity = useCallback((id: string) => {
    setState((previous) => {
      if (previous.selectedId === id) {
        return previous;
      }

      const found = previous.cities.some((city) => city.id === id);
      return {
        ...previous,
        selectedId: id,
        error: found ? "" : "This trip is no longer in your journal.",
      };
    });
  }, []);

  const deleteCity = useCallback((id: string) => {
    try {
      const cities = readCities().filter((city) => city.id !== id);
      saveCities(cities);
      setState((previous) => ({
        ...previous,
        cities,
        error: "",
        unreadable: false,
      }));
      return true;
    } catch {
      setState((previous) => ({
        ...previous,
        error:
          "Your trip could not be deleted. Your journal has not been changed. Try again when browser storage is available.",
      }));
      return false;
    }
  }, []);

  const reloadCities = useCallback(() => {
    setState((previous) => ({
      ...loadState(),
      selectedId: previous.selectedId,
    }));
  }, []);

  const resetCities = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setState({ cities: [], error: "", unreadable: false });
    } catch {
      setState((previous) => ({
        ...previous,
        error: "Browser storage is unavailable. Enable it and try again.",
      }));
    }
  }, []);

  useEffect(() => {
    function synchronize(event: StorageEvent) {
      if (
        event.storageArea === localStorage &&
        (event.key === STORAGE_KEY || event.key === null)
      ) {
        reloadCities();
      }
    }
    window.addEventListener("storage", synchronize);
    return () => window.removeEventListener("storage", synchronize);
  }, [reloadCities]);

  const value = useMemo(
    () => ({
      ...state,
      currentCity: state.cities.find((city) => city.id === state.selectedId),
      createCity,
      getCity,
      deleteCity,
      reloadCities,
      resetCities,
    }),
    [state, createCity, getCity, deleteCity, reloadCities, resetCities],
  );

  return <CitiesContext value={value}>{children}</CitiesContext>;
}

function useCities() {
  const context = use(CitiesContext);

  if (context === undefined) {
    throw new Error("CitiesContext was used outside the CitiesProvider.");
  }

  return context;
}

export { CitiesProvider, useCities };
