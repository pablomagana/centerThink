import { useState, useEffect, useContext } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AppContext } from '@/components/AppContextProvider'
import { useAuth } from '@/contexts/AuthContext'
import { ExpenseRequest, REQUEST_TYPE_LABELS } from '@/entities/ExpenseRequest'
import { City } from '@/entities/City'
import { AsanaLinksSection } from '@/components/expense-requests/AsanaLinksSection'
import { ExpenseRequestForm } from '@/components/expense-requests/ExpenseRequestForm'
import { ExpenseRequestsList } from '@/components/expense-requests/ExpenseRequestsList'

export default function OrdersPage() {
  const { selectedCity } = useContext(AppContext)
  const { profile } = useAuth()

  console.log('OrdersPage: Component render', {
    profile,
    profileRole: profile?.role,
    hasAccess: profile?.role === 'admin' || profile?.role === 'supplier' || profile?.role === 'user'
  })

  const [requests, setRequests] = useState([])
  const [cities, setCities] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingRequest, setEditingRequest] = useState(null)
  const [filters, setFilters] = useState({
    status: 'all',
    requestType: 'all',
    cityId: 'all',
    creatorName: ''
  })

  // Check if user has access (admin, supplier or user)
  const hasAccess = profile?.role === 'admin' || profile?.role === 'supplier' || profile?.role === 'user'

  useEffect(() => {
    console.log('OrdersPage: useEffect triggered', { hasAccess, profile, profileRole: profile?.role })
    if (hasAccess) {
      console.log('OrdersPage: Calling loadData()')
      loadData()
    } else {
      console.log('OrdersPage: hasAccess is false, not loading data')
    }
  }, [hasAccess])

  const loadData = async () => {
    setIsLoading(true)
    try {
      console.log('Orders: Starting to load data...')
      const [requestsData, allCitiesData] = await Promise.all([
        ExpenseRequest.list('-created_at'),
        City.list()
      ])

      console.log('Orders: Loaded data', {
        requestsCount: requestsData?.length || 0,
        citiesCount: allCitiesData?.length || 0,
        allCitiesData,
        profile
      })

      setRequests(requestsData)

      // Filter cities based on role
      const activeCities = allCitiesData.filter(c => c.active)
      console.log('Orders: Active cities', { count: activeCities.length, cities: activeCities })

      if (profile?.role === 'admin') {
        // Admin can see all active cities
        console.log('Orders: User is admin, showing all cities')
        setCities(activeCities)
      } else if ((profile?.role === 'supplier' || profile?.role === 'user') && profile?.cities) {
        // Supplier and user can only see their assigned cities
        const userCityIds = profile.cities
        console.log('Orders: User is supplier/user, filtering cities', userCityIds)
        const userCities = activeCities.filter(city =>
          userCityIds.includes(city.id)
        )
        console.log('Orders: User cities', userCities)
        setCities(userCities)
      } else {
        // Fallback: show all active cities
        console.log('Orders: Fallback, showing all active cities')
        setCities(activeCities)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    }
    setIsLoading(false)
  }

  const handleSubmit = async (requestData) => {
    try {
      if (editingRequest) {
        await ExpenseRequest.update(editingRequest.id, requestData)
      } else {
        await ExpenseRequest.create(requestData)
      }
      setShowForm(false)
      setEditingRequest(null)
      await loadData()
    } catch (error) {
      console.error('Error saving expense request:', error)
      throw error
    }
  }

  const handleEdit = (request) => {
    setEditingRequest(request)
    setShowForm(true)
  }

  const handleClose = () => {
    setShowForm(false)
    setEditingRequest(null)
  }

  const handleNewRequest = () => {
    setEditingRequest(null)
    setShowForm(true)
  }

  const handleDelete = async (requestId: string) => {
    try {
      await ExpenseRequest.delete(requestId)
      await loadData()
    } catch (error) {
      console.error('Error deleting expense request:', error)
    }
  }

  // Check if user is admin (only admins can delete)
  const isAdmin = profile?.role === 'admin'

  // Filter requests
  const filteredRequests = requests.filter(request => {
    // Status filter
    const statusMatch = filters.status === 'all' || request.status === filters.status

    // Request type filter
    const typeMatch = filters.requestType === 'all' || request.request_type === filters.requestType

    // City filter
    const cityMatch = filters.cityId === 'all' || request.city_id === filters.cityId

    // Creator name filter
    const creatorName = request.creator
      ? `${request.creator.first_name} ${request.creator.last_name}`.toLowerCase()
      : ''
    const nameMatch = !filters.creatorName || creatorName.includes(filters.creatorName.toLowerCase())

    // Selected city filter from context
    const selectedCityMatch = selectedCity ? request.city_id === selectedCity.id : true

    return statusMatch && typeMatch && cityMatch && nameMatch && selectedCityMatch
  })

  // Access denied for unauthenticated users
  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center h-64">
        <Alert variant="destructive" className="max-w-md">
          <AlertDescription>
            No tienes permisos para acceder a esta sección. Por favor, inicia sesión para gestionar solicitudes de gastos.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Asana Links Section */}
      <AsanaLinksSection />

      {/* Header with New Request Button */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Solicitudes de Gastos</h1>
          <p className="text-sm sm:text-base text-slate-600 mt-1 sm:mt-2">
            Gestiona todas las solicitudes de gastos y materiales para eventos
          </p>
        </div>
        <Button
          onClick={handleNewRequest}
          className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-700 hover:to-emerald-700 shadow-lg h-11 sm:h-12 px-6 sm:px-8 text-sm sm:text-base"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
          Nueva Solicitud
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Status Filter */}
          <div className="space-y-2">
            <Label className="text-sm sm:text-base">Estado</Label>
            <Select
              value={filters.status}
              onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="h-11 sm:h-12 text-sm sm:text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[60vh]">
                <SelectItem value="all" className="text-sm sm:text-base">Todos los estados</SelectItem>
                <SelectItem value="pendiente" className="text-sm sm:text-base">Pendiente</SelectItem>
                <SelectItem value="en_proceso" className="text-sm sm:text-base">En Proceso</SelectItem>
                <SelectItem value="completado" className="text-sm sm:text-base">Completado</SelectItem>
                <SelectItem value="cancelado" className="text-sm sm:text-base">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Request Type Filter */}
          <div className="space-y-2">
            <Label className="text-sm sm:text-base">Tipo de Solicitud</Label>
            <Select
              value={filters.requestType}
              onValueChange={(value) => setFilters(prev => ({ ...prev, requestType: value }))}
            >
              <SelectTrigger className="h-11 sm:h-12 text-sm sm:text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[60vh]">
                <SelectItem value="all" className="text-sm sm:text-base">Todos los tipos</SelectItem>
                {Object.entries(REQUEST_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key} className="text-sm sm:text-base">
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* City Filter */}
          <div className="space-y-2">
            <Label className="text-sm sm:text-base">Ciudad</Label>
            <Select
              value={filters.cityId}
              onValueChange={(value) => setFilters(prev => ({ ...prev, cityId: value }))}
            >
              <SelectTrigger className="h-11 sm:h-12 text-sm sm:text-base">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[60vh]">
                <SelectItem value="all" className="text-sm sm:text-base">Todas las ciudades</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id} className="text-sm sm:text-base">
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Creator Name Filter */}
          <div className="space-y-2">
            <Label className="text-sm sm:text-base">Creador</Label>
            <Input
              placeholder="Buscar por nombre..."
              value={filters.creatorName}
              onChange={(e) => setFilters(prev => ({ ...prev, creatorName: e.target.value }))}
              className="h-11 sm:h-12 text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-xs sm:text-sm text-gray-600">
          Mostrando {filteredRequests.length} de {requests.length} solicitudes
        </div>
      </div>

      {/* Expense Requests List */}
      <ExpenseRequestsList
        requests={filteredRequests}
        onEdit={handleEdit}
        onDelete={handleDelete}
        canDelete={isAdmin}
      />

      {/* Form Modal */}
      <ExpenseRequestForm
        isOpen={showForm}
        onClose={handleClose}
        onSubmit={handleSubmit}
        request={editingRequest}
        cities={cities}
      />
    </div>
  )
}
