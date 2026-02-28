import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";

const STORAGE_KEY = "worldwise.cities";

const CitiesContext = createContext();

const initialState = {
  cities: [],
  isLoading: false,
  currentCity: {},
  error: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return { ...state, isLoading: true };

    case "cities/loaded":
      return {
        ...state,
        isLoading: false,
        cities: action.payload,
      };

    case "city/loaded":
      return { ...state, isLoading: false, currentCity: action.payload };

    case "city/created":
      return {
        ...state,
        isLoading: false,
        cities: [...state.cities, action.payload],
        currentCity: action.payload,
      };

    case "city/deleted":
      return {
        ...state,
        isLoading: false,
        cities: state.cities.filter((city) => city.id !== action.payload),
        currentCity:
          state.currentCity.id === action.payload ? {} : state.currentCity,
      };

    case "rejected":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    default:
      throw new Error("Unknown action type.");
  }
}

function readCitiesFromStorage() {
  const rawValue = localStorage.getItem(STORAGE_KEY);
  if (!rawValue) return [];

  const parsed = JSON.parse(rawValue);
  return Array.isArray(parsed) ? parsed : [];
}

function saveCitiesToStorage(cities) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cities));
}

function createCityId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function")
    return crypto.randomUUID();
  return String(Date.now());
}

function CitiesProvider({ children }) {
  const [{ cities, isLoading, currentCity, error }, dispatch] = useReducer(
    reducer,
    initialState,
  );

  useEffect(function () {
    dispatch({ type: "loading" });

    try {
      const storedCities = readCitiesFromStorage();
      dispatch({ type: "cities/loaded", payload: storedCities });
    } catch {
      dispatch({
        type: "rejected",
        payload: "There was an error loading the cities...",
      });
    }
  }, []);

  const getCity = useCallback(
    function getCity(id) {
      if (Number(id) === Number(currentCity.id)) return;

      dispatch({ type: "loading" });

      try {
        const city = cities.find((item) => Number(item.id) === Number(id));
        if (!city) throw new Error("City not found");
        dispatch({ type: "city/loaded", payload: city });
      } catch {
        dispatch({
          type: "rejected",
          payload: "There was an error loading the city...",
        });
      }
    },
    [cities, currentCity.id],
  );

  const createCity = useCallback(async function createCity(newCity) {
    dispatch({ type: "loading" });

    try {
      const cityToCreate = { ...newCity, id: createCityId() };
      const updatedCities = [...cities, cityToCreate];
      saveCitiesToStorage(updatedCities);
      dispatch({ type: "city/created", payload: cityToCreate });
      return true;
    } catch {
      dispatch({
        type: "rejected",
        payload: "There was an error creating the city...",
      });
      return false;
    }
  }, [cities]);

  const deleteCity = useCallback(async function deleteCity(id) {
    dispatch({ type: "loading" });

    try {
      const updatedCities = cities.filter((city) => Number(city.id) !== Number(id));
      saveCitiesToStorage(updatedCities);
      dispatch({ type: "city/deleted", payload: id });
    } catch {
      dispatch({
        type: "rejected",
        payload: "There was an error deleting the city...",
      });
    }
  }, [cities]);

  const value = useMemo(
    () => ({
      cities,
      isLoading,
      currentCity,
      error,
      getCity,
      createCity,
      deleteCity,
    }),
    [cities, isLoading, currentCity, error, getCity, createCity, deleteCity],
  );

  return (
    <CitiesContext.Provider value={value}>{children}</CitiesContext.Provider>
  );
}

function useCities() {
  const context = useContext(CitiesContext);
  if (context === undefined)
    throw new Error("CitiesContext was used outside the CitiesProvider.");
  return context;
}

export { CitiesProvider, useCities };
