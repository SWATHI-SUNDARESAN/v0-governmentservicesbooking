import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MapPin, Users, Clock, Shield } from "lucide-react"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-4 border-orange-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Tamil Nadu e-Services</h1>
                <p className="text-sm text-gray-600">Government Document Services Portal</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Book Your Document Services</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Online booking for Aadhaar updates, Voter ID registration, and Ration Card services across Tamil Nadu
            districts with location-based center finding
          </p>
        </div>

        {/* Service Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <CardTitle>Aadhaar Services</CardTitle>
              <CardDescription>Update address, mobile number, and other Aadhaar details</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <CardTitle>Voter ID Services</CardTitle>
              <CardDescription>New voter registration and voter ID corrections</CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-orange-600" />
              </div>
              <CardTitle>Ration Card Services</CardTitle>
              <CardDescription>Apply for new ration cards and update existing details</CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Portal Access */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card className="border-2 border-blue-200 hover:border-blue-400 transition-colors">
            <CardHeader>
              <CardTitle className="text-2xl text-blue-700">User Portal</CardTitle>
              <CardDescription className="text-lg">Book appointments and find nearest service centers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span>Find nearest centers with GPS</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-blue-600" />
                  <span>25 time slots available daily</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span>All Tamil Nadu districts covered</span>
                </div>
                <Link href="/user-portal">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">Access User Portal</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200 hover:border-orange-400 transition-colors">
            <CardHeader>
              <CardTitle className="text-2xl text-orange-700">Admin Portal</CardTitle>
              <CardDescription className="text-lg">Manage slots and view booking statistics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Shield className="w-5 h-5 text-orange-600" />
                  <span>Secure admin access</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-orange-600" />
                  <span>Manage daily time slots</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-orange-600" />
                  <span>View booking analytics</span>
                </div>
                <Link href="/admin-portal">
                  <Button className="w-full bg-orange-600 hover:bg-orange-700">Access Admin Portal</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2024 Government of Tamil Nadu. All rights reserved.</p>
          <p className="text-gray-400 mt-2">Developed for citizen convenience</p>
        </div>
      </footer>
    </div>
  )
}
