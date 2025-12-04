'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface BookingData {
  timeSlot: string;
  roomId: string;
  roomName: string;
}

export default function BookingPage() {
  const router = useRouter();
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Get booking data from sessionStorage
    const stored = sessionStorage.getItem('bookingData');
    if (stored) {
      setBookingData(JSON.parse(stored));
    } else {
      // If no booking data, redirect to home
      router.push('/');
    }
  }, [router]);

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
    
    // Note: Receipt upload is optional for now since Airtable doesn't support data URLs
    // In production, implement file upload to storage service (S3, Cloudinary, etc.)

    setIsSubmitting(true);

    try {
      // Prepare request body
      const requestBody: any = {
        firstName,
        lastName,
        timeSlot: bookingData.timeSlot,
        roomId: bookingData.roomId,
        roomName: bookingData.roomName,
      };

      // Note: Receipt upload is optional since Airtable doesn't support data URLs
      // In production, implement file upload to storage service (S3, Cloudinary, etc.)
      // For now, we skip receipt file upload
      
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
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">บันทึกข้อมูลสำเร็จ!</h2>
          <p className="text-gray-600 mb-4">ข้อมูลการจองของคุณถูกบันทึกเรียบร้อยแล้ว</p>
          <p className="text-sm text-gray-500">กำลังกลับไปหน้าแรก...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">กรอกข้อมูลการจอง</h1>
          <p className="text-lg text-gray-600">กรุณากรอกข้อมูลเพิ่มเติมเพื่อลงทะเบียนจองห้อง</p>
        </div>

        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Display Selected Time and Room */}
          <div className="mb-8 p-6 bg-indigo-50 rounded-lg border border-indigo-200">
            <h3 className="text-lg font-semibold text-indigo-900 mb-3">ข้อมูลการจองที่เลือก</h3>
            <div className="space-y-2 text-gray-700">
              <div className="flex items-center">
                <span className="font-medium w-24">ช่วงเวลา:</span>
                <span>{bookingData.timeSlot}</span>
              </div>
              <div className="flex items-center">
                <span className="font-medium w-24">ห้อง:</span>
                <span>{bookingData.roomName}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
                placeholder="กรุณากรอกนามสกุล"
              />
            </div>

            {/* Receipt Upload - Optional for now */}
            <div>
              <label htmlFor="receipt" className="block text-sm font-medium text-gray-700 mb-2">
                แนบรูปใบเสร็จที่ทำการชำระเงิน <span className="text-gray-500 text-xs">(ไม่บังคับ)</span>
              </label>
              <input
                type="file"
                id="receipt"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {receiptPreview && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">ตัวอย่างรูปภาพ:</p>
                  <img
                    src={receiptPreview}
                    alt="Receipt preview"
                    className="max-w-full h-auto rounded-lg border border-gray-300"
                  />
                </div>
              )}
              <p className="mt-2 text-xs text-gray-500">
                หมายเหตุ: การอัปโหลดใบเสร็จจะพร้อมใช้งานในอนาคต
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 bg-gray-200 text-gray-700 py-4 px-6 rounded-lg font-semibold text-lg hover:bg-gray-300 transition-colors"
              >
                ← ย้อนกลับ
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-indigo-600 text-white py-4 px-6 rounded-lg font-semibold text-lg hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
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

