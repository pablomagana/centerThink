import React, { createContext, useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { City } from '@/entities/City';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const { profile, loading: authLoading } = useAuth();
    const [userCities, setUserCities] = useState([]);
    const [selectedCity, setSelectedCity] = useState(null);
    const [appIsLoading, setAppIsLoading] = useState(true);

    useEffect(() => {
        const loadAppData = async () => {
            console.log('AppContext: Loading app data...', { authLoading, profile });

            // Wait for auth to finish loading
            if (authLoading) {
                console.log('AppContext: Waiting for auth...');
                return;
            }

            // If no profile, reset everything
            if (!profile) {
                console.log('AppContext: No profile found');
                setUserCities([]);
                setSelectedCity(null);
                setAppIsLoading(false);
                return;
            }

            try {
                console.log('AppContext: Profile loaded', profile);

                if (profile.cities && Array.isArray(profile.cities) && profile.cities.length > 0) {
                    console.log('AppContext: Loading cities...', profile.cities);

                    // Add timeout to prevent infinite loading
                    const citiesPromise = City.list();
                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Timeout loading cities')), 10000)
                    );

                    const allCities = await Promise.race([citiesPromise, timeoutPromise]);
                    console.log('AppContext: All cities loaded', allCities);

                    const filteredCities = allCities.filter(city =>
                        profile.cities.includes(city.id) && city.active
                    );
                    console.log('AppContext: Filtered cities', filteredCities);
                    setUserCities(filteredCities);

                    const savedCityId = localStorage.getItem('selectedCityId');
                    const savedCity = filteredCities.find(c => c.id === savedCityId);

                    if (savedCity) {
                        setSelectedCity(savedCity);
                    } else if (filteredCities.length > 0) {
                        setSelectedCity(filteredCities[0]);
                        localStorage.setItem('selectedCityId', filteredCities[0].id);
                    }
                } else {
                    // User has no cities assigned
                    console.log('AppContext: No cities assigned to user or cities is not an array');
                    setUserCities([]);
                    setSelectedCity(null);
                }
            } catch (error) {
                console.error("Error loading app data:", error);
                // Even on error, we should show the app with empty cities
                setUserCities([]);
                setSelectedCity(null);
            } finally {
                console.log('AppContext: Finished loading');
                setAppIsLoading(false);
            }
        };
        loadAppData();
    }, [profile, authLoading]);

    const handleSetSelectedCity = (city) => {
        setSelectedCity(city);
        if (city) {
            localStorage.setItem('selectedCityId', city.id);
        } else {
            localStorage.removeItem('selectedCityId');
        }
    };

    const value = {
        currentUser: profile, // Keep currentUser for backward compatibility
        profile,
        userCities,
        selectedCity,
        setSelectedCity: handleSetSelectedCity,
        appIsLoading: authLoading || appIsLoading
    };

    // Debug component to show loading state
    if (authLoading || appIsLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
                        <h2 className="text-xl font-semibold text-slate-900">Cargando aplicación...</h2>
                        <div className="w-full space-y-2 text-sm">
                            <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                                <span>Auth Loading:</span>
                                <span className={authLoading ? "text-yellow-600 font-semibold" : "text-green-600"}>
                                    {authLoading ? "⏳ Cargando..." : "✓ Completado"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                                <span>App Loading:</span>
                                <span className={appIsLoading ? "text-yellow-600 font-semibold" : "text-green-600"}>
                                    {appIsLoading ? "⏳ Cargando..." : "✓ Completado"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                                <span>Profile:</span>
                                <span className={profile ? "text-green-600" : "text-slate-400"}>
                                    {profile ? `✓ ${profile.email}` : "Sin perfil"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-2 rounded bg-slate-50">
                                <span>Cities:</span>
                                <span className={userCities.length > 0 ? "text-green-600" : "text-slate-400"}>
                                    {userCities.length > 0 ? `${userCities.length} ciudad(es)` : "Sin ciudades"}
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 text-center mt-4">
                            Si esta pantalla no desaparece, revisa la consola del navegador para más detalles
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
};
