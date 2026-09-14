export interface District {
  id: string;
  name: string;
  bn_name: string;
}

export interface Upazila {
  id: string;
  district_id: string;
  name: string;
  bn_name: string;
}

export const districts: District[] = [
  { id: '1', name: 'Dhaka', bn_name: 'ঢাকা' },
  { id: '2', name: 'Chittagong', bn_name: 'চট্টগ্রাম' },
  { id: '3', name: 'Sylhet', bn_name: 'সিলেট' },
  { id: '4', name: 'Rajshahi', bn_name: 'রাজশাহী' },
  { id: '5', name: 'Khulna', bn_name: 'খুলনা' },
  { id: '6', name: 'Barisal', bn_name: 'বরিশাল' },
  { id: '7', name: 'Rangpur', bn_name: 'রংপুর' },
  { id: '8', name: 'Mymensingh', bn_name: 'ময়মনসিংহ' }
];

export const upazilas: Upazila[] = [
  // Dhaka
  { id: '101', district_id: '1', name: 'Dhanmondi', bn_name: 'ধানমন্ডি' },
  { id: '102', district_id: '1', name: 'Gulshan', bn_name: 'গুলশান' },
  { id: '103', district_id: '1', name: 'Mirpur', bn_name: 'মিরপুর' },
  { id: '104', district_id: '1', name: 'Uttara', bn_name: 'উত্তরা' },
  { id: '105', district_id: '1', name: 'Mohammadpur', bn_name: 'মোহাম্মদপুর' },
  { id: '106', district_id: '1', name: 'Savar', bn_name: 'সাভার' },
  
  // Chittagong
  { id: '201', district_id: '2', name: 'Kotwali', bn_name: 'কোতোয়ালী' },
  { id: '202', district_id: '2', name: 'Panchlaish', bn_name: 'পাঁচলাইশ' },
  { id: '203', district_id: '2', name: 'Pahartali', bn_name: 'পাহাড়তলী' },
  { id: '204', district_id: '2', name: 'Hathazari', bn_name: 'হাটহাজারী' },
  { id: '205', district_id: '2', name: 'Patenga', bn_name: 'পতেঙ্গা' },

  // Sylhet
  { id: '301', district_id: '3', name: 'Sylhet Sadar', bn_name: 'সিলেট সদর' },
  { id: '302', district_id: '3', name: 'Dakshin Surma', bn_name: 'দক্ষিণ সুরমা' },
  { id: '303', district_id: '3', name: 'Golapganj', bn_name: 'গোলাপগঞ্জ' },
  
  // Rajshahi
  { id: '401', district_id: '4', name: 'Boalia', bn_name: 'বোয়ালিয়া' },
  { id: '402', district_id: '4', name: 'Rajpara', bn_name: 'রাজপাড়া' },
  { id: '403', district_id: '4', name: 'Motihar', bn_name: 'মতিহার' },

  // Khulna
  { id: '501', district_id: '5', name: 'Khulna Sadar', bn_name: 'খুলনা সদর' },
  { id: '502', district_id: '5', name: 'Sonadanga', bn_name: 'সোনাডাঙ্গা' },
  { id: '503', district_id: '5', name: 'Khalishpur', bn_name: 'খালিশপুর' },
  
  // Barisal
  { id: '601', district_id: '6', name: 'Barisal Sadar', bn_name: 'বরিশাল সদর' },
  { id: '602', district_id: '6', name: 'Babuganj', bn_name: 'বাবুগঞ্জ' },

  // Rangpur
  { id: '701', district_id: '7', name: 'Rangpur Sadar', bn_name: 'রংপুর সদর' },
  { id: '702', district_id: '7', name: 'Pirgachha', bn_name: 'পীরগাছা' },

  // Mymensingh
  { id: '801', district_id: '8', name: 'Mymensingh Sadar', bn_name: 'ময়মনসিংহ সদর' },
  { id: '802', district_id: '8', name: 'Trishal', bn_name: 'ত্রিশাল' }
];

export const getUpazilasByDistrict = (districtId: string): Upazila[] => {
  return upazilas.filter(u => u.district_id === districtId);
};
