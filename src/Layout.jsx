
import React, { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  Calendar as CalendarIcon, // Renamed Calendar to CalendarIcon
  Users,
  MapPin,
  Mic,
  Building2,
  ClipboardList,
  ChevronDown,
  User as UserIcon,
  CalendarDays,
  ChevronRight,
  ChevronLeft,
  LogOut
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { AppContext, AppProvider } from "@/components/AppContextProvider";
import { useAuth } from "@/contexts/AuthContext";

const navigationItems = [
  {
    title: "Thinkglaos",
    url: createPageUrl("Events"),
    icon: CalendarIcon, // Using the renamed CalendarIcon
    roles: ['admin', 'user', 'supplier'],
  },
  {
    title: "Calendario",
    url: createPageUrl("Calendar"),
    icon: CalendarDays,
    roles: ['admin', 'user', 'supplier'],
  },
  {
    title: "Ponentes",
    url: createPageUrl("Speakers"),
    icon: Mic,
    roles: ['admin', 'user', 'supplier'],
  },
  {
    title: "Locales",
    url: createPageUrl("Venues"),
    icon: Building2,
    roles: ['admin', 'user', 'supplier'],
  },
  {
    title: "Pedidos",
    url: createPageUrl("Orders"),
    icon: ClipboardList,
    roles: ['admin', 'user', 'supplier'],
  },
  {
    title: "Usuarios",
    url: createPageUrl("Users"),
    icon: Users,
    roles: ['admin', 'supplier'],
  },
];

const settingsItems = [
  {
    title: "Ciudades",
    url: createPageUrl("Cities"),
    icon: MapPin,
    roles: ['admin', 'supplier'],
  }
];

function MainLayout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const {
    currentUser,
    userCities,
    selectedCity,
    setSelectedCity,
    appIsLoading
  } = useContext(AppContext);

  const [debugExpanded, setDebugExpanded] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  console.log('=== LAYOUT DEBUG ===');
  console.log('currentUser:', currentUser);
  console.log('currentUser?.role:', currentUser?.role);
  console.log('settingsItems:', settingsItems);

  const filterMenuByRole = (items) => {
    if (!currentUser) {
      console.log('filterMenuByRole: NO currentUser found, returning all items to prevent empty menu');
      // Return all items if user is temporarily null to prevent menu disappearing
      return items;
    }
    console.log('filterMenuByRole called with role:', currentUser.role);
    if (currentUser.role === 'admin' || currentUser.role === 'supplier') {
      console.log('User is admin or supplier, returning all items');
      return items;
    }
    const filtered = items.filter(item => item.roles.includes(currentUser.role));
    console.log('User is regular, filtered items:', filtered);
    return filtered;
  };

  const visibleNavigationItems = filterMenuByRole(navigationItems);
  const visibleSettingsItems = filterMenuByRole(settingsItems);

  console.log('visibleNavigationItems:', visibleNavigationItems);
  console.log('visibleSettingsItems:', visibleSettingsItems);
  console.log('visibleSettingsItems.length:', visibleSettingsItems.length);
  console.log('===================');

  const CitySelector = ({ inHeader = false }) => {
    if (appIsLoading || !userCities.length) return <div className="h-12 w-[220px] bg-slate-200 rounded-lg animate-pulse" />;
    
    if (userCities.length === 1) {
      return (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 rounded-lg h-12">
          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
          <span className="text-sm font-medium text-emerald-700">
            {userCities[0].name}
          </span>
        </div>
      );
    }

    const TriggerButton = (
       <Button variant={inHeader ? "outline" : "ghost"} className="justify-between w-full h-12 px-4 text-base">
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-emerald-600" />
            <span className="truncate">{selectedCity?.name || "Seleccionar ciudad"}</span>
          </div>
          <ChevronDown className="w-5 h-5 ml-2 text-slate-500 flex-shrink-0" />
        </Button>
    );

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          {TriggerButton}
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-[220px]">
          <DropdownMenuLabel>Selecciona una ciudad</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {userCities.map((city) => (
            <DropdownMenuItem 
              key={city.id}
              onClick={() => setSelectedCity(city)}
              className="cursor-pointer py-3 px-3 text-base"
            >
              <div className="flex items-center gap-3">
                <div className={`w-2.5 h-2.5 rounded-full ${
                  selectedCity?.id === city.id ? 'bg-emerald-500' : 'bg-gray-300'
                }`}></div>
                {city.name}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <SidebarProvider>
      {/* DEBUG PANEL - Remove this after debugging */}
      <div className={`fixed bottom-4 right-4 bg-red-50 border-2 border-red-500 rounded-lg shadow-lg z-50 transition-all duration-300 ${
        debugExpanded ? 'max-w-sm' : 'w-auto'
      }`}>
        <div className="flex items-start justify-between gap-2 p-4 pb-2">
          <h3 className="font-bold text-red-800 text-sm">🐛 DEBUG INFO</h3>
          <button
            onClick={() => setDebugExpanded(!debugExpanded)}
            className="text-red-700 hover:text-red-900 hover:bg-red-100 rounded p-1 transition-colors"
            title={debugExpanded ? "Minimizar" : "Expandir"}
          >
            {debugExpanded ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {debugExpanded && (
          <>
            <div className="space-y-1 text-xs text-gray-800 mb-3 px-4">
              <div><strong>User exists:</strong> {currentUser ? '✅ YES' : '❌ NO'}</div>
              <div><strong>User role:</strong> <span className="font-mono bg-yellow-100 px-1">{currentUser?.role || 'undefined'}</span></div>
              <div><strong>User email:</strong> {currentUser?.email || 'undefined'}</div>
              <div><strong>settingsItems count:</strong> {settingsItems.length}</div>
              <div><strong>visibleSettings count:</strong> <span className="font-mono bg-yellow-100 px-1">{visibleSettingsItems.length}</span></div>
              <div><strong>Expected roles:</strong> {JSON.stringify(settingsItems[0]?.roles)}</div>
            </div>
            <div className="pt-2 pb-4 px-4 border-t border-red-300 space-y-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-blue-500 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-blue-600"
              >
                🔄 Recargar Página
              </button>
              <button
                onClick={() => {
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.reload();
                }}
                className="w-full bg-orange-500 text-white px-3 py-1 rounded text-xs font-semibold hover:bg-orange-600"
              >
                🗑️ Limpiar Cache y Recargar
              </button>
            </div>
          </>
        )}
      </div>

      <div className="h-screen flex w-full bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50 overflow-hidden">
        <Sidebar className="border-r border-slate-200/60 bg-white/80 backdrop-blur-sm flex flex-col h-full">
          <SidebarHeader className="border-b border-slate-200/60 p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <img src="/favicon.svg" alt="CenterThink" className="w-10 h-10 rounded-xl" />
              </div>
              <div>
                <h2 className="font-bold text-slate-900 text-lg">CenterThink</h2>
                <p className="text-xs text-slate-500">Gestión de Eventos</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="px-3 py-4 flex-1 overflow-y-auto">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
                Principal
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {visibleNavigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <Link
                        to={item.url}
                        className={`flex items-center gap-4 px-4 py-2.5 w-full rounded-lg transition-colors duration-200 ${
                          location.pathname === item.url
                            ? 'bg-emerald-50 text-slate-900'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span className="font-medium text-[15px]">{item.title}</span>
                      </Link>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {visibleSettingsItems.length > 0 && (
              <SidebarGroup className="mt-6">
                <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">
                  Configuración
                </SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {visibleSettingsItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <Link
                          to={item.url}
                          className={`flex items-center gap-4 px-4 py-2.5 w-full rounded-lg transition-colors duration-200 ${
                            location.pathname === item.url
                              ? 'bg-emerald-50 text-slate-900'
                              : 'text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <item.icon className="w-5 h-5 flex-shrink-0" />
                          <span className="font-medium text-[15px]">{item.title}</span>
                        </Link>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </SidebarContent>

          <SidebarFooter className="border-t border-slate-200/60 p-4 space-y-4">
            <div className="px-2">
              <CitySelector />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-3 w-full hover:bg-slate-50 p-2 rounded-lg transition-colors duration-200 cursor-pointer"
                  title="Opciones de usuario"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-200 to-slate-300 rounded-full flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className="font-semibold text-slate-900 text-sm truncate">
                      {currentUser?.first_name} {currentUser?.last_name}
                    </p>
                    <p className="text-xs text-slate-500 truncate">
                      {currentUser?.email}
                    </p>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate('/profile')}
                  className="cursor-pointer"
                >
                  <UserIcon className="w-4 h-4 mr-2" />
                  Ver Perfil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col h-full overflow-hidden">
          {/* <header className="bg-white/90 backdrop-blur-sm border-b border-slate-200/60 px-6 py-4 md:px-8 h-24 flex items-center flex-shrink-0">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="md:hidden hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200" />
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">{currentPageName}</h1>
                </div>
              </div>
              
              <div className="flex items-center gap-4 md:hidden">
                <CitySelector inHeader={true} />
              </div>
            </div>
          </header> */}

          <div className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto p-6 md:p-8">
              {children}
            </div>
          </div>
        </main>
      </div>
      
      <style>{`
        :root {
          --sidebar-background: rgba(255, 255, 255, 0.9);
          --sidebar-foreground: rgb(15, 23, 42);
          --sidebar-border: rgba(226, 232, 240, 0.6);
          --sidebar-primary: rgb(59, 130, 246);
          --sidebar-primary-foreground: rgb(255, 255, 255);
          --sidebar-accent: rgba(59, 130, 246, 0.1);
          --sidebar-accent-foreground: rgb(59, 130, 246);
        }
      `}</style>
    </SidebarProvider>
  );
}

export default function LayoutWrapper(props) {
  return (
    <AppProvider>
      <MainLayout {...props} />
    </AppProvider>
  )
}
