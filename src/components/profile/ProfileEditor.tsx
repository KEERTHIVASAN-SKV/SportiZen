import React, { useRef, useState } from 'react';

const ProfileEditor = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profilePic, setProfilePic] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePic(reader.result as string); // Base64 preview
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative">
      {/* Profile Picture */}
      <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gray-200">
        {profilePic ? (
          <img src={profilePic} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-green-400 to-blue-500 text-white text-xl">
            A
          </div>
        )}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="absolute bottom-1 right-1 bg-gray-800 p-1 rounded-full text-white text-xs"
        >
          📷
        </button>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

export default ProfileEditor;
