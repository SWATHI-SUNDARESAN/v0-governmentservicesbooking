"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Users, Calendar, Clock, BarChart3, ArrowLeft, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { tamilNaduData, timeSlots, talukCenters } from "@/lib/tn-data"

export default function AdminPortal() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loginData, setLoginData] = useState({ username: "", password: "" })
  const [showPassword, setShowPassword] = useState(false)
  const [bookings, setBookings] = useState<any[]>([])
  const [selectedDistrict, setSelectedDistrict] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [filterDistrict, setFilterDistrict] = useState("")
  const [filterTaluk, setFilterTaluk] = useState("")
  const [filterServiceCenter, setFilterServiceCenter] = useState("")
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [slotSettings, setSlotSettings] = useState<Record<string, string[]>>({})

  useEffect(() => {
    // Load bookings from localStorage
    const savedBookings = JSON.parse(localStorage.getItem("bookings") || "[]")
    setBookings(savedBookings)

    const savedSlotSettings = JSON.parse(localStorage.getItem("slotSettings") || "{}")
    setSlotSettings(savedSlotSettings)
  }, [])

  const handleLogin = () => {
    if (loginData.username === "admin" && loginData.password === "admin123") {
      setIsLoggedIn(true)
    } else {
      alert("Invalid credentials. Use username: admin, password: admin123")
    }
  }

  const getFilteredBookings = () => {
    if (!filterDistrict || !filterTaluk || !filterServiceCenter) {
      return []
    }

    return bookings.filter(
      (booking) =>
        booking.district === filterDistrict && booking.taluk === filterTaluk && booking.center === filterServiceCenter,
    )
  }

  const getStats = () => {
    const today = new Date().toISOString().split("T")[0]
    const todayBookings = bookings.filter((b) => b.date === today)
    const totalBookings = bookings.length
    const serviceStats = bookings.reduce(
      (acc, booking) => {
        acc[booking.service] = (acc[booking.service] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    return {
      todayBookings: todayBookings.length,
      totalBookings,
      availableSlots: 25 - todayBookings.length, // Each center has 25 slots
      serviceStats,
    }
  }

  const stats = getStats()

  const toggleSlot = (time: string) => {
    const key = `${selectedDistrict}-${selectedDate}`
    const currentSlots = slotSettings[key] || []

    let updatedSlots
    if (currentSlots.includes(time)) {
      updatedSlots = currentSlots.filter((slot) => slot !== time)
    } else {
      updatedSlots = [...currentSlots, time]
    }

    const newSlotSettings = {
      ...slotSettings,
      [key]: updatedSlots,
    }

    setSlotSettings(newSlotSettings)
    localStorage.setItem("slotSettings", JSON.stringify(newSlotSettings))
  }

  const getSlotStatus = (time: string) => {
    const key = `${selectedDistrict}-${selectedDate}`
    const availableSlots = slotSettings[key] || []
    const isAvailable = availableSlots.includes(time)

    const isBooked = bookings.some((b) => b.date === selectedDate && b.time === time && b.district === selectedDistrict)

    if (isBooked) return "booked"
    if (isAvailable) return "available"
    return "disabled"
  }

  const getServiceCenters = () => {
    if (!filterTaluk) return []
    return talukCenters[filterTaluk] || talukCenters.default
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Shield className="w-12 h-12 text-orange-600 mx-auto mb-4" />
            <CardTitle className="text-2xl text-orange-700">Admin Login</CardTitle>
            <CardDescription>Access the administrative portal</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                value={loginData.username}
                onChange={(e) => setLoginData({ ...loginData, username: e.target.value })}
                placeholder="Enter username"
              />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="Enter password"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            <Button onClick={handleLogin} className="w-full bg-orange-600 hover:bg-orange-700">
              <Shield className="w-4 h-4 mr-2" />
              Login
            </Button>
            <div className="text-center text-sm text-gray-600">
              <p>Demo credentials:</p>
              <p>Username: admin | Password: admin123</p>
            </div>
            <Link href="/">
              <Button variant="outline" className="w-full bg-transparent">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const filteredBookings = getFilteredBookings()
  const locationStats =
    filteredBookings.length > 0
      ? {
          totalBookings: filteredBookings.length,
          thisWeekBookings: filteredBookings.filter((booking) => {
            const bookingDate = new Date(booking.date)
            const today = new Date()
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
            return bookingDate >= weekAgo && bookingDate <= today
          }).length,
        }
      : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <header className="bg-white shadow-sm border-b-4 border-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex space-x-4">
              <Button variant="outline" onClick={() => setIsLoggedIn(false)}>
                Logout
              </Button>
              <Link href="/">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.todayBookings}</div>
              <p className="text-xs text-muted-foreground">out of 25 slots</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Slots</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.availableSlots}</div>
              <p className="text-xs text-muted-foreground">slots remaining today</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.totalBookings}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Slot Utilization</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{Math.round((stats.todayBookings / 25) * 100)}%</div>
              <p className="text-xs text-muted-foreground">of 25 daily slots used</p>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>View Bookings by Location</CardTitle>
            <CardDescription>Select district, taluk, and service center to view specific bookings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label>District</Label>
                <Select
                  value={filterDistrict}
                  onValueChange={(value) => {
                    setFilterDistrict(value)
                    setFilterTaluk("")
                    setFilterServiceCenter("")
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(tamilNaduData).map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Taluk</Label>
                <Select
                  value={filterTaluk}
                  onValueChange={(value) => {
                    setFilterTaluk(value)
                    setFilterServiceCenter("")
                  }}
                  disabled={!filterDistrict}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select taluk" />
                  </SelectTrigger>
                  <SelectContent>
                    {filterDistrict &&
                      tamilNaduData[filterDistrict]?.map((taluk) => (
                        <SelectItem key={taluk} value={taluk}>
                          {taluk}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Service Center</Label>
                <Select value={filterServiceCenter} onValueChange={setFilterServiceCenter} disabled={!filterTaluk}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select service center" />
                  </SelectTrigger>
                  <SelectContent>
                    {getServiceCenters().map((center) => (
                      <SelectItem key={center} value={center}>
                        {center}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {filterDistrict && filterTaluk && filterServiceCenter && (
              <div className="mt-6">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-lg font-semibold">Bookings at {filterServiceCenter}</h3>
                    <p className="text-sm text-gray-600 font-medium">
                      📍 {filterDistrict} District → {filterTaluk} Taluk → {filterServiceCenter}
                    </p>
                  </div>
                  {locationStats && (
                    <div className="text-sm text-gray-600">
                      Total: {locationStats.totalBookings} | This Week: {locationStats.thisWeekBookings}
                    </div>
                  )}
                </div>

                <div className="mb-4">
                  <Input
                    placeholder="Search bookings by name, phone, or service..."
                    className="max-w-md"
                    onChange={(e) => {
                      // Add search functionality if needed
                    }}
                  />
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredBookings.length > 0 ? (
                    filteredBookings
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((booking, index) => (
                        <div
                          key={index}
                          className="p-4 border rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <p className="font-semibold text-gray-900 text-lg">{booking.name}</p>
                                <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                                  {booking.status}
                                </span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                <p className="text-gray-700">
                                  <span className="font-medium">Service:</span> {booking.service}
                                </p>
                                <p className="text-gray-700">
                                  <span className="font-medium">Phone:</span> {booking.phone}
                                </p>
                                <p className="text-blue-600 font-medium col-span-full">
                                  📍 {booking.district} → {booking.taluk} → {booking.center}
                                </p>
                              </div>
                            </div>
                            <div className="text-right ml-4">
                              <div className="bg-blue-50 p-3 rounded-lg">
                                <p className="text-sm font-semibold text-blue-900">{booking.date}</p>
                                <p className="text-lg font-bold text-blue-600">{booking.time}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-lg font-medium">No bookings found</p>
                      <p className="text-sm">No appointments scheduled for this location yet</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Slot Management */}
          <Card>
            <CardHeader>
              <CardTitle>Slot Management</CardTitle>
              <CardDescription>Enable/disable time slots for different districts and dates</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>District</Label>
                <Select value={selectedDistrict} onValueChange={setSelectedDistrict}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select district" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(tamilNaduData).map((district) => (
                      <SelectItem key={district} value={district}>
                        {district}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                />
              </div>

              {selectedDistrict && selectedDate && (
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <Label>Time Slots (Click to enable/disable)</Label>
                    <div className="text-sm text-gray-600">
                      {slotSettings[`${selectedDistrict}-${selectedDate}`]?.length || 0} slots enabled
                    </div>
                  </div>
                  <div className="grid grid-cols-5 gap-2">
                    {timeSlots.map((time) => {
                      const status = getSlotStatus(time)
                      return (
                        <button
                          key={time}
                          onClick={() => toggleSlot(time)}
                          disabled={status === "booked"}
                          className={`p-2 text-center text-xs border rounded transition-colors ${
                            status === "booked"
                              ? "bg-red-100 border-red-300 text-red-700 cursor-not-allowed"
                              : status === "available"
                                ? "bg-green-100 border-green-300 text-green-700 hover:bg-green-200"
                                : "bg-gray-100 border-gray-300 text-gray-500 hover:bg-blue-100 hover:border-blue-300"
                          }`}
                        >
                          {time}
                        </button>
                      )
                    })}
                  </div>

                  <div className="flex justify-between text-sm mt-3">
                    <span className="flex items-center">
                      <div className="w-3 h-3 bg-green-100 border border-green-300 rounded mr-2"></div>
                      Available for booking
                    </span>
                    <span className="flex items-center">
                      <div className="w-3 h-3 bg-gray-100 border border-gray-300 rounded mr-2"></div>
                      Disabled
                    </span>
                    <span className="flex items-center">
                      <div className="w-3 h-3 bg-red-100 border border-red-300 rounded mr-2"></div>
                      Booked
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Bookings */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Bookings</CardTitle>
              <CardDescription>Latest appointment bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {bookings
                  .slice(-10)
                  .reverse()
                  .map((booking, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{booking.name}</p>
                          <p className="text-sm text-gray-600">{booking.service}</p>
                          <p className="text-sm text-gray-600">
                            {booking.district}, {booking.taluk}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{booking.date}</p>
                          <p className="text-sm text-blue-600">{booking.time}</p>
                          <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                            {booking.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                {bookings.length === 0 && <p className="text-center text-gray-500 py-8">No bookings yet</p>}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Service Statistics */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Service Statistics</CardTitle>
            <CardDescription>Breakdown of services requested</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {Object.entries(stats.serviceStats).map(([service, count]) => (
                <div key={service} className="p-4 border rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">{count}</p>
                  <p className="text-sm text-gray-600">{service}</p>
                </div>
              ))}
              {Object.keys(stats.serviceStats).length === 0 && (
                <p className="col-span-3 text-center text-gray-500 py-8">No service data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
