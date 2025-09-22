"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MapPin, Clock, Navigation, CheckCircle, ArrowLeft, Users } from "lucide-react"
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
    const mockCenters = [
      { name: "Chennai E-Seva Center", distance: "2.5 km", type: "E-Center", address: "Anna Salai, Chennai" },
      { name: "Chennai GPO", distance: "3.2 km", type: "Post Office", address: "Rajaji Salai, Chennai" },
      { name: "Coimbatore Digital Center", distance: "15.8 km", type: "E-Center", address: "RS Puram, Coimbatore" },
      { name: "Salem Technology Center", distance: "25.4 km", type: "E-Center", address: "Fort Main Road, Salem" },
    ]
    setNearestCenters(mockCenters.sort((a, b) => Number.parseFloat(a.distance) - Number.parseFloat(b.distance)))
  }

  const handleBooking = () => {
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

      // Save to localStorage
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
    if (!selectedDistrict || !selectedDate || !selectedCenter) return []

    const slotSettings = JSON.parse(localStorage.getItem("slotSettings") || "{}")
    const key = `${selectedDistrict}-${selectedDate}`
    const enabledSlots = slotSettings[key] || []

    const existingBookings = JSON.parse(localStorage.getItem("bookings") || "[]")
    const bookedSlots = existingBookings
      .filter((b: any) => b.date === selectedDate && b.district === selectedDistrict && b.center === selectedCenter)
      .map((b: any) => b.time)

    const availableSlots = enabledSlots.filter((slot: string) => !bookedSlots.includes(slot))

    return availableSlots.slice(0, 25 - bookedSlots.length)
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
  }, [selectedDistrict, selectedDate, selectedCenter]) // Added selectedCenter dependency

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
                    <p className="text-sm text-gray-600 mt-1">Centers available in {selectedTaluk} taluk</p>
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
                          <SelectItem value="" disabled>
                            No slots available for this date/center
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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Find Nearest Centers
                </CardTitle>
                <CardDescription>Use your location to find the closest service centers</CardDescription>
              </CardHeader>
              <CardContent>
                <Button onClick={getUserLocation} className="w-full mb-4">
                  <Navigation className="w-4 h-4 mr-2" />
                  Get My Location
                </Button>

                {nearestCenters.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-semibold">Nearest Centers:</h4>
                    {nearestCenters.slice(0, 3).map((center, index) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{center.name}</p>
                            <p className="text-sm text-gray-600">{center.address}</p>
                            <p className="text-sm text-blue-600">{center.type}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-green-600">{center.distance}</p>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(`https://maps.google.com/maps?q=${center.address}`, "_blank")}
                            >
                              Directions
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

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
                    {availableTimeSlots.length === 0 && (
                      <p className="text-sm text-red-600 mt-2">
                        No slots have been enabled by admin for this date. Please select a different date.
                      </p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">Select district and date to view available time slots</p>
                )}
              </CardContent>
            </Card>

            {selectedDistrict && selectedTaluk && selectedCenter && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    Existing Bookings at {selectedCenter}
                  </CardTitle>
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
                      <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
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
