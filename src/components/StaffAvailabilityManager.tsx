import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Edit3, 
  Trash2, 
  Save, 
  X, 
  Building2,
  Users,
  Droplets,
  Heart,
  AlertCircle,
  CheckCircle,
  Loader,
  RefreshCw,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  Copy,
  MoreHorizontal
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useStaffAuth } from '../hooks/useStaffAuth';

interface DonationCenter {
  center_id: string;
  name: string;
  address: string;
  city: string;
  country: string;
  is_active: boolean;
}

interface AvailabilitySlot {
  slot_id: string;
  center_id: string;
  slot_datetime: string;
  donation_type: string;
  capacity: number;
  current_bookings: number;
  is_available: boolean;
  created_at: string;
  updated_at: string;
  donation_centers?: DonationCenter;
}

interface SlotFormData {
  center_id: string;
  slot_datetime: string;
  donation_type: string;
  capacity: number;
  is_available: boolean;
}

type DonationType = 'Blood' | 'Plasma';
type ViewMode = 'calendar' | 'list';

export default function StaffAvailabilityManager() {
  const { staff } = useStaffAuth();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [donationCenters, setDonationCenters] = useState<DonationCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Form and modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null);
  const [formData, setFormData] = useState<SlotFormData>({
    center_id: '',
    slot_datetime: '',
    donation_type: 'Blood',
    capacity: 10,
    is_available: true,
  });
  
  // Filters and view
  const [viewMode, setViewMode] = useState<ViewMode>('calendar');
  const [selectedCenter, setSelectedCenter] = useState<string>('');
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  const donationTypes: { value: DonationType; label: string; icon: React.ComponentType<any>; color: string }[] = [
    { value: 'Blood', label: 'Blood Donation', icon: Droplets, color: 'text-red-600 bg-red-100' },
    { value: 'Plasma', label: 'Plasma Donation', icon: Heart, color: 'text-blue-600 bg-blue-100' },
  ];

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    fetchSlots();
  }, [selectedCenter, selectedType, selectedDate]);

  const fetchInitialData = async () => {
    try {
      const { data: centers, error: centersError } = await supabase
        .from('donation_centers')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (centersError) throw centersError;
      setDonationCenters(centers || []);

      await fetchSlots();
    } catch (err) {
      console.error('Error fetching initial data:', err);
      setError('Failed to load data');
    }
  };

  const fetchSlots = async () => {
    try {
      setLoading(true);
      setError('');

      let query = supabase
        .from('availability_slots')
        .select(`
          *,
          donation_centers:center_id (
            center_id,
            name,
            address,
            city,
            country,
            is_active
          )
        `)
        .order('slot_datetime', { ascending: true });

      // Apply filters
      if (selectedCenter) {
        query = query.eq('center_id', selectedCenter);
      }
      if (selectedType) {
        query = query.eq('donation_type', selectedType);
      }
      if (selectedDate) {
        const startDate = new Date(selectedDate);
        const endDate = new Date(selectedDate);
        endDate.setDate(endDate.getDate() + 1);
        query = query.gte('slot_datetime', startDate.toISOString())
                   .lt('slot_datetime', endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      setSlots(data || []);
    } catch (err) {
      console.error('Error fetching slots:', err);
      setError('Failed to load availability slots');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.center_id || !formData.slot_datetime || !formData.donation_type || formData.capacity <= 0) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      if (editingSlot) {
        // Update existing slot
        const { error: updateError } = await supabase
          .from('availability_slots')
          .update({
            center_id: formData.center_id,
            slot_datetime: formData.slot_datetime,
            donation_type: formData.donation_type,
            capacity: formData.capacity,
            is_available: formData.is_available,
            updated_at: new Date().toISOString(),
          })
          .eq('slot_id', editingSlot.slot_id);

        if (updateError) throw updateError;
        setSuccess('Availability slot updated successfully');
      } else {
        // Create new slot
        const { error: insertError } = await supabase
          .from('availability_slots')
          .insert({
            center_id: formData.center_id,
            slot_datetime: formData.slot_datetime,
            donation_type: formData.donation_type,
            capacity: formData.capacity,
            current_bookings: 0,
            is_available: formData.is_available,
          });

        if (insertError) throw insertError;
        setSuccess('Availability slot created successfully');
      }

      // Create audit log
      await supabase.from('audit_logs').insert({
        user_id: staff?.staff_id,
        user_type: 'staff',
        action: editingSlot ? 'update_availability_slot' : 'create_availability_slot',
        details: `${editingSlot ? 'Updated' : 'Created'} ${formData.donation_type} slot for ${formData.capacity} people`,
        resource_type: 'availability_slot',
        resource_id: editingSlot?.slot_id || 'new',
        status: 'success'
      });

      resetForm();
      await fetchSlots();
    } catch (err) {
      console.error('Error saving slot:', err);
      setError('Failed to save availability slot');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slot: AvailabilitySlot) => {
    if (!confirm(`Are you sure you want to delete this ${slot.donation_type} slot? This action cannot be undone.`)) {
      return;
    }

    if (slot.current_bookings > 0) {
      setError('Cannot delete slot with existing bookings. Please cancel appointments first.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const { error: deleteError } = await supabase
        .from('availability_slots')
        .delete()
        .eq('slot_id', slot.slot_id);

      if (deleteError) throw deleteError;

      // Create audit log
      await supabase.from('audit_logs').insert({
        user_id: staff?.staff_id,
        user_type: 'staff',
        action: 'delete_availability_slot',
        details: `Deleted ${slot.donation_type} slot for ${slot.capacity} people`,
        resource_type: 'availability_slot',
        resource_id: slot.slot_id,
        status: 'success'
      });

      setSuccess('Availability slot deleted successfully');
      await fetchSlots();
    } catch (err) {
      console.error('Error deleting slot:', err);
      setError('Failed to delete availability slot');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (slot: AvailabilitySlot) => {
    setEditingSlot(slot);
    setFormData({
      center_id: slot.center_id,
      slot_datetime: slot.slot_datetime.slice(0, 16), // Format for datetime-local input
      donation_type: slot.donation_type,
      capacity: slot.capacity,
      is_available: slot.is_available,
    });
    setShowAddModal(true);
  };

  const handleDuplicate = (slot: AvailabilitySlot) => {
    setEditingSlot(null);
    setFormData({
      center_id: slot.center_id,
      slot_datetime: '',
      donation_type: slot.donation_type,
      capacity: slot.capacity,
      is_available: slot.is_available,
    });
    setShowAddModal(true);
  };

  const resetForm = () => {
    setFormData({
      center_id: '',
      slot_datetime: '',
      donation_type: 'Blood',
      capacity: 10,
      is_available: true,
    });
    setEditingSlot(null);
    setShowAddModal(false);
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      shortDate: date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      })
    };
  };

  const getTypeConfig = (type: string) => {
    return donationTypes.find(t => t.value === type) || donationTypes[0];
  };

  const getAvailabilityStatus = (slot: AvailabilitySlot) => {
    if (!slot.is_available) return { label: 'Disabled', color: 'bg-gray-100 text-gray-800' };
    
    const percentage = (slot.current_bookings / slot.capacity) * 100;
    if (percentage === 0) return { label: 'Available', color: 'bg-green-100 text-green-800' };
    if (percentage < 80) return { label: 'Filling Up', color: 'bg-yellow-100 text-yellow-800' };
    if (percentage < 100) return { label: 'Almost Full', color: 'bg-orange-100 text-orange-800' };
    return { label: 'Full', color: 'bg-red-100 text-red-800' };
  };

  const groupSlotsByDay = () => {
    const grouped: { [key: string]: AvailabilitySlot[] } = {};
    
    slots.forEach(slot => {
      const date = new Date(slot.slot_datetime).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(slot);
    });

    return grouped;
  };

  const toggleDayExpansion = (day: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(day)) {
      newExpanded.delete(day);
    } else {
      newExpanded.add(day);
    }
    setExpandedDays(newExpanded);
  };

  const renderFilters = () => (
    <div className={`bg-white rounded-lg border border-gray-200 transition-all duration-200 ${showFilters ? 'p-6' : 'p-4'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4 flex-1">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {showFilters ? <ChevronDown className="w-4 h-4 ml-1" /> : <ChevronRight className="w-4 h-4 ml-1" />}
          </button>
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Calendar className="w-4 h-4 mr-1 inline" />
              Calendar
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'list'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Clock className="w-4 h-4 mr-1 inline" />
              List
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={fetchSlots}
            className="flex items-center px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Slot
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Donation Center</label>
            <select
              value={selectedCenter}
              onChange={(e) => setSelectedCenter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Centers</option>
              {donationCenters.map(center => (
                <option key={center.center_id} value={center.center_id}>
                  {center.name} - {center.city}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Donation Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              {donationTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderSlotCard = (slot: AvailabilitySlot) => {
    const dateTime = formatDateTime(slot.slot_datetime);
    const typeConfig = getTypeConfig(slot.donation_type);
    const TypeIcon = typeConfig.icon;
    const availabilityStatus = getAvailabilityStatus(slot);

    return (
      <div key={slot.slot_id} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <div className={`p-2 rounded-lg ${typeConfig.color}`}>
                  <TypeIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{slot.donation_type}</h3>
                  <p className="text-sm text-gray-600">{slot.donation_centers?.name}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {dateTime.time}
                </span>
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {slot.current_bookings}/{slot.capacity}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${availabilityStatus.color}`}>
                {availabilityStatus.label}
              </span>
              <div className="relative">
                <button className="p-1 text-gray-400 hover:text-gray-600 rounded">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              Created: {new Date(slot.created_at).toLocaleDateString()}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleDuplicate(slot)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Duplicate slot"
              >
                <Copy className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleEdit(slot)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                title="Edit slot"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(slot)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Delete slot"
                disabled={slot.current_bookings > 0}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCalendarView = () => {
    const groupedSlots = groupSlotsByDay();
    const sortedDays = Object.keys(groupedSlots).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    if (sortedDays.length === 0) {
      return (
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No availability slots found</h3>
          <p className="text-gray-600 mb-4">Create your first availability slot to get started.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Availability Slot
          </button>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {sortedDays.map(day => {
          const daySlots = groupedSlots[day];
          const isExpanded = expandedDays.has(day);
          const dateTime = formatDateTime(daySlots[0].slot_datetime);

          return (
            <div key={day} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                onClick={() => toggleDayExpansion(day)}
                className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-left">
                    <h3 className="text-lg font-semibold text-gray-900">{dateTime.date}</h3>
                    <p className="text-sm text-gray-600">{daySlots.length} slots available</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    {donationTypes.map(type => {
                      const count = daySlots.filter(slot => slot.donation_type === type.value).length;
                      if (count === 0) return null;
                      return (
                        <span key={type.value} className={`px-2 py-1 rounded-full text-xs font-medium ${type.color}`}>
                          {count} {type.value}
                        </span>
                      );
                    })}
                  </div>
                  {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                </div>
              </button>

              {isExpanded && (
                <div className="p-6 border-t border-gray-200">
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                    {daySlots.map(slot => renderSlotCard(slot))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  const renderListView = () => {
    if (slots.length === 0) {
      return (
        <div className="text-center py-12">
          <Clock className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No availability slots found</h3>
          <p className="text-gray-600 mb-4">Create your first availability slot to get started.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Availability Slot
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {slots.map(slot => renderSlotCard(slot))}
      </div>
    );
  };

  const renderModal = () => {
    if (!showAddModal) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {editingSlot ? 'Edit Availability Slot' : 'Add New Availability Slot'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Donation Center *
              </label>
              <select
                value={formData.center_id}
                onChange={(e) => setFormData({ ...formData, center_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="">Select a center</option>
                {donationCenters.map(center => (
                  <option key={center.center_id} value={center.center_id}>
                    {center.name} - {center.city}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date & Time *
              </label>
              <input
                type="datetime-local"
                value={formData.slot_datetime}
                onChange={(e) => setFormData({ ...formData, slot_datetime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Donation Type *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {donationTypes.map(type => {
                  const TypeIcon = type.icon;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, donation_type: type.value })}
                      className={`p-4 border-2 rounded-lg transition-all duration-200 ${
                        formData.donation_type === type.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className={`p-2 rounded-lg ${type.color}`}>
                          <TypeIcon className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-medium">{type.value}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacity *
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 1 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Maximum number of appointments for this slot</p>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_available"
                checked={formData.is_available}
                onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_available" className="ml-2 block text-sm text-gray-700">
                Available for booking
              </label>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <Loader className="w-4 h-4 animate-spin mr-2" />
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center justify-center">
                    <Save className="w-4 h-4 mr-2" />
                    {editingSlot ? 'Update Slot' : 'Create Slot'}
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Availability Management</h1>
        <p className="text-gray-600">Manage appointment slots for donation centers</p>
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
            <p className="text-green-800 font-medium">{success}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
            <p className="text-red-800 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      {renderFilters()}

      {/* Main Content */}
      {loading && !showAddModal ? (
        <div className="flex items-center justify-center py-12">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading availability slots...</span>
        </div>
      ) : (
        <>
          {viewMode === 'calendar' ? renderCalendarView() : renderListView()}
        </>
      )}

      {/* Modal */}
      {renderModal()}
    </div>
  );
}