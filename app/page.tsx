'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Mock data for room availability
const TIME_SLOTS = [
  '10:00 - 12:00',
  '12:00 - 14:00',
  '14:00 - 16:00',
  '16:00 - 18:00',
  '18:00 - 20:00',
  '20:00 - 22:00',
];

const ROOMS = [
  { id: 'room1', name: 'ห้องที่ 1' },
  { id: 'room2', name: 'ห้องที่ 2' },
];

// Mock availability data - in real app, this would come from API
const getAvailableRooms = (timeSlot: string): string[] => {
  // Simulate availability - you can modify this logic
  const mockAvailability: Record<string, string[]> = {
    '10:00 - 12:00': ['room1', 'room2'],
    '12:00 - 14:00': ['room1'],
    '14:00 - 16:00': ['room2'],
    '16:00 - 18:00': ['room1', 'room2'],
    '18:00 - 20:00': ['room1'],
    '20:00 - 22:00': ['room2'],
  };
  return mockAvailability[timeSlot] || [];
};

export default function HomePage() {
  const router = useRouter();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('');
  const [availableRooms, setAvailableRooms] = useState<string[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>('');

  useEffect(() => {
    if (selectedTimeSlot) {
      const rooms = getAvailableRooms(selectedTimeSlot);
      setAvailableRooms(rooms);
      setSelectedRoom(''); // Reset room selection when time changes
    } else {
      setAvailableRooms([]);
      setSelectedRoom('');
    }
  }, [selectedTimeSlot]);

  const handleContinue = () => {
    if (selectedTimeSlot && selectedRoom) {
      // Store selection in sessionStorage to pass to next page
      sessionStorage.setItem('bookingData', JSON.stringify({
        timeSlot: selectedTimeSlot,
        roomId: selectedRoom,
        roomName: ROOMS.find(r => r.id === selectedRoom)?.name || '',
      }));
      router.push('/booking');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Queue Master</h1>
          <p className="text-lg text-gray-600">ระบบจองห้องสำหรับร้านอาหาร</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">เลือกช่วงเวลาและห้อง</h2>

          {/* Time Slot Selection */}
          <div className="mb-8">
            <label htmlFor="timeSlot" className="block text-sm font-medium text-gray-700 mb-2">
              เลือกช่วงเวลา
            </label>
            <select
              id="timeSlot"
              value={selectedTimeSlot}
              onChange={(e) => setSelectedTimeSlot(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
            >
              <option value="">-- เลือกช่วงเวลา --</option>
              {TIME_SLOTS.map((slot) => (
                <option key={slot} value={slot}>
                  {slot}
                </option>
              ))}
            </select>
          </div>

          {/* Available Rooms */}
          {selectedTimeSlot && (
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                ห้องที่ว่างในช่วงเวลา {selectedTimeSlot}
              </label>
              {availableRooms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {availableRooms.map((roomId) => {
                    const room = ROOMS.find(r => r.id === roomId);
                    const isSelected = selectedRoom === roomId;
                    return (
                      <button
                        key={roomId}
                        onClick={() => setSelectedRoom(roomId)}
                        className={`p-6 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-indigo-500 bg-indigo-50 shadow-md'
                            : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="text-center">
                          <div className={`text-2xl mb-2 ${isSelected ? 'text-indigo-600' : 'text-gray-600'}`}>
                            🏠
                          </div>
                          <div className={`font-semibold ${isSelected ? 'text-indigo-700' : 'text-gray-700'}`}>
                            {room?.name}
                          </div>
                          {isSelected && (
                            <div className="mt-2 text-sm text-indigo-600">✓ เลือกแล้ว</div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">ไม่มีห้องว่างในช่วงเวลานี้</p>
                </div>
              )}
            </div>
          )}

          {/* Continue Button */}
          {selectedTimeSlot && selectedRoom && (
            <div className="mt-8">
              <button
                onClick={handleContinue}
                className="w-full bg-indigo-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
              >
                ดำเนินการต่อ →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

