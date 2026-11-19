import React from 'react';
import {
  User, Mail, Phone, Calendar, Heart, Shield,
  Save, Check, AlertCircle, Bell, CheckCircle2, MapPin
} from 'lucide-react';
import { isNotificationSupported } from '../../../../services/notificationHelper';

const ProfileDetailsTab = ({
  handleSave,
  formData,
  handleChange,
  errors = {},
  permissionState,
  handleEnableNotifications,
  handleTestNotification,
  handleDiscard,
  isSaving,
  isSaved
}) => {
  const sections = [
    {
      title: 'Personal Information',
      subtitle: 'Primary details for appointment scheduling and records',
      icon: User,
      fields: [
        {
          name: 'name',
          label: 'Full Name',
          type: 'text',
          placeholder: 'Your full name',
          required: true,
          icon: User
        },
        {
          name: 'email',
          label: 'Email Address',
          type: 'email',
          placeholder: 'your.email@example.com',
          required: true,
          icon: Mail,
          disabled: true
        },
        {
          name: 'phone',
          label: 'Phone Number',
          type: 'tel',
          placeholder: 'e.g. 9876543210',
          required: true,
          icon: Phone,
          autoComplete: 'tel'
        },
        {
          name: 'age',
          label: 'Age',
          type: 'number',
          placeholder: 'e.g. 24',
          required: true,
          icon: Calendar
        },
        {
          name: 'city',
          label: 'City / Location',
          type: 'text',
          placeholder: 'e.g. Kochi, Kerala',
          required: false,
          icon: MapPin
        }
      ]
    },
    {
      title: 'Wellbeing & Care Background',
      subtitle: 'Helps your psychologist prepare for your consultations',
      icon: Heart,
      fields: [
        {
          name: 'feelingLately',
          label: 'How have you been feeling lately?',
          type: 'text',
          placeholder: 'e.g. Seeking stress management, feeling anxious, emotional clarity...',
          required: false,
          icon: Heart
        },
        {
          name: 'hadPriorTherapy',
          label: 'Have you had prior counseling or therapy?',
          type: 'select',
          options: ['', 'No', 'Yes'],
          required: false,
          icon: Shield
        },
        ...(formData.hadPriorTherapy === 'Yes'
          ? [
              {
                name: 'priorTherapyDetails',
                label: 'Previous counseling experience (optional)',
                type: 'textarea',
                placeholder: 'Share any past experience or therapist notes that might help...',
                required: false,
                icon: Shield
              }
            ]
          : [])
      ]
    },
    {
      title: 'Emergency Contact (Optional)',
      subtitle: 'Contact person in case of urgent consultation reach-out',
      icon: Shield,
      fields: [
        {
          name: 'guardianName',
          label: 'Contact Person / Guardian Name',
          type: 'text',
          placeholder: 'Name of contact person',
          required: false,
          icon: User
        },
        {
          name: 'guardianPhone',
          label: 'Contact Phone Number',
          type: 'tel',
          placeholder: 'Mobile number',
          required: false,
          icon: Phone,
          autoComplete: 'tel'
        }
      ]
    }
  ];

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#0e1111] tracking-tight">My Profile</h2>
        <p className="text-sm text-[#7c8785] mt-1 font-medium">
          Manage your personal information and consultation preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 pb-24 lg:pb-16">
        {sections.map((section, sIdx) => {
          const SIcon = section.icon;
          return (
            <div
              key={sIdx}
              className="relative overflow-hidden rounded-2xl p-5 sm:p-6 border border-[#e6dfd0] bg-white shadow-xs"
            >
              <div className="flex items-center gap-3.5 mb-5 pb-3 border-b border-[#f1eadc]">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#f6f1e6] border border-[#e6dfd0] text-[#0e7490]">
                  <SIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0e1111]">{section.title}</h3>
                  <p className="text-xs text-[#7c8785] mt-0.5 font-medium">{section.subtitle}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {section.fields.map((field) => {
                  const FIcon = field.icon;
                  const hasError = !!errors[field.name];
                  const hasValue = !!formData[field.name];
                  const isTextarea = field.type === 'textarea';

                  return (
                    <div
                      key={field.name}
                      className={`space-y-1.5 ${isTextarea ? 'sm:col-span-2' : ''}`}
                    >
                      <label
                        htmlFor={`sp-${field.name}`}
                        className="text-xs text-[#3c4747] font-semibold flex items-center justify-between"
                      >
                        <span className="flex items-center">
                          <span>{field.label}</span>
                          {field.required && (
                            <span className="text-rose-500 font-bold ml-1 text-sm leading-none">*</span>
                          )}
                        </span>
                        {!field.required && (
                          <span className="text-[10px] text-[#9aa29f] font-normal">(Optional)</span>
                        )}
                      </label>

                      <div className="relative">
                        {FIcon && (
                          <FIcon
                            className={`absolute left-3.5 top-3.5 w-4 h-4 transition-colors ${
                              hasError
                                ? 'text-rose-400'
                                : hasValue
                                ? 'text-[#55605f]'
                                : 'text-[#d5cdbb]'
                            }`}
                          />
                        )}

                        {field.type === 'select' ? (
                          <select
                            id={`sp-${field.name}`}
                            name={field.name}
                            value={formData[field.name] || ''}
                            onChange={handleChange}
                            className={`w-full min-h-[44px] pl-10 pr-9 py-2.5 border text-sm text-[#0e1111] font-medium rounded-xl outline-none transition-all appearance-none cursor-pointer ${
                              hasError
                                ? 'border-rose-500 bg-rose-50/50 focus:border-rose-600'
                                : 'bg-[#f6f1e6] border-[#e6dfd0] focus:border-[#0e1111] focus:bg-white'
                            }`}
                          >
                            {field.options.map((o, i) => (
                              <option key={i} value={o}>
                                {o || 'Select ' + field.label}
                              </option>
                            ))}
                          </select>
                        ) : field.type === 'textarea' ? (
                          <textarea
                            id={`sp-${field.name}`}
                            name={field.name}
                            value={formData[field.name] || ''}
                            onChange={handleChange}
                            placeholder={field.placeholder}
                            rows={3}
                            className={`w-full pl-10 pr-9 py-2.5 text-sm font-medium rounded-xl outline-none transition-all resize-none ${
                              hasError
                                ? 'border-rose-500 bg-rose-50/50 focus:border-rose-600 text-[#0e1111]'
                                : 'bg-[#f6f1e6] border-[#e6dfd0] focus:border-[#0e1111] focus:bg-white text-[#0e1111]'
                            }`}
                          />
                        ) : (
                          <input
                            id={`sp-${field.name}`}
                            type={field.type}
                            name={field.name}
                            value={formData[field.name] || ''}
                            onChange={handleChange}
                            placeholder={field.placeholder}
                            autoComplete={field.autoComplete}
                            disabled={field.disabled}
                            className={`w-full min-h-[44px] pl-10 pr-9 py-2.5 text-sm font-medium rounded-xl outline-none transition-all ${
                              field.disabled
                                ? 'bg-[#f1eadc] border-[#e6dfd0] text-[#7c8785] cursor-not-allowed'
                                : hasError
                                ? 'border-rose-500 bg-rose-50/50 focus:border-rose-600 text-[#0e1111]'
                                : 'bg-[#f6f1e6] border-[#e6dfd0] focus:border-[#0e1111] focus:bg-white text-[#0e1111]'
                            }`}
                          />
                        )}

                        {hasValue && !hasError && !field.disabled && (
                          <div className="absolute right-3 top-3.5">
                            <Check className="w-4 h-4 text-emerald-500" strokeWidth={2.5} />
                          </div>
                        )}
                      </div>

                      {hasError && (
                        <p className="text-xs text-rose-500 flex items-center gap-1 mt-1" role="alert">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>{errors[field.name]}</span>
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {/* Notification Preferences */}
        <div className="bg-white border border-[#e6dfd0] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-[#f1eadc]">
            <div className="w-10 h-10 rounded-xl bg-[#f6f1e6] border border-[#e6dfd0] flex items-center justify-center text-[#0e7490]">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0e1111]">Desktop Alerts & Reminders</h3>
              <p className="text-xs text-[#7c8785] mt-0.5 font-medium">
                Receive browser notifications for appointment reminders and updates.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#f6f1e6] p-4 rounded-xl border border-[#e6dfd0]">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    !isNotificationSupported()
                      ? 'bg-rose-500'
                      : permissionState === 'granted'
                      ? 'bg-emerald-500 animate-pulse'
                      : permissionState === 'denied'
                      ? 'bg-rose-500'
                      : 'bg-[#9aa29f]'
                  }`}
                />
                <span className="text-xs font-bold uppercase tracking-wider text-[#3c4747]">
                  {!isNotificationSupported()
                    ? 'Not Supported'
                    : permissionState === 'granted'
                    ? 'Active'
                    : permissionState === 'denied'
                    ? 'Blocked'
                    : 'Disabled'}
                </span>
              </div>
              <p className="text-xs text-[#7c8785] font-medium leading-relaxed">
                {permissionState === 'granted'
                  ? 'You will receive reminders before your consultations start.'
                  : 'Enable notifications to get timely consultation reminders.'}
              </p>
            </div>

            <div className="flex gap-2 shrink-0">
              {isNotificationSupported() && permissionState === 'default' && (
                <button
                  type="button"
                  onClick={handleEnableNotifications}
                  className="px-4 py-2 bg-[#0e1111] hover:bg-[#243033] text-white rounded-xl text-xs font-bold transition-colors cursor-pointer border-none"
                >
                  Enable Alerts
                </button>
              )}
              {isNotificationSupported() && permissionState === 'granted' && (
                <button
                  type="button"
                  onClick={handleTestNotification}
                  className="px-4 py-2 bg-white border border-[#e6dfd0] text-[#0e1111] hover:bg-[#f6f1e6] rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Test Alert
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sticky action bar */}
        <div className="sticky bottom-[72px] lg:bottom-4 z-30 flex items-center justify-end gap-3 p-4 bg-white/95 backdrop-blur-md border border-[#e6dfd0] rounded-2xl shadow-lg">
          <button
            type="button"
            onClick={handleDiscard}
            disabled={isSaving}
            className="min-h-[42px] px-5 py-2.5 border border-[#e6dfd0] hover:border-[#d5cdbb] rounded-xl text-xs font-semibold text-[#0e1111] hover:bg-[#f6f1e6] transition-colors bg-white cursor-pointer disabled:opacity-50"
          >
            Discard
          </button>
          <button
            type="submit"
            onClick={handleSave}
            disabled={isSaving}
            className="min-h-[42px] inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0e7490] hover:bg-[#0891b2] disabled:bg-[#7c8785] text-white text-xs font-bold rounded-xl shadow-xs transition-colors border-none cursor-pointer"
          >
            {isSaving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </form>

      {isSaved && (
        <div
          className="fixed bottom-[90px] lg:bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 bg-[#0e1111] text-white rounded-2xl shadow-2xl"
          role="status"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold">Profile saved successfully!</span>
        </div>
      )}
    </div>
  );
};

export default ProfileDetailsTab;
