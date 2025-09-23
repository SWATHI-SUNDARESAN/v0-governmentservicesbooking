"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, CheckCircle, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { tamilNaduData, talukCenters, serviceTypes } from "@/lib/tn-data"

export default function UserPortal() {
  const [selectedDistrict, setSelectedDistrict] = useState("")
  const [selectedTaluk, setSelectedTaluk] = useState("")
  const [selectedService, setSelectedService] = useState("")
  const [selectedCenter, setSelectedCenter] = useState("")
  const [selectedDate, setSelectedDate] = useState("")
  const [selectedTime, setSelectedTime] = useState("")
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [nearestCenters, setNearestCenters] = useState<any[]>([])
  const [bookingComplete, setBookingComplete] = useState(false)
  const [locationBookings, setLocationBookings] = useState<any[]>([])
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
  })
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([])
  const [selectedCenterDistance, setSelectedCenterDistance] = useState<string | null>(null)

  // Known coordinates for popular centers (approximate). Used to compute shortest distance.
  const centerCoords: Record<string, { lat: number; lng: number }> = {
    "Chennai E-Seva Center - Ambattur": { lat: 13.1143, lng: 80.15 },
    "Ambattur Post Office": { lat: 13.1146, lng: 80.1545 },
    "Chennai GPO": { lat: 13.0837, lng: 80.2717 },
    "Egmore E-Services Hub": { lat: 13.0733, lng: 80.2606 },
    "Coimbatore Digital Center": { lat: 11.0168, lng: 76.9558 },
    "Coimbatore Head Post Office": { lat: 11.0016, lng: 76.9629 },
    "Madurai E-Services Hub - South": { lat: 9.9177, lng: 78.1198 },
    "Madurai Central Post Office": { lat: 9.9195, lng: 78.1195 },
    "Salem Technology Center": { lat: 11.6643, lng: 78.146 },
    "Salem Main Post Office": { lat: 11.6516, lng: 78.1607 },
    // Fallbacks for generic/default centers
    "District E-Center": { lat: 12.9716, lng: 77.5946 },
    "District Post Office": { lat: 12.9716, lng: 77.5946 },
  }

  const haversineKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // km
    const dLat = ((lat2 - lat1) * Math.PI) / 180
    const dLon = ((lon2 - lon1) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          })
          findNearestCenters(position.coords.latitude, position.coords.longitude)
        },
        (error) => {
          console.log("Location access denied")
        },
      )
    }
  }

  const findNearestCenters = (lat: number, lng: number) => {
    // Build list from currently available centers for the chosen taluk
    const centersInTaluk = getAvailableCenters()
    // Map to include distance when coords known; otherwise mark N/A
    const computed = centersInTaluk.map((name: string) => {
      const coords = centerCoords[name]
      if (coords) {
        const dKm = haversineKm(lat, lng, coords.lat, coords.lng)
        return {
          name,
          distance: `${dKm.toFixed(1)} km`,
          numericDistance: dKm,
          type: "Center",
          address: `${name}, ${selectedTaluk}, ${selectedDistrict}`,
        }
      }
      return {
        name,
        distance: "N/A",
        numericDistance: Number.POSITIVE_INFINITY,
        type: "Center",
        address: `${name}, ${selectedTaluk}, ${selectedDistrict}`,
      }
    })
    // Sort by numeric distance, unknowns (N/A) sink to the end
    computed.sort((a, b) => a.numericDistance - b.numericDistance)
    setNearestCenters(computed)
  }

  const handleBooking = async () => {
    if (
      selectedDistrict &&
      selectedTaluk &&
      selectedService &&
      selectedCenter &&
      selectedDate &&
      selectedTime &&
      formData.name &&
      formData.phone
    ) {
      const booking = {
        id: Date.now(),
        ...formData,
        district: selectedDistrict,
        taluk: selectedTaluk,
        service: selectedService,
        center: selectedCenter,
        date: selectedDate,
        time: selectedTime,
        status: "Confirmed",
      }

      const existingBookings = JSON.parse(localStorage.getItem("bookings") || "[]")
      existingBookings.push(booking)
      localStorage.setItem("bookings", JSON.stringify(existingBookings))

      setBookingComplete(true)
    }
  }

  const getAvailableCenters = () => {
    if (!selectedTaluk) return []
    return talukCenters[selectedTaluk as keyof typeof talukCenters] || talukCenters.default
  }

  const getAvailableTimeSlots = () => {
    if (!selectedDistrict || !selectedTaluk || !selectedCenter || !selectedDate) return []

    const slotSettings = JSON.parse(localStorage.getItem("slotSettings") || "{}")
    const key = `${selectedDistrict}|${selectedTaluk}|${selectedCenter}|${selectedDate}`
    const enabledSlots: string[] = slotSettings[key] || []

    const existingBookings = JSON.parse(localStorage.getItem("bookings") || "[]")
    const bookedSlots: string[] = existingBookings
      .filter(
        (b: any) =>
          b.date === selectedDate &&
          b.district === selectedDistrict &&
          b.taluk === selectedTaluk &&
          b.center === selectedCenter,
      )
      .map((b: any) => b.time)

    const availableSlots = enabledSlots.filter((slot: string) => !bookedSlots.includes(slot))
    const remaining = Math.max(25 - bookedSlots.length, 0) // enforce 25 slots per center/day safely
    return availableSlots.slice(0, remaining)
  }

  const getLocationBookings = () => {
    if (!selectedDistrict || !selectedTaluk || !selectedCenter) return []

    const existingBookings = JSON.parse(localStorage.getItem("bookings") || "[]")
    return existingBookings.filter(
      (booking: any) =>
        booking.district === selectedDistrict && booking.taluk === selectedTaluk && booking.center === selectedCenter,
    )
  }

  useEffect(() => {
    setLocationBookings(getLocationBookings())
  }, [selectedDistrict, selectedTaluk, selectedCenter])

  useEffect(() => {
    setAvailableTimeSlots(getAvailableTimeSlots())
  }, [selectedDistrict, selectedTaluk, selectedDate, selectedCenter]) // Added selectedTaluk dependency

  useEffect(() => {
    if (userLocation && selectedTaluk) {
      findNearestCenters(userLocation.lat, userLocation.lng)
    } else if (!userLocation) {
      setNearestCenters([])
    }
  }, [userLocation, selectedTaluk])

  useEffect(() => {
    // Compute distance to selected center when we have user location and a known center coordinate
    if (userLocation && selectedCenter) {
      const coords = centerCoords[selectedCenter]
      if (coords) {
        const d = haversineKm(userLocation.lat, userLocation.lng, coords.lat, coords.lng)
        setSelectedCenterDistance(`${d.toFixed(1)} km`)
      } else {
        setSelectedCenterDistance(null)
      }
    } else {
      setSelectedCenterDistance(null)
    }
  }, [userLocation, selectedCenter])

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardHeader className="text-center">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
            <CardTitle className="text-2xl text-green-700">Booking Confirmed!</CardTitle>
            <CardDescription>Your appointment has been successfully booked</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p>
                <strong>Service:</strong> {selectedService}
              </p>
              <p>
                <strong>Center:</strong> {selectedCenter}
              </p>
              <p>
                <strong>Date:</strong> {selectedDate}
              </p>
              <p>
                <strong>Time:</strong> {selectedTime}
              </p>
              <p>
                <strong>Location:</strong> {selectedDistrict}, {selectedTaluk}
              </p>
            </div>
            <Link href="/">
              <Button className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      <header className="bg-white shadow-sm border-b-4 border-blue-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">User Portal - Book Appointment</h1>
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Booking Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter your email"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter your address"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Service Type *</Label>
                  <Select value={selectedService} onValueChange={setSelectedService}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceTypes.map((service) => (
                        <SelectItem key={service} value={service}>
                          {service}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>District *</Label>
                  <Select
                    value={selectedDistrict}
                    onValueChange={(value) => {
                      setSelectedDistrict(value)
                      setSelectedTaluk("")
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

                {selectedDistrict && (
                  <div>
                    <Label>Taluk *</Label>
                    <Select value={selectedTaluk} onValueChange={setSelectedTaluk}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select taluk" />
                      </SelectTrigger>
                      <SelectContent>
                        {tamilNaduData[selectedDistrict as keyof typeof tamilNaduData]?.map((taluk) => (
                          <SelectItem key={taluk} value={taluk}>
                            {taluk}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {selectedTaluk && (
                  <div>
                    <Label>Service Center *</Label>
                    <Select value={selectedCenter} onValueChange={setSelectedCenter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select service center" />
                      </SelectTrigger>
                      <SelectContent>
                        {getAvailableCenters().map((center) => (
                          <SelectItem key={center} value={center}>
                            {center}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label htmlFor="date">Preferred Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    min={new Date().toISOString().split("T")[0]}
                  />
                  {/* Show availability badge for selected date/center */}
                  {selectedDate && selectedDistrict && selectedCenter && (
                    <p
                      className={`text-sm mt-1 ${availableTimeSlots.length === 0 ? "text-red-600" : "text-green-600"}`}
                    >
                      {availableTimeSlots.length === 0 ? "Not available" : "Available"}
                    </p>
                  )}
                </div>

                {selectedDistrict && selectedDate && selectedCenter && (
                  <div>
                    <Label>Preferred Time *</Label>
                    <Select value={selectedTime} onValueChange={setSelectedTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time slot" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTimeSlots.length > 0 ? (
                          availableTimeSlots.map((time) => (
                            <SelectItem key={time} value={time}>
                              {time}
                            </SelectItem>
                          ))
                        ) : (
                          // Clearer "Not available" state in time dropdown
                          <SelectItem value="not-available" disabled>
                            Not available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-gray-600 mt-1">
                      {availableTimeSlots.length} of 25 slots available at {selectedCenter} on {selectedDate}
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleBooking}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={
                    !selectedDistrict ||
                    !selectedTaluk ||
                    !selectedService ||
                    !selectedCenter ||
                    !selectedDate ||
                    !selectedTime ||
                    !formData.name ||
                    !formData.phone ||
                    availableTimeSlots.length === 0
                  }
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Book Appointment
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Location Services and Booking Details */}
          <div className="space-y-6">
            {/* Keeping only the Available Time Slots card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Available Time Slots
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedDistrict && selectedDate ? (
                  <div>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {availableTimeSlots.slice(0, 12).map((time) => (
                        <div key={time} className="p-2 text-center border rounded text-sm bg-green-50 border-green-200">
                          {time}
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">
                      {availableTimeSlots.length} slots available for {selectedDate}
                    </p>
                    {/* Emphasize not-available state here too */}
                    {availableTimeSlots.length === 0 && <p className="text-sm text-red-600 mt-2">Not available</p>}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">Select district and date to view available time slots</p>
                )}
              </CardContent>
            </Card>

            {selectedDistrict && selectedTaluk && selectedCenter && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">Existing Bookings at {selectedCenter}</CardTitle>
                  <CardDescription>
                    Current bookings for {selectedDistrict} - {selectedTaluk}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {locationBookings.length > 0 ? (
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {locationBookings
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((booking, index) => (
                          <div key={index} className="p-3 border rounded-lg bg-gray-50">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-sm">{booking.name}</p>
                                <p className="text-xs text-gray-600">{booking.service}</p>
                                <p className="text-xs text-blue-600">{booking.phone}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-medium">{booking.date}</p>
                                <p className="text-sm text-orange-600">{booking.time}</p>
                                <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                                  {booking.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-gray-500">No bookings found for this location</p>
                      <p className="text-sm text-gray-400">Be the first to book an appointment here!</p>
                    </div>
                  )}

                  {locationBookings.length > 0 && (
                    <div className="mt-4 pt-3 border-t">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Total Bookings:</span>
                        <span className="font-medium">{locationBookings.length}</span>
                      </div>
                      <div className="flex justify-between text-sm text-gray-600 mt-1">
                        <span>This Week:</span>
                        <span className="font-medium">
                          {
                            locationBookings.filter((booking) => {
                              const bookingDate = new Date(booking.date)
                              const today = new Date()
                              const weekStart = new Date(today.setDate(today.getDate() - today.getDay()))
                              return bookingDate >= weekStart
                            }).length
                          }
                        </span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
