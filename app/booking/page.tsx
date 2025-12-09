'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface BookingData {
  date?: string;
  bookingType?: string;
  bookingTypeName?: string;
  bookingTypeAdditionalPrice?: number;
  timeSlot: string;
  startTime?: string;
  endTime?: string;
  roomId: string;
  roomName: string;
}

interface RoomData {
  id: string;
  name: string;
  pricePerHour: number;
}

export default function BookingPage() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [roomData, setRoomData] = useState<RoomData | null>(null);
  const [hours, setHours] = useState<number>(0);
  const [roomPrice, setRoomPrice] = useState<number>(0);
  const [additionalPrice, setAdditionalPrice] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [isLoadingPrice, setIsLoadingPrice] = useState<boolean>(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Calculate hours from start and end time
  const calculateHours = (startTime: string, endTime: string): number => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    const diffMinutes = endMinutes - startMinutes;
    return diffMinutes / 60;
  };

  useEffect(() => {
    // Get booking data from sessionStorage
    const stored = sessionStorage.getItem('bookingData');
    if (stored) {
      const data = JSON.parse(stored);
      setBookingData(data);
      
      // Calculate hours and fetch room price
      if (data.startTime && data.endTime && data.roomId) {
        const calculatedHours = calculateHours(data.startTime, data.endTime);
        setHours(calculatedHours);
        
        // Fetch room data
        fetchRoomPrice(data.roomId);
      }
    } else {
      // If no booking data, redirect to home
      router.push('/');
    }
  }, [router]);

  const fetchRoomPrice = async (roomId: string) => {
    setIsLoadingPrice(true);
    try {
      const response = await fetch(`/api/rooms?roomId=${encodeURIComponent(roomId)}`);
      const data = await response.json();
      
      if (response.ok && data.room) {
        setRoomData(data.room);
        const roomPricePerHour = data.room.pricePerHour || 0;
        setRoomPrice(roomPricePerHour);
      } else {
        console.error('Error fetching room price:', data.error);
      }
    } catch (error) {
      console.error('Error fetching room price:', error);
    } finally {
      setIsLoadingPrice(false);
    }
  };

  // Calculate total price when hours, room price, or additional price changes
  useEffect(() => {
    if (hours > 0 && roomPrice > 0 && bookingData) {
      const additionalPricePerHour = bookingData.bookingTypeAdditionalPrice || 0;
      const roomTotal = roomPrice * hours;
      const additionalTotal = additionalPricePerHour * hours;
      const total = roomTotal + additionalTotal;
      setAdditionalPrice(additionalPricePerHour);
      setTotalPrice(total);
    }
  }, [hours, roomPrice, bookingData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setReceiptFile(file);
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName || !lastName || !bookingData) {
      setError('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }
    
    if (!receiptFile) {
      setError('กรุณาแนบรูปใบเสร็จที่ทำการชำระเงิน');
      return;
    }
    
    // Note: Receipt upload is optional for now since Airtable doesn't support data URLs
    // In production, implement file upload to storage service (S3, Cloudinary, etc.)

    setIsSubmitting(true);

    try {
      // Prepare request body
      const requestBody: any = {
        firstName,
        lastName,
        date: bookingData.date,
        bookingType: bookingData.bookingType,
        bookingTypeName: bookingData.bookingTypeName,
        timeSlot: bookingData.timeSlot,
        startTime: bookingData.startTime,
        endTime: bookingData.endTime,
        roomId: bookingData.roomId,
        roomName: bookingData.roomName,
        totalPrice: totalPrice,
      };

      // Upload receipt image if provided
      if (receiptFile) {
        try {
          // Convert file to base64
          const fileBase64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const base64String = (reader.result as string).split(',')[1];
              resolve(base64String);
            };
            reader.onerror = reject;
            reader.readAsDataURL(receiptFile);
          });

          // Upload to storage service (Imgur or Cloudinary)
          // Try Cloudinary first (more reliable), fallback to Imgur
          let uploadResponse;
          let uploadData;
          
          // Try Cloudinary first
          try {
            uploadResponse = await fetch('/api/upload-cloudinary', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                imageBase64: fileBase64,
                imageType: receiptFile.type,
              }),
            });
            uploadData = await uploadResponse.json();
            
            // If Cloudinary fails, try Imgur as fallback
            if (!uploadResponse.ok) {
              console.log('Cloudinary upload failed, trying Imgur...');
              try {
                uploadResponse = await fetch('/api/upload', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    imageBase64: fileBase64,
                    imageType: receiptFile.type,
                  }),
                });
                uploadData = await uploadResponse.json();
              } catch (imgurError) {
                console.error('Error uploading to Imgur:', imgurError);
                uploadData = { error: 'ไม่สามารถอัปโหลดรูปใบเสร็จได้' };
              }
            }
          } catch (err) {
            // If Cloudinary API doesn't exist, try Imgur
            console.log('Cloudinary not available, trying Imgur...');
            try {
              uploadResponse = await fetch('/api/upload', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  imageBase64: fileBase64,
                  imageType: receiptFile.type,
                }),
              });
              uploadData = await uploadResponse.json();
            } catch (imgurError) {
              console.error('Error uploading to Imgur:', imgurError);
              uploadData = { error: 'ไม่สามารถอัปโหลดรูปใบเสร็จได้' };
            }
          }

          if (uploadResponse && uploadResponse.ok && uploadData.imageUrl) {
            requestBody.receiptUrl = uploadData.imageUrl;
            requestBody.receiptFileName = receiptFile.name;
            console.log('Receipt uploaded successfully:', uploadData.imageUrl);
          } else {
            const errorMsg = uploadData.error || uploadData.details || 'ไม่สามารถอัปโหลดรูปใบเสร็จได้';
            console.warn('Failed to upload receipt image:', uploadData);
            // Show warning but continue without receipt
            if (uploadData.error === 'Imgur Client ID ไม่ได้ตั้งค่า') {
              setError(`คำเตือน: ${errorMsg} - ข้อมูลการจองจะถูกบันทึกโดยไม่มีรูปใบเสร็จ`);
            } else {
              setError(`คำเตือน: ${errorMsg} - ข้อมูลการจองจะถูกบันทึกโดยไม่มีรูปใบเสร็จ`);
            }
            // Continue without receipt if upload fails
          }
        } catch (uploadError) {
          console.error('Error uploading receipt:', uploadError);
          setError('คำเตือน: ไม่สามารถอัปโหลดรูปใบเสร็จได้ แต่จะบันทึกข้อมูลการจองไว้');
          // Continue without receipt if upload fails
        }
      }
      
      // Call API to save to Airtable
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.details || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
      }

      setSuccess(true);
      // Clear session storage
      sessionStorage.removeItem('bookingData');
      
      // Redirect to home after 3 seconds
      setTimeout(() => {
        router.push('/');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'เกิดข้อผิดพลาดในการบันทึกข้อมูล');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">กำลังโหลด...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center py-4 px-3 sm:py-8 sm:px-4 md:py-12 md:px-6">
        <div className="bg-white rounded-lg shadow-xl p-6 sm:p-8 max-w-md w-full text-center mx-4">
          <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">🎵</div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">บันทึกข้อมูลสำเร็จ!</h2>
          <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 px-2">ข้อมูลการจองห้องซ้อมดนตรีของคุณถูกบันทึกเรียบร้อยแล้ว</p>
          <p className="text-xs sm:text-sm text-gray-500">กำลังกลับไปหน้าแรก...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 px-3 sm:py-8 sm:px-4 md:py-12 md:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-4 sm:mb-6 md:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-2">กรอกข้อมูลการจอง</h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600 px-2">กรุณากรอกข้อมูลเพิ่มเติมเพื่อลงทะเบียนจองห้องซ้อมดนตรี</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 md:p-8">
          {/* Display Selected Time and Room */}
          <div className="mb-4 sm:mb-6 md:mb-8 p-4 sm:p-6 bg-indigo-50 rounded-lg border border-indigo-200">
            <h3 className="text-base sm:text-lg font-semibold text-indigo-900 mb-2 sm:mb-3">ข้อมูลการจองที่เลือก</h3>
            <div className="space-y-2 text-gray-700 text-sm sm:text-base">
              {bookingData.date && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
                  <span className="font-medium sm:w-24">วันที่:</span>
                  <span className="break-words">{new Date(bookingData.date).toLocaleDateString('th-TH', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}</span>
                </div>
              )}
              {bookingData.bookingTypeName && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
                  <span className="font-medium sm:w-24">ประเภท:</span>
                  <span>{bookingData.bookingTypeName}</span>
                </div>
              )}
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
                <span className="font-medium sm:w-24">ช่วงเวลา:</span>
                <span>{bookingData.timeSlot}</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
                <span className="font-medium sm:w-24">ห้อง:</span>
                <span>{bookingData.roomName}</span>
              </div>
            </div>
          </div>

          {/* Price Calculation */}
          {isLoadingPrice ? (
            <div className="mb-4 sm:mb-6 md:mb-8 p-4 sm:p-6 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-gray-500 text-center text-sm sm:text-base">กำลังคำนวณราคา...</p>
            </div>
          ) : hours > 0 && roomPrice > 0 && (
            <div className="mb-4 sm:mb-6 md:mb-8 p-4 sm:p-6 bg-green-50 rounded-lg border border-green-200">
              <h3 className="text-base sm:text-lg font-semibold text-green-900 mb-3 sm:mb-4">รายละเอียดการคำนวณราคา</h3>
              <div className="space-y-2 sm:space-y-3 text-gray-700 text-sm sm:text-base">
                <div className="flex justify-between items-center">
                  <span className="text-sm">จำนวนชั่วโมง:</span>
                  <span className="font-semibold">{hours.toFixed(2)} ชั่วโมง</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">ราคาห้อง ({roomData?.name || bookingData.roomName}):</span>
                  <span className="font-semibold">{roomPrice.toLocaleString('th-TH')} บาท/ชั่วโมง</span>
                </div>
                {bookingData.bookingTypeName && additionalPrice > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm">ราคาเพิ่มเติม ({bookingData.bookingTypeName}):</span>
                    <span className="font-semibold">{additionalPrice.toLocaleString('th-TH')} บาท/ชั่วโมง</span>
                  </div>
                )}
                <div className="border-t border-green-300 pt-2 sm:pt-3 mt-2 sm:mt-3">
                  <div className="flex justify-between items-center flex-wrap gap-1">
                    <span className="text-sm sm:text-base font-semibold">ยอดรวม:</span>
                    <span className="text-lg sm:text-xl font-bold text-green-700">{totalPrice.toLocaleString('th-TH')} บาท</span>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 mt-1 sm:mt-2 break-words">
                    ({hours.toFixed(2)} ชั่วโมง × {roomPrice.toLocaleString('th-TH')} บาท)
                    {additionalPrice > 0 && ` + (${hours.toFixed(2)} ชั่วโมง × ${additionalPrice.toLocaleString('th-TH')} บาท)`}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bank Account Information */}
          <div className="mb-4 sm:mb-6 md:mb-8 p-4 sm:p-6 bg-red-50 rounded-lg border-2 border-red-300">
            <h3 className="text-base sm:text-lg font-semibold text-red-900 mb-2 sm:mb-3">ข้อมูลการโอนเงิน</h3>
            <p className="text-red-800 font-medium mb-3 sm:mb-4 text-sm sm:text-base">กรุณาโอนเงิน และแนบใบเสร็จ</p>
            <div className="space-y-2 text-red-900 text-sm sm:text-base">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
                <span className="font-medium sm:w-32">เลขที่บัญชี:</span>
                <span className="font-semibold text-base sm:text-lg break-all">405-487-2681</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
                <span className="font-medium sm:w-32">ชื่อ:</span>
                <span className="font-semibold break-words">นายณัฐพงศ์ นาคอุดม</span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-0">
                <span className="font-medium sm:w-32">ธนาคาร:</span>
                <span className="font-semibold">ไทยพานิชย์</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                ชื่อ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base sm:text-lg"
                placeholder="กรุณากรอกชื่อ"
              />
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                นามสกุล <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base sm:text-lg"
                placeholder="กรุณากรอกนามสกุล"
              />
            </div>

            {/* Receipt Upload - Required */}
            <div>
              <label htmlFor="receipt" className="block text-sm font-medium text-gray-700 mb-2">
                แนบรูปใบเสร็จที่ทำการชำระเงิน <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                id="receipt"
                accept="image/*"
                onChange={handleFileChange}
                required
                className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm sm:text-base file:mr-2 sm:file:mr-4 file:py-1.5 sm:file:py-2 file:px-2 sm:file:px-4 file:rounded-lg file:border-0 file:text-xs sm:file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {receiptPreview && (
                <div className="mt-3 sm:mt-4">
                  <p className="text-xs sm:text-sm text-gray-600 mb-2">ตัวอย่างรูปภาพ:</p>
                  <img
                    src={receiptPreview}
                    alt="Receipt preview"
                    className="max-w-full h-auto rounded-lg border border-gray-300"
                  />
                </div>
              )}
              <p className="mt-2 text-xs text-gray-500">
                หมายเหตุ: ใบเสร็จเป็นข้อมูลบังคับ จะถูกอัปโหลดไปยัง Cloudinary/Imgur และบันทึกลง Airtable
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 bg-gray-200 text-gray-700 py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base md:text-lg hover:bg-gray-300 transition-colors"
              >
                ← ย้อนกลับ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-indigo-600 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg font-semibold text-sm sm:text-base md:text-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

