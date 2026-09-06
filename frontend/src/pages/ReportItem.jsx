import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../utils/api';

const CATEGORIES = ['Electronics', 'Jewelry', 'Documents', 'Clothing', 'Bags', 'Keys', 'Wallet', 'Pet', 'Vehicle', 'Other'];

export default function ReportItem() {
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({ defaultValues: { type: 'lost' } });
  const [images, setImages] = useState([]);
  const itemType = watch('type');

  const onDrop = useCallback((accepted) => {
    if (images.length + accepted.length > 5) return toast.error('Max 5 images allowed');
    const newFiles = accepted.map(file => ({ file, preview: URL.createObjectURL(file) }));
    setImages(prev => [...prev, ...newFiles]);
  }, [images]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: { 'image/*': [] }, maxSize: 5 * 1024 * 1024
  });

  const removeImage = (idx) => setImages(prev => prev.filter((_, i) => i !== idx));

  // const onSubmit = async (data) => {
  //   try {
  //     const formData = new FormData();
  //     Object.entries(data).forEach(([k, v]) => {
  //       if (k === 'location') {
  //         formData.append('location', JSON.stringify({ address: data.address, city: data.city, state: data.state, country: data.country || 'India' }));
  //       } else if (!['address', 'city', 'state', 'country'].includes(k)) {
  //         formData.append(k, v);
  //       }
  //     });
  //     images.forEach(({ file }) => formData.append('images', file));

  //     await api.post('/items', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
  //     toast.success('Item reported successfully! Our system will look for matches.');
  //     navigate('/dashboard');
  //   } catch (error) {
  //     toast.error(error.response?.data?.message || 'Failed to report item');
  //   }
  // };
  const onSubmit = async (data) => {
  try {
    const formData = new FormData();

    formData.append('type', data.type);
    formData.append('title', data.title);
    formData.append('description', data.description);
    formData.append('category', data.category);
    formData.append('date', data.date);
    formData.append('hiddenDetails', data.hiddenDetails || '');
    formData.append('color', data.color || '');
    formData.append('brand', data.brand || '');
    formData.append('reward', data.reward || '');
    formData.append('contactPreference', data.contactPreference || 'email');
    formData.append('tags', JSON.stringify([]));

    // This was the broken part — now explicitly built
    formData.append('location', JSON.stringify({
      address: data.address,
      city: data.city,
      state: data.state || '',
      country: 'India'
    }));

    images.forEach(({ file }) => formData.append('images', file));

    await api.post('/items', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    toast.success('Item reported successfully! Our system will look for matches.');
    navigate('/dashboard');
  } catch (error) {
    console.error('Submit error:', error.response?.data);
    toast.error(error.response?.data?.message || 'Failed to report item');
  }
};

  return (
    <div className="pt-16 min-h-screen bg-slate-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-8">
          <h1 className="font-display font-bold text-3xl text-slate-900">Report an Item</h1>
          <p className="text-slate-500 mt-1">Fill in as many details as possible for better matching</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Type Toggle */}
          <div className="card p-6">
            <h2 className="font-display font-semibold text-slate-800 mb-4">Item Type *</h2>
            <div className="grid grid-cols-2 gap-3">
              {['lost', 'found'].map(type => (
                <label key={type} className={`flex items-center justify-center gap-2 p-4 rounded-xl border-2 cursor-pointer transition-all ${itemType === type ? (type === 'lost' ? 'border-danger-400 bg-danger-50 text-danger-700' : 'border-success-500 bg-success-50 text-success-700') : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                  <input type="radio" value={type} {...register('type')} className="hidden" />
                  <span className="text-xl">{type === 'lost' ? '🔴' : '🟢'}</span>
                  <span className="font-semibold capitalize">{type} Item</span>
                </label>
              ))}
            </div>
          </div>

          {/* Basic Info */}
          <div className="card p-6 space-y-5">
            <h2 className="font-display font-semibold text-slate-800">Item Details</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Title *</label>
              <input {...register('title', { required: 'Title is required', minLength: { value: 3, message: 'At least 3 characters' } })}
                className="input-field" placeholder="e.g. Black iPhone 14 Pro Max" />
              {errors.title && <p className="text-danger-500 text-xs mt-1">{errors.title.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Category *</label>
              <select {...register('category', { required: 'Category is required' })} className="input-field">
                <option value="">Select category</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {errors.category && <p className="text-danger-500 text-xs mt-1">{errors.category.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Description *</label>
              <textarea {...register('description', { required: 'Description is required', minLength: { value: 10, message: 'At least 10 characters' } })}
                rows={4} className="input-field resize-none" placeholder="Describe the item in detail — color, size, markings, brand, etc." />
              {errors.description && <p className="text-danger-500 text-xs mt-1">{errors.description.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Color</label>
                <input {...register('color')} className="input-field" placeholder="e.g. Black" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Brand</label>
                <input {...register('brand')} className="input-field" placeholder="e.g. Apple" />
              </div>
            </div>
          </div>

          {/* Hidden Details */}
          <div className="card p-6 border-warning-200 bg-warning-50/30">
            <div className="flex items-start gap-3 mb-4">
              <Info className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
              <div>
                <h2 className="font-display font-semibold text-slate-800">Secret Verification Detail</h2>
                <p className="text-xs text-slate-500 mt-0.5">This detail is hidden from the public and used to verify genuine ownership claims. Only you can see it.</p>
              </div>
            </div>
            <textarea {...register('hiddenDetails')} rows={2} className="input-field resize-none bg-white"
              placeholder="e.g. My name 'John' is engraved on the back, or the wallpaper is a photo of my dog 'Max'" />
          </div>

          {/* Location & Date */}
          <div className="card p-6 space-y-4">
            <h2 className="font-display font-semibold text-slate-800">Location & Date</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Address *</label>
              <input {...register('address', { required: 'Address is required' })} className="input-field" placeholder="Street address or landmark" />
              {errors.address && <p className="text-danger-500 text-xs mt-1">{errors.address.message}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">City *</label>
                <input {...register('city', { required: 'City is required' })} className="input-field" placeholder="City" />
                {errors.city && <p className="text-danger-500 text-xs mt-1">{errors.city.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">State</label>
                <input {...register('state')} className="input-field" placeholder="State" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Date {itemType === 'lost' ? 'Lost' : 'Found'} *</label>
              <input {...register('date', { required: 'Date is required' })} type="date" className="input-field"
                max={new Date().toISOString().split('T')[0]} />
              {errors.date && <p className="text-danger-500 text-xs mt-1">{errors.date.message}</p>}
            </div>
          </div>

          {/* Images */}
          <div className="card p-6">
            <h2 className="font-display font-semibold text-slate-800 mb-4">Photos <span className="text-slate-400 font-normal text-sm">(Optional, max 5)</span></h2>
            <div {...getRootProps()} className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${isDragActive ? 'border-primary-400 bg-primary-50' : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'}`}>
              <input {...getInputProps()} />
              <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500">{isDragActive ? 'Drop images here' : 'Drag & drop or click to upload'}</p>
              <p className="text-xs text-slate-400 mt-1">PNG, JPG, WEBP up to 5MB each</p>
            </div>
            {images.length > 0 && (
              <div className="flex gap-3 flex-wrap mt-4">
                {images.map((img, i) => (
                  <div key={i} className="relative group">
                    <img src={img.preview} alt="" className="w-20 h-20 object-cover rounded-xl" />
                    <button type="button" onClick={() => removeImage(i)}
                      className="absolute -top-2 -right-2 w-5 h-5 bg-danger-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Optional */}
          <div className="card p-6 space-y-4">
            <h2 className="font-display font-semibold text-slate-800">Additional Info</h2>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Reward (Optional)</label>
              <input {...register('reward')} className="input-field" placeholder="e.g. ₹500 reward for safe return" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Contact Preference</label>
              <select {...register('contactPreference')} className="input-field">
                <option value="email">Email</option>
                <option value="phone">Phone</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={isSubmitting} className="btn-primary w-full py-3.5 text-base">
            {isSubmitting ? 'Submitting...' : `Submit ${itemType === 'lost' ? 'Lost' : 'Found'} Item Report`}
          </button>
        </form>
      </div>
    </div>
  );
}
