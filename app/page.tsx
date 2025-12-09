'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Time options for dropdowns
const TIME_OPTIONS = [
  '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
  '16:00', '17:00', '18:00', '19:00', '20:00', '21:00', '22:00', '23:00',
];

const ROOMS = [
  { id: 'room1', name: 'ห้องซ้อมดนตรีที่ 1' },
  { id: 'room2', name: 'ห้องซ้อมดนตรีที่ 2' },
];

// Get minimum date (today)
const getMinDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

// Get maximum date (30 days from today)
const getMaxDate = () => {
  const today = new Date();
  const maxDate = new Date(today);
  maxDate.setDate(today.getDate() + 30);
  return maxDate.toISOString().split('T')[0];
};

interface BookingType {
  id: string;
  name: string;
  additionalPricePerHour: number;
}

export default function HomePage() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [startTime, setStartTime] = useState<string>('');
  const [endTime, setEndTime] = useState<string>('');
  const [confirmedTimeSlot, setConfirmedTimeSlot] = useState<string>('');
  const [availableRooms, setAvailableRooms] = useState<string[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<string>('');
  const [bookingTypes, setBookingTypes] = useState<BookingType[]>([]);
  const [selectedBookingType, setSelectedBookingType] = useState<string>('');
  const [isLoadingRooms, setIsLoadingRooms] = useState<boolean>(false);
  const [roomError, setRoomError] = useState<string | null>(null);
  const [isLoadingBookingTypes, setIsLoadingBookingTypes] = useState<boolean>(false);

  const minDate = getMinDate();
  const maxDate = getMaxDate();

  // Fetch booking types on component mount
  useEffect(() => {
    const fetchBookingTypes = async () => {
      setIsLoadingBookingTypes(true);
      try {
        const response = await fetch('/api/booking-types');
        const data = await response.json();
        
        if (response.ok) {
          setBookingTypes(data.bookingTypes || []);
        } else {
          console.error('Error fetching booking types:', data.error);
        }
      } catch (error) {
        console.error('Error fetching booking types:', error);
      } finally {
        setIsLoadingBookingTypes(false);
      }
    };
    
    fetchBookingTypes();
  }, []);

  useEffect(() => {
    // Reset confirmed time slot when date or times change
    setConfirmedTimeSlot('');
    setAvailableRooms([]);
    setSelectedRoom('');
    setSelectedBookingType('');
  }, [selectedDate, startTime, endTime]);

  const handleConfirmTime = async () => {
    if (selectedDate && startTime && endTime) {
      if (startTime >= endTime) {
        alert('เวลาเริ่มต้นต้องน้อยกว่าเวลาสิ้นสุด');
        return;
      }
      const timeSlot = `${startTime} - ${endTime}`;
      setConfirmedTimeSlot(timeSlot);
      setSelectedRoom('');
      setRoomError(null);
      setIsLoadingRooms(true);

      try {
        // Format date to YYYY-MM-DD
        const dateValue = selectedDate.includes('T') ? selectedDate.split('T')[0] : selectedDate;
        
        // Fetch available rooms from API (send both timeSlot and startTime/endTime for overlap checking)
        const response = await fetch(
          `/api/availability?date=${encodeURIComponent(dateValue)}&timeSlot=${encodeURIComponent(timeSlot)}&startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`
        );
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || data.details || 'ไม่สามารถตรวจสอบความพร้อมของห้องได้');
        }
        
        setAvailableRooms(data.availableRooms || []);
      } catch (error) {
        console.error('Error fetching available rooms:', error);
        setRoomError(error instanceof Error ? error.message : 'ไม่สามารถตรวจสอบความพร้อมของห้องได้');
        setAvailableRooms([]);
      } finally {
        setIsLoadingRooms(false);
      }
    }
  };

  const handleContinue = () => {
    if (confirmedTimeSlot && selectedRoom && selectedDate) {
      // Store selection in sessionStorage to pass to next page
      const selectedType = bookingTypes.find(bt => bt.id === selectedBookingType);
      sessionStorage.setItem('bookingData', JSON.stringify({
        date: selectedDate,
        bookingType: selectedBookingType,
        bookingTypeName: selectedType?.name || '',
        bookingTypeAdditionalPrice: selectedType?.additionalPricePerHour || 0,
        timeSlot: confirmedTimeSlot,
        startTime,
        endTime,
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
          <p className="text-lg text-gray-600">ระบบจองห้องซ้อมดนตรี</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">เลือกช่วงเวลาและห้อง</h2>

          {/* Date Selection */}
          <div className="mb-6">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
              เลือกวันที่
            </label>
            <input
              type="date"
              id="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={minDate}
              max={maxDate}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
            />
          </div>

          {/* Time Selection */}
          {selectedDate && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                เลือกเวลา
              </label>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="startTime" className="block text-xs text-gray-600 mb-1">
                    เวลาเริ่มต้น
                  </label>
                  <select
                    id="startTime"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                  >
                    <option value="">-- เลือกเวลา --</option>
                    {TIME_OPTIONS.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="endTime" className="block text-xs text-gray-600 mb-1">
                    เวลาสิ้นสุด
                  </label>
                  <select
                    id="endTime"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                  >
                    <option value="">-- เลือกเวลา --</option>
                    {TIME_OPTIONS.map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {startTime && endTime && !confirmedTimeSlot && (
                <button
                  onClick={handleConfirmTime}
                  disabled={isLoadingRooms}
                  className="w-full bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoadingRooms ? 'กำลังตรวจสอบ...' : 'ยืนยันเวลา'}
                </button>
              )}
              {confirmedTimeSlot && (
                <div className="mt-4 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <p className="text-sm text-indigo-700">
                    <span className="font-semibold">เวลาที่เลือก:</span> {confirmedTimeSlot}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Booking Type Selection */}
          {confirmedTimeSlot && (
            <div className="mb-6">
              <label htmlFor="bookingType" className="block text-sm font-medium text-gray-700 mb-2">
                เลือกประเภทการจอง
              </label>
              {isLoadingBookingTypes ? (
                <div className="text-center py-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-500 text-sm">กำลังโหลดประเภทการจอง...</p>
                </div>
              ) : bookingTypes.length > 0 ? (
                <select
                  id="bookingType"
                  value={selectedBookingType}
                  onChange={(e) => setSelectedBookingType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                >
                  <option value="">-- เลือกประเภทการจอง --</option>
                  {bookingTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-center py-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-yellow-700 text-sm">ไม่พบข้อมูลประเภทการจอง</p>
                </div>
              )}
            </div>
          )}

          {/* Available Rooms */}
          {confirmedTimeSlot && selectedBookingType && (
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-700 mb-4">
                ห้องที่ว่างในช่วงเวลา {confirmedTimeSlot}
              </label>
              {isLoadingRooms ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">กำลังตรวจสอบความพร้อมของห้อง...</p>
                </div>
              ) : roomError ? (
                <div className="text-center py-8 bg-red-50 rounded-lg border border-red-200">
                  <p className="text-red-700">{roomError}</p>
                  <button
                    onClick={handleConfirmTime}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    ลองอีกครั้ง
                  </button>
                </div>
              ) : availableRooms.length > 0 ? (
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
                            🎵
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
          {confirmedTimeSlot && selectedBookingType && selectedRoom && (
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

