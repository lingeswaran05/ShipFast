import { useState, useEffect } from 'react';
import { Search, Package, MapPin, Clock, CheckCircle, Truck, ArrowLeft, Image as ImageIcon } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Logo } from '../ui/Logo';

export function TrackingPortal() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [trackingNumber, setTrackingNumber] = useState('');
  const [trackingResult, setTrackingResult] = useState(false);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id) {
      setTrackingNumber(id);
      setTrackingResult(true);
    }
  }, [searchParams]);

  const handleTrack = (e) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      setTrackingResult(true);
    }
  };



  const handleBack = () => {
    navigate(-1);
  };

  const mockTrackingData = [
    {
      status: 'Delivered',
      location: 'Mumbai, Maharashtra',
      timestamp: '2025-12-15 10:30 AM',
      description: 'Package delivered successfully. Signed by receiver.',
    },
    {
      status: 'Out for Delivery',
      location: 'Mumbai Hub',
      timestamp: '2025-12-15 08:00 AM',
      description: 'Package is out for delivery. Expected delivery by end of day.',
    },
    {
      status: 'In Transit',
      location: 'Delhi Hub',
      timestamp: '2025-12-14 06:00 PM',
      description: 'Package departed from Delhi hub.',
    },
    {
      status: 'In Transit',
      location: 'Delhi Hub',
      timestamp: '2025-12-14 02:00 PM',
      description: 'Package arrived at Delhi hub.',
    },
    {
      status: 'Booked',
      location: 'Bangalore Branch',
      timestamp: '2025-12-14 10:00 AM',
      description: 'Shipment booking confirmed. Package received at origin.',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 transition-colors duration-500">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Logo />
            <div className="flex gap-2">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <h1 className="text-slate-800 mb-2 text-3xl font-bold">Track Your Shipment</h1>
          <p className="text-slate-600">Enter your tracking number to see real-time updates</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-slate-100">
          <form onSubmit={handleTrack} className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number (e.g., SF123456789)"
                className="w-full pl-12 pr-4 py-4 border-2 border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-slate-900 placeholder-slate-400"
              />
            </div>
            <button
              type="submit"
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-xl hover:from-purple-700 hover:to-pink-600 transition-all font-semibold shadow-lg shadow-purple-500/30"
            >
              Track
            </button>
          </form>
        </div>

        {trackingResult && (
          <div className="space-y-6 animate-fade-in-up">
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="text-slate-600 mb-1">Tracking Number</div>
                  <div className="text-slate-800 font-bold text-xl">{trackingNumber || 'SF123456789'}</div>
                </div>
                <div className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold">
                  Delivered
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6 mb-6">
                <div>
                  <div className="text-slate-600 mb-1">Origin</div>
                  <div className="text-slate-800 font-semibold">Bangalore, Karnataka</div>
                </div>
                <div>
                  <div className="text-slate-600 mb-1">Destination</div>
                  <div className="text-slate-800 font-semibold">Mumbai, Maharashtra</div>
                </div>
                <div>
                  <div className="text-slate-600 mb-1">Service Type</div>
                  <div className="text-slate-800 font-semibold">Express Delivery</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="text-slate-600 mb-1">Booking Date</div>
                  <div className="text-slate-800 font-semibold">Dec 14, 2025</div>
                </div>
                <div>
                  <div className="text-slate-600 mb-1">Delivery Date</div>
                  <div className="text-slate-800 font-semibold">Dec 15, 2025</div>
                </div>
                <div>
                  <div className="text-slate-600 mb-1">Weight</div>
                  <div className="text-slate-800 font-semibold">2.5 kg</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
              <h2 className="text-slate-800 mb-6 font-bold text-xl">Shipment Journey</h2>
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Package className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-slate-800 font-semibold">Booked</div>
                  <div className="text-slate-500">Dec 14</div>
                </div>
                <div className="flex-1 h-1 bg-green-200 mx-2"></div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Truck className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-slate-800 font-semibold">In Transit</div>
                  <div className="text-slate-500">Dec 14</div>
                </div>
                <div className="flex-1 h-1 bg-green-200 mx-2"></div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <MapPin className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-slate-800 font-semibold">Out for Delivery</div>
                  <div className="text-slate-500">Dec 15</div>
                </div>
                <div className="flex-1 h-1 bg-green-200 mx-2"></div>
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-slate-800 font-semibold">Delivered</div>
                  <div className="text-slate-500">Dec 15</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
              <h2 className="text-slate-800 mb-6 font-bold text-xl">Tracking History</h2>
              <div className="space-y-6">
                {mockTrackingData.map((event, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        index === 0 ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        {index === 0 ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <Clock className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      {index < mockTrackingData.length - 1 && (
                        <div className="w-0.5 h-full bg-slate-200 my-1"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-start justify-between mb-1">
                        <div className="text-slate-800 font-semibold">{event.status}</div>
                        <div className="text-slate-500">{event.timestamp}</div>
                      </div>
                      <div className="text-slate-600 mb-1">{event.location}</div>
                      <div className="text-slate-500 text-sm">{event.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
              <h2 className="text-slate-800 mb-6 font-bold text-xl">Proof of Delivery</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <div className="text-slate-600 mb-2">Received By</div>
                  <div className="text-slate-800 font-semibold">Jane Smith</div>
                </div>
                <div>
                  <div className="text-slate-600 mb-2">Signature</div>
                  <div className="text-slate-800 font-semibold">Digital Signature Captured</div>
                </div>
                <div className="col-span-2">
                  <div className="text-slate-600 mb-3">Delivery Photo</div>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:bg-slate-50 transition-colors">
                    <ImageIcon className="w-12 h-12 text-slate-400 mx-auto mb-2" />
                    <div className="text-slate-600">Delivery photo available</div>
                    <button className="mt-3 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors font-semibold">
                      View Photo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {!trackingResult && (
          <div className="text-center text-slate-500 mt-12 animate-fade-in-up">
            <Package className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <p>Enter a tracking number to view shipment details</p>
          </div>
        )}
      </main>
    </div>
  );
}
